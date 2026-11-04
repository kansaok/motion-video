// Rantai kerja: zip -> src -> vo -> rencana -> terap -> sfx -> musik -> mix -> render -> periksa.
// Tiap langkah bisa dijalankan sendiri dan aman diulang; yang sudah ada tidak digenerate lagi.
import {readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync, copyFileSync, statSync} from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {ff, durasi} from './ff.mjs';
import * as EL from './el.mjs';
import * as K from './komposisi.mjs';
import * as T from './tata.mjs';
import * as M from './mix.mjs';
import * as R from './render.mjs';
import * as P from './periksa.mjs';
import {ZIP, HARGA} from './konstanta.mjs';
import {vo} from './vo.mjs';
import {bacaTimeline, simpanTimeline} from './timeline.mjs';

// Tahap yang tinggal di berkas sendiri, diekspor ulang supaya `Pipa.*` tetap satu pintu.
export {akhirSuara, pangkasVo, ucapkan, vo} from './vo.mjs';
export {sfx} from './sfx.mjs';
export {musik, periksaBed, laporBed} from './musik.mjs';

/**
 * @param {string} dirProyek
 * @returns {Promise<import('./tipe.mjs').Config>}
 */
export async function muat(dirProyek) {
  const f = ['motion.config.mjs', 'config.mjs'].map((n) => path.join(dirProyek, n)).find(existsSync);
  if (!f) throw new Error(`config tidak ada di ${dirProyek} (butuh motion.config.mjs)`);
  const cfg = (await import(`${f}?t=${Date.now()}`)).default;
  cfg.dir = dirProyek;
  cfg.src = path.join(dirProyek, cfg.src || 'src');
  cfg.aset = path.join(dirProyek, 'aset');
  cfg.stem = path.join(dirProyek, 'stem');
  cfg.htmlUtama = path.join(cfg.src, cfg.komposisi);
  for (const d of [`${cfg.aset}/vo`, `${cfg.aset}/sfx`, cfg.stem]) mkdirSync(d, {recursive: true});
  return cfg;
}

/* ── unzip ─────────────────────────────────────────────────────────────────── */
/* Ukuran zip terkompres bukan ukuran ruang yang akan dipakai. Daftar diperiksa sebelum
   `unzip` menyentuh disk agar satu unggahan tidak dapat memenuhi volume semua pelanggan. */
export function periksaZip(zip, {maksBytes = ZIP.maksBytes, maksEntri = ZIP.maksEntri, maksRasio = ZIP.maksRasio,
  jalankan = execFileSync} = {}) {
  const daftar = String(jalankan('unzip', ['-Z', '-1', zip], {encoding: 'utf8'})).split(/\r?\n/).filter(Boolean);
  if (!daftar.length) throw new Error('zip kosong');
  if (daftar.length > maksEntri) throw new Error(`zip berisi ${daftar.length} entri, batas ${maksEntri}`);
  for (const nama of daftar) {
    const n = nama.replace(/\\/g, '/');
    if (!n || n.includes('\0') || n.startsWith('/') || /^[a-z]:\//i.test(n)
      || n.split('/').some((bagian) => bagian === '..')) throw new Error(`zip memuat jalur tidak aman: ${nama}`);
  }
  const tabel = String(jalankan('unzip', ['-l', zip], {encoding: 'utf8'}));
  const ukuran = [...tabel.matchAll(/^\s*(\d+)\s+\d{4}-\d\d-\d\d\s+\d\d:\d\d\s+/gm)]
    .reduce((total, m) => total + Number(m[1]), 0);
  if (ukuran > maksBytes) throw new Error(`isi zip ${Math.ceil(ukuran / 1048576)} MB, batas ${Math.floor(maksBytes / 1048576)} MB`);
  const terkompres = statSync(zip).size;
  if (terkompres && ukuran / terkompres > maksRasio) throw new Error('nisbah kompresi zip mencurigakan');
  return {entri: daftar.length, ukuran};
}

export function bongkar(zip, dirProyek, batas) {
  periksaZip(zip, batas);
  const src = path.join(dirProyek, 'src');
  mkdirSync(src, {recursive: true});
  execFileSync('unzip', ['-nq', zip, '-d', src]);
  const {html, jsx} = K.temukan(src);
  if (!html.length) throw new Error('tidak ada berkas .html yang memuat OM_SCENES di dalam zip');
  return {src, html, jsx};
}

