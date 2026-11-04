import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {mkdtemp, writeFile, readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {bacaScenes, tulisScenes, cariScenes, temukan} from '../lib/komposisi.mjs';

const NAMA_TEPI = ['Hook ]', 'a;b', 'kutip "ganda"', "kutip 'tunggal'", 'garis\\miring', 'Ünïcödé 🎬', '];"'];

async function berkas(isi, nama = 'k.html') {
  const dir = await mkdtemp(path.join(tmpdir(), 'motion-scenes-'));
  const f = path.join(dir, nama);
  await writeFile(f, isi);
  return f;
}

// Nilai yang benar-benar dilihat browser: jalankan deklarasinya sebagai JS.
const nilaiJs = (isi) => {
  const d = cariScenes(isi);
  return JSON.parse(vm.runInNewContext(`var ${isi.slice(d.awal, d.akhir)} OM_SCENES`));
};

for (const kutip of ['"', "'"]) {
  test(`bacaScenes/tulisScenes tahan kasus tepi dengan kutip ${kutip}`, async () => {
    const scenes = NAMA_TEPI.map((name, i) => ({name, dur: i + 1}));
    const json = JSON.stringify(scenes);
    const literal = kutip === '"' ? JSON.stringify(json) : `'${json.replace(/[\\']/g, (c) => `\\${c}`)}'`;
    const f = await berkas(`<script>\n// OM_SCENES = "komentar, bukan deklarasi\nconst OM_SCENES = ${literal};\nconst X = 1;\n</script>`);
    assert.deepEqual(bacaScenes(f), scenes);
    assert.deepEqual(nilaiJs(readFileSync(f, 'utf8')), scenes);

    assert.equal(tulisScenes(f, {'a;b': 9.5, '];"': 0.25}), true);
    const isi = await readFile(f, 'utf8');
    const harap = scenes.map((s) => ({...s, dur: s.name === 'a;b' ? 9.5 : s.name === '];"' ? 0.25 : s.dur}));
    assert.deepEqual(bacaScenes(f), harap);
    assert.deepEqual(nilaiJs(isi), harap, 'hasil tulis harus tetap JS valid dengan nilai yang sama');
    assert.match(isi, new RegExp(`OM_SCENES = \\${kutip}`), 'jenis kutip dipertahankan');
    assert.match(isi, /const X = 1;/);
  });
}

test('pemindai menafsirkan escape \\u, \\x, dan \\u{...}', async () => {
  const f = await berkas(String.raw`OM_SCENES = "[{\"name\":\"A\x42\u{1F3AC}\",\"dur\":2}]";`);
  assert.deepEqual(bacaScenes(f), [{name: 'AB🎬', dur: 2}]);
});

test('literal tak tertutup atau JSON rusak memberi galat yang jelas', async () => {
  const takTertutup = await berkas('OM_SCENES = "[{\\"name\\":1}]');
  assert.throws(() => bacaScenes(takTertutup), /tidak ditemukan/);
  const rusak = await berkas("OM_SCENES = '[{name: 1}]';");
  assert.throws(() => bacaScenes(rusak), /bukan JSON valid/);
});

test('temukan memakai pemindai yang sama', async () => {
  const f = await berkas("const OM_SCENES = '[{\"name\":\"a]\",\"dur\":1}]';", 'utama.html');
  assert.deepEqual(temukan(path.dirname(f)).html, ['utama.html']);
});

// Parser lama, disalin persis, untuk memastikan perilaku pada komposisi nyata tidak berubah.
const bacaLama = (isi) => {
  const m = isi.match(/OM_SCENES\s*=\s*(["'])(\[[\s\S]*?\])\1\s*;/);
  return m ? JSON.parse(m[2].replace(/\\"/g, '"')) : null;
};

test('hasil sama dengan parser lama untuk setiap komposisi di proyek/', (t) => {
  const akar = new URL('../proyek/', import.meta.url).pathname;
  const html = existsSync(akar) ? readdirSync(akar).flatMap((p) => {
    const src = path.join(akar, p, 'src');
    return existsSync(src) ? readdirSync(src).filter((f) => /\.html?$/i.test(f)).map((f) => path.join(src, f)) : [];
  }) : [];
  if (!html.length) return t.skip('tidak ada proyek/*/src/*.html di mesin ini');
  for (const f of html) {
    const isi = readFileSync(f, 'utf8'), lama = bacaLama(isi);
    if (lama) assert.deepEqual(bacaScenes(f), lama, f);
  }
});
