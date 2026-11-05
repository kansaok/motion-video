/* Warna MP4 dan sampul: frame JPEG Chromium (BT.601 rentang penuh) harus tampil dengan warna
   yang sama di pemutar yang membaca BT.709. Dulu MP4 dikonversi BT.601 tanpa tanda, dan hijau
   WhatsApp #25D366 tampil 22,186,99. Tanpa Chromium: frame dibuat ffmpeg. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync, rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {ff} from '../lib/ff.mjs';
import {argMux, argSampulVideo} from '../lib/render.mjs';

const W = 128, H = 64;
const HIJAU = '25D366', MERAH = 'E53935', BIRU = '1E88E5';
const CPU = {arg: ['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '12']};

/** RGB satu piksel dari frame pertama (atau frame ke-`n`), dengan matriks dekode yang diberikan. */
function piksel(f, x, y, {dekode = '', n = 0} = {}) {
  const vf = `${n ? `select=eq(n\\,${n}),` : ''}${dekode}${dekode ? ',' : ''}format=rgb24`;
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-vf', vf, '-frames:v', '1', '-f', 'rawvideo', '-'], {maxBuffer: 1 << 24});
  const i = (y * W + x) * 3;
  return [raw[i], raw[i + 1], raw[i + 2]];
}
const SEBAGAI_PEMUTAR = 'scale=in_color_matrix=bt709:in_range=tv';
const selisih = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])));

/** Frame JPEG 128x64: kiri hijau, kanan merah. Plus audio 0,3 dtk. */
function bahan(dir) {
  for (let i = 0; i < 9; i++) {
    ff(['-f', 'lavfi', '-i', `color=c=0x${HIJAU}:s=${W / 2}x${H}`, '-f', 'lavfi', '-i', `color=c=0x${MERAH}:s=${W / 2}x${H}`,
      '-filter_complex', '[0][1]hstack', '-frames:v', '1', '-q:v', '2', path.join(dir, `${String(i).padStart(6, '0')}.jpg`)]);
  }
  ff(['-f', 'lavfi', '-i', 'sine=frequency=440:duration=0.3', path.join(dir, 'a.wav')]);
  const acuan = path.join(dir, '000000.jpg');
  return {acuan, hijau: piksel(acuan, 16, 32), merah: piksel(acuan, 112, 32)};
}

const mux = (dir, ekstra = {}) => {
  const keluaran = path.join(dir, 'v.mp4');
  ff(argMux({frame: path.join(dir, '%06d.jpg'), fps: 30, audio: path.join(dir, 'a.wav'), W, H, enc: CPU, keluaran, ...ekstra}));
  return keluaran;
};

test('MP4 bertanda BT.709 dan warnanya sama dengan frame Chromium saat diputar sebagai BT.709', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-warna-'));
  try {
    const b = bahan(dir);
    const mp4 = mux(dir);
    const tanda = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries',
      'stream=color_space,color_primaries,color_transfer,color_range', '-of', 'default=nw=1', mp4], {encoding: 'utf8'});
    for (const k of ['color_space=bt709', 'color_primaries=bt709', 'color_transfer=bt709', 'color_range=tv']) {
      assert.match(tanda, new RegExp(k), `tanda ${k} tidak ada:\n${tanda}`);
    }
    // Pipa lama: hijau meleset 25 dan merah 15 di pemutar. Toleransi 6 untuk chroma 4:2:0 + x264.
    const hijau = piksel(mp4, 16, 32, {dekode: SEBAGAI_PEMUTAR}), merah = piksel(mp4, 112, 32, {dekode: SEBAGAI_PEMUTAR});
    assert.ok(selisih(hijau, b.hijau) <= 6, `hijau ${hijau} vs JPEG ${b.hijau}`);
    assert.ok(selisih(merah, b.merah) <= 6, `merah ${merah} vs JPEG ${b.merah}`);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

test('gambar sampul yang ditempel di frame 0 juga BT.709, dan hilang sesudah `ms`', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-warna-'));
  try {
    const b = bahan(dir);
    const png = path.join(dir, 'sampul.png');
    ff(['-f', 'lavfi', '-i', `color=c=0x${BIRU}:s=${W}x${H}`, '-frames:v', '1', png]);
    const biru = piksel(png, 64, 32);
    const mp4 = mux(dir, {gambar: png, mulai: 0, ms: 0.1});
    const f0 = piksel(mp4, 64, 32, {dekode: SEBAGAI_PEMUTAR});
    assert.ok(selisih(f0, biru) <= 6, `frame 0 ${f0} vs sampul ${biru}`);
    const f6 = piksel(mp4, 16, 32, {dekode: SEBAGAI_PEMUTAR, n: 6});
    assert.ok(selisih(f6, b.hijau) <= 6, `frame 6 ${f6} masih sampul? JPEG ${b.hijau}`);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

test('sampul JPG yang dicuplik dari MP4 BT.709 berwarna benar di pembaca JPEG', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-warna-'));
  try {
    const b = bahan(dir);
    const jpg = path.join(dir, 'v-sampul.jpg');
    ff(argSampulVideo(mux(dir), 0, jpg));
    // Pembaca JPEG biasa: dekode bawaan, tanpa petunjuk matriks. Tanpa konversi: hijau jadi 50,238,104.
    const hijau = piksel(jpg, 16, 32), merah = piksel(jpg, 112, 32);
    assert.ok(selisih(hijau, b.hijau) <= 6, `hijau ${hijau} vs JPEG ${b.hijau}`);
    assert.ok(selisih(merah, b.merah) <= 6, `merah ${merah} vs JPEG ${b.merah}`);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});
