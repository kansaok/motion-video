/* P6-09: batalkan render (antre dan jalan) dan dasbor admin. Proses pekerja palsu (pola
   test/antrean.test.mjs); dasbor diuji lewat HTTP sungguhan dengan antrean dan data palsu. */
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import express from 'express';

process.env.DATA_DIR ||= mkdtempSync(path.join(os.tmpdir(), 'motion-batal-data-'));
const A = await import('../mcp/antrean.mjs');
const {pasangAdmin, tokenBatal} = await import('../mcp/admin.mjs');

test('jalankanPekerja: sinyal batal mematikan grup proses dan menghapus direktori kerja', async () => {
  const ac = new AbortController();
  let dibunuh, dibersihkan;
  const janji = A.jalankanPekerja({uid: 1, proyek: 'p', dir: process.cwd(), opsi: {}}, {
    batasMs: 60_000, macetMs: 60_000, batal: ac.signal,
    buatProses: () => { const anak = new EventEmitter(); anak.pid = 5150; anak.send = () => setImmediate(() => ac.abort('oleh pemilik')); return anak; },
    bunuhGrup: (pid) => { dibunuh = pid; }, buatKerja: () => '/tmp/motion-kerja-batal', hapusKerja: (d) => { dibersihkan = d; },
  });
  await assert.rejects(janji, (e) => e.dibatalkan === true && /dibatalkan: oleh pemilik/.test(e.message));
  assert.equal(dibunuh, 5150);
  assert.equal(dibersihkan, '/tmp/motion-kerja-batal');

  // Sudah dibatalkan sebelum pekerja sempat mulai: langsung dimatikan, tanpa menunggu batas waktu.
  const ac2 = new AbortController(); ac2.abort();
  let dibunuh2;
  await assert.rejects(A.jalankanPekerja({uid: 1, proyek: 'p', dir: process.cwd(), opsi: {}}, {batal: ac2.signal,
    buatProses: () => { const anak = new EventEmitter(); anak.pid = 5151; anak.send = () => {}; return anak; },
    bunuhGrup: (pid) => { dibunuh2 = pid; }, buatKerja: () => '/tmp/x', hapusKerja: () => {}}), /dibatalkan/);
  assert.equal(dibunuh2, 5151);
});

const proyek = (id) => ({meta: {id}, dir: `/data/u/1/${id}`});

test('antrean.batalkan: yang antre dikeluarkan, yang jalan dihentikan, milik orang lain tidak bisa, admin bisa', () => {
  const disimpan = [], dihentikan = [], dikabari = [];
  const q = A.buatAntrean({paralel: 0, maks: 5, simpan: (t) => disimpan.push(t.status), tunda: () => {},
    hentikanJalan: (t, alasan) => dihentikan.push([t.id, alasan]), padaDibatalkan: (t) => dikabari.push(t.id)});
  const a = q.kirim(1, proyek('satu-aaa'), {});
  assert.throws(() => q.batalkan(2, a.id), /tidak ditemukan/);
  assert.deepEqual(q.batalkan(1, a.id), {render: a.id, status: 'dibatalkan'});
  assert.equal(q.antre.length, 0);
  assert.deepEqual([a.status, a.galat], ['dibatalkan', 'dibatalkan oleh pemilik']);
  assert.equal(disimpan.at(-1), 'dibatalkan');
  assert.deepEqual(dikabari, [a.id]);
  assert.throws(() => q.batalkan(1, a.id), /sudah dibatalkan/);
  // Render baru untuk akun yang sama boleh langsung diantrekan.
  const b = q.kirim(1, proyek('dua-bbb'), {});
  b.status = 'jalan'; q.antre.splice(0, 1);
  assert.deepEqual(q.batalkan(null, b.id, {admin: true}), {render: b.id, status: 'menghentikan'});
  assert.deepEqual(dihentikan, [[b.id, 'oleh admin']]);
});

