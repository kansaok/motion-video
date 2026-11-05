// Penyimpanan proyek per pelanggan, unggahan, dan config JSON -> objek config `lib/pipa.mjs`.
import {existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync, statSync, lstatSync, unlinkSync, renameSync} from 'node:fs';
import https from 'node:https';
import {randomBytes, createHmac, timingSafeEqual} from 'node:crypto';
import path from 'node:path';
import {ff, durasi} from '../lib/ff.mjs';
import {alamatPublik} from '../lib/jaring.mjs';
import {pangkasVo} from '../lib/vo.mjs';
import {salinSrc, salinAsetNonVo} from '../lib/salin.mjs';
import {BATAS_BAWAAN, menitRenderBawaan, SFX, MUSIK} from '../lib/konstanta.mjs';
import * as K from '../lib/komposisi.mjs';
import {hitung} from './ekspresi.mjs';
import {migrasiConfig} from './skema.mjs';

export const DATA = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), 'data'));
const angkaPositif = (nilai, bawaan) => Number.isFinite(Number(nilai)) && Number(nilai) > 0 ? Number(nilai) : bawaan;
export function batasDariEnv(env = process.env) {
  const B = BATAS_BAWAAN, detik = angkaPositif(env.MAKS_DETIK, B.detik);
  return {
    proyek: angkaPositif(env.MAKS_PROYEK, B.proyek),
    detik,
    unduhMb: angkaPositif(env.MAKS_UNDUH_MB, B.unduhMb),
    ekstrakMb: angkaPositif(env.MAKS_EKSTRAK_MB, B.ekstrakMb),
    kuotaMb: angkaPositif(env.KUOTA_MB, B.kuotaMb),
    retensiHari: angkaPositif(env.RETENSI_HARI, B.retensiHari),
    renderMenit: angkaPositif(env.RENDER_BATAS_MENIT, menitRenderBawaan(detik)),
    renderMacetDetik: angkaPositif(env.RENDER_BATAS_MACET_DETIK, B.renderMacetDetik),
    antreMaks: angkaPositif(env.ANTRE_MAKS, B.antreMaks),
  };
}
export const BATAS = batasDariEnv();

const ID = /^[a-z0-9][a-z0-9-]{2,40}$/;
const dirUser = (uid) => path.join(DATA, 'u', String(Number(uid)));

/* Satu-satunya pintu dari nama berkas kiriman Claude ke disk. Berkas di luar folder proyek,
   berkas tersembunyi, dan jejak kerja mesin (.asli/.terap/.kunci) tidak boleh disentuh dari luar —
   menimpanya membuat `apply` berikutnya bekerja dari isi yang tidak pernah ditulis siapa pun. */
