// Penyimpanan proyek per pelanggan, unggahan, dan config JSON -> objek config `lib/pipa.mjs`.
import {existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync, statSync, lstatSync, unlinkSync, renameSync} from 'node:fs';
import {randomBytes, createHmac, timingSafeEqual} from 'node:crypto';
import path from 'node:path';
import {ff, durasi} from '../lib/ff.mjs';
import {hostPrivat} from '../lib/jaring.mjs';
import {akhirSuara} from '../lib/pipa.mjs';
import * as K from '../lib/komposisi.mjs';
import {hitung} from './ekspresi.mjs';

export const DATA = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), 'data'));
export const BATAS = {
  proyek: Number(process.env.MAKS_PROYEK || 20),
  detik: Number(process.env.MAKS_DETIK || 180),
  unduhMb: Number(process.env.MAKS_UNDUH_MB || 50),
  retensiHari: Number(process.env.RETENSI_HARI || 14),
};

const ID = /^[a-z0-9][a-z0-9-]{2,40}$/;
const dirUser = (uid) => path.join(DATA, 'u', String(Number(uid)));

/* Satu-satunya pintu dari nama berkas kiriman Claude ke disk. Berkas di luar folder proyek,
   berkas tersembunyi, dan jejak kerja mesin (.asli/.terap/.kunci) tidak boleh disentuh dari luar —
   menimpanya membuat `apply` berikutnya bekerja dari isi yang tidak pernah ditulis siapa pun. */
export function jalurAman(akar, rel) {
  const r = String(rel || '').replace(/\\/g, '/').replace(/^\/+/, '');
  if (!r || r.split('/').some((s) => s === '..' || s.startsWith('.'))) throw new Error(`nama berkas tidak sah: ${rel}`);
  if (/\.(asli|terap|kunci)$/i.test(r)) throw new Error(`berkas kerja mesin tidak boleh ditulis: ${rel}`);
  const f = path.resolve(akar, r);
  if (!f.startsWith(path.resolve(akar) + path.sep)) throw new Error(`nama berkas tidak sah: ${rel}`);
  return f;
}

export function buka(uid, id) {
  if (!ID.test(String(id))) throw new Error(`id proyek tidak sah: ${id}`);
  const dir = path.join(dirUser(uid), id);
  if (!existsSync(path.join(dir, 'meta.json'))) throw new Error(`proyek "${id}" tidak ada — lihat daftar_proyek`);
  return {dir, src: path.join(dir, 'src'), aset: path.join(dir, 'aset'), meta: JSON.parse(readFileSync(path.join(dir, 'meta.json'), 'utf8'))};
}

export function sentuh(p, ubah = {}) {
  Object.assign(p.meta, ubah, {diubah: new Date().toISOString()});
  writeFileSync(path.join(p.dir, 'meta.json'), JSON.stringify(p.meta, null, 1));
}

export function daftar(uid) {
  const d = dirUser(uid);
  if (!existsSync(d)) return [];
  return readdirSync(d).filter((n) => existsSync(path.join(d, n, 'meta.json')))
    .map((n) => JSON.parse(readFileSync(path.join(d, n, 'meta.json'), 'utf8')))
    .sort((a, b) => String(b.diubah).localeCompare(String(a.diubah)));
}

export function buat(uid, nama) {
  const ada = daftar(uid);
  if (ada.length >= BATAS.proyek) {
    throw new Error(`batas ${BATAS.proyek} proyek tercapai — hapus proyek lama dengan hapus_proyek`);
  }
  const slug = String(nama || 'video').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28) || 'video';
  const id = `${slug}-${randomBytes(3).toString('hex')}`;
  const dir = path.join(dirUser(uid), id);
  for (const d of ['src', 'aset/vo', 'aset/sfx']) mkdirSync(path.join(dir, d), {recursive: true});
  const meta = {id, nama: String(nama || id), user_id: Number(uid), dibuat: new Date().toISOString(), diubah: new Date().toISOString()};
  writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 1));
  return meta;
}