test('kerjakan: pekerja yang dihentikan sinyal berakhir "dibatalkan", bukan "gagal"', async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-batal-'));
  try {
    const t = {id: 'r-batal1', uid: 3, proyek: 'p', dir, status: 'antre', opsi: {}};
    const jalan = A.kerjakan(t, {jalankan: (_t, {batal}) => new Promise((_, gagal) => {
      batal.addEventListener('abort', () => gagal(Object.assign(new Error(`dibatalkan: ${batal.reason}`), {dibatalkan: true})));
      setImmediate(() => A.hentikanTugas('r-batal1', 'oleh pemilik'));
    })});
    await jalan;
    assert.deepEqual([t.status, t.galat], ['dibatalkan', 'dibatalkan: oleh pemilik']);
    assert.equal(JSON.parse(readFileSync(path.join(dir, 'render.json'), 'utf8')).status, 'dibatalkan');
    assert.equal(A.hentikanTugas('r-batal1'), undefined, 'pengendali dilepas sesudah tugas berakhir');
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

/* Dasbor admin lewat HTTP sungguhan. */
async function dasbor(token) {
  const DATA = mkdtempSync(path.join(os.tmpdir(), 'motion-admin-'));
  const p = path.join(DATA, 'u', '7', 'promo-abc');
  mkdirSync(p, {recursive: true});
  writeFileSync(path.join(p, 'render.json'), JSON.stringify({id: 'r-lama', uid: 7, proyek: '<script>alert(1)</script>', status: 'gagal',
    selesai: '2026-11-05T00:00:00Z', galat: '<img src=x onerror=alert(2)>'}));
  const dibatalkan = [];
  const app = express();
  pasangAdmin(app, {token, DATA, kuotaMb: 1500, pakai: () => 5 * 1048576,
    daftarTugas: () => [{id: 'r-jalan', uid: 7, proyek: 'promo-abc', status: 'jalan', langkah: 'render', mulai: 'm'},
      {id: 'r-antre', uid: 8, proyek: 'lain', status: 'antre', langkah: 'antre', urutan: 1, dibuat: 'd'}],
    batalkan: (uid, id, o) => { dibatalkan.push([uid, id, o]); return {render: id, status: 'menghentikan'}; }});
  const srv = await new Promise((ok) => { const s = app.listen(0, '127.0.0.1', () => ok(s)); });
  const url = `http://127.0.0.1:${srv.address().port}`;
  return {url, dibatalkan, tutup: () => { srv.close(); rmSync(DATA, {recursive: true, force: true}); }};
}
const basic = (sandi) => ({authorization: `Basic ${Buffer.from(`admin:${sandi}`).toString('base64')}`});
const TOKEN = 't'.repeat(40);

test('dasbor admin: tanpa ADMIN_TOKEN tidak ada; sandi salah 401; isi pelanggan di-escape; CSP tanpa skrip', async () => {
  const mati = await dasbor(undefined);
  try { assert.equal((await fetch(`${mati.url}/admin`, {headers: basic('x')})).status, 404); } finally { mati.tutup(); }
  const pendek = await dasbor('pendek');
  try { assert.equal((await fetch(`${pendek.url}/admin`, {headers: basic('pendek')})).status, 404); } finally { pendek.tutup(); }

  const d = await dasbor(TOKEN);
  try {
    const tanpa = await fetch(`${d.url}/admin`);
    assert.equal(tanpa.status, 401);
    assert.match(tanpa.headers.get('www-authenticate'), /Basic realm="motion-mcp admin"/);
    assert.equal((await fetch(`${d.url}/admin`, {headers: basic('salah')})).status, 401);
    const r = await fetch(`${d.url}/admin`, {headers: basic(TOKEN)});
    assert.equal(r.status, 200);
    assert.match(r.headers.get('content-security-policy'), /default-src 'none'/);
    assert.equal(r.headers.get('cache-control'), 'no-store');
    const html = await r.text();
    assert.match(html, /1 jalan · 1 antre/);
    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.doesNotMatch(html, /<script>|<img /);
    assert.match(html, new RegExp(`action="/admin/batalkan/r-jalan"><input type="hidden" name="csrf" value="${tokenBatal(TOKEN, 'r-jalan')}"`));
    assert.match(html, /<td>7<\/td><td>1<\/td><td>5\.0 MB<\/td>/);
  } finally { d.tutup(); }
});

test('dasbor admin: batalkan butuh token formulir yang benar (CSRF), lalu kembali ke dasbor', async () => {
  const d = await dasbor(TOKEN);
  try {
    const kirim = (csrf) => fetch(`${d.url}/admin/batalkan/r-jalan`, {method: 'POST', redirect: 'manual',
      headers: {...basic(TOKEN), 'content-type': 'application/x-www-form-urlencoded'}, body: `csrf=${csrf}`});
    assert.equal((await kirim('palsu')).status, 403);
    assert.equal((await kirim(tokenBatal(TOKEN, 'r-antre'))).status, 403, 'token render lain tidak berlaku');
    assert.deepEqual(d.dibatalkan, []);
    const r = await kirim(tokenBatal(TOKEN, 'r-jalan'));
    assert.deepEqual([r.status, r.headers.get('location')], [303, '/admin']);
    assert.deepEqual(d.dibatalkan, [[null, 'r-jalan', {admin: true}]]);
  } finally { d.tutup(); }
});

test('alat MCP batalkan_render: render orang lain/tidak ada ditolak', async () => {
  const {Client} = await import('@modelcontextprotocol/sdk/client/index.js');
  const {InMemoryTransport} = await import('@modelcontextprotocol/sdk/inMemory.js');
  const {buatServer} = await import('../mcp/alat.mjs');
  const [a, b] = InMemoryTransport.createLinkedPair();
  const s = buatServer(616161);
  await s.connect(a);
  const k = new Client({name: 'uji', version: '0'});
  await k.connect(b);
  try {
    const r = await k.callTool({name: 'batalkan_render', arguments: {render: 'r-0000'}});
    assert.equal(r.isError, true);
    assert.match(r.content[0].text, /tidak ditemukan/);
  } finally { await k.close(); await s.close(); }
});

test('proses sungguhan yang macet mati oleh pembatalan, termasuk cucunya (grup proses)', {skip: process.platform === 'win32'}, async () => {
  const {spawn} = await import('node:child_process');
  let anakPid, cucuPid;
  const ac = new AbortController();
  // Anak memunculkan cucu (seperti node -> Chromium) lalu keduanya diam selamanya.
  const kode = `const c = require('child_process').spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {stdio: 'ignore'});
    process.send({langkah: 'render', cucu: c.pid}); setInterval(() => {}, 1000);`;
  const janji = A.jalankanPekerja({uid: 1, proyek: 'p', dir: process.cwd(), opsi: {}}, {
    batasMs: 60_000, macetMs: 60_000, batal: ac.signal, buatKerja: () => '/tmp/motion-kerja-nyata', hapusKerja: () => {},
    buatProses: (_p, _a, o) => {
      const anak = spawn(process.execPath, ['-e', kode], {...o, env: process.env});
      anakPid = anak.pid;
      anak.on('message', (m) => { if (m.cucu) { cucuPid = m.cucu; ac.abort('macet'); } });
      return anak;
    },
  });
  await assert.rejects(janji, /dibatalkan: macet/);
  const hidup = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
  for (let i = 0; i < 50 && (hidup(anakPid) || hidup(cucuPid)); i++) await new Promise((r) => setTimeout(r, 20));
  assert.equal(hidup(anakPid), false, 'pekerja masih hidup');
  assert.equal(hidup(cucuPid), false, 'proses cucu (Chromium/ffmpeg) masih hidup');
});
