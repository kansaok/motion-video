// Seri tanpa VO "Sebelum / Sesudah" ep 2 — chat iklan tanpa sumber vs lead sumber ads.
// vo kosong, kapsi false. BGM -23 dB, tukikan -34 dB sebelum Banding.
export default {
  nama: 'konektor-ss-2',
  komposisi: 'Konektor SS2 9x16.dc.html',
  jugaTulis: ['Konektor SS2 4x5.dc.html'],
  jsx: 'ss2-video.jsx',
  kapsi: false,
  keluaran: 'konektor-ss-2-9x16.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  lafal: {},
  vo: [],
  tata: {mode: 'jangkar', jeda: 0.15, ekorBiasa: 0.2},

  sfx: [
    ['sapu',    '@stok/sapu'],
    ['gagal',   '@stok/buzz'],
    ['pop',     '@stok/pop-thick'],
    ['ding',    '@stok/notif-ding'],
    ['impact',  '@stok/impact-hit'],
    ['sub',     '@stok/sub-drop'],
    ['riser',   '@stok/riser-long'],
    ['hisap',   '@stok/whoosh-rev'],
    ['tombol',  '@stok/btn-click'],
    ['chime',   '@stok/chime-send'],
    ['stempel', '@stok/09-stamp'],
  ],

  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0, pan = 0) => ({at, nama, gain, nada, pan});
    return [
      q(C.Hook + 0.00, 'impact', 0.30, 2), q(C.Hook + 0.35, 'sapu', 0.18),
      q(C.Sebelum - 0.08, 'sapu', 0.20), q(C.Sebelum + 0.30, 'pop', 0.20),
      q(C.Sebelum + 4.00, 'sapu', 0.16, 3), q(C.Sebelum + 4.15, 'gagal', 0.22),
      q(C.Sesudah - 0.05, 'hisap', 0.22), q(C.Sesudah + 0.30, 'impact', 0.24, 4), q(C.Sesudah + 1.10, 'stempel', 0.30),
      q(C.Sesudah + 4.00, 'sapu', 0.16, 5), q(C.Sesudah + 4.20, 'ding', 0.22),
      q(C.Banding - 1.15, 'riser', 0.22), q(C.Banding - 0.15, 'hisap', 0.20),
      q(C.Banding, 'impact', 0.42), q(C.Banding + 0.02, 'sub', 0.34), q(C.Banding + 2.15, 'chime', 0.22),
      q(C.CTA + 0.00, 'sapu', 0.18), q(C.CTA + 1.45, 'tombol', 0.28), q(C.CTA + 3.4, 'hisap', 0.16),
    ];
  },

  musik: [{
    nama: 'bgm',
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'quiet intro', 'fade in', 'sparse'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const inti = ['catchy upbeat tech instrumental', '124 BPM', 'clear steady beat for cuts', 'steady and continuous', 'always present'];
      return [
        b(0, C.Sesudah, '[tension]', [...inti, 'busy anxious plucks', 'ticking hats', 'slightly tense', 'driving from the first beat']),
        b(C.Sesudah, C.Banding, '[relief]', [...inti, 'bright and organized', 'clean marimba motif', 'confident']),
        b(C.Banding, total, '[peak]', [...inti, 'bright triumphant', 'full groove']),
        b(total, total + 6, '[tail]', [...inti, 'bright groove continues']),
      ];
    },
    // Tukikan -34 dB tetap, datarannya <0,35 dtk supaya cek lubang (median -8 dB, min 0,35 dtk) lulus.
    titik: [['Hook', 0, -23], ['Banding', -0.22, -23], ['Banding', -0.10, -34], ['Banding', 0.02, -34],
      ['Banding', 0.14, -23], ['CTA', 0, -23]],
    fadeOut: ({total}) => [total - 0.3, 0.3],
  }],

  sampul: {gambar: {'9x16': 'aset/sampul-9x16.png', '4x5': 'aset/sampul-4x5.png'}, mulai: 0, ms: 100},
  mixer: {gainVO: 1.0, gainSFX: 0.95},
  periksa: {busTitik: [1, 8, 16]},
};