export function hapus(uid, id) {
  const p = buka(uid, id);
  rmSync(p.dir, {recursive: true, force: true});
}

/* Proyek yang tidak diubah lebih dari RETENSI_HARI dihapus. MP4 dan frame cepat memenuhi disk
   VPS, dan pelanggan menyimpan hasil akhirnya sendiri lewat tautan unduh. */
export function bersihkan() {
  const u = path.join(DATA, 'u');
  if (!existsSync(u)) return 0;
  const batas = Date.now() - BATAS.retensiHari * 86400e3;
  let n = 0;
  for (const uid of readdirSync(u)) {
    for (const id of readdirSync(path.join(u, uid))) {
      const m = path.join(u, uid, id, 'meta.json');
      if (existsSync(m) && statSync(m).mtimeMs < batas) { rmSync(path.join(u, uid, id), {recursive: true, force: true}); n++; }
    }
  }
  return n;
}

/* Isi ulang komposisi berarti `.asli`-nya basi. `apply` selalu menerapkan dari `.asli`, jadi
   tanpa ini komposisi yang baru ditulis diam-diam diganti versi pertamanya di render berikutnya. */
export function tulisSrc(p, rel, isi) {
  const f = jalurAman(p.src, rel);
  mkdirSync(path.dirname(f), {recursive: true});
  writeFileSync(f, isi);
  for (const x of [`${f}.asli`, `${f}.terap`]) if (existsSync(x)) unlinkSync(x);
  return f;
}

/* `unzip` membuat symlink apa adanya. Zip berisi `a.html -> /proc/self/environ` lalu
   `baca_berkas a.html` membocorkan kunci servis, dan server statis render ikut menyajikannya.
   Semua penulisan lain membuat berkas biasa, jadi cukup dibersihkan sesudah impor. */
export function buangSymlink(d) {
  let n = 0;
  for (const e of readdirSync(d)) {
    const f = path.join(d, e), st = lstatSync(f);
    if (st.isSymbolicLink()) { unlinkSync(f); n++; } else if (st.isDirectory()) n += buangSymlink(f);
  }
  return n;
}

export function berkasSrc(p) {
  const out = [];
  const jalan = (d, rel = '') => {
    if (!existsSync(d)) return;
    for (const e of readdirSync(d, {withFileTypes: true})) {
      if (e.name.startsWith('.') || /\.(asli|terap)$/.test(e.name)) continue;
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) jalan(path.join(d, e.name), r);
      else out.push({berkas: r, kb: Math.ceil(statSync(path.join(d, e.name)).size / 1024)});
    }
  };
  jalan(p.src);
  return out;
}

/* ── unduhan dari URL ─────────────────────────────────────────────────────────
   Server ini mengambil URL kiriman pelanggan, jadi URL ke jaringan dalam (metadata cloud,
   API bimp, container tetangga) harus ditolak — termasuk lewat redirect. */
export async function unduh(url, maksMb = BATAS.unduhMb) {
  let u = String(url);
  for (let lompat = 0; lompat < 4; lompat++) {
    const x = new URL(u);
    if (x.protocol !== 'https:') throw new Error('hanya URL https yang diterima');
    if (await hostPrivat(x.hostname)) throw new Error(`host ${x.hostname} mengarah ke jaringan privat`);
    const r = await fetch(u, {redirect: 'manual', signal: AbortSignal.timeout(120000)});
    if (r.status >= 300 && r.status < 400 && r.headers.get('location')) { u = new URL(r.headers.get('location'), u).toString(); continue; }
    if (!r.ok) throw new Error(`unduh gagal: HTTP ${r.status}`);
    const n = Number(r.headers.get('content-length') || 0);
    if (n > maksMb * 1048576) throw new Error(`berkas ${Math.round(n / 1048576)} MB, batas ${maksMb} MB`);
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > maksMb * 1048576) throw new Error(`berkas lebih dari ${maksMb} MB`);
    return buf;
  }
  throw new Error('terlalu banyak redirect');
}

