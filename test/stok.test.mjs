/* P6-06: pencarian stok SFX. 20 kueri tulisan tangan terhadap katalog nyata (sfx-stok/katalog.json,
   ikut git): KETIGA hasil teratas harus relevan, dinilai dari id + prompt bunyinya sendiri, bukan
   dari skor pencarian. Ditambah aturan yang dulu salah: negasi di prompt, kategori tebakan regex,
   sinonim ambigu, kata pendek. */
import assert from 'node:assert/strict';
import test from 'node:test';
import * as S from '../lib/stok.mjs';

const K = S.muatKatalog();
const teks = (d) => `${d.id} ${d.prompt || ''}`.toLowerCase();

/** [kueri, relevan(id + prompt)] */
const KUERI = [
  ['kasir', /cash register|kasir|ka-?ching/],
  ['klik', /click|klik/],
  ['whoosh', /whoosh/],
  ['transisi', /whoosh|swoosh|transition|swish|sweep/],
  ['riser', /riser|rising/],
  ['hentakan', /impact|hit|slam|boom/],
  ['uang', /money|cash|coin/],
  ['ketik', /typing|keyboard|ketik/],
  ['robek kertas', /\btear|\btorn\b|\brip\b/],
  ['notifikasi', /notification|ding|ping|notif/],
  ['jantung', /heartbeat/],
  ['lonceng sukses', /chime|bell|success/],
  ['error', /error/],
  ['glitch', /glitch/],
  ['kamera', /camera|shutter/],
  ['stempel', /stamp/],
  ['hitung angka', /counter|odometer|digit/],
  ['tombol', /button|tap|click|press/],
  ['telepon', /phone/],
  ['gelembung', /bubble/],
  ['getar', /vibrat/],
  ['swoosh cepat', /(whoosh|swoosh)[\s\S]*(fast|quick|cepat)|(fast|quick|cepat)[\s\S]*(whoosh|swoosh)/],
];

/* N teratas harus relevan semuanya, N = min(3, bunyi relevan yang memang ada di stok): stok hanya
   punya dua bunyi getar HP, jadi bunyi ketiga untuk "getar" tidak mungkin relevan. */
test(`${KUERI.length} kueri tulisan tangan: hasil teratas relevan`, () => {
  const gagal = [];
  for (const [q, re] of KUERI) {
    const n = Math.min(3, K.filter((d) => re.test(teks(d))).length);
    assert.ok(n >= 2, `kueri "${q}" tidak punya cukup bunyi relevan di stok untuk diuji`);
    const atas = S.cari(q, K).slice(0, n);
    if (atas.length < n || !atas.every((d) => re.test(teks(d)))) gagal.push(`${q}: ${atas.map((d) => d.id).join(', ')}`);
  }
  assert.deepEqual(gagal, []);
});

const entri = (id, prompt, o = {}) => ({id, file: `${id}.mp3`, detik: 1, prompt, kategori: o.kategori || ['lain'],
  cocok: o.cocok || ['belum ditandai — dengarkan dulu'], hindari: o.hindari || null, dipakai: o.dipakai || [], hash: id});

test('negasi di prompt tidak dihitung: "no click" bukan bunyi klik', () => {
  const k = [entri('pad', 'soft warm pad, no click, no impact at the end'), entri('tik', 'one dry click')];
  assert.deepEqual(S.cari('click', k).map((d) => d.id), ['tik']);
  assert.deepEqual(S.cari('impact', k).map((d) => d.id), []);
});

test('cocok-untuk tebakan regex berbobot kategori; yang ditulis manusia berbobot penuh', () => {
  const GEN = 'ketegangan, jantung berdebar, reaksi, horor/drama';
  const k = [entri('bel', 'small bicycle bell', {kategori: ['emosi'], cocok: [GEN]}),
    entri('drone', 'dark low drone', {cocok: ['adegan tegang sebelum reveal']}),
    entri('riser', 'tense riser')];
  // Bel tetap muncul (kategorinya memang `emosi`), tapi di bawah prompt "tense". Dengan bobot
  // `cocok` penuh untuk teks generik, bel naik ke atas riser.
  assert.deepEqual(S.cari('tegang', k).map((d) => d.id), ['drone', 'riser', 'bel']);
});

test('nama dulu, lalu sinonim; kata asli di atas sinonimnya; kata pendek harus persis', () => {
  const k = [entri('door-slam', 'heavy slam'), entri('pintu-tutup', 'soft close'), entri('capture', 'screen capture whoosh'), entri('cap', 'rubber stamp thud')];
  assert.deepEqual(S.cari('pintu', k).map((d) => d.id), ['pintu-tutup', 'door-slam']);
  // "cap" tidak cocok dengan "capture"; sinonim stamp tetap menemukan `cap`.
  assert.deepEqual(S.cari('cap', k).map((d) => d.id), ['cap']);
});

test('kueri banyak kata: yang memuat semua kata naik lebih dulu, yang memuat sebagian tetap muncul', () => {
  const k = [entri('whoosh-lambat', 'slow airy whoosh'), entri('whoosh-cepat', 'fast tight whoosh'), entri('pop-cepat', 'fast pop')];
  assert.deepEqual(S.cari('whoosh cepat', k).map((d) => d.id), ['whoosh-cepat', 'whoosh-lambat', 'pop-cepat']);
});

test('`hindari` menurunkan peringkat', () => {
  const k = [entri('a-chime', 'bright chime', {hindari: 'chime untuk error'}), entri('b-chime', 'bright chime')];
  assert.deepEqual(S.cari('chime', k).map((d) => d.id), ['b-chime', 'a-chime']);
});

test('mirip: bukan dirinya, bukan salinan identik; bunyi sejenis di atas', () => {
  const m = S.mirip('camera-shutter', K, 5);
  assert.ok(!m.some((d) => d.id === 'camera-shutter'));
  assert.ok(m.slice(0, 3).every((d) => /shutter|camera|jepret/.test(teks(d))), m.map((d) => d.id).join(', '));
  assert.throws(() => S.mirip('tidak-ada', K), /stok SFX "tidak-ada" tidak ada/);
});

test('saran untuk kueri kosong: salah ketik dikoreksi, yang tidak ada di stok tetap kosong hasilnya', () => {
  assert.deepEqual(S.cari('whosh', K), []);
  assert.ok(S.saran('whosh', K).includes('whoosh'));
  assert.ok(S.saran('shuter', K).includes('shutter'));
  assert.deepEqual(S.cari('hujan', K), []);
});
