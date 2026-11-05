/* Regresi atempo ganda (9e0bff6): jalur TTS CLI ikut memakai `suara.speed` sebagai atempo padahal
   speed sudah diterapkan API, jadi VO ber-speed 1,2 keluar ±1,44x. Plus aturan kunci lama: VO tanpa
   penanda versi pangkas tetap sah bila speed 1 atau dibuat sebelum regresi. Server TTS tiruan. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import http from 'node:http';
import {mkdirSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import * as EL from '../lib/el.mjs';
import * as CV from '../lib/cachevo.mjs';
import {VO} from '../lib/konstanta.mjs';
import {vo, rencanaVo, segarVo, cariCacheVo, pangkasVo} from '../lib/vo.mjs';
import {durasi} from '../lib/ff.mjs';

const AKAR = mkdtempSync(path.join(os.tmpdir(), 'motion-votempo-'));
process.env.ELEVENLABS_API_KEY = 'kunci-uji-bukan-asli';
process.env.MOTION_CACHE_VO = path.join(AKAR, 'cache');
test.after(() => rmSync(AKAR, {recursive: true, force: true}));

// Take TTS tetap: 0,2 dtk senyap + 0,9 dtk nada + 0,3 dtk senyap.
const MP3 = execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono:d=0.2',
  '-f', 'lavfi', '-i', 'sine=f=300:d=0.9:sample_rate=44100', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono:d=0.3',
  '-filter_complex', '[0][1][2]concat=n=3:v=0:a=1', '-f', 'mp3', '-']);
let tts = 0;
const srv = http.createServer((req, res) => { tts++; req.resume(); res.writeHead(200).end(MP3); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
EL.dasar.url = `http://127.0.0.1:${/** @type {any} */ (srv.address()).port}`;
test.after(() => { srv.closeAllConnections(); srv.close(); });

function proyek(nama, speed) {
  const dir = path.join(AKAR, nama);
  mkdirSync(path.join(dir, 'aset', 'vo'), {recursive: true});
  /** @type {any} */
  const c = {nama, dir, aset: path.join(dir, 'aset'), suara: {id: 'suaraUji', seed: 1, speed},
    vo: [{no: 1, sc: 'A', text: 'Satu kalimat uji.'}]};
  return c;
}

test('speed hanya diterapkan API: VO ber-speed 1,2 sama panjang dengan take yang dipangkas biasa', async () => {
  const c = proyek('speed', 1.2);
  const acuan = path.join(AKAR, 'acuan.mp3'), mentah = path.join(AKAR, 'mentah.mp3');
  writeFileSync(mentah, MP3);
  pangkasVo(mentah, acuan, {});
  await vo(c);
  // Dengan atempo ganda: 0,9/1,2 + ekor = ±0,15 dtk lebih pendek.
  assert.ok(Math.abs(c.vo[0].dur - durasi(acuan)) < 0.02, `VO ${c.vo[0].dur} dtk, take dipangkas ${durasi(acuan)} dtk`);
  // Kunci baru membawa penanda versi pangkas.
  assert.equal(JSON.parse(readFileSync(`${c.vo[0].file}.kunci`, 'utf8')).pangkas, VO.versiPangkas);
});

/** VO proyek dengan kunci LAMA (tanpa `pangkas`), `.kunci` bertanggal `waktu`. */
function voLama(nama, speed, waktu) {
  const c = proyek(nama, speed);
  const {baris: [b]} = rencanaVo(c);
  const {pangkas, ...lama} = b.kunci;
  writeFileSync(b.file, MP3);
  writeFileSync(`${b.file}.kunci`, JSON.stringify(lama));
  utimesSync(`${b.file}.kunci`, waktu / 1000, waktu / 1000);
  return {c, b, lama};
}

test('kunci lama: sah bila speed 1 atau dibuat sebelum regresi; dalam jendela regresi dibuat ulang', async () => {
  const sebelum = VO.regresiTempoMs - 3600_000, sesudah = VO.regresiTempoMs + 3600_000;
  assert.equal(segarVo(voLama('lama-dulu', 1.2, sebelum).b.file, voLama('lama-dulu', 1.2, sebelum).b.kunci), true);
  const s1 = voLama('lama-speed1', 1, sesudah);
  assert.equal(segarVo(s1.b.file, s1.b.kunci), true);
  const rusak = voLama('lama-regresi', 1.2, sesudah);
  assert.equal(segarVo(rusak.b.file, rusak.b.kunci), false, 'VO dari jendela regresi dianggap segar');

  // `vo` memigrasi kunci lama yang sah (penanda ditulis) tanpa permintaan TTS...
  const sah = voLama('migrasi', 1.2, sebelum);
  const n = tts;
  await vo(sah.c);
  assert.equal(tts, n);
  assert.equal(JSON.parse(readFileSync(`${sah.b.file}.kunci`, 'utf8')).pangkas, VO.versiPangkas);
  // ...dan mengganti yang dari jendela regresi. Teks dan suaranya sama dengan VO tes pertama yang
  // dibuat benar, jadi penggantinya datang dari cache lintas proyek (kunci bertanda), bukan TTS.
  await vo(rusak.c);
  assert.ok(!readFileSync(rusak.b.file).equals(MP3), 'VO jendela regresi tidak diganti');
  assert.equal(JSON.parse(readFileSync(`${rusak.b.file}.kunci`, 'utf8')).pangkas, VO.versiPangkas);
});

test('cache lintas proyek: entri lama dipakai hanya bila sah menurut tanggal dibuat', () => {
  const dir = path.join(AKAR, 'cache-uji');
  const {b, lama} = voLama('cache', 1.2, Date.now());
  CV.simpan(lama, b.file, {proyek: 'lama'}, dir);
  const asal = path.join(dir, `${CV.sidik(lama)}.json`);
  const env = process.env.MOTION_CACHE_VO;
  process.env.MOTION_CACHE_VO = dir;
  try {
    writeFileSync(asal, JSON.stringify({dibuat: new Date(VO.regresiTempoMs + 60_000).toISOString()}));
    assert.equal(cariCacheVo(b.kunci), null, 'entri jendela regresi dipakai');
    writeFileSync(asal, JSON.stringify({dibuat: new Date(VO.regresiTempoMs - 60_000).toISOString()}));
    assert.ok(cariCacheVo(b.kunci));
  } finally { process.env.MOTION_CACHE_VO = env; }
});
