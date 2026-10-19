// Konektor hari 1 — "Ads Manager bilang 100 chat. Kasir cuma catat 3." Shorts 9:16 + feed 4:5.
// Naskah, fakta yang boleh diklaim, dan checklist: naskah.md. Komposisi dari Claude Design
// 2dd7cf17 (logo asli dari kode Konektor). Semua cue ditulis sebagai detik dari awal scene,
// sama dengan komentar `// SFX:` di src/konektor-video.jsx.

export default {
  nama: 'konektor-hari-1',
  komposisi: 'Konektor Shorts 9x16.dc.html',
  jugaTulis: ['Konektor Feed 4x5.dc.html'],   // timing identik, satu jsx
  jsx: 'konektor-video.jsx',
  kapsi: true,
  keluaran: 'konektor-hari-1-9x16.mp4',

  // Suara DIKUNCI untuk semua konten Konektor (Rama, 30 Sep 2026): satu id, satu seed, satu
  // set parameter untuk semua baris. Jangan ubah per baris; ubah kalimatnya kalau jelek.
  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 1.1, stability: 0.5, similarity: 0.8, style: 0.3},
  lafal: {},

  vo: [
    {no: 1,  sc: 'Hook',    off: 0.10, text: 'Ads Manager bilang seratus chat. Kasir cuma catat tiga.'},
    {no: 2,  sc: 'Meta',    off: 0.10, text: 'Dan Meta nggak tahu bedanya.'},
    {no: 3,  sc: 'Sama',    off: 0.10, text: 'Buat Meta, yang cuma nanya "ready kak?" sama nilainya dengan yang transfer.'},
    {no: 4,  sc: 'Nyari',   off: 0.10, text: 'Jadi iklan kamu terus nyari orang yang suka nanya.'},
    {no: 5,  sc: 'Hilang',  off: 0.10, text: 'Padahal ada satu data yang nggak pernah Meta terima.'},
    {no: 6,  sc: 'Closing', off: 0.30, text: 'Siapa yang beneran closing.'},
    {no: 7,  sc: 'Won',     off: 0.10, dengar: /won|status lead/i, coba: 4, text: 'Di Konektor, CS cukup ganti status lead jadi Won.'},
    {no: 8,  sc: 'Kirim',   off: 0.10, text: 'Konektor kirim Purchase ke Meta, lengkap sama nominalnya.'},
    {no: 9,  sc: 'Belajar', off: 0.10, text: 'Sekarang iklan belajar dari pembeli, bukan dari penanya.'},
    {no: 10, sc: 'CTA',     off: 0.15, dengar: /konektor/i, coba: 4, text: 'Coba gratis di konektor dot id.'},
  ],

  tata: {mode: 'jangkar', jeda: 0.12, ekorBiasa: 0.30, ekor: {CTA: 1.4}},

  sfx: [
    ['sapu',   '@stok/sapu'],
    ['klik',   '@stok/click-soft'],
    ['tombol', '@stok/btn-click'],
    ['tik',    '@stok/05-tick'],
    ['gagal',  '@stok/buzz'],
    ['stempel','@stok/09-stamp'],
    ['pop',    '@stok/pop-thick'],
    ['chat',   '@stok/chat-pop'],
    ['riser',  '@stok/riser-long'],
    ['hisap',  '@stok/whoosh-rev'],
    ['impact', '@stok/impact-hit'],
    ['sub',    '@stok/sub-drop'],
    ['kirim',  '@stok/dm-kirim'],
    ['chime',  '@stok/chime-send'],
  ],

  cue: ({C, total}) => {
    const q = (at, nama, gain, nada = 0, pan = 0) => ({at, nama, gain, nada, pan});
    const sapu = (sc, nada = 0) => q(C[sc] - 0.10, 'sapu', 0.12, nada);
    const tik = [0.8, 1.1, 1.4, 1.7, 2.0, 2.3].map((d, i) => q(C.Hook + d, 'tik', 0.14, i, -0.3));
    return [
      // Hook: dua kartu mendarat, angka 100 naik
      q(C.Hook + 0.35, 'klik', 0.26, 0, -0.3),
      q(C.Hook + 0.70, 'klik', 0.26, 3, 0.3),
      ...tik,
      // Meta: logo goyang, tanda tanya
      sapu('Meta'),
      q(C.Meta + 0.60, 'gagal', 0.18),
      // Sama: dua cap "1 CHAT"
      sapu('Sama', 2),
      q(C.Sama + 2.40, 'stempel', 0.34, 0, -0.3),
      q(C.Sama + 2.80, 'stempel', 0.34, 2, 0.3),
      // Nyari: gelembung tanda tanya bertambah
      sapu('Nyari', -2),
      q(C.Nyari + 0.70, 'chat', 0.22, 0, -0.2),
      q(C.Nyari + 1.05, 'chat', 0.22, 2, 0.3),
      q(C.Nyari + 1.40, 'chat', 0.22, 4, -0.1),
      q(C.Nyari + 1.75, 'chat', 0.22, 6, 0.3),
      // Hilang: kotak kosong
      sapu('Hilang', 3),
      q(C.Hilang + 0.50, 'pop', 0.22, -2),
      // Closing: satu-satunya hentakan besar, dilapis empat
      q(C.Closing - 1.30, 'riser', 0.22),
      q(C.Closing - 0.20, 'hisap', 0.22),
      q(C.Closing, 'impact', 0.42),
      q(C.Closing + 0.02, 'sub', 0.34),
      // Won: buka dropdown, pilih Won
      sapu('Won', 2),
      q(C.Won + 1.40, 'klik', 0.26),
      q(C.Won + 2.35, 'tombol', 0.30),
      // Kirim: chip terbang ke Meta
      sapu('Kirim', 4),
      q(C.Kirim + 1.20, 'kirim', 0.30),
      q(C.Kirim + 2.00, 'chime', 0.24),
      // Belajar: panah berbelok
      sapu('Belajar', -2),
      q(C.Belajar + 1.00, 'pop', 0.24, 5),
      // CTA: logo, tombol berdenyut
      sapu('CTA', 5),
      q(C.CTA + 0.05, 'pop', 0.30),
      q(C.CTA + 1.00, 'tombol', 0.32),
      q(total - 1.2, 'chime', 0.20),
    ];
  },

  musik: [{
    nama: 'bgm',
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'quiet intro', 'fade in', 'sparse'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const inti = ['minimal modern tech instrumental', '115 BPM', 'steady and continuous', 'always present'];
      return [
        b(0, C.Closing, '[tense]', [...inti, 'tense and low', 'dark pulsing synth bass', 'muted plucks', 'curious']),
        b(C.Closing, C.CTA, '[lift]', [...inti, 'bright confident', 'full groove', 'hopeful lead', 'crisp hi-hats']),
        b(C.CTA, total, '[end]', [...inti, 'calm resolve', 'lighter groove']),
        b(total, total + 6, '[tail]', [...inti, 'calm resolve continues']),
      ];
    },
    // Tukikan 0,4 dtk sebelum hentakan Closing (komentar BGM di jsx).
    titik: [['Hook', 0, -12], ['Closing', -0.45, -12], ['Closing', -0.40, -26], ['Closing', 0.00, -26],
      ['Closing', 0.05, -13], ['CTA', 0, -16]],
    fadeOut: ({total}) => [total - 0.6, 0.6],
  }],

  sampul: {detik: 0},
  mixer: {gainVO: 1.60, gainSFX: 0.95, duckMusik: {th: 0.015, ratio: 8, attack: 25, release: 320}},
  periksa: {busTitik: [1, 10, 20]},
};
