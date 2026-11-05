/* P8-10: waktu per kata dari TTS with-timestamps. Server tiruan menjawab bentuk respons dari docs
   (audio_base64 + alignment per karakter); tidak ada permintaan ke ElevenLabs. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import http from 'node:http';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import * as EL from '../lib/el.mjs';
import {petaKata, tulisKata, bacaKata, berkasKata} from '../lib/kata.mjs';
import {ucapkan, vo} from '../lib/vo.mjs';
import {eja} from '../lib/lafal.mjs';
import {isyarat} from '../lib/subtitel.mjs';
import {tulisTiming} from '../lib/pipa.mjs';

const AKAR = mkdtempSync(path.join(os.tmpdir(), 'motion-kata-'));
process.env.ELEVENLABS_API_KEY = 'kunci-uji-bukan-asli';
process.env.MOTION_CACHE_VO = 'off';
test.after(() => rmSync(AKAR, {recursive: true, force: true}));

/** Penjajaran tiruan: tiap karakter 50 ms, mulai `awal` detik. */
const jajar = (teks, awal = 0) => ({characters: [...teks],
  character_start_times_seconds: [...teks].map((_, i) => +(awal + i * 0.05).toFixed(3)),
  character_end_times_seconds: [...teks].map((_, i) => +(awal + (i + 1) * 0.05).toFixed(3))});

test('petaKata: kata naskah dipetakan ke teks terlafal (akronim, domain), digeser dan dijepit', () => {
  const lafal = {ctwa: eja('CTWA')};
  const ucap = (w) => ucapkan(w, lafal);
  const naskah = 'Pakai CTWA di konektor.id sekarang.';
  const S = ucapkan(naskah, lafal);                       // "Pakai C T W A di konektor dot Ai Di sekarang."
  const k = petaKata(naskah, ucap, jajar(S), {geser: 0.1, dur: 3});
  assert.deepEqual(k.map((x) => x.w), ['Pakai', 'CTWA', 'di', 'konektor.id', 'sekarang.']);
  const t = (sub) => +(S.indexOf(sub) * 0.05 - 0.1).toFixed(3);
  assert.equal(k[1].a, t('C T W A'));
  assert.equal(k[3].a, t('konektor dot'));
  assert.equal(k[3].b, +((S.indexOf('Ai Di') + 5) * 0.05 - 0.1).toFixed(3));
  assert.equal(k[0].a, 0, 'waktu negatif sesudah digeser harus dijepit ke 0');
  assert.ok(k.every((x) => !x.kira));
  for (let i = 1; i < k.length; i++) assert.ok(k[i].a >= k[i - 1].b, `kata ${i} mendahului kata sebelumnya`);
});

test('petaKata: kata yang lafalnya menggabung dua kata tetap diberi waktu di antara tetangganya', () => {
  const lafal = {'chat wulan': 'Cetwulan'};
  const naskah = 'Hubungi Chat Wulan hari ini';
  const S = ucapkan(naskah, lafal);                       // "Hubungi Cetwulan hari ini"
  const k = petaKata(naskah, (w) => ucapkan(w, lafal), jajar(S));
  assert.equal(k.length, 5);
  const chat = k[1];
  assert.equal(chat.kira, true);
  assert.ok(chat.a >= k[0].b && chat.b <= k[2].a + 1e-9, JSON.stringify(k));
  for (let i = 1; i < k.length; i++) assert.ok(k[i].a >= k[i - 1].a);
});

test('bacaKata hanya mengembalikan waktu yang cocok dengan isi MP3-nya', () => {
  const f = path.join(AKAR, 'vo-01.mp3');
  writeFileSync(f, 'audio take A');
  tulisKata(f, [{w: 'halo', a: 0, b: 0.4}]);
  assert.deepEqual(bacaKata(f), [{w: 'halo', a: 0, b: 0.4}]);
  writeFileSync(f, 'audio take B');                        // VO diganti tanpa waktu baru
  assert.equal(bacaKata(f), null);
  tulisKata(f, null);
  assert.ok(!existsSync(berkasKata(f)));
});

/* Server with-timestamps tiruan: audio = 0,2 dtk senyap + nada sepanjang teks (50 ms/karakter) +
   0,3 dtk senyap; penjajaran mulai 0,2 dtk, seperti take sungguhan yang dibuka senyap. */
