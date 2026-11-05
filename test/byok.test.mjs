/* P8-12 BYOK: kunci ElevenLabs pelanggan disimpan terenkripsi dan dipakai server untuk `buat_vo`.
   Server ElevenLabs tiruan mencatat kunci di tiap permintaan; tidak ada panggilan sungguhan. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import http from 'node:http';
import {existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

process.env.DATA_DIR ||= mkdtempSync(path.join(os.tmpdir(), 'motion-byok-data-'));
process.env.UNDUH_RAHASIA ||= 'r'.repeat(40);
process.env.KUNCI_ENKRIPSI = 'k'.repeat(48);
const RK = await import('../mcp/rahasia.mjs');
const Pr = await import('../mcp/proyek.mjs');
const EL = await import('../lib/el.mjs');
const {periksaLingkungan} = await import('../mcp/env.mjs');
const {buatServer} = await import('../mcp/alat.mjs');
test.after(() => rmSync(process.env.DATA_DIR, {recursive: true, force: true}));

const KUNCI_A = 'sk_pelanggan_A_0123456789abcdef', KUNCI_B = 'sk_pelanggan_B_0123456789abcdef';

test('rahasia: terenkripsi, terikat uid, 0600, dan butuh KUNCI_ENKRIPSI yang sama', () => {
  const akar = mkdtempSync(path.join(os.tmpdir(), 'motion-rahasia-'));
  try {
    RK.simpan(7, KUNCI_A, {akar});
    const f = path.join(akar, 'rahasia', '7.json');
    assert.ok(!readFileSync(f, 'utf8').includes('pelanggan_A'), 'kunci tersimpan polos');
    assert.equal(statSync(f).mode & 0o777, 0o600);
    assert.equal(RK.baca(7, {akar}), KUNCI_A);
    // Berkas akun 7 disalin ke akun 8: AAD uid menolaknya.
    writeFileSync(path.join(akar, 'rahasia', '8.json'), readFileSync(f));
    assert.throws(() => RK.baca(8, {akar}), /tidak bisa dibuka/);
    // Rahasia server dirotasi: galat jelas, bukan isi sampah.
    assert.throws(() => RK.baca(7, {akar, env: {KUNCI_ENKRIPSI: 'x'.repeat(48)}}), /simpan ulang/);
    assert.equal(RK.aktif({KUNCI_ENKRIPSI: 'pendek'}), false);
    assert.throws(() => RK.simpan(9, KUNCI_A, {akar, env: {}}), /belum diaktifkan/);
    assert.throws(() => periksaLingkungan({NODE_ENV: 'production', UNDUH_RAHASIA: 'u'.repeat(40), BIMP_API_URL: 'x',
      BIMP_SERVICE_KEY: 'y', KUNCI_ENKRIPSI: 'pendek'}), /KUNCI_ENKRIPSI/);
  } finally { rmSync(akar, {recursive: true, force: true}); }
});

// Server ElevenLabs tiruan: catat kunci tiap permintaan; kunci yang diawali "sk_salah" ditolak 401.
const MP3 = execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono:d=0.2',
  '-f', 'lavfi', '-i', 'sine=f=300:d=0.7:sample_rate=44100', '-filter_complex', '[0][1]concat=n=2:v=0:a=1', '-f', 'mp3', '-']);
/** @type {Array<{jalur: string, kunci: string}>} */
let masuk = [];
const srv = http.createServer(async (req, res) => {
  for await (const _ of req);
  const kunci = String(req.headers['xi-api-key']);
  masuk.push({jalur: req.url.split('?')[0], kunci});
  await new Promise((r) => setTimeout(r, 30));
  if (kunci.startsWith('sk_salah')) { res.writeHead(401).end('{"detail":{"status":"invalid_api_key"}}'); return; }
  if (req.url.startsWith('/v1/user/subscription')) { res.writeHead(200, {'content-type': 'application/json'}).end('{"character_count":10,"character_limit":1000}'); return; }
  res.writeHead(200).end(MP3);
});
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
EL.dasar.url = `http://127.0.0.1:${/** @type {any} */ (srv.address()).port}`;
test.after(() => { srv.closeAllConnections(); srv.close(); });

test('denganKunci: dua akun bersamaan tidak saling tertukar kunci', async () => {
  masuk = [];
  await Promise.all([EL.denganKunci(KUNCI_A, () => EL.kuota()), EL.denganKunci(KUNCI_B, () => EL.kuota()),
    EL.denganKunci(KUNCI_A, () => EL.kuota())]);
  assert.deepEqual(masuk.map((x) => x.kunci).sort(), [KUNCI_A, KUNCI_A, KUNCI_B]);
});

