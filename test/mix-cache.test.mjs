/* P8-08: cache master. Render MCP dulu mix ulang penuh di tiap render, termasuk sesudah revisi
   visual saja. Master dipakai ulang hanya bila seluruh masukan mix (opsi + ISI sumber + kode
   mixer) sama dan stem masih ada. Audio sintetis ffmpeg, tanpa ElevenLabs. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync, existsSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import * as Pipa from '../lib/pipa.mjs';

const lavfi = (keluar, sumber) => execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', sumber, '-ar', '44100', keluar]);

function proyek() {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-mixcache-'));
  const aset = path.join(dir, 'aset');
  mkdirSync(path.join(aset, 'sfx'), {recursive: true});
  lavfi(path.join(aset, 'sfx', 'desir.mp3'), 'anoisesrc=d=0.8:c=pink:a=0.6:seed=7');
  lavfi(path.join(aset, 'bed.mp3'), 'sine=frequency=220:duration=8');
  writeFileSync(path.join(dir, 'timeline.json'), JSON.stringify([{name: 'A', dur: 4}, {name: 'B', dur: 4}]));
  /** @type {any} */
  const c = {nama: 'uji', dir, src: path.join(dir, 'src'), aset, stem: path.join(dir, 'stem'), vo: [],
    sfx: [['desir', 0.5, 'derau']], gain: 0.45,
    cue: ({C}) => [{at: C.A + 2.6, nama: 'desir', gain: c.gain}],
    musik: [{nama: 'bed', titik: [['A', 0, -20], ['B', 0, -20]]}]};
  return c;
}
const mtime = (c) => statSync(path.join(c.aset, 'master.wav')).mtimeMs;

test('masukan sama: master dipakai ulang tanpa mix; berubah: mix ulang', async () => {
  const c = proyek();
  try {
    const a = await Pipa.mix(c);
    assert.equal(a.cache, false);
    const t = mtime(c);
    const b = await Pipa.mix(c);
    assert.equal(b.cache, true);
    assert.equal(mtime(c), t, 'master.wav ditulis ulang padahal masukan sama');
    assert.deepEqual({lufs: b.lufs, dbtp: b.dbtp, cue: b.cue}, {lufs: a.lufs, dbtp: a.dbtp, cue: a.cue});

    c.gain = 0.3;                                               // opsi cue berubah
    assert.equal((await Pipa.mix(c)).cache, false);
    assert.equal((await Pipa.mix(c)).cache, true);

    c.mixer = {gainSFX: 0.5};                                   // opsi mixer berubah
    assert.equal((await Pipa.mix(c)).cache, false);

    // Isi sumber berubah dengan nama dan ukuran yang mirip: sidik isi, bukan waktu ubah.
    lavfi(path.join(c.aset, 'sfx', 'desir.mp3'), 'anoisesrc=d=0.8:c=pink:a=0.6:seed=8');
    assert.equal((await Pipa.mix(c)).cache, false);

    rmSync(path.join(c.stem, 'mus.wav'));                       // retensi MCP membuang stem/
    assert.equal((await Pipa.mix(c)).cache, false);
    assert.ok(existsSync(path.join(c.stem, 'mus.wav')));

    assert.equal((await Pipa.mix(c, {paksa: true})).cache, false);
  } finally { rmSync(c.dir, {recursive: true, force: true}); }
});

test('mix yang gagal tidak meninggalkan kunci lama yang cocok dengan master setengah jadi', async () => {
  const c = proyek();
  try {
    await Pipa.mix(c);                                          // K1 sukses
    c.mixer = {lufsTarget: 6};                                  // K2: mustahil, rakit melempar sesudah menimpa master
    await assert.rejects(Pipa.mix(c), /mix tidak konvergen/);
    c.mixer = undefined;                                        // kembali ke K1
    assert.equal((await Pipa.mix(c)).cache, false, 'master K2 yang gagal dipakai sebagai K1');
  } finally { rmSync(c.dir, {recursive: true, force: true}); }
});

test('A/B (`keluar`, `matikan`) tidak memakai dan tidak menulis cache master', async () => {
  const c = proyek();
  try {
    await Pipa.mix(c);
    const t = mtime(c);
    const ab = await Pipa.mix(c, {matikan: 'sfx', keluar: path.join(c.dir, 'ab.wav'), stem: false});
    assert.equal(ab.cache, undefined);
    assert.equal(mtime(c), t);
    assert.equal((await Pipa.mix(c)).cache, true, 'A/B merusak cache master');
  } finally { rmSync(c.dir, {recursive: true, force: true}); }
});
