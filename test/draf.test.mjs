/* P8-07: mode draf. 540p, 15 fps, ke `-draf.mp4` terpisah; MP4 penuh dan sampulnya tidak pernah
   tertimpa. Hitungan ukuran dan nama diuji tanpa Chromium; render sungguhan dilewati tanpa
   Chromium. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {DRAF, render, ukuranKeluaran} from '../lib/render.mjs';
import {namaDraf, namaPotongan, opsiRender} from '../lib/pipa.mjs';

test('ukuranKeluaran: penuh sisi pendek 1080, draf separuhnya dengan dsf separuh', () => {
  assert.deepEqual(ukuranKeluaran({width: 1080, height: 1920}), {W: 1080, H: 1920, dsf: 1});
  assert.deepEqual(ukuranKeluaran({width: 1080, height: 1920}, {draf: true}), {W: 540, H: 960, dsf: 0.5});
  assert.deepEqual(ukuranKeluaran({width: 1080, height: 1350}), {W: 1080, H: 1350, dsf: 1});
  assert.deepEqual(ukuranKeluaran({width: 1080, height: 1350}, {draf: true}), {W: 540, H: 676, dsf: 676 / 1350});
  assert.deepEqual(ukuranKeluaran({width: 1920, height: 1080}, {draf: true}), {W: 960, H: 540, dsf: 0.5});
  assert.deepEqual(ukuranKeluaran({width: 1080, height: 1080}, {draf: true}), {W: 540, H: 540, dsf: 0.5});
  // Stage yang menskalakan diri ke viewport (templat): dsf mengikuti, keluaran tetap.
  const s = ukuranKeluaran({width: 900, height: 1600}, {draf: true});
  assert.deepEqual([s.W, s.H], [540, 960]);
  assert.ok(Math.abs(s.dsf - 0.6) < 1e-9);
});

test('nama draf tidak pernah sama dengan MP4 penuh, juga lewat opsi `keluaran` (varian)', () => {
  assert.equal(namaDraf('/p/iklan.mp4'), '/p/iklan-draf.mp4');
  assert.equal(namaDraf('/p/iklan-draf.mp4'), '/p/iklan-draf.mp4');
  assert.equal(namaDraf(namaPotongan('/p/iklan.mp4', {dari: 1, sampai: 2})), '/p/iklan-potong-1.00-2.00-draf.mp4');
  /** @type {any} */
  const c = {dir: '/p', src: '/p/src', aset: '/p/aset', nama: 'iklan', komposisi: 'V.html', keluaran: 'iklan-9x16.mp4'};
  assert.equal(opsiRender(c).keluaran, '/p/iklan-9x16.mp4');
  assert.equal(opsiRender(c, {draf: true}).keluaran, '/p/iklan-9x16-draf.mp4');
  // `...opsi` tidak boleh menimpa nama draf dengan nama penuh.
  assert.equal(opsiRender(c, {draf: true, keluaran: '/p/iklan-4x5.mp4'}).keluaran, '/p/iklan-4x5-draf.mp4');
  assert.equal(opsiRender(c, {draf: false, keluaran: '/p/iklan-4x5.mp4'}).keluaran, '/p/iklan-4x5.mp4');
});

test('DRAF: 15 fps, x264 veryfast', () => {
  assert.equal(DRAF.fps, 15);
  assert.deepEqual([...DRAF.arg].slice(0, 4), ['-c:v', 'libx264', '-preset', 'veryfast']);
});

let chromiumAda = false;
try {
  const {chromium} = await import('playwright');
  chromiumAda = existsSync(chromium.executablePath());
} catch { /* playwright/Chromium tidak terpasang: tes Chromium di bawah dilewati */ }

test('render draf: 540x960, 15 fps, tanpa sampul', {skip: !chromiumAda && 'Chromium tidak terpasang', timeout: 180_000}, async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-draf-'));
  try {
    writeFileSync(path.join(dir, 'Uji.html'), `<!doctype html><html><head><style>html,body{margin:0}
#stage{width:1080px;height:1920px;background:#1e88e5}</style></head><body>
<div id="stage" data-om-exportable-video-with-duration-secs="1"></div>
<script>document.getElementById('stage').addEventListener('data-om-seek-to-time-frame', () => {});</script></body></html>`);
    const audio = path.join(dir, 'a.wav');
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1', audio]);
    const keluaran = path.join(dir, 'uji-draf.mp4');
    const r = await render({dirSrc: dir, berkas: 'Uji.html', audio, keluaran, tab: 1, draf: true, sampul: {detik: 0}, dirProyek: dir});
    assert.deepEqual([r.lebar, r.tinggi, r.frame, r.sampul], [540, 960, 15, null]);
    const info = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries',
      'stream=width,height,r_frame_rate', '-of', 'csv=p=0', keluaran], {encoding: 'utf8'}).trim();
    assert.equal(info, '540,960,15/1');
    assert.ok(!existsSync(path.join(dir, 'uji-draf-sampul.jpg')));
  } finally { rmSync(dir, {recursive: true, force: true}); }
});
