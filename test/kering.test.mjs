/* P6-11: `--kering`. Tanpa ElevenLabs (fetch distub dan dicatat), tanpa menulis ke proyek selain
   kerja/kering.json. Durasi VO yang belum ada diperkirakan dari kalibrasi VO proyek. */
import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import * as Kr from '../lib/kering.mjs';
import {VO} from '../lib/konstanta.mjs';
import {durasi} from '../lib/ff.mjs';
import {tandai} from '../lib/kunci.mjs';
import {rencanaVo} from '../lib/vo.mjs';

const AKAR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HTML = '<!doctype html><script>window.OM_SCENES = \'[{"name":"Hook","dur":2.5},{"name":"Isi","dur":3},{"name":"CTA","dur":2.5}]\';</script>'
  + '<div data-om-exportable-video-with-duration-secs="8"></div>';

const nada = (f, detik) => execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', `sine=f=300:d=${detik}`, '-ar', '44100', f]);

/** Proyek di direktori sementara; config ditulis sebagai modul supaya `muat` dan CLI bisa memuatnya. */
function proyek(config) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-kering-'));
  mkdirSync(path.join(dir, 'src'));
  writeFileSync(path.join(dir, 'src', 'Video.html'), HTML);
  writeFileSync(path.join(dir, 'motion.config.mjs'), `export default ${config};\n`);
  return dir;
}
const SUARA = "{id: 'suaraA', seed: 1}";
const VO3 = `[
  {no: 1, sc: 'Hook', off: 0.2, text: 'Satu kalimat pembuka yang cukup panjang.'},
  {no: 2, sc: 'Isi', off: 0.3, text: 'Kalimat kedua di scene isi.'},
  {no: 3, sc: 'CTA', off: 0.2, text: 'Coba sekarang juga.'}]`;

async function muat(dir) {
  const {muat: m} = await import('../lib/pipa.mjs');
  return m(dir, {kering: true});
}

/* Taruh VO baris `no` yang "sudah digenerate" dengan durasi tertentu dan kunci yang cocok. */
async function taruhVo(dir, no, detik, ubahKunci = (k) => k) {
  const c = await muat(dir);
  const r = rencanaVo(c).baris.find((b) => b.l.no === no);
  mkdirSync(path.dirname(r.file), {recursive: true});
  nada(r.file, detik);
  tandai(r.file, ubahKunci(r.kunci));
  return r;
}