export async function ambilIsi({url, base64}) {
  if (url) return unduh(url);
  if (base64) {
    const buf = Buffer.from(String(base64).replace(/^data:[^,]+,/, ''), 'base64');
    if (buf.length > BATAS.unduhMb * 1048576) throw new Error(`berkas lebih dari ${BATAS.unduhMb} MB`);
    return buf;
  }
  throw new Error('isi url atau base64');
}

/* ── audio ────────────────────────────────────────────────────────────────── */
const NAMA = /^[a-z0-9][a-z0-9-]{0,40}$/;

/* VO dari connector diproses SAMA PERSIS dengan VO yang digenerate mesin (lihat Pipa.vo):
   awal dipotong di -58 dB supaya letupan konsonan tidak hilang, ekor dipotong di jendela
   terakhir di atas -45 dB + 0,25 dtk peluruhan. `tempo` menggantikan parameter speed yang
   tidak ada di connector; pitch tetap. */
export function simpanVo(p, no, buf, tempo = 1) {
  const n = String(Number(no)).padStart(2, '0');
  if (!(Number(no) >= 1 && Number(no) <= 99)) throw new Error('nomor VO 1-99');
  const mentah = path.join(p.aset, 'vo', `.vo-${n}.mentah`);
  const awal = path.join(p.aset, 'vo', `.vo-${n}.awal.wav`);
  const out = path.join(p.aset, 'vo', `vo-${n}.mp3`);
  writeFileSync(mentah, buf);
  try {
    const t = Math.min(2, Math.max(0.5, Number(tempo) || 1));
    ff(['-i', mentah, '-af', `${t !== 1 ? `atempo=${t},` : ''}silenceremove=start_periods=1:start_duration=0.01:start_threshold=-58dB:detection=peak`, awal]);
    const panjang = Math.min(durasi(awal), akhirSuara(awal) + 0.25);
    if (panjang < 0.1) throw new Error(`VO-${no} senyap sesudah trim — periksa berkasnya`);
    ff(['-i', awal, '-af', `atrim=0:${panjang.toFixed(3)},afade=t=in:st=0:d=0.015,`
      + `afade=t=out:st=${Math.max(0, panjang - 0.08).toFixed(3)}:d=0.08`, out]);
  } finally {
    for (const f of [mentah, awal]) if (existsSync(f)) unlinkSync(f);
  }
  // cache normalisasi mixer dikunci ke waktu ubah, tetapi hapus juga supaya tidak ada sisa
  const norm = path.join(p.aset, 'vo', 'norm', `vo-${n}.mp3`);
  if (existsSync(norm)) unlinkSync(norm);
  return {berkas: `vo-${n}.mp3`, detik: +durasi(out).toFixed(3)};
}

export function simpanAudio(p, jenis, nama, buf) {
  if (!NAMA.test(String(nama))) throw new Error('nama: huruf kecil, angka, tanda minus');
  const out = jenis === 'sfx' ? path.join(p.aset, 'sfx', `${nama}.mp3`) : path.join(p.aset, `${nama}.mp3`);
  const mentah = `${out}.mentah`;
  writeFileSync(mentah, buf);
  try {
    // Kepala musik dipangkas di -45 dB, SFX di -58 dB — alasannya ada di Pipa.musik dan Pipa.sfx.
    const ambang = jenis === 'sfx' ? 'start_duration=0.01:start_threshold=-58dB' : 'start_duration=0.02:start_threshold=-45dB';
    ff(['-i', mentah, '-af', `silenceremove=start_periods=1:${ambang}:detection=peak`, '-ar', '44100', '-b:a', '192k', out]);
  } finally { if (existsSync(mentah)) unlinkSync(mentah); }
  const norm = jenis === 'sfx' ? path.join(p.aset, 'sfx', 'norm', `${nama}.mp3`) : out.replace(/\.mp3$/, '-norm.mp3');
  if (existsSync(norm)) unlinkSync(norm);
  return {berkas: path.relative(p.aset, out), detik: +durasi(out).toFixed(3)};
}

