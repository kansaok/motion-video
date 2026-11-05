/* Waktu per kata VO (P8-10), untuk kapsi kata-demi-kata (gaya Reels/TikTok) dan subtitle yang
   dipotong tepat di batas kata. Sumbernya `alignment` dari TTS `with-timestamps` ElevenLabs: waktu
   mulai/akhir tiap KARAKTER teks yang dikirim (docs api-reference/text-to-speech/
   convert-with-timestamps, dicek 5 Nov 2026; boleh null).

   Teks yang dikirim adalah teks TERLAFAL (`ucapkan`: "CTWA" → "C T W A", "konektor.id" →
   "konektor dot Ai Di"), sedangkan kapsi menampilkan kata naskah. Tiap kata naskah dilafalkan
   sendiri lalu dicari BERURUTAN di teks terlafal (huruf/angka saja, huruf kecil). Kata yang tidak
   ketemu (lafal yang menggabung beberapa kata) diberi waktu di antara tetangganya, bukan dibuang:
   kapsi yang melompati satu kata lebih buruk daripada satu kata yang waktunya kira-kira.

   Waktu dari API diukur pada take mentah; VO yang dipakai sudah dipangkas senyap kepalanya, jadi
   semua waktu digeser `geser` detik dan dijepit ke [0, dur]. */
import {createHash} from 'node:crypto';
import {existsSync, readFileSync, rmSync, writeFileSync} from 'node:fs';

const huruf = (/** @type {string} */ s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '');
// Lompatan pencarian maksimum (karakter): mencegah satu kata pendek ("di") "ketemu" jauh di depan.
const LOMPAT = 40;

/** @typedef {{characters: string[], character_start_times_seconds: number[], character_end_times_seconds: number[]}} Penjajaran */
/** @typedef {{w: string, a: number, b: number, kira?: boolean}} Kata */

/**
 * @param {string} teks  naskah (yang tampil)
 * @param {(kata: string) => string} ucap  lafal satu kata (vo.ucapkan dengan lafal config)
 * @param {Penjajaran} al
 * @param {{geser?: number, dur?: number}} [o]
 * @returns {Kata[]}
 */
export function petaKata(teks, ucap, al, {geser = 0, dur = Infinity} = {}) {
  const A = al.character_start_times_seconds, B = al.character_end_times_seconds;
  /** @type {number[]} indeks karakter API untuk tiap huruf ternormalisasi */
  const asal = [];
  let S = '';
  al.characters.forEach((ch, i) => { for (const x of huruf(ch)) { S += x; asal.push(i); } });
  /** @type {Array<{w: string, a: number | null, b: number | null}>} */
  const out = [];
  let cur = 0;
  for (const w of teks.split(/\s+/).filter(Boolean)) {
    const sp = huruf(ucap(w));
    const j = sp ? S.indexOf(sp, cur) : -1;
    if (j < 0 || j - cur > LOMPAT) { out.push({w, a: null, b: null}); continue; }
    out.push({w, a: A[asal[j]], b: B[asal[j + sp.length - 1]]});
    cur = j + sp.length;
  }
  // Kata tanpa waktu: dibagi rata di antara akhir tetangga kiri dan awal tetangga kanan.
  const akhir = B.length ? B[B.length - 1] : 0;
  for (let i = 0; i < out.length; i++) {
    if (out[i].a !== null) continue;
    let k = i; while (k < out.length && out[k].a === null) k++;
    const kiri = i > 0 ? /** @type {number} */ (out[i - 1].b) : (A[0] ?? 0);
    const kanan = k < out.length ? /** @type {number} */ (out[k].a) : akhir;
    const n = k - i, lebar = Math.max(0, kanan - kiri) / n;
    for (let m = 0; m < n; m++) Object.assign(out[i + m], {a: kiri + m * lebar, b: kiri + (m + 1) * lebar, kira: true});
    i = k - 1;
  }
  const jepit = (/** @type {number} */ t) => +Math.min(dur, Math.max(0, t - geser)).toFixed(3);
  return out.map((x) => ({w: x.w, a: jepit(/** @type {number} */ (x.a)), b: jepit(/** @type {number} */ (x.b)),
    ...('kira' in x ? {kira: true} : {})}));
}

/* Berkas waktu kata di samping VO, dengan sidik isi MP3-nya: waktu yang tidak cocok dengan audio
   yang ada (take lama, VO dari cache tanpa waktu, berkas ditimpa tangan) tidak pernah dibaca. */
const sidik = (/** @type {string} */ f) => createHash('sha1').update(readFileSync(f)).digest('hex');
export const berkasKata = (/** @type {string} */ vo) => `${vo}.kata.json`;

/** @param {string} vo @param {Kata[] | null} kata */
export function tulisKata(vo, kata) {
  if (!kata?.length) { rmSync(berkasKata(vo), {force: true}); return; }
  writeFileSync(berkasKata(vo), JSON.stringify({sidik: sidik(vo), kata}));
}

/** @param {string} vo @returns {Kata[] | null} */
export function bacaKata(vo) {
  const f = berkasKata(vo);
  if (!existsSync(f) || !existsSync(vo)) return null;
  try {
    const j = JSON.parse(readFileSync(f, 'utf8'));
    return j.sidik === sidik(vo) && Array.isArray(j.kata) ? j.kata : null;
  } catch { return null; } // berkas rusak = tanpa waktu kata; kapsi jatuh ke waktu per baris
}
