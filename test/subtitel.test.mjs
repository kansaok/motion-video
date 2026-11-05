/* P6-04: subtitle + naskah akhir dari timeline yang sama dengan mixer, dan tautan unduhnya di MCP. */
import assert from 'node:assert/strict';
import {execFileSync, spawn} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import * as S from '../lib/subtitel.mjs';
import {durasi} from '../lib/ff.mjs';

const AKAR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('pecah: per kalimat, domain utuh, kalimat panjang dipecah di koma (≤ 84)', () => {
  assert.deepEqual(S.pecah('Buka konektor.id sekarang. Gratis!'), ['Buka konektor.id sekarang.', 'Gratis!']);
  const panjang = 'Satu kalimat yang sangat panjang sekali, dengan beberapa anak kalimat yang terus bertambah, '
    + 'sampai akhirnya melewati batas keterbacaan subtitle, lalu berhenti.';
  const p = S.pecah(panjang);
  assert.ok(p.length >= 2);
  assert.ok(p.every((x) => x.length <= 84), p.join(' | '));
  assert.equal(p.join(' '), panjang);
  assert.equal(S.bungkus('pendek'), 'pendek');
  assert.ok(S.bungkus('Satu kalimat yang cukup panjang untuk dibungkus dua baris').split('\n').every((b) => b.length <= 42));
});

test('isyarat, srt, vtt: waktu dibagi per karakter; format jam dan pemisah milidetik', () => {
  const q = S.isyarat([{pos: 3599.5, dur: 2, text: 'Satu. Dua dua.'}]);
  assert.deepEqual(q.map(([a, b, t]) => [+a.toFixed(3), +b.toFixed(3), t]), [[3599.5, 3600.269, 'Satu.'], [3600.269, 3601.5, 'Dua dua.']]);
  assert.equal(S.srt(q), '1\n00:59:59,500 --> 01:00:00,269\nSatu.\n\n2\n01:00:00,269 --> 01:00:01,500\nDua dua.\n');
  assert.equal(S.vtt(q), 'WEBVTT\n\n00:59:59.500 --> 01:00:00.269\nSatu.\n\n01:00:00.269 --> 01:00:01.500\nDua dua.\n');
});

function proyek(tata, bahasa) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-sub-'));
  mkdirSync(path.join(dir, 'aset', 'vo'), {recursive: true});
  writeFileSync(path.join(dir, 'timeline.json'), JSON.stringify([{name: 'A', dur: 2}, {name: 'B', dur: 4}]));
  /** @type {any} */
  const c = {nama: 'uji', dir, aset: path.join(dir, 'aset'), htmlUtama: path.join(dir, 'x.html'), keluaran: 'uji-9x16.mp4',
    suara: bahasa ? {bahasa} : {}, tata,
    vo: [{no: 1, sc: 'A', off: 0.2, text: 'Baris pertama yang panjang.'}, {no: 2, sc: 'B', off: 0.2, text: 'Baris kedua.'}]};
  return c;
}
const nada = (f, d) => execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', `sine=d=${d}`, f]);

test('tulisSubtitel: posisi dari `tata` (baris yang didorong jangkar), bukan awal scene + off', () => {
  const c = proyek({mode: 'jangkar', jeda: 0.15});
  try {
    // VO-1 3 dtk di scene A (2 dtk): VO-2 tidak bisa mulai di B+0,2 = 2,2 dtk, jangkar mendorongnya.
    nada(path.join(c.aset, 'vo', 'vo-01.mp3'), 3);
    nada(path.join(c.aset, 'vo', 'vo-02.mp3'), 1);
    const d1 = durasi(path.join(c.aset, 'vo', 'vo-01.mp3'));
    const h = S.tulisSubtitel(c);
    assert.deepEqual([h.srt, h.vtt, h.naskah].map((f) => path.basename(f)), ['uji-9x16.id.srt', 'uji-9x16.id.vtt', 'uji-9x16-naskah.txt']);
    const srt = readFileSync(h.srt, 'utf8');
    const mulai2 = 0.2 + d1 + 0.15;
    const jam = (x) => `00:00:0${Math.floor(x)},${String(Math.round((x % 1) * 1000)).padStart(3, '0')}`;
    assert.match(srt, new RegExp(`^2\\n${jam(mulai2)} --> `, 'm'), srt);
    assert.doesNotMatch(srt, /00:00:02,200 -->/);
    assert.equal(readFileSync(h.naskah, 'utf8'), 'Baris pertama yang panjang.\nBaris kedua.\n');
    assert.match(readFileSync(h.vtt, 'utf8'), /^WEBVTT\n\n00:00:00\.200 --> /);
  } finally { rmSync(c.dir, {recursive: true, force: true}); }
});