export function asetAda(p) {
  const ls = (d, re) => (existsSync(d) ? readdirSync(d).filter((f) => re.test(f)) : []);
  return {
    vo: ls(path.join(p.aset, 'vo'), /^vo-\d+\.mp3$/),
    sfx: ls(path.join(p.aset, 'sfx'), /^[^.].*\.mp3$/).map((f) => f.replace(/\.mp3$/, '')),
    musik: ls(p.aset, /^[^.].*\.mp3$/).filter((f) => !/-norm\.mp3$/.test(f)).map((f) => f.replace(/\.mp3$/, '')),
  };
}

/* ── config JSON -> objek config Pipa ────────────────────────────────────────
   Bentuknya sama dengan motion.config.mjs (README), kecuali semua yang dulu fungsi kini
   berupa data atau ekspresi teks (ekspresi.mjs). */
export function bacaConfig(p) {
  const f = path.join(p.dir, 'config.json');
  if (!existsSync(f)) throw new Error('config belum disimpan — panggil simpan_config dulu');
  return JSON.parse(readFileSync(f, 'utf8'));
}

export function periksaConfig(p, j) {
  const html = jalurAman(p.src, j.komposisi);
  if (!existsSync(html)) throw new Error(`komposisi "${j.komposisi}" tidak ada di src — tulis dulu dengan tulis_berkas`);
  const scenes = K.bacaScenes(html);
  const nama = new Set(scenes.map((s) => s.name));
  for (const l of j.vo || []) if (!nama.has(l.sc)) throw new Error(`VO-${l.no}: scene "${l.sc}" tidak ada di OM_SCENES (${[...nama].join(', ')})`);
  for (const f of [...(j.jugaTulis || []), ...(j.jsx ? [j.jsx] : [])]) {
    if (!existsSync(jalurAman(p.src, f))) throw new Error(`berkas "${f}" tidak ada di src`);
  }
  for (const [n, sumber] of j.sfx || []) {
    if (!NAMA.test(n)) throw new Error(`nama SFX "${n}" tidak sah`);
    if (!/^@(stok\/[\w.-]+|luar)$/.test(sumber)) throw new Error(`SFX "${n}": sumber harus "@stok/<id>" atau "@luar"`);
  }
  for (const m of j.musik || []) {
    if (!NAMA.test(m.nama)) throw new Error(`nama musik "${m.nama}" tidak sah`);
    // Scene yang salah ketik membuat amplop NaN, dan ffmpeg membisukan bus musik tanpa galat.
    for (const [sc] of m.titik || []) if (!nama.has(sc)) throw new Error(`musik ${m.nama}: titik scene "${sc}" tidak ada`);
  }
  const no = (j.vo || []).map((l) => l.no);
  if (new Set(no).size !== no.length) throw new Error('nomor VO ganda');
  if (!(j.cue || []).length) throw new Error('cue SFX minimal satu — mixer butuh bus SFX');
  const pakai = new Set((j.sfx || []).map(([n]) => n));
  const asing = [...new Set((j.cue || []).map((c) => c.nama))].filter((n) => !pakai.has(n));
  if (asing.length) throw new Error(`cue memakai SFX yang tidak ada di daftar sfx: ${asing.join(', ')}`);
  const total = scenes.reduce((a, s) => a + s.dur, 0);
  if (total > BATAS.detik) throw new Error(`komposisi ${total.toFixed(1)} dtk, batas ${BATAS.detik} dtk`);
  return {scenes, total};
}

