// Seri tanpa VO "Sebelum / Sesudah" ep 1 — chat iklan numpuk di 1 HP vs dibagi ke 5 CS (Rotator).
// Aturan seri (riset 4 Okt 2026, konektor-ngonten/riset/2026-10-04-video-tanpa-vo.md): satu ide,
// ±25 dtk, kartu ≤7 kata tampil 1 dtk + 0,5 dtk/kata, safe zone Meta (atas 14%, bawah 35%, sisi 6%),
// SFX tetap per arti (sapu = kartu baru, gagal = masalah, ding = hasil), musik buatan sendiri.
export default {
  nama: 'konektor-ss-1',
  komposisi: 'Konektor SS1 9x16.dc.html',
  jugaTulis: ['Konektor SS1 4x5.dc.html'],
  jsx: 'ss1-video.jsx',
  kapsi: false,
  keluaran: 'konektor-ss-1-9x16.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  lafal: {},
  vo: [],
  tata: {mode: 'jangkar', jeda: 0.15, ekorBiasa: 0.2},

  sfx: [
    ['sapu',    '@stok/sapu'],
    ['chat',    '@stok/chat-pop'],
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
      // Hook: judul slam + chat berdatangan
      q(C.Hook + 0.00, 'impact', 0.30, 2), q(C.Hook + 0.40, 'chat', 0.22, 0, -0.3), q(C.Hook + 0.80, 'chat', 0.22, 2, 0.3), q(C.Hook + 1.20, 'chat', 0.22, 4),
      // Sebelum: chat terus menumpuk, satu buzz di "tenggelam"
      q(C.Sebelum - 0.10, 'sapu', 0.20), q(C.Sebelum + 0.30, 'stempel', 0.30),
      ...[0.9, 1.3, 1.6, 2.0, 2.3, 2.7, 3.0, 3.4].map((d, i) => q(C.Sebelum + d, 'chat', 0.16, i % 4, i % 2 ? 0.35 : -0.35)),
      q(C.Sebelum + 4.10, 'sapu', 0.16, 3), q(C.Sebelum + 4.30, 'gagal', 0.22),
      // Sesudah: satu link membelah, lima ding
      q(C.Sesudah - 0.10, 'hisap', 0.22), q(C.Sesudah + 0.20, 'impact', 0.26, 4), q(C.Sesudah + 0.30, 'stempel', 0.28),
      ...[1.0, 1.25, 1.5, 1.75, 2.0].map((d, i) => q(C.Sesudah + d, 'ding', 0.16, i * 2, (i - 2) * 0.25)),
      q(C.Sesudah + 4.10, 'sapu', 0.16, 5), q(C.Sesudah + 4.40, 'pop', 0.22, 5),
      // Banding: satu-satunya hentakan besar
      q(C.Banding - 1.20, 'riser', 0.22), q(C.Banding - 0.20, 'hisap', 0.20),
      q(C.Banding, 'impact', 0.42), q(C.Banding + 0.02, 'sub', 0.34), q(C.Banding + 0.60, 'gagal', 0.12, 3), q(C.Banding + 1.20, 'chime', 0.22),
      // CTA dan loop
      q(C.CTA + 0.00, 'sapu', 0.18), q(C.CTA + 0.50, 'tombol', 0.28), q(C.CTA + 2.20, 'pop', 0.20, 6), q(C.CTA + 3.80, 'hisap', 0.18),
    ];
  },

  musik: [{
    nama: 'bgm',
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'quiet intro', 'fade in', 'sparse'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const inti = ['catchy upbeat tech instrumental', '120 BPM', 'clear steady beat for cuts', 'steady and continuous', 'always present'];
      return [
        b(0, C.Sesudah, '[tension]', [...inti, 'busy anxious plucks', 'ticking hats', 'slightly tense', 'driving from the first beat']),
        b(C.Sesudah, C.Banding, '[relief]', [...inti, 'bright and organized', 'clean marimba motif', 'confident']),
        b(C.Banding, total, '[peak]', [...inti, 'bright triumphant', 'full groove']),
        b(total, total + 6, '[tail]', [...inti, 'bright groove continues']),
      ];
    },
    // Tanpa VO: musik adalah pembawa ritme. Bed lebih tinggi dari video ber-VO, tukikan sekali sebelum Banding.
    titik: [['Hook', 0, -13], ['Banding', -0.45, -13], ['Banding', -0.40, -24], ['Banding', 0.00, -24],
      ['Banding', 0.05, -12], ['CTA', 0, -13]],
    fadeOut: ({total}) => [total - 0.3, 0.3],
  }],

  sampul: {gambar: {'9x16': 'aset/sampul-9x16.png', '4x5': 'aset/sampul-4x5.png'}, mulai: 0, ms: 100},
  mixer: {gainVO: 1.0, gainSFX: 0.95},
  periksa: {busTitik: [1, 8, 16]},
};