test('tulisSubtitel: akhiran bahasa dari suara.bahasa; VO yang belum ada disebut nomornya', () => {
  const c = proyek({mode: 'alir'}, 'en');
  try {
    nada(path.join(c.aset, 'vo', 'vo-01.mp3'), 1);
    assert.throws(() => S.tulisSubtitel(c), /VO-2 belum ada \(vo-02\.mp3\)/);
    nada(path.join(c.aset, 'vo', 'vo-02.mp3'), 1);
    assert.equal(path.basename(S.tulisSubtitel(c).srt), 'uji-9x16.en.srt');
  } finally { rmSync(c.dir, {recursive: true, force: true}); }
});

test('/unduh MCP melayani .srt/.vtt/.txt bertanda tangan dengan tipe yang benar; jenis lain tetap ditolak', async (t) => {
  const data = mkdtempSync(path.join(os.tmpdir(), 'motion-sub-data-'));
  const env = {...process.env, DATA_DIR: data, PORT: String(18000 + Math.floor(Math.random() * 2000)), UNDUH_RAHASIA: 'r'.repeat(40),
    MCP_DEV_TOKEN: 'dev-uji', PUBLIC_URL: '', NODE_ENV: 'test'};
  // Proyek dan tautan dibuat dengan modul yang sama, di DATA_DIR dan rahasia yang sama dengan server.
  const kode = `const Pr = await import(${JSON.stringify(path.join(AKAR, 'mcp/proyek.mjs'))});
    const p = Pr.buka(0, Pr.buat(0, 'sub').id); const fs = await import('node:fs');
    for (const f of ['v.id.srt', 'v.id.vtt', 'v-naskah.txt', 'v.wav']) fs.writeFileSync(p.dir + '/' + f, 'isi ' + f);
    console.log(JSON.stringify(Object.fromEntries(['v.id.srt', 'v.id.vtt', 'v-naskah.txt', 'v.wav'].map((f) => [f, Pr.tautan(0, p.meta.id, f)]))));`;
  const tautan = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', kode], {env, encoding: 'utf8'}));
  const srv = spawn(process.execPath, [path.join(AKAR, 'mcp/server.mjs')], {env, stdio: ['ignore', 'pipe', 'pipe']});
  t.after(() => { srv.kill(); rmSync(data, {recursive: true, force: true}); });
  await new Promise((ok, gagal) => {
    srv.stdout.on('data', (b) => { if (/motion-mcp mulai/.test(String(b))) ok(); });
    srv.once('exit', (k) => gagal(new Error(`server berhenti (${k})`)));
    setTimeout(() => gagal(new Error('server tidak mulai')), 15_000);
  });
  const ambil = (jalur) => fetch(`http://127.0.0.1:${env.PORT}${jalur}`);
  for (const [f, tipe] of [['v.id.srt', /application\/x-subrip/], ['v.id.vtt', /text\/vtt/], ['v-naskah.txt', /text\/plain/]]) {
    const r = await ambil(tautan[f]);
    assert.equal(r.status, 200, f);
    assert.match(r.headers.get('content-type'), tipe);
    assert.equal(await r.text(), `isi ${f}`);
  }
  assert.equal((await ambil(tautan['v.wav'])).status, 403);
  // Tanda tangan tetap wajib untuk jenis baru.
  assert.equal((await ambil(tautan['v.id.srt'].replace(/sig=[^&]+/, 'sig=palsu'))).status, 403);
});
