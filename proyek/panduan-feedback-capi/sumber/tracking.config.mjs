// Tutorial: pasang kode tracking Konektor di website. 16:9, 8 scene, ±57 dtk.
// Suara sama dengan seri Konektor (preset C, Ari Eko Pro, speed 0.98). Struktur salinan tutorial-kapso.

export default {
  nama: 'tutorial-tracking',
  komposisi: 'Tutorial Tracking Website.dc.html',
  jsx: 'tracking-tutorial.jsx',
  kapsi: false,
  keluaran: 'tutorial-tracking.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  lafal: {},

  vo: [
    {no: 1,  sc: 'Intro',     off: 0.40, text: 'Satu kode, semua platform iklan. Pasang sekali, beres.'},
    {no: 2,  sc: 'Kode',      off: 0.30, text: 'Buka Tracking Website, lalu klik Buat kode tracking.'},
    {no: 3,  sc: 'Kode',      off: 5.60, text: 'Klik Lihat kode, lalu salin.'},
    {no: 4,  sc: 'Pasang',    off: 0.80, text: 'Tempel di bagian kepala semua halaman website.'},
    {no: 5,  sc: 'Pasang',    off: 5.60, text: 'Pakai Google Tag Manager? Ada tab-nya juga.'},
    {no: 6,  sc: 'Developer', off: 0.50, text: 'Atau kirim instruksinya ke developer.'},
    {no: 7,  sc: 'Uji',       off: 0.40, text: 'Buka website kamu sekali.'},
    {no: 8,  sc: 'Uji',       off: 3.80, text: 'Balik ke Konektor, klik Periksa lagi.'},
    {no: 9,  sc: 'Hasil',     off: 0.75, text: 'Selesai! Event pertama sudah masuk.'},
    {no: 10, sc: 'Tips',      off: 0.40, text: 'Tracking jalan dulu, baru tambah platform iklan.'},
    {no: 11, sc: 'Outro',     off: 1.00, dengar: /konektor|connector/i, coba: 4, text: 'Panduannya, di konektor.id.'},
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

  // Semua cue scene-relatif (C.<Scene> + n), diselaraskan dengan jangkar animasi di tracking-tutorial.jsx.
  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0) => ({at, nama, gain, nada});
    const klik = (t, n = 0) => q(t, 'klik', 0.18, n);
    const tombol = (t, n = 0) => q(t, 'tombol', 0.26, n);
    return [
      q(C.Intro + 0.15, 'pop', 0.26), q(C.Intro + 0.40, 'pop', 0.24, 4), q(C.Intro + 0.95, 'pop', 0.10, 2),
      q(C.Intro + 1.35, 'pop', 0.10, 3), q(C.Intro + 3.15, 'sapu', 0.16),

      klik(C.Kode + 1.5), q(C.Kode + 1.6, 'sapu', 0.12),
      tombol(C.Kode + 3.3), q(C.Kode + 4.0, 'jadi', 0.18),
      tombol(C.Kode + 6.2), q(C.Kode + 6.3, 'sapu', 0.14),
      tombol(C.Kode + 7.4), q(C.Kode + 7.48, 'salin', 0.22),

      klik(C.Pasang + 0.3), q(C.Pasang + 0.4, 'sapu', 0.12),
      klik(C.Pasang + 2.3, 1), q(C.Pasang + 2.4, 'ketik', 0.16), q(C.Pasang + 2.45, 'salin', 0.18),
      tombol(C.Pasang + 4.0), q(C.Pasang + 4.1, 'centang', 0.18),
      klik(C.Pasang + 5.4), q(C.Pasang + 5.5, 'sapu', 0.12),
      klik(C.Pasang + 6.6, 2), q(C.Pasang + 6.7, 'sapu', 0.12),

      klik(C.Developer + 1.0, 2), q(C.Developer + 1.1, 'sapu', 0.12),
      tombol(C.Developer + 2.95), q(C.Developer + 3.03, 'salin', 0.20),
      klik(C.Developer + 4.55), q(C.Developer + 4.65, 'sapu', 0.12),

      klik(C.Uji + 0.4), q(C.Uji + 0.5, 'sapu', 0.14), q(C.Uji + 0.95, 'pop', 0.12, 2),
      klik(C.Uji + 4.1), q(C.Uji + 4.2, 'sapu', 0.12),
      klik(C.Uji + 4.75), tombol(C.Uji + 5.6), q(C.Uji + 5.7, 'sapu', 0.10),

      // Satu-satunya hentakan besar: langkah jadi Selesai (Selesai!).
      q(C.Hasil - 0.75, 'riser', 0.22), q(C.Hasil + 0.30, 'hisap', 0.20),
      q(C.Hasil + 0.50, 'impact', 0.42), q(C.Hasil + 0.52, 'sub', 0.32),
      q(C.Hasil + 1.0, 'centang', 0.16, 3), q(C.Hasil + 1.15, 'jadi', 0.14),

      klik(C.Tips + 0.6), q(C.Tips + 0.7, 'sapu', 0.12), q(C.Tips + 1.9, 'pop', 0.14, 3),

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
        b(0, C.Pasang, '[focus]', [...dasar, 'focused groove from the very first beat', 'warm and clear']),
        b(C.Pasang, C.Uji, '[flow]', [...dasar, 'a little fuller', 'soft arpeggio', 'forward motion']),
        b(C.Uji, total, '[lift]', [...dasar, 'brighter', 'open', 'same groove']),
        b(total, total + 8, '[tail]', [...dasar, 'brighter groove continues']),
      ];
    },
    titik: [
      ['Intro', 0, -23],
      ['Hasil', 0.25, -23], ['Hasil', 0.40, -32], ['Hasil', 0.62, -22],
      ['Outro', 0, -23],
    ],
    fadeOut: ({total}) => [total - 0.35, 0.35],
  }],

  sampul: {detik: 1.6},
  mixer: {gainVO: 1.60, gainSFX: 0.90, duckMusik: {th: 0.03, ratio: 8, attack: 20, release: 280}},
  periksa: {busTitik: [8.9, 19.4, 37.2]},
};