test('kalibrasi proyek: VO yang ada menentukan kar/dtk baris yang belum ada (suara sama, speed dinormalkan)', async () => {
  const dir = proyek(`{nama: 'k', komposisi: 'Video.html', suara: ${SUARA}, vo: ${VO3}}`);
  try {
    // VO-1 sudah ada (±2,5 dtk; encode MP3 menambah padding, jadi yang dipakai durasi terukurnya).
    const r1 = await taruhVo(dir, 1, 2.5);
    const kps = r1.kunci.teks.length / durasi(r1.file);
    const c = await muat(dir);
    const d = Kr.perkiraDurasi(c);
    assert.equal(d[0].sumber, 'berkas');
    assert.ok(Math.abs(d[0].dur - durasi(r1.file)) < 1e-9);
    assert.equal(d[1].sumber, 'baru');
    assert.match(d[1].dari, /kalibrasi 1 VO proyek/);
    assert.ok(Math.abs(d[1].kps - kps) < 0.01, `${d[1].kps} vs ${kps}`);
    assert.ok(Math.abs(d[1].dur - rencanaVo(c).baris[1].kunci.teks.length / kps) < 0.01);

    // speed 1,2 di config: semua kunci basi (bukan "berkas" lagi), kecepatan dikali 1,2.
    const c2 = await muat(dir);
    c2.suara.speed = 1.2;
    const d2 = Kr.perkiraDurasi(c2);
    assert.equal(d2[0].sumber, 'basi');
    assert.ok(Math.abs(d2[0].kps - kps * 1.2) < 0.01);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

test('tanpa VO suara itu: suara.kps, lalu VO.kpsBawaan × speed', async () => {
  const dir = proyek(`{nama: 'k', komposisi: 'Video.html', suara: ${SUARA}, vo: ${VO3}}`);
  try {
    // VO suara LAIN tidak dipakai untuk mengkalibrasi suaraA.
    await taruhVo(dir, 3, 3, (k) => ({...k, voice: 'suaraB'}));
    const c = await muat(dir);
    assert.equal(Kr.perkiraDurasi(c)[0].dari, 'bawaan');
    assert.equal(Kr.perkiraDurasi(c)[0].kps, VO.kpsBawaan);
    c.suara.speed = 1.2;
    assert.ok(Math.abs(Kr.perkiraDurasi(c)[0].kps - VO.kpsBawaan * 1.2) < 1e-9);
    c.suara.kps = 12;
    assert.deepEqual([Kr.perkiraDurasi(c)[0].kps, Kr.perkiraDurasi(c)[0].dari], [12, 'suara.kps']);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

test('timeline, cue di luar video, cue tanpa sfx, maks, dan biaya musik dari timeline perkiraan', async () => {
  const dir = proyek(`{nama: 'k', komposisi: 'Video.html', suara: {id: 'suaraA', seed: 1, kps: 10},
    vo: [{no: 1, sc: 'Hook', off: 0.2, text: 'Kalimat pembuka yang panjang sekali untuk hook ini.', maks: 3},
         {no: 2, sc: 'Isi', off: 0.3, text: 'Isi.'}, {no: 3, sc: 'CTA', off: 0.2, text: 'Coba.'}],
    sfx: [['pop', 0.4, 'pop']],
    cue: ({P, total}) => [{nama: 'pop', at: P[2]}, {nama: 'pop', at: total + 1}, {nama: 'ding', at: 1}],
    musik: [{nama: 'bgm', prompt: 'p', detik: ({total}) => total}]}`);
  try {
    // timeline.json lama (8 dtk) TIDAK boleh dipakai untuk perkiraan musik.
    writeFileSync(path.join(dir, 'timeline.json'), JSON.stringify([{name: 'Hook', dur: 2.5}, {name: 'Isi', dur: 3}, {name: 'CTA', dur: 2.5}]));
    const c = await muat(dir);
    const h = Kr.kering(c, {langkah: ['vo', 'sfx', 'musik']});
    assert.equal(h.galat, null);
    // VO-1 ≈ 5 dtk (50 karakter / 10) memanjangkan Hook di atas 2,5 dtk.
    assert.ok(h.scenes[0].dur > 5, `Hook ${h.scenes[0].dur}`);
    assert.ok(h.total > 8);
    assert.deepEqual(h.cue.map((x) => x.nama), ['ding', 'pop']);
    assert.ok(h.peringatan.some((p) => /VO-1 ≈5\.\d\ds > maks 3s/.test(p)), h.peringatan.join('\n'));
    assert.ok(h.peringatan.some((p) => /cue pop di .* di luar video/.test(p)));
    assert.ok(h.peringatan.some((p) => /cue tanpa entri sfx: ding/.test(p)));
    assert.deepEqual(h.musik, [{nama: 'bgm', status: 'baru', detik: +h.total.toFixed(1)}]);
    const m = h.biaya.rincian.find((x) => x.jenis === 'musik');
    assert.equal(m.nama, `bgm ${Math.round(h.total)}s`);
    assert.match(Kr.lapor(h, c), /DIPERKIRAKAN/);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

test('batas scene yang memotong kalimat dilaporkan sebagai galat, bukan dilempar', async () => {
  // mode alir + geserAwal ekstrem membuat batas Isi jatuh di dalam VO-1.
  const dir = proyek(`{nama: 'k', komposisi: 'Video.html', suara: {id: 'v', kps: 5}, vo: ${VO3},
    tata: {mode: 'alir', geserAwal: {Isi: -3}}}`);
  try {
    const c = await muat(dir);
    const h = Kr.kering(c, {langkah: ['vo']});
    assert.match(h.galat, /batas scene .* memotong VO-/);
    assert.match(Kr.lapor(h, c), /✖ rencana gagal/);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

/* Isi pohon proyek: jalur -> [ukuran, mtime]. */
const pohon = (dir) => {
  const out = {};
  const jalan = (d) => { for (const n of readdirSync(d)) { const f = path.join(d, n); const s = statSync(f);
    if (s.isDirectory()) { out[`${path.relative(dir, f)}/`] = 0; jalan(f); } else out[path.relative(dir, f)] = `${s.size}:${s.mtimeMs}`; } };
  jalan(dir);
  return out;
};

test('CLI: plan/all --kering tanpa satu pun fetch, dan hanya kerja/kering.json yang bertambah', () => {
  const dir = proyek(`{nama: 'k', komposisi: 'Video.html', suara: ${SUARA}, vo: ${VO3},
    sfx: [['pop', 0.4, 'pop'], ['tik', '@stok/03-pop']], cue: ({P}) => [{nama: 'pop', at: P[2]}],
    musik: [{nama: 'bgm', prompt: 'p', detik: ({total}) => total}]}`);
  const catat = path.join(dir, '..', `${path.basename(dir)}-fetch.log`);
  const stub = path.join(dir, '..', `${path.basename(dir)}-stub.mjs`);
  /* Stub di proses CLI: setiap fetch dicatat lalu dijawab 401 (tidak diulang klien, jadi kontrol
     di bawah cepat). Membuktikan nol permintaan, ke mana pun. */
  writeFileSync(stub, `import {appendFileSync} from 'node:fs';\nglobalThis.fetch = async (u) => { appendFileSync(${JSON.stringify(catat)}, String(u) + '\\n'); return new Response('{"detail":"stub"}', {status: 401}); };\n`);
  const env = {...process.env, ELEVENLABS_API_KEY: 'kunci-uji-bukan-asli', MOTION_ENV: '/nonexistent'};
  const jalan = (...a) => spawnSync(process.execPath, ['--import', stub, path.join(AKAR, 'bin/motion.mjs'), ...a, dir], {encoding: 'utf8', env});
  try {
    const sebelum = pohon(dir);
    for (const p of ['plan', 'all']) {
      const r = jalan(p, '--kering');
      assert.equal(r.status, 0, r.stdout + r.stderr);
      assert.match(r.stdout, /KERING: tidak ada panggilan ElevenLabs/);
      assert.match(r.stdout, /biaya bila dijalankan: \d/);
    }
    assert.equal(existsSync(catat), false, `fetch terpanggil: ${existsSync(catat) && readFileSync(catat, 'utf8')}`);
    const sesudah = pohon(dir);
    const baru = Object.keys(sesudah).filter((k) => !(k in sebelum));
    assert.deepEqual(baru.sort(), ['kerja/', 'kerja/kering.json']);
    for (const k of Object.keys(sebelum)) assert.equal(sesudah[k], sebelum[k], `${k} berubah`);
    const j = JSON.parse(readFileSync(path.join(dir, 'kerja', 'kering.json'), 'utf8'));
    assert.deepEqual(j.sfx.map((x) => [x.nama, x.status]), [['pop', 'baru'], ['tik', 'disalin dari stok']]);
    assert.equal(j.vo.length, 3);

    // Kontrol: tanpa --kering, stub yang sama MENANGKAP permintaan (jadi nol di atas bermakna).
    const r = jalan('plan', '--ya');
    assert.notEqual(r.status, 0);
    assert.match(readFileSync(catat, 'utf8'), /elevenlabs/);

    assert.match(jalan('mix', '--kering').stderr, /--kering hanya untuk plan dan all/);
  } finally {
    rmSync(dir, {recursive: true, force: true});
    rmSync(catat, {force: true});
    rmSync(stub, {force: true});
  }
});

test('contoh kontrak-v2 (suara.luar): semua baris "belum diunggah", biaya 0', async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-kering-'));
  try {
    cpSync(path.join(AKAR, 'contoh', 'kontrak-v2'), dir, {recursive: true});
    const c = await muat(dir);
    const h = Kr.kering(c, {langkah: ['vo', 'sfx', 'musik']});
    assert.deepEqual(h.vo.map((x) => x.sumber), ['belum diunggah', 'belum diunggah', 'belum diunggah']);
    assert.equal(h.biaya.kredit, 0);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});
