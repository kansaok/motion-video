// Tutorial: status lead jadi sinyal iklan (Feedback CAPI). 16:9, 8 scene, ±55 dtk.
// Suara sama dengan seri Konektor (preset C, Ari Eko Pro, speed 0.98). Struktur salinan tutorial-tracking.

export default {
  nama: 'tutorial-konversi',
  komposisi: 'Tutorial Konversi.dc.html',
  jsx: 'konversi-tutorial.jsx',
  kapsi: false,
  keluaran: 'tutorial-konversi.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  lafal: {},

  vo: [
    {no: 1, sc: 'Intro', off: 0.40, text: 'Iklan belajar dari klik. Padahal yang kamu butuh: pembeli.'},
    {no: 2, sc: 'Atur',  off: 0.50, text: 'Buka Pengaturan Konversi, pilih tipe kampanye.'},
    {no: 3, sc: 'Atur',  off: 4.80, text: 'Setiap status lead punya event iklannya sendiri.'},
    {no: 4, sc: 'Lead',  off: 0.40, text: 'Saat chat masuk, lead tercatat di Konektor.'},
    {no: 5, sc: 'Ubah',  off: 0.40, text: 'Begitu deal, ubah statusnya jadi closing dan isi nilainya.'},
    {no: 6, sc: 'Kirim', off: 0.40, dengar: /purchase|perches|per ?chase/i, coba: 4, text: 'Konektor langsung kirim Purchase ke Meta. Diterima!'},
    {no: 7, sc: 'Hasil', off: 0.40, text: 'Iklan kamu belajar dari pembeli asli, bukan cuma klik.'},
    {no: 8, sc: 'Tips',  off: 0.40, dengar: /aturan/i, coba: 3, text: 'Mau tanpa klik manual? Status bisa berubah otomatis lewat Aturan Otomatisasi.'},
    {no: 9, sc: 'Outro', off: 1.00, dengar: /konektor|connector/i, coba: 4, text: 'Panduannya, di konektor.id.'},
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

  // Semua cue scene-relatif (C.<Scene> + n), diselaraskan dengan jadwal di konversi-tutorial.jsx.
  // Semua cue scene-relatif (C.<Scene> + n), diselaraskan dengan jadwal di konversi-tutorial.jsx.
  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0) => ({at, nama, gain, nada});
    const klik = (t, n = 0) => q(t, 'klik', 0.18, n);
    const tombol = (t, n = 0) => q(t, 'tombol', 0.26, n);
    const ketik = (t) => q(t, 'ketik', 0.14);
    return [
      q(C.Intro + 0.15, 'pop', 0.26), q(C.Intro + 0.95, 'pop', 0.22, 4), q(C.Intro + 1.3, 'sapu', 0.12),
      q(C.Intro + 3.55, 'pop', 0.18, 5), q(C.Intro + 4.3, 'sapu', 0.16), q(C.Intro + 5.0, 'pop', 0.20, 3), q(C.Intro + 5.6, 'sapu', 0.12),

      klik(C.Atur + 1.35), q(C.Atur + 1.45, 'sapu', 0.12), q(C.Atur + 2.5, 'sapu', 0.10),
      klik(C.Atur + 3.55, 1), q(C.Atur + 3.65, 'pop', 0.12, 2),
      tombol(C.Atur + 4.25), q(C.Atur + 4.35, 'centang', 0.14, 2), q(C.Atur + 4.55, 'sapu', 0.12),
      q(C.Atur + 5.45, 'pop', 0.12, 1), q(C.Atur + 6.35, 'pop', 0.12, 2), q(C.Atur + 7.15, 'pop', 0.14, 3),

      klik(C.Lead + 0.3), q(C.Lead + 0.4, 'sapu', 0.12), q(C.Lead + 0.6, 'sapu', 0.14),
      q(C.Lead + 1.5, 'pop', 0.16, 4), q(C.Lead + 1.55, 'chime', 0.10),

      klik(C.Ubah + 0.9), q(C.Ubah + 1.0, 'pop', 0.10, 2),
      klik(C.Ubah + 2.5, 2), q(C.Ubah + 2.65, 'sapu', 0.12),
      klik(C.Ubah + 3.0, 1), ketik(C.Ubah + 3.15), ketik(C.Ubah + 3.4), ketik(C.Ubah + 3.65),
      tombol(C.Ubah + 4.55), q(C.Ubah + 4.7, 'sapu', 0.12), q(C.Ubah + 4.8, 'centang', 0.16, 2),

      klik(C.Kirim + 0.2), q(C.Kirim + 0.3, 'sapu', 0.12), klik(C.Kirim + 0.85, 1),
      q(C.Kirim + 1.35, 'sapu', 0.14), q(C.Kirim + 1.45, 'pop', 0.12, 2),

      // Satu-satunya hentakan besar: "Diterima!" (kata mulai di Kirim + 2,96).
      q(C.Kirim + 2.2, 'riser', 0.22), q(C.Kirim + 2.9, 'hisap', 0.20),
      q(C.Kirim + 3.0, 'impact', 0.42), q(C.Kirim + 3.02, 'sub', 0.32),
      q(C.Kirim + 3.5, 'centang', 0.16, 3), q(C.Kirim + 3.65, 'jadi', 0.14),
      klik(C.Kirim + 3.9, 2), q(C.Kirim + 4.0, 'sapu', 0.10),

      q(C.Hasil + 0.3, 'sapu', 0.14), q(C.Hasil + 0.6, 'pop', 0.14, 2), q(C.Hasil + 1.2, 'pop', 0.16, 3), q(C.Hasil + 1.8, 'sapu', 0.12),
      q(C.Hasil + 2.2, 'pop', 0.12, 3), q(C.Hasil + 2.45, 'pop', 0.12, 4), q(C.Hasil + 2.7, 'pop', 0.12, 5), q(C.Hasil + 3.1, 'chime', 0.14),

      klik(C.Tips + 3.9), q(C.Tips + 4.0, 'sapu', 0.12), q(C.Tips + 4.7, 'pop', 0.14, 3), q(C.Tips + 5.0, 'chime', 0.10),

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
        b(0, C.Lead, '[focus]', [...dasar, 'focused groove from the very first beat', 'warm and clear']),
        b(C.Lead, C.Kirim, '[flow]', [...dasar, 'a little fuller', 'soft arpeggio', 'forward motion']),
        b(C.Kirim, total, '[lift]', [...dasar, 'brighter', 'open', 'same groove']),
        b(total, total + 8, '[tail]', [...dasar, 'brighter groove continues']),
      ];
    },
    titik: [
      ['Intro', 0, -23],
      ['Kirim', 2.75, -23], ['Kirim', 2.90, -32], ['Kirim', 3.12, -22],
      ['Outro', 0, -23],
    ],
    fadeOut: ({total}) => [total - 0.35, 0.35],
  }],

  sampul: {detik: 5.6},
  mixer: {gainVO: 1.60, gainSFX: 0.90, duckMusik: {th: 0.03, ratio: 8, attack: 20, release: 280}},
  periksa: {busTitik: [8.4, 24.7, 32.0]},
};
