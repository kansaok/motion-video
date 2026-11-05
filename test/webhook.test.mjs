/* P6-08: webhook render. URL privat/http ditolak; kiriman ditandatangani HMAC dan sampai ke server
   HTTPS sungguhan (sertifikat uji untuk `webhook.uji`, resolver disuntik ke 127.0.0.1). */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import https from 'node:https';
import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import * as W from '../mcp/webhook.mjs';

process.env.UNDUH_RAHASIA ||= 'r'.repeat(40);
process.env.DATA_DIR ||= mkdtempSync(path.join(os.tmpdir(), 'motion-webhook-data-'));

const publikPalsu = (peta) => async (host) => {
  const a = peta[host];
  if (!a) throw new Error(`host ${host} mengarah ke jaringan privat`);
  return a;
};

test('periksaWebhook: http, kredensial, IP/host privat, dan URL rusak ditolak sebelum render', async () => {
  const tolak = async (url, re, o) => assert.rejects(W.periksaWebhook(url, o), re, url);
  await tolak('http://contoh.id/hook', /harus https/);
  await tolak('https://user:rahasia@contoh.id/hook', /kredensial/);
  await tolak('bukan url', /bukan URL/);
  await tolak(`https://contoh.id/${'x'.repeat(600)}`, /lebih dari 500/);
  // Penjaga sungguhan (lib/jaring.mjs), tanpa DNS: literal IP privat.
  for (const ip of ['127.0.0.1', '10.1.2.3', '169.254.169.254', '[::1]', '192.168.1.1', '172.18.0.1']) {
    await tolak(`https://${ip}/hook`, /ditolak: .* tidak ter-resolve ke alamat publik/);
  }
  // Nama host yang ter-resolve ke jaringan dalam.
  await tolak('https://bimp-api.internal/hook', /ditolak/, {publik: publikPalsu({})});
  assert.equal((await W.periksaWebhook('https://hook.contoh.id/a?b=1', {publik: publikPalsu({'hook.contoh.id': ['93.184.216.34']})})).hostname, 'hook.contoh.id');
});

test('tanda tangan: benar lolos; body diubah, rahasia lain, atau waktu lama ditolak', () => {
  const r = W.rahasiaWebhook('r-abc');
  assert.equal(r, W.rahasiaWebhook('r-abc'));
  assert.notEqual(r, W.rahasiaWebhook('r-abd'));
  assert.throws(() => W.rahasiaWebhook('r-abc', ''), /UNDUH_RAHASIA/);
  const now = 1_800_000_000_000, waktu = String(now / 1000), body = '{"render":"r-abc"}';
  const t = W.tanda(r, waktu, body);
  assert.match(t, /^sha256=[0-9a-f]{64}$/);
  assert.equal(W.cekTanda(r, waktu, body, t, {sekarang: now}), true);
  assert.equal(W.cekTanda(r, waktu, body.replace('abc', 'abd'), t, {sekarang: now}), false);
  assert.equal(W.cekTanda(W.rahasiaWebhook('lain'), waktu, body, t, {sekarang: now}), false);
  assert.equal(W.cekTanda(r, waktu, body, t, {sekarang: now + 301_000}), false);
});

/* Server HTTPS lokal dengan sertifikat untuk webhook.uji; tiap tes menentukan jawabannya. */
const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-webhook-'));
execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1', '-subj', '/CN=webhook.uji',
  '-addext', 'subjectAltName=DNS:webhook.uji', '-keyout', path.join(dir, 'k.pem'), '-out', path.join(dir, 'c.pem')], {stdio: 'ignore'});
const cert = readFileSync(path.join(dir, 'c.pem'));
let jawab = [200];
const masuk = [];
const srv = https.createServer({key: readFileSync(path.join(dir, 'k.pem')), cert}, (req, res) => {
  let body = '';
  req.on('data', (b) => { body += b; });
  req.on('end', () => {
    masuk.push({url: req.url, host: req.headers.host, waktu: req.headers['x-motion-waktu'], tanda: req.headers['x-motion-tanda'],
      jenis: req.headers['content-type'], sni: /** @type {any} */ (req.socket).servername, body});
    res.writeHead(jawab.length > 1 ? jawab.shift() : jawab[0]).end();
  });
});
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const PORT = /** @type {any} */ (srv.address()).port;
test.after(() => { srv.close(); rmSync(dir, {recursive: true, force: true}); });

const URL_UJI = `https://webhook.uji:${PORT}/hook?proyek=1`;
const opsi = (o = {}) => ({publik: publikPalsu({'webhook.uji': ['127.0.0.1']}), tls: {ca: cert}, tunggu: async () => {}, ...o});

