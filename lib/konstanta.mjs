/* Satu tempat untuk angka yang menentukan perilaku. Tiap angka diberi sebabnya: hampir
   semuanya lahir dari satu insiden yang terukur, dan "merapikan" angka tanpa membaca
   sebabnya mengembalikan insiden itu. */

/* ── VO ─────────────────────────────────────────────────────────────────────── */
/* Awal VO: 10 ms di atas -58 dB, BUKAN 30 ms di atas -50 dB. Letusan konsonan tak bersuara
   (t, k, p, s, c, f) cuma 10-20 ms dan pelan; syarat 30 ms membuang awalan kata
   ("Toh pakai LPWA" -> "Love pakai LPWA" saat ditranskrip balik). */
export const VO = Object.freeze({
  ambangAwal: '-58dB',
  durasiAwal: 0.01,
  /* Ekor: jendela 10 ms terakhir yang puncaknya >= -45 dB dianggap akhir kata. Napas dan derau
     (-47 s/d -58 dB) jatuh di bawahnya. */
  ambangEkorDb: -45,
  /* Letupan terpisah (< 80 ms) sesudah >= 0,4 dtk di bawah -50 dB adalah derau ujung take,
     bukan kata (vo-16: 2,16 -> 1,60 dtk). */
  ambangSenyapDb: -50,
  letupanMaksJendela: 8,
  senyapMinJendela: 40,
  /* Peluruhan yang disimpan sesudah akhir kata: 9 dari 12 baris Hari 3 masih berbunyi di
     120 ms terakhirnya, dan trim yang lebih ketat terdengar "kepotong". */
  sisaEkor: 0.25,
  fadeMasuk: 0.015,
  fadeKeluar: 0.08,
  // atempo ffmpeg hanya stabil di rentang ini untuk satu tahap filter.
  tempoMin: 0.5,
  tempoMaks: 2,
});

/* ── SFX ────────────────────────────────────────────────────────────────────── */
export const SFX = Object.freeze({
  // Sama seperti VO: transien pendek dan pelan tidak boleh ikut terbuang.
  ambangAwal: '-58dB',
  durasiAwal: 0.01,
  /* Hasil di bawah ini dianggap kosong. Satu prompt sah pernah kembali 253 byte dan baru
     gagal di `mix` tanpa menyebut berkasnya. */
  durasiMin: 0.08,
});

/* ── Musik ──────────────────────────────────────────────────────────────────── */
export const MUSIK = Object.freeze({
  /* -45 dB, bukan -58 dB: trek musik sering membuka dengan fade dari senyap yang tidak
     terdengar tapi lolos gerbang -58 dB (satu trek terukur -62 dB pada dua detik pertamanya
     dan dilaporkan bolong di scene pembuka). */
  ambangAwal: '-45dB',
  durasiAwal: 0.02,
  // Pemeriksaan lubang saat menerima trek; ekor diabaikan karena fade penutup ada di sumbernya.
  lubang: Object.freeze({turun: 10, minLama: 0.5, abaikanEkor: 2.5}),
});

/* ── Zip unggahan ───────────────────────────────────────────────────────────── */
// Ukuran terkompres bukan ukuran di disk; batas ini diperiksa sebelum `unzip` menulis.
export const ZIP = Object.freeze({maksBytes: 300 * 1048576, maksEntri: 2000, maksRasio: 100});

/* ── Batas server MCP (bawaan; semuanya bisa ditimpa env) ───────────────────── */
export const BATAS_BAWAAN = Object.freeze({
  proyek: 20,          // MAKS_PROYEK per akun
  detik: 180,          // MAKS_DETIK video
  unduhMb: 50,         // MAKS_UNDUH_MB per unduhan URL
  ekstrakMb: ZIP.maksBytes / 1048576, // MAKS_EKSTRAK_MB isi zip
  kuotaMb: 1500,       // KUOTA_MB per akun
  retensiHari: 14,     // RETENSI_HARI proyek tak tersentuh
  renderMacetDetik: 120, // RENDER_BATAS_MACET_DETIK tanpa frame baru
  antreMaks: 20,       // ANTRE_MAKS tugas menunggu
});
// Batas total render mengikuti panjang video: 10 menit minimum, atau detik/6 menit.
export const menitRenderBawaan = (detik) => Math.max(10, detik / 6);
