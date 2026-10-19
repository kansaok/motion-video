// Seri tanpa VO "Angka Hari Ini" ep 1 — 1.000 balasan WhatsApp Resmi per nomor per bulan, pesan ke-1.001 Rp356,65.
// Sumber: rate card IDR Meta berlaku 1 Okt 2026 (konektor/server/assets/ai-chat-playbooks/id/biaya-whatsapp-official.md).
// Aturan seri (riset 4 Okt 2026): satu ide, ±25 dtk, kartu ≤7 kata, safe zone Meta, SFX tetap per arti
// (sapu = kartu baru, gagal = masalah, ding = hasil). Ditulis tanpa Claude Design, struktur dari konektor-ss-1.
export default {
  nama: 'konektor-ahi-1',
  komposisi: 'Konektor AHI1 9x16.dc.html',
  jugaTulis: ['Konektor AHI1 4x5.dc.html'],
  jsx: 'ahi1-video.jsx',
  kapsi: false,
  keluaran: 'konektor-ahi-1-9x16.mp4',

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
      // Hook: 1.000 slam, kartu, keterangan
      q(C.Hook + 0.00, 'impact', 0.30, 2), q(C.Hook + 0.60, 'sapu', 0.20), q(C.Hook + 1.60, 'tik', 0.18),
      // Lewat: pertanyaan, lalu harga dengan buzz
      q(C.Lewat + 0.10, 'sapu', 0.20, 2), q(C.Lewat + 1.75, 'hisap', 0.18), q(C.Lewat + 1.80, 'impact', 0.26, -2), q(C.Lewat + 1.85, 'gagal', 0.22),
      // Isotype: ikon muncul beruntun, 20 jadi merah, legenda
      q(C.Isotype + 0.10, 'sapu', 0.18, 3),
      ...Array.from({length: 30}, (_, i) => q(C.Isotype + 0.8 + i * 0.08, 'pop', 0.08, i % 6, ((i % 6) - 2.5) * 0.12)),
      q(C.Isotype + 3.80, 'gagal', 0.20, 2), q(C.Isotype + 5.00, 'ding', 0.20),
      // Arti: satu-satunya hentakan besar
      q(C.Arti - 1.20, 'riser', 0.22), q(C.Arti - 0.20, 'hisap', 0.20),
      q(C.Arti, 'impact', 0.42), q(C.Arti + 0.02, 'sub', 0.34), q(C.Arti + 1.40, 'stempel', 0.32), q(C.Arti + 3.00, 'sapu', 0.16, 4),
      // CTA dan loop
      q(C.CTA + 0.00, 'impact', 0.18, 4), q(C.CTA + 0.40, 'sapu', 0.18), q(C.CTA + 1.60, 'tombol', 0.28), q(C.CTA + 2.00, 'chime', 0.18), q(C.CTA + 4.00, 'hisap', 0.18),
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
        b(0, C.Isotype, '[curious]', [...inti, 'curious bouncy plucks', 'crisp claps', 'driving from the first beat']),
        b(C.Isotype, C.Arti, '[counting]', [...inti, 'ticking hats', 'rising tension', 'building']),
        b(C.Arti, total, '[peak]', [...inti, 'bright triumphant', 'full groove']),
        b(total, total + 6, '[tail]', [...inti, 'bright groove continues']),
      ];
    },
    // Tanpa VO, BGM samar (Rama, 5 Okt 2026): bed -23 dB, tukikan sekali sebelum Arti.
    titik: [['Hook', 0, -23], ['Arti', -0.45, -23], ['Arti', -0.40, -34], ['Arti', 0.00, -34],
      ['Arti', 0.05, -22], ['CTA', 0, -23]],
    fadeOut: ({total}) => [total - 0.3, 0.3],
  }],

  sampul: {gambar: {'9x16': 'aset/sampul-9x16.png', '4x5': 'aset/sampul-4x5.png'}, mulai: 0, ms: 100},
  mixer: {gainVO: 1.0, gainSFX: 0.95},
  periksa: {busTitik: [1, 8, 16]},
};
