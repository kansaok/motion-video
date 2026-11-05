/* Antrean render. Satu render menghabiskan semua inti CPU dan beberapa tab Chromium, jadi
   render dijalankan bergiliran (RENDER_PARALEL, bawaan 1) — dua render bersamaan di VPS kecil
   membuat renderer Chromium mati dengan "Target crashed" (lihat VIEWPORT di lib/render.mjs).
   Tiap pelanggan hanya boleh punya satu render yang menunggu atau berjalan. */
import {randomBytes} from 'node:crypto';
import {spawn} from 'node:child_process';
import {existsSync, readFileSync, writeFileSync, readdirSync, rmSync, mkdtempSync, statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import os from 'node:os';
import * as Pr from './proyek.mjs';
import * as Log from './log.mjs';
import * as M from './metrik.mjs';
import * as W from './webhook.mjs';

const PARALEL = Number(process.env.RENDER_PARALEL || 1);
const BERKAS_PEKERJA = fileURLToPath(new URL('./pekerja.mjs', import.meta.url));

/* Chromium menjalankan JavaScript milik pelanggan. Proses anak dengan environment bersih
   saja belum cukup: tanpa namespace mount ia masih dapat membaca /proc proses server (UID
   sama) dan seluruh volume /data. bubblewrap membuat /proc baru dan hanya memasang proyek
   yang sedang dikerjakan. Jangan beri fallback tanpa sandbox; kegagalan bwrap harus membuat
   render gagal, bukan diam-diam kembali ke isolasi yang lebih lemah. */
const JALUR_RUNTIME = ['/usr', '/usr/local', '/bin', '/lib', '/lib64', '/etc', '/app', '/ms-playwright'];
/* /tmp di dalam sandbox adalah direktori kerja milik satu pekerja di volume /tmp container,
   BUKAN tmpfs. Frame render (JPEG q95, ±0,5 MB × 30 fps × 180 dtk ≈ 2-3 GB) di tmpfs ditagih
   ke memori cgroup container dan membuat render panjang mati OOM di tengah jalan. Direktori
   ini hanya berisi kerja pekerja itu sendiri, jadi isolasinya tetap. */
/**
 * @param {any} t
 * @param {{bwrap?: string, node?: string, berkas?: string, ada?: (f: string) => boolean, dirKerja?: string}} [o]
 */
export function perintahPekerja(t, {bwrap = '/usr/bin/bwrap', node = process.execPath,
  berkas = BERKAS_PEKERJA, ada = existsSync, dirKerja} = {}) {
  const proyek = path.resolve(String(t.dir || ''));
  if (!path.isAbsolute(String(t.dir || '')) || !ada(proyek)) throw new Error('direktori proyek pekerja tidak sah');
  const bagian = proyek.split(path.sep).filter(Boolean);
  // Pr.buka() tetap memakai jalur DATA_DIR; buat hanya leluhur proyek yang diperlukan.
  const args = ['--die-with-parent', '--new-session', '--unshare-user', '--unshare-pid', '--unshare-uts', '--unshare-ipc',
    '--cap-drop', 'ALL', '--proc', '/proc', '--dev', '/dev', ...(dirKerja ? ['--bind', dirKerja, '/tmp'] : ['--tmpfs', '/tmp'])];
  let tujuan = '';
  // Jangan pasang volume induknya: hanya buat direktori kosong sampai proyek aktif.
  for (const nama of bagian.slice(0, -1)) {
    tujuan += `/${nama}`;
    args.push('--dir', tujuan);
  }
  for (const sumber of JALUR_RUNTIME) if (ada(sumber)) args.push('--ro-bind', sumber, sumber);
  args.push('--bind', proyek, proyek, '--chdir', '/app', '--clearenv');
  for (const [nama, nilai] of Object.entries(lingkunganPekerja())) args.push('--setenv', nama, nilai);
  // HOME tidak diwariskan: profil Chromium sementara tidak boleh menyentuh home server.
  /* Saluran IPC ke server adalah fd 3 (stdio 'ipc' di jalankanPekerja), dan Node memberi tahu
     anaknya lewat NODE_CHANNEL_FD. `--clearenv` membuangnya: pekerja tak punya `process.send`,
     tak pernah menerima tugas, dan keluar dengan kode 0 dalam ~140 ms ("berhenti tanpa hasil
     (kode 0)", vps2 5 Nov 2026). Sandbox P2-03 tak pernah merender sampai ini; tesnya memakai
     proses tiruan. Teruskan persis dua variabel itu, bukan seluruh env. */
  args.push('--setenv', 'NODE_CHANNEL_FD', '3', '--setenv', 'NODE_CHANNEL_SERIALIZATION_MODE', 'json');
  args.push('--setenv', 'HOME', '/tmp', node, berkas);
  return {perintah: bwrap, argumen: args};
}

/* Pekerja menjalankan HTML pelanggan lewat Chromium. Ia hanya menerima konfigurasi teknis
   render; token BIMP dan tautan unduh tetap tinggal di proses server HTTP. */
const ENV_PEKERJA = ['PATH', 'HOME', 'TMPDIR', 'DATA_DIR', 'NODE_ENV', 'WORKERS',
  'MOTION_PLAYWRIGHT', 'MOTION_VIEWPORT', 'MOTION_ENCODER', 'MOTION_BLOKIR_PRIVAT',
  /* Tanpa ini --clearenv membuat Playwright mencari Chromium di $HOME/.cache (HOME=/tmp di sandbox)
     dan cuplik gagal "Executable doesn't exist" (vps2 5 Nov 2026). Bukan rahasia: hanya lokasi. */
  'PLAYWRIGHT_BROWSERS_PATH'];
export function lingkunganPekerja(env = process.env) {
  return Object.fromEntries(ENV_PEKERJA.filter((nama) => env[nama] !== undefined).map((nama) => [nama, env[nama]]));
}

const simpanStatus = (t) => {
  try { writeFileSync(path.join(t.dir, 'render.json'), JSON.stringify({...t, dir: undefined}, null, 1)); } catch { /* proyek sudah dihapus */ }
};

const TERMINAL = ['selesai', 'gagal', 'dibatalkan'];
/* Pengendali batal tugas yang sedang jalan, di luar objek tugas: tugas diserialisasi ke
   render.json dan `status_render`, AbortController tidak. */
const pengendali = new Map();

export function buatAntrean({paralel = PARALEL, maks = Pr.BATAS.antreMaks, kerjakanTugas = kerjakan,
  simpan = simpanStatus, tunda = setImmediate, sekarang = () => Date.now(), durasiAwal = [],
  hentikanJalan = (t, alasan) => pengendali.get(t.id)?.abort(alasan),
  padaDibatalkan = (t) => { if (t.opsi?.webhook) kabariWebhook(t).catch((e) => Log.galat('webhook gagal', {render: t.id, galat: e})); }} = {}) {
  const tugas = new Map(), antre = [], durasi = durasiAwal.slice(-10);
  let jalan = 0;
  const rata = () => durasi.length ? durasi.reduce((a, b) => a + b, 0) / durasi.length : null;
  const bersihkan = () => {
    const batas = sekarang() - 3600e3;
    for (const [id, t] of tugas) if (TERMINAL.includes(t.status) && Date.parse(t.selesai || '') < batas) tugas.delete(id);
  };
  const status = (uid, id) => {
    bersihkan();
    const t = tugas.get(id);
    if (!t || t.uid !== Number(uid)) return null;
    const urutan = t.status === 'antre' ? antre.indexOf(t) + 1 : undefined;
    return {...t, dir: undefined, urutan, estimasiTungguDetik: urutan && rata() ? Math.round(urutan * rata()) : undefined};
  };
  const statusProyek = (p) => {
    const f = path.join(p.dir, 'render.json');
    if (!existsSync(f)) return null;
    const t = JSON.parse(readFileSync(f, 'utf8'));
    const hidup = status(t.uid, t.id);
    if (hidup) return hidup;
    if (t.status === 'antre' || t.status === 'jalan') return {...t, status: 'gagal', galat: 'server dinyalakan ulang saat render — jalankan render lagi'};
    return t;
  };
  const putar = async () => {
    while (jalan < paralel && antre.length) {
      const t = antre.shift();
      jalan++;
      Promise.resolve(kerjakanTugas(t)).finally(() => {
        const mulai = Date.parse(t.mulai || ''), selesai = Date.parse(t.selesai || '');
        if (Number.isFinite(mulai) && Number.isFinite(selesai) && selesai >= mulai) {
          durasi.push((selesai - mulai) / 1000);
          if (durasi.length > 10) durasi.shift();
        }
        jalan--; tunda(putar);
      });
    }
  };
  const kirim = (uid, p, opsi) => {
    bersihkan();
    const sedang = [...tugas.values()].find((t) => t.uid === Number(uid) && (t.status === 'antre' || t.status === 'jalan'));
    if (sedang) throw new Error(`masih ada render ${sedang.id} (${sedang.status}) untuk proyek ${sedang.proyek} — tunggu selesai`);
    if (antre.length >= maks) throw new Error('antrean penuh, coba lagi beberapa menit');
    const t = {id: `r-${randomBytes(4).toString('hex')}`, uid: Number(uid), proyek: p.meta.id, dir: p.dir,
      status: 'antre', langkah: 'antre', mulai: null, selesai: null, dibuat: new Date().toISOString(), opsi, hasil: null, galat: null};
    tugas.set(t.id, t); antre.push(t); simpan(t); tunda(putar);
    return t;
  };
  /* Batalkan (P6-09). Yang masih antre cukup dikeluarkan; yang jalan dihentikan lewat sinyal ke
     `jalankanPekerja`, dan `kerjakan` yang menulis status akhirnya. Pelanggan hanya tugasnya
     sendiri; admin semua. */
  const batalkan = (uid, id, {admin = false, alasan = admin ? 'oleh admin' : 'oleh pemilik'} = {}) => {
    const t = tugas.get(id);
    if (!t || (!admin && t.uid !== Number(uid))) throw new Error(`render ${id} tidak ditemukan (atau sudah lebih dari sejam selesai)`);
    if (TERMINAL.includes(t.status)) throw new Error(`render ${id} sudah ${t.status}`);
    if (t.status === 'antre') {
      antre.splice(antre.indexOf(t), 1);
      Object.assign(t, {status: 'dibatalkan', langkah: 'dibatalkan', galat: `dibatalkan ${alasan}`, selesai: new Date(sekarang()).toISOString()});
      simpan(t);
      padaDibatalkan(t);
    } else {
      hentikanJalan(t, alasan);
    }
    return {render: t.id, status: t.status === 'jalan' ? 'menghentikan' : t.status};
  };
  return {kirim, status, statusProyek, putar, bersihkan, batalkan, tugas, antre, jumlahJalan: () => jalan};
}

/* Cuplik ditunggu langsung oleh panggilan alat, jadi tidak boleh ikut antre di belakang render
   beberapa menit. Jalurnya sendiri, dibatasi dua Chromium sekaligus. */
let cuplikJalan = 0;
const cuplikTunggu = [];
const cuplikAkun = new Map();
export async function cuplikGiliran(uid, fn) {
  const id = Number(uid);
  if (cuplikAkun.get(id)) throw new Error('satu cuplik masih berjalan untuk akun ini — tunggu selesai');
  // Reservasi dibuat sebelum menunggu slot global supaya satu akun tidak dapat mengisi seluruh
  // antrean cuplik hanya dengan mengirim banyak permintaan sekaligus.
  cuplikAkun.set(id, true);
  let mulai = false;
  try {
    if (cuplikJalan >= 2) await new Promise((r) => cuplikTunggu.push(r));
    cuplikJalan++; mulai = true;
    return await fn();
  } finally {
    cuplikAkun.delete(id);
    if (mulai) { cuplikJalan--; cuplikTunggu.shift()?.(); }
  }
}


const AWALAN_KERJA = 'motion-kerja-';
export const buatDirKerja = (direktoriTmp = os.tmpdir()) => mkdtempSync(path.join(direktoriTmp, AWALAN_KERJA));
export const hapusDirKerja = (dir) => rmSync(dir, {recursive: true, force: true});

/* Sisa kerja sesudah crash. Pekerja memakai --die-with-parent, jadi saat server baru mulai tidak
   ada pekerja hidup dan setiap `motion-kerja-*` pasti yatim. `frames-*` dan `pk-*.m4a` langsung
   di /tmp berasal dari render CLI atau versi lama; hanya yang tak disentuh `umurMs` dihapus agar
   render CLI yang sedang berjalan di mesin yang sama tidak ikut terhapus. */
export function bersihkanTmpYatim({direktoriTmp = os.tmpdir(), umurMs = 6 * 3600e3, sekarang = Date.now()} = {}) {
  let n = 0;
  for (const e of readdirSync(direktoriTmp, {withFileTypes: true})) {
    const f = path.join(direktoriTmp, e.name);
    const kerja = e.isDirectory() && e.name.startsWith(AWALAN_KERJA);
    const lama = (e.isDirectory() && e.name.startsWith('frames-')) || (e.isFile() && /^pk-\d+\.m4a$/.test(e.name));
    if (kerja || (lama && sekarang - statSync(f).mtimeMs > umurMs)) { rmSync(f, {recursive: true, force: true}); n++; }
  }
  return n;
}

/**
 * @param {any} t
 * @param {{buatProses?: typeof spawn, onLangkah?: (langkah: string) => void,
 *   onKemajuan?: (frame: number, totalFrame?: number) => void, batasMs?: number, macetMs?: number,
 *   bunuhGrup?: (pid: number) => void, buatKerja?: () => string, hapusKerja?: (dir: string) => void,
 *   batal?: AbortSignal, sandbox?: Parameters<typeof perintahPekerja>[1]}} [opsi]
 */
export function jalankanPekerja(t, {
  buatProses = spawn, onLangkah = () => {}, onKemajuan = () => {},
  batasMs = Pr.BATAS.renderMenit * 60_000, macetMs = Pr.BATAS.renderMacetDetik * 1_000,
  bunuhGrup = (pid) => process.kill(-pid, 'SIGKILL'), buatKerja = buatDirKerja, hapusKerja = hapusDirKerja,
  batal, sandbox = {},
} = {}) {
  return new Promise((selesai, gagal) => {
    let tuntas = false, timerBatas, watchdog, renderMulai = 0, frameTerakhir = 0;
    let dirKerja = null;
    const akhir = (fn, nilai) => {
      if (tuntas) return;
      tuntas = true;
      clearTimeout(timerBatas);
      clearInterval(watchdog);
      batal?.removeEventListener('abort', padaBatal);
      // Frame dan profil Chromium tidak dibutuhkan lagi, berhasil ataupun gagal.
      if (dirKerja) try { hapusKerja(dirKerja); } catch (e) { Log.galat('direktori kerja pekerja tidak dapat dihapus', {dir: dirKerja, galat: e}); }
      fn(nilai);
    };
    const hentikan = (pesan, dibatalkan = false) => {
      try { bunuhGrup(anak.pid); } catch (e) { Log.galat('pekerja render tidak dapat dihentikan', {pid: anak.pid, galat: e}); }
      akhir(gagal, Object.assign(new Error(pesan), {dibatalkan}));
    };
    /* Pembatalan (P6-09) memakai jalur yang sama dengan watchdog: seluruh grup proses (bwrap,
       node, Chromium, ffmpeg) dimatikan, direktori kerja dihapus. Tanpa ini render yang macet
       di luar langkah frame (mix, encode) hanya berhenti oleh batas total atau restart container. */
    const padaBatal = () => hentikan(`dibatalkan${batal?.reason ? `: ${batal.reason}` : ''}`, true);
    let perintah;
    try { dirKerja = buatKerja(); perintah = perintahPekerja(t, {dirKerja, ...sandbox}); } catch (e) { akhir(gagal, e); return; }
    const anak = buatProses(perintah.perintah, perintah.argumen, {
      detached: true, env: lingkunganPekerja(), stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
    });
    anak.once('error', (e) => akhir(gagal, e));
    anak.on('message', (/** @type {any} */ pesan) => {
      if (pesan?.langkah) {
        if (pesan.langkah === 'render') { renderMulai = Date.now(); frameTerakhir = 0; }
        onLangkah(pesan.langkah);
      }
      if (typeof pesan?.frame === 'number' && pesan.frame > frameTerakhir) {
        frameTerakhir = pesan.frame;
        renderMulai = Date.now();
        onKemajuan(pesan.frame, pesan.totalFrame);
      }
      if (pesan?.hasil) akhir(selesai, pesan.hasil);
      if (pesan?.galat) akhir(gagal, new Error(pesan.galat));
    });
    anak.once('exit', (kode, sinyal) => {
      if (!tuntas) akhir(gagal, new Error(`pekerja render berhenti tanpa hasil (${sinyal || `kode ${kode}`})`));
    });
    if (batal?.aborted) { padaBatal(); return; }
    batal?.addEventListener('abort', padaBatal, {once: true});
    timerBatas = setTimeout(() => hentikan('melebihi batas waktu render'), batasMs);
    watchdog = setInterval(() => {
      if (renderMulai && Date.now() - renderMulai > macetMs) hentikan('render macet: jumlah frame tidak bertambah');
    }, Math.min(1_000, macetMs));
    anak.send(t.pesan || {uid: t.uid, proyek: t.proyek, opsi: t.opsi});
  });
}

/* Cuplik juga mengeksekusi HTML pelanggan. Ia wajib melewati namespace yang sama dengan
   render penuh; menjalankannya langsung dari server akan membuka kembali /data ke Chromium. */
export async function cuplikPekerja(uid, p, komposisi, detik) {
  const hasil = await jalankanPekerja({uid, proyek: p.meta.id, dir: p.dir, pesan: {
    mode: 'cuplik', uid, proyek: p.meta.id, komposisi, detik,
  }, opsi: {}}, {batasMs: 2 * 60_000});
  return hasil.cuplikan || [];
}

/* Durasi langkah diukur di induk dari pesan `langkah` pekerja: langkah sebelumnya selesai
   ketika langkah berikutnya dimulai, dan langkah terakhir selesai bersama tugasnya. */
export function pencatatLangkah({amati = (detik, label) => M.langkahDetik.amati(detik, label), sekarang = Date.now} = {}) {
  let aktif = null, mulai = 0;
  const tutup = () => { if (aktif) amati((sekarang() - mulai) / 1000, {langkah: aktif}); };
  return {
    ganti(nama) { tutup(); aktif = nama; mulai = sekarang(); },
    selesai() { tutup(); aktif = null; },
  };
}

/** @param {any} t @param {{jalankan?: typeof jalankanPekerja}} [o] */
export async function kerjakan(t, {jalankan = jalankanPekerja} = {}) {
  t.status = 'jalan'; t.mulai = new Date().toISOString();
  const jejak = pencatatLangkah(), t0 = Date.now();
  const langkah = (s) => {
    jejak.ganti(s); t.langkah = s; simpanStatus(t);
    Log.info('render langkah', {uid: t.uid, render: t.id, proyek: t.proyek, langkah: s, ms: Date.now() - t0});
  };
  const ac = new AbortController();
  pengendali.set(t.id, ac);
  try {
    // Semua rasio (P8-11): satu render per komposisi, jadi batas total ikut dikalikan.
    const hasil = await jalankan(t, {onLangkah: langkah, batal: ac.signal,
      batasMs: Pr.BATAS.renderMenit * 60_000 * Math.max(1, Number(t.opsi?.rasio) || 1)});
    const tautan = (/** @type {string | null | undefined} */ f) => (f ? Pr.tautan(t.uid, t.proyek, f) : null);
    t.hasil = {...hasil,
      mp4: tautan(hasil.mp4),
      sampul: tautan(hasil.sampul),
      ...Object.fromEntries(['srt', 'vtt', 'naskah'].filter((k) => hasil[k]).map((k) => [k, tautan(hasil[k])])),
      ...(hasil.varian ? {varian: hasil.varian.map((/** @type {any} */ v) => ({...v, mp4: tautan(v.mp4), sampul: tautan(v.sampul)}))} : {})};
    t.status = 'selesai';
  } catch (e) {
    t.status = e.dibatalkan ? 'dibatalkan' : 'gagal';
    t.galat = String(e.message || e).slice(0, 1500);
    if (e.dibatalkan) Log.info('render dibatalkan', {uid: t.uid, render: t.id, proyek: t.proyek, langkah: t.langkah});
    else Log.galat('render gagal', {uid: t.uid, render: t.id, proyek: t.proyek, langkah: t.langkah, galat: t.galat});
  } finally {
    pengendali.delete(t.id);
    jejak.selesai();
    M.renderTotal.tambah({status: t.status});
    M.renderDetik.amati((Date.now() - t0) / 1000);
    Log.info('render berakhir', {uid: t.uid, render: t.id, proyek: t.proyek, status: t.status, ms: Date.now() - t0});
    t.selesai = new Date().toISOString();
    t.langkah = t.status;
    simpanStatus(t);
    // Tidak ditunggu: penerima yang lambat tidak boleh menahan render berikutnya di antrean.
    if (t.opsi?.webhook) kabariWebhook(t).catch((e) => Log.galat('webhook gagal', {render: t.id, galat: e}));
  }
}

/* Webhook (P6-08) sesudah tugas selesai/gagal. Hasilnya (tanpa rahasia) ikut `status_render`.
   @param {any} t */
export async function kabariWebhook(t, {kirim = W.kirimWebhook, simpan = simpanStatus} = {}) {
  const isi = {peristiwa: `render.${t.status}`, render: t.id, proyek: t.proyek, status: t.status, selesai: t.selesai,
    ...(t.status === 'selesai' ? {hasil: t.hasil} : {galat: t.galat})};
  t.webhook = {keadaan: 'mengirim'};
  simpan(t);
  const r = await kirim(t.opsi.webhook, isi, W.rahasiaWebhook(t.id));
  // `keadaan` terpisah dari kode HTTP: `{status: ..., ...r}` dulu tertimpa `r.status` (200).
  t.webhook = {keadaan: r.terkirim ? 'terkirim' : 'gagal', ...(r.status ? {http: r.status} : {}), percobaan: r.percobaan,
    ...(r.galat ? {galat: r.galat} : {})};
  simpan(t);
  Log.info('webhook', {uid: t.uid, render: t.id, terkirim: r.terkirim, status: r.status, percobaan: r.percobaan});
  return r;
}

const antrean = buatAntrean();
export const kirim = (...argumen) => antrean.kirim(...argumen);
export const status = (...argumen) => antrean.status(...argumen);
export const statusProyek = (...argumen) => antrean.statusProyek(...argumen);
export const batalkan = (...argumen) => antrean.batalkan(...argumen);
/** Hentikan tugas yang sedang jalan lewat pengendalinya (dipakai tes dan `batalkan`). @param {string} id */
export const hentikanTugas = (id, alasan = 'uji') => pengendali.get(id)?.abort(alasan);
/** Untuk dasbor admin: semua tugas di memori (antre, jalan, terminal < 1 jam), urutan antre. */
export const daftarTugas = () => {
  antrean.bersihkan();
  return [...antrean.tugas.values()].map((t) => ({...t, dir: undefined,
    urutan: t.status === 'antre' ? antrean.antre.indexOf(t) + 1 : undefined}));
};
export const ringkasAntrean = () => ({antre: antrean.antre.length, jalan: antrean.jumlahJalan()});
