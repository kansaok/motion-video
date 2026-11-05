/* P8-05: render memotret frame sebelum audionya ada, dan baru menunggu `tungguAudio` di mux.
   Butuh Chromium; dilewati bila tidak ada. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {render} from '../lib/render.mjs';
import {durasi} from '../lib/ff.mjs';

let chromiumAda = false;
try {
  const {chromium} = await import('playwright');
  chromiumAda = existsSync(chromium.executablePath());
} catch { /* playwright/Chromium tidak terpasang: tes di bawah dilewati */ }

const HTML = `<!doctype html><html><head><style>html,body{margin:0}
#stage{width:540px;height:960px;background:#1e88e5}</style></head><body>
<div id="stage" data-om-exportable-video-with-duration-secs="1"></div>
<script>document.getElementById('stage').addEventListener('data-om-seek-to-time-frame', () => {});</script></body></html>`;

test('tungguAudio: audio yang dibuat selama capture tetap ter-mux; galatnya keluar dari render',
  {skip: !chromiumAda && 'Chromium tidak terpasang', timeout: 180_000}, async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-tunggu-'));
    try {
      writeFileSync(path.join(dir, 'Uji.html'), HTML);
      const audio = path.join(dir, 'master.wav');
      let dibuat = false;
      const tunggu = new Promise((ok) => setTimeout(() => {
        execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1', audio]);
        dibuat = true; ok(undefined);
      }, 1500));
      const o = {dirSrc: dir, berkas: 'Uji.html', audio, tab: 1, batasFrame: 6, dirProyek: dir};
      // Audio belum ada saat render dimulai.
      assert.equal(existsSync(audio), false);
      const r = await render({...o, keluaran: path.join(dir, 'a.mp4'), tungguAudio: tunggu});
      assert.ok(dibuat);
      assert.ok(Math.abs(durasi(r.keluaran) - 0.2) < 0.06, `durasi ${durasi(r.keluaran)}`);

      const gagal = Promise.reject(new Error('musik: kuota/kredit ElevenLabs habis'));
      gagal.catch(() => {});
      await assert.rejects(render({...o, keluaran: path.join(dir, 'b.mp4'), tungguAudio: gagal}), /kuota\/kredit ElevenLabs habis/);
      assert.equal(existsSync(path.join(dir, 'b.mp4')), false);
    } finally { rmSync(dir, {recursive: true, force: true}); }
  });
