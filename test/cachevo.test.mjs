/* P6-07: cache VO lintas proyek. `vo()` dijalankan utuh terhadap server TTS tiruan yang menjawab
   MP3 sungguhan; jumlah permintaan TTS yang masuk adalah buktinya. Cache di direktori sementara. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import http from 'node:http';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import * as EL from '../lib/el.mjs';
import * as CV from '../lib/cachevo.mjs';
import * as B from '../lib/biaya.mjs';
import {vo, rencanaVo} from '../lib/vo.mjs';
import {perkiraDurasi} from '../lib/kering.mjs';
import {tandai} from '../lib/kunci.mjs';

const AKAR = mkdtempSync(path.join(os.tmpdir(), 'motion-cachevo-'));
const CACHE = path.join(AKAR, 'cache');
process.env.MOTION_CACHE_VO = CACHE;
process.env.ELEVENLABS_API_KEY = 'kunci-uji-bukan-asli';
test.after(() => rmSync(AKAR, {recursive: true, force: true}));

// Satu take TTS: 0,6 dtk nada di antara senyap, supaya pemangkasan VO punya sesuatu untuk dipangkas.
const MP3 = execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono:d=0.2',
  '-f', 'lavfi', '-i', 'sine=f=300:d=0.6:sample_rate=44100', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono:d=0.3',
  '-filter_complex', '[0][1][2]concat=n=3:v=0:a=1', '-f', 'mp3', '-']);

let tts = 0;
const srv = http.createServer((req, res) => {
  if (req.url.startsWith('/v1/text-to-speech/')) tts++;
  req.resume();
  res.writeHead(200, {'Content-Type': 'audio/mpeg'}).end(MP3);
});
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
EL.dasar.url = `http://127.0.0.1:${/** @type {any} */ (srv.address()).port}`;
test.after(() => { srv.closeAllConnections(); srv.close(); });

const BARIS = [{no: 1, sc: 'A', text: 'Hubungi kami di konektor.id sekarang.'}, {no: 2, sc: 'A', text: 'Gratis untuk tujuh hari.'}];
function proyek(nama, vo = BARIS) {
  const dir = path.join(AKAR, nama);
  mkdirSync(path.join(dir, 'aset', 'vo'), {recursive: true});
  /** @type {any} */
  const c = {nama, dir, aset: path.join(dir, 'aset'), suara: {id: 'suaraUji', seed: 3}, vo: vo.map((l) => ({...l})), sfx: [], musik: []};
  return c;
}
const isiCache = () => (existsSync(CACHE) ? readdirSync(CACHE).filter((f) => f.endsWith('.mp3')).length : 0);
const jumlahKredit = (vo) => vo.reduce((a, l) => a + rencanaVo({...proyek('_x', vo)}).baris.find((b) => b.l.no === l.no).kunci.teks.length, 0);

test('proyek kedua dengan baris + suara + konteks yang sama: 0 permintaan TTS, berkas identik, biaya menyebut hemat', async () => {
  tts = 0;
  const a = proyek('angle-a');
  await vo(a);
  assert.equal(tts, 2);
  assert.equal(isiCache(), 2);

  const b = proyek('angle-b');
  const p = B.perkiraan(b, ['vo']);
  assert.equal(p.kredit, 0);
  assert.deepEqual(p.dariCache, ['VO-1', 'VO-2']);
  assert.equal(p.hemat, jumlahKredit(BARIS));
  assert.match(B.ringkas(p), /2 VO dari cache lintas proyek · hemat \d+ kredit/);
  // --kering memakai durasi persis dari cache, bukan perkiraan kar/dtk.
  assert.deepEqual(perkiraDurasi(b).map((x) => x.sumber), ['cache', 'cache']);

  // Gerbang biaya: tidak bertanya, tidak memanggil kuota, tapi penghematannya tercatat.
  await B.berbiaya(b, 'plan', ['vo'], () => vo(b), {log: () => {}, kuota: async () => { throw new Error('tidak boleh'); }});
  assert.equal(tts, 2, 'proyek kedua tidak boleh memanggil TTS');
  for (const n of ['vo-01.mp3', 'vo-02.mp3']) {
    assert.deepEqual(readFileSync(path.join(b.aset, 'vo', n)), readFileSync(path.join(a.aset, 'vo', n)));
    assert.ok(existsSync(path.join(b.aset, 'vo', `${n}.kunci`)));
  }
  assert.ok(b.vo.every((l) => l.dur > 0.3));
  const [e] = JSON.parse(readFileSync(path.join(b.dir, 'biaya.json'), 'utf8'));
  assert.deepEqual([e.perkiraan, e.hemat], [0, jumlahKredit(BARIS)]);
});

test('konteks tetangga ikut kunci: baris yang sama dengan tetangga berbeda TIDAK diambil dari cache', async () => {
  tts = 0;
  // VO-1 sama persis, tapi kalimat sesudahnya berubah: intonasi/durasinya bisa berbeda.
  const c = proyek('angle-c', [BARIS[0], {no: 2, sc: 'A', text: 'Diskon lima puluh persen.'}]);
  assert.equal(B.perkiraan(c, ['vo']).hemat ?? 0, 0);
  await vo(c);
  assert.equal(tts, 2);
});

test('VO lama yang segar mengisi cache tanpa permintaan; `paksa` tetap membuat ulang', async () => {
  const kosong = path.join(AKAR, 'cache-isi');
  process.env.MOTION_CACHE_VO = kosong;
  try {
    tts = 0;
    const d = proyek('lama');
    for (const {file, kunci} of rencanaVo(d).baris) { writeFileSync(file, MP3); tandai(file, kunci); }
    await vo(d);
    assert.equal(tts, 0);
    assert.equal(readdirSync(kosong).filter((f) => f.endsWith('.mp3')).length, 2);
    await vo(d, {paksa: true});
    assert.equal(tts, 2, '`paksa` tidak boleh diam-diam mengambil dari cache');
  } finally { process.env.MOTION_CACHE_VO = CACHE; }
});

test('entri rusak atau tidak cocok tidak dipakai; MOTION_CACHE_VO=off mematikan', () => {
  const c = proyek('cek');
  const {kunci} = rencanaVo(c).baris[0];
  const f = CV.cari(kunci);
  assert.ok(f, 'entri dari tes pertama ada');
  const k = path.join(CACHE, `${CV.sidik(kunci)}.kunci`);
  const asli = readFileSync(k, 'utf8');
  writeFileSync(k, JSON.stringify({...kunci, teks: 'lain'}));
  try { assert.equal(CV.cari(kunci), null); } finally { writeFileSync(k, asli); }
  assert.equal(CV.dirCache({MOTION_CACHE_VO: 'off'}), null);
  assert.equal(CV.cari(kunci, null), null);
  assert.equal(CV.simpan(kunci, f, {}, null), false);
  assert.equal(CV.dirCache({}), path.join(os.homedir(), '.motion', 'cache-vo'));
});
