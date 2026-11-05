/* P6-03: render semua varian rasio dari satu master audio. Daftar, cek OM_SCENES, putusan, dan
   laporan diuji tanpa Chromium; render dua varian sungguhan bila Chromium terpasang. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

process.env.MOTION_VIEWPORT ||= '800x1200';
const Pipa = await import('../lib/pipa.mjs');
const {labelRasio} = await import('../lib/render.mjs');

const SCENES = [{name: 'A', dur: 1.2}, {name: 'B', dur: 0.8}];
const html = (w, h, scenes = SCENES) => `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#000}
#s{width:${w}px;height:${h}px;background:#123;color:#fff;font:700 40px sans-serif}</style></head><body>
<script>window.OM_SCENES = '${JSON.stringify(scenes)}';</script>
<div id="s" data-om-exportable-video-with-duration-secs="2"><p id="t">A</p></div><script>
const s = document.getElementById('s');
s.addEventListener('data-om-seek-to-time-frame', (e) => {
  const t = Number(e.detail.time); document.getElementById('t').textContent = t < 1.2 ? 'Scene A ' + t.toFixed(1) : 'Scene B';
  s.style.background = t < 1.2 ? '#1a3d6b' : '#6b1a3d';
});
</script></body></html>`;

function proyek(varian) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-varian-'));
  const src = path.join(dir, 'src'), aset = path.join(dir, 'aset');
  mkdirSync(src); mkdirSync(aset);
  writeFileSync(path.join(src, 'Utama 9x16.html'), html(540, 960));
  writeFileSync(path.join(src, 'Kotak 1x1.html'), html(540, 540));
  writeFileSync(path.join(src, 'Lebar 16x9.html'), html(960, 540, [{name: 'A', dur: 1}, {name: 'B', dur: 1}]));
  writeFileSync(path.join(dir, 'timeline.json'), JSON.stringify(SCENES));
  /** @type {any} */
  const c = {nama: 'uji', dir, src, aset, stem: path.join(dir, 'stem'), komposisi: 'Utama 9x16.html', htmlUtama: path.join(src, 'Utama 9x16.html'),
    keluaran: 'uji-9x16.mp4', sampul: {detik: 0.5}, vo: [], varian};
  return c;
}

test('daftarVarian: utama selalu ikut, nama bawaan seperti --komposisi, sampul diwarisi, berkas ganda ditolak', () => {
  const c = proyek([{komposisi: 'Utama 9x16.html'}, {komposisi: 'Kotak 1x1.html'}, {komposisi: 'Lebar 16x9.html', keluaran: 'lebar.mp4', sampul: {detik: 1}}]);
  try {
    assert.deepEqual(Pipa.daftarVarian(c), [
      {komposisi: 'Utama 9x16.html', keluaran: 'uji-9x16.mp4', sampul: {detik: 0.5}},
      {komposisi: 'Kotak 1x1.html', keluaran: 'kotak-1x1.mp4', sampul: {detik: 0.5}},
      {komposisi: 'Lebar 16x9.html', keluaran: 'lebar.mp4', sampul: {detik: 1}},
    ]);
    c.varian = [{komposisi: 'Kotak 1x1.html', keluaran: 'uji-9x16.mp4'}];
    assert.throws(() => Pipa.daftarVarian(c), /dua varian menulis ke berkas yang sama: uji-9x16\.mp4/);
  } finally { rmSync(c.dir, {recursive: true, force: true}); }
});

test('cekScenesVarian: komposisi yang tidak ikut apply ditolak sebelum render', () => {
  const c = proyek([]);
  try {
    assert.equal(Pipa.cekScenesVarian(c, {komposisi: 'Kotak 1x1.html'}), null);
    assert.match(Pipa.cekScenesVarian(c, {komposisi: 'Lebar 16x9.html'}), /OM_SCENES Lebar 16x9\.html beda dengan timeline \(A, B\): tambahkan ke `jugaTulis`/);
    assert.match(Pipa.cekScenesVarian(c, {komposisi: 'Hilang.html'}), /komposisi tidak ada/);
  } finally { rmSync(c.dir, {recursive: true, force: true}); }
});

