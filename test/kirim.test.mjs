/* P8-12: `motion kirim`. MP4 sintetis ffmpeg (tanpa Chromium, tanpa API). */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {kirim, rencanaKirim, slug} from '../lib/kirim.mjs';

const ff = (...a) => execFileSync('ffmpeg', ['-y', '-v', 'error', ...a]);

/** MP4 2 dtk berwarna rata, audio diratakan ke ±-14 LUFS (atau senyap untuk yang gagal mutu). */
function mp4(f, w, h, {senyap = false} = {}) {
  ff('-f', 'lavfi', '-i', `color=c=0x25D366:s=${w}x${h}:d=2:r=30`,
    '-f', 'lavfi', '-i', senyap ? 'anullsrc=r=48000:cl=stereo:d=2' : 'anoisesrc=d=2:c=pink:a=0.3:seed=5',
    ...(senyap ? [] : ['-af', 'loudnorm=I=-14:TP=-2:LRA=7']), '-ar', '48000',
    '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', f);
}

function proyek({senyap4x5 = false} = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-kirim-'));
  const aset = path.join(dir, 'aset'), src = path.join(dir, 'src');
  mkdirSync(path.join(aset, 'vo'), {recursive: true});
  mkdirSync(src, {recursive: true});
  writeFileSync(path.join(dir, 'timeline.json'), JSON.stringify([{name: 'Hook', dur: 1}, {name: 'CTA', dur: 1}]));
  for (const [no, d] of [[1, 0.6], [2, 0.5]]) {
    ff('-f', 'lavfi', '-i', `sine=frequency=300:duration=${d}`, path.join(aset, 'vo', `vo-0${no}.mp3`));
  }
  writeFileSync(path.join(src, 'isi.js'), "window.ISI = {hook: 'Chat masuk, iklan ketahuan'};\n");
  mp4(path.join(dir, 'iklan.mp4'), 108, 192);
  ff('-i', path.join(dir, 'iklan.mp4'), '-frames:v', '1', path.join(dir, 'iklan-sampul.jpg'));
  writeFileSync(path.join(dir, 'iklan.id.srt'), '1\n00:00:00,100 --> 00:00:00,700\nHalo\n');
  mp4(path.join(dir, 'iklan-4x5.mp4'), 108, 136, {senyap: senyap4x5});
  // Draf dan potongan tidak boleh ikut terkirim.
  mp4(path.join(dir, 'iklan-draf.mp4'), 54, 96);
  mp4(path.join(dir, 'iklan-potong-0.00-1.00.mp4'), 108, 192);
  /** @type {any} */
  const c = {nama: 'iklan', dir, src, aset, komposisi: 'V.html', keluaran: 'iklan.mp4',
    varian: [{komposisi: 'V 4x5.html', keluaran: 'iklan-4x5.mp4'}],
    suara: {id: 'iWydkXKoiVtvdn4vLKp9', speed: 1.2, stability: 0.14, style: 0.72},
    vo: [{no: 1, sc: 'Hook', off: 0.1, text: 'Chat masuk, tapi dari iklan mana?'}, {no: 2, sc: 'CTA', off: 0.1, text: 'Coba gratis | sekarang.'}],
    tata: {mode: 'jangkar'}, sfx: [['klik', '@stok/03-pop'], ['desir', 0.8, 'soft whoosh']],
    musik: [{nama: 'bgm', rencana: [{detik: 1, teks: 'intro'}, {detik: 2, teks: 'drop'}]}]};
  return {c, dir, akar: path.join(dir, 'Ads')};
}

