// Cek cepat akhirSuara(): kata pendek di ujung tetap utuh, letupan sesudah senyap dibuang.
// Jalankan: node bin/cek-akhir-suara.mjs
import {execFileSync} from 'node:child_process';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import assert from 'node:assert';
import {akhirSuara} from '../lib/pipa.mjs';

const dir = mkdtempSync(path.join(tmpdir(), 'akhir-'));
const buat = (nama, jeda, ujung) => {
  const f = path.join(dir, `${nama}.wav`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'sine=f=300:d=1',
    '-f', 'lavfi', '-i', `anullsrc=r=44100:cl=mono:d=${jeda}`, '-f', 'lavfi', '-i', `sine=f=2000:d=${ujung}`,
    '-filter_complex', '[0][1][2]concat=n=3:v=0:a=1', '-ar', '44100', f]);
  return f;
};
const konsonan = akhirSuara(buat('konsonan', 0.05, 0.06));
assert(Math.abs(konsonan - 1.11) < 0.02, `konsonan akhir terbuang: ${konsonan}`);
const letupan = akhirSuara(buat('letupan', 0.5, 0.05));
assert(Math.abs(letupan - 1.0) < 0.02, `letupan tidak dibuang: ${letupan}`);
console.log('akhirSuara ✓', {konsonan, letupan});
