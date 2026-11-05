/* P8-09: pemeriksaan dan mix lebih ringan tanpa mengubah angkanya. Audio sintetis ffmpeg. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {hening} from '../lib/periksa.mjs';
import {loudness, lufs, puncakSejati, volume} from '../lib/ff.mjs';
import {rakit} from '../lib/mix.mjs';

const ff = (...a) => execFileSync('ffmpeg', ['-y', '-v', 'error', ...a]);
const sementara = () => mkdtempSync(path.join(os.tmpdir(), 'motion-ringan-'));

test('hening: rentang senyap ditemukan dari satu dekode, di MP4 AAC', () => {
  const dir = sementara();
  try {
    // Nada 0-2,0 dtk, senyap 2,0-2,6, nada 2,6-4.
    const mp4 = path.join(dir, 'v.mp4');
    ff('-f', 'lavfi', '-i', 'sine=frequency=330:duration=2', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo:d=0.6',
      '-f', 'lavfi', '-i', 'sine=frequency=330:duration=1.4', '-filter_complex', '[0]aresample=48000,aformat=channel_layouts=stereo[a];'
      + '[2]aresample=48000,aformat=channel_layouts=stereo[c];[a][1][c]concat=n=3:v=0:a=1', '-c:a', 'aac', '-b:a', '192k', mp4);
    const h = hening(mp4, [2.05, 2.55]);
    assert.ok(h.lolos, JSON.stringify(h));
    assert.ok(Math.abs(h.dapat[0] - 2.0) <= 0.06 && Math.abs(h.dapat[1] - 2.6) <= 0.06, `dapat ${h.dapat}`);
    // Jendela yang berisi nada: tidak ada senyap sepanjang 70% permintaan.
    assert.equal(hening(mp4, [0.5, 1.5]).lolos, false);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

test('hening: berkas yang tidak terbaca GAGAL dengan sebab, bukan lolos sebagai "senyap"', () => {
  const dir = sementara();
  try {
    const rusak = path.join(dir, 'rusak.mp4');
    writeFileSync(rusak, 'bukan video');
    const h = hening(rusak, [1, 1.5]);
    assert.equal(h.lolos, false);
    assert.match(h.galat, /ffmpeg gagal membaca rusak\.mp4/);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

test('lufs tanpa true peak memberi angka yang sama; loudness satu lintasan = dua fungsi terpisah', () => {
  const dir = sementara();
  try {
    const f = path.join(dir, 'a.wav');
    ff('-f', 'lavfi', '-i', 'anoisesrc=d=6:c=pink:a=0.3:seed=3', f);
    const l = loudness(f);
    assert.equal(lufs(f), l.lufs);
    assert.equal(puncakSejati(f), l.dbtp);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

test('rakit: perataan -6 dBFS di filtergraph, tanpa berkas norm, dan berkas norm lama dibuang', () => {
  const dir = sementara();
  try {
    const A = path.join(dir, 'aset');
    mkdirSync(path.join(A, 'sfx', 'norm'), {recursive: true});
    mkdirSync(path.join(A, 'vo', 'norm'), {recursive: true});
    writeFileSync(path.join(A, 'sfx', 'norm', 'lama.mp3'), 'sisa');
    // Dua SFX dengan puncak sangat berbeda (-30 dan -3 dBFS), gain cue sama: sesudah perataan
    // keduanya harus setara di stem SFX.
    ff('-f', 'lavfi', '-i', 'sine=frequency=1000:duration=0.6', '-af', 'volume=-30dB', '-ar', '44100', path.join(A, 'sfx', 'pelan.mp3'));
    ff('-f', 'lavfi', '-i', 'sine=frequency=1000:duration=0.6', '-af', 'volume=-3dB', '-ar', '44100', path.join(A, 'sfx', 'keras.mp3'));
    const bed = path.join(A, 'bed.mp3');
    ff('-f', 'lavfi', '-i', 'sine=frequency=110:duration=6', '-ar', '44100', bed);
    writeFileSync(path.join(A, 'bed-norm.mp3'), 'sisa');
    rakit({dir: A, total: 5, C: {A: 0}, vo: [], gate: null,
      cue: [{at: 1, nama: 'pelan', gain: 0.4}, {at: 3, nama: 'keras', gain: 0.4}],
      musik: [{nama: 'bed', file: bed, titik: [['A', 0, -24]]}]});
    const stem = path.join(dir, 'stem', 'sfx.wav');
    const a = volume(stem, {mulai: 1.1, lama: 0.4}).puncak, b = volume(stem, {mulai: 3.1, lama: 0.4}).puncak;
    assert.ok(a !== null && b !== null && Math.abs(a - b) <= 1.5, `pelan ${a} dB, keras ${b} dB`);
    assert.ok(!existsSync(path.join(A, 'sfx', 'norm')) && !existsSync(path.join(A, 'vo', 'norm')), 'folder norm masih ada');
    assert.ok(!existsSync(path.join(A, 'bed-norm.mp3')), 'bed-norm.mp3 masih ada');
  } finally { rmSync(dir, {recursive: true, force: true}); }
});
