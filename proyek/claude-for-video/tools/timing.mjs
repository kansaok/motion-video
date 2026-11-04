// Tulis src/timing.js: posisi tiap baris VO (detik absolut) untuk kapsi dan beat animasi komposisi.
// Jalankan sesudah `motion apply` (butuh timeline.json dan aset/vo yang sudah ada — tidak ada generate).
import {writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as Pipa from '../../../lib/pipa.mjs';
import * as K from '../../../lib/komposisi.mjs';
import * as T from '../../../lib/tata.mjs';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const c = await Pipa.muat(dir);
await Pipa.vo(c);
const {C, total} = K.jadwal(K.bacaScenes(c.htmlUtama));
T.tempatkan(c.vo, C, c.tata || {});
const data = c.vo.map((l) => ({no: l.no, pos: +l.pos.toFixed(3), dur: +l.dur.toFixed(3)}));
writeFileSync(path.join(c.src, 'timing.js'), `window.VO_TIMING = ${JSON.stringify(data)};\n`);
console.log(`  timing.js ✓ ${data.length} baris · total ${total.toFixed(2)}s`);
for (const l of data) console.log(`  vo-${l.no}  ${l.pos.toFixed(2)} → ${(l.pos + l.dur).toFixed(2)}`);
