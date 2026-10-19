// Tutorial: sambungkan Meta Pixel + Conversions API ke Konektor. 16:9, 8 scene, ±60 dtk.
// Suara sama dengan seri Konektor (preset C). Struktur salinan tutorial-kapso.

export default {
  nama: 'tutorial-meta-capi',
  komposisi: 'Tutorial Meta CAPI.dc.html',
  jsx: 'meta-capi-tutorial.jsx',
  kapsi: false,
  keluaran: 'tutorial-meta-capi.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  lafal: {},

  vo: [
    {no: 1,  sc: 'Intro',    off: 0.40, text: 'Kirim closing ke Meta lewat server, bukan cuma pixel.'},
    {no: 2,  sc: 'Pixel',    off: 0.40, text: 'Buka Events Manager, pilih pixel kamu, salin Pixel ID.'},
    {no: 3,  sc: 'Token',    off: 0.30, text: 'Masuk Settings, cari Conversions API, klik Generate access token.'},
    {no: 4,  sc: 'Token',    off: 5.30, text: 'Salin tokennya. Meta cuma menampilkannya sekali.'},
    {no: 5,  sc: 'Konektor', off: 0.30, text: 'Di Konektor, buka Tracking Website, lalu Tambah platform iklan.'},
    {no: 6,  sc: 'Konektor', off: 5.30, text: 'Pilih Meta, Facebook dan Instagram.'},
    {no: 7,  sc: 'Form',     off: 0.30, text: 'Isi nama, tempel Pixel ID, lalu tempel Access Token.'},
    {no: 8,  sc: 'Form',     off: 5.00, text: 'Klik Simpan. Status Menunggu, sampai event pertama masuk.'},
    {no: 9,  sc: 'Uji',      off: 0.30, text: 'Mau cek sekarang? Pilih Uji kirim.'},
    {no: 10, sc: 'Uji',      off: 2.80, text: 'Tempel Test Event Code dari Events Manager, lalu kirim.'},
    {no: 11, sc: 'Hasil',    off: 0.40, text: 'Test Event terkirim. Event-nya muncul di Meta.'},
    {no: 12, sc: 'Outro',    off: 1.00, dengar: /konektor|connector/i, coba: 4, text: 'Panduannya, di konektor.id.'},
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
    ['jadi', '@stok/jadi-ding'],
    ['riser', '@stok/riser-long'],
    ['hisap', '@stok/whoosh-rev'],
    ['impact', '@stok/impact-hit'],
    ['sub', '@stok/sub-drop'],
  ],

  // Semua cue scene-relatif (C.<Scene> + n), diselaraskan dengan jangkar animasi di meta-capi-tutorial.jsx.
  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0) => ({at, nama, gain, nada});
    const klik = (t, n = 0) => q(t, 'klik', 0.18, n);
    const tombol = (t, n = 0) => q(t, 'tombol', 0.26, n);
    return [
      q(C.Intro + 0.15, 'pop', 0.26), q(C.Intro + 0.40, 'pop', 0.24, 4), q(C.Intro + 3.35, 'sapu', 0.16),

      klik(C.Pixel + 1.3), q(C.Pixel + 1.4, 'sapu', 0.12), klik(C.Pixel + 2.7, 2),
      tombol(C.Pixel + 4.1), q(C.Pixel + 4.2, 'salin', 0.22),

      klik(C.Token + 1.0), q(C.Token + 1.1, 'sapu', 0.12), q(C.Token + 1.7, 'sapu', 0.12),
      tombol(C.Token + 4.0), q(C.Token + 4.15, 'pop', 0.20, 3),
      tombol(C.Token + 6.0), q(C.Token + 6.1, 'salin', 0.22), q(C.Token + 6.9, 'pop', 0.14, 4),

      klik(C.Konektor + 0.7, 1), q(C.Konektor + 0.8, 'sapu', 0.12), klik(C.Konektor + 2.4), q(C.Konektor + 2.5, 'sapu', 0.12),
      tombol(C.Konektor + 4.5), q(C.Konektor + 4.65, 'sapu', 0.14), klik(C.Konektor + 6.9, 2), q(C.Konektor + 7.2, 'sapu', 0.12),

      klik(C.Form + 0.5), q(C.Form + 0.6, 'ketik', 0.16), klik(C.Form + 1.7, 1), q(C.Form + 2.0, 'salin', 0.20),
      klik(C.Form + 3.0, 2), q(C.Form + 3.4, 'salin', 0.20), q(C.Form + 3.55, 'pop', 0.16, 3),
      tombol(C.Form + 5.2), q(C.Form + 5.4, 'sapu', 0.12), q(C.Form + 5.7, 'pop', 0.20, 2),

      klik(C.Uji + 1.0), q(C.Uji + 1.1, 'pop', 0.14), klik(C.Uji + 1.95, 2), q(C.Uji + 2.05, 'sapu', 0.12),
      klik(C.Uji + 3.0, 1), q(C.Uji + 3.1, 'sapu', 0.12), tombol(C.Uji + 3.8), q(C.Uji + 3.9, 'salin', 0.20),
      klik(C.Uji + 4.6, 1), q(C.Uji + 4.7, 'sapu', 0.12), klik(C.Uji + 4.9, 2), q(C.Uji + 4.98, 'salin', 0.18),
      tombol(C.Uji + 5.6), q(C.Uji + 5.65, 'kirim', 0.28),

      // Satu-satunya hentakan besar: toast "Test Event terkirim".
      q(C.Hasil - 1.05, 'riser', 0.22), q(C.Hasil + 0.20, 'hisap', 0.20),
      q(C.Hasil + 0.40, 'impact', 0.42), q(C.Hasil + 0.42, 'sub', 0.32),
      klik(C.Hasil + 1.6, 1), q(C.Hasil + 1.7, 'sapu', 0.12), q(C.Hasil + 2.3, 'pop', 0.22, 3), q(C.Hasil + 2.5, 'jadi', 0.14),

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
        b(0, C.Konektor, '[focus]', [...dasar, 'focused groove from the very first beat', 'warm and clear']),
        b(C.Konektor, C.Uji, '[flow]', [...dasar, 'a little fuller', 'soft arpeggio', 'forward motion']),
        b(C.Uji, total, '[lift]', [...dasar, 'brighter', 'open', 'same groove']),
        b(total, total + 8, '[tail]', [...dasar, 'brighter groove continues']),
      ];
    },
    titik: [
      ['Intro', 0, -18],
      ['Hasil', 0.25, -18], ['Hasil', 0.40, -27], ['Hasil', 0.62, -17],
      ['Outro', 0, -18],
    ],
    fadeOut: ({total}) => [total - 0.35, 0.35],
  }],

  sampul: {detik: 1.6},
  mixer: {gainVO: 1.60, gainSFX: 0.90, duckMusik: {th: 0.03, ratio: 8, attack: 20, release: 280}},
  periksa: {busTitik: [35.45, 46.6, 47.65]},
};