/* ── rencana ───────────────────────────────────────────────────────────────── */
/** @param {import('./tipe.mjs').Config} c */
export async function rencana(c) {
  await vo(c);
  // Selalu mulai dari durasi ASLI komposisi. Kalau dihitung dari html yang sudah pernah
  // ditulisi, scene akan memanjang lagi dan lagi tiap kali plan dijalankan ulang.
  const asliHtml = `${c.htmlUtama}.asli`;
  const kerja = K.bacaScenes(existsSync(asliHtml) ? asliHtml : c.htmlUtama).map((s) => ({...s}));
  const {C, total, asli} = T.rencana(c.vo, kerja, c.tata || {});
  simpanTimeline(c, kerja);
  return {scenes: kerja, C, total, asli};
}

/* ── timing.js ─────────────────────────────────────────────────────────────── */
/* Ditulis dari timeline yang sama dengan mixer, sehingga komposisi kontrak v2 tidak perlu
   menebak posisi kapsi/beat dan tidak ada sumber yang ditambal. Komposisi v1 boleh
   mengabaikannya. Isi dan bentuknya: docs/kontrak-komposisi-v2.md.
   @param {import('./tipe.mjs').Config} c
   @param {import('./tipe.mjs').Scene[]} scenes */
export function tulisTiming(c, scenes) {
  const {C, total} = K.jadwal(scenes);
  T.tempatkan(c.vo, C, c.tata || {});
  const vo = c.vo.map((l) => ({no: l.no, pos: +l.pos.toFixed(3), dur: +l.dur.toFixed(3)}));
  const P_ = Object.fromEntries(c.vo.map((l) => [l.no, l.pos]));
  const E_ = Object.fromEntries(c.vo.map((l) => [l.no, l.pos + l.dur]));
  const S = Object.fromEntries(scenes.map((s) => [s.name, s.dur]));
  const cue = (c.cue ? c.cue({C, P: P_, E: E_, S, total}) : [])
    .filter((x) => x.at >= 0 && x.at < total - 0.05)
    .map((x) => ({nama: x.nama, at: +x.at.toFixed(3)}))
    .sort((a, b) => a.at - b.at);
  writeFileSync(path.join(c.src, 'timing.js'),
    `window.VO_TIMING = ${JSON.stringify(vo)};\nwindow.OM_CUES = ${JSON.stringify(cue)};\n`);
  return {vo, cue, total};
}

/* ── terap ke komposisi ────────────────────────────────────────────────────── */
/** @param {import('./tipe.mjs').Config} c */
export async function terap(c) {
  const versi = K.kontrak(c.htmlUtama, c.src);
  /* Penambal JSX v1 pada komposisi v2 akan menimpa angka yang tidak pernah ia tulis; lebih
     baik menolak config yang bertentangan daripada diam-diam melewatinya. */
  const v1 = ['jsx', 'kapsi', 'jangkar', 'deret'].filter((k) => c[k]);
  if (versi === 2 && v1.length) {
    throw new Error(`${c.komposisi} memakai kontrak v2 (timing.js); hapus ${v1.join(', ')} dari config`);
  }
  const {scenes, C} = await rencana(c);
  const peta = Object.fromEntries(scenes.map((s) => [s.name, s.dur]));
  const berkas = [c.komposisi, ...(c.jugaTulis || [])].map((f) => path.join(c.src, f)).filter(existsSync);
  berkas.forEach(K.cadangkan);
  let n = 0;
  for (const f of berkas) if (K.tulisScenes(f, peta)) n++;
  const timing = tulisTiming(c, scenes);

  let kapsi = 0, jangkar = 0;
  if (c.jsx) {
    const jsx = path.join(c.src, c.jsx);
    K.cadangkan(jsx);
    /* `.asli` adalah sumber kebenarannya, bukan salinan cadangan: tiap `apply` menerapkan
       ulang dari sana supaya durasi tidak bertumpuk. Menyunting berkas kerjanya saja lalu
       menjalankan `apply` membuang suntingan itu TANPA jejak — satu rombakan animasi penuh
       pernah hilang begitu, dan render berikutnya terlihat seperti perbaikannya gagal. */
    /* `.terap` = isi yang terakhir ditulis apply sendiri. Tanpa itu, geserKapsi di run pertama
       sudah membuat berkas kerja berbeda dari `.asli`, dan setiap apply kedua (misalnya
       sesudah satu baris VO diganti) berhenti di sini padahal tidak ada suntingan tangan. */
    const jejak = `${jsx}.terap`, kerja = readFileSync(jsx);
    if (existsSync(`${jsx}.asli`) && !kerja.equals(readFileSync(`${jsx}.asli`))
      && !(existsSync(jejak) && kerja.equals(readFileSync(jejak)))) {
      throw new Error(`${path.basename(jsx)} berbeda dari ${path.basename(jsx)}.asli — `
        + 'apply akan membuang suntingannya. Salin ke .asli dulu kalau suntingan itu memang dipakai.');
    }
    K.pulihkan(jsx);                                    // selalu terap dari keadaan asli
    const off = (no, d = 0) => { const l = c.vo.find((x) => x.no === no); return Math.max(0, l.pos - C[l.sc] + d); };
    if (c.kapsi) kapsi = K.geserKapsi(jsx, c.vo.map((l) => l.pos - C[l.sc]));
    if (c.jangkar) jangkar += K.geserJangkar(jsx, Object.fromEntries(
      Object.entries(c.jangkar).map(([v, no]) => [v, off(no, -0.10)])));
    if (c.deret) jangkar += K.geserDeret(jsx, Object.fromEntries(
      Object.entries(c.deret).map(([v, nos]) => [v, nos.map((no) => off(no, -0.10))])));
    copyFileSync(jsx, jejak);
  }
  return {html: n, kapsi, jangkar, scenes, kontrak: versi, timing};
}

