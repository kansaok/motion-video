import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtempSync, readFileSync, readdirSync, rmSync, existsSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as D from '../lib/imporDesain.mjs';
import * as K from '../lib/komposisi.mjs';

const b64 = (s) => Buffer.from(s).toString('base64');
const SUNTIK = '<style data-omelette-injected>.x{color:red}\n</style><script data-omelette-injected>window.a="</b>";\n</script>';
const HTML = (suntik) => `<html><head>${suntik}</head><body><script>const OM_SCENES = "[{\\"name\\":\\"A\\",\\"dur\\":3}]";</script></body></html>`;
const sumberDari = (berkas, daftarResp) => ({
  daftar: async () => daftarResp ?? {files: Object.keys(berkas).map((p) => ({path: p, size: 1}))},
  ambil: async (p) => ({content: b64(berkas[p])}),
});
const sementara = () => mkdtempSync(path.join(os.tmpdir(), 'impor-'));

test('idProyek: UUID dari tautan, id polos, dan penolakan host lain', () => {
  const id = '0a1b2c3d-1111-2222-3333-444455556666';
  assert.equal(D.idProyek(`https://claude.ai/design/p/${id}?x=1`), id);
  assert.equal(D.idProyek('abcdefghij1234567890'), 'abcdefghij1234567890');
  assert.throws(() => D.idProyek(`https://evil.example/${id}`), /claude\.ai/);
  assert.throws(() => D.idProyek('https://claude.ai/design'), /projectId tidak ditemukan/);
  assert.throws(() => D.idProyek('x'), /bukan tautan/);
});

test('impor membuang suntikan editor, menyimpan sisanya, dan hasilnya komposisi ber-OM_SCENES', async () => {
  const dir = sementara();
  try {
    const h = await D.impor(sumberDari({'v.dc.html': HTML(SUNTIK), 'a/s.jsx': 'export {}'}), dir);
    const isi = readFileSync(path.join(dir, 'v.dc.html'), 'utf8');
    assert.ok(!isi.includes('omelette'), 'suntikan masih ada');
    assert.ok(h.dibuang > 40);
    assert.deepEqual(K.temukan(dir).html, ['v.dc.html']);
    assert.equal(K.bacaScenes(path.join(dir, 'v.dc.html'))[0].dur, 3);
    assert.ok(existsSync(path.join(dir, 'a', 's.jsx')));
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

test('respons tidak sesuai skema → galat yang menyebut kunci yang diterima', async () => {
  const dir = sementara();
  try {
    await assert.rejects(D.impor(sumberDari({}, {daftar: []}), dir), /ListFiles tidak memuat daftar.*\{daftar\}/);
    await assert.rejects(D.impor(sumberDari({}, {files: [{nama: 'x'}]}), dir), /entri 0 tanpa "path"/);
    await assert.rejects(D.impor({daftar: async () => ({files: [{path: 'a.html'}]}), ambil: async () => ({isi: 'x'})}, dir), /GetFile a\.html tanpa isi.*\{isi\}/);
    await assert.rejects(D.impor({daftar: async () => ({files: [{path: 'a.html'}]}), ambil: async () => ({content: '!!bukan b64!!'})}, dir), /bukan base64/);
    await assert.rejects(D.impor(sumberDari({}, {files: []}), dir), /tidak berisi berkas/);
    assert.deepEqual(readdirSync(dir), [], 'tidak boleh menulis apa pun saat galat skema di awal');
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

test('jalur dari server: traversal, absolut, tersembunyi, dan ganda ditolak sebelum menulis', async () => {
  for (const p of ['../luar.html', 'a/../../b', '.env', 'x/.git/config'])
    assert.throws(() => D.jalurAmanRel(p), /tidak aman/, p);
  // Awalan / dibuang (jalur proyek Design bisa berawalan /), hasilnya tetap di dalam src/.
  assert.equal(D.jalurAmanRel('/etc/passwd'), 'etc/passwd');
  const dir = sementara();
  try {
    await assert.rejects(D.impor(sumberDari({'../x.html': 'a'}), dir), /tidak aman/);
    await assert.rejects(D.impor({daftar: async () => ({files: [{path: 'a.jsx'}, {path: './a.jsx'}]}), ambil: async () => ({content: b64('x')})}, dir), /jalur ganda/);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

test('batas jumlah berkas dan ukuran total', async () => {
  const dir = sementara();
  try {
    await assert.rejects(D.impor(sumberDari({'a': 'x', 'b': 'x'}), dir, {batas: {berkas: 1, bytes: 1e9}}), /batas 1/);
    await assert.rejects(D.impor(sumberDari({'a.jsx': 'x'.repeat(2048)}), dir, {batas: {berkas: 9, bytes: 1024}}), /melewati/);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

test('bersihkan: tag suntikan baru yang lolos pola menggagalkan impor, bukan lolos diam-diam', () => {
  assert.throws(() => D.bersihkan('<div data-omelette-injected>x</div>'), /masih ada data-omelette-injected/);
  assert.equal(D.bersihkan('<p>ok</p>').dibuang, 0);
});
