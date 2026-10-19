// Konektor hari 9 — Meta CAPI: status Closing mengirim Purchase. HABIS mode SYARAT.
// 9:16 utama, 4:5 untuk LinkedIn. Tanpa 16:9. Tanpa Claude Design, struktur hari 7 / hari 8.
// Fakta yang boleh diklaim: naskah.md. Satu baris VO = satu kapsi (12 baris).

export default {
  nama: 'konektor-hari-9',
  komposisi: 'Konektor Hari9 9x16.dc.html',
  jugaTulis: ['Konektor Hari9 4x5.dc.html'],
  jsx: 'hari9-video.jsx',
  kapsi: true,
  keluaran: 'konektor-hari-9-9x16.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  lafal: {},

  vo: [
    {no: 1,  sc: 'Hook',     off: 0.05, text: 'Closing kamu jadi Purchase!'},
    {no: 2,  sc: 'Hook',     off: 2.45, text: 'Kecuali token CAPI-nya kosong.'},
    {no: 3,  sc: 'Celah',    off: 0.05, text: 'Meta dapat sinyal pembeli.'},
    {no: 4,  sc: 'Bukti',    off: 0.08, text: 'Status Closing kirim event Purchase.'},
    {no: 5,  sc: 'Bukti',    off: 2.70, text: 'Dari server, bukan cuma pixel browser.'},
    {no: 6,  sc: 'Belokan',  off: 0.08, text: 'Tapi tanpa Access Token, event-nya tidak terkirim!'},
    {no: 7,  sc: 'Inti',     off: 0.08, text: 'Jadi, simpan token, baru tandai Closing.'},
    {no: 8,  sc: 'Langkah1', off: 0.08, text: 'Satu, buka Tracking Website, pilih Facebook dan Instagram.'},
    {no: 9,  sc: 'Langkah2', off: 0.08, text: 'Dua, isi Meta Pixel ID dan Access Token, tekan Simpan.'},
    {no: 10, sc: 'Langkah3', off: 0.15, text: 'Tiga, tandai Closing, lalu cek di Konversi!'},
    {no: 11, sc: 'CTA',      off: 0.08, text: 'Coba gratis di konektor dot id.'},
    {no: 12, sc: 'CTA',      off: 2.35, text: 'Soalnya closing kamu jadi'},
  ],

  tata: {mode: 'jangkar', jeda: 0.25, ekorBiasa: 0.35, ekor: {CTA: 0.55}},

  sfx: [
    ['sapu',    '@stok/sapu'],
    ['klik',    '@stok/click-soft'],
    ['tombol',  '@stok/btn-click'],
    ['tik',     '@stok/05-tick'],
    ['gagal',   '@stok/buzz'],
    ['pop',     '@stok/pop-thick'],
    ['stempel', '@stok/09-stamp'],
    ['ding',    '@stok/notif-ding'],
    ['riser',   '@stok/riser-long'],
    ['hisap',   '@stok/whoosh-rev'],
    ['impact',  '@stok/impact-hit'],
    ['sub',     '@stok/sub-drop'],
    ['chime',   '@stok/chime-send'],
  ],

  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0, pan = 0) => ({at, nama, gain, nada, pan});
    const sapu = (sc, nada = 0) => q(C[sc] - 0.10, 'sapu', 0.14, nada);
    return [
      q(C.Hook + 0.20, 'impact', 0.24, 2), q(C.Hook + 0.70, 'stempel', 0.30),
      q(C.Hook + 2.40, 'hisap', 0.16), q(C.Hook + 2.50, 'gagal', 0.16, 2),
      sapu('Celah'), q(C.Celah + 0.20, 'pop', 0.22), q(C.Celah + 1.15, 'ding', 0.16),
      sapu('Bukti', 1), q(C.Bukti + 0.25, 'pop', 0.18), q(C.Bukti + 2.70, 'tik', 0.16),
      q(C.Belokan + 0.00, 'impact', 0.30, -3), q(C.Belokan + 0.20, 'gagal', 0.20),
      sapu('Inti'), q(C.Inti + 0.15, 'pop', 0.20), q(C.Inti + 1.80, 'stempel', 0.32),
      q(C.Langkah1 + 0.05, 'impact', 0.16, 2), q(C.Langkah1 + 1.40, 'klik', 0.18),
      q(C.Langkah2 + 0.05, 'impact', 0.16, 3), q(C.Langkah2 + 3.40, 'tombol', 0.26), q(C.Langkah2 + 3.70, 'chime', 0.16),
      q(C.Langkah3 - 1.20, 'riser', 0.20), q(C.Langkah3 - 0.15, 'hisap', 0.20),
      q(C.Langkah3, 'impact', 0.42), q(C.Langkah3 + 0.02, 'sub', 0.32),
      q(C.Langkah3 + 2.40, 'ding', 0.22), q(C.Langkah3 + 2.70, 'stempel', 0.28),
      q(C.CTA + 0.05, 'impact', 0.16, 3), q(C.CTA + 0.50, 'tombol', 0.26), q(C.CTA + 3.20, 'hisap', 0.16),
    ];
  },

  musik: [{
    nama: 'bgm',
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'quiet intro', 'fade in', 'sparse'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const inti = ['upbeat energetic tech instrumental', '126 BPM', 'punchy', 'steady and continuous', 'always present'];
      return [
        b(0, C.Belokan, '[energy]', [...inti, 'curious playful groove from the first beat', 'bright synth stabs', 'crisp claps']),
        b(C.Belokan, C.Inti, '[tension]', [...inti, 'tense', 'darker synth', 'tight groove']),
        b(C.Inti, C.Langkah3, '[build]', [...inti, 'building', 'rising motif']),
        b(C.Langkah3, total, '[peak]', [...inti, 'bright triumphant', 'full groove']),
        b(total, total + 6, '[tail]', [...inti, 'bright groove continues']),
      ];
    },
    // Bed −29, bukan −27: pada −27 selisih VO hanya +19,7 dB. Ambang cek adalah +20.
    // Turunan tukikan dilebarkan supaya loncatan 11 dB dalam 0,05 dtk tidak terdengar bolong.
    titik: [['Hook', 0, -29], ['Langkah3', -0.70, -29], ['Langkah3', -0.25, -38], ['Langkah3', 0.15, -38],
      ['Langkah3', 0.55, -29], ['CTA', 0, -29]],
    fadeOut: ({total}) => [total - 0.3, 0.3],
  }],

  sampul: {gambar: {'9x16': 'aset/sampul-9x16.png', '4x5': 'aset/sampul-4x5.png'}, mulai: 0, ms: 100},
  mixer: {gainVO: 1.60, gainSFX: 0.95, duckMusik: {th: 0.015, ratio: 12, attack: 20, release: 300}},
  periksa: {busTitik: [1, 10, 20]},
};
