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
  // Take maksimum untuk baris ber-`maks`/`dengar` (bisa ditimpa `coba` per baris).
  coba: 4,
  /* Kecepatan baca untuk `--kering` bila proyek belum punya VO suara itu dan `suara.kps` kosong:
     median tujuh suara Indonesia yang diukur pada kalimat yang sama, speed 1,0 (README: Yoga 21,5 ...
     Satria 9,6; Cahaya 16,3). Sebarannya > 2x, jadi perkiraan dari angka ini hanya kasar. */
  kpsBawaan: 16.3,
});

/* ── SFX ────────────────────────────────────────────────────────────────────── */
export const SFX = Object.freeze({
  // Sama seperti VO: transien pendek dan pelan tidak boleh ikut terbuang.
  ambangAwal: '-58dB',
  durasiAwal: 0.01,
  /* Hasil di bawah ini dianggap kosong. Satu prompt sah pernah kembali 253 byte dan baru
     gagal di `mix` tanpa menyebut berkasnya. */
  durasiMin: 0.08,
  // Percobaan generate bila hasilnya kosong.
  coba: 3,
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
  /* Peta bed sesudah `motion music`, atas potongan yang benar-benar dipakai video. Jendela 1 dtk
     merata-ratakan ketukan; 12 dB di bawah median = terdengar sebagai musik yang mati (lubang
     yang dilaporkan penonton terukur 20+ dB, intro tipis yang wajar 6-9 dB). */
  bed: Object.freeze({jendela: 1, turun: 12}),
  // Percobaan generate bila trek berlubang; yang terata yang dipakai.
  coba: 3,
});

/* ── API ElevenLabs ─────────────────────────────────────────────────────────── */
export const EL_API = Object.freeze({
  // 429/5xx/timeout diulang sampai sekian kali; 4xx lain dan kuota habis tidak pernah.
  coba: 3,
  // Jeda tanpa Retry-After: 2,5 dtk × nomor percobaan (perilaku lama, terbukti cukup untuk system_busy).
  jedaMs: 2500,
  /* Retry-After dihormati, tapi dibatasi: satu baris VO yang menunggu 10 menit lebih baik gagal
     dengan pesan jelas daripada membuat `motion all` terlihat macet. */
  maksTungguMs: 60_000,
  /* Batas satu permintaan. Musik composition_plan 60+ detik butuh puluhan detik di sisi
     ElevenLabs; 5 menit memberi ruang tanpa membiarkan koneksi gantung selamanya. */
  batasMs: 300_000,
});

/* ── Biaya ElevenLabs (perkiraan sebelum generate) ───────────────────────────── */
export const HARGA = Object.freeze({
  // TTS: 1 kredit per karakter teks yang dikirim (docs ElevenLabs, "How does pricing work").
  kreditPerKarakter: 1,
  /* Musik: 5.783 kredit untuk trek 436 dtk (proyek panduan-feedback-capi, Okt 2026) = 13,3/dtk.
     Satu titik ukur; realisasi tiap perintah dicatat di `biaya.json` untuk mengkalibrasinya. */
  musikKreditPerDetik: 13.3,
  /* SFX: tarif per detik dari docs lama ElevenLabs (duration_seconds diisi). Belum diukur di repo
     ini; bandingkan dengan `biaya.json` dan perbaiki angkanya bila meleset jauh. */
  sfxKreditPerDetik: 40,
  // Konversi yang sudah dipakai `motion cost`: paket $5 = 30.000 kredit, kurs Rp16.500.
  usdPerKredit: 5 / 30000,
  rupiahPerUsd: 16500,
  /* Batas per perintah bila BIAYA_MAKS_USD tidak diisi. Satu iklan 30 dtk dari nol ±$0,30
     (600 karakter VO, 10 SFX, musik 40 dtk); membuat ulang 85 baris VO tanpa sengaja ±$1. */
  maksUsdBawaan: 0.5,
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

/* ── motion doctor ──────────────────────────────────────────────────────────── */
export const DOKTER = Object.freeze({
  /* Frame JPG render 180 dtk ±2-3 GB di TMPDIR (P4 / P2-03). Di bawah `diskGagalGb` satu video
     panjang pasti gagal di tengah; di bawah `diskPeringatanGb` hanya video pendek yang muat. */
  diskGagalGb: 1,
  diskPeringatanGb: 4,
  /* `/tmp` tmpfs di rama-tuf 79-80% penuh: Chromium mati di sekitar frame 250 tanpa galat
     JavaScript (README "Render di rama-tuf"). 70% memberi ruang sebelum titik itu. */
  tmpfsPenuhPersen: 70,
  // Filter yang dipakai mixer, VO, SFX, musik, dan cek. Build ffmpeg minimal bisa tidak punya.
  filter: ['acompressor', 'adelay', 'aecho', 'aevalsrc', 'afade', 'alimiter', 'amix', 'apad',
    'aresample', 'asetpts', 'asetrate', 'asplit', 'atempo', 'atrim', 'ebur128', 'equalizer',
    'highpass', 'lowpass', 'pan', 'sidechaincompress', 'silenceremove', 'volume', 'volumedetect',
    'scale', 'crop', 'overlay', 'format'],
  // libx264 untuk video, aac untuk audio MP4, mjpeg untuk sampul .jpg.
  encoder: ['libx264', 'aac', 'mjpeg'],
  // Panggilan ringan ke ElevenLabs dan peluncuran Chromium tidak boleh membuat doctor terlihat macet.
  batasJaringanMs: 10_000,
  batasChromiumMs: 30_000,
});
