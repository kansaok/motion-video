/* Stage yang lebih besar dari viewport. Playwright memangkas `clip` screenshot ke viewport, jadi
   stage 1080x1920 tanpa skala di viewport 1400x1600 (bawaan Dockerfile) dulu keluar 1080x1600
   lalu ditarik jadi 1920: zona kapsi hilang dan gambar gepeng, tanpa galat. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

// Harus diset sebelum render.mjs dimuat: VIEWPORT dibaca sekali saat modul dievaluasi.
process.env.MOTION_VIEWPORT = '1400x1600';
const R = await import('../lib/render.mjs');

test('viewportUntuk: null bila stage muat, diperbesar (tidak pernah dikecilkan) bila tidak', () => {
  const vp = {width: 1400, height: 1600};
  // Templat yang menskalakan stage ke jendela: muat, tidak disentuh.
  assert.equal(R.viewportUntuk(vp, {x: 0, y: 0, width: 900, height: 1600}), null);
  // Contoh PANDUAN: stage 1080x1920 di (0,0).
  assert.deepEqual(R.viewportUntuk(vp, {x: 0, y: 0, width: 1080, height: 1920}), {width: 1400, height: 1920});
  // Stage ditengahkan flex: y negatif; yang dibutuhkan tinggi stage, bukan sisi bawahnya.
  assert.deepEqual(R.viewportUntuk(vp, {x: 160, y: -160, width: 1080, height: 1920}), {width: 1400, height: 1920});
  // 16:9 lebih lebar dari viewport.
  assert.deepEqual(R.viewportUntuk(vp, {x: 0, y: 0, width: 1920, height: 1080}), {width: 1920, height: 1600});
  // Pecahan piksel dibulatkan ke atas, supaya baris terakhir tidak terpangkas.
  assert.deepEqual(R.viewportUntuk(vp, {x: 0, y: 0.5, width: 1080, height: 1919.6}), {width: 1400, height: 1921});
  assert.throws(() => R.viewportUntuk(vp, {x: 0, y: 0, width: 4320, height: 7680}), /terlalu besar/);
});

test('cekUkuranFrame: aspek frame harus sama dengan keluaran', () => {
  assert.equal(R.cekUkuranFrame({lebar: 1080, tinggi: 1920}, 1080, 1920), null);
  assert.equal(R.cekUkuranFrame({lebar: 1081, tinggi: 1920}, 1080, 1920), null);     // pembulatan clip
  assert.match(R.cekUkuranFrame({lebar: 1080, tinggi: 1600}, 1080, 1920), /gepeng/);  // gejala lama
});

let chromiumAda = false;
try {
  const {chromium} = await import('playwright');
  chromiumAda = existsSync(chromium.executablePath());
} catch { /* playwright/Chromium tidak terpasang: tes Chromium di bawah dilewati */ }

// Bentuk contoh minimal mcp/PANDUAN.md: stage piksel tetap, tanpa skala. Pita merah di 120 px
// terbawah (zona kapsi), sisanya biru.
const HTML = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;background:#000}
#stage{position:relative;width:1080px;height:1920px;overflow:hidden;background:#1e88e5}
#kapsi{position:absolute;left:0;right:0;bottom:0;height:120px;background:#e53935}
</style></head><body>
<div id="stage" data-om-exportable-video-with-duration-secs="1"><div id="kapsi"></div></div>
<script>document.getElementById('stage').addEventListener('data-om-seek-to-time-frame', () => {});</script>
</body></html>`;

test('stage 1080x1920 tanpa skala di viewport 1400x1600 dirender utuh, tidak gepeng',
  {skip: !chromiumAda && 'Chromium tidak terpasang', timeout: 180_000}, async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-viewport-'));
    try {
      writeFileSync(path.join(dir, 'Uji.html'), HTML);
      const audio = path.join(dir, 'a.wav');
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1', audio]);
      const keluaran = path.join(dir, 'uji.mp4');
      const r = await R.render({dirSrc: dir, berkas: 'Uji.html', audio, keluaran, fps: 30, tab: 1, batasFrame: 3,
        sampul: {detik: 0}, dirProyek: dir});
      assert.deepEqual([r.lebar, r.tinggi], [1080, 1920]);
      // Baris y=1880 harus merah (pita kapsi); dulu 320 px bawah hilang dan biru ditarik ke sana.
      const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', keluaran, '-frames:v', '1',
        '-vf', 'scale=in_color_matrix=bt709:in_range=tv,format=rgb24', '-f', 'rawvideo', '-'], {maxBuffer: 1 << 25});
      const px = (x, y) => [...raw.subarray((y * 1080 + x) * 3, (y * 1080 + x) * 3 + 3)];
      const [rB, , bB] = px(540, 1880), [rA, , bA] = px(540, 1700);
      assert.ok(rB > 180 && bB < 110, `y=1880 seharusnya merah, dapat ${px(540, 1880)}`);
      assert.ok(bA > 180 && rA < 80, `y=1700 seharusnya biru, dapat ${px(540, 1700)}`);
    } finally { rmSync(dir, {recursive: true, force: true}); }
  });
