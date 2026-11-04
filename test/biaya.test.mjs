/* P5-02: perkiraan biaya ElevenLabs dan gerbang konfirmasinya. Tanpa jaringan: kuota disuntik. */
import assert from 'node:assert/strict';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import * as B from '../lib/biaya.mjs';
import {HARGA} from '../lib/konstanta.mjs';
import {tandai} from '../lib/kunci.mjs';
import {rencanaVo} from '../lib/vo.mjs';

function proyek(isi = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-biaya-'));
  const aset = path.join(dir, 'aset');
  mkdirSync(path.join(aset, 'vo'), {recursive: true});
  mkdirSync(path.join(aset, 'sfx'), {recursive: true});
  writeFileSync(path.join(dir, 'timeline.json'), JSON.stringify([{name: 'A', dur: 10}, {name: 'B', dur: 20}]));
  /** @type {any} */
  const c = {nama: 'uji', dir, aset, src: dir, htmlUtama: path.join(dir, 'x.html'), suara: {id: 'v', seed: 1},
    vo: [], sfx: [], musik: [], ...isi};
  return c;
}

// 85 baris × 70 karakter: generasi ulang tak sengaja yang menjadi kriteria selesai P5-02.
const baris85 = Array.from({length: 85}, (_, i) => ({no: i + 1, sc: 'A',
  text: `Baris ke-${String(i + 1).padStart(2, '0')} naskah iklan yang cukup panjang untuk diucapkan.`.padEnd(70, '.')}));

test('perkiraan hanya menghitung VO yang kuncinya tidak segar', () => {
  const c = proyek({vo: baris85.slice(0, 3)});
  try {
    // Baris 1 sudah ada dengan kunci yang sama persis: gratis.
    const r = rencanaVo(c).baris[0];
    writeFileSync(r.file, 'mp3');
    tandai(r.file, r.kunci);
    const p = B.perkiraan(c, ['vo']);
    assert.deepEqual(p.rincian.map((b) => b.nama), ['VO-2', 'VO-3']);
    assert.equal(p.kredit, 140);
    // Mengubah speed mengubah kunci SEMUA baris: baris 1 ikut dihitung.
    c.suara.speed = 1.1;
    assert.equal(B.perkiraan(c, ['vo']).rincian.length, 3);
  } finally { rmSync(c.dir, {recursive: true, force: true}); }
});

test('VO unggahan (suara.luar) tidak pernah dihitung', () => {
  const c = proyek({vo: baris85.slice(0, 3), suara: {luar: true}});
  try { assert.equal(B.perkiraan(c, ['vo']).kredit, 0); }
  finally { rmSync(c.dir, {recursive: true, force: true}); }
});

test('VO ber-maks/dengar: terburuk = semua take', () => {
  const c = proyek({vo: [{no: 1, sc: 'A', text: 'x'.repeat(50), maks: 2}, {no: 2, sc: 'A', text: 'y'.repeat(50), coba: 2, dengar: /y/}]});
  try {
    const p = B.perkiraan(c, ['vo']);
    assert.equal(p.kredit, 100);
    assert.equal(p.terburuk, 50 * 4 + 50 * 2);
  } finally { rmSync(c.dir, {recursive: true, force: true}); }
});

test('SFX: stok dan unggahan gratis, generator per detik (dijepit 0,5-30)', () => {
  const c = proyek({sfx: [['a', '@stok/xyz'], ['b', '@luar'], ['c', 2, 'whoosh'], ['d', 0.1, 'tick'], ['e', 99, 'drone']]});
  try {
    const p = B.perkiraan(c, ['sfx']);
    assert.deepEqual(p.rincian.map((b) => b.nama), ['c', 'd', 'e']);
    assert.equal(p.kredit, Math.round((2 + 0.5 + 30) * HARGA.sfxKreditPerDetik));
  } finally { rmSync(c.dir, {recursive: true, force: true}); }
});

test('musik: luar gratis, rencana dihitung dari jumlah bagian, detik bisa fungsi', () => {
  const c = proyek({musik: [
    {nama: 'suno', luar: true},
    {nama: 'bgm', prompt: 'p', detik: ({total}) => total + 10},
    {nama: 'bagian', rencana: ({C}) => [{detik: C.B}, {detik: 25}]},
  ]});
  try {
    const p = B.perkiraan(c, ['musik']);
    assert.deepEqual(p.rincian.map((b) => b.nama), ['bgm 40s', 'bagian 35s']);
    assert.equal(p.kredit, Math.round(75 * HARGA.musikKreditPerDetik));
  } finally { rmSync(c.dir, {recursive: true, force: true}); }
});

