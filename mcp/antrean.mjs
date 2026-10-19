/* Antrean render. Satu render menghabiskan semua inti CPU dan beberapa tab Chromium, jadi
   render dijalankan bergiliran (RENDER_PARALEL, bawaan 1) — dua render bersamaan di VPS kecil
   membuat renderer Chromium mati dengan "Target crashed" (lihat VIEWPORT di lib/render.mjs).
   Tiap pelanggan hanya boleh punya satu render yang menunggu atau berjalan. */
import {randomBytes} from 'node:crypto';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import * as Pipa from '../lib/pipa.mjs';
import * as K from '../lib/komposisi.mjs';
import * as T from '../lib/tata.mjs';
import * as Pr from './proyek.mjs';

const PARALEL = Number(process.env.RENDER_PARALEL || 1);
const tugas = new Map();      // id -> tugas
const antre = [];
let jalan = 0;

const simpanStatus = (t) => {
  try { writeFileSync(path.join(t.dir, 'render.json'), JSON.stringify({...t, dir: undefined}, null, 1)); } catch { /* proyek sudah dihapus */ }
};

export function status(uid, id) {
  const t = tugas.get(id);
  if (t && t.uid === Number(uid)) return {...t, dir: undefined, urutan: t.status === 'antre' ? antre.indexOf(t) + 1 : undefined};
  return null;
}

// Status terakhir sebuah proyek, juga sesudah server dinyalakan ulang.
export function statusProyek(p) {
  const f = path.join(p.dir, 'render.json');
  if (!existsSync(f)) return null;
  const t = JSON.parse(readFileSync(f, 'utf8'));
  const hidup = tugas.get(t.id);
  if (hidup) return status(hidup.uid, hidup.id);
  // Tugas di render.json yang tidak ada di memori berarti mati bersama proses lama.
  if (t.status === 'antre' || t.status === 'jalan') return {...t, status: 'gagal', galat: 'server dinyalakan ulang saat render — jalankan render lagi'};
  return t;
}

/* Cuplik ditunggu langsung oleh panggilan alat, jadi tidak boleh ikut antre di belakang render
   beberapa menit. Jalurnya sendiri, dibatasi dua Chromium sekaligus. */
let cuplikJalan = 0;
const cuplikTunggu = [];
export async function cuplikGiliran(fn) {
  if (cuplikJalan >= 2) await new Promise((r) => cuplikTunggu.push(r));
  cuplikJalan++;
  try { return await fn(); } finally { cuplikJalan--; cuplikTunggu.shift()?.(); }
}

export function kirim(uid, p, opsi) {
  const sedang = [...tugas.values()].find((t) => t.uid === Number(uid) && (t.status === 'antre' || t.status === 'jalan'));
  if (sedang) throw new Error(`masih ada render ${sedang.id} (${sedang.status}) untuk proyek ${sedang.proyek} — tunggu selesai`);
  const t = {
    id: `r-${randomBytes(4).toString('hex')}`, uid: Number(uid), proyek: p.meta.id, dir: p.dir,
    status: 'antre', langkah: 'antre', mulai: null, selesai: null, dibuat: new Date().toISOString(),
    opsi, hasil: null, galat: null,
  };
  tugas.set(t.id, t);
  antre.push(t);
  simpanStatus(t);
  setImmediate(putar);
  return t;
}

async function putar() {
  while (jalan < PARALEL && antre.length) {
    const t = antre.shift();
    jalan++;
    kerjakan(t).finally(() => { jalan--; setImmediate(putar); });
  }
}

async function kerjakan(t) {
  t.status = 'jalan'; t.mulai = new Date().toISOString();
  const langkah = (s) => { t.langkah = s; simpanStatus(t); console.log(`[render ${t.id}] ${t.proyek}: ${s}`); };
  try {
    const p = Pr.buka(t.uid, t.proyek);
    const j = Pr.bacaConfig(p);
    Pr.periksaConfig(p, j);
    const c = Pr.keConfig(p, j);

    langkah('sfx');
    await Pipa.sfx(c);
    langkah('rencana');
    const a = await Pipa.terap(c);
    const laporan = T.laporan(a.scenes, Object.fromEntries(K.bacaScenes(`${c.htmlUtama}.asli`).map((s) => [s.name, s.dur])), c.vo, a.scenes.reduce((x, s) => x + s.dur, 0));

    /* timing.js: posisi tiap baris VO untuk komposisi yang menggambar kapsi dan beat dari
       window.VO_TIMING. Ditulis sesudah apply, dari timeline yang sama dengan mixer. */
    const {C, total} = K.jadwal(K.bacaScenes(c.htmlUtama));
    T.tempatkan(c.vo, C, c.tata || {});
    const vt = c.vo.map((l) => ({no: l.no, pos: +l.pos.toFixed(3), dur: +l.dur.toFixed(3)}));
    writeFileSync(path.join(c.src, 'timing.js'), `window.VO_TIMING = ${JSON.stringify(vt)};\n`);
    if (total > Pr.BATAS.detik) throw new Error(`video jadi ${total.toFixed(1)} dtk sesudah VO, batas ${Pr.BATAS.detik} dtk`);

    langkah('mix');
    const m = await Pipa.mix(c);
    langkah('render');
    const r = await Pipa.render(c, {batasFrame: t.opsi?.frames});
    langkah('periksa');
    const h = await Pipa.periksa(c, {lengkap: false});

    t.hasil = {
      detik: r.detik, lebar: r.lebar, tinggi: r.tinggi,
      mp4: Pr.tautan(t.uid, t.proyek, path.basename(r.keluaran)),
      sampul: r.sampul ? Pr.tautan(t.uid, t.proyek, path.basename(r.sampul)) : null,
      laporan, vo: vt,
      audio: {lufs: m.lufs, dbtp: m.dbtp, mp4_lufs: h.mp4?.lufs, mp4_dbtp: h.mp4?.dbtp},
      sampul_kontras: h.sampul ? +(h.sampul.rasio * 100).toFixed(0) : null,
      masking: c.vo.length ? h.masking : null,
    };
    t.status = 'selesai';
    Pr.sentuh(p);
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
