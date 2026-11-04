/* `motion doctor` (P6-01): semua prasyarat mesin dalam satu perintah, dengan saran perbaikan.
   Tiap cek di sini mewakili kegagalan yang dulu baru ketahuan di tengah pekerjaan: ffmpeg tanpa
   filter mixer, Chromium yang terunduh tapi tidak bisa diluncurkan, `/tmp` tmpfs yang sesak
   (render mati di sekitar frame 250), kunci ElevenLabs yang kosong sesudah VO pertama.

   Semua akses ke mesin lewat `alat`, supaya tiap putusan bisa diuji tanpa merusak mesin uji. */
import {spawnSync} from 'node:child_process';
import {existsSync, readFileSync, realpathSync, statfsSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {AKAR} from './env.mjs';
import {DOKTER} from './konstanta.mjs';
import {batasUsd} from './biaya.mjs';
import * as EL from './el.mjs';

/** @typedef {'ok' | 'awas' | 'gagal' | 'lewat'} Status */
/** @typedef {{nama: string, status: Status, detail: string, saran?: string}} Hasil */

const GB = 1024 ** 3;
const hasil = (nama, status, detail, saran) => ({nama, status, detail, ...(saran ? {saran} : {})});

/* Titik mount terpanjang yang memuat `p`, dari /proc/mounts. Null di luar Linux. */
export function tipeMount(p, isiMounts) {
  let isi = isiMounts;
  if (isi === undefined) {
    try { isi = readFileSync('/proc/mounts', 'utf8'); } catch { return null; }
  }
  let nyata = p;
  try { nyata = realpathSync(p); } catch { /* jalur belum ada: pakai apa adanya */ }
  let terbaik = null;
  for (const baris of isi.split('\n')) {
    const [, titik, tipe] = baris.split(' ');
    if (!titik) continue;
    const t = titik.replace(/\\040/g, ' ');
    const cocok = nyata === t || nyata.startsWith(t.endsWith('/') ? t : `${t}/`);
    if (cocok && (!terbaik || t.length > terbaik.titik.length)) terbaik = {titik: t, tipe};
  }
  return terbaik;
}

export function alatBawaan() {
  return {
    env: process.env,
    versiNode: process.versions.node,
    akar: AKAR,
    berkasEnv: process.env.MOTION_ENV || path.join(AKAR, '.env'),
    tmp: os.tmpdir(),
    ada: existsSync,
    /** @param {string} cmd @param {string[]} args */
    jalankan: (cmd, args) => {
      const r = spawnSync(cmd, args, {encoding: 'utf8', maxBuffer: 1 << 24});
      return {status: r.status, stdout: r.stdout || '', stderr: r.stderr || '', galat: r.error};
    },
    statfs: (/** @type {string} */ p) => statfsSync(p),
    tipeMount: (/** @type {string} */ p) => tipeMount(p),
    playwright: async () => (await import('./render.mjs')).muatPlaywright(),
    luncurChromium: async (/** @type {any} */ pw) => {
      const {OPSI_CHROMIUM} = await import('./render.mjs');
      const b = await pw.chromium.launch({...OPSI_CHROMIUM, timeout: DOKTER.batasChromiumMs});
      try { await (await b.newPage()).setContent('<p>ok</p>'); } finally { await b.close(); }
    },
    encoder: async () => (await import('./render.mjs')).encoderVideo(),
    aksesEL: async (/** @type {string} */ kunci) => {
      const r = await EL.kirim(`${EL.dasar.url}/v1/user/subscription`, {headers: {'xi-api-key': kunci}},
        {coba: 1, batasMs: DOKTER.batasJaringanMs});
      return r.json();
    },
  };
}

const minNode = (akar) => {
  try {
    const m = JSON.parse(readFileSync(path.join(akar, 'package.json'), 'utf8')).engines?.node?.match(/(\d+)/);
    return m ? Number(m[1]) : 20;
  } catch { return 20; }
};
const pinPlaywright = (akar) => {
  try { return JSON.parse(readFileSync(path.join(akar, 'package.json'), 'utf8')).dependencies?.playwright; }
  catch { return undefined; }
};

function cekNode(a) {
  const min = minNode(a.akar), mayor = Number(a.versiNode.split('.')[0]);
  return mayor >= min ? hasil('Node', 'ok', `${a.versiNode} (≥ ${min})`)
    : hasil('Node', 'gagal', `${a.versiNode}, butuh ≥ ${min}`, `pasang Node ${min} atau lebih baru (nvm install ${min})`);
}

/* Nama di kolom kedua daftar `ffmpeg -filters` / `-encoders`, sesudah baris penjelasan. */
const daftarNama = (teks) => new Set(teks.split('\n').map((b) => b.trim().split(/\s+/))
  .filter((k) => k.length > 2 && /^[A-Z.|]{3,6}$/.test(k[0])).map((k) => k[1]));

function cekFfmpeg(a) {
  const out = [cekFfmpegSaja(a)];
  const p = a.jalankan('ffprobe', ['-hide_banner', '-version']);
  out.push(p.galat || p.status !== 0
    ? hasil('ffprobe', 'gagal', 'tidak ditemukan di PATH', 'biasanya satu paket dengan ffmpeg; pastikan keduanya di PATH')
    : hasil('ffprobe', 'ok', (p.stdout.match(/ffprobe version (\S+)/) || [])[1] || 'ada'));
  return out;
}

function cekFfmpegSaja(a) {
  const v = a.jalankan('ffmpeg', ['-hide_banner', '-version']);
  if (v.galat || v.status !== 0) {
    return hasil('ffmpeg', 'gagal', 'tidak ditemukan di PATH', 'pasang ffmpeg (Ubuntu: sudo apt install ffmpeg; macOS: brew install ffmpeg)');
  }
  const versi = (v.stdout.match(/ffmpeg version (\S+)/) || [])[1] || '?';
  const f = daftarNama(a.jalankan('ffmpeg', ['-hide_banner', '-filters']).stdout);
  const e = daftarNama(a.jalankan('ffmpeg', ['-hide_banner', '-encoders']).stdout);
  const fHilang = DOKTER.filter.filter((x) => !f.has(x));
  const eHilang = DOKTER.encoder.filter((x) => !e.has(x));
  if (fHilang.length || eHilang.length) {
    return hasil('ffmpeg', 'gagal', `${versi}; ${[
      fHilang.length && `filter hilang: ${fHilang.join(', ')}`,
      eHilang.length && `encoder hilang: ${eHilang.join(', ')}`].filter(Boolean).join('; ')}`,
    'build ffmpeg ini minimal; pasang paket distro lengkap atau build dengan --enable-gpl --enable-libx264');
  }
  return hasil('ffmpeg', 'ok', `${versi} · ${DOKTER.filter.length} filter dan ${DOKTER.encoder.join('/')} ada`);
}

function cekUnzip(a) {
  const r = a.jalankan('unzip', ['-v']);
  return r.galat || r.status !== 0
    ? hasil('unzip', 'awas', 'tidak ditemukan; hanya `motion init <zip>` yang butuh', 'sudo apt install unzip')
    : hasil('unzip', 'ok', 'ada');
}

async function cekPlaywright(a, {cepat = false}) {
  if (!a.ada(path.join(a.akar, 'node_modules'))) {
    return [hasil('node_modules', 'gagal', `tidak ada di ${a.akar}`, `cd ${a.akar} && npm ci`)];
  }
  let p;
  try { p = await a.playwright(); } catch (e) {
    return [hasil('Playwright', 'gagal', String(e.message).split('\n')[0], 'npm ci, atau set MOTION_PLAYWRIGHT=<repo yang sudah punya playwright>')];
  }
  const out = [];
  const pin = pinPlaywright(a.akar);
  out.push(pin && p.versi !== pin
    ? hasil('Playwright', 'awas', `${p.versi} dari ${p.dari}, package.json mengunci ${pin}`,
      'image Docker produksi memakai versi yang dikunci; hasil render lokal bisa berbeda. Jalankan npm ci')
    : hasil('Playwright', 'ok', `${p.versi}${p.dari.startsWith(a.akar) ? '' : ` (dipinjam dari ${p.dari})`}`));
  const exe = p.pw.chromium.executablePath();
  if (!a.ada(exe)) {
    out.push(hasil('Chromium', 'gagal', `belum diunduh (${exe})`, 'npx playwright install chromium'));
    return out;
  }
  if (cepat) { out.push(hasil('Chromium', 'ok', `terunduh; peluncuran dilewati (--cepat)`)); return out; }
  try {
    await a.luncurChromium(p.pw);
    out.push(hasil('Chromium', 'ok', 'diluncurkan dengan sandbox, halaman uji terbuka'));
  } catch (e) {
    const m = String(e.message);
    const saran = /shared librar|missing dependencies|install-deps/i.test(m)
      ? 'pustaka sistem kurang: sudo npx playwright install-deps chromium'
      : /sandbox|namespace|setuid/i.test(m)
        ? 'sandbox Chromium tidak tersedia: aktifkan user namespaces (sysctl kernel.unprivileged_userns_clone=1 / '
          + 'apparmor_restrict_unprivileged_userns=0). Jangan mematikan sandbox: komposisi pelanggan dirender di sini'
        : 'jalankan ulang dengan DEBUG=pw:browser untuk log lengkap';
    out.push(hasil('Chromium', 'gagal', `tidak bisa diluncurkan: ${m.split('\n').find((b) => b.trim()) || m}`.slice(0, 300), saran));
  }
  return out;
}

function cekEnv(a) {
  const out = [];
  const adaBerkas = a.ada(a.berkasEnv);
  const kunci = a.env.ELEVENLABS_API_KEY;
  if (kunci) {
    out.push(hasil('ELEVENLABS_API_KEY', 'ok', adaBerkas ? `terisi (${a.berkasEnv})` : 'terisi dari lingkungan'));
  } else {
    out.push(hasil('ELEVENLABS_API_KEY', 'gagal', adaBerkas ? `kosong di ${a.berkasEnv}` : `${a.berkasEnv} tidak ada`,
      adaBerkas ? 'isi kuncinya; dibutuhkan plan, sfx, music, check (transkrip), voices, speed, cost'
        : `cp ${path.join(a.akar, '.env.example')} ${a.berkasEnv} lalu isi ELEVENLABS_API_KEY`));
  }
  try {
    const b = batasUsd(a.env);
    out.push(hasil('BIAYA_MAKS_USD', 'ok', `$${b.toFixed(2)}${a.env.BIAYA_MAKS_USD ? '' : ' (bawaan)'}`));
  } catch (e) { out.push(hasil('BIAYA_MAKS_USD', 'gagal', e.message, 'isi angka USD, mis. BIAYA_MAKS_USD=0.50')); }

  const salah = [];
  if (a.env.WORKERS && !(Number.isInteger(Number(a.env.WORKERS)) && Number(a.env.WORKERS) >= 1)) salah.push(`WORKERS=${a.env.WORKERS} bukan bilangan bulat ≥ 1`);
  if (a.env.MOTION_VIEWPORT && !/^\d{3,5}x\d{3,5}$/.test(a.env.MOTION_VIEWPORT)) salah.push(`MOTION_VIEWPORT=${a.env.MOTION_VIEWPORT} bukan <lebar>x<tinggi>`);
  if (a.env.MOTION_PLAYWRIGHT && !a.ada(path.join(a.env.MOTION_PLAYWRIGHT, 'node_modules', 'playwright'))) salah.push(`MOTION_PLAYWRIGHT=${a.env.MOTION_PLAYWRIGHT} tidak punya node_modules/playwright`);
  // render.encoderVideo hanya mengenal cpu/libx264; nilai lain jatuh ke pilihan otomatis tanpa pesan.
  if (a.env.MOTION_ENCODER && !['cpu', 'libx264'].includes(a.env.MOTION_ENCODER)) salah.push(`MOTION_ENCODER=${a.env.MOTION_ENCODER} tidak dikenal (hanya cpu/libx264; selain itu dipilih otomatis)`);
  if (salah.length) out.push(hasil('penyetel', 'awas', salah.join('; '), 'nilai yang salah diabaikan diam-diam atau gagal di tengah render; perbaiki atau hapus'));
  return out;
}

function cekDisk(a) {
  const out = [];
  const tempat = [['TMPDIR', a.tmp, 'frame render ditulis di sini'], ['repo', a.akar, 'proyek, aset, dan MP4']];
  for (const [nama, p, guna] of tempat) {
    let s;
    try { s = a.statfs(p); } catch (e) { out.push(hasil(`disk ${nama}`, 'awas', `${p}: ${e.code || e.message}`)); continue; }
    const bebas = (s.bavail * s.bsize) / GB;
    const pakai = s.blocks ? Math.round(((s.blocks - s.bfree) / s.blocks) * 100) : 0;
    const m = a.tipeMount(p);
    const tmpfs = m?.tipe === 'tmpfs';
    const ket = `${p}: ${bebas.toFixed(1)} GB bebas, ${pakai}% terpakai${tmpfs ? ' (tmpfs)' : ''} — ${guna}`;
    if (nama === 'TMPDIR' && tmpfs && pakai >= DOKTER.tmpfsPenuhPersen) {
      out.push(hasil(`disk ${nama}`, 'gagal', ket, 'tmpfs sesak membuat Chromium mati di sekitar frame 250. '
        + 'Pindahkan temp: mkdir -p ~/render/tmp && TMPDIR=$HOME/render/tmp motion render …'));
    } else if (bebas < DOKTER.diskGagalGb) {
      out.push(hasil(`disk ${nama}`, 'gagal', ket, `butuh ≥ ${DOKTER.diskPeringatanGb} GB; render 180 dtk menulis ±3 GB frame`));
    } else if (bebas < DOKTER.diskPeringatanGb) {
      out.push(hasil(`disk ${nama}`, 'awas', ket, `video panjang butuh ±3 GB frame; kosongkan ruang atau pindahkan ${nama === 'TMPDIR' ? 'TMPDIR' : 'repo'}`));
    } else out.push(hasil(`disk ${nama}`, 'ok', ket));
  }
  return out;
}

async function cekElevenLabs(a, {luring = false}) {
  if (luring) return hasil('ElevenLabs', 'lewat', 'dilewati (--luring)');
  if (!a.env.ELEVENLABS_API_KEY) return hasil('ElevenLabs', 'lewat', 'tidak dicoba: kunci kosong');
  try {
    const s = await a.aksesEL(a.env.ELEVENLABS_API_KEY);
    const sisa = (s.character_limit ?? 0) - (s.character_count ?? 0);
    const ket = `terjangkau · paket ${s.tier || '?'} · sisa ${sisa.toLocaleString('id-ID')} kredit`;
    return sisa < 1000
      ? hasil('ElevenLabs', 'awas', ket, 'kredit hampir habis: satu iklan 30 dtk dari nol ±1.800 kredit')
      : hasil('ElevenLabs', 'ok', ket);
  } catch (e) {
    const st = e.status;
    // quota_exceeded bisa datang sebagai 401: kuncinya sah, kreditnya yang habis.
    if (e.kuota) return hasil('ElevenLabs', 'gagal', 'kunci diterima, kuota/kredit habis', 'isi ulang kredit di elevenlabs.io');
    if (st === 401 || st === 403) {
      return hasil('ElevenLabs', 'gagal', `kunci ditolak (${st})`, 'periksa ELEVENLABS_API_KEY; kunci yang dibatasi butuh izin "User: Read"');
    }
    return hasil('ElevenLabs', 'gagal', `tidak terjangkau: ${String(e.message).slice(0, 200)}`,
      'periksa jaringan/proxy ke api.elevenlabs.io, atau jalankan dengan --luring untuk melewati cek ini');
  }
}

async function cekEncoder(a) {
  try {
    const e = await a.encoder();
    return hasil('encoder video', 'ok', `${e.nama} — ${e.alasan}`);
  } catch (e) { return hasil('encoder video', 'awas', String(e.message).slice(0, 200)); }
}

/** @param {{luring?: boolean, cepat?: boolean}} [o] @param {ReturnType<typeof alatBawaan>} [a] @returns {Promise<Hasil[]>} */
export async function periksa(o = {}, a = alatBawaan()) {
  const ffm = cekFfmpeg(a);
  const ffmOk = ffm[0].status === 'ok';
  return [
    cekNode(a),
    ...ffm,
    cekUnzip(a),
    ...(await cekPlaywright(a, o)),
    ...cekEnv(a),
    ...cekDisk(a),
    await cekElevenLabs(a, o),
    // Pilihan encoder menjalankan encode uji lewat ffmpeg; tanpa ffmpeg hasilnya menyesatkan.
    ffmOk ? await cekEncoder(a) : hasil('encoder video', 'lewat', 'tidak dicoba: ffmpeg belum siap'),
  ];
}

const IKON = {ok: '✓', awas: '!', gagal: '✖', lewat: '·'};

/** @param {Hasil[]} h */
export function lapor(h) {
  const lebar = Math.max(...h.map((x) => x.nama.length));
  const baris = h.flatMap((x) => [`  ${IKON[x.status]} ${x.nama.padEnd(lebar)}  ${x.detail}`,
    ...(x.saran && x.status !== 'ok' ? [`    ${' '.repeat(lebar)}  → ${x.saran}`] : [])]);
  const g = h.filter((x) => x.status === 'gagal').length, w = h.filter((x) => x.status === 'awas').length;
  baris.push('', g ? `  ${g} gagal${w ? `, ${w} peringatan` : ''}: perbaiki yang bertanda ✖ sebelum render`
    : w ? `  siap, dengan ${w} peringatan` : '  siap: semua prasyarat terpenuhi');
  return baris.join('\n');
}
