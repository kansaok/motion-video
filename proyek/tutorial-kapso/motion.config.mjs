// Tutorial: hubungkan WhatsApp resmi lewat Kapso ke Konektor. 16:9, 10 scene, ±60 dtk.
// Suara sama dengan seri Konektor (preset C, Ari Eko Pro, speed 0.98). Struktur salinan tutorial-repliz.

export default {
  nama: 'tutorial-kapso',
  komposisi: 'Tutorial Konek Kapso.dc.html',
  jsx: 'kapso-tutorial.jsx',
  kapsi: false,
  keluaran: 'tutorial-kapso-v2.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  lafal: {webhook: 'webhuk', Webhook: 'Webhuk'},

  vo: [
    {no: 1,  sc: 'Intro',    off: 0.40, text: 'Sambungkan WhatsApp resmi lewat Kapso ke Konektor.'},
    {no: 2,  sc: 'Nomor',    off: 0.30, text: 'Di Kapso, buka Phone numbers, lalu Set up number.'},
    {no: 3,  sc: 'Nomor',    off: 5.18, text: 'Pilih nomor US instan, SIM sendiri, atau WhatsApp Business yang sudah ada.'},
    {no: 4,  sc: 'Meta',     off: 0.30, text: 'Ikuti jendela Facebook sampai Finish.'},
    {no: 5,  sc: 'Kunci',    off: 0.30, text: 'Buka Integrate, API keys, lalu buat key baru. Salin.'},
    {no: 6,  sc: 'Konektor', off: 0.30, text: 'Di Konektor, buka Hubungkan WhatsApp, pilih Hubungkan lewat Kapso.'},
    {no: 7,  sc: 'Tempel',   off: 0.30, text: 'Tempel API key. Nomornya langsung terpilih.'},
    {no: 8,  sc: 'Tempel',   off: 3.40, text: 'Klik Hubungkan. Terhubung!'},
    {no: 9,  sc: 'Webhook',  off: 0.60, text: 'Webhook terpasang otomatis, tanpa setting tambahan.'},
    {no: 10, sc: 'Uji',      off: 0.50, text: 'Kirim satu chat uji. Langsung masuk ke Kotak Masuk.'},
    {no: 11, sc: 'Inbox',    off: 0.40, text: 'Balas dari sini. Pelanggan lihat centang biru.'},
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
    ['chime', '@stok/success-chime'],
    ['jadi', '@stok/jadi-ding'],
    ['balas', '@stok/chime-send'],
    ['riser', '@stok/riser-long'],
    ['hisap', '@stok/whoosh-rev'],
    ['impact', '@stok/impact-hit'],
    ['sub', '@stok/sub-drop'],
  ],

  // Semua cue scene-relatif (C.<Scene> + n), diselaraskan dengan jangkar animasi di kapso-tutorial.jsx.
  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0) => ({at, nama, gain, nada});
    const klik = (t, n = 0) => q(t, 'klik', 0.18, n);
    const tombol = (t, n = 0) => q(t, 'tombol', 0.26, n);
    return [
      q(C.Intro + 0.15, 'pop', 0.26), q(C.Intro + 0.40, 'pop', 0.24, 4), q(C.Intro + 3.15, 'sapu', 0.16),

      klik(C.Nomor + 2.5), q(C.Nomor + 2.6, 'sapu', 0.12), tombol(C.Nomor + 4.65), q(C.Nomor + 4.8, 'sapu', 0.12),
      q(C.Nomor + 5.9, 'pop', 0.16), q(C.Nomor + 7.5, 'pop', 0.16, 2), q(C.Nomor + 8.5, 'pop', 0.16, 4),
      tombol(C.Nomor + 9.8), q(C.Nomor + 9.95, 'sapu', 0.14),

      tombol(C.Meta + 0.6), klik(C.Meta + 1.1, 1), klik(C.Meta + 1.6, 2), tombol(C.Meta + 2.25),
      q(C.Meta + 2.4, 'centang', 0.20), q(C.Meta + 2.65, 'pop', 0.18, 3),

      klik(C.Kunci + 1.0), klik(C.Kunci + 1.8, 2), tombol(C.Kunci + 2.55), q(C.Kunci + 2.8, 'ketik', 0.16),
      tombol(C.Kunci + 3.25), q(C.Kunci + 3.6, 'salin', 0.22),

      klik(C.Konektor + 0.9), klik(C.Konektor + 2.6), q(C.Konektor + 2.75, 'sapu', 0.12),
      tombol(C.Konektor + 4.25), q(C.Konektor + 4.4, 'sapu', 0.12),

      klik(C.Tempel + 0.15), q(C.Tempel + 0.6, 'salin', 0.20), q(C.Tempel + 2.1, 'pop', 0.20, 3), tombol(C.Tempel + 3.75),
      // Satu-satunya hentakan besar: status jadi Terhubung.
      q(C.Tempel + 3.20, 'riser', 0.22), q(C.Tempel + 4.25, 'hisap', 0.20),
      q(C.Tempel + 4.45, 'impact', 0.42), q(C.Tempel + 4.47, 'sub', 0.32),

      klik(C.Webhook + 0.15), klik(C.Webhook + 0.8, 1), q(C.Webhook + 0.9, 'sapu', 0.12), q(C.Webhook + 1.45, 'jadi', 0.18),

      klik(C.Uji + 0.1), q(C.Uji + 0.2, 'sapu', 0.14), q(C.Uji + 0.5, 'ketik', 0.14), q(C.Uji + 1.35, 'kirim', 0.28),
      q(C.Uji + 1.95, 'sapu', 0.12), klik(C.Uji + 2.4, 2), q(C.Uji + 2.95, 'pop', 0.24),

      klik(C.Inbox + 0.15), klik(C.Inbox + 0.4, 2), q(C.Inbox + 0.5, 'ketik', 0.14), tombol(C.Inbox + 1.35),
      q(C.Inbox + 1.42, 'balas', 0.24), q(C.Inbox + 1.85, 'centang', 0.18), q(C.Inbox + 2.25, 'centang', 0.20, 3),

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
        b(C.Konektor, C.Webhook, '[flow]', [...dasar, 'a little fuller', 'soft arpeggio', 'forward motion']),
        b(C.Webhook, total, '[lift]', [...dasar, 'brighter', 'open', 'same groove']),
        b(total, total + 8, '[tail]', [...dasar, 'brighter groove continues']),
      ];
    },
    titik: [
      ['Intro', 0, -18],
      ['Tempel', 4.25, -18], ['Tempel', 4.40, -27], ['Tempel', 4.62, -17],
      ['Outro', 0, -18],
    ],
    fadeOut: ({total}) => [total - 0.35, 0.35],
  }],

  sampul: {detik: 1.6},
  mixer: {gainVO: 1.60, gainSFX: 0.90, duckMusik: {th: 0.03, ratio: 8, attack: 20, release: 280}},
  periksa: {busTitik: [14.64, 36.6, 41.85]},
};
