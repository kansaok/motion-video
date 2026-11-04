/* P6-02: render parsial. Hitungan rentang dan pemilihan scene diuji tanpa Chromium (jalan di CI);
   render potongan sungguhan diuji dengan komposisi mini bila Chromium terpasang. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

// Viewport kecil: komposisi uji 540x960 tidak butuh 2200x2400, dan VIEWPORT dibaca saat modul dimuat.
process.env.MOTION_VIEWPORT ||= '800x1200';
process.env.DATA_DIR ||= mkdtempSync(path.join(os.tmpdir(), 'motion-parsial-data-'));
const R = await import('../lib/render.mjs');
const Pipa = await import('../lib/pipa.mjs');
const {durasi, volume} = await import('../lib/ff.mjs');

test('rentangFrame: tanpa rentang sama seperti dulu; rentang dipetakan ke frame video asli', () => {
  assert.deepEqual(R.rentangFrame(90, 30), {f0: 0, n: 2700, parsial: false});
  assert.deepEqual(R.rentangFrame(90, 30, {batasFrame: 60}), {f0: 0, n: 60, parsial: false});
  // Scene ke-5 di 48,2-61,5 dtk: 399 frame mulai frame 1446, bukan 1845 frame dari nol.
  assert.deepEqual(R.rentangFrame(90, 30, {dari: 48.2, sampai: 61.5}), {f0: 1446, n: 399, parsial: true});
  assert.deepEqual(R.rentangFrame(90, 30, {dari: 80}), {f0: 2400, n: 300, parsial: true});
  assert.deepEqual(R.rentangFrame(90, 30, {sampai: 2}), {f0: 0, n: 60, parsial: true});
  // `sampai` lewat akhir video dijepit; `frames` tetap membatasi potongan.
  assert.deepEqual(R.rentangFrame(10, 30, {dari: 9, sampai: 99}), {f0: 270, n: 30, parsial: true});
  assert.deepEqual(R.rentangFrame(10, 30, {dari: 2, sampai: 8, batasFrame: 15}), {f0: 60, n: 15, parsial: true});
  for (const r of [{dari: 10}, {dari: 12, sampai: 14}, {dari: 3, sampai: 3}, {dari: 5, sampai: 4}, {dari: -1, sampai: 2}, {dari: NaN}]) {
    assert.throws(() => R.rentangFrame(10, 30, r), /rentang render tidak sah/, JSON.stringify(r));
  }
});

test('rentangScene dari timeline hasil plan; namaPotongan tidak pernah menimpa MP4 penuh', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-parsial-'));
  try {
    writeFileSync(path.join(dir, 'timeline.json'), JSON.stringify([{name: 'Hook', dur: 3.2}, {name: 'Masalah', dur: 6.45}, {name: 'CTA', dur: 4}]));
    /** @type {any} */
    const c = {dir, htmlUtama: path.join(dir, 'x.html')};
    assert.deepEqual(Pipa.rentangScene(c, 'Masalah'), {dari: 3.2, sampai: 9.65, nama: 'Masalah'});
    assert.deepEqual(Pipa.rentangScene(c, '3'), {dari: 9.65, sampai: 13.65, nama: 'CTA'});
    assert.deepEqual(Pipa.rentangScene(c, 1), {dari: 0, sampai: 3.2, nama: 'Hook'});
    assert.throws(() => Pipa.rentangScene(c, 'Solusi'), /scene "Solusi" tidak ada; pilihan: 1 Hook, 2 Masalah, 3 CTA/);
    assert.throws(() => Pipa.rentangScene(c, '4'), /tidak ada/);
    assert.equal(Pipa.namaPotongan('iklan-9x16.mp4', {dari: 3.2, sampai: 9.65}), 'iklan-9x16-potong-3.20-9.65.mp4');
    assert.equal(Pipa.namaPotongan('iklan.mp4', {dari: 80}), 'iklan-potong-80.00-akhir.mp4');
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

