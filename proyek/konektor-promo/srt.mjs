// Tulis subtitle .srt dari posisi VO yang sebenarnya (sesudah `motion plan`/`mix`).
// Brief meminta subtitle diunggah ke YouTube, bukan dibakar ke video.
// Jalankan: node proyek/konektor-promo/srt.mjs  → <keluaran>.srt di samping MP4
import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import * as Pipa from '../../lib/pipa.mjs';
import * as K from '../../lib/komposisi.mjs';
import * as T from '../../lib/tata.mjs';

const dir = path.dirname(new URL(import.meta.url).pathname);
const c = await Pipa.muat(dir);
await Pipa.vo(c);
const {C} = K.jadwal(JSON.parse(readFileSync(path.join(dir, 'timeline.json'), 'utf8')));
T.tempatkan(c.vo, C, c.tata || {});

const jam = (s) => {
  const ms = Math.round(s * 1000), p = (n, k = 2) => String(n).padStart(k, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
// Baris di atas 42 karakter dipecah dua di spasi yang paling dekat ke tengah.
const pecah = (t) => {
  if (t.length <= 42) return t;
  const sp = [...t.matchAll(/ /g)].map((m) => m.index);
  const i = sp.reduce((a, b) => (Math.abs(b - t.length / 2) < Math.abs(a - t.length / 2) ? b : a));
  return `${t.slice(0, i)}\n${t.slice(i + 1)}`;
};
const srt = c.vo.map((l, i) => {
  const akhir = Math.min(l.pos + l.dur + 0.4, c.vo[i + 1] ? c.vo[i + 1].pos - 0.05 : Infinity);
  return `${i + 1}\n${jam(l.pos)} --> ${jam(akhir)}\n${pecah(l.text)}\n`;
}).join('\n');
const out = path.join(dir, (c.keluaran || `${c.nama}.mp4`).replace(/\.mp4$/i, '.srt'));
writeFileSync(out, srt);
console.log(`  ✓ ${out} — ${c.vo.length} baris`);