export function jalurAman(akar, rel) {
  const masukan = String(rel || '');
  if (path.isAbsolute(masukan) || path.win32.isAbsolute(masukan)) throw new Error(`nama berkas tidak sah: ${rel}`);
  const r = masukan.replace(/\\/g, '/');
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

/* Salin proyek untuk bahasa/angle lain (P8-12): komposisi asli + SFX + musik, tanpa VO dan config
   (config diganti pemanggil lewat simpanConfig). Gagal di tengah = proyek baru dihapus.
   @param {number} uid @param {{src: string, aset: string}} asal @param {string} nama */
export function salin(uid, asal, nama) {
  const meta = buat(uid, nama);
  const p = buka(uid, meta.id);
  try {
    salinSrc(asal.src, p.src);
    salinAsetNonVo(asal.aset, p.aset);
    periksaKuota(p);
  } catch (e) { hapus(uid, meta.id); throw e; }
  return meta;
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

/* Jangan mengikuti symlink saat menghitung: symlink dari ZIP tidak boleh membuat kuota
   terlihat kecil, atau mengarahkan pembacaan ke berkas host di luar data pelanggan. */
export function ukuranPohon(d) {
  if (!existsSync(d)) return 0;
  let total = 0;
  for (const e of readdirSync(d, {withFileTypes: true})) {
    const f = path.join(d, e.name), st = lstatSync(f);
    if (st.isSymbolicLink()) continue;
    if (st.isDirectory()) total += ukuranPohon(f);
    else if (st.isFile()) total += st.size;
  }
  return total;
}

export function pemakaianAkun(uid) { return ukuranPohon(dirUser(uid)); }

export function periksaKuota(p, tambahan = 0) {
  const dipakai = pemakaianAkun(p.meta.user_id);
  const batas = BATAS.kuotaMb * 1048576;
  if (dipakai + Math.max(0, tambahan) > batas) {
    throw new Error(`kuota akun ${BATAS.kuotaMb} MB terlampaui (terpakai ${Math.ceil(dipakai / 1048576)} MB)`);
  }
}

/* Proyek yang tidak diubah lebih dari RETENSI_HARI dihapus. MP4 dan frame cepat memenuhi disk
   VPS, dan pelanggan menyimpan hasil akhirnya sendiri lewat tautan unduh. */
/** Jumlah akun yang menyentuh setidaknya satu proyek dalam `hari` terakhir (dari mtime meta.json). */
export function akunAktif(hari) {
  const u = path.join(DATA, 'u');
  if (!existsSync(u)) return 0;
  const batas = Date.now() - hari * 86400e3;
  return readdirSync(u).filter((uid) => readdirSync(path.join(u, uid)).some((id) => {
    const m = path.join(u, uid, id, 'meta.json');
    return existsSync(m) && statSync(m).mtimeMs >= batas;
  })).length;
}

/* Hasil antara yang dibuat ulang oleh setiap render: stem mix (WAV ukuran penuh, beberapa ratus
   MB untuk video 3 menit), master.wav, dan gambar cuplikan. Dibuang sesudah sehari tidak
   disentuh, jauh sebelum proyeknya sendiri dihapus. Yang TIDAK dibuang: src, config, aset unggahan
   (VO berbayar), dan MP4/sampul yang tautannya masih berlaku. */
const RINGAN = ['stem', 'cuplikan', path.join('aset', 'master.wav')];
const sedangDirender = (dir) => {
  try { return ['antre', 'jalan'].includes(JSON.parse(readFileSync(path.join(dir, 'render.json'), 'utf8')).status); }
  catch { return false; } // render.json belum ada/rusak: tidak ada render yang perlu dilindungi
};

/** Hari tersisa sebelum proyek dihapus retensi, dihitung dari sentuhan terakhir. */
export function sisaHari(p, sekarang = Date.now()) {
  const m = path.join(p.dir, 'meta.json');
  const sentuhan = existsSync(m) ? statSync(m).mtimeMs : sekarang;
  return Math.max(0, Math.ceil((sentuhan + BATAS.retensiHari * 86400e3 - sekarang) / 86400e3));
}

export function bersihkan({sekarang = Date.now(), ringanJam = 24} = {}) {
  const u = path.join(DATA, 'u'), hasil = {proyek: 0, ringan: 0, byte: 0};
  if (!existsSync(u)) return hasil;
  const batas = sekarang - BATAS.retensiHari * 86400e3, batasRingan = sekarang - ringanJam * 3600e3;
  for (const uid of readdirSync(u)) {
    for (const id of readdirSync(path.join(u, uid))) {
      const dir = path.join(u, uid, id), m = path.join(dir, 'meta.json');
      if (!existsSync(m)) continue;
      const diubah = statSync(m).mtimeMs;
      if (diubah < batas) { rmSync(dir, {recursive: true, force: true}); hasil.proyek++; continue; }
      if (diubah >= batasRingan || sedangDirender(dir)) continue;
      for (const r of RINGAN) {
        const f = path.join(dir, r);
        if (!existsSync(f)) continue;
        hasil.byte += lstatSync(f).isDirectory() ? ukuranPohon(f) : lstatSync(f).size; hasil.ringan++;
        rmSync(f, {recursive: true, force: true});
      }
    }
  }
  return hasil;
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
function ambilHttps(x, alamat, batasByte) {
  return new Promise((selesai, gagal) => {
    const req = https.request({hostname: alamat, port: Number(x.port) || 443, path: `${x.pathname}${x.search}`,
      method: 'GET', servername: x.hostname, headers: {Host: x.host}, timeout: 120_000}, (res) => {
      const panjang = Number(res.headers['content-length'] || 0);
      if (panjang > batasByte) { req.destroy(); gagal(new Error(`berkas ${Math.round(panjang / 1048576)} MB, batas ${Math.floor(batasByte / 1048576)} MB`)); return; }
      const bagian = []; let ukuran = 0;
      res.on('data', (b) => {
        ukuran += b.length;
        if (ukuran > batasByte) { req.destroy(new Error(`berkas lebih dari ${Math.floor(batasByte / 1048576)} MB`)); return; }
        bagian.push(b);
      });
      res.once('end', () => selesai({status: res.statusCode || 0, lokasi: res.headers.location, isi: Buffer.concat(bagian)}));
      res.once('error', gagal);
    });
    req.once('timeout', () => req.destroy(new Error('unduh melewati batas waktu')));
    req.once('error', gagal);
    req.end();
  });
}

export async function unduh(url, maksMb = BATAS.unduhMb) {
  let u = String(url);
  const batasByte = maksMb * 1048576;
  for (let lompat = 0; lompat < 4; lompat++) {
    const x = new URL(u);
    if (x.protocol !== 'https:') throw new Error('hanya URL https yang diterima');
    const [alamat] = await alamatPublik(x.hostname);
    const r = await ambilHttps(x, alamat, batasByte);
    if (r.status >= 300 && r.status < 400 && r.lokasi) { u = new URL(r.lokasi, u).toString(); continue; }
    if (r.status < 200 || r.status >= 300) throw new Error(`unduh gagal: HTTP ${r.status}`);
    return r.isi;
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

/* VO dari connector memakai pemangkasan yang sama dengan jalur TTS CLI. `tempo` menggantikan
   parameter speed yang tidak ada di connector; pitch tetap. */
export function simpanVo(p, no, buf, tempo = 1) {
  const n = String(Number(no)).padStart(2, '0');
  if (!(Number(no) >= 1 && Number(no) <= 99)) throw new Error('nomor VO 1-99');
  const mentah = path.join(p.aset, 'vo', `.vo-${n}.mentah`);
  const out = path.join(p.aset, 'vo', `vo-${n}.mp3`);
  writeFileSync(mentah, buf);
  try {
    pangkasVo(mentah, out, {tempo, label: `VO-${no}`});
  } finally {
    if (existsSync(mentah)) unlinkSync(mentah);
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
    // Ambang yang sama dengan jalur generator; alasannya ada di lib/konstanta.mjs.
    const k = jenis === 'sfx' ? SFX : MUSIK;
    const ambang = `start_duration=${k.durasiAwal}:start_threshold=${k.ambangAwal}`;
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
  return migrasiConfig(JSON.parse(readFileSync(f, 'utf8')));
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
const RAHASIA = () => {
  const rahasia = process.env.UNDUH_RAHASIA;
  if (!rahasia) throw new Error('UNDUH_RAHASIA belum diset');
  return rahasia;
};
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