test('slug dan rencana: nama baku per rasio, draf dan potongan tidak ikut', () => {
  const {c, dir, akar} = proyek();
  try {
    assert.equal(slug('Rama Digital'), 'rama-digital');
    assert.equal(slug('Era AGI!'), 'era-agi');
    const r = rencanaKirim(c, {merek: 'Rama Digital', angle: 'Era AGI', akar});
    assert.equal(r.tujuan, path.join(akar, 'Rama Digital', 'Era AGI'));
    assert.deepEqual(r.mp4.map((x) => [path.basename(x.dari), path.basename(x.ke)]),
      [['iklan.mp4', 'rama-digital-era-agi-9x16.mp4'], ['iklan-4x5.mp4', 'rama-digital-era-agi-4x5.mp4']]);
    assert.equal(path.basename(r.mp4[0].sampul.ke), 'rama-digital-era-agi-9x16-sampul.jpg');
    assert.equal(r.mp4[1].sampul, null);
    assert.deepEqual(r.sub.map((x) => path.basename(x.ke)), ['rama-digital-era-agi.id.srt']);
    assert.throws(() => rencanaKirim(c, {merek: '', angle: 'x', akar}), /butuh merek dan angle/);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

test('kirim: salinan + naskah.md; ulang dengan isi sama aman; isi beda tidak ditimpa tanpa --timpa', () => {
  const {c, dir, akar} = proyek();
  try {
    const o = {merek: 'Rama Digital', angle: 'Era AGI', akar, tanggal: '2026-11-05'};
    const r = kirim(c, o);
    assert.deepEqual(r.berkas.map((b) => b.masalah), [[], []]);
    assert.deepEqual(readdirSync(r.tujuan).sort(), ['naskah.md', 'rama-digital-era-agi-4x5.mp4', 'rama-digital-era-agi-9x16-sampul.jpg',
      'rama-digital-era-agi-9x16.mp4', 'rama-digital-era-agi.id.srt']);
    const n = readFileSync(r.naskah, 'utf8');
    assert.match(n, /^# Rama Digital — Era AGI/);
    assert.match(n, /\| 9x16 \| `rama-digital-era-agi-9x16\.mp4` \| 108x192 \| 2,00 \| -1[345],\d \| -\d,\d \| 100% \| ✓ \|/);
    // VO per detik dari penempatan tata (baris pertama didorong tata ke ±0,15; CTA mulai 1 + off 0,1),
    // pipa di naskah di-escape.
    assert.match(n, /\| 0,\d\d–0,\d\d \| Hook \| Chat masuk, tapi dari iklan mana\? \|/);
    assert.match(n, /\| 1,10–1,\d\d \| CTA \| Coba gratis \\\| sekarang\. \|/);
    assert.match(n, /rencana 2 bagian \(1 dtk intro · 2 dtk drop\)/);
    assert.match(n, /\*\*klik\*\*: @stok\/03-pop/);
    assert.match(n, /Chat masuk, iklan ketahuan/);
    assert.doesNotMatch(n, /Gerbang mutu dilewati/);

    kirim(c, o);                                               // isi sama: tidak dianggap bentrok
    writeFileSync(path.join(r.tujuan, 'rama-digital-era-agi-9x16.mp4'), 'video lama yang sudah dikirim');
    assert.throws(() => kirim(c, o), /tidak ditimpa tanpa --timpa\): rama-digital-era-agi-9x16\.mp4/);
    assert.equal(readFileSync(path.join(r.tujuan, 'rama-digital-era-agi-9x16.mp4'), 'utf8'), 'video lama yang sudah dikirim');
    kirim(c, {...o, timpa: true});
    assert.ok(readFileSync(path.join(r.tujuan, 'rama-digital-era-agi-9x16.mp4')).equals(readFileSync(path.join(dir, 'iklan.mp4'))));
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

test('kirim: gerbang mutu menolak MP4 yang melanggar ambang check; --paksa mencatatnya di naskah.md', () => {
  const {c, dir, akar} = proyek({senyap4x5: true});
  try {
    const o = {merek: 'M', angle: 'A', akar};
    assert.throws(() => kirim(c, o), /gerbang mutu: 4x5 \(.*LUFS di luar -14/);
    assert.ok(!existsSync(path.join(akar, 'M', 'A')), 'folder kirim dibuat padahal gerbang gagal');
    const r = kirim(c, {...o, paksa: true});
    assert.match(readFileSync(r.naskah, 'utf8'), /Gerbang mutu dilewati \(`--paksa`\)/);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});
