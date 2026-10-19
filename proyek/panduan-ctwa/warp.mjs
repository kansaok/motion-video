#!/usr/bin/env node
// Hitung peta waktu (warp) tiap segmen sumber: waktu komposisi -> waktu animasi sumber.
// Tujuan: tiap baris VO jatuh pada gambarnya walau VO v4 lebih panjang dari VO tutorial sumber.
//   node warp.mjs     (butuh timeline.json dari `motion plan` dan aset/vo/*.mp3; tidak membuat TTS)
// Hasil: sumber/warp.json = {<segmen>: [[t, s], ...]}; t = detik sejak awal segmen di komposisi,
// s = detik animasi sumber sejak awal segmen (sama dengan skala sumber/peta.json).
// Antara dua titik animasi berjalan linear; sesudah titik terakhir laju 1. Laju dibatasi 0,75 sampai 1,35
// dan selisih ke detik sumber maksimal 0,25 dtk, supaya animasi tidak terasa dipercepat atau diperlambat.
import {readFileSync, writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as T from '../../lib/tata.mjs';
import {BAB} from './jadwal.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const c = (await import('./motion.config.mjs')).default;
const tl = JSON.parse(readFileSync(path.join(DIR, 'timeline.json'), 'utf8'));
let a = 0; const C = {};
for (const s of tl) { C[s.name] = a; a += s.dur; }
for (const l of c.vo) {
  l.dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0',
    path.join(DIR, 'aset', 'vo', `vo-${String(l.no).padStart(2, '0')}.mp3`)]).toString();
}
T.tempatkan(c.vo, C, c.tata);

const SLACK = 0.25, LMIN = 0.75, LMAX = 1.35;
const hasil = {}, lapor = [];
for (const b of BAB) for (const g of b.segmen) {
  const baris = c.vo.filter((l) => l.sc === g.id).sort((x, y) => x.off - y.off);
  const titik = [[0, 0]];
  for (const l of baris) {
    const t = +(l.pos - C[g.id]).toFixed(3);
    const [tp, sp] = titik.at(-1);
    if (t <= tp) continue;
    const lo = Math.max(sp + LMIN * (t - tp), l.off - SLACK), hi = Math.min(sp + LMAX * (t - tp), l.off + SLACK);
    const s = lo <= hi ? Math.min(Math.max(l.off, lo), hi) : (l.off < sp + LMIN * (t - tp) ? sp + LMIN * (t - tp) : sp + LMAX * (t - tp));
    titik.push([t, +s.toFixed(3)]);
    lapor.push(`${g.id} vo-${l.no}: VO ${t.toFixed(2)} dtk, gambar ${l.off.toFixed(2)} -> selisih sesudah warp ${(l.off - s).toFixed(2)} dtk (gambar lebih lambat dari suara jika positif)`);
  }
  hasil[g.id] = titik;
}
writeFileSync(path.join(DIR, 'sumber', 'warp.json'), JSON.stringify(hasil));
console.log(lapor.join('\n'));
