// Membaca dan menulis komposisi Claude Design (.dc.html / .html + .jsx pendamping).
//
// Aturan yang paling sering terlanggar: KOMPOSISI adalah sumber kebenaran, bukan dokumen
// produksi. Dokumen brief hampir selalu meleset 0,3-1,4 detik dari ekspresi animasinya.
import {readFileSync, writeFileSync, readdirSync, existsSync} from 'node:fs';
import path from 'node:path';

const RE_SCENES = /OM_SCENES\s*=\s*(["'])(\[[\s\S]*?\])\1\s*;/;

export function bacaScenes(berkasHtml) {
  const isi = readFileSync(berkasHtml, 'utf8');
  const m = isi.match(RE_SCENES);
  if (!m) throw new Error(`OM_SCENES tidak ditemukan di ${path.basename(berkasHtml)}`);
  return JSON.parse(m[2].replace(/\\"/g, '"'));
}

export function tulisScenes(berkasHtml, durasiPerScene) {
  let isi = readFileSync(berkasHtml, 'utf8');
  const m = isi.match(RE_SCENES);
  if (!m) return false;
  const sc = JSON.parse(m[2].replace(/\\"/g, '"'));
  sc.forEach((s) => { if (durasiPerScene[s.name] !== undefined) s.dur = durasiPerScene[s.name]; });
  const json = JSON.stringify(sc);
  isi = isi.replace(m[0], () => `OM_SCENES = ${m[1]}${m[1] === "'" ? json : json.replace(/"/g, '\\"')}${m[1]};`);
  writeFileSync(berkasHtml, isi);
  return true;
}

// Peta nama scene -> detik mulai, plus total.
export function jadwal(scenes) {
  const C = {}; let a = 0;
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
    .filter((f) => { try { return RE_SCENES.test(readFileSync(path.join(dirSrc, f), 'utf8')); } catch { return false; } });
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
    catch { return false; }
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
    if (!re.test(isi)) throw new Error(`jangkar ${nama} tidak ada di ${path.basename(berkasJsx)}`);
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
    if (!g) throw new Error(`deret ${nama} tidak ada di ${path.basename(berkasJsx)}`);
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
  const blok = isi.match(/ *const caps = [\s\S]*?\n *\](?: : \[\])?;/);
  if (!blok) throw new Error(`kapsi tidak berpola di ${path.basename(berkasJsx)}: harapkan "const caps = [ ... ];"`);
  const baris = blok[0].split('\n').slice(1, -1);
  if (baris.length !== offsets.length) {
    throw new Error(`jumlah kapsi ${baris.length} != jumlah VO ${offsets.length}`);
  }
  const kepala = blok[0].split('\n')[0], ekor = blok[0].split('\n').at(-1);
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
    if (!re.test(b)) throw new Error(`kapsi baris ${i + 1} tidak berpola "{ at: <peta>.<scene> + n":\n${b.trim()}`);
    return b.replace(re, (_semua, cue) => `{ at: ${cue} + ${Math.max(0, offsets[i] - majuDetik).toFixed(2)}`);
  });
  writeFileSync(berkasJsx, isi.replace(blok[0], () => [kepala, ...baru, ekor].join('\n')));
  return baris.length;
}

// Simpan/pulihkan berkas asli, supaya seluruh rantai bisa dijalankan ulang dari nol.
export const cadangkan = (f) => { const b = `${f}.asli`; if (!existsSync(b)) writeFileSync(b, readFileSync(f)); return b; };
export const pulihkan = (f) => { const b = `${f}.asli`; if (existsSync(b)) writeFileSync(f, readFileSync(b)); };
