/* P8-12: salin proyek untuk bahasa/angle lain (lib/salin.mjs, CLI `motion salin`, MCP `salin_proyek`). */
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

process.env.DATA_DIR ||= mkdtempSync(path.join(os.tmpdir(), 'motion-salin-data-'));
process.env.UNDUH_RAHASIA ||= 'r'.repeat(40);
const {salinSrc, salinAsetNonVo} = await import('../lib/salin.mjs');
const Pipa = await import('../lib/pipa.mjs');
const Pr = await import('../mcp/proyek.mjs');
const {buatServer} = await import('../mcp/alat.mjs');
const AKAR = mkdtempSync(path.join(os.tmpdir(), 'motion-salin-'));
const REPO = new URL('..', import.meta.url).pathname;
test.after(() => { rmSync(AKAR, {recursive: true, force: true}); rmSync(process.env.DATA_DIR, {recursive: true, force: true}); });

const SCENES = (d) => `<script>window.OM_SCENES = '[{"name":"A","dur":${d}}]';</script><div data-om-exportable-video-with-duration-secs="${d}"></div>`;

/** src dengan versi kerja (durasi bahasa asal) dan `.asli`, plus jejak yang tidak boleh ikut. */
function isiSrc(src) {
  mkdirSync(path.join(src, 'img'), {recursive: true});
  writeFileSync(path.join(src, 'V.html'), SCENES(7.4));            // sesudah apply: durasi bahasa asal
  writeFileSync(path.join(src, 'V.html.asli'), SCENES(5));         // brief asli
  writeFileSync(path.join(src, 'timing.js'), 'window.VO_TIMING = [{"no":1,"pos":0.2,"dur":3}];');
  writeFileSync(path.join(src, 'a.jsx.terap'), 'x');
  writeFileSync(path.join(src, '.tersembunyi'), 'x');
  writeFileSync(path.join(src, 'img', 'logo.png'), 'png');
}
function isiAset(aset) {
  for (const d of ['vo', 'sfx/norm']) mkdirSync(path.join(aset, d), {recursive: true});
  writeFileSync(path.join(aset, 'vo', 'vo-01.mp3'), 'vo');
  writeFileSync(path.join(aset, 'sfx', 'pop.mp3'), 'pop');
  writeFileSync(path.join(aset, 'sfx', 'pop.mp3.kunci'), '{"prompt":"pop"}');
  writeFileSync(path.join(aset, 'sfx', 'norm', 'pop.mp3'), 'norm');
  writeFileSync(path.join(aset, 'bgm.mp3'), 'bgm');
  writeFileSync(path.join(aset, 'bgm-norm.mp3'), 'norm');
}

test('salinSrc / salinAsetNonVo: komposisi asli, tanpa timing.js dan jejak; SFX + musik + kunci, tanpa VO dan norm', () => {
  const dari = path.join(AKAR, 'a'), ke = path.join(AKAR, 'b');
  isiSrc(path.join(dari, 'src'));
  isiAset(path.join(dari, 'aset'));
  salinSrc(path.join(dari, 'src'), path.join(ke, 'src'));
  salinAsetNonVo(path.join(dari, 'aset'), path.join(ke, 'aset'));
  assert.deepEqual(readdirSync(path.join(ke, 'src')).sort(), ['V.html', 'img']);
  assert.equal(readFileSync(path.join(ke, 'src', 'V.html'), 'utf8'), SCENES(5), 'yang tersalin versi kerja, bukan .asli');
  assert.ok(existsSync(path.join(ke, 'src', 'img', 'logo.png')));
  assert.deepEqual(readdirSync(path.join(ke, 'aset')).sort(), ['bgm.mp3', 'sfx']);
  assert.deepEqual(readdirSync(path.join(ke, 'aset', 'sfx')).sort(), ['pop.mp3', 'pop.mp3.kunci']);
});

