import assert from 'node:assert/strict';
import test from 'node:test';
import {rencana, tempatkan} from '../lib/tata.mjs';

test('mode jangkar hanya memanjangkan scene dan konvergen', () => {
  const scenes = [{name: 'Hook', dur: 1}, {name: 'Isi', dur: 1}];
  const vo = [{no: 1, sc: 'Hook', off: 0.2, dur: 2, text: 'hook'}, {no: 2, sc: 'Isi', off: 0.1, dur: 2, text: 'isi'}];
  const hasil = rencana(vo, scenes, {mode: 'jangkar'});
  assert.ok(scenes.every((s) => s.dur >= 1));
  assert.equal(vo[1].pos, hasil.C.Isi + 0.1);
  assert.ok(hasil.total > 4);
});

test('mode alir boleh memendekkan scene', () => {
  const scenes = [{name: 'Hook', dur: 5}, {name: 'Isi', dur: 5}];
  const vo = [{no: 1, sc: 'Hook', off: 0, dur: 1, text: 'hook'}, {no: 2, sc: 'Isi', off: 0, dur: 1, text: 'isi'}];
  rencana(vo, scenes, {mode: 'alir'});
  assert.ok(scenes[0].dur < 5);
  assert.ok(scenes[1].dur < 5);
});

test('tempatkan memakai aliran berurutan', () => {
  const vo = [{no: 1, sc: 'Hook', off: 0, dur: 1}, {no: 2, sc: 'Hook', off: 0, dur: 1}];
  tempatkan(vo, {Hook: 0}, {mode: 'alir', jeda: 0.2});
  assert.deepEqual(vo.map((l) => l.pos), [0.2, 1.4]);
});

test('rencana menolak batas scene yang memotong VO', () => {
  const scenes = [{name: 'Awal', dur: 1}, {name: 'Akhir', dur: 1}];
  const vo = [{no: 1, sc: 'Akhir', off: -0.5, dur: 1, text: 'tidak boleh terpotong'}];
  assert.throws(() => rencana(vo, scenes, {mode: 'jangkar'}), /memotong VO-1/);
});