/* ── mix ───────────────────────────────────────────────────────────────────── */
/**
 * @param {import('./tipe.mjs').Config} c
 * @param {{matikan?: 'sfx' | 'musik' | 'vo'}} [opsi]
 */
export async function mix(c, {matikan} = {}) {
  await vo(c);
  const scenes = bacaTimeline(c);
  const {C, total} = K.jadwal(scenes);
  T.tempatkan(c.vo, C, c.tata || {});
  /* P = awal tiap baris, E = AKHIRNYA. Tanpa E, jendela hening cuma bisa diikat ke awal
     baris berikutnya — dan begitu satu baris memanjang, ekornya masuk ke jendela yang
     seharusnya senyap. Itu lolos sampai MP4 dan baru ketahuan di `check`. Diikat ke E,
     jendelanya menempel pada dua tetangganya sekaligus dan tidak bisa lagi menimpa. */
  const P_ = Object.fromEntries(c.vo.map((l) => [l.no, l.pos]));
  const E_ = Object.fromEntries(c.vo.map((l) => [l.no, l.pos + l.dur]));
  const S = Object.fromEntries(scenes.map((s) => [s.name, s.dur]));

  const cue = (c.cue ? c.cue({C, P: P_, E: E_, S, total}) : [])
    .filter((x) => x.at >= 0 && x.at < total - 0.05)
    .sort((a, b) => a.at - b.at);
  const hilang = [...new Set(cue.map((x) => x.nama))]
    .filter((n) => !existsSync(path.join(c.aset, 'sfx', `${n}.mp3`)));
  if (hilang.length) throw new Error(`SFX belum digenerate: ${hilang.join(', ')}`);

  for (const m of c.musik || []) {
    m.file = path.join(c.aset, `${m.nama}.mp3`);
    if (!existsSync(m.file)) throw new Error(`musik belum digenerate: ${m.nama}`);
    if (typeof m.mulai === 'function') m.mulai = m.mulai({C, total});
    if (typeof m.fadeOut === 'function') m.fadeOut = m.fadeOut({C, total});
  }
  return M.rakit({
    dir: c.aset, C, total, vo: c.vo, cue, musik: c.musik || [],
    gate: c.gate ? c.gate({C, P: P_, E: E_, S, total}) : null,
    matikan, ...(c.mixer || {}),
  });
}

/* ── render ────────────────────────────────────────────────────────────────── */
/** @param {import('./tipe.mjs').Config} c @param {Record<string, any>} [opsi] */
export async function render(c, opsi = {}) {
  return R.render({
    dirSrc: c.src, berkas: c.komposisi,
    audio: path.join(c.aset, 'master.wav'),
    keluaran: path.join(c.dir, c.keluaran || `${c.nama}.mp4`),
    sampul: c.sampul, dirProyek: c.dir,
    ...opsi,
  });
}

/* ── periksa ───────────────────────────────────────────────────────────────── */
/* Titik pemeriksaan visual: tengah tiap baris VO (teks, kapsi, hitam), tengah tiap scene
   (teks, hitam), dan 0,25 dtk sesudah tiap batas scene (hitam saja: transisi sengaja menggeser
   teks keluar stage di sana, jadi teks tidak diperiksa).
   @param {import('./tipe.mjs').Config} c */
