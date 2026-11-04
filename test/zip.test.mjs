import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {periksaZip} from '../lib/pipa.mjs';

const buatZipPalsu = (isiDaftar, isiTabel, opsi = {}) => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-zip-'));
  const zip = path.join(dir, 'masuk.zip');
  writeFileSync(zip, 'zip-palsu');
  const jalankan = (_program, argumen) => argumen[1] === '-1' ? isiDaftar : isiTabel;
  try { return opsi.cek(zip, jalankan); } finally { rmSync(dir, {recursive: true, force: true}); }
};

test('periksaZip membatasi isi ekstrak dan menerima jalur relatif biasa', () => {
  const daftar = 'video.dc.html\nscript.jsx\nimg/logo.png\n';
  const tabel = 'Archive: masuk.zip\n  Length      Date    Time    Name\n--------  ---------- -----   ----\n'
    + '      120  2026-01-01 00:00   video.dc.html\n       80  2026-01-01 00:00   script.jsx\n'
    + '--------                     -------\n      200                     2 files\n';
  const hasil = buatZipPalsu(daftar, tabel, {cek: (zip, jalankan) => periksaZip(zip, {jalankan, maksRasio: 100})});
  assert.deepEqual(hasil, {entri: 3, ukuran: 200});
});

test('periksaZip menolak traversal, terlalu banyak entri, dan ukuran ekstrak besar', () => {
  assert.throws(() => buatZipPalsu('../rahasia\n', '', {cek: (zip, jalankan) => periksaZip(zip, {jalankan})}), /jalur tidak aman/);
  assert.throws(() => buatZipPalsu('a\nb\n', '', {cek: (zip, jalankan) => periksaZip(zip, {jalankan, maksEntri: 1})}), /batas 1/);
  const tabel = '  9999  2026-01-01 00:00   besar.bin\n';
  assert.throws(() => buatZipPalsu('besar.bin\n', tabel, {cek: (zip, jalankan) => periksaZip(zip, {jalankan, maksBytes: 9000, maksRasio: Infinity})}), /isi zip/);
});
