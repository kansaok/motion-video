// Konektor hari 2 — LPWA vs CTWA. 9:16 utama, 16:9 dan 4:5 ikut.
// Naskah dan fakta yang boleh diklaim: naskah.md. Satu baris VO = satu kapsi (13 baris).
// Cue = detik dari awal scene, sama dengan komentar `// SFX:` di src/hari2-video.jsx.

export default {
  nama: 'konektor-hari-2',
  komposisi: 'Konektor Hari2 9x16.dc.html',
  jugaTulis: ['Konektor Hari2 16x9.dc.html', 'Konektor Hari2 4x5.dc.html'],
  jsx: 'hari2-video.jsx',
  kapsi: true,
  keluaran: 'konektor-hari-2-9x16.mp4',

  // Suara DIKUNCI untuk semua konten Konektor.
  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 1.1, stability: 0.5, similarity: 0.8, style: 0.3},
  lafal: {},

  vo: [
    {no: 1,  sc: 'Hook',     off: 0.10, text: 'Iklan ke web dan iklan langsung ke WhatsApp, bawa ID klik yang beda.'},
    {no: 2,  sc: 'Putus',    off: 0.10, text: 'Salah pasang, data closing kamu nggak pernah sampai ke Meta.'},
    {no: 3,  sc: 'Putus',    off: 2.60, text: 'Putusnya di mana?'},
    {no: 4,  sc: 'LPWA',     off: 0.10, text: 'L P W A: iklan buka landing page dulu, baru tombol WhatsApp.'},
    {no: 5,  sc: 'Fbclid',   off: 0.10, text: 'Jejak kliknya namanya F B klid, dibaca pixel di browser.'},
    {no: 6,  sc: 'Putus1',   off: 0.10, text: 'Tapi begitu orang pindah ke WhatsApp, pixel nggak bisa lihat closing-nya.'},
    {no: 7,  sc: 'CTWA',     off: 0.10, text: 'C T W A: iklan langsung buka chat WhatsApp.'},
    {no: 8,  sc: 'Ctwaclid', off: 0.10, text: 'Meta nitip ID klik, namanya C T W A klid, di webhook pesan.'},
    {no: 9,  sc: 'Ctwaclid', off: 3.20, text: 'Cuma kebaca lewat WhatsApp API, bukan aplikasi WhatsApp Business biasa.'},
    {no: 10, sc: 'Jalur',    off: 0.10, text: 'Closing-nya juga dikirim beda: sebagai business messaging, bukan event website.'},
    {no: 11, sc: 'Konektor', off: 0.20, dengar: /konektor|connector/i, coba: 4, text: 'Konektor nyambungin dua-duanya, lalu kirim closing ke Meta lewat jalur yang benar.'},
    {no: 12, sc: 'CTA',      off: 0.10, text: 'Simpan video ini.'},
    {no: 13, sc: 'CTA',      off: 1.30, text: 'Coba gratis di konektor dot id.'},
  ],

  tata: {mode: 'jangkar', jeda: 0.12, ekorBiasa: 0.30, ekor: {CTA: 1.2}},

  sfx: [
    ['sapu',    '@stok/sapu'],
    ['klik',    '@stok/click-soft'],
    ['tombol',  '@stok/btn-click'],
    ['tik',     '@stok/05-tick'],
    ['gagal',   '@stok/buzz'],
    ['pop',     '@stok/pop-thick'],
    ['chat',    '@stok/chat-pop'],
    ['riser',   '@stok/riser-long'],
    ['hisap',   '@stok/whoosh-rev'],
    ['impact',  '@stok/impact-hit'],
    ['sub',     '@stok/sub-drop'],
    ['chime',   '@stok/chime-send'],
    ['stempel', '@stok/09-stamp'],
  ],

  cue: ({C, total}) => {
    const q = (at, nama, gain, nada = 0, pan = 0) => ({at, nama, gain, nada, pan});
    const sapu = (sc, nada = 0) => q(C[sc] - 0.10, 'sapu', 0.12, nada);
    return [
      q(C.Hook + 0.30, 'klik', 0.26, 0, -0.3), q(C.Hook + 0.55, 'klik', 0.26, 3, 0.3),
      q(C.Hook + 1.40, 'tik', 0.16, 0, -0.3), q(C.Hook + 1.70, 'tik', 0.16, 2, 0.3),
      sapu('Putus'), q(C.Putus + 1.20, 'gagal', 0.18),
      sapu('LPWA', 2), q(C.LPWA + 0.40, 'pop', 0.22, 0, -0.3), q(C.LPWA + 1.10, 'pop', 0.22, 2), q(C.LPWA + 1.80, 'pop', 0.22, 4, 0.3),
      sapu('Fbclid', -2), q(C.Fbclid + 0.60, 'sapu', 0.16, 3),
      sapu('Putus1'), q(C.Putus1 + 1.80, 'gagal', 0.18),
      sapu('CTWA', 3), q(C.CTWA + 0.30, 'pop', 0.22), q(C.CTWA + 0.80, 'sapu', 0.16, 5),
      sapu('Ctwaclid', -2), q(C.Ctwaclid + 1.00, 'stempel', 0.30), q(C.Ctwaclid + 3.60, 'chime', 0.20), q(C.Ctwaclid + 4.30, 'gagal', 0.14, -2),
      sapu('Jalur', 2), q(C.Jalur + 0.50, 'klik', 0.24, 0, -0.3), q(C.Jalur + 1.60, 'klik', 0.24, 3, 0.3),
      // Konektor: satu-satunya hentakan besar, dilapis empat
      q(C.Konektor - 1.30, 'riser', 0.22), q(C.Konektor - 0.20, 'hisap', 0.22),
      q(C.Konektor, 'impact', 0.42), q(C.Konektor + 0.02, 'sub', 0.34),
      q(C.Konektor + 2.40, 'chime', 0.22),
      sapu('CTA', 5), q(C.CTA + 0.80, 'klik', 0.24), q(C.CTA + 1.60, 'tombol', 0.30),
      q(total - 1.0, 'chime', 0.20),
    ];
  },

  musik: [{
    nama: 'bgm',
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'quiet intro', 'fade in', 'sparse'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const inti = ['modern educational tech instrumental', '112 BPM', 'steady and continuous', 'always present'];
      return [
        b(0, C.CTWA, '[curious]', [...inti, 'curious and light', 'plucky motif', 'soft pulse']),
        b(C.CTWA, C.Konektor, '[tension]', [...inti, 'light tension', 'motif grows', 'driving hats']),
        b(C.Konektor, C.CTA, '[bright]', [...inti, 'bright confident', 'full groove', 'hopeful lead']),
        b(C.CTA, total, '[end]', [...inti, 'calm resolve', 'lighter groove']),
        b(total, total + 6, '[tail]', [...inti, 'calm resolve continues']),
      ];
    },
    titik: [['Hook', 0, -12], ['Konektor', -0.45, -12], ['Konektor', -0.40, -26], ['Konektor', 0.00, -26],
      ['Konektor', 0.05, -12], ['CTA', 0, -15]],
    fadeOut: ({total}) => [total - 0.6, 0.6],
  }],

  sampul: {detik: 0},
  mixer: {gainVO: 1.60, gainSFX: 0.95, duckMusik: {th: 0.015, ratio: 8, attack: 25, release: 320}},
  periksa: {busTitik: [1, 10, 20]},
};