export function keConfig(p, j) {
  const ling = (C, P, E, S, total) => ({C, P, E, S, total});
  const at = (x, L, apa) => { try { return hitung(x, L); } catch (e) { throw new Error(`${apa}: ${e.message}`); } };
  const c = {
    ...j,
    nama: p.meta.id,
    dir: p.dir, src: p.src, aset: p.aset, stem: path.join(p.dir, 'stem'),
    htmlUtama: jalurAman(p.src, j.komposisi),
    keluaran: `${p.meta.id}.mp4`,
    suara: {luar: true},
    vo: (j.vo || []).map((l) => ({no: l.no, sc: l.sc, off: l.off ?? 0, text: l.text})),
    sfx: (j.sfx || []).map(([n, s]) => [n, s]),
    cue: ({C, P, E, S, total}) => (j.cue || []).map((x, i) => ({
      at: at(x.at, ling(C, P, E, S, total), `cue ke-${i + 1}`),
      nama: x.nama, gain: x.gain ?? 0.3, nada: x.nada || 0, pan: x.pan || 0,
    })),
    musik: (j.musik || []).map((m) => ({
      nama: m.nama, luar: true, titik: m.titik?.length ? m.titik : [[K.bacaScenes(jalurAman(p.src, j.komposisi))[0].name, 0, -20]],
      lewati: m.lewati || 0,
      mulai: m.mulai === undefined ? 0 : ({C, total}) => at(m.mulai, ling(C, {}, {}, {}, total), `musik ${m.nama}.mulai`),
      fadeOut: m.fadeOut ? ({C, total}) => [at(m.fadeOut[0], ling(C, {}, {}, {}, total), `musik ${m.nama}.fadeOut`), Number(m.fadeOut[1])] : undefined,
    })),
    gate: j.gate?.length ? ({C, P, E, S, total}) => j.gate.map(([a, b], i) => [
      at(a, ling(C, P, E, S, total), `gate ke-${i + 1}`), at(b, ling(C, P, E, S, total), `gate ke-${i + 1}`)]) : undefined,
    periksa: {busTitik: []},
  };
  // lib/render menggabungkan jalur relatif dengan folder proyek; di sini jalurnya relatif ke src/.
  if (j.sampul?.gambar) {
    const g = j.sampul.gambar;
    c.sampul = {...j.sampul, gambar: typeof g === 'string' ? jalurAman(p.src, g)
      : Object.fromEntries(Object.entries(g).map(([k, f]) => [k, jalurAman(p.src, f)]))};
  }
  for (const d of [`${c.aset}/vo`, `${c.aset}/sfx`, c.stem]) mkdirSync(d, {recursive: true});
  return c;
}

/* ── tautan unduh bertanda tangan ─────────────────────────────────────────── */
const RAHASIA = () => process.env.UNDUH_RAHASIA || 'ganti-rahasia-ini';
const tanda = (s) => createHmac('sha256', RAHASIA()).update(s).digest('base64url');

export function tautan(uid, id, berkas, hari = 7) {
  const exp = Math.floor(Date.now() / 1000) + hari * 86400;
  const jalur = `${Number(uid)}/${id}/${encodeURIComponent(berkas)}`;
  const basis = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
  return `${basis}/unduh/${jalur}?exp=${exp}&sig=${tanda(`${Number(uid)}/${id}/${berkas}:${exp}`)}`;
}

export function cekTautan(uid, id, berkas, exp, sig) {
  if (!(Number(exp) > Date.now() / 1000)) return false;
  const a = Buffer.from(tanda(`${Number(uid)}/${id}/${berkas}:${exp}`));
  const b = Buffer.from(String(sig || ''));
  return a.length === b.length && timingSafeEqual(a, b);
}

export const tulisAtomik = (f, isi) => { writeFileSync(`${f}.tmp`, isi); renameSync(`${f}.tmp`, f); };
