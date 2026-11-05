/* P8-11: semua rasio dalam satu render MCP, dan unggah banyak baris VO dalam satu panggilan.
   Tanpa Chromium dan tanpa pekerja sungguhan: alat diuji lewat klien MCP dalam memori, antrean
   lewat `kerjakan` dengan pekerja tiruan. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

process.env.DATA_DIR ||= mkdtempSync(path.join(os.tmpdir(), 'motion-rasio-data-'));
process.env.UNDUH_RAHASIA ||= 'r'.repeat(40);
const Pr = await import('../mcp/proyek.mjs');
const A = await import('../mcp/antrean.mjs');
const {buatServer} = await import('../mcp/alat.mjs');
test.after(() => rmSync(process.env.DATA_DIR, {recursive: true, force: true}));

async function klien(uid) {
  const {Client} = await import('@modelcontextprotocol/sdk/client/index.js');
  const {InMemoryTransport} = await import('@modelcontextprotocol/sdk/inMemory.js');
  const [a, b] = InMemoryTransport.createLinkedPair();
  const s = buatServer(uid);
  await s.connect(a);
  const k = new Client({name: 'uji', version: '0'});
  await k.connect(b);
  const panggil = async (nama, argumen) => {
    const r = await k.callTool({name: nama, arguments: argumen});
    return {galat: Boolean(r.isError), teks: r.content.map((x) => x.text).join(' ')};
  };
  return {k, panggil, tutup: async () => { await k.close(); await s.close(); }};
}

/* Proyek MCP minimal yang lolos periksaConfig. */
function proyek(uid, config) {
  const m = Pr.buat(uid, 'uji rasio');
  const p = Pr.buka(uid, m.id);
  writeFileSync(path.join(p.src, 'V.html'), `<script>window.OM_SCENES = '[{"name":"A","dur":2}]';</script>`
    + '<div data-om-exportable-video-with-duration-secs="2"></div>');
  writeFileSync(path.join(p.src, 'V 4x5.html'), `<script>window.OM_SCENES = '[{"name":"A","dur":2}]';</script>`
    + '<div data-om-exportable-video-with-duration-secs="2"></div>');
  writeFileSync(path.join(p.dir, 'config.json'), JSON.stringify({komposisi: 'V.html', vo: [], sfx: [['a', '@luar']],
    cue: [{at: 0.5, nama: 'a'}], ...config}));
  return p;
}

test('alat render `semua_rasio`: butuh jugaTulis, tidak boleh dengan potongan, ada di skema', async () => {
  const uid = 818181;
  const {k, panggil, tutup} = await klien(uid);
  try {
    const p = proyek(uid, {});
    const r = await panggil('render', {proyek: p.meta.id, semua_rasio: true});
    assert.ok(r.galat);
    assert.match(r.teks, /butuh komposisi rasio lain di `jugaTulis`/);
    assert.match((await panggil('render', {proyek: p.meta.id, semua_rasio: true, scene: 1})).teks, /`semua_rasio` merender video utuh/);
    const {tools} = await k.listTools();
    assert.ok(tools.find((t) => t.name === 'render').inputSchema.properties.semua_rasio);
  } finally { await tutup(); }
});

test('kerjakan: batas waktu dikalikan jumlah rasio, dan tiap varian mendapat tautan unduh', async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-rasio-'));
  try {
    let batas;
    const t = {id: 'r-rasio1', uid: 9, proyek: 'p', dir, status: 'antre', opsi: {semuaRasio: true, rasio: 3}};
    await A.kerjakan(t, {jalankan: async (_t, o) => {
      batas = o.batasMs;
      return {mp4: 'p.mp4', sampul: 'p-sampul.jpg', varian: [
        {komposisi: 'V.html', rasio: '9x16', mp4: 'p.mp4', sampul: 'p-sampul.jpg'},
        {komposisi: 'V 4x5.html', rasio: '4x5', mp4: 'p-v-4x5.mp4', sampul: null},
        {komposisi: 'V 1x1.html', galat: 'OM_SCENES beda'},
      ]};
    }});
    assert.equal(t.status, 'selesai');
    assert.equal(batas, Pr.BATAS.renderMenit * 60_000 * 3);
    const [a, b, c] = t.hasil.varian;
    assert.match(a.mp4, /\/unduh\/.*p\.mp4/);
    assert.match(b.mp4, /\/unduh\/.*p-v-4x5\.mp4/);
    assert.equal(b.sampul, null);
    assert.deepEqual([c.mp4, c.galat], [null, 'OM_SCENES beda']);
    // Render biasa: batas tidak berubah.
    const t2 = {id: 'r-rasio2', uid: 9, proyek: 'p', dir, status: 'antre', opsi: {}};
    await A.kerjakan(t2, {jalankan: async (_t, o) => { batas = o.batasMs; return {mp4: 'p.mp4'}; }});
    assert.equal(batas, Pr.BATAS.renderMenit * 60_000);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

const WAV = execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono:d=0.2',
  '-f', 'lavfi', '-i', 'sine=f=300:d=0.8:sample_rate=44100', '-filter_complex', '[0][1]concat=n=2:v=0:a=1', '-f', 'wav', '-']);

test('unggah_vo: banyak baris dalam satu panggilan; baris yang gagal dilaporkan tanpa menggagalkan sisanya', async () => {
  const uid = 828282;
  const {panggil, tutup} = await klien(uid);
  try {
    const p = proyek(uid, {});
    const b64 = WAV.toString('base64');
    const r = await panggil('unggah_vo', {proyek: p.meta.id, baris: [
      {no: 1, base64: b64}, {no: 2, base64: Buffer.from('bukan audio').toString('base64')}, {no: 3, base64: b64, tempo: 1.2}]});
    assert.equal(r.galat, false, r.teks);
    const h = JSON.parse(r.teks);
    assert.deepEqual([h.berhasil, h.gagal], [2, 1]);
    assert.deepEqual(h.vo.map((x) => x.no), [1, 2, 3]);
    assert.equal(h.vo[0].berkas, 'vo-01.mp3');
    assert.ok(h.vo[1].galat, 'baris 2 seharusnya gagal');
    assert.ok(h.vo[2].detik < h.vo[0].detik, 'tempo 1,2 tidak diterapkan');
    for (const n of ['01', '03']) assert.ok(existsSync(path.join(p.aset, 'vo', `vo-${n}.mp3`)));
    assert.ok(!existsSync(path.join(p.aset, 'vo', 'vo-02.mp3')));

    assert.match((await panggil('unggah_vo', {proyek: p.meta.id, baris: [{no: 1, base64: b64}, {no: 1, base64: b64}]})).teks, /nomor VO ganda/);
    assert.match((await panggil('unggah_vo', {proyek: p.meta.id, baris: [{no: 4}]})).teks, /tepat satu dari url\/base64: VO 4/);
  } finally { await tutup(); }
});
