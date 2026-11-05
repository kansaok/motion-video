/* P8-04: VO dan SFX dibuat bersamaan, dengan perintis dan batas permintaan bersama. Server
   tiruan lokal menjawab MP3 sungguhan sesudah jeda dan mencatat berapa permintaan yang sedang
   berjalan; tidak ada permintaan ke ElevenLabs. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import http from 'node:http';
import {existsSync, mkdirSync, mkdtempSync, rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import * as EL from '../lib/el.mjs';
import {kolam, semafor} from '../lib/kolam.mjs';
import {vo} from '../lib/vo.mjs';
import {sfx} from '../lib/sfx.mjs';

process.env.ELEVENLABS_API_KEY = 'kunci-uji-bukan-asli';
process.env.MOTION_CACHE_VO = 'off';           // jangan menyentuh ~/.motion
process.env.MOTION_EL_PARALEL = '3';

const tidur = (ms) => new Promise((ok) => setTimeout(ok, ms));

/* ── kolam murni ─────────────────────────────────────────────────────────── */
function pencatat() {
  let aktif = 0;
  const o = {maks: 0, log: /** @type {string[]} */ ([]),
    async jalan(/** @type {string} */ nama, /** @type {number} */ ms) {
      aktif++; o.maks = Math.max(o.maks, aktif); o.log.push(`+${nama}`);
      await tidur(ms);
      aktif--; o.log.push(`-${nama}`);
    }};
  return o;
}

test('kolam: butir tanpa API dan perintis berjalan sendiri, sisanya paling banyak n sekaligus', async () => {
  const p = pencatat();
  // a, b dari cache (tidak memanggil API); c perintis; d..h paralel.
  const butir = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  await kolam(butir, 3, async (x) => {
    const api = !['a', 'b'].includes(x);
    await p.jalan(x, api ? 40 : 5);
    return api;
  });
  // Sampai perintis selesai, tidak ada butir lain yang mulai.
  assert.deepEqual(p.log.slice(0, 6), ['+a', '-a', '+b', '-b', '+c', '-c']);
  assert.equal(p.maks, 3);
  assert.equal(p.log.filter((x) => x.startsWith('+')).length, butir.length);
});

test('kolam: galat menghentikan butir baru, menunggu yang jalan, melempar galat butir paling awal', async () => {
  const p = pencatat();
  const butir = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  await assert.rejects(kolam(butir, 3, async (x) => {
    // Butir 3 gagal LAMBAT, butir 2 gagal CEPAT: yang dilempar tetap galat butir 2.
    if (x === 2) { await p.jalan('2', 5); throw new Error('galat-2'); }
    if (x === 3) { await p.jalan('3', 30); throw new Error('galat-3'); }
    await p.jalan(String(x), 30);
    return true;
  }), /galat-2/);
  const mulai = p.log.filter((x) => x.startsWith('+')).map((x) => Number(x.slice(1)));
  // Perintis 0, lalu 1, 2, 3 bersamaan; 2 gagal sebelum ada slot kosong, jadi 4..8 tidak pernah mulai.
  assert.deepEqual(mulai.sort(), [0, 1, 2, 3]);
  // Yang sedang jalan ditunggu selesai, bukan ditinggal.
  for (const x of [1, 3]) assert.ok(p.log.includes(`-${x}`), `butir ${x} ditinggal`);
});

test('semafor: tidak pernah lebih dari batas', async () => {
  const p = pencatat();
  const s = semafor(() => 2);
  await Promise.all(['a', 'b', 'c', 'd', 'e'].map((x) => s.pakai(() => p.jalan(x, 20))));
  assert.equal(p.maks, 2);
  assert.equal(s.jalan, 0);
});

/* ── vo() dan sfx() terhadap server tiruan ──────────────────────────────────── */
const MP3 = execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono:d=0.2',
  '-f', 'lavfi', '-i', 'sine=f=300:d=0.6:sample_rate=44100', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono:d=0.3',
  '-filter_complex', '[0][1][2]concat=n=3:v=0:a=1', '-f', 'mp3', '-']);

