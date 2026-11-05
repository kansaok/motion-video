/* A/B bus SFX di `check` tidak boleh menyentuh master.wav maupun stem/. Dulu master ditimpa
   mix tanpa SFX lalu dipulihkan dengan mix ulang, tanpa `finally`: check yang dihentikan atau
   gagal di tengah meninggalkan master TANPA SFX, dan render berikutnya mengirim video itu.
   Audio sintetis ffmpeg, tanpa ElevenLabs. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import * as Pipa from '../lib/pipa.mjs';
import {rakit} from '../lib/mix.mjs';

const lavfi = (keluar, sumber) => execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', sumber, '-ar', '44100', keluar]);

/* Proyek tanpa VO (STT berbayar tidak terpanggil), dua cue SFX di luar jendela duck, satu bed. */
function proyek(dir) {
  const aset = path.join(dir, 'aset');
  mkdirSync(path.join(aset, 'sfx'), {recursive: true});
  lavfi(path.join(aset, 'sfx', 'desir.mp3'), 'anoisesrc=d=0.5:c=pink:a=0.6');
  lavfi(path.join(aset, 'bed.mp3'), 'sine=frequency=220:duration=8');
  writeFileSync(path.join(dir, 'timeline.json'), JSON.stringify([{name: 'A', dur: 4}, {name: 'B', dur: 4}]));
  return /** @type {any} */ ({
    nama: 'uji', dir, src: path.join(dir, 'src'), aset, stem: path.join(dir, 'stem'), vo: [],
    sfx: [['desir', 0.5, 'derau']],
    cue: ({C}) => [{at: C.A + 2.6, nama: 'desir', gain: 0.45}, {at: C.B + 2.5, nama: 'desir', gain: 0.45}],
    musik: [{nama: 'bed', titik: [['A', 0, -20], ['B', 0, -20]]}],
    periksa: {busTitik: [2.6, 6.5]},
  });
}

const sidik = (f) => ({isi: readFileSync(f), mtime: statSync(f).mtimeMs});

test('A/B bus SFX di periksa tidak menulis master.wav maupun stem/', async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-ab-'));
  try {
    const c = proyek(dir);
    await Pipa.mix(c);
    const master = path.join(c.aset, 'master.wav');
    const sebelum = {master: sidik(master), sfx: sidik(path.join(c.stem, 'sfx.wav'))};
    const h = await Pipa.periksa(c, {lengkap: true});
    // Bus SFX tetap terbukti hidup: selisih dengan/tanpa SFX di kedua titik.
    assert.equal(h.bus.length, 2);
    for (const b of h.bus) assert.ok(b.selisih > 1, `detik ${b.t}: selisih ${b.selisih} dB`);
    const sesudah = {master: sidik(master), sfx: sidik(path.join(c.stem, 'sfx.wav'))};
    assert.equal(sesudah.master.mtime, sebelum.master.mtime, 'master.wav ditulis ulang oleh check');
    assert.ok(sesudah.master.isi.equals(sebelum.master.isi), 'isi master.wav berubah');
    assert.ok(sesudah.sfx.isi.equals(sebelum.sfx.isi), 'stem sfx.wav berubah');
    // Berkas A/B sementara dibersihkan.
    assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith('.master')), []);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

test('rakit dengan `keluar` + `stem: false` menulis ke berkas itu saja', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-ab-'));
  try {
    const c = proyek(dir);
    const o = {dir: c.aset, total: 8, C: {A: 0, B: 4}, vo: [],
      cue: [{at: 2.6, nama: 'desir', gain: 0.45}],
      musik: [{nama: 'bed', file: path.join(c.aset, 'bed.mp3'), titik: [['A', 0, -20]]}]};
    const lain = path.join(dir, 'lain.wav');
    const r = rakit({...o, matikan: 'sfx', keluar: lain, stem: false});
    assert.equal(r.master, lain);
    assert.ok(Math.abs(r.lufs - -14) <= 0.5, `LUFS ${r.lufs}`);
    assert.ok(!existsSync(path.join(c.aset, 'master.wav')), 'master.wav ikut ditulis');
    for (const s of ['vo', 'sfx', 'mus']) assert.ok(!existsSync(path.join(c.stem, `${s}.wav`)), `stem ${s} ikut ditulis`);
    assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith('lain.wav.')), [], 'berkas antara tertinggal');
  } finally { rmSync(dir, {recursive: true, force: true}); }
});
