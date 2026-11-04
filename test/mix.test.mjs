/* P5-01: mixer diuji dengan audio sintetis ffmpeg (tanpa ElevenLabs, tanpa jaringan).
   Tiap tes menjaga satu aturan di README "Yang sudah dipasang, dan kenapa" bagian mixer. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {copyFileSync, mkdirSync, mkdtempSync, rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {durasi, lufs, puncakSejati, volume} from '../lib/ff.mjs';
import {amplop, gerbang, rakit} from '../lib/mix.mjs';

const buat = (keluar, ...lavfi) => execFileSync('ffmpeg', ['-y', '-v', 'error',
  ...lavfi.flatMap((s) => ['-f', 'lavfi', '-i', s]),
  ...(lavfi.length > 1 ? ['-filter_complex', `${lavfi.map((_, i) => `[${i}]`).join('')}concat=n=${lavfi.length}:v=0:a=1`] : []),
  '-ar', '44100', keluar]);

/* Proyek mini: VO 2 baris (nada 220 Hz bertremolo, mendekati amplop bicara), dua SFX
   (derau merah muda dan klik), satu bed musik (dua nada + derau). Satu cue jatuh SESUDAH
   detik lima: di situ bus SFX dulu mati tanpa peringatan. */
function proyekMini(dir, {tanpaSfx = false, tanpaMusik = false, tanpaVo = false} = {}) {
  const A = path.join(dir, 'aset');
  mkdirSync(path.join(A, 'sfx'), {recursive: true});
  mkdirSync(path.join(A, 'vo'), {recursive: true});
  const vo = [];
  if (!tanpaVo) {
    for (const [no, pos] of [[1, 0.5], [2, 4.4]]) {
      const file = path.join(A, 'vo', `vo-0${no}.mp3`);
      buat(file, 'sine=frequency=220:duration=1.6', 'anullsrc=r=44100:cl=mono:d=0.1');
      vo.push({no, pos, dur: 1.7, file});
    }
  }
  const cue = [];
  if (!tanpaSfx) {
    buat(path.join(A, 'sfx', 'desir.mp3'), 'anoisesrc=d=0.4:c=pink:a=0.6');
    buat(path.join(A, 'sfx', 'klik.mp3'), 'sine=frequency=2400:duration=0.06');
    cue.push({at: 2.6, nama: 'desir', gain: 0.4}, {at: 3.0, nama: 'klik', gain: 0.5, pan: -0.4},
      {at: 6.5, nama: 'desir', gain: 0.4, nada: 2});
  }
  const musik = [];
  if (!tanpaMusik) {
    const file = path.join(A, 'bed.mp3');
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=110:duration=10',
      '-f', 'lavfi', '-i', 'sine=frequency=330:duration=10', '-f', 'lavfi', '-i', 'anoisesrc=d=10:c=pink:a=0.2',
      '-filter_complex', '[0][1][2]amix=inputs=3:normalize=0', '-ar', '44100', file]);
    musik.push({nama: 'bed', file, titik: [['A', 0, -16], ['B', 0, -18]]});
  }
  return {dir: A, total: 8, C: {A: 0, B: 4}, vo, cue, musik, gate: [[3.4, 3.9]]};
}

const sementara = () => mkdtempSync(path.join(os.tmpdir(), 'motion-mix-'));