async function tiruan({jedaMs = 150, tolak = /$^/} = {}) {
  const o = {aktif: 0, maks: 0, masuk: /** @type {Array<{jenis: string, teks: string, mulai: number, selesai?: number}>} */ ([])};
  const srv = http.createServer(async (req, res) => {
    let badan = '';
    for await (const k of req) badan += k;
    const j = JSON.parse(badan || '{}');
    const r = {jenis: req.url.startsWith('/v1/text-to-speech/') ? 'tts' : 'sfx', teks: j.text || '', mulai: Date.now()};
    o.masuk.push(r);
    o.aktif++; o.maks = Math.max(o.maks, o.aktif);
    await tidur(jedaMs);
    o.aktif--; r.selesai = Date.now();
    if (tolak.test(r.teks)) { res.writeHead(422).end('{"detail":"ditolak tiruan"}'); return; }
    res.writeHead(200, {'Content-Type': 'audio/mpeg'}).end(MP3);
  });
  await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
  const asal = EL.dasar.url;
  EL.dasar.url = `http://127.0.0.1:${/** @type {any} */ (srv.address()).port}`;
  return {...o, get maks() { return o.maks; }, masuk: o.masuk,
    tutup: () => { EL.dasar.url = asal; srv.closeAllConnections(); srv.close(); }};
}

function proyek(nBaris, nSfx = 0) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-kolam-'));
  mkdirSync(path.join(dir, 'aset', 'vo'), {recursive: true});
  mkdirSync(path.join(dir, 'aset', 'sfx'), {recursive: true});
  /** @type {any} */
  const c = {nama: 'uji', dir, aset: path.join(dir, 'aset'), suara: {id: 'suaraUji', seed: 1},
    vo: Array.from({length: nBaris}, (_, i) => ({no: i + 1, sc: 'A', text: `Kalimat nomor ${i + 1} untuk uji.`})),
    sfx: Array.from({length: nSfx}, (_, i) => [`bunyi-${i + 1}`, 0.8, `soft click ${i + 1}`])};
  return c;
}

test('vo(): baris dibuat bersamaan (maks 3), perintis sendirian, semua berkas jadi', async () => {
  const s = await tiruan();
  const c = proyek(7);
  try {
    await vo(c);
    const tts = s.masuk.filter((x) => x.jenis === 'tts');
    assert.equal(tts.length, 7);
    assert.equal(s.maks, 3);
    // Permintaan kedua baru mulai sesudah perintis dijawab.
    const [satu, ...lain] = [...tts].sort((a, b) => a.mulai - b.mulai);
    assert.ok(lain.every((x) => x.mulai >= /** @type {number} */ (satu.selesai)), 'ada permintaan yang mendahului perintis');
    for (const l of c.vo) {
      assert.ok(existsSync(l.file), `${l.file} tidak ada`);
      assert.ok(l.dur > 0.5 && l.dur < 0.9, `VO-${l.no} ${l.dur} dtk`);
    }
  } finally { s.tutup(); rmSync(c.dir, {recursive: true, force: true}); }
});

test('vo(): galat di tengah menyebut baris paling awal yang gagal dan tidak membuka baris baru', async () => {
  const s = await tiruan({tolak: /nomor (4|5) /});
  const c = proyek(12);
  try {
    await assert.rejects(vo(c), (e) => /^VO-4 \("Kalimat nomor 4/.test(e.message) && /422/.test(e.message));
    // Perintis (1) + 2,3,4 bersamaan; 4 gagal -> paling banyak satu gelombang lagi yang sudah terlanjur
    // mengambil slot (5,6,7 dibuka saat 2,3 selesai bersamaan). Tidak pernah sampai 12.
    assert.ok(s.masuk.length <= 7, `${s.masuk.length} permintaan`);
  } finally { s.tutup(); rmSync(c.dir, {recursive: true, force: true}); }
});

test('sfx() dan vo() bersamaan tetap di bawah batas permintaan bersama', async () => {
  const s = await tiruan();
  const c = proyek(5, 5);
  try {
    const [baru] = await Promise.all([sfx(c), vo(c)]);
    assert.equal(baru, 5);
    assert.equal(s.masuk.length, 10);
    assert.equal(s.maks, 3, `maks ${s.maks} permintaan bersamaan`);
    for (const [nama] of c.sfx) assert.ok(existsSync(path.join(c.aset, 'sfx', `${nama}.mp3`)), nama);
  } finally { s.tutup(); rmSync(c.dir, {recursive: true, force: true}); }
});
