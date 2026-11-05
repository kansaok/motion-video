/* Subtitle dan naskah akhir (P6-04): `.srt`, `.vtt`, dan `-naskah.txt` di samping MP4.

   Posisi baris diambil dari penempatan yang SAMA dengan mixer dan timing.js (`tata.tempatkan`
   atas timeline hasil plan). `bin/srt.mjs` lama memakai `awal scene + off`: di mode `alir`, atau
   setiap kali `jangkar` mendorong baris mundur karena baris sebelumnya panjang, subtitle-nya
   muncul sebelum suaranya. Teks yang ditampilkan adalah naskah (`text`), bukan ejaan lafal.

   Baris panjang dipecah di akhir kalimat lalu di koma, maksimal 84 karakter (dua baris 42,
   batas umum keterbacaan subtitle); waktunya dibagi menurut jumlah karakter. */
import {existsSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {durasi} from './ff.mjs';
import * as K from './komposisi.mjs';
import * as T from './tata.mjs';
import {bacaTimeline} from './timeline.mjs';

const MAKS = 84, BARIS = 42;

/** @param {string} teks */
export function pecah(teks) {
  // Pemisah kalimat hanya sesudah spasi, jadi "konektor.id" tetap utuh.
  const kalimat = teks.split(/(?<=[.!?])\s+/).map((p) => p.trim()).filter(Boolean);
  const out = [];
  for (const k of kalimat) {
    if (k.length <= MAKS) { out.push(k); continue; }
    let cur = '';
    for (const w of k.split(/(?<=,)\s+/)) {
      if (`${cur} ${w}`.trim().length > MAKS && cur) { out.push(cur.trim()); cur = w; } else cur = `${cur} ${w}`.trim();
    }
    if (cur) out.push(cur);
  }
  return out;
}

/** @param {string} s */
export function bungkus(s) {
  if (s.length <= BARIS) return s;
  const tengah = s.lastIndexOf(' ', Math.ceil(s.length / 2) + 6);
  return tengah > 0 ? `${s.slice(0, tengah)}\n${s.slice(tengah + 1)}` : s;
}

/** @param {Array<{pos: number, dur: number, text: string}>} vo @returns {Array<[number, number, string]>} */
export function isyarat(vo) {
  /** @type {Array<[number, number, string]>} */
  const out = [];
  for (const l of vo) {
    const bagian = pecah(l.text), n = bagian.reduce((a, b) => a + b.length, 0);
    let t = l.pos;
    for (const b of bagian) { const d = (l.dur * b.length) / n; out.push([t, t + d, b]); t += d; }
  }
  return out;
}

const ms = (x) => Math.max(0, Math.round(x * 1000));
const jam = (x, pemisah) => {
  const m = ms(x);
  const p = (n, k = 2) => String(n).padStart(k, '0');
  return `${p(Math.floor(m / 3600000))}:${p(Math.floor(m / 60000) % 60)}:${p(Math.floor(m / 1000) % 60)}${pemisah}${p(m % 1000, 3)}`;
};
/** @param {Array<[number, number, string]>} q */
export const srt = (q) => q.map(([a, b, t], i) => `${i + 1}\n${jam(a, ',')} --> ${jam(b, ',')}\n${bungkus(t)}\n`).join('\n');
/** @param {Array<[number, number, string]>} q */
export const vtt = (q) => `WEBVTT\n\n${q.map(([a, b, t]) => `${jam(a, '.')} --> ${jam(b, '.')}\n${bungkus(t)}\n`).join('\n')}`;

/* Tulis ketiga berkas untuk proyek. Durasi baris dari berkas VO bila belum diisi tahap
   sebelumnya (CLI `render` memuat config baru, MCP sudah mengisinya lewat `terap`).
   @param {import('./tipe.mjs').Config} c @returns {{srt: string, vtt: string, naskah: string, isyarat: number}} */
export function tulisSubtitel(c) {
  if (!c.vo?.length) throw new Error('tidak ada baris VO: subtitle tidak dibuat');
  for (const l of c.vo) {
    if (l.dur !== undefined) continue;
    const f = path.join(c.aset, 'vo', `vo-${String(l.no).padStart(2, '0')}.mp3`);
    if (!existsSync(f)) throw new Error(`VO-${l.no} belum ada (${path.basename(f)}): subtitle butuh durasi tiap baris`);
    l.dur = durasi(f);
  }
  const {C} = K.jadwal(bacaTimeline(c));
  T.tempatkan(c.vo, C, c.tata || {});
  const q = isyarat(c.vo);
  const dasar = path.join(c.dir, (c.keluaran || `${c.nama}.mp4`).replace(/\.mp4$/i, ''));
  // Akhiran bahasa (`.id.srt`) dikenali YouTube dan pemutar sebagai label trek.
  const bahasa = c.suara?.bahasa || 'id';
  const f = {srt: `${dasar}.${bahasa}.srt`, vtt: `${dasar}.${bahasa}.vtt`, naskah: `${dasar}-naskah.txt`};
  writeFileSync(f.srt, srt(q));
  writeFileSync(f.vtt, vtt(q));
  writeFileSync(f.naskah, `${c.vo.map((l) => l.text).join('\n')}\n`);
  return {...f, isyarat: q.length};
}
