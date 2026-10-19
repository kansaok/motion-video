// Seri tanpa VO "Angka Hari Ini" ep 3 — autentikasi internasional Rp1.940,13 per pesan.
// Sumber: rate card IDR Meta 1 Okt 2026, playbook biaya-whatsapp-official.md.
// Contoh: 1.000 × Rp1.940,13 = Rp1.940.130. Autentikasi lokal Rp356,65. Tanpa pajak.
// vo kosong, kapsi false. BGM −23 dB, tukikan −34 dB. Struktur dari konektor-ahi-1 lewat ahi-2.
export default {
  nama: 'konektor-ahi-3',
  komposisi: 'Konektor AHI3 9x16.dc.html',
  jugaTulis: ['Konektor AHI3 4x5.dc.html'],
  jsx: 'ahi3-video.jsx',
  kapsi: false,
  keluaran: 'konektor-ahi-3-9x16.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  lafal: {},
  vo: [],
  tata: {mode: 'jangkar', jeda: 0.15, ekorBiasa: 0.2},

  sfx: [
    ['sapu',    '@stok/sapu'],
    ['tik',     '@stok/05-tick'],
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
      q(C.Hook + 0.00, 'impact', 0.30, 2), q(C.Hook + 0.55, 'sapu', 0.20), q(C.Hook + 1.70, 'tik', 0.18),
      q(C.Lewat + 0.10, 'sapu', 0.20, 2), q(C.Lewat + 1.70, 'hisap', 0.18), q(C.Lewat + 1.75, 'impact', 0.26, -2), q(C.Lewat + 1.80, 'gagal', 0.22),
      q(C.Isotype + 0.10, 'sapu', 0.18, 3),
      ...Array.from({length: 10}, (_, i) => q(C.Isotype + 0.7 + i * 0.12, 'pop', 0.10, i % 5, ((i % 5) - 2) * 0.12)),
      q(C.Isotype + 3.2, 'gagal', 0.18, 2), q(C.Isotype + 4.4, 'ding', 0.18),
      q(C.Arti - 1.10, 'riser', 0.22), q(C.Arti - 0.18, 'hisap', 0.20),
      q(C.Arti, 'impact', 0.42), q(C.Arti + 0.02, 'sub', 0.34), q(C.Arti + 1.45, 'stempel', 0.32), q(C.Arti + 3.1, 'sapu', 0.16, 4),
      q(C.CTA + 0.00, 'impact', 0.18, 4), q(C.CTA + 0.40, 'sapu', 0.18), q(C.CTA + 1.55, 'tombol', 0.28), q(C.CTA + 1.90, 'chime', 0.18), q(C.CTA + 3.8, 'hisap', 0.18),
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
        b(0, C.Isotype, '[curious]', [...inti, 'curious bouncy plucks', 'crisp claps', 'driving from the first beat']),
        b(C.Isotype, C.Arti, '[counting]', [...inti, 'ticking hats', 'rising tension', 'building']),
        b(C.Arti, total, '[peak]', [...inti, 'bright triumphant', 'full groove']),
        b(total, total + 6, '[tail]', [...inti, 'bright groove continues']),
      ];
    },
    titik: [['Hook', 0, -23], ['Arti', -0.12, -23], ['Arti', -0.02, -34], ['Arti', 0.08, -34],
      ['Arti', 0.18, -23], ['CTA', 0, -23]],
    fadeOut: ({total}) => [total - 0.3, 0.3],
  }],

  sampul: {gambar: {'9x16': 'aset/sampul-9x16.png', '4x5': 'aset/sampul-4x5.png'}, mulai: 0, ms: 100},
  mixer: {gainVO: 1.0, gainSFX: 0.95},
  periksa: {busTitik: [1, 8, 16]},
};
