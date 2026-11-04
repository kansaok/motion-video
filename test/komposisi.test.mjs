import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp, readFile, cp, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {bacaScenes, tulisScenes, relatif, jsxUtama, laporanKeselarasan, geserJangkar, geserDeret, geserKapsi} from '../lib/komposisi.mjs';

const fixture = (nama) => new URL(`fixtures/${nama}`, import.meta.url);
async function salinFixture(...nama) {
  const dir = await mkdtemp(path.join(tmpdir(), 'motion-test-'));
  await Promise.all(nama.map((n) => cp(fixture(n), path.join(dir, n))));
  return dir;
}

test('bacaScenes dan tulisScenes menangani kutip tunggal, ganda, dan nama berspasi', async () => {
  const dir = await salinFixture('scenes-kutip-tunggal.html', 'scenes-kutip-ganda.html');
  const tunggal = path.join(dir, 'scenes-kutip-tunggal.html');
  const ganda = path.join(dir, 'scenes-kutip-ganda.html');
  assert.deepEqual(bacaScenes(tunggal).map((s) => s.name), ['Hook', 'Nama Scene']);
  assert.equal(bacaScenes(ganda)[0].name, 'Hook');
  assert.equal(tulisScenes(tunggal, {'Nama Scene': 3.25}), true);
  assert.equal(bacaScenes(tunggal)[1].dur, 3.25);
});

test('tulisScenes tidak menafsirkan token pengganti di nama scene', async () => {
  const dir = await salinFixture('scenes-dolar.html');
  const html = path.join(dir, 'scenes-dolar.html');
  assert.equal(tulisScenes(html, {Lain: 3}), true);
  assert.deepEqual(bacaScenes(html), [{name: '$& test', dur: 1}, {name: 'Lain', dur: 3}]);
});

test('relatif dan jsxUtama mengikuti alias cue serta komponen yang dipakai', async () => {
  const dir = await salinFixture('komposisi.html', 'utama.jsx', 'lama.jsx');
  assert.deepEqual(jsxUtama(path.join(dir, 'komposisi.html'), dir), {dipakai: ['lama.jsx', 'utama.jsx'], utama: 'utama.jsx'});
  assert.deepEqual(relatif(path.join(dir, 'utama.jsx')), {rel: 4, abs: 0, aman: true});
});

test('geserJangkar, geserDeret, dan geserKapsi mempertahankan alias peta cue', async () => {
  const dir = await salinFixture('utama.jsx');
  const jsx = path.join(dir, 'utama.jsx');
  assert.equal(geserJangkar(jsx, {intro: 2}), 1);
  assert.equal(geserDeret(jsx, {deret: [4, 9.41]}), 1);
  assert.equal(geserKapsi(jsx, [1]), 1);
  const isi = await readFile(jsx, 'utf8');
  assert.match(isi, /CUES\.Intro \+ 2\.00/);
  assert.match(isi, /C\.dp \+ 0\.85/);
  assert.match(isi, /Hemat Rp\$\$ 5\.000/);
  assert.doesNotMatch(isi, /CUES\.dp|at: NaN/);
});

test('laporan keselarasan menghitung pola JSX sebelum ditulis', async () => {
  const dir = await salinFixture('utama.jsx');
  const r = laporanKeselarasan(path.join(dir, 'utama.jsx'));
  assert.deepEqual(r.jangkar, ['intro']);
  assert.deepEqual(r.deret, ['deret']);
  assert.deepEqual(r.kapsi, {ditemukan: true, jumlah: 1, tidakCocok: []});
});

test('geserKapsi menggagalkan kapsi yang tidak berpola', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'motion-test-'));
  const jsx = path.join(dir, 'tanpa-kapsi.jsx');
  await writeFile(jsx, 'const judul = "tanpa kapsi";');
  assert.throws(() => geserKapsi(jsx, [1]), /kapsi tidak berpola.*deklarasi tidak ditemukan/);
});
