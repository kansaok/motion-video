import assert from 'node:assert/strict';
import test from 'node:test';
import {lubang} from '../lib/periksa.mjs';

test('lubang tidak melaporkan "rata" untuk berkas yang gagal dibaca', () => {
  const r = lubang('/tidak/ada/mus.wav');
  assert.deepEqual(r.lubang, []);
  assert.equal(r.median, null);
  assert.match(r.galat, /ffmpeg gagal membaca mus\.wav/);
});
