import assert from 'node:assert/strict';
import test from 'node:test';
import {hitung} from '../mcp/ekspresi.mjs';

const ling = {C: {Hook: 2, 'Nama Scene': 7}, P: {7: 3.5}, E: {}, S: {}, total: 12};

test('hitung menghormati prioritas operator dan fungsi', () => {
  assert.equal(hitung('1 + 2 * 3', ling), 7);
  assert.equal(hitung('max(C.Hook + 1, min(8, C[\'Nama Scene\'] + 2))', ling), 8);
  assert.equal(hitung('P[7] + total', ling), 15.5);
});

test('hitung menolak ekspresi dan peta yang tidak sah', () => {
  assert.throws(() => hitung('asing + 1', ling), /tidak dikenal/);
  assert.throws(() => hitung('(1 + 2', ling), /butuh "\)"/);
  assert.throws(() => hitung('1 +', ling), /terpotong/);
  assert.throws(() => hitung('1 / 0', ling), /Infinity/);
  assert.throws(() => hitung('C.TidakAda', ling), /tidak ada/);
});
