// Konektor — tarif WhatsApp resmi mulai 1 Oktober 2026. 9:16 utama, 16:9 dan 4:5 ikut.
// Fakta yang boleh diklaim (rate card IDR resmi Meta) dan checklist: naskah.md.
// Satu baris VO = satu kapsi di src/waba-video.jsx (13 baris). Cue = detik dari awal scene,
// sama dengan komentar `// SFX:` di jsx.

export default {
  nama: 'konektor-waba-1okt',
  komposisi: 'Konektor WABA 9x16.dc.html',
  jugaTulis: ['Konektor WABA 16x9.dc.html', 'Konektor WABA 4x5.dc.html'],
  jsx: 'waba-video.jsx',
  kapsi: true,
  keluaran: 'konektor-waba-1okt-9x16.mp4',

  // Suara DIKUNCI untuk semua konten Konektor.
  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 1.1, stability: 0.5, similarity: 0.8, style: 0.3},
  lafal: {},

  vo: [
    {no: 1,  sc: 'Hook',     off: 0.10, text: 'Mulai hari ini, balasan WhatsApp resmi yang ke seribu satu kena tiga ratus lima puluh enam rupiah.'},
    {no: 2,  sc: 'Kuota',    off: 0.10, text: 'Seribu balasan pertama per nomor, tiap bulan, masih gratis.'},
    {no: 3,  sc: 'Lewat',    off: 0.10, text: 'Lewat dari itu, tiap balasan ditagih.'},
    {no: 4,  sc: 'Lewat',    off: 2.40, text: 'Tapi ada satu cara biar tetap gratis.'},
    {no: 5,  sc: 'Contoh',   off: 0.10, text: 'Misalnya CS kamu balas tiga ribu chat sebulan dari satu nomor.'},
    {no: 6,  sc: 'Hitung',   off: 0.10, text: 'Dua ribu kelebihannya, kali tiga ratus lima puluh enam.'},
    {no: 7,  sc: 'Hitung',   off: 2.90, text: 'Sekitar tujuh ratus tiga belas ribu rupiah sebulan.'},
    {no: 8,  sc: 'Utility',  off: 0.10, text: 'Template utility, kayak info pengiriman, sekarang juga bayar, walau di dalam dua puluh empat jam.'},
    {no: 9,  sc: 'Gratis',   off: 0.20, text: 'Caranya: chat dari iklan Click to WhatsApp bisa gratis hingga tujuh hari,'},
    {no: 10, sc: 'Gratis',   off: 3.10, text: 'asal kamu balas dalam dua puluh empat jam.'},
    {no: 11, sc: 'Konektor', off: 0.10, dengar: /konektor|connector/i, coba: 4, text: 'Konektor bantu lacak chat mana yang datang dari iklan, sampai closing-nya.'},
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
    ['koin',    '@stok/kasir-struk'],
    ['stempel', '@stok/09-stamp'],
    ['riser',   '@stok/riser-long'],
    ['hisap',   '@stok/whoosh-rev'],
    ['impact',  '@stok/impact-hit'],
    ['sub',     '@stok/sub-drop'],
    ['chime',   '@stok/chime-send'],
    ['pop',     '@stok/pop-thick'],
  ],

  cue: ({C, total}) => {
    const q = (at, nama, gain, nada = 0, pan = 0) => ({at, nama, gain, nada, pan});
    const sapu = (sc, nada = 0) => q(C[sc] - 0.10, 'sapu', 0.12, nada);
    const tik = [0.3, 0.75, 1.2, 1.65, 2.1, 2.5].map((d, i) => q(C.Kuota + d, 'tik', 0.14, i, -0.2));
    const koin = [0, 1, 2, 3, 4].map((i) => q(C.Lewat + 1.4 + i * 0.18, 'koin', 0.16, i, i % 2 ? 0.3 : -0.3));
    return [
      q(C.Hook + 0.35, 'klik', 0.26, 0, -0.3),
      q(C.Hook + 0.70, 'klik', 0.28, 3, 0.3),
      sapu('Kuota'), ...tik,
      sapu('Lewat', 2), q(C.Lewat + 0.30, 'gagal', 0.18), ...koin,
      sapu('Contoh', -2), q(C.Contoh + 0.40, 'pop', 0.22),
      sapu('Hitung', 3), q(C.Hitung + 3.60, 'stempel', 0.36),
      sapu('Utility', -2), q(C.Utility + 1.30, 'klik', 0.26),
      // Gratis: satu-satunya hentakan besar, dilapis empat
      q(C.Gratis - 1.30, 'riser', 0.22),
      q(C.Gratis - 0.20, 'hisap', 0.22),
      q(C.Gratis, 'impact', 0.42),
      q(C.Gratis + 0.02, 'sub', 0.34),
      sapu('Konektor', 4), q(C.Konektor + 0.40, 'chime', 0.22),
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
      const inti = ['modern news-style tech instrumental', '118 BPM', 'steady and continuous', 'always present'];
      return [
        b(0, C.Gratis, '[urgent]', [...inti, 'urgent and tight', 'ticking pulse', 'tense synth stabs', 'driving']),
        b(C.Gratis, C.CTA, '[relief]', [...inti, 'relieved bright confident', 'full groove', 'hopeful lead']),
        b(C.CTA, total, '[end]', [...inti, 'calm resolve', 'lighter groove']),
        b(total, total + 6, '[tail]', [...inti, 'calm resolve continues']),
      ];
    },
    titik: [['Hook', 0, -12], ['Gratis', -0.45, -12], ['Gratis', -0.40, -26], ['Gratis', 0.00, -26],
      ['Gratis', 0.05, -12], ['CTA', 0, -15]],
    fadeOut: ({total}) => [total - 0.6, 0.6],
  }],

  sampul: {detik: 0},
  mixer: {gainVO: 1.60, gainSFX: 0.95, duckMusik: {th: 0.015, ratio: 8, attack: 25, release: 320}},
  periksa: {busTitik: [1, 10, 20]},
};
