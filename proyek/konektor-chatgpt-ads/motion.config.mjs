// Konektor — ChatGPT Ads tracking (rilis fitur 2 Okt 2026). Framework HABIS mode SYARAT.
// 9:16 utama, 16:9 dan 4:5 ikut. Fakta yang boleh diklaim: naskah.md. Satu baris VO = satu
// kapsi (15 baris). Cue = detik dari awal scene, sama dengan `// SFX:` di src/chatgpt-ads-video.jsx.
// alurAt / tokAt di jsx adalah offset dari awal scene, jadi aman saat scene melar.

export default {
  nama: 'konektor-chatgpt-ads',
  komposisi: 'Konektor ChatGPTAds 9x16.dc.html',
  jugaTulis: ['Konektor ChatGPTAds 16x9.dc.html', 'Konektor ChatGPTAds 4x5.dc.html'],
  jsx: 'chatgpt-ads-video.jsx',
  kapsi: true,
  keluaran: 'konektor-chatgpt-ads-9x16.mp4',

  // Suara DIKUNCI untuk semua konten Konektor.
  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 1.1, stability: 0.5, similarity: 0.8, style: 0.3},
  lafal: {},

  vo: [
    {no: 1,  sc: 'Hook',     off: 0.10, text: 'ChatGPT nggak tahu siapa yang beli dari iklan kamu.'},
    {no: 2,  sc: 'Masuk',    off: 0.10, text: 'Iklan di ChatGPT sudah masuk Indonesia sejak dua puluh tiga September.'},
    {no: 3,  sc: 'Celah',    off: 0.10, text: 'Dan Konektor sudah bisa kirim closing-nya balik.'},
    {no: 4,  sc: 'Celah',    off: 2.30, text: 'Langkah ketiga paling sering kelewat.'},
    {no: 5,  sc: 'Alur',     off: 0.10, text: 'Orang nanya ke ChatGPT, lihat iklan kamu, klik, masuk landing page, lalu chat WhatsApp.'},
    {no: 6,  sc: 'Lead',     off: 0.10, dengar: /konektor|connector/i, coba: 4, text: 'Konektor menyimpan jejak klik itu di setiap lead.'},
    {no: 7,  sc: 'Belokan',  off: 0.10, text: 'Tapi klik itu belum uang.'},
    {no: 8,  sc: 'Belokan',  off: 2.00, text: 'Uangnya datang saat closing, di chat.'},
    {no: 9,  sc: 'Inti',     off: 0.10, text: 'Jadi, nilai iklan dari closing, bukan dari klik.'},
    {no: 10, sc: 'Langkah1', off: 0.10, text: 'Satu, hubungkan ChatGPT Ads di Konektor.'},
    {no: 11, sc: 'Langkah2', off: 0.10, text: 'Dua, pasang link iklan dari template Konektor.'},
    {no: 12, sc: 'Langkah3', off: 0.20, text: 'Tiga, tandai lead yang closing.'},
    {no: 13, sc: 'Langkah3', off: 2.00, text: 'Konektor kirim hasilnya ke ChatGPT Ads.'},
    {no: 14, sc: 'CTA',      off: 0.10, text: 'Coba gratis di konektor dot id.'},
    {no: 15, sc: 'CTA',      off: 1.80, text: 'Soalnya tanpa langkah tiga,'},
  ],

  // CTA tanpa ekor panjang: kalimat terakhir menggantung dan video loop ke frame pertama.
  tata: {mode: 'jangkar', jeda: 0.12, ekorBiasa: 0.30, ekor: {CTA: 0.5}},

  sfx: [
    ['sapu',    '@stok/sapu'],
    ['klik',    '@stok/click-soft'],
    ['tombol',  '@stok/btn-click'],
    ['tik',     '@stok/05-tick'],
    ['gagal',   '@stok/buzz'],
    ['pop',     '@stok/pop-thick'],
    ['stempel', '@stok/09-stamp'],
    ['riser',   '@stok/riser-long'],
    ['hisap',   '@stok/whoosh-rev'],
    ['impact',  '@stok/impact-hit'],
    ['sub',     '@stok/sub-drop'],
    ['chime',   '@stok/chime-send'],
    ['kirim',   '@stok/dm-kirim'],
  ],

  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0, pan = 0) => ({at, nama, gain, nada, pan});
    const sapu = (sc, nada = 0) => q(C[sc] - 0.10, 'sapu', 0.12, nada);
    return [
      q(C.Hook + 0.00, 'sapu', 0.16, 4), q(C.Hook + 1.20, 'tik', 0.16),
      sapu('Masuk'), q(C.Masuk + 0.35, 'impact', 0.20, 3),
      sapu('Celah', 2), q(C.Celah + 0.30, 'pop', 0.20, 0, -0.3), q(C.Celah + 0.60, 'pop', 0.20, 2), q(C.Celah + 0.90, 'pop', 0.22, 4, 0.3), q(C.Celah + 2.30, 'gagal', 0.16, 3),
      sapu('Alur', -2), ...[0.3, 1.0, 1.6, 2.3, 3.0].map((d, i) => q(C.Alur + d, 'tik', 0.14, i, i % 2 ? 0.3 : -0.3)),
      sapu('Lead', 3), q(C.Lead + 0.20, 'klik', 0.24), q(C.Lead + 1.90, 'stempel', 0.30),
      // Belokan: satu-satunya "tapi", ganti visual drastis
      q(C.Belokan + 0.00, 'hisap', 0.24), q(C.Belokan + 0.50, 'gagal', 0.18), q(C.Belokan + 2.70, 'stempel', 0.34),
      sapu('Inti', -2), q(C.Inti + 0.10, 'pop', 0.24), q(C.Inti + 0.50, 'pop', 0.24, 3), q(C.Inti + 1.10, 'pop', 0.26, 6),
      sapu('Langkah1', 2), q(C.Langkah1 + 0.70, 'klik', 0.24), q(C.Langkah1 + 1.90, 'tombol', 0.28), q(C.Langkah1 + 2.80, 'chime', 0.22),
      sapu('Langkah2', 4), ...[0.5, 0.85, 1.2, 1.55].map((d, i) => q(C.Langkah2 + d, 'tik', 0.14, i)), q(C.Langkah2 + 2.20, 'klik', 0.24),
      // Langkah3: satu-satunya hentakan besar, dilapis empat
      q(C.Langkah3 - 1.30, 'riser', 0.22), q(C.Langkah3 - 0.20, 'hisap', 0.22),
      q(C.Langkah3, 'impact', 0.42), q(C.Langkah3 + 0.02, 'sub', 0.34),
      q(C.Langkah3 + 0.90, 'klik', 0.24), q(C.Langkah3 + 1.40, 'kirim', 0.28), q(C.Langkah3 + 2.25, 'chime', 0.24),
      sapu('CTA', 5), q(C.CTA + 0.20, 'tombol', 0.28), q(C.CTA + 2.40, 'sapu', 0.18, 6),
    ];
  },

  musik: [{
    nama: 'bgm',
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'quiet intro', 'fade in', 'sparse'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const inti = ['modern tech news instrumental', '124 BPM', 'steady and continuous', 'always present'];
      return [
        b(0, C.Belokan, '[breaking]', [...inti, 'energetic urgent', 'news sting energy', 'punchy synth stabs', 'driving hats']),
        b(C.Belokan, C.Langkah1, '[tension]', [...inti, 'tense', 'darker synth', 'tight groove']),
        b(C.Langkah1, C.Langkah3, '[build]', [...inti, 'building', 'rising motif', 'layer by layer']),
        b(C.Langkah3, total, '[peak]', [...inti, 'bright triumphant', 'full groove', 'hopeful lead']),
        b(total, total + 6, '[tail]', [...inti, 'bright groove continues']),
      ];
    },
    titik: [['Hook', 0, -12], ['Belokan', -0.45, -12], ['Belokan', -0.40, -24], ['Belokan', 0.00, -24],
      ['Belokan', 0.05, -12], ['CTA', 0, -13]],
    fadeOut: ({total}) => [total - 0.3, 0.3],
  }],

  sampul: {detik: 0},
  mixer: {gainVO: 1.60, gainSFX: 0.95, duckMusik: {th: 0.015, ratio: 8, attack: 25, release: 320}},
  periksa: {busTitik: [1, 10, 20]},
};
