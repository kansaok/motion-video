// Membaca dan menulis komposisi Claude Design (.dc.html / .html + .jsx pendamping).
//
// Aturan yang paling sering terlanggar: KOMPOSISI adalah sumber kebenaran, bukan dokumen
// produksi. Dokumen brief hampir selalu meleset 0,3-1,4 detik dari ekspresi animasinya.
import {readFileSync, writeFileSync, readdirSync, existsSync} from 'node:fs';
import path from 'node:path';

/* `OM_SCENES = "<JSON>";` adalah literal string JS yang berisi JSON. Pola regex lama
   (`[\s\S]*?\]` lalu `replace(/\\"/g, '"')`) berhenti di `]` atau `;` pertama di dalam nama
   scene dan salah membaca escape lain. Pemindai ini membaca literalnya seperti parser JS:
   cari kutip penutup yang tidak di-escape, lalu tafsirkan escape-nya satu per satu. */
const ESCAPE = {n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', 0: '\0'};

function bacaLiteral(isi, awal) {
  const kutip = isi[awal];
  let teks = '';
  for (let i = awal + 1; i < isi.length; i++) {
    const c = isi[i];
    if (c === kutip) return {teks, akhir: i + 1};
    if (c === '\n') return null; // literal string JS tidak boleh memuat baris baru mentah
    if (c !== '\\') { teks += c; continue; }
    const e = isi[++i];
    if (e === 'u') {
      const kurawal = isi[i + 1] === '{';
      const hex = kurawal ? isi.slice(i + 2, isi.indexOf('}', i)) : isi.slice(i + 1, i + 5);
      if (!/^[\da-f]{1,6}$/i.test(hex) || (!kurawal && hex.length !== 4)) return null;
      teks += String.fromCodePoint(parseInt(hex, 16));
      i += kurawal ? hex.length + 2 : 4;
    } else if (e === 'x') {
      const hex = isi.slice(i + 1, i + 3);
      if (!/^[\da-f]{2}$/i.test(hex)) return null;
      teks += String.fromCharCode(parseInt(hex, 16)); i += 2;
    } else if (e === '\r' || e === '\n') {
      if (e === '\r' && isi[i + 1] === '\n') i++; // sambungan baris: tidak menghasilkan karakter
    } else teks += ESCAPE[e] ?? e;
  }
  return null;
}

// Lokasi deklarasi pertama yang literalnya utuh; `null` bila tidak ada.
export function cariScenes(isi) {
  for (const m of isi.matchAll(/OM_SCENES\s*=\s*(["'])/g)) {
    const awalLiteral = m.index + m[0].length - 1;
    const lit = bacaLiteral(isi, awalLiteral);
    if (!lit) continue;
    const titikKoma = isi.slice(lit.akhir).match(/^\s*;/);
    return {awal: m.index, akhir: lit.akhir + (titikKoma ? titikKoma[0].length : 0), kutip: m[1], json: lit.teks};
  }
  return null;
}

// Kebalikan `bacaLiteral` untuk kutip yang sama, agar komposisi yang memakai '...' tetap '...'.
function tulisLiteral(teks, kutip) {
  if (kutip === '"') return JSON.stringify(teks);
  return `'${teks.replace(/[\\']/g, (c) => `\\${c}`).replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`;
}

/**
 * @param {string} berkasHtml
 * @returns {import('./tipe.mjs').Scene[]}
 */
export function bacaScenes(berkasHtml) {
  const d = cariScenes(readFileSync(berkasHtml, 'utf8'));
  if (!d) throw new Error(`OM_SCENES tidak ditemukan di ${path.basename(berkasHtml)}`);
  try { return JSON.parse(d.json); }
  catch (e) { throw new Error(`OM_SCENES di ${path.basename(berkasHtml)} bukan JSON valid: ${e.message}`); }
}

export function tulisScenes(berkasHtml, durasiPerScene) {
  const isi = readFileSync(berkasHtml, 'utf8');
  const d = cariScenes(isi);
  if (!d) return false;
  const sc = JSON.parse(d.json);
  sc.forEach((s) => { if (durasiPerScene[s.name] !== undefined) s.dur = durasiPerScene[s.name]; });
  const baru = `OM_SCENES = ${tulisLiteral(JSON.stringify(sc), d.kutip)};`;
  writeFileSync(berkasHtml, isi.slice(0, d.awal) + baru + isi.slice(d.akhir));
  return true;
}

// Peta nama scene -> detik mulai, plus total.
/** @param {import('./tipe.mjs').Scene[]} scenes */
export function jadwal(scenes) {
  /** @type {import('./tipe.mjs').PetaCue} */
  const C = {};
  let a = 0;
  for (const s of scenes) { C[s.name] = a; a += s.dur; }
  return {C, total: a};
}

/* Komposisi yang seluruh cue-nya scene-relatif (`CUES.X + n`) aman dipanjang-pendekkan.
   Yang memuat array detik absolut TIDAK — angkanya harus dipetakan ulang satu per satu.
   Cek ini dijalankan sebelum apa pun menyentuh durasi scene.

   Rujukan cue muncul dalam tiga bentuk: `CUES.Nama`, `CUES['Nama Scene']` (wajib kalau
   nama scene mengandung spasi), dan alias lokal `C.dp`. Pola lama hanya mengenali bentuk
   pertama, jadi komposisi yang 100% scene-relatif dilaporkan "0 rujukan" lalu diberi
   peringatan palsu bahwa durasinya tidak aman diubah. */
/* Nama peta cue tidak selalu `CUES`. Komposisi lazim memberinya alias lokal
   (`const A = {hook: CUES.Hook, ...}`), dan daftar nama itu harus dibaca dari berkasnya
   sendiri. Menebaknya sebagai `CUES|C` salah dua arah sekaligus: `C.bg` milik palet warna
   ikut terhitung sebagai rujukan scene (satu komposisi dilaporkan 127 rujukan padahal itu
   warna semua), dan alias bernama lain tidak dikenali sama sekali — kapsinya lalu ditulis
   ulang nol baris tanpa satu pun galat. */
function namaCue(isi) {
  const alias = [...isi.matchAll(/const (\w+)\s*=\s*\{[^{}]*\bCUES\b/g)].map((m) => m[1]);
  return [...new Set(['CUES', ...alias])].join('|');
}

const RE_RUJUK = (n) => String.raw`\b(?:${n})(?:\.\w+|\[['"][^'"]+['"]\])`;
const potongan = (isi, posisi) => {
  if (posisi < 0) return 'deklarasi tidak ditemukan';
  const awal = isi.lastIndexOf('\n', posisi) + 1, akhir = isi.indexOf('\n', posisi);
  return `baris ${isi.slice(0, posisi).split('\n').length}: ${isi.slice(awal, akhir < 0 ? undefined : akhir).trim().slice(0, 180)}`;
};
const galatPola = (jenis, berkas, isi, posisi, harapan) =>
  new Error(`${jenis} tidak berpola di ${path.basename(berkas)}; harapkan ${harapan} (${potongan(isi, posisi)})`);

function blokKapsi(isi) {
  const blok = isi.match(/ *const caps = [\s\S]*?\n *\](?: : \[\])?;/);
  if (!blok) return null;
  return {teks: blok[0], posisi: blok.index, baris: blok[0].split('\n').slice(1, -1)};
}

/* Laporan sebelum menulis. Regex tetap rapuh terhadap bentuk JSX baru, jadi pengguna harus
   tahu sejak init/impor apakah timing dapat ditambal, bukan baru mengetahuinya sesudah VO jadi. */
export function laporanKeselarasan(berkasJsx) {
  const isi = readFileSync(berkasJsx, 'utf8'), cue = namaCue(isi);
  const jangkar = new RegExp(String.raw`const\s+(\w+)\s*=\s*(?!\s*\[)[^\n]{0,80}?(?:${cue})\.\w+\s*\+\s*[\d.]+`, 'g');
  const deret = new RegExp(String.raw`const\s+(\w+)\s*=\s*\[[^\]]*\]\.map\(\w+\s*=>\s*MOTION\.\w+\(\s*(?:${cue})\.\w+\s*\+`, 'g');
  const bisaJangkar = [...isi.matchAll(jangkar)].map((m) => m[1]);
  const bisaDeret = [...isi.matchAll(deret)].map((m) => m[1]);
  const kandidat = [...isi.matchAll(/const\s+(\w+)\s*=[^\n]*\b(?:CUES|\w+)\./g)]
    .filter((m) => !bisaJangkar.includes(m[1]) && !bisaDeret.includes(m[1]))
    .map((m) => potongan(isi, m.index));
  const blok = blokKapsi(isi);
  const kapsi = blok ? blok.baris.map((b, i) => ({baris: i + 1, cocok: new RegExp(String.raw`\{ at: (${RE_RUJUK(cue).slice(2)}) \+ [\d.]+`).test(b)})) : [];
  return {jangkar: bisaJangkar, deret: bisaDeret, kapsi: {ditemukan: Boolean(blok), jumlah: kapsi.length,
    tidakCocok: kapsi.filter((x) => !x.cocok).map((x) => x.baris)}, tidakCocok: kandidat};
}

export function relatif(berkasJsx) {
  const isi = readFileSync(berkasJsx, 'utf8');
  const rel = (isi.match(new RegExp(RE_RUJUK(namaCue(isi)), 'g')) || []).length;
  // array angka >= 4 elemen yang terlihat seperti timeline detik absolut
  const abs = (isi.match(/=\s*\[\s*\d+\.?\d*\s*,\s*\d+\.?\d*\s*,\s*\d+\.?\d*\s*,\s*\d+\.?\d*/g) || []).length;
  return {rel, abs, aman: rel > 0 && abs === 0};
}

// Cari berkas komposisi di dalam folder src hasil unzip.
export function temukan(dirSrc) {
  const semua = readdirSync(dirSrc);
  const html = semua.filter((f) => /\.html?$/i.test(f) && !f.startsWith('.'))
    .filter((f) => { try { return cariScenes(readFileSync(path.join(dirSrc, f), 'utf8')) !== null; } catch { return false; } }); // tak terbaca = bukan komposisi
  const jsx = semua.filter((f) => /\.jsx$/i.test(f) && !f.startsWith('.'));
  return {html, jsx};
}

/* Komposisi menyebut sendiri berkas mana yang dipakainya:
     <x-import component-from-global-scope="PromoVideo" from="./anim.jsx ./film.jsx">
   Menebak dari kemiripan nama pernah memilih `film-v1.jsx` — sisa versi lama yang tidak
   dipakai komposisi mana pun, dan kalau dipakai seluruh retiming jatuh ke berkas mati.
   Yang utama adalah berkas yang mendefinisikan komponen yang dirujuk atributnya. */
export function jsxUtama(berkasHtml, dirSrc) {
  const isi = readFileSync(berkasHtml, 'utf8');
  const dipakai = [...isi.matchAll(/from="([^"]+)"/g)]
    .flatMap((m) => m[1].split(/\s+/))
    .filter((f) => /\.jsx$/i.test(f))
    .map((f) => f.replace(/^\.\//, ''));
  const komp = isi.match(/component-from-global-scope="([^"]+)"/)?.[1];
  const punyaKomponen = (f) => {
    try { return new RegExp(`function ${komp}\\b`).test(readFileSync(path.join(dirSrc, f), 'utf8')); }
    catch { return false; } // berkas yang disebut tetapi hilang tidak bisa jadi JSX utama
  };
  return {dipakai, utama: (komp && dipakai.find(punyaKomponen)) || dipakai.at(-1) || null};
}

/* ══ Menulis balik jangkar ke JSX ══════════════════════════════════════════════
   Kalau scene dipanjangkan supaya VO muat, jangkar animasinya HARUS ikut pindah.
   Kalau tidak, scene yang melar sembilan detik akan diam sembilan detik: kapsi lurus,
   gambarnya tidak. */

// `const namaVar = MOTION.enter(CUES.Scene + 1.4)` -> ganti angkanya
export function geserJangkar(berkasJsx, peta) {
  let isi = readFileSync(berkasJsx, 'utf8'), n = 0;
  for (const [nama, detik] of Object.entries(peta)) {
    const re = new RegExp(String.raw`(const ${nama} = [\s\S]{0,40}?(?:${namaCue(isi)})\.\w+ \+ )([\d.]+)`);
    if (!re.test(isi)) throw galatPola(`jangkar ${nama}`, berkasJsx, isi, isi.indexOf(`const ${nama}`),
      '`const nama = MOTION.…(CUES.Scene + 1.2)`');
    isi = isi.replace(re, (_semua, awal) => `${awal}${detik.toFixed(2)}`); n++;
  }
  writeFileSync(berkasJsx, isi);
  return n;
}

// `const v = [0,1,2].map(i => MOTION.enter(CUES.X + 4.4 + i * 1.5, 0.5)(T))`
//   -> `const v = [4.40, 9.41, 14.53].map(o => MOTION.enter(CUES.X + o, 0.5)(T))`
export function geserDeret(berkasJsx, peta) {
  let isi = readFileSync(berkasJsx, 'utf8'), n = 0;
  for (const [nama, detikArr] of Object.entries(peta)) {
    const re = new RegExp(String.raw`const ${nama} = \[[^\]]*\]\.map\(\w+ => (MOTION\.\w+)\(((?:${namaCue(isi)})\.\w+) \+ [\d.]+(?: \+ \w+ \* [\d.]+)?(,[^)]*)?\)\(T\)\)`);
    const g = isi.match(re);
    if (!g) throw galatPola(`deret ${nama}`, berkasJsx, isi, isi.indexOf(`const ${nama}`),
      '`const nama = [..].map(i => MOTION.…(CUES.Scene + n + i * n)(T))`');
    isi = isi.replace(re, () =>
      `const ${nama} = [${detikArr.map((x) => x.toFixed(2)).join(', ')}].map(o => ${g[1]}(${g[2]} + o${g[3] || ''})(T))`);
    n++;
  }
  writeFileSync(berkasJsx, isi);
  return n;
}

/* Array kapsi `const caps = capsOn ? [ {at: CUES.X + n, text: "..."} ] : []`.
   Kapsi wajib mengikuti suara — mayoritas penonton Reels menonton tanpa suara, jadi kapsi
   yang meleset dari VO merusak dua-duanya sekaligus. Dimajukan sedikit supaya sempat
   terbaca sebelum kalimatnya berbunyi. */
export function geserKapsi(berkasJsx, offsets, majuDetik = 0.15) {
  let isi = readFileSync(berkasJsx, 'utf8');
  // Dua bentuk diterima: `const caps = X ? [ ... ] : [];` dan `const caps = [ ... ];`.
  // Menuntut bentuk pertama memaksa tiap komposisi baru dibentuk ulang dengan tangan.
  const blok = blokKapsi(isi);
  if (!blok) throw galatPola('kapsi', berkasJsx, isi, isi.indexOf('const caps'), '`const caps = [ ... ];`');
  const baris = blok.baris;
  if (baris.length !== offsets.length) {
    throw new Error(`jumlah kapsi ${baris.length} != jumlah VO ${offsets.length}`);
  }
  const kepala = blok.teks.split('\n')[0], ekor = blok.teks.split('\n').at(-1);
  // Nama peta cue dipertahankan apa adanya. Menuliskannya balik sebagai `CUES` membuat
  // komposisi yang memakai alias lokal (`const C = {d2: CUES['Derita Jam 2'], ...}`)
  // menghasilkan `at` NaN — dan <Captions> membuang item ber-`at` NaN tanpa bersuara,
  // jadi kapsinya hilang total tanpa satu pun galat.
  const re = new RegExp(String.raw`\{ at: (${RE_RUJUK(namaCue(isi)).slice(2)}) \+ [\d.]+`);
  const baru = baris.map((b, i) => {
    // Diuji dengan `re.test`, BUKAN dengan membandingkan hasil replace: offset yang
    // kebetulan sudah sama persis menghasilkan teks identik, dan itu sah — bukan tanda
    // polanya tidak cocok. Kapsi yang benar-benar tidak berpola tidak akan pernah tergeser,
    // dan <Captions> tidak mengeluh soal kapsi yang waktunya salah, jadi gagalkan di sini.
    if (!re.test(b)) throw galatPola(`kapsi item ${i + 1}`, berkasJsx, isi, blok.posisi + blok.teks.indexOf(b),
      '`{ at: CUES.Scene + n, ... }`');
    return b.replace(re, (_semua, cue) => `{ at: ${cue} + ${Math.max(0, offsets[i] - majuDetik).toFixed(2)}`);
  });
  writeFileSync(berkasJsx, isi.replace(blok.teks, () => [kepala, ...baru, ekor].join('\n')));
  return baris.length;
}

/* Versi kontrak komposisi. v2 (docs/kontrak-komposisi-v2.md) membaca timing dari `timing.js`
   dan tidak pernah ditambal; v1 adalah komposisi Claude Design yang jangkar/kapsinya ditulis
   balik ke JSX. Penandanya atribut di stage, di HTML atau di JSX yang merender stage. */
const RE_KONTRAK = /data-om-kontrak\s*=\s*\{?\s*["']?(\d+)/;
/**
 * @param {string} berkasHtml
 * @param {string} [dirSrc]  bila ada, JSX utama komposisi ikut diperiksa
 * @returns {1 | 2}
 */
export function kontrak(berkasHtml, dirSrc) {
  const isi = [readFileSync(berkasHtml, 'utf8')];
  if (dirSrc) {
    const {utama} = jsxUtama(berkasHtml, dirSrc);
    if (utama && existsSync(path.join(dirSrc, utama))) isi.push(readFileSync(path.join(dirSrc, utama), 'utf8'));
  }
  const versi = isi.map((x) => x.match(RE_KONTRAK)?.[1]).find(Boolean);
  if (versi && versi !== '1' && versi !== '2') throw new Error(`data-om-kontrak="${versi}" tidak dikenal (1 atau 2)`);
  return versi === '2' ? 2 : 1;
}

// Simpan/pulihkan berkas asli, supaya seluruh rantai bisa dijalankan ulang dari nol.
export const cadangkan = (f) => { const b = `${f}.asli`; if (!existsSync(b)) writeFileSync(b, readFileSync(f)); return b; };
export const pulihkan = (f) => { const b = `${f}.asli`; if (existsSync(b)) writeFileSync(f, readFileSync(b)); };
