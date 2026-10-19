// Konektor hari 11 — skor EMQ naik ke 7 kalau email dan nomor ikut terkirim. HABIS mode SYARAT.
// 9:16 utama, 4:5 untuk LinkedIn. Tanpa 16:9. Tanpa Claude Design, struktur hari 7 lewat hari 10.
// Fakta: content/docs.id/platform-guides/meta-emq.md. Label: lead_form Email, wa_sessions Nomor Telepon.
export default {
  nama: 'konektor-hari-11',
  komposisi: 'Konektor Hari11 9x16.dc.html',
  jugaTulis: ['Konektor Hari11 4x5.dc.html'],
  jsx: 'hari11-video.jsx',
  kapsi: true,
  keluaran: 'konektor-hari-11-9x16.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  lafal: {},

  vo: [
    {no: 1,  sc: 'Hook',     off: 0.05, text: 'Skor EMQ naik ke 7!'},
    {no: 2,  sc: 'Hook',     off: 2.35, text: 'Kecuali email dan nomor kosong.'},
    {no: 3,  sc: 'Celah',    off: 0.05, text: 'Meta cocokkan hash.'},
    {no: 4,  sc: 'Bukti',    off: 0.08, text: 'Kolomnya, Event Match Quality.'},
    {no: 5,  sc: 'Bukti',    off: 2.55, text: 'Skor 7 sampai 10 itu Good.'},
    {no: 6,  sc: 'Belokan',  off: 0.08, text: 'Tapi tanpa Email dan Nomor Telepon, skornya Poor!'},
    {no: 7,  sc: 'Inti',     off: 0.08, text: 'Jadi, kirim email dan nomor, skornya naik.'},
    {no: 8,  sc: 'Langkah1', off: 0.08, text: 'Satu, minta Email dan Nomor Telepon.'},
    {no: 9,  sc: 'Langkah2', off: 0.08, text: 'Dua, nomor pakai kode negara, 628.'},
    {no: 10, sc: 'Langkah3', off: 0.15, text: 'Tiga, cek kolom Event Match Quality!'},
    {no: 11, sc: 'CTA',      off: 0.08, text: 'Coba gratis di konektor dot id.'},
    {no: 12, sc: 'CTA',      off: 2.30, text: 'Soalnya skor EMQ naik'},
  ],

  tata: {mode: 'jangkar', jeda: 0.25, ekorBiasa: 0.35, ekor: {CTA: 0.55, Celah: 0.2}},

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
      q(C.Hook + 2.30, 'hisap', 0.16), q(C.Hook + 2.40, 'gagal', 0.16, 2),
      sapu('Celah'), q(C.Celah + 0.15, 'pop', 0.22), q(C.Celah + 0.90, 'ding', 0.16),
      sapu('Bukti', 1), q(C.Bukti + 0.20, 'pop', 0.18), q(C.Bukti + 2.55, 'tik', 0.16),
      q(C.Belokan + 0.00, 'impact', 0.30, -3), q(C.Belokan + 0.20, 'gagal', 0.20),
      sapu('Inti'), q(C.Inti + 0.15, 'pop', 0.20), q(C.Inti + 1.70, 'stempel', 0.32),
      q(C.Langkah1 + 0.05, 'impact', 0.16, 2), q(C.Langkah1 + 1.40, 'klik', 0.18),
      q(C.Langkah2 + 0.05, 'impact', 0.16, 3), q(C.Langkah2 + 1.80, 'tik', 0.16),
      q(C.Langkah3 - 1.20, 'riser', 0.20), q(C.Langkah3 - 0.15, 'hisap', 0.20),
      q(C.Langkah3, 'impact', 0.42), q(C.Langkah3 + 0.02, 'sub', 0.32),
      q(C.Langkah3 + 0.90, 'tombol', 0.26), q(C.Langkah3 + 1.80, 'ding', 0.22), q(C.Langkah3 + 2.10, 'stempel', 0.28),
      q(C.CTA + 0.05, 'impact', 0.16, 3), q(C.CTA + 0.50, 'tombol', 0.26), q(C.CTA + 3.10, 'hisap', 0.16),
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
    titik: [['Hook', 0, -27], ['Langkah3', -0.70, -27], ['Langkah3', -0.22, -38], ['Langkah3', -0.08, -38],
      ['Langkah3', 0.06, -27], ['CTA', 0, -27]],
    fadeOut: ({total}) => [total - 0.3, 0.3],
  }],

  sampul: {gambar: {'9x16': 'aset/sampul-9x16.png', '4x5': 'aset/sampul-4x5.png'}, mulai: 0, ms: 100},
  mixer: {gainVO: 1.60, gainSFX: 0.95, duckMusik: {th: 0.015, ratio: 12, attack: 20, release: 300}},
  periksa: {busTitik: [1, 10, 20]},
};
