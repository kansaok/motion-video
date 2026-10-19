// Tutorial: Iklan Click-to-WhatsApp yang dilacak sampai closing. 16:9, 9 scene, ±60 dtk.
// Suara sama dengan seri Konektor (preset C, Ari Eko Pro, speed 0.98). Struktur salinan tutorial-rotator.

export default {
  nama: 'tutorial-ctwa',
  komposisi: 'Tutorial CTWA.dc.html',
  jsx: 'ctwa-tutorial.jsx',
  kapsi: false,
  keluaran: 'tutorial-ctwa.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  // Kunci terpanjang di atas. 'WhatsApp' sendiri dibaca "wasap" (IKLAN.md, tabel ejaan).
  lafal: {'Click-to-WhatsApp': 'Klik tu wasap', WhatsApp: 'wasap'},

  vo: [
    {no: 1,  sc: 'Intro', off: 0.40, text: 'Iklan Click-to-WhatsApp: chat banyak, tapi Meta tidak tahu siapa yang beli.'},
    {no: 2,  sc: 'Nomor', off: 0.40, text: 'Pertama, sambungkan nomor WhatsApp ke Konektor.'},
    {no: 3,  sc: 'Iklan', off: 0.40, text: 'Di Ads Manager, pilih Message destinations, lalu centang WhatsApp.'},
    {no: 4,  sc: 'Iklan', off: 5.00, text: 'Pakai nomor yang sama dengan di Konektor.'},
    {no: 5,  sc: 'Chat',  off: 0.40, text: 'Orang klik iklan, lalu kirim chat. Chat-nya membawa data iklan dari Meta.'},
    {no: 6,  sc: 'Lead',  off: 0.40, text: 'Konektor mencatatnya sebagai lead dari iklan.'},
    {no: 7,  sc: 'Lead',  off: 3.40, text: 'Data iklannya tersimpan di detail lead.'},
    {no: 8,  sc: 'Kirim', off: 0.40, dengar: /diterima|di terima/i, coba: 4, text: 'Begitu deal, ubah jadi closing. Konektor kirim ke Meta. Diterima!'},
    {no: 9,  sc: 'Hasil', off: 0.40, text: 'Iklan belajar dari pembeli asli, bukan cuma dari chat.'},
    {no: 10, sc: 'Tips',  off: 0.40, text: 'Pakai WhatsApp Business Resmi supaya data iklan selalu terbaca.'},
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

  // Semua cue scene-relatif (C.<Scene> + n), diselaraskan dengan jadwal di ctwa-tutorial.jsx.
  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0) => ({at, nama, gain, nada});
    const klik = (t, n = 0) => q(t, 'klik', 0.18, n);
    const tombol = (t, n = 0) => q(t, 'tombol', 0.26, n);
    return [
      q(C.Intro + 0.15, 'pop', 0.26), q(C.Intro + 1.0, 'pop', 0.18, 2),
      q(C.Intro + 1.75, 'pop', 0.10, 1), q(C.Intro + 1.85, 'pop', 0.10, 3), q(C.Intro + 1.95, 'pop', 0.10, 2),
      q(C.Intro + 2.05, 'pop', 0.10, 4), q(C.Intro + 2.15, 'pop', 0.10, 1), q(C.Intro + 2.25, 'pop', 0.10, 3),
      q(C.Intro + 2.75, 'pop', 0.20, 4), q(C.Intro + 3.15, 'pop', 0.22, 5),
      q(C.Intro + 4.5, 'sapu', 0.14),

      q(C.Nomor + 0.4, 'sapu', 0.08), klik(C.Nomor + 1.25), q(C.Nomor + 1.3, 'sapu', 0.12),
      q(C.Nomor + 2.5, 'pop', 0.14, 3), q(C.Nomor + 2.55, 'chime', 0.12),

      klik(C.Iklan + 0.0), klik(C.Iklan + 1.05), q(C.Iklan + 1.1, 'sapu', 0.12),
      q(C.Iklan + 1.75, 'pop', 0.12, 2),
      tombol(C.Iklan + 3.9), q(C.Iklan + 3.95, 'centang', 0.16, 2),
      q(C.Iklan + 4.3, 'sapu', 0.10), q(C.Iklan + 5.1, 'pop', 0.14, 3),
      q(C.Iklan + 5.9, 'pop', 0.16, 4), q(C.Iklan + 5.95, 'chime', 0.12),

      klik(C.Chat + 0.0), klik(C.Chat + 0.85), q(C.Chat + 0.9, 'sapu', 0.12),
      q(C.Chat + 1.65, 'pop', 0.16, 2), q(C.Chat + 1.7, 'chime', 0.10),
      klik(C.Chat + 2.15), q(C.Chat + 2.6, 'sapu', 0.10), q(C.Chat + 2.8, 'pop', 0.16, 4),
      q(C.Chat + 5.4, 'sapu', 0.10),

      klik(C.Lead + 0.45), q(C.Lead + 0.5, 'sapu', 0.12),
      q(C.Lead + 1.1, 'pop', 0.12, 2), q(C.Lead + 1.7, 'pop', 0.12, 3),
      klik(C.Lead + 3.3), q(C.Lead + 3.4, 'sapu', 0.14), q(C.Lead + 4.4, 'pop', 0.14, 4),
      q(C.Lead + 6.3, 'sapu', 0.12), klik(C.Lead + 7.1),

      klik(C.Kirim + 1.75), q(C.Kirim + 1.85, 'sapu', 0.12),
      q(C.Kirim + 2.0, 'klik', 0.10, 1), q(C.Kirim + 2.12, 'klik', 0.10, 2), q(C.Kirim + 2.24, 'klik', 0.10, 1), q(C.Kirim + 2.36, 'klik', 0.10, 2),
      tombol(C.Kirim + 2.7), q(C.Kirim + 2.8, 'centang', 0.14, 1),
      klik(C.Kirim + 3.05), klik(C.Kirim + 3.55),

      // Satu-satunya hentakan besar: "Diterima!" (status Terkirim, 4,15 dtk di scene Kirim).
      q(C.Kirim + 3.35, 'riser', 0.22), q(C.Kirim + 4.05, 'hisap', 0.20),
      q(C.Kirim + 4.15, 'impact', 0.42), q(C.Kirim + 4.17, 'sub', 0.32),
      q(C.Kirim + 4.65, 'centang', 0.16, 3), q(C.Kirim + 4.8, 'jadi', 0.14),
      q(C.Kirim + 6.3, 'sapu', 0.10),

      q(C.Hasil + 0.1, 'sapu', 0.14), q(C.Hasil + 0.25, 'pop', 0.20, 2), q(C.Hasil + 0.9, 'sapu', 0.14),
      q(C.Hasil + 1.5, 'pop', 0.20, 3), q(C.Hasil + 1.7, 'pop', 0.08, 1), q(C.Hasil + 2.1, 'pop', 0.08, 3), q(C.Hasil + 2.5, 'pop', 0.08, 5),
      q(C.Hasil + 2.7, 'chime', 0.16),

      q(C.Tips + 0.0, 'sapu', 0.12), q(C.Tips + 1.2, 'pop', 0.14, 2), q(C.Tips + 1.4, 'chime', 0.12),

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
  periksa: {busTitik: [4.65, 11.45, 20.05, 25.45, 33.1, 41.15]},
};
