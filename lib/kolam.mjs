/* Kolam kerja untuk generate ElevenLabs (P8-04). VO dan SFX dulu dibuat satu per satu: 23 baris
   VO ± 29 dtk dan 17 SFX ± 31 dtk (README "Berapa lama satu video"), padahal tiap baris saling
   bebas (konteks tetangga VO hanya teks) dan hampir seluruh waktunya menunggu jaringan.

   Dua aturan lama dipertahankan:
   - PERINTIS: butir dijalankan satu per satu sampai satu butir benar-benar memanggil API
     (`kerja` mengembalikan true). Kunci salah dan kuota habis tetap berhenti di baris pertama
     tanpa satu permintaan pun untuk baris berikutnya (test/el.test.mjs). Butir yang diambil dari
     stok/cache tidak dihitung perintis.
   - Galat pertama menghentikan pembagian butir baru. Yang sedang jalan ditunggu selesai (tiap
     butir menulis berkasnya sendiri, jadi tidak ada yang tertinggal setengah tertulis), lalu galat
     butir PALING AWAL di daftar yang dilempar: pesannya sama dengan jalur berurutan.

   @template T
   @param {T[]} butir
   @param {number} n  paling banyak sekian butir sekaligus sesudah perintis
   @param {(x: T, i: number) => Promise<boolean | void>} kerja  true = memanggil API
   @returns {Promise<void>} */
export async function kolam(butir, n, kerja) {
  let i = 0;
  // Perintis: berurutan sampai satu butir memanggil API.
  while (i < butir.length) {
    const ke = i++;
    if (await kerja(butir[ke], ke)) break;
  }
  /** @type {{i: number, e: unknown} | null} */
  let galat = null;
  const pekerja = async () => {
    while (!galat && i < butir.length) {
      const ke = i++;
      try { await kerja(butir[ke], ke); } catch (e) { if (!galat || ke < galat.i) galat = {i: ke, e}; }
    }
  };
  await Promise.all(Array.from({length: Math.max(1, Math.min(n, butir.length - i))}, pekerja));
  if (galat) throw galat.e;
}

/* Semafor sederhana: batas permintaan ElevenLabs yang sedang berjalan di SATU proses, lintas
   tahap. `motion all` membuat SFX dan VO bersamaan; tanpa batas bersama, dua kolam berisi 3 = 6
   permintaan, di atas batas konkurensi akun (Starter 3, Creator 5), dan 429
   `concurrent_limit_exceeded` dibayar dengan jeda ulang.
   @param {() => number} batas  dibaca tiap kali, supaya env/tes bisa mengubahnya */
export function semafor(batas) {
  let jalan = 0;
  /** @type {Array<() => void>} */
  const antre = [];
  const lepas = () => {
    jalan--;
    if (antre.length && jalan < batas()) { jalan++; /** @type {() => void} */ (antre.shift())(); }
  };
  return {
    /** @template R @param {() => Promise<R>} f @returns {Promise<R>} */
    async pakai(f) {
      if (jalan < batas()) jalan++;
      else await new Promise((ok) => antre.push(() => ok(undefined)));
      try { return await f(); } finally { lepas(); }
    },
    get jalan() { return jalan; },
  };
}
