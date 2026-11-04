import assert from 'node:assert/strict';
import test from 'node:test';
import {batasiLaju} from '../mcp/alat.mjs';

test('batasiLaju menahan akun yang membanjiri unggah lalu mengisi ulang token', () => {
  const awal = 1_000_000;
  for (let i = 0; i < 12; i++) batasiLaju(99123, 'unggah', awal);
  assert.throws(() => batasiLaju(99123, 'unggah', awal), /batas laju/);
  assert.doesNotThrow(() => batasiLaju(99123, 'unggah', awal + 5_000));
});
