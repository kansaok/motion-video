// Konektor hari 7 — tur dashboard buat yang baru pertama buka: lorong pintu, cuma satu panel yang menyala. HABIS mode BANTAH.
// 9:16 utama, 4:5 untuk LinkedIn. Tanpa 16:9. Dibuat tanpa Claude Design (komponen ditulis langsung, struktur Hari 6).
// Fakta yang boleh diklaim: naskah.md. Satu baris VO = satu kapsi (12 baris). Visual utama = gambar gpt-image-2.5 di src/img/.

export default {
  nama: 'konektor-hari-7',
  komposisi: 'Konektor Hari7 9x16.dc.html',
  jugaTulis: ['Konektor Hari7 4x5.dc.html'],
  jsx: 'hari7-video.jsx',
  kapsi: true,
  keluaran: 'konektor-hari-7-9x16.mp4',

  // Suara DIKUNCI: preset C (Rama, 2 Okt 2026), speed 0.98 (3 Okt 2026). Sama untuk semua baris.
  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  lafal: {},

  vo: [
    {no: 1,  sc: 'Hook',     off: 0.05, dengar: /konektor|connector/i, coba: 4, text: 'Jangan klik semua menu Konektor!'},
    {no: 2,  sc: 'Hook',     off: 2.50, text: 'Cukup satu panel ini.'},
    {no: 3,  sc: 'Celah',    off: 0.05, text: 'Kamu langsung tahu mulai dari mana.'},
    {no: 4,  sc: 'Peta',     off: 0.10, text: 'Sidebar Konektor punya enam grup menu.'},
    {no: 5,  sc: 'Peta',     off: 2.80, text: 'Ringkasan, Percakapan, AI Wulan, Pelacakan dan Iklan, Link dan Domain, Koneksi.'},
    {no: 6,  sc: 'Belokan',  off: 0.10, text: 'Tapi kalau dibuka semua sekaligus, kamu malah bingung!'},
    {no: 7,  sc: 'Inti',     off: 0.10, text: 'Jadi, aktifkan satu hal dulu, baru yang lain.'},
    {no: 8,  sc: 'Langkah1', off: 0.10, text: 'Satu, buka Ringkasan, lalu Dashboard.'},
    {no: 9,  sc: 'Langkah2', off: 0.10, text: 'Dua, di panel Aktifkan satu hal dulu, pilih satu tujuan.'},
    {no: 10, sc: 'Langkah3', off: 0.20, text: 'Tiga, kerjakan kartunya, lalu tekan Periksa lagi. Selesai!'},
    {no: 11, sc: 'CTA',      off: 0.10, text: 'Coba gratis di konektor dot id.'},
    {no: 12, sc: 'CTA',      off: 2.20, text: 'Soalnya pas pertama buka dashboard,'},
  ],

  // Jeda antarbaris 0.25 dtk. CTA tanpa ekor panjang: kalimat terakhir menggantung lalu loop ke frame pertama.
  tata: {mode: 'jangkar', jeda: 0.25, ekorBiasa: 0.35, ekor: {CTA: 0.5}},

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
      // Hook: SEMUA MENU bergetar, garis bawah merah, lalu panel menyala
      q(C.Hook + 0.30, 'klik', 0.22), q(C.Hook + 1.00, 'gagal', 0.14, 3), q(C.Hook + 2.45, 'hisap', 0.18), q(C.Hook + 2.50, 'impact', 0.22, 3),
      // Celah
      sapu('Celah'), q(C.Celah + 0.20, 'pop', 0.24), q(C.Celah + 1.10, 'stempel', 0.30),
      // Peta: 6 GRUP MENU, lalu satu pop per grup
      sapu('Peta', 2), q(C.Peta + 0.30, 'impact', 0.18, 4),
      ...[2.8, 3.55, 4.35, 5.05, 6.45, 7.6].map((d, i) => q(C.Peta + d, 'pop', 0.18, i)),
      // Belokan: satu-satunya "tapi", chip berhamburan
      q(C.Belokan + 0.00, 'impact', 0.30, -3), q(C.Belokan + 0.40, 'gagal', 0.20), q(C.Belokan + 0.15, 'hisap', 0.16),
      // Inti
      sapu('Inti'), q(C.Inti + 0.20, 'pop', 0.22), q(C.Inti + 2.00, 'stempel', 0.34),
      // Langkah
      q(C.Langkah1 + 0.00, 'impact', 0.18, 2), q(C.Langkah1 + 0.70, 'klik', 0.20), q(C.Langkah1 + 1.60, 'tik', 0.16),
      q(C.Langkah2 + 0.00, 'impact', 0.18, 4), q(C.Langkah2 + 2.90, 'tombol', 0.26), q(C.Langkah2 + 3.20, 'chime', 0.18),
      // Langkah3: satu-satunya hentakan besar, dilapis empat
      q(C.Langkah3 - 1.30, 'riser', 0.22), q(C.Langkah3 - 0.20, 'hisap', 0.22),
      q(C.Langkah3, 'impact', 0.42), q(C.Langkah3 + 0.02, 'sub', 0.34),
      q(C.Langkah3 + 3.10, 'tombol', 0.26), q(C.Langkah3 + 4.30, 'ding', 0.22), q(C.Langkah3 + 4.60, 'chime', 0.20),
      // CTA dan loop
      q(C.CTA + 0.00, 'impact', 0.18, 3), q(C.CTA + 0.40, 'tombol', 0.28), q(C.CTA + 3.40, 'hisap', 0.18),
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
    // BGM samar (Rama, 5 Okt 2026): bed -27 dB, tukikan -38 dB sebelum puncak, VO harus >= +20 dB di atas musik.
    titik: [['Hook', 0, -27], ['Langkah3', -0.45, -27], ['Langkah3', -0.40, -38], ['Langkah3', 0.00, -38],
      ['Langkah3', 0.05, -26], ['CTA', 0, -27]],
    fadeOut: ({total}) => [total - 0.3, 0.3],
  }],

  // Sampul C3 (bin/sampul) ditempel 100 ms pertama: jadi frame 0 di semua platform.
  sampul: {gambar: {'9x16': 'aset/sampul-9x16.png', '4x5': 'aset/sampul-4x5.png'}, mulai: 0, ms: 100},
  mixer: {gainVO: 1.60, gainSFX: 0.95, duckMusik: {th: 0.015, ratio: 12, attack: 20, release: 300}},
  periksa: {busTitik: [1, 10, 20]},
};
