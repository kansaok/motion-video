import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import {jalurAman} from '../mcp/proyek.mjs';

const akar = path.resolve('/tmp', 'motion-engine-jalur');

test('jalurAman menolak jalur keluar dan berkas kerja mesin', () => {
  for (const rel of ['../rahasia', '/etc/passwd', 'C:\\Windows\\system.ini', '.tersembunyi', 'src/.env', 'video.jsx.asli', 'video.jsx.terap', 'video.jsx.kunci']) {
    assert.throws(() => jalurAman(akar, rel), /tidak sah|tidak boleh/);
  }
});

test('jalurAman menerima subfolder biasa', () => {
  assert.equal(jalurAman(akar, 'src/animasi/utama.jsx'), path.join(akar, 'src/animasi/utama.jsx'));
});