let masuk = [];
const srv = http.createServer(async (req, res) => {
  let badan = '';
  for await (const x of req) badan += x;
  const teks = JSON.parse(badan).text;
  masuk.push(req.url.split('?')[0]);
  const lama = +(teks.length * 0.05).toFixed(3);
  const mp3 = execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono:d=0.2',
    '-f', 'lavfi', '-i', `sine=f=300:d=${lama}:sample_rate=44100`, '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono:d=0.3',
    '-filter_complex', '[0][1][2]concat=n=3:v=0:a=1', '-f', 'mp3', '-']);
  if (req.url.includes('/with-timestamps')) {
    if (teks.includes('RUSAK')) { res.writeHead(200, {'content-type': 'application/json'}).end('{"detail":"aneh"}'); return; }
    res.writeHead(200, {'content-type': 'application/json'})
      .end(JSON.stringify({audio_base64: mp3.toString('base64'), alignment: jajar(teks, 0.2), normalized_alignment: null}));
  } else res.writeHead(200).end(mp3);
});
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
EL.dasar.url = `http://127.0.0.1:${/** @type {any} */ (srv.address()).port}`;
test.after(() => { srv.closeAllConnections(); srv.close(); });

function proyek(nama, suara, teks = ['Satu dua tiga empat.', 'Lima enam.']) {
  const dir = path.join(AKAR, nama);
  mkdirSync(path.join(dir, 'aset', 'vo'), {recursive: true});
  /** @type {any} */
  const c = {nama, dir, src: path.join(dir, 'src'), aset: path.join(dir, 'aset'), suara: {id: 'suaraUji', seed: 1, ...suara},
    vo: teks.map((text, i) => ({no: i + 1, sc: 'A', text}))};
  return c;
}

test('vo() dengan waktuKata: endpoint with-timestamps, waktu kata relatif VO yang sudah dipangkas', async () => {
  masuk = [];
  const c = proyek('waktu', {waktuKata: true});
  await vo(c);
  assert.ok(masuk.every((u) => u.endsWith('/with-timestamps')), masuk.join(' '));
  const [l] = c.vo;
  assert.deepEqual(l.kata.map((k) => k.w), ['Satu', 'dua', 'tiga', 'empat.']);
  // Senyap 0,2 dtk di kepala sudah dipangkas: kata pertama mulai di sekitar 0, bukan 0,2.
  assert.ok(l.kata[0].a < 0.06, `kata pertama ${l.kata[0].a}`);
  assert.ok(Math.abs(l.kata[1].a - 5 * 0.05) < 0.06, `kata kedua ${l.kata[1].a}`);
  assert.ok(l.kata.at(-1).b <= l.dur + 1e-9);
  assert.deepEqual(bacaKata(l.file), l.kata);
});

test('vo() tanpa waktuKata: endpoint biasa, tanpa berkas waktu; respons with-timestamps rusak menyebut kuncinya', async () => {
  masuk = [];
  const c = proyek('biasa', {});
  await vo(c);
  assert.ok(masuk.every((u) => !u.includes('with-timestamps')));
  assert.equal(c.vo[0].kata, undefined);
  assert.ok(!existsSync(berkasKata(c.vo[0].file)));
  const r = proyek('rusak', {waktuKata: true}, ['Teks RUSAK.']);
  await assert.rejects(vo(r), /VO-1 .*respons with-timestamps tanpa audio_base64 \(kunci: detail\)/);
});

test('subtitle dan timing.js memakai waktu kata', () => {
  const kata = [{w: 'Halo', a: 0, b: 0.3}, {w: 'semua.', a: 0.35, b: 0.8}, {w: 'Coba', a: 1.4, b: 1.7}, {w: 'sekarang.', a: 1.75, b: 2.3}];
  const q = isyarat([{pos: 10, dur: 2.5, text: 'Halo semua. Coba sekarang.', kata}]);
  // Potongan kedua mulai tepat di kata "Coba" (11,4), bukan di proporsi karakter (±11,1).
  assert.deepEqual(q.map(([a, b, t]) => [+a.toFixed(2), +b.toFixed(2), t]), [[10, 11.4, 'Halo semua.'], [11.4, 12.5, 'Coba sekarang.']]);
  // Jumlah kata tidak cocok: kembali ke proporsi karakter.
  assert.equal(isyarat([{pos: 0, dur: 2, text: 'Satu dua.', kata: [{w: 'Satu', a: 0, b: 1}]}]).length, 1);

  const dir = path.join(AKAR, 'timing');
  mkdirSync(dir, {recursive: true});
  /** @type {any} */
  const c = {src: dir, vo: [{no: 1, sc: 'A', off: 0.5, text: 'Halo semua.', dur: 0.9, kata: kata.slice(0, 2)}]};
  tulisTiming(c, [{name: 'A', dur: 3}]);
  const js = readFileSync(path.join(dir, 'timing.js'), 'utf8');
  const VO_TIMING = JSON.parse(js.match(/window\.VO_TIMING = (.*);/)[1]);
  const pos = VO_TIMING[0].pos;
  assert.deepEqual(VO_TIMING[0].kata, [{w: 'Halo', a: pos, b: +(pos + 0.3).toFixed(3)}, {w: 'semua.', a: +(pos + 0.35).toFixed(3), b: +(pos + 0.8).toFixed(3)}]);
});
