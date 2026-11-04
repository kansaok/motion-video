/* P5-03: perilaku ulang klien ElevenLabs diuji terhadap server tiruan di 127.0.0.1.
   Tidak ada permintaan ke ElevenLabs sungguhan: `EL.dasar.url` diarahkan ke server lokal dan
   kuncinya palsu. */
import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdirSync, mkdtempSync, rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import * as EL from '../lib/el.mjs';
import {vo} from '../lib/vo.mjs';
import {sfx} from '../lib/sfx.mjs';

process.env.ELEVENLABS_API_KEY = 'kunci-uji-bukan-asli';

/* Server yang menjawab dari daftar skenario berurutan; elemen terakhir dipakai terus.
   Tiap skenario: {status, isi, header} atau 'gantung' (tidak pernah menjawab). */
async function tiruan(skenario) {
  const masuk = [];
  const srv = http.createServer((req, res) => {
    masuk.push({metode: req.method, url: req.url, kunci: req.headers['xi-api-key']});
    const s = skenario[Math.min(masuk.length - 1, skenario.length - 1)];
    if (s === 'gantung') return;
    res.writeHead(s.status, s.header || {});
    res.end(s.isi ?? '');
  });
  await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
  const url = `http://127.0.0.1:${/** @type {any} */ (srv.address()).port}`;
  const asal = EL.dasar.url;
  EL.dasar.url = url;
  return {url, masuk, tutup: () => { EL.dasar.url = asal; srv.closeAllConnections(); srv.close(); }};
}

const catatTunggu = () => {
  const t = [];
  return {t, tunggu: async (/** @type {number} */ ms) => { t.push(ms); }};
};

test('503 lalu 200: diulang, jeda 2,5 dtk × percobaan', async () => {
  const s = await tiruan([{status: 503, isi: 'service_unavailable'}, {status: 200, isi: 'ok'}]);
  try {
    const {t, tunggu} = catatTunggu();
    const r = await EL.kirim(`${s.url}/x`, {}, {tunggu});
    assert.equal(await r.text(), 'ok');
    assert.equal(s.masuk.length, 2);
    assert.deepEqual(t, [2500]);
  } finally { s.tutup(); }
});

test('429 menghormati Retry-After (detik dan tanggal HTTP), dibatasi 60 dtk', async () => {
  const s = await tiruan([
    {status: 429, isi: '{"detail":{"status":"system_busy"}}', header: {'Retry-After': '7'}},
    {status: 429, isi: 'rate_limit_exceeded', header: {'Retry-After': '900'}},
    {status: 200, isi: 'ok'},
  ]);
  try {
    const {t, tunggu} = catatTunggu();
    await EL.kirim(`${s.url}/x`, {}, {tunggu});
    assert.deepEqual(t, [7000, 60000]);
  } finally { s.tutup(); }
  const sekarang = Date.parse('2026-11-04T10:00:00Z');
  assert.equal(EL.tungguUlang('Wed, 04 Nov 2026 10:00:12 GMT', 1, sekarang), 12000);
  assert.equal(EL.tungguUlang('bukan-tanggal', 2), 5000);
  assert.equal(EL.tungguUlang(null, 3), 7500);
});

for (const [status, isi] of [[401, '{"detail":{"status":"invalid_api_key"}}'], [422, '{"detail":"text too long"}'],
  [403, '{"detail":{"status":"voice_access_denied"}}']]) {
  test(`${status} tidak diulang`, async () => {
    const s = await tiruan([{status, isi}, {status: 200, isi: 'ok'}]);
    try {
      const {t, tunggu} = catatTunggu();
      await assert.rejects(EL.kirim(`${s.url}/x`, {}, {tunggu}),
        (e) => e instanceof EL.GalatEL && e.status === status && !e.ulang && !e.kuota);
      assert.equal(s.masuk.length, 1);
      assert.deepEqual(t, []);
    } finally { s.tutup(); }
  });
}

