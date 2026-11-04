import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtempSync, mkdirSync, writeFileSync, existsSync, utimesSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

// DATA dibaca saat modul proyek dimuat, jadi harus diset sebelum impor dinamis.
const DATA = mkdtempSync(path.join(tmpdir(), 'motion-data-'));
process.env.DATA_DIR = DATA;
const Pr = await import('../mcp/proyek.mjs');
const {log} = await import('../mcp/log.mjs');
const {buatRegistri, bolehMetrik} = await import('../mcp/metrik.mjs');
const {kesiapan} = await import('../mcp/sehat.mjs');

test('log satu baris JSON tanpa token, naskah, atau URL', () => {
  let keluar = '';
  log('info', 'unggah', {uid: 7, token: 'rahasia', vo: [{no: 1, text: 'naskah iklan'}], url: 'https://x/?sig=1', ms: 12},
    (b) => { keluar += b; });
  assert.equal(keluar.split('\n').filter(Boolean).length, 1);
  const j = JSON.parse(keluar);
  assert.equal(j.level, 'info');
  assert.equal(j.uid, 7);
  assert.equal(j.ms, 12);
  assert.deepEqual(j.vo, [{no: 1}]);
  assert.doesNotMatch(keluar, /rahasia|naskah iklan|sig=1/);
});

test('registri menghasilkan format Prometheus untuk counter, gauge, dan histogram', async () => {
  const r = buatRegistri();
  const c = r.counter('uji_total', 'uji');
  c.tambah({status: 'selesai'}); c.tambah({status: 'selesai'}); c.tambah({status: 'gagal'});
  r.gauge('uji_antre', 'uji', () => 3);
  r.gauge('uji_akun', 'uji', () => [[{hari: '1'}, 2], [{hari: '7'}, 5]]);
  r.histogram('uji_detik', 'uji', [10, 60]).amati(42, {langkah: 'render'});
  const t = await r.teks();
  assert.match(t, /^# TYPE uji_total counter$/m);
  assert.match(t, /^uji_total\{status="selesai"\} 2$/m);
  assert.match(t, /^uji_antre 3$/m);
  assert.match(t, /^uji_akun\{hari="7"\} 5$/m);
  assert.match(t, /^uji_detik_bucket\{langkah="render",le="10"\} 0$/m);
  assert.match(t, /^uji_detik_bucket\{langkah="render",le="60"\} 1$/m);
  assert.match(t, /^uji_detik_bucket\{langkah="render",le="\+Inf"\} 1$/m);
  assert.match(t, /^uji_detik_sum\{langkah="render"\} 42$/m);
});

test('/metrik hanya untuk alamat internal yang tidak lewat reverse proxy', () => {
  assert.equal(bolehMetrik('127.0.0.1', {}), true);
  assert.equal(bolehMetrik('::ffff:172.18.0.5', {}), true);
  assert.equal(bolehMetrik('8.8.8.8', {}), false);
  assert.equal(bolehMetrik('172.18.0.2', {'x-forwarded-for': '203.0.113.9'}), false);
  assert.equal(bolehMetrik(undefined, {}), false);
});

test('kesiapan gagal sebelum disk penuh dan menyebut alasannya', () => {
  const ok = {dir: DATA, cekFfmpeg: () => true, cekChromium: () => true};
  assert.equal(kesiapan({...ok, bebas: () => 10_000, minDiskMb: 4096}).siap, true);
  const penuh = kesiapan({...ok, bebas: () => 900, minDiskMb: 4096});
  assert.equal(penuh.siap, false);
  assert.match(penuh.alasan.join(), /disk tersisa 900 MB, minimal 4096 MB/);
  const tanpaAlat = kesiapan({dir: DATA, cekFfmpeg: () => false, cekChromium: () => false, bebas: () => 10_000});
  assert.deepEqual(tanpaAlat.alasan, ['ffmpeg tidak dapat dijalankan', 'Chromium Playwright tidak ditemukan']);
});

function proyek(uid, id, jamLalu, {render} = {}) {
  const dir = path.join(DATA, 'u', String(uid), id);
  for (const d of ['src', 'stem', 'cuplikan', 'aset/vo']) mkdirSync(path.join(dir, d), {recursive: true});
  writeFileSync(path.join(dir, 'stem', 'vo.wav'), Buffer.alloc(2048));
  writeFileSync(path.join(dir, 'aset', 'master.wav'), Buffer.alloc(1024));
  writeFileSync(path.join(dir, 'aset', 'vo', 'vo-01.mp3'), 'vo berbayar');
  writeFileSync(path.join(dir, 'src', 'Video.html'), '<html>');
  if (render) writeFileSync(path.join(dir, 'render.json'), JSON.stringify({status: render}));
  const m = path.join(dir, 'meta.json');
  writeFileSync(m, JSON.stringify({id}));
  const t = new Date(Date.now() - jamLalu * 3600e3);
  utimesSync(m, t, t);
  return dir;
}

test('retensi membuang hasil antara dulu, proyek utuh baru di hari terakhir', () => {
  const baru = proyek(1, 'baru', 2);
  const kemarin = proyek(1, 'kemarin', 30);
  const dirender = proyek(2, 'dirender', 30, {render: 'jalan'});
  const tua = proyek(2, 'tua', (Pr.BATAS.retensiHari + 1) * 24);
  const h = Pr.bersihkan();
  assert.equal(h.proyek, 1);
  assert.equal(h.ringan, 3);
  assert.equal(h.byte, 2048 + 1024);
  assert.equal(existsSync(tua), false);
  assert.equal(existsSync(path.join(kemarin, 'stem')), false);
  assert.equal(existsSync(path.join(kemarin, 'aset', 'master.wav')), false);
  assert.equal(existsSync(path.join(kemarin, 'aset', 'vo', 'vo-01.mp3')), true, 'VO berbayar tidak dibuang');
  assert.equal(existsSync(path.join(kemarin, 'src', 'Video.html')), true);
  assert.equal(existsSync(path.join(baru, 'stem')), true, 'proyek yang baru disentuh tidak diganggu');
  assert.equal(existsSync(path.join(dirender, 'stem')), true, 'render berjalan tidak kehilangan stem');
  assert.equal(Pr.sisaHari({dir: kemarin}), Pr.BATAS.retensiHari - 1);
  assert.equal(Pr.akunAktif(1), 1);
  assert.equal(Pr.akunAktif(7), 2);
});