test('85 baris VO tanpa terminal: gagal sebelum satu pun permintaan, kecuali --ya', async () => {
  const c = proyek({vo: baris85});
  try {
    const p = B.perkiraan(c, ['vo']);
    assert.ok(p.usd > HARGA.maksUsdBawaan, `perkiraan $${p.usd}`);
    let dipanggil = 0;
    const kerja = async () => { dipanggil++; return 'jadi'; };
    const kuota = async () => ({terpakai: 1000 + dipanggil * 5950});
    await assert.rejects(B.berbiaya(c, 'plan', ['vo'], kerja, {kuota, log: () => {}, jagaOpsi: {tty: false, batas: 0.5}}),
      /di atas BIAYA_MAKS_USD \$0\.50.*--ya/);
    assert.equal(dipanggil, 0);
    assert.equal(existsSync(path.join(c.dir, 'biaya.json')), false);

    assert.equal(await B.berbiaya(c, 'plan', ['vo'], kerja, {ya: true, kuota, log: () => {}, jagaOpsi: {tty: false, batas: 0.5}}), 'jadi');
    assert.equal(dipanggil, 1);
    const catatan = JSON.parse(readFileSync(path.join(c.dir, 'biaya.json'), 'utf8'));
    assert.equal(catatan.length, 1);
    assert.equal(catatan[0].perintah, 'plan');
    assert.equal(catatan[0].perkiraan, p.kredit);
    assert.equal(catatan[0].realisasi, 5950);
  } finally { rmSync(c.dir, {recursive: true, force: true}); }
});

test('di terminal: ditanya, hanya "y"/"ya" yang melanjutkan', async () => {
  const p = {kredit: 6000, terburuk: 6000, usd: 1, usdTerburuk: 1, rincian: []};
  await assert.rejects(B.jaga(p, {batas: 0.5, tty: true, tanya: async () => ''}), /dibatalkan/);
  await assert.rejects(B.jaga(p, {batas: 0.5, tty: true, tanya: async () => 'n'}), /dibatalkan/);
  await B.jaga(p, {batas: 0.5, tty: true, tanya: async () => 'Ya'});
  // Di bawah batas: tidak bertanya sama sekali.
  await B.jaga({...p, usd: 0.1}, {batas: 0.5, tty: true, tanya: async () => { throw new Error('tidak boleh bertanya'); }});
});

test('tanpa aset baru: tidak bertanya, tidak memanggil kuota, tidak mencatat', async () => {
  const c = proyek();
  try {
    const kuota = async () => { throw new Error('tidak boleh dipanggil'); };
    assert.equal(await B.berbiaya(c, 'mix', ['vo'], async () => 7, {kuota, log: () => {}}), 7);
    assert.equal(existsSync(path.join(c.dir, 'biaya.json')), false);
  } finally { rmSync(c.dir, {recursive: true, force: true}); }
});

test('realisasi tetap dicatat walau perintahnya gagal di tengah', async () => {
  const c = proyek({vo: baris85.slice(0, 2)});
  try {
    let n = 0;
    const kuota = async () => ({terpakai: n++ ? 1070 : 1000});
    await assert.rejects(B.berbiaya(c, 'plan', ['vo'], async () => { throw new Error('putus'); }, {kuota, log: () => {}}), /putus/);
    const [e] = JSON.parse(readFileSync(path.join(c.dir, 'biaya.json'), 'utf8'));
    assert.equal(e.realisasi, 70);
  } finally { rmSync(c.dir, {recursive: true, force: true}); }
});

test('BIAYA_MAKS_USD: bawaan, angka, dan nilai tidak sah', () => {
  assert.equal(B.batasUsd({}), HARGA.maksUsdBawaan);
  assert.equal(B.batasUsd({BIAYA_MAKS_USD: '2.5'}), 2.5);
  assert.throws(() => B.batasUsd({BIAYA_MAKS_USD: 'dua'}), /tidak sah/);
  assert.throws(() => B.batasUsd({BIAYA_MAKS_USD: '-1'}), /tidak sah/);
});
