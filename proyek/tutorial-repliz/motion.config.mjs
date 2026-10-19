// Tutorial: hubungkan Repliz ke Konektor. 16:9, 10 scene, 63 dtk.
// Suara sama dengan seri Konektor (preset C, Rama 2–3 Okt): Ari Eko Pro, speed 0.98.
// Diukur 8 Okt 2026: 17,4 kar/dtk. Array "absolut" di jsx cuma setTimeout ukur layout, bukan timeline.

export default {
  nama: 'tutorial-repliz',
  komposisi: 'Tutorial Konek Repliz.dc.html',
  jsx: 'repliz-tutorial.jsx',
  kapsi: false,
  keluaran: 'tutorial-repliz.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  // Repliz terbaca "replace". Replis, di frasa "Sambungkan Replis ke Konektor", terbaca "replis".
  lafal: {Repliz: 'Replis', webhook: 'webhuk'},

  vo: [
    {no: 1,  sc: 'Intro',      off: 0.40, dengar: /replis ke (konektor|connector)/i, coba: 4, text: 'Kita sambungkan Repliz ke Konektor.'},
    {no: 2,  sc: 'Gold',       off: 0.20, text: 'Buka Upgrade, lalu aktifkan paket Gold.'},
    {no: 3,  sc: 'Akun',       off: 0.15, text: 'Sambungkan Instagram, terus Facebook Page-nya.'},
    {no: 4,  sc: 'Kunci',      off: 0.20, text: 'Di Setting, salin Access Key. Ini kunci pertama.'},
    {no: 5,  sc: 'Tambah',     off: 3.40, dengar: /replis ke (konektor|connector)/i, coba: 4, text: 'Instagram dulu. Sambungkan Repliz ke Konektor.'},
    {no: 6,  sc: 'Kredensial', off: 0.35, text: 'Beri nama, tempel Access Key, lalu salin Secret Key.'},
    {no: 7,  sc: 'Kredensial', off: 6.15, text: 'Cari akun, centang keduanya, terus Hubungkan.'},
    {no: 8,  sc: 'Webhook',    off: 0.40, dengar: /konektor|connector/i, coba: 4, text: 'Salin tautannya dari Konektor.'},
    {no: 9,  sc: 'Webhook',    off: 5.50, text: 'Tempel di Webhook, lalu Save.'},
    {no: 10, sc: 'Uji',        off: 0.90, text: 'Kirim satu chat uji.'},
    {no: 11, sc: 'Uji',        off: 3.55, text: 'Webhook nyampe. Terhubung!'},
    {no: 12, sc: 'Inbox',      off: 0.40, text: 'Chat-nya masuk. Balas langsung dari sini.'},
    {no: 13, sc: 'Outro',      off: 1.00, dengar: /konektor|connector/i, coba: 4, text: 'Panduannya, di konektor.id.'},
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
    ['kirim', '@stok/dm-kirim'],
    ['chime', '@stok/success-chime'],
    ['jadi', '@stok/jadi-ding'],
    ['balas', '@stok/chime-send'],
    ['riser', '@stok/riser-long'],
    ['hisap', '@stok/whoosh-rev'],
    ['impact', '@stok/impact-hit'],
    ['sub', '@stok/sub-drop'],
  ],

  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0) => ({at, nama, gain, nada});
    const klik = (t, n = 0) => q(t, 'klik', 0.18, n);
    const tombol = (t, n = 0) => q(t, 'tombol', 0.26, n);
    return [
      q(C.Intro + 0.15, 'pop', 0.26), q(C.Intro + 0.40, 'pop', 0.24, 4), q(C.Intro + 2.90, 'sapu', 0.16),

      klik(C.Gold + 1.0), tombol(C.Gold + 2.6), q(C.Gold + 2.70, 'chime', 0.20),

      klik(C.Akun + 0.8), tombol(C.Akun + 1.7),
      q(C.Akun + 2.3, 'pop', 0.20), q(C.Akun + 3.0, 'pop', 0.20, 3),

      klik(C.Kunci + 0.8), q(C.Kunci + 2.4, 'salin', 0.22),

      q(C.Tambah + 0.65, 'sapu', 0.12), klik(C.Tambah + 0.7), tombol(C.Tambah + 2.4),
      klik(C.Tambah + 3.8, 2), tombol(C.Tambah + 5.4, 2),

      klik(C.Kredensial + 0.6), q(C.Kredensial + 0.8, 'ketik', 0.16), klik(C.Kredensial + 2.3, 1),
      q(C.Kredensial + 3.15, 'sapu', 0.12), klik(C.Kredensial + 3.2), q(C.Kredensial + 4.0, 'salin', 0.22),
      q(C.Kredensial + 4.75, 'sapu', 0.12), klik(C.Kredensial + 4.8), klik(C.Kredensial + 5.5, 1),
      tombol(C.Kredensial + 6.3), q(C.Kredensial + 7.9, 'centang', 0.20), q(C.Kredensial + 8.5, 'centang', 0.20, 3),
      tombol(C.Kredensial + 9.3),

      q(C.Webhook + 0.9, 'salin', 0.22), q(C.Webhook + 1.75, 'sapu', 0.12), klik(C.Webhook + 1.8),
      klik(C.Webhook + 2.6, 2), klik(C.Webhook + 3.4),
      q(C.Webhook + 4.25, 'sapu', 0.12), klik(C.Webhook + 4.3), q(C.Webhook + 5.0, 'salin', 0.22),
      q(C.Webhook + 5.75, 'sapu', 0.12), klik(C.Webhook + 5.8), klik(C.Webhook + 6.5),
      tombol(C.Webhook + 7.4), q(C.Webhook + 7.55, 'jadi', 0.18),

      q(C.Uji + 2.4, 'kirim', 0.28), klik(C.Uji + 3.9), tombol(C.Uji + 4.6),
      // Satu-satunya hentakan besar: status jadi Terhubung.
      q(C.Uji + 4.00, 'riser', 0.22), q(C.Uji + 5.10, 'hisap', 0.20),
      q(C.Uji + 5.30, 'impact', 0.42), q(C.Uji + 5.32, 'sub', 0.32),

      klik(C.Inbox + 0.8), klik(C.Inbox + 1.8, 2), klik(C.Inbox + 2.4),
      q(C.Inbox + 2.55, 'ketik', 0.14), q(C.Inbox + 4.15, 'balas', 0.24),

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
        b(0, C.Tambah, '[focus]', [...dasar, 'focused groove from the very first beat', 'warm and clear']),
        b(C.Tambah, C.Uji, '[flow]', [...dasar, 'a little fuller', 'soft arpeggio', 'forward motion']),
        b(C.Uji, total, '[lift]', [...dasar, 'brighter', 'open', 'same groove']),
        b(total, total + 8, '[tail]', [...dasar, 'brighter groove continues']),
      ];
    },
    titik: [
      ['Intro', 0, -18],
      ['Uji', 4.90, -18], ['Uji', 5.15, -27], ['Uji', 5.40, -17],
      ['Outro', 0, -18],
    ],
    fadeOut: ({total}) => [total - 0.35, 0.35],
  }],

  sampul: {detik: 1.6},
  mixer: {gainVO: 1.60, gainSFX: 0.90, duckMusik: {th: 0.03, ratio: 8, attack: 20, release: 280}},
  periksa: {busTitik: [3.0, 7.5, 49.1]},
};
