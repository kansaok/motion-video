/* P5-04: peta bed musik sesudah `motion music`, atas potongan yang dipakai video. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {laporBed, periksaBed} from '../lib/musik.mjs';
import {sparkline} from '../lib/periksa.mjs';

/* Trek: derau merah muda dengan senyap di [lubangDari, lubangSampai), panjang `detik`. */
function trek(file, detik, lubang = null) {
  const bagian = lubang
    ? [`anoisesrc=d=${lubang[0]}:c=pink:a=0.3`, `anullsrc=r=44100:cl=mono:d=${lubang[1] - lubang[0]}`,
      `anoisesrc=d=${detik - lubang[1]}:c=pink:a=0.3`]
    : [`anoisesrc=d=${detik}:c=pink:a=0.3`];
  execFileSync('ffmpeg', ['-y', '-v', 'error', ...bagian.flatMap((s) => ['-f', 'lavfi', '-i', s]),
    ...(bagian.length > 1 ? ['-filter_complex', `${bagian.map((_, i) => `[${i}]`).join('')}concat=n=${bagian.length}:v=0:a=1`] : []),
    '-ar', '44100', file]);
}

function proyek(musik) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-bed-'));
  mkdirSync(path.join(dir, 'aset'), {recursive: true});
  writeFileSync(path.join(dir, 'timeline.json'),
    JSON.stringify([{name: 'Hook', dur: 5}, {name: 'Masalah', dur: 7}, {name: 'CTA', dur: 8}]));
  /** @type {any} */
  const c = {dir, aset: path.join(dir, 'aset'), htmlUtama: path.join(dir, 'x.html'), musik};
  return c;
}

test('lubang dilaporkan dalam detik video, dengan scene dan bagian rencana', () => {
  const c = proyek([{nama: 'bgm', rencana: [{detik: 6, teks: '[intro]'}, {detik: 8, teks: '[build]'}, {detik: 16, teks: '[drop]'}]}]);
  try {
    trek(path.join(c.aset, 'bgm.mp3'), 30, [8, 10]);
    const [h] = periksaBed(c);
    assert.equal(h.galat, undefined);
    assert.equal(h.db.length, 20);
    assert.equal(h.lubang.length, 1);
    assert.deepEqual([h.lubang[0].dari, h.lubang[0].sampai], [8, 10]);
    assert.equal(h.lubang[0].scene, 'Masalah');
    assert.deepEqual(h.lubang[0].bagian, {ke: 2, teks: '[build]'});
    const teks = laporBed([h]);
    assert.match(teks, /✖ lubang 8-10s \(-\d+ dB, -\d+ dB dari median; scene Masalah, bagian 2 \[build\]\)/);
    assert.match(teks, /regenerate: hapus aset\/bgm\.mp3 lalu `motion music`, dan ubah bagian itu di `rencana`/);
  } finally { rmSync(c.dir, {recursive: true, force: true}); }
});

test('`lewati` dan `mulai` memetakan detik trek ke detik video', () => {
  // Lubang di detik trek 8-10; lewati 2 dan mulai 1 -> detik video 7-9.
  const c = proyek([{nama: 'bgm', lewati: 2, mulai: ({C}) => C.Hook + 1}]);
  try {
    trek(path.join(c.aset, 'bgm.mp3'), 30, [8, 10]);
    const [h] = periksaBed(c);
    assert.equal(h.mulai, 1);
    assert.deepEqual([h.lubang[0].dari, h.lubang[0].sampai], [7, 9]);
  } finally { rmSync(c.dir, {recursive: true, force: true}); }
});

test('jeda yang disengaja lewat dua trek + fadeOut tidak dituduh bolong', () => {
  const c = proyek([
    {nama: 'bgm', fadeOut: [10, 2]},
    {nama: 'bgm-d', mulai: 15},
  ]);
  try {
    // `bgm` hanya 12 dtk (berhenti sesudah fade), `bgm-d` mengisi 15-20.
    trek(path.join(c.aset, 'bgm.mp3'), 12);
    trek(path.join(c.aset, 'bgm-d.mp3'), 10);
    const h = periksaBed(c);
    assert.deepEqual(h.map((x) => [x.nama, x.mulai, x.sampai, x.lubang.length, x.habis]),
      [['bgm', 0, 12, 0, null], ['bgm-d', 15, 20, 0, null]]);
    assert.match(laporBed(h), /bed bgm .*rata ✓/);
  } finally { rmSync(c.dir, {recursive: true, force: true}); }
});

test('trek yang lebih pendek dari video: "trek habis" dan sisanya terhitung lubang', () => {
  const c = proyek([{nama: 'suno', luar: true}]);
  try {
    trek(path.join(c.aset, 'suno.mp3'), 14);
    const [h] = periksaBed(c);
    assert.equal(h.habis, 14);
    assert.equal(h.lubang.at(-1).sampai, 20);
    const teks = laporBed([h]);
    assert.match(teks, /trek habis di detik 14\.0 video/);
    assert.match(teks, /trek luar: ganti treknya/);
  } finally { rmSync(c.dir, {recursive: true, force: true}); }
});

test('trek yang belum ada dilewati; berkas rusak dilaporkan, bukan "rata"', () => {
  const c = proyek([{nama: 'belum'}, {nama: 'rusak'}]);
  try {
    writeFileSync(path.join(c.aset, 'rusak.mp3'), 'bukan audio');
    const h = periksaBed(c);
    assert.deepEqual(h.map((x) => x.nama), ['rusak']);
    assert.ok(h[0].galat);
    assert.match(laporBed(h), /rusak .*✖ tidak dapat diperiksa/);
  } finally { rmSync(c.dir, {recursive: true, force: true}); }
});

test('sparkline: lubang terlihat sebagai celah', () => {
  assert.equal(sparkline([-20, -20, -50, -20], -20), '▆▆ ▆');
  assert.equal(sparkline([-20, -14], -20), '▆█');
});
