// Konektor hari 4 — fbclid, gclid, ttclid: kode = tiket. HABIS mode BANTAH.
// 9:16 utama, 16:9 dan 4:5 ikut. Fakta yang boleh diklaim: naskah.md. Satu baris VO = satu
// kapsi (13 baris). Visual utama = gambar gpt-image-2.5 di src/img/ (aset/img/ aslinya).

export default {
  nama: 'konektor-hari-4',
  komposisi: 'Konektor Hari4 9x16.dc.html',
  jugaTulis: ['Konektor Hari4 16x9.dc.html', 'Konektor Hari4 4x5.dc.html'],
  jsx: 'hari4-video.jsx',
  kapsi: true,
  keluaran: 'konektor-hari-4-9x16.mp4',

  // Suara DIKUNCI: preset C (Rama, 2 Okt 2026). Tempo 15% lebih pelan (Rama, 3 Okt 2026):
  // speed 1.15 -> 0.98. Sama untuk semua baris.
  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  lafal: {},

  vo: [
    {no: 1,  sc: 'Hook',     off: 0.05, text: 'Kode aneh di belakang link iklan ini, jangan dihapus!'},
    {no: 2,  sc: 'Hook',     off: 3.40, text: 'Itu tiket yang nunjukin iklan mana yang bawa pembeli.'},
    {no: 3,  sc: 'Celah',    off: 0.10, text: 'Satu tempat paling sering bikin tiket ini hilang. Jawabannya di akhir.'},
    {no: 4,  sc: 'Tiket',    off: 0.10, dengar: /\bd[iy]\b|clid|i\s*d\b/i, coba: 4, text: 'Klik dari Facebook atau Instagram, bawa fbclid.'},
    {no: 5,  sc: 'Tiket',    off: 6.30, dengar: /\bd[iy]\b|clid|i\s*d\b/i, coba: 4, text: 'Dari Google, bawa gclid. Dari TikTok, ttclid.'},
    {no: 6,  sc: 'Jalan',    off: 0.10, text: 'Tiket ini dikirim balik bareng data pembelian. Iklan jadi tahu klik mana yang closing.'},
    {no: 7,  sc: 'Belokan',  off: 0.10, text: 'Tapi tiketnya gampang hilang!'},
    {no: 8,  sc: 'Inti',     off: 0.10, text: 'Jadi, kode itu bukan sampah. Itu bukti iklan mana yang jualan.'},
    {no: 9,  sc: 'Langkah1', off: 0.10, text: 'Satu, biarkan kodenya di link. Jangan dipotong.'},
    {no: 10, sc: 'Langkah2', off: 0.10, dengar: /konektor|connector/i, coba: 4, text: 'Dua, pasang tracking Konektor, biar tiketnya disimpan begitu orang masuk.'},
    {no: 11, sc: 'Langkah3', off: 0.20, text: 'Tiga, cek redirect kamu. Di situ tiket paling sering hilang!'},
    {no: 12, sc: 'CTA',      off: 0.10, text: 'Coba gratis di konektor dot id.'},
    {no: 13, sc: 'CTA',      off: 2.40, text: 'Ingat, kode aneh di belakang link iklan,'},
  ],

  // Jeda antarbaris lebih lega (0.25 dtk) supaya tidak terburu-buru. CTA tanpa ekor panjang:
  // kalimat terakhir menggantung dan video loop ke frame pertama.
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
    ['kirim',   '@stok/dm-kirim'],
  ],

  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0, pan = 0) => ({at, nama, gain, nada, pan});
    const sapu = (sc, nada = 0) => q(C[sc] - 0.10, 'sapu', 0.14, nada);
    return [
      // Hook: kursor menyorot kode, stempel STOP, cut ke tiket
      q(C.Hook + 0.40, 'klik', 0.22), q(C.Hook + 1.40, 'stempel', 0.32), q(C.Hook + 1.45, 'gagal', 0.14, 3),
      q(C.Hook + 3.30, 'hisap', 0.18), q(C.Hook + 3.40, 'impact', 0.20, 3), q(C.Hook + 4.60, 'pop', 0.22, 4),
      // Celah
      sapu('Celah'), q(C.Celah + 0.20, 'pop', 0.24), q(C.Celah + 1.40, 'tik', 0.14, 3),
      // Tiket: tiga label muncul
      sapu('Tiket', 2), q(C.Tiket + 0.80, 'pop', 0.22, 0, -0.3), q(C.Tiket + 6.40, 'pop', 0.22, 3), q(C.Tiket + 8.90, 'pop', 0.22, 6, 0.3),
      // Jalan: tiket terbang
      sapu('Jalan', -2), q(C.Jalan + 0.40, 'kirim', 0.24), q(C.Jalan + 3.20, 'ding', 0.18),
      // Belokan: satu-satunya "tapi", layar merah
      q(C.Belokan + 0.00, 'impact', 0.30, -3), q(C.Belokan + 0.30, 'gagal', 0.20), q(C.Belokan + 1.00, 'pop', 0.20, -2),
      // Inti
      sapu('Inti'), q(C.Inti + 0.20, 'pop', 0.22), q(C.Inti + 2.00, 'stempel', 0.34),
      // Langkah
      q(C.Langkah1 + 0.00, 'impact', 0.18, 2), q(C.Langkah1 + 1.20, 'tik', 0.14),
      q(C.Langkah2 + 0.00, 'impact', 0.18, 4), q(C.Langkah2 + 1.40, 'tombol', 0.26), q(C.Langkah2 + 2.60, 'chime', 0.18),
      // Langkah3: satu-satunya hentakan besar, dilapis empat
      q(C.Langkah3 - 1.30, 'riser', 0.22), q(C.Langkah3 - 0.20, 'hisap', 0.22),
      q(C.Langkah3, 'impact', 0.42), q(C.Langkah3 + 0.02, 'sub', 0.34),
      q(C.Langkah3 + 1.40, 'gagal', 0.14, 3), q(C.Langkah3 + 2.60, 'ding', 0.22), q(C.Langkah3 + 2.90, 'chime', 0.20),
      // CTA dan loop
      q(C.CTA + 0.00, 'impact', 0.18, 3), q(C.CTA + 0.40, 'tombol', 0.28), q(C.CTA + 3.60, 'hisap', 0.18),
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
        b(C.Belokan, C.Langkah1, '[tension]', [...inti, 'tense', 'darker synth', 'tight groove']),
        b(C.Langkah1, C.Langkah3, '[build]', [...inti, 'building', 'rising motif']),
        b(C.Langkah3, total, '[peak]', [...inti, 'bright triumphant', 'full groove']),
        b(total, total + 6, '[tail]', [...inti, 'bright groove continues']),
      ];
    },
    // Musik dijaga pelan: bed -17 dB, VO harus >= +12 dB di atas musik.
    titik: [['Hook', 0, -17], ['Langkah3', -0.45, -17], ['Langkah3', -0.40, -28], ['Langkah3', 0.00, -28],
      ['Langkah3', 0.05, -16], ['CTA', 0, -17]],
    fadeOut: ({total}) => [total - 0.3, 0.3],
  }],

  // Sampul C3 (bin/sampul) ditempel 100 ms pertama: jadi frame 0 di semua platform.
  sampul: {gambar: {'9x16': 'aset/sampul-9x16.png', '16x9': 'aset/sampul-16x9.png', '4x5': 'aset/sampul-4x5.png'}, mulai: 0, ms: 100},
  mixer: {gainVO: 1.60, gainSFX: 0.95, duckMusik: {th: 0.015, ratio: 12, attack: 20, release: 300}},
  periksa: {busTitik: [1, 10, 20]},
};
