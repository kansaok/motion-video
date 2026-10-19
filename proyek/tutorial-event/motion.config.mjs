// Tutorial: pastikan event iklan Click-to-WhatsApp muncul di Events Manager. 16:9, 10 scene, ±68 dtk.
// Suara sama dengan seri Konektor (preset C, Ari Eko Pro, speed 0.98). Struktur salinan tutorial-ctwa.

export default {
  nama: 'tutorial-event',
  komposisi: 'Tutorial Event.dc.html',
  jsx: 'event-tutorial.jsx',
  kapsi: false,
  keluaran: 'tutorial-event.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20261010, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  // Kunci terpanjang di atas. 'WhatsApp' sendiri dibaca "wasap" (IKLAN.md, tabel ejaan).
  lafal: {
    'WhatsApp Business Account ID': 'wasap bisnis akon ai di',
    'Click-to-WhatsApp': 'Klik tu wasap',
    'Test Event Code': 'tes ivent kod',
    'Events Manager': 'ivens menejer',
    'LeadSubmitted': 'lid sabmited',
    'Access Token': 'akses token',
    'Pixel ID': 'piksel ai di',
    WhatsApp: 'wasap',
    ads: 'eds',
  },

  vo: [
    {no: 1,  sc: 'Intro',  off: 0.40, text: 'Konektor sudah dipasang, tapi Events Manager masih kosong. Nyambung atau belum?'},
    {no: 2,  sc: 'Nomor',  off: 0.40, text: 'Pertama, pastikan nomor WhatsApp sudah terhubung di Konektor.'},
    {no: 3,  sc: 'Pixel',  off: 0.40, text: 'Di Tracking Website, tambah platform Meta.'},
    {no: 4,  sc: 'Pixel',  off: 3.50, text: 'Isi Pixel ID, Access Token, dan WhatsApp Business Account ID.'},
    {no: 5,  sc: 'Pixel',  off: 7.90, text: 'Simpan.'},
    {no: 6,  sc: 'Uji',    off: 0.40, text: 'Klik Uji kirim, masukkan Test Event Code dari Events Manager. Terkirim artinya kredensialnya benar.'},
    {no: 7,  sc: 'Chat',   off: 0.40, text: 'Sekarang kirim satu chat uji lewat iklan. Lead masuk, sumbernya ads.'},
    {no: 8,  sc: 'Kirim',  off: 0.40, text: 'Ubah status jadi Dihubungi. Konektor kirim ke Meta: LeadSubmitted, diterima.'},
    {no: 9,  sc: 'Muncul', off: 0.40, dengar: /muncul/i, coba: 4, text: 'Buka Events Manager. LeadSubmitted muncul! Pipanya nyambung.'},
    {no: 10, sc: 'Hasil',  off: 0.40, text: 'Mulai besok, setiap lead dari iklan tercatat di Meta, bukan cuma jumlah chat.'},
    {no: 11, sc: 'Tips',   off: 0.40, text: 'Belum muncul? Cek Pixel ID dan token. Kalau gagal, alasannya tertulis di Log pengiriman.'},
    {no: 12, sc: 'Outro',  off: 1.00, dengar: /konektor|connector/i, coba: 4, text: 'Panduannya, di konektor.id.'},
  ],

  tata: {mode: 'jangkar', jeda: 0.18, ekorBiasa: 0.40},

  sfx: [
    ['pop', '@stok/pop-thick'],
    ['sapu', '@stok/sapu'],
    ['klik', '@stok/click-soft'],
    ['tombol', '@stok/btn-click'],
    ['centang', '@stok/janji-ceklis'],
    ['chime', '@stok/success-chime'],
    ['jadi', '@stok/jadi-ding'],
    ['riser', '@stok/riser-long'],
    ['hisap', '@stok/whoosh-rev'],
    ['impact', '@stok/impact-hit'],
    ['sub', '@stok/sub-drop'],
  ],

  // Semua cue scene-relatif (C.<Scene> + n), diselaraskan dengan jadwal T_* di event-tutorial.jsx.
  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0) => ({at, nama, gain, nada});
    const klik = (t, n = 0) => q(t, 'klik', 0.18, n);
    const tombol = (t, n = 0) => q(t, 'tombol', 0.26, n);
    // ketikan: 6 detak pelan mulai `t`, selang 0,12 dtk (seperti tutorial-ctwa)
    const ketik = (t, n = 6) => Array.from({length: n}, (_, i) => q(t + i * 0.12, 'klik', 0.10, i % 2 ? 2 : 1));
    return [
      // Intro: chat uji -> Konektor -> Events Manager kosong, tanda tanya
      q(C.Intro + 0.15, 'pop', 0.26), q(C.Intro + 1.0, 'pop', 0.18, 2), q(C.Intro + 1.5, 'pop', 0.18, 3),
      q(C.Intro + 1.9, 'sapu', 0.08), q(C.Intro + 2.2, 'sapu', 0.08),
      q(C.Intro + 2.6, 'pop', 0.20, 1), q(C.Intro + 3.3, 'pop', 0.22, 5),
      q(C.Intro + 5.0, 'sapu', 0.14),

      // Nomor: sidebar menggulung, Hubungkan WhatsApp, kartu status + nomor
      q(C.Nomor + 0.4, 'sapu', 0.08), klik(C.Nomor + 1.25), q(C.Nomor + 1.3, 'sapu', 0.12),
      q(C.Nomor + 2.5, 'pop', 0.14, 3), q(C.Nomor + 2.55, 'chime', 0.12),

      // Pixel: Tracking Website -> Tambah platform iklan -> Meta -> isi 3 kolom -> Simpan
      klik(C.Pixel + 0.0), q(C.Pixel + 0.05, 'sapu', 0.12),
      tombol(C.Pixel + 0.9), q(C.Pixel + 1.0, 'pop', 0.16, 2),
      klik(C.Pixel + 1.7), q(C.Pixel + 1.75, 'sapu', 0.10),
      klik(C.Pixel + 2.4), ...ketik(C.Pixel + 2.55),
      klik(C.Pixel + 3.8), ...ketik(C.Pixel + 3.95),
      klik(C.Pixel + 5.3), ...ketik(C.Pixel + 5.45, 7),
      tombol(C.Pixel + 7.9), q(C.Pixel + 8.0, 'centang', 0.16, 2), q(C.Pixel + 8.05, 'chime', 0.12),
      q(C.Pixel + 8.15, 'pop', 0.14, 3),

      // Uji: Uji kirim -> modal Test Event -> ketik kode -> Kirim Test Event -> toast
      tombol(C.Uji + 0.9), q(C.Uji + 0.95, 'pop', 0.16, 2),
      klik(C.Uji + 2.2), ...ketik(C.Uji + 2.35),
      tombol(C.Uji + 4.4),
      q(C.Uji + 5.05, 'centang', 0.18, 2), q(C.Uji + 5.1, 'chime', 0.14),

      // Chat: Kotak Masuk, chat uji masuk, chip data iklan, lalu Leads sumber ads
      klik(C.Chat + 0.0), q(C.Chat + 0.05, 'sapu', 0.12),
      q(C.Chat + 0.9, 'pop', 0.16, 2), q(C.Chat + 0.95, 'chime', 0.10),
      klik(C.Chat + 1.4), q(C.Chat + 1.45, 'sapu', 0.08), q(C.Chat + 2.0, 'pop', 0.16, 4),
      q(C.Chat + 3.3, 'sapu', 0.10),
      klik(C.Chat + 3.7), q(C.Chat + 3.75, 'sapu', 0.12),
      q(C.Chat + 4.3, 'pop', 0.14, 3), q(C.Chat + 4.8, 'pop', 0.10, 2),

      // Kirim: status Dihubungi -> Konversi -> Log pengiriman -> Terkirim, Diterima Meta
      klik(C.Kirim + 0.7), q(C.Kirim + 0.75, 'pop', 0.08, 1),
      klik(C.Kirim + 1.6), q(C.Kirim + 1.7, 'centang', 0.14, 1),
      klik(C.Kirim + 2.6), q(C.Kirim + 2.65, 'sapu', 0.12),
      klik(C.Kirim + 3.1), q(C.Kirim + 3.2, 'pop', 0.12, 2),
      q(C.Kirim + 4.6, 'centang', 0.16, 3), q(C.Kirim + 4.75, 'jadi', 0.14),
      q(C.Kirim + 5.0, 'pop', 0.08, 1), q(C.Kirim + 6.5, 'sapu', 0.10),

      // Muncul: tab Events Manager; satu-satunya hentakan besar saat baris LeadSubmitted muncul (3,2 dtk)
      klik(C.Muncul + 0.0), q(C.Muncul + 0.1, 'sapu', 0.12),
      q(C.Muncul + 1.9, 'riser', 0.22), q(C.Muncul + 3.0, 'hisap', 0.20),
      q(C.Muncul + 3.2, 'impact', 0.42), q(C.Muncul + 3.22, 'sub', 0.32),
      q(C.Muncul + 3.7, 'centang', 0.16, 3), q(C.Muncul + 3.85, 'jadi', 0.14),
      q(C.Muncul + 4.3, 'pop', 0.14, 4), q(C.Muncul + 6.3, 'sapu', 0.10),

      // Hasil: chat -> Konektor -> Meta, grafik lead asli
      q(C.Hasil + 0.1, 'sapu', 0.14), q(C.Hasil + 0.25, 'pop', 0.20, 2), q(C.Hasil + 0.9, 'sapu', 0.14),
      q(C.Hasil + 1.3, 'pop', 0.20, 3), q(C.Hasil + 1.8, 'sapu', 0.14), q(C.Hasil + 2.2, 'pop', 0.20, 4),
      q(C.Hasil + 2.4, 'pop', 0.08, 1), q(C.Hasil + 2.6, 'pop', 0.08, 3), q(C.Hasil + 2.8, 'pop', 0.08, 5),
      q(C.Hasil + 2.9, 'chime', 0.16),

      // Tips: dua kartu
      q(C.Tips + 0.0, 'sapu', 0.12), q(C.Tips + 0.3, 'pop', 0.16, 2), q(C.Tips + 0.5, 'chime', 0.12),
      q(C.Tips + 2.8, 'pop', 0.16, 3), q(C.Tips + 3.0, 'chime', 0.12),

      // Outro
      q(C.Outro + 0.9, 'sapu', 0.12), q(C.Outro + 1.0, 'pop', 0.22),
    ];
  },

  musik: [{
    nama: 'bgm',
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'words', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'quiet intro', 'fade in'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const dasar = ['clean modern product-demo instrumental', '112 BPM', 'steady and continuous', 'always present',
        'light shaker', 'soft pluck', 'no vocals'];
      return [
        b(0, C.Chat, '[focus]', [...dasar, 'focused groove from the very first beat', 'warm and clear']),
        b(C.Chat, C.Muncul, '[flow]', [...dasar, 'a little fuller', 'soft arpeggio', 'forward motion']),
        b(C.Muncul, total, '[lift]', [...dasar, 'brighter', 'open', 'same groove']),
        b(total, total + 8, '[tail]', [...dasar, 'brighter groove continues']),
      ];
    },
    titik: [
      ['Intro', 0, -23],
      ['Muncul', 3.0, -23], ['Muncul', 3.1, -32], ['Muncul', 3.32, -22],
      ['Outro', 0, -23],
    ],
    fadeOut: ({total}) => [total - 0.35, 0.35],
  }],

  sampul: {detik: 1.6},
  mixer: {gainVO: 1.60, gainSFX: 0.90, duckMusik: {th: 0.03, ratio: 8, attack: 20, release: 280}},
  // Titik A/B bus SFX di celah VO (0,05 dtk sesudah cue): Pixel+0,05 sapu, Chat+0,05 sapu, Muncul+0,1 sapu, Hasil+0,1 sapu.
  periksa: {busTitik: [11.85, 29.25, 42.7, 49.7]},
};
