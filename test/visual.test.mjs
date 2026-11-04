/* P5-05: pemeriksaan visual di komposisi hidup. Butuh Chromium; dilewati bila tidak ada. */
import assert from 'node:assert/strict';
import {existsSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {periksaVisual} from '../lib/render.mjs';
import {titikVisual} from '../lib/pipa.mjs';

let chromiumAda = false;
try {
  const {chromium} = await import('playwright');
  chromiumAda = existsSync(chromium.executablePath());
} catch { /* playwright/Chromium tidak terpasang: tes Chromium di bawah dilewati */ }

/* Satu detik per keadaan:
   0  normal: kapsi di dalam stage
   1  kapsi panjang tanpa bungkus, lewat tepi kanan stage
   2  frame hitam tanpa teks
   3  kapsi kosong
   4  teks terpotong wadah ber-overflow (bukan stage)
   5  teks tersembunyi (opacity 0) di luar stage: bukan masalah */
const HTML = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;background:#000}
#stage{position:relative;width:540px;height:960px;overflow:hidden;background:#20242c;color:#fff;font:700 40px sans-serif}
#kapsi{position:absolute;left:40px;bottom:120px;white-space:nowrap}
#wadah{position:absolute;left:40px;top:200px;width:200px;height:60px;overflow:hidden}
#wadah span{white-space:nowrap;font-size:30px}
#hantu{position:absolute;left:600px;top:40px;opacity:0}
</style></head><body>
<div id="stage" data-om-exportable-video-with-duration-secs="6">
  <div id="kapsi"></div><div id="wadah"></div><div id="hantu">tersembunyi di luar</div>
</div>
<script>
const KAPSI = ['Kalimat aman', 'Kalimat kedua yang sangat panjang sekali sampai lewat tepi kanan stage', '', '', 'Kalimat kelima', 'Kalimat keenam'];
const stage = document.getElementById('stage');
stage.addEventListener('data-om-seek-to-time-frame', (e) => {
  const t = Math.floor(Number(e.detail.time) || 0);
  document.getElementById('kapsi').textContent = KAPSI[t] || '';
  document.getElementById('wadah').innerHTML = t === 4 ? '<span>Judul terlalu lebar</span>' : '';
  stage.style.background = t === 2 ? '#000' : '#20242c';
});
</script></body></html>`;

test('teks keluar stage, kapsi kosong, frame hitam, dan teks terpotong dilaporkan dengan detiknya',
  {skip: !chromiumAda && 'Chromium tidak terpasang', timeout: 120_000}, async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-visual-'));
    try {
      writeFileSync(path.join(dir, 'Uji.html'), HTML);
      const titik = [
        {t: 0.5, alasan: 'VO-1', kapsi: 'Kalimat aman'},
        {t: 1.5, alasan: 'VO-2', kapsi: 'Kalimat kedua yang sangat panjang'},
        {t: 2.5, alasan: 'tengah scene Gelap'},
        {t: 3.5, alasan: 'VO-4', kapsi: 'Kalimat keempat hilang'},
        {t: 4.5, alasan: 'tengah scene Wadah'},
        {t: 5.5, alasan: 'VO-6', kapsi: 'Kalimat keenam'},
      ];
      const h = await periksaVisual(dir, 'Uji.html', titik, {kapsi: '#kapsi'});
      const per = Object.fromEntries(h.map((x) => [x.t, x.masalah.join(' | ')]));
      assert.deepEqual(Object.keys(per).map(Number), [1.5, 2.5, 3.5, 4.5]);
      assert.match(per[1.5], /teks keluar stage: "Kalimat kedua yang sangat panjang sekali…" \d+ px di luar stage/);
      assert.match(per[2.5], /frame hitam/);
      assert.match(per[3.5], /kapsi kosong \(#kapsi tidak berisi teks\)/);
      assert.match(per[4.5], /teks "Judul terlalu lebar" terpotong \d+ px oleh <div#wadah>/);

      // Tanpa selektor: kapsi dicari sebagai kata naskah di seluruh stage.
      const h2 = await periksaVisual(dir, 'Uji.html', [{t: 0.5, alasan: 'VO-1', kapsi: 'Kalimat aman'},
        {t: 4.5, alasan: 'VO-5', kapsi: 'Penutup berbeda', teks: false, hitam: false}]);
      assert.deepEqual(h2.map((x) => [x.t, x.masalah]), [[4.5, ['kapsi tidak menampilkan kalimatnya ("Penutup berbeda")']]]);
    } finally { rmSync(dir, {recursive: true, force: true}); }
  });

test('titikVisual: tengah VO, tengah scene, dan awal scene (tanpa cek teks)', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-visual-'));
  try {
    writeFileSync(path.join(dir, 'timeline.json'), JSON.stringify([{name: 'A', dur: 4}, {name: 'B', dur: 4}]));
    /** @type {any} */
    const c = {dir, htmlUtama: path.join(dir, 'x.html'), periksa: {kapsi: '#kapsi'}, tata: {mode: 'jangkar'},
      vo: [{no: 1, sc: 'A', off: 0.5, text: 'Satu', dur: 2}, {no: 2, sc: 'B', off: 0.2, text: 'Dua', dur: 1}]};
    const t = titikVisual(c);
    assert.deepEqual(t.map((p) => [p.t, p.alasan]), [
      [1.5, 'VO-1'], [2, 'tengah scene A'], [4.25, 'awal scene B'], [4.7, 'VO-2'], [6, 'tengah scene B']]);
    assert.equal(t.find((p) => p.alasan === 'VO-1').kapsi, 'Satu');
    assert.equal(t.find((p) => p.alasan === 'awal scene B').teks, false);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});
