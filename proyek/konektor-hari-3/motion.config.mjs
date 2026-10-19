// Konektor hari 3 — pasang tracking website tanpa programmer. HABIS mode BANTAH, energi tinggi.
// 9:16 utama, 16:9 dan 4:5 ikut. Fakta yang boleh diklaim: naskah.md. Satu baris VO = satu
// kapsi (12 baris). Cue = detik dari awal scene, sama dengan `// SFX:` di src/hari3-video.jsx.

export default {
  nama: 'konektor-hari-3',
  komposisi: 'Konektor Hari3 9x16.dc.html',
  jugaTulis: ['Konektor Hari3 16x9.dc.html', 'Konektor Hari3 4x5.dc.html'],
  jsx: 'hari3-video.jsx',
  kapsi: true,
  keluaran: 'konektor-hari-3-9x16.mp4',

  // Suara DIKUNCI: preset C hype (Rama, 2 Okt 2026). Sama untuk semua baris.
  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 1.15, stability: 0.25, similarity: 0.8, style: 0.85},
  lafal: {},

  vo: [
    {no: 1,  sc: 'Hook',     off: 0.05, text: 'Iklan tanpa tracking itu bakar uang!'},
    {no: 2,  sc: 'Hook',     off: 2.20, text: 'Dan pasangnya nggak perlu programmer.'},
    {no: 3,  sc: 'Celah',    off: 0.10, text: 'Ada satu tanda yang buktiin tracking kamu beneran jalan. Lihat di akhir!'},
    {no: 4,  sc: 'Salin',    off: 0.10, dengar: /konektor|connector/i, coba: 4, text: 'Buka Konektor. Tracking Website. Lihat Kode. Salin!'},
    {no: 5,  sc: 'Tempel',   off: 0.10, text: 'Tempel di header website. WordPress, Google Tag Manager, Shopify, semua bisa.'},
    {no: 6,  sc: 'Belokan',  off: 0.10, text: 'Tapi script kepasang belum tentu jalan!'},
    {no: 7,  sc: 'Inti',     off: 0.10, text: 'Jadi, tracking baru dianggap sah kalau event nyata sudah masuk.'},
    {no: 8,  sc: 'Langkah1', off: 0.10, text: 'Satu, buka website kamu di jendela incognito.'},
    {no: 9,  sc: 'Langkah2', off: 0.10, text: 'Dua, di dashboard, klik Periksa lagi.'},
    {no: 10, sc: 'Langkah3', off: 0.20, text: 'Tiga, cari tulisan Event terverifikasi. Itu tandanya!'},
    {no: 11, sc: 'CTA',      off: 0.10, text: 'Coba gratis di konektor dot id.'},
    {no: 12, sc: 'CTA',      off: 2.00, text: 'Soalnya iklan tanpa tracking,'},
  ],

  // CTA tanpa ekor panjang: kalimat terakhir menggantung dan video loop ke frame pertama.
  tata: {mode: 'jangkar', jeda: 0.10, ekorBiasa: 0.25, ekor: {CTA: 0.5}},

  sfx: [
    ['sapu',    '@stok/sapu'],
    ['klik',    '@stok/click-soft'],
    ['tombol',  '@stok/btn-click'],
    ['tik',     '@stok/05-tick'],
    ['gagal',   '@stok/buzz'],
    ['pop',     '@stok/pop-thick'],
    ['stempel', '@stok/09-stamp'],
    ['kasir',   '@stok/kasir-struk'],
    ['ding',    '@stok/notif-ding'],
    ['riser',   '@stok/riser-long'],
    ['hisap',   '@stok/whoosh-rev'],
    ['impact',  '@stok/impact-hit'],
    ['sub',     '@stok/sub-drop'],
    ['chime',   '@stok/chime-send'],
    ['kirim',   '@stok/dm-kirim'],
  ],

  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0, pan = 0) => ({at, nama, gain, nada, pan});
    const sapu = (sc, nada = 0) => q(C[sc] - 0.10, 'sapu', 0.14, nada);
    return [
      // Hook: api, uang terbakar, slam teks
      q(C.Hook + 0.00, 'hisap', 0.18), q(C.Hook + 0.60, 'kasir', 0.24), q(C.Hook + 1.00, 'impact', 0.22, 4),
      q(C.Hook + 2.20, 'impact', 0.24), q(C.Hook + 2.60, 'pop', 0.22, 3), q(C.Hook + 3.30, 'pop', 0.22, 6),
      // Celah
      q(C.Celah + 0.00, 'pop', 0.22), q(C.Celah + 0.90, 'stempel', 0.30), q(C.Celah + 1.70, 'sapu', 0.14, 5), q(C.Celah + 2.30, 'gagal', 0.14, 4),
      // Salin: cut cepat, klik, toast
      q(C.Salin + 0.00, 'impact', 0.18, 2), q(C.Salin + 0.80, 'sapu', 0.14), q(C.Salin + 1.10, 'klik', 0.24),
      q(C.Salin + 1.60, 'sapu', 0.14, 3), q(C.Salin + 2.00, 'klik', 0.24, 2), q(C.Salin + 2.70, 'sapu', 0.14, 5),
      q(C.Salin + 3.00, 'tombol', 0.28), q(C.Salin + 3.05, 'ding', 0.18),
      // Tempel: kode terbang, chip platform
      q(C.Tempel + 0.30, 'kirim', 0.24), q(C.Tempel + 0.90, 'impact', 0.20, 3),
      ...[1.8, 2.2, 2.6, 3.0].map((d, i) => q(C.Tempel + d, 'tik', 0.16, i * 2, i % 2 ? 0.3 : -0.3)),
      q(C.Tempel + 3.50, 'stempel', 0.30),
      // Belokan: satu-satunya "tapi", layar merah
      q(C.Belokan + 0.00, 'impact', 0.30, -3), q(C.Belokan + 0.80, 'gagal', 0.20), q(C.Belokan + 1.40, 'pop', 0.22, -2),
      // Inti
      q(C.Inti + 0.00, 'pop', 0.24), q(C.Inti + 1.00, 'stempel', 0.34),
      // Langkah
      q(C.Langkah1 + 0.00, 'impact', 0.18, 2), q(C.Langkah1 + 0.50, 'tik', 0.12), q(C.Langkah1 + 1.50, 'sapu', 0.16, 4), q(C.Langkah1 + 2.30, 'pop', 0.18, 5),
      q(C.Langkah2 + 0.00, 'impact', 0.18, 4), q(C.Langkah2 + 1.30, 'tombol', 0.28),
      // Langkah3: satu-satunya hentakan besar, dilapis empat
      q(C.Langkah3 - 1.30, 'riser', 0.22), q(C.Langkah3 - 0.20, 'hisap', 0.22),
      q(C.Langkah3, 'impact', 0.42), q(C.Langkah3 + 0.02, 'sub', 0.34),
      q(C.Langkah3 + 0.60, 'ding', 0.22), q(C.Langkah3 + 1.00, 'pop', 0.26, 5), q(C.Langkah3 + 1.20, 'chime', 0.22),
      // CTA dan loop
      q(C.CTA + 0.00, 'impact', 0.18, 3), q(C.CTA + 0.30, 'tombol', 0.28), q(C.CTA + 2.00, 'gagal', 0.12, 4), q(C.CTA + 3.30, 'hisap', 0.18),
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
        b(0, C.Belokan, '[energy]', [...inti, 'driving groove from the first beat', 'bright synth stabs', 'crisp claps']),
        b(C.Belokan, C.Langkah1, '[tension]', [...inti, 'tense', 'darker synth', 'tight groove']),
        b(C.Langkah1, C.Langkah3, '[build]', [...inti, 'building', 'rising motif']),
        b(C.Langkah3, total, '[peak]', [...inti, 'bright triumphant', 'full groove']),
        b(total, total + 6, '[tail]', [...inti, 'bright groove continues']),
      ];
    },
    // Musik dijaga pelan (Rama, 2 Okt 2026): bed -17 dB, VO harus >= +12 dB di atas musik.
    titik: [['Hook', 0, -17], ['Langkah3', -0.45, -17], ['Langkah3', -0.40, -28], ['Langkah3', 0.00, -28],
      ['Langkah3', 0.05, -16], ['CTA', 0, -17]],
    fadeOut: ({total}) => [total - 0.3, 0.3],
  }],

  // Sampul C3 (bin/sampul di konektor-ngonten) ditempel 100 ms pertama: jadi frame 0 di semua platform.
  sampul: {gambar: {'9x16': 'aset/sampul-9x16.png', '16x9': 'aset/sampul-16x9.png', '4x5': 'aset/sampul-4x5.png'}, mulai: 0, ms: 100},
  mixer: {gainVO: 1.60, gainSFX: 0.95, duckMusik: {th: 0.015, ratio: 12, attack: 20, release: 300}},
  periksa: {busTitik: [1, 10, 20]},
};