test('nilaiVarian memakai ambang `check`; labelRasio mengikuti penempatan Meta', () => {
  assert.deepEqual(Pipa.nilaiVarian({lufs: -14.2, dbtp: -1.3}, {rasio: 0.9}, 30.02, 30), []);
  assert.deepEqual(Pipa.nilaiVarian({lufs: -15.4, dbtp: -0.6}, {rasio: 0.5}, 28, 30), [
    '-15.4 LUFS di luar -14 ±1', '-0.6 dBTP melanggar -1,0', 'frame 0 kontras 50% (< 75%)', 'durasi 28.00s, timeline 30.00s']);
  assert.deepEqual([[1080, 1920], [1080, 1350], [1080, 1080], [1920, 1080]].map(([w, h]) => labelRasio(w, h)), ['9x16', '4x5', '1x1', '16x9']);
});

test('laporVarian: satu tabel, ✖ per varian, rasio yang belum ada disebut', () => {
  const t = Pipa.laporVarian([
    {komposisi: 'a', keluaran: 'a.mp4', rasio: '9x16', lebar: 1080, tinggi: 1920, detik: 30, mp4: {lufs: -14, dbtp: -1.2}, kontras: 0.9, sampul: 'a-sampul.jpg', masalah: []},
    {komposisi: 'b', keluaran: 'b.mp4', rasio: '4x5', lebar: 1080, tinggi: 1350, detik: 30, mp4: {lufs: -14, dbtp: -0.4}, kontras: 0.9, sampul: null, masalah: ['-0.4 dBTP melanggar -1,0']},
    {komposisi: 'c.html', keluaran: 'c.mp4', galat: 'OM_SCENES beda', masalah: []},
  ]);
  assert.match(t, /9x16 {2}1080x1920 .* ✓ a\.mp4 \+ sampul/);
  assert.match(t, /4x5 .* ✖ b\.mp4\n {8}✖ -0\.4 dBTP/);
  assert.match(t, /✖ c\.html: OM_SCENES beda/);
  assert.match(t, /1\/3 varian lolos · belum ada: 1x1, 16x9/);
});

let chromiumAda = false;
try {
  const {chromium} = await import('playwright');
  chromiumAda = existsSync(chromium.executablePath());
} catch { /* tanpa Chromium: render sungguhan dilewati */ }

test('renderVarian: dua rasio dari satu master + satu varian yang ditolak, tanpa berhenti di tengah',
  {skip: !chromiumAda && 'Chromium tidak terpasang', timeout: 240_000}, async () => {
    const c = proyek([{komposisi: 'Kotak 1x1.html'}, {komposisi: 'Lebar 16x9.html'}]);
    try {
      execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'sine=f=330:d=2:sample_rate=48000', '-ac', '2', path.join(c.aset, 'master.wav')]);
      const log = [];
      const h = await Pipa.renderVarian(c, {fps: 10, tab: 1, log: (s) => log.push(s)});
      assert.deepEqual(h.map((x) => [x.komposisi, x.rasio ?? null, x.lebar ?? null, x.tinggi ?? null]), [
        ['Utama 9x16.html', '9x16', 1080, 1920], ['Kotak 1x1.html', '1x1', 1080, 1080], ['Lebar 16x9.html', null, null, null]]);
      for (const x of h.slice(0, 2)) {
        assert.ok(existsSync(path.join(c.dir, x.keluaran)), x.keluaran);
        assert.ok(existsSync(x.sampul), `sampul ${x.sampul}`);
        assert.ok(Math.abs(x.detik - 2) < 0.15, `durasi ${x.detik}`);
        // Audio sintetis tidak di -14 LUFS: putusan `check` benar-benar dipakai, durasinya lolos.
        assert.ok(x.masalah.some((m) => /LUFS/.test(m)), x.masalah.join('; '));
        assert.ok(!x.masalah.some((m) => /durasi/.test(m)), x.masalah.join('; '));
      }
      assert.match(h[2].galat, /jugaTulis/);
      assert.deepEqual(log, ['varian Utama 9x16.html…', 'varian Kotak 1x1.html…']);
      assert.match(Pipa.laporVarian(h), /0\/3 varian lolos · belum ada: 4x5, 16x9/);
    } finally { rmSync(c.dir, {recursive: true, force: true}); }
  });
