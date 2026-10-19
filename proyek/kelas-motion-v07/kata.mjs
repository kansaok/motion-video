/* Cetak timestamp tiap kata VO, dari awal scene barisnya. Dipakai untuk mengisi BEAT di
   basis.mjs dan kelas-motion-v07.jsx. Jalankan sesudah `motion plan`:
   node proyek/kelas-motion-v07/kata.mjs <hook> */
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import '../../lib/env.mjs';
import * as Pp from '../../lib/pipa.mjs';
import * as K from '../../lib/komposisi.mjs';
import * as T from '../../lib/tata.mjs';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), process.argv[2]);
const c = await Pp.muat(dir);
await Pp.vo(c);
const {C} = K.jadwal(JSON.parse(readFileSync(path.join(dir, 'timeline.json'), 'utf8')));
T.tempatkan(c.vo, C, c.tata);
for (const l of c.vo) {
  const fd = new FormData();
  fd.append('model_id', 'scribe_v1'); fd.append('language_code', 'id');
  fd.append('file', new Blob([readFileSync(l.file)]), 'a.mp3');
  const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {method: 'POST', headers: {'xi-api-key': process.env.ELEVENLABS_API_KEY}, body: fd});
  const w = (await r.json()).words.filter((x) => x.type === 'word');
  const off = l.pos - C[l.sc];
  console.log(`VO-${l.no} ${l.sc} mulai ${C[l.sc].toFixed(2)} · baris ${off.toFixed(2)}–${(off + l.dur).toFixed(2)}`);
  console.log('  ' + w.map((x) => `${x.text}@${(off + x.start).toFixed(2)}`).join(' '));
}
