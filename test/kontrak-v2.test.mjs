import assert from 'node:assert/strict';
import test from 'node:test';
import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import {cp, mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import * as Pipa from '../lib/pipa.mjs';
import * as K from '../lib/komposisi.mjs';
import {layani} from '../lib/render.mjs';

const CONTOH = new URL('../contoh/kontrak-v2/', import.meta.url).pathname;

const nada = (keluar, detik, hz = 330) => execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi',
  '-i', `sine=frequency=${hz}:sample_rate=44100:duration=${detik}`, '-af', 'volume=0.5', keluar]);

async function siapkan() {
  const dir = await mkdtemp(path.join(tmpdir(), 'motion-v2-'));
  await cp(CONTOH, dir, {recursive: true});
  const c = await Pipa.muat(dir);
  [1.4, 2.6, 1.2].forEach((d, i) => nada(path.join(c.aset, 'vo', `vo-0${i + 1}.mp3`), d));
  nada(path.join(c.aset, 'sfx', 'pop.mp3'), 0.2, 880);
  return c;
}

// Isi HTML di luar deklarasi OM_SCENES; harus identik sebelum dan sesudah terap.
const tanpaScenes = (isi) => { const d = K.cariScenes(isi); return isi.slice(0, d.awal) + isi.slice(d.akhir); };

test('kontrak dideteksi dari atribut stage', () => {
  assert.equal(K.kontrak(path.join(CONTOH, 'src/Video.html')), 2);
  assert.equal(K.kontrak(new URL('fixtures/komposisi.html', import.meta.url).pathname), 1);
});

test('terap komposisi v2 hanya menulis OM_SCENES dan timing.js', async () => {
  const c = await siapkan();
  const awal = readFileSync(c.htmlUtama, 'utf8');
  const a = await Pipa.terap(c);
  assert.equal(a.kontrak, 2);
  assert.equal(a.kapsi + a.jangkar, 0);

  const akhir = readFileSync(c.htmlUtama, 'utf8');
  assert.equal(tanpaScenes(akhir), tanpaScenes(awal), 'tidak ada tambalan di luar OM_SCENES');
  // VO-02 2,6 dtk + off 0,3 tidak muat di scene Isi 3 dtk, jadi scene itu memanjang.
  const isi = K.bacaScenes(c.htmlUtama).find((s) => s.name === 'Isi');
  assert.ok(isi.dur > 3, `scene Isi memanjang (dapat ${isi.dur})`);

  const timing = readFileSync(path.join(c.src, 'timing.js'), 'utf8');
  const jendela = {};
  new Function('window', timing)(jendela);
  assert.deepEqual(jendela.VO_TIMING.map((v) => v.no), [1, 2, 3]);
  assert.deepEqual(jendela.VO_TIMING, a.timing.vo);
  const p2 = jendela.VO_TIMING[1].pos;
  assert.deepEqual(jendela.OM_CUES, [{nama: 'pop', at: +(p2 + 0.05).toFixed(3)}]);
});

test('config v1 pada komposisi v2 ditolak, bukan dilewati diam-diam', async () => {
  const c = await siapkan();
  c.jsx = 'tidak-ada.jsx'; c.kapsi = true;
  await assert.rejects(() => Pipa.terap(c), /kontrak v2.*hapus jsx, kapsi/);
});

let chromiumAda = false;
try {
  const {chromium} = await import('playwright');
  chromiumAda = existsSync(chromium.executablePath());
} catch { /* playwright/Chromium tidak terpasang: tes render di bawah dilewati */ }

test('komposisi v2 menampilkan kapsi dari VO_TIMING dan dapat dirender', {skip: !chromiumAda && 'Chromium tidak terpasang', timeout: 180_000}, async () => {
  const c = await siapkan();
  const a = await Pipa.terap(c);

  const {chromium} = await import('playwright');
  const srv = await layani(c.src);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${srv.port}/Video.html`);
    const kapsiDi = (t) => page.evaluate((time) => {
      const s = document.getElementById('stage');
      s.dispatchEvent(new CustomEvent('data-om-seek-to-time-frame', {detail: {time}}));
      return document.getElementById('kapsi').textContent;
    }, t);
    const [, v2] = a.timing.vo;
    assert.equal(await kapsiDi(v2.pos + 0.1), 'Kapsi ikut suara, tanpa tambalan');
    assert.equal(await kapsiDi(v2.pos - 0.3), '', 'kapsi belum muncul sebelum kalimatnya');
    const total = await page.locator('#stage').getAttribute('data-om-exportable-video-with-duration-secs');
    assert.equal(Number(total), +a.timing.total.toFixed(2));
  } finally { await browser.close(); srv.tutup(); }

  await Pipa.mix(c);
  const r = await Pipa.render(c, {batasFrame: 6, tab: 2});
  assert.ok(existsSync(r.keluaran));
});