test('motion salin: config baru meng-import config asal, mengganti suara/bahasa, membuang lafal/dengar/maks', async () => {
  const asal = path.join(AKAR, 'iklan');
  cpSync(path.join(REPO, 'contoh', 'kontrak-v2'), asal, {recursive: true});
  writeFileSync(path.join(asal, 'motion.config.mjs'), readFileSync(path.join(asal, 'motion.config.mjs'), 'utf8')
    .replace("suara: {luar: true},", "suara: {id: 'idSuaraAsal', speed: 1.2}, lafal: {ctwa: 'C T W A'},")
    .replace("text: 'Coba sekarang.'}", "text: 'Coba sekarang.', maks: 1.5, dengar: /coba/i}"));
  const ke = path.join(AKAR, 'iklan-en');
  const r = spawnSync(process.execPath, [path.join(REPO, 'bin/motion.mjs'), 'salin', asal, `--ke=${ke}`, '--bahasa=en', '--suara=idSuaraInggris'],
    {encoding: 'utf8', env: {...process.env, MOTION_ENV: '/nonexistent'}});
  assert.equal(r.status, 0, r.stderr);
  const c = await Pipa.muat(ke, {kering: true});
  assert.equal(c.nama, 'iklan-en');
  assert.equal(c.keluaran, 'iklan-en.mp4');
  assert.deepEqual(c.suara, {id: 'idSuaraInggris', speed: 1.2, bahasa: 'en'});
  assert.deepEqual(c.lafal, {});
  assert.equal(c.vo[2].text, 'Coba sekarang.');                   // placeholder: naskah asal, siap diterjemahkan
  assert.equal(c.vo[2].maks, undefined);
  assert.equal(c.vo[2].dengar, undefined);
  assert.equal(c.vo[2].sc, 'CTA');
  assert.equal(typeof c.cue, 'function', 'cue tidak diambil dari config asal');
  assert.match(readFileSync(path.join(ke, 'motion.config.mjs'), 'utf8'), /"Coba sekarang\.", \/\/ VO-3/);
  // Folder tujuan yang sudah berisi ditolak.
  const lagi = spawnSync(process.execPath, [path.join(REPO, 'bin/motion.mjs'), 'salin', asal, `--ke=${ke}`], {encoding: 'utf8'});
  assert.notEqual(lagi.status, 0);
  assert.match(lagi.stderr + lagi.stdout, /sudah ada dan tidak kosong/);
});

test('alat MCP salin_proyek: naskah diganti per nomor, VO tidak ikut, komposisi asli', async () => {
  const {Client} = await import('@modelcontextprotocol/sdk/client/index.js');
  const {InMemoryTransport} = await import('@modelcontextprotocol/sdk/inMemory.js');
  const uid = 727272;
  const [a, b] = InMemoryTransport.createLinkedPair();
  const s = buatServer(uid);
  await s.connect(a);
  const k = new Client({name: 'uji', version: '0'});
  await k.connect(b);
  const panggil = async (nama, argumen) => {
    const r = await k.callTool({name: nama, arguments: argumen});
    return {galat: Boolean(r.isError), teks: r.content.map((x) => x.text).join(' ')};
  };
  try {
    const m = Pr.buat(uid, 'asal');
    const p = Pr.buka(uid, m.id);
    isiSrc(p.src);
    isiAset(p.aset);
    writeFileSync(path.join(p.dir, 'config.json'), JSON.stringify({komposisi: 'V.html', sfx: [['pop', '@luar']],
      cue: [{at: 'P[1] + 0.1', nama: 'pop'}], vo: [{no: 1, sc: 'A', text: 'Halo semua.'}, {no: 2, sc: 'A', text: 'Coba sekarang.'}]}));
    assert.match((await panggil('salin_proyek', {proyek: m.id, nama: 'x', vo: [{no: 9, text: 'Hi'}]})).teks, /tidak ada di config asal: 9/);
    const r = await panggil('salin_proyek', {proyek: m.id, nama: 'Iklan EN', vo: [{no: 1, text: 'Hello everyone.'}]});
    assert.equal(r.galat, false, r.teks);
    const h = JSON.parse(r.teks);
    assert.deepEqual(h.belumDiganti, [2]);
    const baru = Pr.buka(uid, h.proyek);
    assert.deepEqual(JSON.parse(readFileSync(path.join(baru.dir, 'config.json'), 'utf8')).vo.map((l) => l.text), ['Hello everyone.', 'Coba sekarang.']);
    assert.equal(readFileSync(path.join(baru.src, 'V.html'), 'utf8'), SCENES(5));
    assert.deepEqual(Pr.asetAda(baru).vo, []);
    assert.deepEqual(Pr.asetAda(baru).sfx, ['pop']);
  } finally { await k.close(); await s.close(); }
});
