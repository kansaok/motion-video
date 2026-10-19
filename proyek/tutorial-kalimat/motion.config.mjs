// Tutorial: satu kalimat CS, Purchase tercatat sendiri (Aturan Otomatisasi). 16:9, 10 scene, ±57 dtk. Basis: tutorial-otomasi.
// Suara dan musik sama dengan tutorial-konversi (preset C, speed 0.98).

export default {
  nama: 'tutorial-kalimat',
  komposisi: 'Tutorial Kalimat.dc.html',
  jsx: 'otomasi-tutorial.jsx',
  kapsi: false,
  keluaran: 'tutorial-kalimat.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  lafal: {},

  vo: [
    {no: 1,  sc: 'Intro',  off: 0.40, text: 'Closing di chat, status lupa diubah, iklan tidak tahu. Solusinya: satu kalimat.'},
    {no: 2,  sc: 'Buka',   off: 0.50, text: 'Buka Aturan Otomatisasi, lalu buat aturan baru.'},
    {no: 3,  sc: 'Syarat', off: 0.40, text: 'Syaratnya: pesan dari CS mengandung terima kasih atas konfirmasinya.'},
    {no: 4,  sc: 'Aksi',   off: 0.40, text: 'Aksinya: ambil nominal setelah kata Total, lalu ubah status jadi Closing.'},
    {no: 5,  sc: 'Simpan', off: 0.40, text: 'Simpan. Aturannya langsung aktif.'},
    {no: 6,  sc: 'Chat',   off: 0.40, text: 'CS tinggal menulis: terima kasih atas konfirmasinya, lalu totalnya.'},
    {no: 7,  sc: 'Hasil',  off: 0.40, text: 'Status jadi Closing, nilainya terisi sendiri. Beres!'},
    {no: 8,  sc: 'Kirim',  off: 0.40, dengar: /purchase|perches|per ?chase/i, coba: 4, text: 'Lalu Purchase terkirim ke Meta, tanpa klik apa pun.'},
    {no: 9,  sc: 'Tips',   off: 0.40, text: 'Catatan: balasan dari Kotak Masuk resmi tidak menjalankan aturan. Di sana, ubah status di Leads.'},
    {no: 10, sc: 'Outro',  off: 1.00, dengar: /konektor|connector/i, coba: 4, text: 'Panduannya, di konektor.id.'},
  ],

  tata: {mode: 'jangkar', jeda: 0.18, ekorBiasa: 0.40},

  sfx: [
    ['pop', '@stok/pop-thick'],
    ['sapu', '@stok/sapu'],
    ['klik', '@stok/click-soft'],
    ['tombol', '@stok/btn-click'],
    ['salin', '@stok/copy-chime'],
    ['ketik', '@stok/keyboard-type'],
    ['centang', '@stok/janji-ceklis'],
    ['chime', '@stok/success-chime'],
    ['jadi', '@stok/jadi-ding'],
    ['riser', '@stok/riser-long'],
    ['hisap', '@stok/whoosh-rev'],
    ['impact', '@stok/impact-hit'],
    ['sub', '@stok/sub-drop'],
  ],

  // Semua cue scene-relatif (C.<Scene> + n), diselaraskan dengan jadwal di otomasi-tutorial.jsx.
  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0) => ({at, nama, gain, nada});
    const klik = (t, n = 0) => q(t, 'klik', 0.18, n);
    const tombol = (t, n = 0) => q(t, 'tombol', 0.26, n);
    const ketik = (t) => q(t, 'ketik', 0.14);
    return [
      // Intro: tiga chat, kartu lead, tanda tanya di Meta
      q(C.Intro + 0.8, 'pop', 0.22, 3), q(C.Intro + 1.3, 'pop', 0.20, 4), q(C.Intro + 1.8, 'pop', 0.20, 5),
      q(C.Intro + 1.0, 'sapu', 0.12), q(C.Intro + 2.4, 'sapu', 0.14), q(C.Intro + 3.0, 'pop', 0.22, 2),

      // Buka
      klik(C.Buka + 1.2), q(C.Buka + 1.3, 'sapu', 0.12),
      tombol(C.Buka + 3.3), q(C.Buka + 3.4, 'sapu', 0.12),
      klik(C.Buka + 3.8, 1), ketik(C.Buka + 4.0), ketik(C.Buka + 4.25), ketik(C.Buka + 4.5),

      // Syarat
      klik(C.Syarat + 1.4), q(C.Syarat + 1.5, 'pop', 0.12, 2),
      klik(C.Syarat + 3.1, 1), ketik(C.Syarat + 3.55), ketik(C.Syarat + 3.85), ketik(C.Syarat + 4.15), ketik(C.Syarat + 4.45), ketik(C.Syarat + 4.75),
      klik(C.Syarat + 5.4), q(C.Syarat + 5.5, 'pop', 0.12, 3),
      klik(C.Syarat + 6.1, 2), q(C.Syarat + 6.35, 'centang', 0.14, 2),

      // Aksi
      klik(C.Aksi + 0.9), q(C.Aksi + 1.15, 'pop', 0.12, 2), q(C.Aksi + 1.2, 'sapu', 0.10),
      klik(C.Aksi + 1.5, 1), q(C.Aksi + 1.75, 'pop', 0.12, 3),
      klik(C.Aksi + 1.95, 1), ketik(C.Aksi + 2.15), ketik(C.Aksi + 2.45), ketik(C.Aksi + 2.75), ketik(C.Aksi + 3.05),
      klik(C.Aksi + 4.1, 2), q(C.Aksi + 4.35, 'centang', 0.16, 3),

      // Simpan
      tombol(C.Simpan + 0.5), q(C.Simpan + 0.6, 'sapu', 0.12), q(C.Simpan + 0.75, 'chime', 0.12),
      q(C.Simpan + 1.6, 'pop', 0.14, 4),

      // Chat
      klik(C.Chat + 0.2), q(C.Chat + 0.3, 'sapu', 0.12),
      q(C.Chat + 1.4, 'pop', 0.20, 4), q(C.Chat + 1.45, 'chime', 0.10),

      // Hasil. Satu-satunya hentakan besar: "Beres!" (kata mulai di Hasil + 3,68).
      klik(C.Hasil + 0.3), q(C.Hasil + 0.4, 'sapu', 0.12),
      q(C.Hasil + 1.2, 'pop', 0.16, 4), q(C.Hasil + 1.25, 'chime', 0.10),
      q(C.Hasil + 2.1, 'pop', 0.14, 3),
      q(C.Hasil + 2.9, 'riser', 0.22), q(C.Hasil + 3.58, 'hisap', 0.20),
      q(C.Hasil + 3.68, 'impact', 0.42), q(C.Hasil + 3.70, 'sub', 0.32),
      q(C.Hasil + 4.2, 'centang', 0.16, 3), q(C.Hasil + 4.35, 'jadi', 0.14),

      // Kirim
      klik(C.Kirim + 0.1), q(C.Kirim + 0.2, 'sapu', 0.12), klik(C.Kirim + 0.6, 1),
      q(C.Kirim + 0.95, 'sapu', 0.14), q(C.Kirim + 1.05, 'pop', 0.12, 2),
      q(C.Kirim + 1.6, 'pop', 0.14, 3), q(C.Kirim + 1.65, 'chime', 0.12),

      // Tips
      q(C.Tips + 0.3, 'sapu', 0.14), q(C.Tips + 0.8, 'pop', 0.16, 3), q(C.Tips + 0.85, 'centang', 0.14, 3),
      q(C.Tips + 1.8, 'pop', 0.14, 1), q(C.Tips + 1.9, 'sapu', 0.10),

      q(C.Outro + 1.0, 'pop', 0.22),
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
        b(0, C.Syarat, '[focus]', [...dasar, 'focused groove from the very first beat', 'warm and clear']),
        b(C.Syarat, C.Hasil, '[flow]', [...dasar, 'a little fuller', 'soft arpeggio', 'forward motion']),
        b(C.Hasil, total, '[lift]', [...dasar, 'brighter', 'open', 'same groove']),
        b(total, total + 8, '[tail]', [...dasar, 'brighter groove continues']),
      ];
    },
    titik: [
      ['Intro', 0, -23],
      ['Hasil', 3.43, -23], ['Hasil', 3.58, -32], ['Hasil', 3.80, -22],
      ['Outro', 0, -23],
    ],
    fadeOut: ({total}) => [total - 0.35, 0.35],
  }],

  sampul: {detik: 5.2},
  mixer: {gainVO: 1.60, gainSFX: 0.90, duckMusik: {th: 0.03, ratio: 8, attack: 20, release: 280}},
  periksa: {busTitik: [16.9, 38.7, 39.4]},
};
