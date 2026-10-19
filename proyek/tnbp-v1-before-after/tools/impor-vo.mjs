// Masukkan VO hasil connector ElevenLabs (aset/vo-luar/vo-NN.mp3) ke cache motion engine (aset/vo/),
// dengan trim yang sama seperti Pipa.vo dan `.kunci` yang cocok, supaya `motion plan` tidak generate ulang.
import {writeFileSync, existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as Pipa from '../../../lib/pipa.mjs';
import {ff, durasi} from '../../../lib/ff.mjs';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const c = await Pipa.muat(dir);
const s = c.suara;
// Connector tidak punya parameter speed; tempo dinaikkan di sini (pitch tetap) supaya video muat 25-30 dtk.
const TEMPO = 1.12;
for (const [i, l] of c.vo.entries()) {
  const no = String(l.no).padStart(2, '0');
  const mentah = path.join(c.aset, 'vo-luar', `vo-${no}.mp3`);
  if (!existsSync(mentah)) throw new Error(`tidak ada ${mentah}`);
  const out = path.join(c.aset, 'vo', `vo-${no}.mp3`);
  const awalan = `${out}.awal.wav`;
  ff(['-i', mentah, '-af', `atempo=${TEMPO},silenceremove=start_periods=1:start_duration=0.01:start_threshold=-58dB:detection=peak`, awalan]);
  const panjang = Math.min(durasi(awalan), Pipa.akhirSuara(awalan) + 0.25);
  ff(['-i', awalan, '-af', `atrim=0:${panjang.toFixed(3)},afade=t=in:st=0:d=0.015,afade=t=out:st=${Math.max(0, panjang - 0.08).toFixed(3)}:d=0.08`, out]);
  (await import('node:fs')).unlinkSync(awalan);
  const kunci = {
    teks: Pipa.ucapkan(l.text, c.lafal), maks: l.maks, dengar: l.dengar && String(l.dengar), coba: l.coba,
    voice: l.voice || s.id, model: s.model, bahasa: s.bahasa, seed: s.seed,
    stability: l.stability ?? s.stability, similarity: s.similarity, style: l.style ?? s.style,
    speed: typeof s.speed === 'function' ? s.speed(l) : s.speed,
    sebelum: c.vo[i - 1] && Pipa.ucapkan(c.vo[i - 1].text, c.lafal),
    sesudah: c.vo[i + 1] && Pipa.ucapkan(c.vo[i + 1].text, c.lafal),
  };
  writeFileSync(`${out}.kunci`, JSON.stringify(kunci));
  console.log(`  vo-${no} ✓ ${durasi(mentah).toFixed(2)}s → ${durasi(out).toFixed(2)}s`);
}