// Docs ElevenLabs: quota_exceeded datang sebagai 400 atau 401, insufficient_credits sebagai 402.
for (const [status, isi] of [[401, '{"detail":{"status":"quota_exceeded","message":"This request exceeds your quota"}}'],
  [400, '{"detail":{"status":"quota_exceeded"}}'], [402, '{"detail":{"code":"insufficient_credits"}}']]) {
  test(`kuota habis (${status}) tidak diulang dan ditandai kuota`, async () => {
    const s = await tiruan([{status, isi}]);
    try {
      await assert.rejects(EL.kirim(`${s.url}/x`, {}, {tunggu: async () => {}}),
        (e) => e instanceof EL.GalatEL && e.kuota && /kuota\/kredit ElevenLabs habis/.test(e.message));
      assert.equal(s.masuk.length, 1);
    } finally { s.tutup(); }
  });
}

test('5xx terus-menerus: berhenti sesudah 3 percobaan dan menyebutnya', async () => {
  const s = await tiruan([{status: 500, isi: 'internal_error'}]);
  try {
    await assert.rejects(EL.kirim(`${s.url}/x`, {}, {tunggu: async () => {}}),
      (e) => e instanceof EL.GalatEL && e.ulang && /^500 internal_error \(sesudah 3 percobaan\)$/.test(e.message));
    assert.equal(s.masuk.length, 3);
  } finally { s.tutup(); }
});

test('server yang menggantung: timeout, diulang, lalu galat yang menyebut batasnya', async () => {
  const s = await tiruan(['gantung']);
  try {
    const {t, tunggu} = catatTunggu();
    await assert.rejects(EL.kirim(`${s.url}/x`, {}, {tunggu, batasMs: 150, coba: 2}),
      (e) => e instanceof EL.GalatEL && e.ulang && /tidak menjawab dalam 0 dtk \(sesudah 2 percobaan\)/.test(e.message));
    assert.equal(s.masuk.length, 2);
    assert.deepEqual(t, [2500]);
  } finally { s.tutup(); }
});

/* Pesan galat harus menyebut baris VO, dan kuota habis harus menghentikan rantai di baris
   itu: baris berikutnya tidak pernah diminta. */
test('vo(): kuota habis di baris pertama menyebut barisnya dan berhenti', async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-el-'));
  const s = await tiruan([{status: 401, isi: '{"detail":{"status":"quota_exceeded"}}'}]);
  try {
    mkdirSync(path.join(dir, 'vo'), {recursive: true});
    /** @type {any} */
    const c = {aset: dir, suara: {id: 'suara-uji', seed: 1},
      vo: [{no: 7, sc: 'A', text: 'Kalimat ketujuh yang ditolak.'}, {no: 8, sc: 'A', text: 'Tidak pernah diminta.'}]};
    await assert.rejects(vo(c), (e) => e.kuota === true && /^VO-7 \("Kalimat ketujuh/.test(e.message));
    assert.equal(s.masuk.length, 1);
    assert.match(s.masuk[0].url, /^\/v1\/text-to-speech\/suara-uji/);
    assert.equal(s.masuk[0].kunci, 'kunci-uji-bukan-asli');
  } finally { s.tutup(); rmSync(dir, {recursive: true, force: true}); }
});

test('sfx(): galat menyebut nama SFX', async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-el-'));
  const s = await tiruan([{status: 422, isi: '{"detail":"duration_seconds out of range"}'}]);
  try {
    mkdirSync(path.join(dir, 'sfx'), {recursive: true});
    /** @type {any} */
    const c = {aset: dir, sfx: [['desir-panel', 1.2, 'soft whoosh']]};
    await assert.rejects(sfx(c), (e) => /^SFX "desir-panel": 422 /.test(e.message));
    assert.equal(s.masuk.length, 1);
  } finally { s.tutup(); rmSync(dir, {recursive: true, force: true}); }
});

test('golongkan: hanya 429 dan 5xx yang boleh diulang', () => {
  assert.deepEqual(EL.golongkan(429, 'concurrent_limit_exceeded'), {kuota: false, ulang: true});
  assert.deepEqual(EL.golongkan(502, ''), {kuota: false, ulang: true});
  assert.deepEqual(EL.golongkan(404, 'voice_not_found'), {kuota: false, ulang: false});
  assert.deepEqual(EL.golongkan(429, 'quota_exceeded'), {kuota: true, ulang: false});
});
