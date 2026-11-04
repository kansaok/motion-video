import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import test from 'node:test';
import {jalankanPekerja, bersihkanFramesPekerja, buatAntrean, lingkunganPekerja, cuplikGiliran} from '../mcp/antrean.mjs';
import {mkdtemp, mkdir, writeFile, access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

function pekerjaTiruan(ketikaKirim) {
  const anak = new EventEmitter();
  anak.send = (pesan) => ketikaKirim(anak, pesan);
  return () => anak;
}

test('jalankanPekerja meneruskan kemajuan dan hasil dari IPC', async () => {
  const langkah = [];
  const hasil = await jalankanPekerja({uid: 7, proyek: 'promo-123', opsi: {frames: 10}}, {
    buatProses: pekerjaTiruan((anak, pesan) => {
      assert.deepEqual(pesan, {uid: 7, proyek: 'promo-123', opsi: {frames: 10}});
      anak.emit('message', {langkah: 'mix'});
      anak.emit('message', {hasil: {mp4: 'hasil.mp4'}});
    }),
    onLangkah: (nama) => langkah.push(nama),
  });
  assert.deepEqual(langkah, ['mix']);
  assert.deepEqual(hasil, {mp4: 'hasil.mp4'});
});

test('jalankanPekerja meneruskan galat pekerja', async () => {
  await assert.rejects(() => jalankanPekerja({uid: 7, proyek: 'promo-123'}, {
    buatProses: pekerjaTiruan((anak) => anak.emit('message', {galat: 'render gagal'})),
  }), /render gagal/);
});

test('jalankanPekerja tidak mewariskan flag proses induk ke pekerja', async () => {
  let opsi;
  await jalankanPekerja({uid: 7, proyek: 'promo-123'}, {
    buatProses: (_berkas, _argumen, o) => {
      opsi = o;
      const anak = new EventEmitter();
      anak.send = () => anak.emit('message', {hasil: {}});
      return anak;
    },
  });
  assert.deepEqual(opsi.execArgv, []);
  assert.equal(opsi.detached, true);
});

test('lingkungan pekerja tidak membawa rahasia server', () => {
  const env = lingkunganPekerja({PATH: '/bin', DATA_DIR: '/data', MOTION_VIEWPORT: '1400x1600',
    BIMP_SERVICE_KEY: 'rahasia-api', UNDUH_RAHASIA: 'rahasia-unduh', MCP_DEV_TOKEN: 'token-dev'});
  assert.deepEqual(env, {PATH: '/bin', DATA_DIR: '/data', MOTION_VIEWPORT: '1400x1600'});
});

test('jalankanPekerja menghentikan grup pekerja ketika batas total terlewati', async () => {
  let dibunuh, dibersihkan;
  await assert.rejects(() => jalankanPekerja({uid: 7, proyek: 'promo-123'}, {
    batasMs: 1, macetMs: 100,
    buatProses: () => { const anak = new EventEmitter(); anak.pid = 4321; anak.send = () => {}; return anak; },
    bunuhGrup: (pid) => { dibunuh = pid; }, bersihkanFrame: (pid) => { dibersihkan = pid; },
  }), /melebihi batas waktu render/);
  assert.equal(dibunuh, 4321);
  assert.equal(dibersihkan, 4321);
});

test('jalankanPekerja menghentikan render yang tidak menambah frame', async () => {
  let dibunuh;
  await assert.rejects(() => jalankanPekerja({uid: 7, proyek: 'promo-123'}, {
    batasMs: 100, macetMs: 1,
    buatProses: () => {
      const anak = new EventEmitter();
      anak.pid = 4322;
      anak.send = () => anak.emit('message', {langkah: 'render'});
      return anak;
    },
    bunuhGrup: (pid) => { dibunuh = pid; }, bersihkanFrame: () => {},
  }), /jumlah frame tidak bertambah/);
  assert.equal(dibunuh, 4322);
});

test('bersihkanFramesPekerja hanya menghapus frame pekerja yang dihentikan', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'motion-antrean-'));
  const milik = path.join(dir, 'frames-video-4321');
  const lain = path.join(dir, 'frames-video-9876');
  await Promise.all([mkdir(milik), mkdir(lain)]);
  await writeFile(path.join(milik, '000001.jpg'), 'x');
  bersihkanFramesPekerja(4321, dir);
  await assert.rejects(() => access(milik));
  await assert.doesNotReject(() => access(lain));
});

test('cuplik membatasi satu Chromium per akun', async () => {
  let lepas;
  const pertama = cuplikGiliran(99, () => new Promise((selesai) => { lepas = selesai; }));
  await assert.rejects(() => cuplikGiliran(99, async () => {}), /masih berjalan/);
  lepas('selesai');
  assert.equal(await pertama, 'selesai');
});

const proyek = (id) => ({meta: {id}, dir: `/tmp/${id}`});

test('kirim menolak antrean penuh tanpa menjalankan pekerja', () => {
  const antrean = buatAntrean({paralel: 0, maks: 2, simpan: () => {}, tunda: () => {}});
  antrean.kirim(1, proyek('satu-aaa'), {});
  antrean.kirim(2, proyek('dua-bbb'), {});
  assert.throws(() => antrean.kirim(3, proyek('tiga-ccc'), {}), /antrean penuh/);
});

test('putar mencatat durasi, memberi estimasi, dan membuang tugas terminal lama', async () => {
  let waktu = Date.parse('2026-11-04T00:00:00.000Z');
  const antrean = buatAntrean({
    paralel: 1, maks: 3, simpan: () => {}, tunda: (fn) => queueMicrotask(fn), sekarang: () => waktu,
    kerjakanTugas: async (t) => {
      t.status = 'selesai';
      t.mulai = '2026-11-03T23:58:00.000Z';
      t.selesai = '2026-11-04T00:00:00.000Z';
    },
  });
  antrean.kirim(1, proyek('satu-aaa'), {});
  await new Promise((selesai) => setImmediate(selesai));
  const menunggu = antrean.kirim(2, proyek('dua-bbb'), {});
  const status = antrean.status(2, menunggu.id);
  assert.equal(status.estimasiTungguDetik, 120);
  waktu += 3600e3 + 1;
  antrean.bersihkan();
  assert.equal(antrean.tugas.size, 1);
});