export function titikVisual(c) {
  const scenes = bacaTimeline(c);
  const {C, total} = K.jadwal(scenes);
  T.tempatkan(c.vo, C, c.tata || {});
  const adaKapsi = Boolean(c.kapsi || c.periksa?.kapsi);
  const titik = [
    ...c.vo.map((l) => ({t: l.pos + l.dur / 2, alasan: `VO-${l.no}`, ...(adaKapsi ? {kapsi: l.text} : {})})),
    ...scenes.map((s) => ({t: C[s.name] + s.dur / 2, alasan: `tengah scene ${s.name}`})),
    ...scenes.slice(1).map((s) => ({t: C[s.name] + 0.25, alasan: `awal scene ${s.name}`, teks: false})),
  ];
  return titik.filter((p) => p.t >= 0 && p.t < total - 0.05)
    .map((p) => ({...p, t: +p.t.toFixed(2)}))
    .sort((a, b) => a.t - b.t);
}

/**
 * @param {import('./tipe.mjs').Config} c
 * @param {{lengkap?: boolean, visual?: boolean}} [opsi]
 */
export async function periksa(c, {lengkap = true, visual = false} = {}) {
  // Posisi baris diturunkan dari durasi tiap berkas VO. Tanpa ini `--cepat` melewati mix,
  // `l.dur` tetap undefined, dan jendela hening dilaporkan "minta NaN-NaN -> TIDAK ADA
  // senyap ✖" pada mix yang sebenarnya benar. Berkasnya sudah ada, jadi ini cuma ffprobe.
  await vo(c);
  const mp4 = path.join(c.dir, c.keluaran || `${c.nama}.mp4`);
  /** @type {Record<string, any>} */
  const hasil = {mp4: existsSync(mp4) ? P.ringkas(mp4) : null, masking: P.masking(c.stem),
    lubang: P.lubang(path.join(c.stem, 'mus.wav')),
    // Frame 0 adalah sampul bawaan di Instagram, TikTok, dan LinkedIn. Diukur di MP4 yang
    // dikirim, karena hanya di situ frame yang benar-benar diunggah itu ada.
    sampul: existsSync(mp4) ? P.sampul(mp4) : null};

  // A/B: buktikan bus SFX benar-benar masuk ke master, bukan sekadar "pelan"
  const titik = (c.periksa?.busTitik) || [];
  if (lengkap && titik.length) {
    const master = path.join(c.aset, 'master.wav');
    const salinan = path.join(c.dir, '.master-ada.wav');
    copyFileSync(master, salinan);
    await mix(c, {matikan: 'sfx'});
    const tanpa = path.join(c.dir, '.master-tanpa.wav');
    copyFileSync(master, tanpa);
    hasil.bus = P.busHidup(salinan, tanpa, titik);
    await mix(c);                                   // pulihkan master yang benar
    unlinkSync(salinan); unlinkSync(tanpa);
  }
  if (existsSync(mp4)) {
    const scenes = bacaTimeline(c);
    const {C, total} = K.jadwal(scenes);
    T.tempatkan(c.vo, C, c.tata || {});
    const P_ = Object.fromEntries(c.vo.map((l) => [l.no, l.pos]));
    const E_ = Object.fromEntries(c.vo.map((l) => [l.no, l.pos + l.dur]));
    const S = Object.fromEntries(scenes.map((s) => [s.name, s.dur]));
    const j = c.gate ? c.gate({C, P: P_, E: E_, S, total}) : null;
    if (j?.length) hasil.hening = j.map((w) => P.hening(mp4, w));
  }
  /* Visual hanya bila diminta (`motion check`). Render MCP memanggil periksa tanpa ini: dia
     sudah membayar satu Chromium untuk render, dan laporannya untuk pelanggan tidak memuatnya. */
  if (visual) {
    try {
      const titik = titikVisual(c);
      const sel = typeof c.periksa?.kapsi === 'string' ? c.periksa.kapsi : undefined;
      hasil.visual = {titik: titik.length, masalah: await R.periksaVisual(c.src, c.komposisi, titik, {kapsi: sel})};
    } catch (e) {
      hasil.visual = {titik: 0, masalah: [], galat: e.message.split('\n')[0]};
    }
  }
  // Tidak ada gunanya menranskrip stem yang memang senyap, dan itu tetap satu panggilan berbayar.
  if (lengkap && c.vo.length) hasil.transkrip = await P.transkripStem(path.join(c.stem, 'vo.wav'), c.vo.map((l) => l.text), c.suara?.bahasa || 'id');
  return hasil;
}

/* ── biaya ─────────────────────────────────────────────────────────────────── */
export async function biaya(sejakMs) {
  const j = await EL.pemakaian(sejakMs, Date.now());
  const per = {}; let total = 0;
  for (const [k, v] of Object.entries(j.usage || {})) { const s = v.reduce((a, b) => a + b, 0); per[k] = s; total += s; }
  const usd = total * HARGA.usdPerKredit;
  return {per, total, usd, rupiah: Math.round(usd * HARGA.rupiahPerUsd), kuota: await EL.kuota()};
}