test('alat MCP render: `scene` dan `dari`/`sampai` tidak boleh bersamaan; rentang terbalik ditolak', async () => {
  const {Client} = await import('@modelcontextprotocol/sdk/client/index.js');
  const {InMemoryTransport} = await import('@modelcontextprotocol/sdk/inMemory.js');
  const {buatServer} = await import('../mcp/alat.mjs');
  const [a, b] = InMemoryTransport.createLinkedPair();
  const s = buatServer(424242);
  await s.connect(a);
  const k = new Client({name: 'uji', version: '0'});
  await k.connect(b);
  try {
    const panggil = async (argumen) => {
      const r = await k.callTool({name: 'render', arguments: {proyek: 'p-tidakada', ...argumen}});
      return {galat: Boolean(r.isError), teks: r.content.map((x) => x.text).join(' ')};
    };
    assert.match((await panggil({scene: 'Hook', dari: 1})).teks, /`scene` ATAU `dari`\/`sampai`/);
    assert.match((await panggil({dari: 5, sampai: 2})).teks, /`sampai` harus lebih besar/);
    // Parameter sah melewati pemeriksaan ini dan baru gagal di proyek yang tidak ada.
    const r = await panggil({scene: 2});
    assert.equal(r.galat, true);
    assert.doesNotMatch(r.teks, /ATAU|harus lebih besar/);
    const {tools} = await k.listTools();
    const sk = tools.find((t) => t.name === 'render').inputSchema.properties;
    assert.ok(sk.scene && sk.dari && sk.sampai);
  } finally { await k.close(); await s.close(); }
});

let chromiumAda = false;
try {
  const {chromium} = await import('playwright');
  chromiumAda = existsSync(chromium.executablePath());
} catch { /* Chromium tidak ada: tes render sungguhan dilewati */ }

/* Komposisi 4 dtk: latar berganti tiap detik (merah, hijau, biru, putih). Master audio 4 dtk:
   nada hanya di detik 2-3. Potongan 2-3 harus biru dan berbunyi; potongan 1-2 hijau dan senyap. */
const HTML = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#000}
#s{width:540px;height:960px}</style></head><body><div id="s" data-om-exportable-video-with-duration-secs="4"></div><script>
const W = ['#ff0000', '#00ff00', '#0000ff', '#ffffff'], s = document.getElementById('s');
s.style.background = W[0];
s.addEventListener('data-om-seek-to-time-frame', (e) => { s.style.background = W[Math.min(3, Math.floor(Number(e.detail.time) + 1e-6))]; });
</script></body></html>`;

const warnaFrame = (mp4, t) => [...execFileSync('ffmpeg', ['-v', 'error', '-ss', String(t), '-i', mp4, '-frames:v', '1',
  '-vf', 'scale=1:1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'])];

test('render potongan: frame dari waktu video asli, audio ikut dipotong, tanpa sampul',
  {skip: !chromiumAda && 'Chromium tidak terpasang', timeout: 180_000}, async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-parsial-'));
    try {
      writeFileSync(path.join(dir, 'V.html'), HTML);
      const audio = path.join(dir, 'master.wav');
      execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo:d=2', '-f', 'lavfi', '-i', 'sine=f=440:d=1:sample_rate=48000',
        '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo:d=1', '-filter_complex', '[1]aformat=channel_layouts=stereo,volume=0.5[n];[0][n][2]concat=n=3:v=0:a=1', audio]);
      const potong = async (dari, sampai) => {
        const keluaran = path.join(dir, Pipa.namaPotongan('v.mp4', {dari, sampai}));
        const r = await R.render({dirSrc: dir, berkas: 'V.html', audio, keluaran, fps: 10, tab: 2, dari, sampai,
          sampul: {detik: 0}, dirProyek: dir});
        return {r, keluaran};
      };
      const {r, keluaran} = await potong(2, 3);
      assert.deepEqual([r.frame, r.dari, r.sampai, r.sampul], [10, 2, 3, null]);
      assert.ok(Math.abs(durasi(keluaran) - 1) < 0.15, `durasi ${durasi(keluaran)}`);
      const [m, h, bi] = warnaFrame(keluaran, 0.05);
      assert.ok(bi > 200 && m < 60 && h < 60, `frame pertama potongan 2-3 harus biru: ${[m, h, bi]}`);
      assert.ok(volume(keluaran).rata > -45, `potongan 2-3 harus berbunyi (nada uji ±-30 dB): ${volume(keluaran).rata} dB`);
      assert.equal(existsSync(keluaran.replace(/\.mp4$/, '-sampul.jpg')), false);

      const b = await potong(1, 2);
      const [m2, h2, b2] = warnaFrame(b.keluaran, 0.05);
      assert.ok(h2 > 200 && m2 < 60 && b2 < 60, `potongan 1-2 harus hijau: ${[m2, h2, b2]}`);
      assert.ok((volume(b.keluaran).rata ?? -99) < -60, `potongan 1-2 harus senyap: ${volume(b.keluaran).rata} dB`);
    } finally { rmSync(dir, {recursive: true, force: true}); }
  });