async function klien(uid) {
  const {Client} = await import('@modelcontextprotocol/sdk/client/index.js');
  const {InMemoryTransport} = await import('@modelcontextprotocol/sdk/inMemory.js');
  const [a, b] = InMemoryTransport.createLinkedPair();
  const s = buatServer(uid);
  await s.connect(a);
  const k = new Client({name: 'uji', version: '0'});
  await k.connect(b);
  const panggil = async (nama, argumen = {}) => {
    const r = await k.callTool({name: nama, arguments: argumen});
    return {galat: Boolean(r.isError), teks: r.content.map((x) => x.text).join(' ')};
  };
  return {panggil, tutup: async () => { await k.close(); await s.close(); }};
}

test('kunci_elevenlabs + buat_vo: kunci diperiksa, tidak dikembalikan, dipakai untuk TTS; baris sama dilewati', async () => {
  assert.equal(process.env.MOTION_CACHE_VO, 'off', 'server MCP harus mematikan cache VO lintas akun');
  const uid = 919191;
  const {panggil, tutup} = await klien(uid);
  try {
    const m = Pr.buat(uid, 'byok');
    const p = Pr.buka(uid, m.id);
    writeFileSync(path.join(p.dir, 'config.json'), JSON.stringify({komposisi: 'V.html', sfx: [], cue: [{at: 0, nama: 'x'}],
      vo: [{no: 1, sc: 'A', text: 'Halo, ini VO pertama.'}, {no: 2, sc: 'A', text: 'Dan ini yang kedua.'}]}));
    const suara = {id: 'iWydkXKoiVtvdn4vLKp9', speed: 1.2, stability: 0.14, style: 0.72, seed: 1};

    assert.match((await panggil('buat_vo', {proyek: m.id, suara})).teks, /belum ada kunci ElevenLabs/);
    assert.match((await panggil('kunci_elevenlabs')).teks, /belum ada/);
    masuk = [];
    const salah = await panggil('kunci_elevenlabs', {kunci: 'sk_salah_0123456789abcdef'});
    assert.ok(salah.galat && /kunci ditolak ElevenLabs/.test(salah.teks) && !salah.teks.includes('sk_salah'));
    assert.match((await panggil('kunci_elevenlabs')).teks, /belum ada/);

    const ok = await panggil('kunci_elevenlabs', {kunci: KUNCI_A});
    assert.equal(ok.galat, false, ok.teks);
    assert.ok(!ok.teks.includes(KUNCI_A), 'kunci dikembalikan ke klien');
    assert.match((await panggil('kunci_elevenlabs')).teks, /tersimpan/);

    assert.match((await panggil('buat_vo', {proyek: m.id, suara, maks_kredit: 5})).teks, /melebihi maks_kredit 5/);
    masuk = [];
    const r = await panggil('buat_vo', {proyek: m.id, suara});
    assert.equal(r.galat, false, r.teks);
    const h = JSON.parse(r.teks);
    assert.deepEqual(h.dibuat, [1, 2]);
    const tts = masuk.filter((x) => x.jalur.startsWith('/v1/text-to-speech/'));
    assert.equal(tts.length, 2);
    assert.ok(tts.every((x) => x.kunci === KUNCI_A), 'TTS tidak memakai kunci pelanggan');
    for (const n of ['01', '02']) assert.ok(existsSync(path.join(p.aset, 'vo', `vo-${n}.mp3`)));
    // Render MCP (suara.luar) menemukan VO ini seperti unggahan.
    assert.deepEqual(Pr.asetAda(p).vo, ['vo-01.mp3', 'vo-02.mp3']);

    masuk = [];
    const lagi = JSON.parse((await panggil('buat_vo', {proyek: m.id, suara})).teks);
    assert.deepEqual([lagi.dibuat, lagi.dilewati, lagi.kredit], [[], 2, 0]);
    assert.equal(masuk.filter((x) => x.jalur.startsWith('/v1/text-to-speech/')).length, 0);

    assert.match((await panggil('kunci_elevenlabs', {hapus: true})).teks, /dihapus/);
    const simpan = process.env.KUNCI_ENKRIPSI;
    delete process.env.KUNCI_ENKRIPSI;
    try { assert.match((await panggil('buat_vo', {proyek: m.id, suara})).teks, /belum diaktifkan/); }
    finally { process.env.KUNCI_ENKRIPSI = simpan; }
  } finally { await tutup(); }
});
