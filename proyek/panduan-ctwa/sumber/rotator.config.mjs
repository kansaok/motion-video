// Tutorial: buat Link WhatsApp (Rotator) di Konektor. 16:9, 9 scene, ±55 dtk.
// Suara sama dengan seri Konektor (preset C, Ari Eko Pro, speed 0.98). Struktur salinan tutorial-tracking.

export default {
  nama: 'tutorial-rotator',
  komposisi: 'Tutorial Rotator.dc.html',
  jsx: 'rotator-tutorial.jsx',
  kapsi: false,
  keluaran: 'tutorial-rotator.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  lafal: {uniquecode: 'unik kode'},

  vo: [
    {no: 1,  sc: 'Intro',  off: 0.40, text: 'Chat WhatsApp dari iklan sering hilang jejak. Kode pengunjung menyambungkannya.'},
    {no: 2,  sc: 'Buat',   off: 0.50, text: 'Buka Link WhatsApp, lalu klik Buat Link.'},
    {no: 3,  sc: 'Form',   off: 0.50, text: 'Isi nama dan slug, lalu tulis pesan pembuka.'},
    {no: 4,  sc: 'Kode',   off: 0.40, text: 'Klik tag uniquecode. Di situlah kode pengunjung muncul.'},
    {no: 5,  sc: 'Nomor',  off: 0.30, text: 'Tambah nomor tim, atur porsinya, lalu klik Buat Rotator.'},
    {no: 6,  sc: 'Salin',  off: 0.40, text: 'Salin link, lalu pasang di iklan.'},
    {no: 7,  sc: 'Uji',    off: 0.40, text: 'Pelanggan klik iklan. Pesannya sudah membawa kode.'},
    {no: 8,  sc: 'Cocok',  off: 0.30, text: 'Chat masuk, Konektor mencocokkan kodenya. Tersambung!'},
    {no: 9,  sc: 'Hasil',  off: 0.40, text: 'Kamu tahu chat ini dari iklan mana, dan closing-nya bisa dikirim balik ke iklan.'},
    {no: 10, sc: 'Tips',   off: 0.40, text: 'Supaya kode terbaca, hubungkan nomor tim ke Konektor.'},
    {no: 11, sc: 'Outro',  off: 1.00, dengar: /konektor|connector/i, coba: 4, text: 'Panduannya, di konektor.id.'},
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

  // Semua cue scene-relatif (C.<Scene> + n), diselaraskan dengan jadwal di rotator-tutorial.jsx.
  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0) => ({at, nama, gain, nada});
    const klik = (t, n = 0) => q(t, 'klik', 0.18, n);
    const tombol = (t, n = 0) => q(t, 'tombol', 0.26, n);
    const ketik = (t) => q(t, 'ketik', 0.14);
    return [
      q(C.Intro + 0.15, 'pop', 0.26), q(C.Intro + 0.40, 'pop', 0.24, 4), q(C.Intro + 1.1, 'pop', 0.10, 2),
      q(C.Intro + 1.5, 'pop', 0.10, 3), q(C.Intro + 3.0, 'pop', 0.20, 5), q(C.Intro + 3.3, 'sapu', 0.16), q(C.Intro + 4.6, 'sapu', 0.14),

      klik(C.Buat + 1.1), q(C.Buat + 1.2, 'sapu', 0.12),
      tombol(C.Buat + 2.6), q(C.Buat + 2.75, 'sapu', 0.14),

      klik(C.Form + 0.55), ketik(C.Form + 0.8),
      klik(C.Form + 1.55, 1), ketik(C.Form + 1.8),
      klik(C.Form + 2.55, 2), ketik(C.Form + 2.9),

      tombol(C.Kode + 1.5), q(C.Kode + 1.55, 'salin', 0.20), q(C.Kode + 2.5, 'pop', 0.14, 3),
      q(C.Kode + 3.2, 'sapu', 0.12),

      klik(C.Nomor + 0.4), ketik(C.Nomor + 0.55), klik(C.Nomor + 0.78, 1), ketik(C.Nomor + 0.9),
      tombol(C.Nomor + 1.35), q(C.Nomor + 1.45, 'sapu', 0.12),
      klik(C.Nomor + 1.9), ketik(C.Nomor + 2.0), klik(C.Nomor + 2.28, 1), ketik(C.Nomor + 2.4),
      klik(C.Nomor + 2.75, 2), q(C.Nomor + 2.85, 'sapu', 0.10), klik(C.Nomor + 3.2, 3), q(C.Nomor + 3.3, 'sapu', 0.10),
      tombol(C.Nomor + 3.85), q(C.Nomor + 4.3, 'centang', 0.16, 2),

      klik(C.Salin + 0.95), q(C.Salin + 1.05, 'salin', 0.22),
      q(C.Salin + 1.8, 'pop', 0.12, 2),

      q(C.Uji + 0.2, 'sapu', 0.16), q(C.Uji + 1.0, 'pop', 0.12, 2),
      q(C.Uji + 2.5, 'pop', 0.16, 4), q(C.Uji + 2.55, 'chime', 0.12),

      q(C.Cocok + 0.7, 'sapu', 0.14), q(C.Cocok + 1.1, 'sapu', 0.14, 2),

      // Satu-satunya hentakan besar: "Tersambung!" (baris lead muncul).
      q(C.Cocok + 2.4, 'riser', 0.22), q(C.Cocok + 3.1, 'hisap', 0.20),
      q(C.Cocok + 3.2, 'impact', 0.42), q(C.Cocok + 3.22, 'sub', 0.32),
      q(C.Cocok + 3.7, 'centang', 0.16, 3), q(C.Cocok + 3.85, 'jadi', 0.14),

      klik(C.Hasil + 0.3), q(C.Hasil + 0.4, 'sapu', 0.12), q(C.Hasil + 1.9, 'sapu', 0.10),
      q(C.Hasil + 2.9, 'chime', 0.16), q(C.Hasil + 3.4, 'pop', 0.14, 3),

      klik(C.Tips + 0.3), q(C.Tips + 0.4, 'sapu', 0.12), q(C.Tips + 1.5, 'pop', 0.14, 1), q(C.Tips + 1.9, 'pop', 0.14, 3), q(C.Tips + 2.0, 'sapu', 0.12),

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
        b(0, C.Kode, '[focus]', [...dasar, 'focused groove from the very first beat', 'warm and clear']),
        b(C.Kode, C.Uji, '[flow]', [...dasar, 'a little fuller', 'soft arpeggio', 'forward motion']),
        b(C.Uji, total, '[lift]', [...dasar, 'brighter', 'open', 'same groove']),
        b(total, total + 8, '[tail]', [...dasar, 'brighter groove continues']),
      ];
    },
    titik: [
      ['Intro', 0, -23],
      ['Cocok', 2.95, -23], ['Cocok', 3.10, -32], ['Cocok', 3.32, -22],
      ['Outro', 0, -23],
    ],
    fadeOut: ({total}) => [total - 0.35, 0.35],
  }],

  sampul: {detik: 1.6},
  mixer: {gainVO: 1.60, gainSFX: 0.90, duckMusik: {th: 0.03, ratio: 8, attack: 20, release: 280}},
  periksa: {busTitik: [9.0, 17.1, 25.65]},
};