test('mix mencapai -14 LUFS ±0,5 dan puncak AAC <= -1,3 dBTP', () => {
  const dir = sementara();
  try {
    const r = rakit(proyekMini(dir));
    assert.ok(Math.abs(r.lufs - -14) <= 0.5, `LUFS ${r.lufs}`);
    assert.ok(r.dbtp <= -1.2, `dBTP ${r.dbtp}`);
    // Ukur ulang dari berkasnya, bukan dari angka yang dilaporkan rakit sendiri.
    assert.ok(Math.abs(lufs(r.master) - -14) <= 0.5);
    assert.ok(puncakSejati(r.master) <= -1.0);
    assert.equal(r.cue, 3);
    assert.equal(r.vo, 2);
    /* Kunci sidechain wajib di-apad. Tanpa itu seluruh mix berhenti di akhir baris VO
       terakhir (terukur: master 2,13 dtk dari 8), sementara LUFS-nya tetap tepat -14. */
    assert.ok(Math.abs(durasi(r.master) - 8) < 0.05, `master ${durasi(r.master)} dtk`);
    // Stem VO dan SFX berakhir di bunyi terakhirnya (VO 4,4 + 1,7; desir di 6,5 dinaikkan 2 nada
    // jadi ±0,36 dtk). Bed musik sepanjang video.
    for (const [s, min] of [['vo', 6.0], ['sfx', 6.8], ['mus', 7.95]]) {
      const d = durasi(path.join(dir, 'stem', `${s}.wav`));
      assert.ok(d >= min, `stem ${s} ${d} dtk, minimal ${min}`);
    }
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

/* Bus SFX pernah mati total sejak detik lima tanpa satu pun peringatan (`asetpts` hilang
   sesudah `amix`, lalu `volume` eval=frame membaca t sebagai NaN). Gate di config mini
   membuat rantai eval=frame itu ada di bus SFX, jadi regresinya akan terlihat di sini. */
test('bus SFX masuk ke master sesudah detik lima (A/B dengan bus dimatikan)', () => {
  const dir = sementara();
  try {
    const o = proyekMini(dir);
    const ada = rakit(o).master;
    const salinan = path.join(dir, 'ada.wav');
    copyFileSync(ada, salinan);
    // Diukur sebelum mix kedua, yang menimpa stem dengan bus mati.
    // Stem SFX juga harus berbunyi di cue terakhir, bukan senyap sesudah detik lima.
    const stem = volume(path.join(dir, 'stem', 'sfx.wav'), {mulai: 6.5, lama: 0.4}).puncak;
    assert.ok(stem > -40, `stem sfx di 6,5 s: ${stem} dB`);
    const tanpa = rakit({...o, matikan: 'sfx'}).master;
    // Di luar baris VO: di dalamnya SFX memang di-duck sidechain VO (rasio 10).
    for (const t of [2.6, 6.5]) {
      const a = volume(salinan, {mulai: t, lama: 0.4}).rata;
      const b = volume(tanpa, {mulai: t, lama: 0.4}).rata;
      assert.ok(a - b > 1, `detik ${t}: dengan SFX ${a} dB, tanpa ${b} dB`);
    }
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

test('jendela gate benar-benar senyap di stem musik', () => {
  const dir = sementara();
  try {
    rakit(proyekMini(dir));
    const p = volume(path.join(dir, 'stem', 'mus.wav'), {mulai: 3.5, lama: 0.3}).puncak;
    assert.ok(p === null || p < -60, `musik di dalam gate: ${p} dB`);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

/* Musik di-duck saat VO berbunyi: kunci sidechain di-apad, jadi duck tetap bekerja di baris
   terakhir. Dibandingkan dengan level bed di jendela tanpa VO. */
test('musik turun saat VO berbunyi', () => {
  const dir = sementara();
  try {
    rakit(proyekMini(dir, {tanpaSfx: true}));
    const mus = path.join(dir, 'stem', 'mus.wav');
    const saatVo = volume(mus, {mulai: 5.0, lama: 0.6}).rata;
    const tanpaVo = volume(mus, {mulai: 6.6, lama: 0.6}).rata;
    // null = tidak ada audio sama sekali di sana; `null - x` di JS diam-diam lolos.
    assert.ok(saatVo !== null && tanpaVo !== null, `bed hilang: ${saatVo} / ${tanpaVo}`);
    assert.ok(tanpaVo - saatVo > 3, `duck hanya ${(tanpaVo - saatVo).toFixed(1)} dB`);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

/* Bus kosong itu sah: explainer tanpa bed, opener yang dibawa SFX saja, dan bumper tanpa SFX.
   Dulu `amix=inputs=0` / label `[m0]` yang tidak pernah dibuat membuat ffmpeg gagal dengan
   "Invalid argument" tanpa menyebut bus mana. */
for (const kosong of ['tanpaMusik', 'tanpaVo', 'tanpaSfx']) {
  test(`mix tetap jalan ${kosong}`, () => {
    const dir = sementara();
    try {
      const r = rakit(proyekMini(dir, {[kosong]: true}));
      assert.ok(Math.abs(r.lufs - -14) <= 0.5, `LUFS ${r.lufs}`);
    } finally { rmSync(dir, {recursive: true, force: true}); }
  });
}

test('mix yang tidak bisa konvergen melempar galat, bukan diam-diam lolos', () => {
  const dir = sementara();
  try {
    // +6 LUFS dengan puncak sejati <= -1,3 dBTP mustahil secara fisik.
    assert.throws(() => rakit({...proyekMini(dir), lufsTarget: 6}), /mix tidak konvergen/);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

test('amplop: dB per titik, urut waktu, dan peringatan tukikan > 6 dB', () => {
  const tulis = process.stderr.write;
  let log = '';
  process.stderr.write = (s) => { log += s; return true; };
  try {
    const e = amplop([['B', 0, -25], ['A', 0, -17]], {A: 0, B: 1});
    assert.match(e, /^0\.14125\+clip\(\(t-0\.00\)\/1\.00,0,1\)\*-0\.08502$/);
    assert.match(log, /amplop musik -8 dB dalam 1\.00s/);
    log = '';
    amplop([['A', 0, -17], ['B', 0, -20]], {A: 0, B: 1});
    assert.equal(log, '');
  } finally { process.stderr.write = tulis; }
});

test('gerbang: landai 30/20 ms dan null tanpa jendela', () => {
  assert.equal(gerbang([]), null);
  assert.equal(gerbang(undefined), null);
  assert.equal(gerbang([[1, 2]]), "volume=volume='1-clip(clip((t-1.00)/0.03,0,1)*clip((2.00-t)/0.02,0,1),0,1)':eval=frame");
});
