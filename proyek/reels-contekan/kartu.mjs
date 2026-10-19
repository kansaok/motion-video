/* Hitung jadwal 15 kartu kuis dari SATU baris VO kuis (vo-05), lalu tulis ke kartu.json dan ke
   KARTU di funnel-contekan.jsx (dan .asli-nya). Jalankan sesudah `motion plan`, lalu `plan` lagi.

   Kata tahap dicari di transkrip ber-timestamp. Harus tepat 15; kalau tidak, gagal dan
   sebutkan apa yang terbaca.
   Kartu bernama (1-6): muncul di awal kata sesudah tahap sebelumnya (awal namanya).
   Kartu cepat (7-15): muncul 0,85 detik sebelum mendarat, tapi tidak sebelum kartu sebelumnya
   mendarat. Semua mendarat tepat di kata tahapnya. */
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import '../../lib/env.mjs';
import * as Pp from '../../lib/pipa.mjs';
import * as K from '../../lib/komposisi.mjs';
import * as T from '../../lib/tata.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const c = await Pp.muat(DIR);
await Pp.vo(c);
const {C} = K.jadwal(JSON.parse(readFileSync(path.join(DIR, 'timeline.json'), 'utf8')));
T.tempatkan(c.vo, C, c.tata);
const kuis = c.vo.find((l) => l.no === 5);

const fd = new FormData();
fd.append('model_id', 'scribe_v1'); fd.append('language_code', 'id');
fd.append('file', new Blob([readFileSync(kuis.file)]), 'a.mp3');
const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {method: 'POST', headers: {'xi-api-key': process.env.ELEVENLABS_API_KEY}, body: fd});
const kata = (await r.json()).words.filter((x) => x.type === 'word').map((w) => ({...w, t: w.text.toLowerCase().replace(/[^a-z]/g, '')}));
/* Tahap dieja per huruf ("T O F"), jadi STT bisa menulisnya satu kata ("TOF") atau tiga huruf
   terpisah ("T", "O", "F"). Keduanya dikenali; yang dipakai awal hurufnya yang pertama. */
const tahap = [];
for (let i = 0; i < kata.length; i++) {
  if (/^[tmb]of$/.test(kata[i].t)) { tahap.push({...kata[i], i}); continue; }
  if (/^[tmb]$/.test(kata[i].t) && kata[i + 1]?.t === 'o' && kata[i + 2]?.t === 'f') { tahap.push({...kata[i], i: i + 2}); i += 2; }
}
if (tahap.length !== 15) throw new Error(`kata tahap terbaca ${tahap.length}, harus 15: ${kata.map((w) => w.text).join(' ')}`);

const RAPID = 6, off = kuis.pos - C.Sortir;
const kartu = [];
tahap.forEach((w, n) => {
  const land = off + w.start;
  let a;
  if (n < RAPID) a = off + (n === 0 ? kata[0].start : kata[tahap[n - 1].i + 1].start);
  else a = Math.max(kartu[n - 1][1] + 0.05, land - 0.85);
  kartu.push([+a.toFixed(2), +land.toFixed(2)]);
});

writeFileSync(path.join(DIR, 'kartu.json'), JSON.stringify(kartu));
const teks = `const KARTU = ${JSON.stringify(kartu).replace(/,/g, ', ')};`;
for (const f of ['funnel-contekan.jsx', 'funnel-contekan.jsx.asli'].map((x) => path.join(c.src, x)).filter(existsSync)) {
  const isi = readFileSync(f, 'utf8');
  if (!/const KARTU = \[.*\];/.test(isi)) throw new Error(`KARTU tidak ditemukan di ${f}`);
  writeFileSync(f, isi.replace(/const KARTU = \[.*\];/, teks));
}
console.log(kartu.map(([a, b], i) => `${i + 1}:${a}→${b}`).join('  '));
