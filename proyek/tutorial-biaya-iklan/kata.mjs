// Helper: word-level transcript per VO line -> aset/kata.json. Used to land animation cues on spoken words.
import '../../lib/env.mjs';
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, 'aset', 'kata.json');
const hasil = existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : {};
for (let no = 1; no <= 10; no++) {
  const nn = String(no).padStart(2, '0');
  const f = path.join(dir, 'aset', 'vo', `vo-${nn}.mp3`);
  const kunci = readFileSync(`${f}.kunci`, 'utf8');
  if (hasil[no] && hasil[no].kunci === kunci) continue;
  const fd = new FormData();
  fd.append('model_id', 'scribe_v1'); fd.append('language_code', 'id');
  fd.append('timestamps_granularity', 'word');
  fd.append('file', new Blob([readFileSync(f)]), 'a.mp3');
  const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {method: 'POST', headers: {'xi-api-key': process.env.ELEVENLABS_API_KEY}, body: fd});
  if (!r.ok) throw new Error(`${no}: ${r.status} ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
  hasil[no] = {kunci, dur, text: j.text, words: (j.words || []).filter((w) => w.type === 'word').map((w) => [w.text, +w.start.toFixed(2), +w.end.toFixed(2)])};
  console.error(`vo-${nn} ${dur.toFixed(2)}s: ${j.text}`);
}
writeFileSync(out, JSON.stringify(hasil, null, 1));
for (const no of Object.keys(hasil)) console.log(no, hasil[no].dur.toFixed(2), hasil[no].words.map((w) => `${w[0]}@${w[1]}-${w[2]}`).join(' '));
