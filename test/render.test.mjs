import assert from 'node:assert/strict';
import {request} from 'node:http';
import {mkdtemp, mkdir, symlink, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {layani} from '../lib/render.mjs';

function ambil(port, jalur) {
  return new Promise((selesai, gagal) => {
    const r = request({hostname: '127.0.0.1', port, path: jalur}, (res) => {
      const data = [];
      res.on('data', (b) => data.push(b));
      res.on('end', () => selesai({kode: res.statusCode, header: res.headers, isi: Buffer.concat(data).toString()}));
    });
    r.on('error', gagal); r.end();
  });
}

test('layani menolak traversal, berkas kerja, tersembunyi, dan symlink', async () => {
  const dasar = await mkdtemp(path.join(tmpdir(), 'motion-render-'));
  const akar = path.join(dasar, 'src'), saudara = path.join(dasar, 'src-rahasia');
  await Promise.all([mkdir(akar), mkdir(saudara)]);
  await Promise.all([writeFile(path.join(akar, 'aman.js'), 'export default 1'),
    writeFile(path.join(akar, '.rahasia'), 'jangan-baca'), writeFile(path.join(akar, 'aman.js.asli'), 'jejak'),
    writeFile(path.join(saudara, 'kunci.txt'), 'rahasia')]);
  await symlink(path.join(saudara, 'kunci.txt'), path.join(akar, 'tautan.js'));
  const srv = await layani(akar);
  try {
    assert.equal((await ambil(srv.port, '/aman.js')).kode, 200);
    assert.equal((await ambil(srv.port, '/aman.js')).header['x-content-type-options'], 'nosniff');
    assert.equal((await ambil(srv.port, '/%2e%2e/src-rahasia/kunci.txt')).kode, 403);
    assert.equal((await ambil(srv.port, '/.rahasia')).kode, 403);
    assert.equal((await ambil(srv.port, '/aman.js.asli')).kode, 403);
    assert.equal((await ambil(srv.port, '/tautan.js')).kode, 404);
  } finally { srv.tutup(); }
});
