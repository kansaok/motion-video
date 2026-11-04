/* Antrean render. Satu render menghabiskan semua inti CPU dan beberapa tab Chromium, jadi
   render dijalankan bergiliran (RENDER_PARALEL, bawaan 1) — dua render bersamaan di VPS kecil
   membuat renderer Chromium mati dengan "Target crashed" (lihat VIEWPORT di lib/render.mjs).
   Tiap pelanggan hanya boleh punya satu render yang menunggu atau berjalan. */
import {randomBytes} from 'node:crypto';
import {spawn} from 'node:child_process';
import {existsSync, readFileSync, writeFileSync, readdirSync, rmSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import os from 'node:os';
import * as Pr from './proyek.mjs';

const PARALEL = Number(process.env.RENDER_PARALEL || 1);
const BERKAS_PEKERJA = fileURLToPath(new URL('./pekerja.mjs', import.meta.url));

/* Chromium menjalankan JavaScript milik pelanggan. Proses anak dengan environment bersih
   saja belum cukup: tanpa namespace mount ia masih dapat membaca /proc proses server (UID
   sama) dan seluruh volume /data. bubblewrap membuat /proc baru dan hanya memasang proyek
   yang sedang dikerjakan. Jangan beri fallback tanpa sandbox; kegagalan bwrap harus membuat
   render gagal, bukan diam-diam kembali ke isolasi yang lebih lemah. */
const JALUR_RUNTIME = ['/usr', '/usr/local', '/bin', '/lib', '/lib64', '/etc', '/app', '/ms-playwright'];
export function perintahPekerja(t, {bwrap = '/usr/bin/bwrap', node = process.execPath,
  berkas = BERKAS_PEKERJA, ada = existsSync} = {}) {
  const proyek = path.resolve(String(t.dir || ''));
  if (!path.isAbsolute(String(t.dir || '')) || !ada(proyek)) throw new Error('direktori proyek pekerja tidak sah');
  const bagian = proyek.split(path.sep).filter(Boolean);
  // Pr.buka() tetap memakai jalur DATA_DIR; buat hanya leluhur proyek yang diperlukan.
  const args = ['--die-with-parent', '--new-session', '--unshare-user', '--unshare-pid', '--unshare-uts', '--unshare-ipc',
    '--cap-drop', 'ALL', '--proc', '/proc', '--dev', '/dev', '--tmpfs', '/tmp'];
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
  args.push('--setenv', 'HOME', '/tmp', node, berkas);
  return {perintah: bwrap, argumen: args};
}

/* Pekerja menjalankan HTML pelanggan lewat Chromium. Ia hanya menerima konfigurasi teknis
   render; token BIMP dan tautan unduh tetap tinggal di proses server HTTP. */
const ENV_PEKERJA = ['PATH', 'HOME', 'TMPDIR', 'DATA_DIR', 'NODE_ENV', 'WORKERS',
  'MOTION_PLAYWRIGHT', 'MOTION_VIEWPORT', 'MOTION_ENCODER', 'MOTION_BLOKIR_PRIVAT'];
export function lingkunganPekerja(env = process.env) {
  return Object.fromEntries(ENV_PEKERJA.filter((nama) => env[nama] !== undefined).map((nama) => [nama, env[nama]]));
}

const simpanStatus = (t) => {
  try { writeFileSync(path.join(t.dir, 'render.json'), JSON.stringify({...t, dir: undefined}, null, 1)); } catch { /* proyek sudah dihapus */ }
};

export function buatAntrean({paralel = PARALEL, maks = Pr.BATAS.antreMaks, kerjakanTugas = kerjakan,
  simpan = simpanStatus, tunda = setImmediate, sekarang = () => Date.now(), durasiAwal = []} = {}) {
  const tugas = new Map(), antre = [], durasi = durasiAwal.slice(-10);
  let jalan = 0;
  const rata = () => durasi.length ? durasi.reduce((a, b) => a + b, 0) / durasi.length : null;
  const bersihkan = () => {
    const batas = sekarang() - 3600e3;
    for (const [id, t] of tugas) if ((t.status === 'selesai' || t.status === 'gagal') && Date.parse(t.selesai || '') < batas) tugas.delete(id);
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
  return {kirim, status, statusProyek, putar, bersihkan, tugas, antre};
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


export function bersihkanFramesPekerja(pid, direktoriTmp = os.tmpdir()) {
  const akhiran = `-${pid}`;
  for (const nama of readdirSync(direktoriTmp, {withFileTypes: true})) {
    if (nama.isDirectory() && nama.name.startsWith('frames-') && nama.name.endsWith(akhiran)) {
      rmSync(path.join(direktoriTmp, nama.name), {recursive: true, force: true});
    }
  }
}

export function jalankanPekerja(t, {
  buatProses = spawn, onLangkah = () => {}, onKemajuan = () => {},
  batasMs = Pr.BATAS.renderMenit * 60_000, macetMs = Pr.BATAS.renderMacetDetik * 1_000,
  bunuhGrup = (pid) => process.kill(-pid, 'SIGKILL'), bersihkanFrame = bersihkanFramesPekerja,
} = {}) {
  return new Promise((selesai, gagal) => {
    let tuntas = false, timerBatas, watchdog, renderMulai = 0, frameTerakhir = 0;
    const akhir = (fn, nilai) => {
      if (tuntas) return;
      tuntas = true;
      clearTimeout(timerBatas);
      clearInterval(watchdog);
      fn(nilai);
    };
    const hentikan = (pesan) => {
      try { bunuhGrup(anak.pid); } catch (e) { console.error(`pekerja render ${anak.pid} tidak dapat dihentikan:`, e.message); }
      try { bersihkanFrame(anak.pid); } catch (e) { console.error(`frame pekerja ${anak.pid} tidak dapat dibersihkan:`, e.message); }
      akhir(gagal, new Error(pesan));
    };
    let perintah;
    try { perintah = perintahPekerja(t); } catch (e) { akhir(gagal, e); return; }
    const anak = buatProses(perintah.perintah, perintah.argumen, {
      detached: true, env: lingkunganPekerja(), stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
    });
    anak.once('error', (e) => akhir(gagal, e));
    anak.on('message', (pesan) => {
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

async function kerjakan(t) {
  t.status = 'jalan'; t.mulai = new Date().toISOString();
  const langkah = (s) => { t.langkah = s; simpanStatus(t); console.log(`[render ${t.id}] ${t.proyek}: ${s}`); };
  try {
    const hasil = await jalankanPekerja(t, {onLangkah: langkah});
    t.hasil = {...hasil,
      mp4: Pr.tautan(t.uid, t.proyek, hasil.mp4),
      sampul: hasil.sampul ? Pr.tautan(t.uid, t.proyek, hasil.sampul) : null};
    t.status = 'selesai';
  } catch (e) {
    t.status = 'gagal';
    t.galat = String(e.message || e).slice(0, 1500);
    console.error(`[render ${t.id}] gagal:`, e);
  } finally {
    t.selesai = new Date().toISOString();
    t.langkah = t.status;
    simpanStatus(t);
  }
}

const antrean = buatAntrean();
export const kirim = (...argumen) => antrean.kirim(...argumen);
export const status = (...argumen) => antrean.status(...argumen);
export const statusProyek = (...argumen) => antrean.statusProyek(...argumen);
