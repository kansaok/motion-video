// Tutorial: kirim closing ke TikTok lewat Events API. 16:9, 10 scene, sekitar 60 dtk.
// Suara dan struktur sama dengan tutorial-leads. Musik dipakai ulang (luar: true).

export default {
  nama: 'tutorial-tiktok-ads',
  komposisi: 'Tutorial TikTok Ads.dc.html',
  jsx: 'tiktok-ads-tutorial.jsx',
  kapsi: false,
  keluaran: 'tutorial-tiktok-ads.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},

  vo: [
    {no: 1,  sc: 'Intro',    off: 0.40, text: 'Closing dari iklan TikTok? Kirim balik ke TikTok!'},
    {no: 2,  sc: 'Inti',     off: 0.40, text: 'Konektor mengirim closing lewat server, jadi iklan belajar dari pembeli.'},
    {no: 3,  sc: 'TikTok',   off: 0.40, text: 'Di TikTok Ads Manager, buka Tools, lalu Events Manager. Pilih pixel kamu.'},
    {no: 4,  sc: 'Token',    off: 0.40, text: 'Masuk Settings, cari Events API, klik Generate Access Token. Salin, karena TikTok tidak menyimpannya.'},
    {no: 5,  sc: 'Konektor', off: 0.40, text: 'Di Konektor, buka Tracking Website, klik Tambah platform iklan, pilih TikTok.'},
    {no: 6,  sc: 'Form',     off: 0.40, text: 'Isi nama, tempel Pixel Code dan Access Token, lalu Simpan.'},
    {no: 7,  sc: 'Link',     off: 0.40, text: 'Salin template link iklan, tempel di kolom URL iklan TikTok. Jadi nama campaign dan iklan ikut tercatat.'},
    {no: 8,  sc: 'Hasil',    off: 0.40, dengar: /terkirim|ter kirim/i, coba: 4, text: 'Lead closing? Langsung terkirim ke TikTok sebagai Complete Payment!'},
    {no: 9,  sc: 'Tips',     off: 0.40, text: 'Event dilewati? Data pencocokannya kurang. Pasang kode tracking di landing page, supaya ttclid tertangkap.'},
    {no: 10, sc: 'Outro',    off: 1.00, dengar: /konektor|connector/i, coba: 4, text: 'Closing balik ke TikTok. Panduannya di konektor dot id.'},
  ],

  tata: {mode: 'jangkar', jeda: 0.25, ekorBiasa: 0.40},

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

  // Semua cue scene-relatif (C.<Scene> + n), selaras dengan jadwal T_* di tiktok-ads-tutorial.jsx.
  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0) => ({at, nama, gain, nada});
    const klik = (t, n = 0) => q(t, 'klik', 0.18, n);
    const tombol = (t, n = 0) => q(t, 'tombol', 0.26, n);
    const ketik = (t0, jumlah, jarak) => Array.from({length: jumlah}, (_, i) => q(t0 + i * jarak, 'klik', 0.08, 1 + (i % 3)));
    return [
      // Intro: kartu lead (frame 0 penuh), chip CompletePayment menyala
      q(C.Intro + 0.15, 'pop', 0.20), q(C.Intro + 1.2, 'pop', 0.16, 4), q(C.Intro + 3.9, 'sapu', 0.12),

      // Inti: kartu Leads, panah lewat server, event CompletePayment, tanda tanpa pixel browser
      q(C.Inti + 0.5, 'pop', 0.18), q(C.Inti + 1.3, 'sapu', 0.10), q(C.Inti + 1.6, 'pop', 0.14, 2),
      q(C.Inti + 2.6, 'pop', 0.14, 3), q(C.Inti + 2.65, 'chime', 0.12),
      q(C.Inti + 3.8, 'pop', 0.12, 4), q(C.Inti + 5.3, 'sapu', 0.14),

      // TikTok: Tools, Events Manager, pilih pixel
      q(C.TikTok - 0.7, 'sapu', 0.12),
      klik(C.TikTok + 2.2), q(C.TikTok + 2.25, 'sapu', 0.10),
      klik(C.TikTok + 3.5, 1), q(C.TikTok + 3.55, 'sapu', 0.12),
      klik(C.TikTok + 5.0, 2), q(C.TikTok + 5.1, 'sapu', 0.12),

      // Token: Settings, gulir, Generate Access Token, salin
      klik(C.Token + 1.2), q(C.Token + 1.25, 'sapu', 0.10), q(C.Token + 1.9, 'sapu', 0.10),
      tombol(C.Token + 4.35), q(C.Token + 4.45, 'pop', 0.18, 3),
      tombol(C.Token + 6.7), q(C.Token + 6.75, 'salin', 0.22), q(C.Token + 7.3, 'pop', 0.14, 4),

      // Konektor: tab, Tracking Website, Tambah platform iklan, kartu TikTok
      klik(C.Konektor + 0.2, 1), q(C.Konektor + 0.3, 'sapu', 0.12),
      klik(C.Konektor + 2.5), q(C.Konektor + 2.55, 'sapu', 0.12),
      tombol(C.Konektor + 3.9), q(C.Konektor + 3.95, 'sapu', 0.14),
      klik(C.Konektor + 5.5, 2), q(C.Konektor + 5.6, 'sapu', 0.12),

      // Form: nama, Pixel Code, Access Token, Simpan
      klik(C.Form + 0.45), ...ketik(C.Form + 0.6, 12, 0.055),
      klik(C.Form + 1.6, 1), q(C.Form + 2.1, 'salin', 0.20),
      klik(C.Form + 2.9, 2), q(C.Form + 3.5, 'salin', 0.20), q(C.Form + 3.55, 'pop', 0.16, 3),
      tombol(C.Form + 4.5), q(C.Form + 4.6, 'sapu', 0.12), q(C.Form + 5.1, 'pop', 0.20, 2),

      // Link: gulir, tab TikTok Ads, Salin, toast, ttclid tercatat
      q(C.Link + 0.05, 'sapu', 0.12), klik(C.Link + 1.1, 1), q(C.Link + 1.15, 'sapu', 0.10),
      tombol(C.Link + 1.8), q(C.Link + 1.85, 'salin', 0.22), q(C.Link + 1.9, 'pop', 0.14, 2),
      q(C.Link + 5.2, 'pop', 0.12, 3), q(C.Link + 6.4, 'pop', 0.16, 4), q(C.Link + 6.45, 'chime', 0.12),

      // Hasil: Leads Closing, Log pengiriman, Terkirim. Satu-satunya hentakan besar: "terkirim" (2,05 dtk di scene Hasil).
      klik(C.Hasil + 0.0), q(C.Hasil + 0.05, 'sapu', 0.12),
      q(C.Hasil + 0.6, 'pop', 0.16, 3), q(C.Hasil + 0.62, 'chime', 0.10), q(C.Hasil + 0.65, 'centang', 0.12, 1),
      klik(C.Hasil + 1.0), q(C.Hasil + 1.05, 'sapu', 0.10), klik(C.Hasil + 1.4, 1), q(C.Hasil + 1.45, 'sapu', 0.08),
      q(C.Hasil + 1.7, 'pop', 0.10, 2),
      q(C.Hasil + 1.3, 'riser', 0.22), q(C.Hasil + 1.95, 'hisap', 0.20),
      q(C.Hasil + 2.05, 'impact', 0.42), q(C.Hasil + 2.07, 'sub', 0.32),
      q(C.Hasil + 2.6, 'centang', 0.16, 3), q(C.Hasil + 2.75, 'jadi', 0.14), q(C.Hasil + 3.8, 'pop', 0.10, 2),

      // Tips: Dilewati, ttclid kosong, template link
      q(C.Tips - 0.1, 'sapu', 0.12), q(C.Tips + 0.25, 'pop', 0.16, 2), q(C.Tips + 0.55, 'pop', 0.14, 3),
      q(C.Tips + 1.8, 'pop', 0.14, 2), q(C.Tips + 3.6, 'pop', 0.14, 4), q(C.Tips + 6.2, 'chime', 0.12),

      q(C.Outro + 0.9, 'sapu', 0.12), q(C.Outro + 1.0, 'pop', 0.22),
    ];
  },

  musik: [{
    nama: 'bgm',
    // Musik dipakai ulang dari tutorial-banyak-cs (112 BPM). Kuota musik ElevenLabs habis pada 11 Okt 2026.
    luar: true,
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'words', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'quiet intro', 'fade in', 'sparse'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const dasar = ['clean modern product-demo instrumental', '112 BPM', 'steady and continuous', 'always present',
        'light shaker', 'soft pluck', 'no vocals'];
      return [
        b(0, C.Konektor, '[focus]', [...dasar, 'focused groove from the very first beat', 'warm and clear']),
        b(C.Konektor, C.Hasil, '[flow]', [...dasar, 'a little fuller', 'soft arpeggio', 'forward motion']),
        b(C.Hasil, total, '[lift]', [...dasar, 'brighter', 'open', 'same groove']),
        b(total, total + 8, '[tail]', [...dasar, 'brighter groove continues']),
      ];
    },
    // Bed -27 dB. Satu tukikan ke -36 dB tepat sebelum hentakan (2,05 dtk di scene Hasil), lalu kembali ke -27.
    titik: [
      ['Intro', 0, -27],
      ['Hasil', 1.85, -27], ['Hasil', 1.95, -36], ['Hasil', 2.17, -27],
      ['Outro', 0, -27],
    ],
    fadeOut: ({total}) => [total - 0.35, 0.35],
  }],

  sampul: {detik: 0},
  mixer: {gainVO: 1.60, gainSFX: 0.90, duckMusik: {th: 0.03, ratio: 12, attack: 20, release: 280}},
};