test('kirimWebhook: POST bertanda tangan ke IP yang diperiksa, dengan SNI dan Host nama aslinya', async () => {
  masuk.length = 0; jawab = [200];
  const r = W.rahasiaWebhook('r-1');
  const h = await W.kirimWebhook(URL_UJI, {peristiwa: 'render.selesai', render: 'r-1'}, r, opsi());
  assert.deepEqual(h, {terkirim: true, status: 200, percobaan: 1});
  const [m] = masuk;
  assert.deepEqual([m.url, m.host, m.sni, m.jenis], ['/hook?proyek=1', `webhook.uji:${PORT}`, 'webhook.uji', 'application/json']);
  assert.equal(W.cekTanda(r, m.waktu, m.body, m.tanda), true);
  assert.deepEqual(JSON.parse(m.body), {peristiwa: 'render.selesai', render: 'r-1'});
});

test('kirimWebhook: 503/429 diulang dengan jeda; 4xx lain tidak; rebinding ke IP privat saat kirim ditolak', async () => {
  masuk.length = 0; jawab = [503, 429, 200];
  const jeda = [];
  let h = await W.kirimWebhook(URL_UJI, {a: 1}, 'r', opsi({tunggu: async (ms) => { jeda.push(ms); }}));
  assert.deepEqual([h.terkirim, h.percobaan, masuk.length], [true, 3, 3]);
  assert.deepEqual(jeda, W.WEBHOOK.jedaMs);

  masuk.length = 0; jawab = [410];
  h = await W.kirimWebhook(URL_UJI, {a: 1}, 'r', opsi());
  assert.deepEqual([h.terkirim, h.status, h.percobaan, masuk.length], [false, 410, 1, 1]);

  // Saat render diantrekan host-nya publik; saat dikirim DNS-nya berganti ke jaringan dalam.
  masuk.length = 0; jawab = [200];
  h = await W.kirimWebhook(URL_UJI, {a: 1}, 'r', opsi({publik: publikPalsu({})}));
  assert.deepEqual([h.terkirim, h.percobaan, masuk.length], [false, 1, 0]);
  assert.match(h.galat, /ditolak/);
});

test('kabariWebhook: isi selesai/gagal, rahasia per render, hasil pengiriman disimpan tanpa rahasia', async () => {
  const {kabariWebhook} = await import('../mcp/antrean.mjs');
  const dikirim = [], disimpan = [];
  const t = {id: 'r-77', uid: 5, proyek: 'p', status: 'selesai', selesai: 'x', hasil: {mp4: 'https://unduh/x.mp4'}, opsi: {webhook: 'https://a.id/h'}};
  await kabariWebhook(t, {kirim: async (url, isi, rahasia) => { dikirim.push({url, isi, rahasia}); return {terkirim: true, status: 200, percobaan: 1}; },
    simpan: (x) => disimpan.push(JSON.stringify(x))});
  assert.deepEqual(dikirim[0], {url: 'https://a.id/h', rahasia: W.rahasiaWebhook('r-77'),
    isi: {peristiwa: 'render.selesai', render: 'r-77', proyek: 'p', status: 'selesai', selesai: 'x', hasil: {mp4: 'https://unduh/x.mp4'}}});
  assert.deepEqual(t.webhook, {keadaan: 'terkirim', http: 200, percobaan: 1});
  assert.equal(disimpan.length, 2);
  assert.ok(disimpan.every((s) => !s.includes(W.rahasiaWebhook('r-77'))), 'rahasia tidak boleh tersimpan');

  const g = {id: 'r-78', uid: 5, proyek: 'p', status: 'gagal', selesai: 'y', galat: 'Chromium mati', opsi: {webhook: 'https://a.id/h'}};
  await kabariWebhook(g, {kirim: async (url, isi) => { dikirim.push({isi}); return {terkirim: false, percobaan: 3, galat: 'HTTP 503'}; }, simpan: () => {}});
  assert.deepEqual(dikirim[1].isi, {peristiwa: 'render.gagal', render: 'r-78', proyek: 'p', status: 'gagal', selesai: 'y', galat: 'Chromium mati'});
  assert.deepEqual(g.webhook, {keadaan: 'gagal', percobaan: 3, galat: 'HTTP 503'});
});

test('alat MCP render: webhook http/privat ditolak sebelum proyek dibuka', async () => {
  const {Client} = await import('@modelcontextprotocol/sdk/client/index.js');
  const {InMemoryTransport} = await import('@modelcontextprotocol/sdk/inMemory.js');
  const {buatServer} = await import('../mcp/alat.mjs');
  const [a, b] = InMemoryTransport.createLinkedPair();
  const s = buatServer(515151);
  await s.connect(a);
  const k = new Client({name: 'uji', version: '0'});
  await k.connect(b);
  try {
    const teks = async (webhook) => (await k.callTool({name: 'render', arguments: {proyek: 'p-tidakada', webhook}})).content.map((x) => x.text).join(' ');
    assert.match(await teks('http://contoh.id/h'), /harus https/);
    assert.match(await teks('https://169.254.169.254/latest/meta-data'), /ditolak/);
    const {tools} = await k.listTools();
    assert.ok(tools.find((t) => t.name === 'render').inputSchema.properties.webhook);
  } finally { await k.close(); await s.close(); }
});
