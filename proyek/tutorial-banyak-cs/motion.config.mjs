// Tutorial: Satu nomor di iklan, banyak CS di dalam Konektor. 16:9, 10 scene, ±65 dtk.
// Suara sama dengan seri Konektor (preset C, Ari Eko Pro, speed 0.98). Struktur salinan tutorial-ctwa.

export default {
  nama: 'tutorial-banyak-cs',
  komposisi: 'Tutorial Banyak CS.dc.html',
  jsx: 'banyakcs-tutorial.jsx',
  kapsi: false,
  keluaran: 'tutorial-banyak-cs.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20261010, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  // Kunci terpanjang di atas. 'WhatsApp' sendiri dibaca "wasap" (IKLAN.md, tabel ejaan).
  lafal: {'Click-to-WhatsApp': 'Klik tu wasap', WhatsApp: 'wasap'},

  vo: [
    {no: 1,  sc: 'Intro', off: 0.40, text: 'Tiga CS, satu iklan. Lewat rotator di luar, data iklannya hilang di tengah jalan.'},
    {no: 2,  sc: 'Nomor', off: 0.40, text: 'Cukup satu nomor di Konektor. Semua CS masuk lewat nomor itu.'},
    {no: 3,  sc: 'Iklan', off: 0.40, text: 'Di iklan, pasang nomor yang sama. Bukan link rotator.'},
    {no: 4,  sc: 'Chat',  off: 0.40, text: 'Chat dari iklan masuk ke satu Kotak Masuk, lengkap dengan data iklannya.'},
    {no: 5,  sc: 'Bagi',  off: 0.40, text: 'Bagi chatnya dari dalam. Sari ke Dina.'},
    {no: 6,  sc: 'Bagi',  off: 4.50, text: 'Bima ke Raka. Masing-masing pegang lead-nya sendiri.'},
    {no: 7,  sc: 'Leads', off: 0.40, text: 'Di Leads, sumbernya tetap ads. Tiap CS cukup buka Ditugaskan ke saya.'},
    {no: 8,  sc: 'Kirim', off: 0.40, dengar: /tercatat|ter catat/i, coba: 4, text: 'Raka closing Bima. Konektor kirim hasilnya ke Meta. Tetap tercatat!'},
    {no: 9,  sc: 'Hasil', off: 0.40, text: 'Satu nomor, banyak CS, data iklan utuh sampai closing.'},
    {no: 10, sc: 'Tips',  off: 0.40, text: 'Mau otomatis? Pakai aksi Tugaskan bergiliran. CS cukup filter Ditugaskan ke saya.'},
    {no: 11, sc: 'Outro', off: 1.00, dengar: /konektor|connector/i, coba: 4, text: 'Panduannya, di konektor.id.'},
  ],

  tata: {mode: 'jangkar', jeda: 0.18, ekorBiasa: 0.40},

  sfx: [
    ['pop', '@stok/pop-thick'],
    ['sapu', '@stok/sapu'],
    ['klik', '@stok/click-soft'],
    ['tombol', '@stok/btn-click'],
    ['salin', '@stok/copy-chime'],
    ['centang', '@stok/janji-ceklis'],
    ['chime', '@stok/success-chime'],
    ['jadi', '@stok/jadi-ding'],
    ['riser', '@stok/riser-long'],
    ['hisap', '@stok/whoosh-rev'],
    ['impact', '@stok/impact-hit'],
    ['sub', '@stok/sub-drop'],
  ],

  // Semua cue scene-relatif (C.<Scene> + n), diselaraskan dengan jadwal T_* di banyakcs-tutorial.jsx.
  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0) => ({at, nama, gain, nada});
    const klik = (t, n = 0) => q(t, 'klik', 0.18, n);
    const tombol = (t, n = 0) => q(t, 'tombol', 0.26, n);
    return [
      // Intro: Iklan -> Rotator -> tiga nomor; chip data iklan putus di rotator
      q(C.Intro + 0.15, 'pop', 0.26), q(C.Intro + 0.9, 'sapu', 0.10),
      q(C.Intro + 1.2, 'pop', 0.16, 4), q(C.Intro + 2.0, 'pop', 0.18, 2),
      q(C.Intro + 2.55, 'hisap', 0.12), tombol(C.Intro + 2.7, -2), q(C.Intro + 2.75, 'klik', 0.14, -3),
      q(C.Intro + 3.0, 'pop', 0.12, 1), q(C.Intro + 3.2, 'pop', 0.12, 3), q(C.Intro + 3.4, 'pop', 0.12, 5),
      q(C.Intro + 3.9, 'pop', 0.22, -1), q(C.Intro + 3.95, 'sapu', 0.10),
      q(C.Intro + 5.3, 'sapu', 0.14),

      // Nomor: nav gulung, klik Hubungkan WhatsApp, kartu status, anggota online
      q(C.Nomor + 0.4, 'sapu', 0.08), klik(C.Nomor + 1.25), q(C.Nomor + 1.3, 'sapu', 0.12),
      q(C.Nomor + 2.5, 'pop', 0.14, 3), q(C.Nomor + 2.55, 'chime', 0.12),
      q(C.Nomor + 3.3, 'pop', 0.16, 5), q(C.Nomor + 3.35, 'klik', 0.08, 2), q(C.Nomor + 3.45, 'klik', 0.08, 3), q(C.Nomor + 3.55, 'klik', 0.08, 4),

      // Iklan: tab Meta, baris ad set, Message destinations, centang WhatsApp, nomor, callout
      klik(C.Iklan + 0.0), klik(C.Iklan + 0.9), q(C.Iklan + 0.95, 'sapu', 0.12),
      q(C.Iklan + 1.5, 'pop', 0.12, 2), q(C.Iklan + 2.3, 'sapu', 0.08),
      tombol(C.Iklan + 3.2), q(C.Iklan + 3.25, 'centang', 0.16, 2),
      q(C.Iklan + 3.6, 'sapu', 0.10), q(C.Iklan + 4.3, 'pop', 0.14, 3),
      q(C.Iklan + 4.9, 'pop', 0.16, 4), q(C.Iklan + 4.95, 'chime', 0.12), q(C.Iklan + 5.3, 'klik', 0.12, -2),

      // Chat: tab Konektor, Kotak Masuk, tiga chat masuk, buka Sari, chip data iklan
      klik(C.Chat + 0.0), klik(C.Chat + 0.85), q(C.Chat + 0.9, 'sapu', 0.12),
      q(C.Chat + 1.6, 'pop', 0.16, 2), q(C.Chat + 1.65, 'chime', 0.10),
      q(C.Chat + 2.2, 'pop', 0.16, 3), q(C.Chat + 2.8, 'pop', 0.16, 4),
      klik(C.Chat + 3.5), q(C.Chat + 3.55, 'sapu', 0.10), q(C.Chat + 4.0, 'pop', 0.18, 5), q(C.Chat + 4.05, 'chime', 0.12),

      // Bagi: pilih Penanggung jawab Dina, lalu chat Bima ke Raka
      klik(C.Bagi + 0.6), q(C.Bagi + 0.65, 'pop', 0.12, 2),
      klik(C.Bagi + 1.6), q(C.Bagi + 1.7, 'centang', 0.16, 2),
      klik(C.Bagi + 3.6), q(C.Bagi + 3.65, 'sapu', 0.10),
      klik(C.Bagi + 4.6), q(C.Bagi + 4.65, 'pop', 0.12, 2),
      klik(C.Bagi + 5.4), q(C.Bagi + 5.5, 'centang', 0.16, 3),
      q(C.Bagi + 8.2, 'sapu', 0.10),

      // Leads: tabel masuk, sorot Sumber ads lalu Platform Meta; lalu Kotak Masuk, tampilan Ditugaskan ke saya
      klik(C.Leads + 0.45), q(C.Leads + 0.5, 'sapu', 0.12),
      q(C.Leads + 1.0, 'pop', 0.12, 2), q(C.Leads + 1.15, 'pop', 0.12, 3), q(C.Leads + 1.3, 'pop', 0.12, 4),
      q(C.Leads + 1.6, 'pop', 0.10, 5), q(C.Leads + 2.1, 'pop', 0.10, 3),
      klik(C.Leads + 4.1), q(C.Leads + 4.15, 'sapu', 0.12),
      klik(C.Leads + 5.0), q(C.Leads + 5.1, 'sapu', 0.10), q(C.Leads + 5.3, 'centang', 0.12, 2),

      // Kirim: kembali ke Leads, status Closing, nilai, Konversi, Log pengiriman
      klik(C.Kirim + 0.3), q(C.Kirim + 0.35, 'sapu', 0.10),
      klik(C.Kirim + 0.9), q(C.Kirim + 0.95, 'pop', 0.10, 1),
      klik(C.Kirim + 1.7), q(C.Kirim + 1.8, 'sapu', 0.12),
      q(C.Kirim + 1.95, 'klik', 0.10, 1), q(C.Kirim + 2.07, 'klik', 0.10, 2), q(C.Kirim + 2.19, 'klik', 0.10, 1), q(C.Kirim + 2.31, 'klik', 0.10, 2), q(C.Kirim + 2.43, 'klik', 0.10, 1),
      tombol(C.Kirim + 2.7), q(C.Kirim + 2.8, 'centang', 0.14, 1),
      klik(C.Kirim + 3.1), klik(C.Kirim + 3.55),

      // Satu-satunya hentakan besar: "tercatat!" (status Terkirim, 4,15 dtk di scene Kirim).
      q(C.Kirim + 3.35, 'riser', 0.22), q(C.Kirim + 4.05, 'hisap', 0.20),
      q(C.Kirim + 4.15, 'impact', 0.42), q(C.Kirim + 4.17, 'sub', 0.32),
      q(C.Kirim + 4.65, 'centang', 0.16, 3), q(C.Kirim + 4.8, 'jadi', 0.14),
      q(C.Kirim + 6.4, 'sapu', 0.10),

      // Hasil: dua kolom, X merah, centang hijau
      q(C.Hasil + 0.1, 'sapu', 0.14), q(C.Hasil + 0.3, 'pop', 0.20, 1),
      q(C.Hasil + 0.6, 'klik', 0.08, 1), q(C.Hasil + 0.72, 'klik', 0.08, 2), q(C.Hasil + 0.84, 'klik', 0.08, 3),
      q(C.Hasil + 0.9, 'tombol', 0.22, -3),
      q(C.Hasil + 1.1, 'pop', 0.20, 3),
      q(C.Hasil + 1.4, 'klik', 0.08, 2), q(C.Hasil + 1.52, 'klik', 0.08, 3), q(C.Hasil + 1.64, 'klik', 0.08, 4),
      q(C.Hasil + 1.9, 'centang', 0.18, 3), q(C.Hasil + 2.0, 'chime', 0.14),

      // Tips: dua kiat
      q(C.Tips + 0.0, 'sapu', 0.12), q(C.Tips + 0.3, 'pop', 0.16, 2),
      q(C.Tips + 0.8, 'klik', 0.08, 1), q(C.Tips + 1.6, 'klik', 0.08, 2), q(C.Tips + 2.4, 'klik', 0.08, 3),
      q(C.Tips + 2.6, 'pop', 0.16, 4), q(C.Tips + 2.8, 'chime', 0.12),

      q(C.Outro + 0.9, 'sapu', 0.12), q(C.Outro + 1.0, 'pop', 0.22),
    ];
  },

  musik: [{
    nama: 'bgm',
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'words', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'quiet intro', 'fade in', 'sparse'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const dasar = ['clean modern product-demo instrumental', '112 BPM', 'steady and continuous', 'always present',
        'light shaker', 'soft pluck', 'no vocals'];
      return [
        b(0, C.Chat, '[focus]', [...dasar, 'focused groove from the very first beat', 'warm and clear']),
        b(C.Chat, C.Kirim, '[flow]', [...dasar, 'a little fuller', 'soft arpeggio', 'forward motion']),
        b(C.Kirim, total, '[lift]', [...dasar, 'brighter', 'open', 'same groove']),
        b(total, total + 8, '[tail]', [...dasar, 'brighter groove continues']),
      ];
    },
    titik: [
      ['Intro', 0, -23],
      ['Kirim', 3.95, -23], ['Kirim', 4.05, -32], ['Kirim', 4.27, -22],
      ['Outro', 0, -23],
    ],
    fadeOut: ({total}) => [total - 0.35, 0.35],
  }],

  sampul: {detik: 1.6},
  mixer: {gainVO: 1.60, gainSFX: 0.90, duckMusik: {th: 0.03, ratio: 8, attack: 20, release: 280}},
};
