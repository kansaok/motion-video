import assert from 'node:assert/strict';
import test from 'node:test';
import {migrasiConfig, VERSI_SKEMA} from '../mcp/skema.mjs';

test('config tanpa versiSkema dianggap versi 1 dan diberi versi terkini', () => {
  assert.deepEqual(migrasiConfig({komposisi: 'a.html'}), {komposisi: 'a.html', versiSkema: VERSI_SKEMA});
});

test('migrasi dijalankan berurutan sampai versi terkini', () => {
  const migrasi = {
    1: (j) => ({...j, suara: j.voice, voice: undefined}),
    2: (j) => ({...j, vo: j.vo.map((l) => ({...l, teks: l.text}))}),
  };
  const hasil = migrasiConfig({voice: 'x', vo: [{text: 'halo'}]}, {versi: 3, migrasi});
  assert.equal(hasil.versiSkema, 3);
  assert.equal(hasil.suara, 'x');
  assert.equal(hasil.vo[0].teks, 'halo');
});

test('config dari versi lebih baru atau tanpa jalur migrasi ditolak dengan jelas', () => {
  assert.throws(() => migrasiConfig({versiSkema: VERSI_SKEMA + 1}), /perbarui motion-mcp/);
  assert.throws(() => migrasiConfig({}, {versi: 2, migrasi: {}}), /tidak ada migrasi config dari versiSkema 1 ke 2/);
  assert.throws(() => migrasiConfig({versiSkema: 0}), /tidak sah/);
});
