#!/usr/bin/env node
// Ukur panjang tiap berkas VO (aset/vo/vo-NN.mp3) dan simpan di sumber/durasi.json (kunci: teks baris).
// Dipakai jadwal.mjs untuk menaruh offset animasi bagian baru tepat di ujung kalimat sebelumnya.
// Urutan: `node motion plan` (buat VO) -> `node ukur.mjs` -> `node bangun.mjs` -> `node motion plan` lagi.
import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const {default: cfg} = await import('./motion.config.mjs');
const out = {};
for (const l of cfg.vo) {
  const f = path.join(DIR, 'aset', 'vo', `vo-${String(l.no).padStart(2, '0')}.mp3`);
  const d = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim());
  out[l.text] = Math.round(d * 100) / 100;
}
writeFileSync(path.join(DIR, 'sumber', 'durasi.json'), JSON.stringify(out, null, 1));
console.log(`${Object.keys(out).length} baris diukur`);
