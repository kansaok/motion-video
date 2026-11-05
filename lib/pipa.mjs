// Rantai kerja: zip -> src -> vo -> rencana -> terap -> sfx -> musik -> mix -> render -> periksa.
// Tiap langkah bisa dijalankan sendiri dan aman diulang; yang sudah ada tidak digenerate lagi.
import {readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, copyFileSync, statSync, rmSync} from 'node:fs';
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
import {segar, tandai} from './kunci.mjs';

// Tahap yang tinggal di berkas sendiri, diekspor ulang supaya `Pipa.*` tetap satu pintu.
export {akhirSuara, pangkasVo, ucapkan, vo} from './vo.mjs';
export {sfx} from './sfx.mjs';
export {musik, periksaBed, laporBed} from './musik.mjs';
export {tulisSubtitel} from './subtitel.mjs';

/**
 * @param {string} dirProyek
 * @param {{kering?: boolean}} [o]  `kering`: jangan membuat folder aset/stem (P6-11)
 * @returns {Promise<import('./tipe.mjs').Config>}
 */
export async function muat(dirProyek, {kering = false} = {}) {
  const f = ['motion.config.mjs', 'config.mjs'].map((n) => path.join(dirProyek, n)).find(existsSync);
  if (!f) throw new Error(`config tidak ada di ${dirProyek} (butuh motion.config.mjs)`);
  const cfg = (await import(`${f}?t=${Date.now()}`)).default;
  cfg.dir = dirProyek;
  cfg.src = path.join(dirProyek, cfg.src || 'src');
  cfg.aset = path.join(dirProyek, 'aset');
  cfg.stem = path.join(dirProyek, 'stem');
  cfg.htmlUtama = path.join(cfg.src, cfg.komposisi);
  if (!kering) for (const d of [`${cfg.aset}/vo`, `${cfg.aset}/sfx`, cfg.stem]) mkdirSync(d, {recursive: true});
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
 * @param {{matikan?: 'sfx' | 'musik' | 'vo', keluar?: string, stem?: boolean, paksa?: boolean}} [opsi]
 *   `keluar`/`stem: false`: mix tambahan ke berkas lain tanpa menyentuh master.wav dan stem/
 *   `paksa`: abaikan cache master
 */
export async function mix(c, {matikan, keluar, stem, paksa = false} = {}) {
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
  const o = {
    dir: c.aset, C, total, vo: c.vo, cue, musik: c.musik || [],
    gate: c.gate ? c.gate({C, P: P_, E: E_, S, total}) : null,
    matikan, ...(c.mixer || {}), ...(keluar ? {keluar} : {}), ...(stem === false ? {stem} : {}),
  };
  // Mix tambahan (A/B) tidak pernah memakai atau menulis cache master.
  if (matikan || keluar || stem === false) return M.rakit(o);

  /* Cache master (P8-08). Render MCP dulu menjalankan mix penuh (ratakan semua sumber + sampai
     40 lintasan loudness) di SETIAP render, termasuk render ulang sesudah revisi visual saja,
     `scene`, dan `frames: 60`. Kuncinya memuat seluruh opsi rakit plus ISI tiap sumber dan kode
     mixer (`M.kunciMix`), dan berlaku hanya bila master DAN ketiga stem masih ada (`check` dan
     laporan membaca stem; retensi MCP membuangnya sesudah 24 jam). */
  const master = path.join(c.aset, 'master.wav'), fHasil = `${master}.hasil.json`;
  const kunci = M.kunciMix(o);
  const stemAda = ['vo', 'sfx', 'mus'].every((s) => existsSync(path.join(c.stem, `${s}.wav`)));
  if (!paksa && stemAda && existsSync(fHasil) && segar(master, kunci)) {
    return {...JSON.parse(readFileSync(fHasil, 'utf8')), master, cache: true};
  }
  /* Kunci dan hasil lama dibuang SEBELUM mix: rakit menimpa master.wav di tengah jalan, dan mix
     yang gagal dengan keduanya masih di tempat terbaca segar begitu config dikembalikan
     (test/mix-cache.test.mjs). Salah satunya sudah cukup; dua-duanya supaya tidak ada sisa basi. */
  rmSync(`${master}.kunci`, {force: true});
  rmSync(fHasil, {force: true});
  const r = M.rakit(o);
  writeFileSync(fHasil, JSON.stringify({durasi: r.durasi, lufs: r.lufs, dbtp: r.dbtp, cue: r.cue, vo: r.vo}));
  tandai(master, kunci);
  return {...r, cache: false};
}

/* ── render ────────────────────────────────────────────────────────────────── */
// 'Iklan CTWA Konektor 4x5.dc.html' -> 'iklan-ctwa-konektor-4x5'
/** @param {string} f */
export const namaPendek = (f) => path.basename(f).replace(/\.(dc\.)?html?$/i, '').replace(/\W+/g, '-').toLowerCase();

/* ── varian rasio (P6-03) ──────────────────────────────────────────────────────
   Satu master audio, satu timeline, beberapa komposisi (9:16, 4:5, 1:1, 16:9). Komposisi utama
   selalu ikut; `varian` menambah sisanya. Nama keluaran bawaan sama dengan `--komposisi`.
   @param {import('./tipe.mjs').Config} c */
export function daftarVarian(c) {
  const utama = {komposisi: c.komposisi, keluaran: c.keluaran || `${c.nama}.mp4`, sampul: c.sampul};
  const lain = (c.varian || []).filter((v) => v.komposisi !== c.komposisi).map((v) => ({
    komposisi: v.komposisi, keluaran: v.keluaran || `${namaPendek(v.komposisi)}.mp4`, sampul: v.sampul ?? c.sampul}));
  const semua = [utama, ...lain];
  const ganda = semua.map((v) => v.keluaran).filter((k, i, a) => a.indexOf(k) !== i);
  if (ganda.length) throw new Error(`dua varian menulis ke berkas yang sama: ${[...new Set(ganda)].join(', ')}`);
  return semua;
}

/* Durasi scene tiap varian harus sama dengan timeline hasil `plan`. Komposisi yang lupa
   dimasukkan ke `jugaTulis` masih memakai durasi brief: videonya berjalan dengan durasi lama
   di atas audio yang baru, dan itu baru terdengar sesudah render beberapa menit.
   @param {import('./tipe.mjs').Config} c @param {{komposisi: string}} v */
export function cekScenesVarian(c, v) {
  const f = path.join(c.src, v.komposisi);
  if (!existsSync(f)) return `komposisi tidak ada: ${v.komposisi}`;
  const t = bacaTimeline(c), s = K.bacaScenes(f);
  const beda = t.filter((x) => { const y = s.find((z) => z.name === x.name); return !y || Math.abs(y.dur - x.dur) > 0.005; });
  if (beda.length || s.length !== t.length) {
    return `OM_SCENES ${v.komposisi} beda dengan timeline (${beda.map((x) => x.name).join(', ') || 'jumlah scene'}): `
      + 'tambahkan ke `jugaTulis` lalu `motion apply`';
  }
  return null;
}

/* Putusan satu MP4 varian; ambangnya sama dengan `motion check`.
   @param {{lufs: number, dbtp: number} | null} mp4 @param {{rasio: number} | null} sampul
   @param {number} detik @param {number} total */
export function nilaiVarian(mp4, sampul, detik, total) {
  const masalah = [];
  if (mp4 && Math.abs(mp4.lufs - (-14)) > 1.0) masalah.push(`${mp4.lufs} LUFS di luar -14 ±1`);
  if (mp4 && mp4.dbtp > -1.0) masalah.push(`${mp4.dbtp} dBTP melanggar -1,0`);
  if (sampul && sampul.rasio < 0.75) masalah.push(`frame 0 kontras ${(sampul.rasio * 100).toFixed(0)}% (< 75%)`);
  if (Math.abs(detik - total) > 0.1) masalah.push(`durasi ${detik.toFixed(2)}s, timeline ${total.toFixed(2)}s`);
  return masalah;
}

/** @typedef {{komposisi: string, keluaran: string, masalah: string[], galat?: string, rasio?: string,
 *   lebar?: number, tinggi?: number, detik?: number, sampul?: string | null,
 *   mp4?: {lufs: number, dbtp: number}, kontras?: number | null}} HasilVarian */

/** @param {import('./tipe.mjs').Config} c @param {Record<string, any>} [opsi] @returns {Promise<HasilVarian[]>} */
export async function renderVarian(c, opsi = {}) {
  const {total} = K.jadwal(bacaTimeline(c));
  /** @type {HasilVarian[]} */
  const hasil = [];
  for (const v of daftarVarian(c)) {
    const h = {komposisi: v.komposisi, keluaran: v.keluaran};
    const salah = cekScenesVarian(c, v);
    if (salah) { hasil.push({...h, galat: salah, masalah: []}); continue; }
    try {
      (opsi.log || console.log)(`varian ${v.komposisi}…`);
      const r = await render({...c, komposisi: v.komposisi, keluaran: v.keluaran, sampul: v.sampul}, opsi);
      const detik = durasi(r.keluaran);
      const mp4 = P.ringkas(r.keluaran), sp = P.sampul(r.keluaran);
      // Nama yang BENAR-BENAR ditulis: dengan `draf` itu `-draf.mp4`, bukan nama yang diminta.
      hasil.push({...h, keluaran: path.relative(c.dir, r.keluaran), rasio: R.labelRasio(r.lebar, r.tinggi), lebar: r.lebar, tinggi: r.tinggi, detik,
        sampul: r.sampul, mp4, kontras: sp?.rasio ?? null,
        masalah: opsi.batasFrame ? [] : nilaiVarian(mp4, sp, detik, total)});
    } catch (e) {
      // Satu varian yang gagal tidak menghentikan sisanya; laporannya menyebut yang mana.
      hasil.push({...h, galat: String(e.message).split('\n')[0], masalah: []});
    }
  }
  return hasil;
}

/** @param {HasilVarian[]} h */
export function laporVarian(h) {
  const baris = [`  ${'rasio'.padEnd(5)} ${'piksel'.padEnd(9)} ${'detik'.padStart(6)} ${'LUFS'.padStart(6)} ${'dBTP'.padStart(5)} ${'sampul'.padStart(6)}  berkas`];
  for (const x of h) {
    if (x.galat) { baris.push(`  ✖ ${x.komposisi}: ${x.galat}`); continue; }
    baris.push(`  ${x.rasio.padEnd(5)} ${`${x.lebar}x${x.tinggi}`.padEnd(9)} ${x.detik.toFixed(2).padStart(6)} `
      + `${String(x.mp4.lufs).padStart(6)} ${String(x.mp4.dbtp).padStart(5)} ${x.kontras === null ? '     -' : `${(x.kontras * 100).toFixed(0)}%`.padStart(6)}`
      + `  ${x.masalah.length ? '✖' : '✓'} ${x.keluaran}${x.sampul ? ' + sampul' : ''}`);
    for (const m of x.masalah) baris.push(`        ✖ ${m}`);
  }
  const gagal = h.filter((x) => x.galat || x.masalah.length).length;
  const rasio = h.filter((x) => x.rasio).map((x) => x.rasio);
  const kurang = ['9x16', '4x5', '1x1', '16x9'].filter((r) => !rasio.includes(r));
  baris.push(`  ${h.length - gagal}/${h.length} varian lolos${kurang.length ? ` · belum ada: ${kurang.join(', ')}` : ''}`);
  return baris.join('\n');
}
/* Rentang satu scene (P6-02), dari timeline hasil `plan` — sama dengan yang sudah ditulis ke
   komposisi dan dipakai mixer. `scene` = nama, atau nomor urut mulai 1.
   @param {import('./tipe.mjs').Config} c @param {string | number} scene */
export function rentangScene(c, scene) {
  const scenes = bacaTimeline(c);
  const {C} = K.jadwal(scenes);
  const s = scenes.find((x) => x.name === String(scene))
    ?? (/^\d+$/.test(String(scene)) ? scenes[Number(scene) - 1] : undefined);
  if (!s) throw new Error(`scene "${scene}" tidak ada; pilihan: ${scenes.map((x, i) => `${i + 1} ${x.name}`).join(', ')}`);
  return {dari: C[s.name], sampai: C[s.name] + s.dur, nama: s.name};
}

/* Nama berkas potongan: tidak pernah sama dengan MP4 penuh, supaya render parsial untuk
   memeriksa satu scene tidak menimpa video yang mungkin sudah dikirim.
   @param {string} keluaran @param {{dari?: number, sampai?: number}} r */
export const namaPotongan = (keluaran, r) => keluaran.replace(/\.mp4$/i, '')
  + `-potong-${(r.dari ?? 0).toFixed(2)}-${r.sampai === undefined ? 'akhir' : r.sampai.toFixed(2)}.mp4`;

/* Nama berkas draf (P8-07). Dipasang di `render` di bawah, satu pintu untuk CLI, MCP, dan varian:
   draf 540p yang ditulis ke nama MP4 penuh akan menimpa video yang mungkin sudah dikirim.
   @param {string} keluaran */
export const namaDraf = (keluaran) => (/-draf\.mp4$/i.test(keluaran) ? keluaran : `${keluaran.replace(/\.mp4$/i, '')}-draf.mp4`);

/** Opsi `R.render` dari config; terpisah supaya aturan nama draf bisa diuji tanpa Chromium.
 * @param {import('./tipe.mjs').Config} c @param {Record<string, any>} [opsi] */
export function opsiRender(c, opsi = {}) {
  const keluaran = opsi.keluaran || path.join(c.dir, c.keluaran || `${c.nama}.mp4`);
  return {
    dirSrc: c.src, berkas: c.komposisi,
    audio: path.join(c.aset, 'master.wav'),
    sampul: c.sampul, dirProyek: c.dir,
    ...opsi,
    keluaran: opsi.draf ? namaDraf(keluaran) : keluaran,
  };
}

/** @param {import('./tipe.mjs').Config} c @param {Record<string, any>} [opsi] */
export async function render(c, opsi = {}) {
  return R.render(/** @type {any} */ (opsiRender(c, opsi)));
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
    /* Mix tanpa SFX ditulis ke berkasnya sendiri; master.wav dan stem/ tidak pernah disentuh.
       Dulu master ditimpa lalu dipulihkan dengan mix ulang, tanpa `finally`: check yang
       dihentikan di tengah meninggalkan master tanpa SFX untuk render berikutnya. Sekalian
       hemat satu mix penuh (lima putaran loudness). */
    const tanpa = path.join(c.dir, '.master-tanpa-sfx.wav');
    try {
      await mix(c, {matikan: 'sfx', keluar: tanpa, stem: false});
      hasil.bus = P.busHidup(path.join(c.aset, 'master.wav'), tanpa, titik);
    } finally { rmSync(tanpa, {force: true}); }
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
