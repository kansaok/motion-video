// abaya-iklan — ARUNIKA "Abaya Kupu Kristal". Film fashion 9:16 dari 8 foto hasil generate
// (gambar.mjs, satu foto produk sebagai referensi) + komposisi Claude Design. Demo: motion
// bukan cuma animasi penuh. Merek ARUNIKA fiktif.
// Suara Citra (14,0 kar/dtk pada speed 1,0): lembut dan mengundang, cocok untuk fashion.

export default {
  nama: 'abaya-iklan',
  komposisi: 'Abaya Kupu Kristal.dc.html',
  jsx: 'arunika-film.jsx',
  kapsi: true,
  keluaran: 'arunika-abaya-kupu-kristal-9x16.mp4',

  // Fashion mewah: tenang dan intim, bukan energik. Style sedang, stability rendah supaya tetap hidup.
  suara: {id: 'RbNgJzKAV7jpYJNtCBpj', seed: 20261003, speed: 1.0, stability: 0.32, similarity: 0.8, style: 0.45},
  lafal: {lilac: 'lailak'},

  vo: [
    {no: 1, sc: 'Hook',       off: 0.15, text: 'Hitam, tapi tidak pernah biasa.'},
    {no: 2, sc: 'Kupu',       off: 0.25, text: 'Kupu-kupu kristal di dada,'},
    {no: 3, sc: 'Detail',     off: 0.10, text: 'kilau di sepanjang tepinya, dan manset lilac yang lembut.'},
    {no: 4, sc: 'Perjalanan', off: 0.30, text: 'Dari pagi di lobi, sampai senja di gurun.'},
    // Baris 5 mulai SESUDAH hentakan (U+0.98), supaya pukulan dan suara tidak bertabrakan.
    {no: 5, sc: 'Putar',      off: 1.05, text: 'Jatuhnya mengalir, di setiap langkah.'},
    {no: 6, sc: 'Sampul',     off: 0.40, text: 'Arunika.'},
    {no: 7, sc: 'CTA',        off: 0.10, text: 'Abaya Kupu Kristal.'},
    // CTA: kalimat terakhir, kata VO = teks tombol, intonasi lebih kuat.
    {no: 8, sc: 'CTA',        off: 1.40, text: 'Chat untuk pesan, sekarang!', style: 0.95, stability: 0.05, dengar: /chat untuk pesan/i},
  ],

  tata: {mode: 'jangkar', jeda: 0.12, ekorBiasa: 0.25, ekor: {CTA: 0.6}},

  sfx: [
    ['kilau',   '@stok/10-shine'],
    ['ting',    '@stok/09-chime'],
    ['sapu',    '@stok/sapu'],
    ['kain',    '@stok/flag-whoosh'],
    ['jepret',  '@stok/camera-shutter'],
    ['stempel', '@stok/09-stamp'],
    ['halaman', '@stok/page-flip'],
    ['riser',   '@stok/riser-long'],
    ['hisap',   '@stok/whoosh-rev'],
    ['impact',  '@stok/impact-hit'],
    ['sub',     '@stok/sub-drop'],
    ['kepak', 1.2, 'Delicate butterfly wings fluttering past the microphone, soft rapid feathery flaps with a tiny glassy crystal tinkle, close and dry, one shot, no music'],
  ],

  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0, pan = 0) => ({at, nama, gain, nada, pan});
    const K = C.Kupu, D = C.Detail, P = C.Perjalanan, U = C.Putar, S = C.Sampul, A = C.CTA;
    return [
      // Hook: kilau berjalan di garis kristal, kerlip kecil berganti nada
      q(0.02, 'kilau', 0.16), q(0.65, 'ting', 0.08, 7, 0.2), q(1.45, 'ting', 0.07, 12, -0.15), q(2.10, 'ting', 0.07, 9, 0.1),
      // Kupu: potong seperti jepretan foto, bros menyala, kupu-kupu lepas dan terbang
      q(K + 0.00, 'jepret', 0.20), q(K + 0.85, 'kilau', 0.22, 2), q(K + 1.15, 'ting', 0.14, 5),
      q(K + 1.40, 'kepak', 0.26, 0, 0.2), q(K + 2.10, 'kepak', 0.18, 2, -0.3),
      // Sapuan sayap kiri -> kanan ke lengan, tiga callout naik nadanya
      q(D - 0.35, 'sapu', 0.12, 0, -0.5), q(D - 0.30, 'kepak', 0.22, 1, -0.4),
      q(D + 0.50, 'ting', 0.12, 0, -0.3), q(D + 1.40, 'ting', 0.12, 3, 0.3), q(D + 2.30, 'ting', 0.12, 7, -0.3),
      // Perjalanan: tiga sapuan, tiga cap paspor, angin gurun
      q(P - 0.35, 'sapu', 0.12, 2), q(P - 0.30, 'kepak', 0.22, 0),
      q(P + 0.25, 'stempel', 0.26, 0, 0.25),
      q(P + 1.65, 'kain', 0.22, 0, -0.4), q(P + 1.70, 'kepak', 0.18, 2, -0.5),
      q(P + 2.20, 'stempel', 0.26, -2, 0.1),
      q(P + 3.65, 'sapu', 0.12, 4, 0.5), q(P + 3.70, 'kepak', 0.20, 3, 0.5),
      q(P + 4.20, 'stempel', 0.26, 2, -0.35),
      // Putar: SATU hentakan besar, dilapis empat, di saat "mengalir." mendarat dan kilat radial
      q(U - 0.30, 'kain', 0.24), q(U + 0.98 - 1.3, 'riser', 0.22), q(U + 0.78, 'hisap', 0.22),
      q(U + 0.98, 'impact', 0.40), q(U + 1.00, 'sub', 0.32), q(U + 1.05, 'kilau', 0.18, 4),
      // Sampul: halaman majalah dibalik, kupu-kupu masuk lagi
      q(S + 0.00, 'halaman', 0.30), q(S + 0.45, 'kepak', 0.14, 4, 0.5), q(S + 0.75, 'jepret', 0.14, 2),
      // CTA: sapuan bawah -> atas, tombol muncul, kupu-kupu hinggap
      q(A - 0.35, 'sapu', 0.12, 5), q(A - 0.30, 'kepak', 0.22, 2),
      q(A + 0.75, 'ting', 0.12, 0), q(A + 1.55, 'kilau', 0.20, 5, 0.25), q(A + 1.60, 'ting', 0.14, 12, 0.25),
    ];
  },

  musik: [{
    nama: 'bgm',
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'quiet intro', 'fade in', 'sparse'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const inti = ['luxury fashion runway instrumental', '110 BPM', 'elegant and glossy', 'light crisp percussion', 'steady and continuous', 'always present'];
      return [
        b(0, C.Perjalanan, '[intro groove]', [...inti, 'silky groove from the very first beat', 'warm plucked harp arpeggio', 'soft finger snaps', 'warm pad']),
        b(C.Perjalanan, C.Putar, '[build]', [...inti, 'rising', 'glossy strings joining', 'shimmering arpeggio']),
        b(C.Putar, total, '[peak]', [...inti, 'full lush groove', 'sweeping strings', 'confident']),
        b(total, total + 6, '[tail]', [...inti, 'groove continues']),
      ];
    },
    // Satu tukikan sebelum hentakan (U+0.98), sesudahnya musik naik sedikit untuk montase akhir.
    // Bed -22: pada -20 VO cuma +7,3 dB di atas musik (suara Citra lembut).
    titik: [['Hook', 0, -22], ['Putar', 0.50, -22], ['Putar', 0.58, -31], ['Putar', 0.93, -31], ['Putar', 0.98, -20], ['Sampul', 0.5, -22], ['CTA', 0, -22]],
    fadeOut: ({total}) => [total - 0.4, 0.4],
  }],

  sampul: {detik: 0.8},
  // Titik A/B bus SFX jatuh di celah VO: kepak (Kupu), cap ROOFTOP, hentakan Putar.
  periksa: {busTitik: [5.3, 14.95, 17.7]},
  mixer: {gainVO: 1.75, gainSFX: 0.95, duckMusik: {th: 0.015, ratio: 14, attack: 25, release: 320}},
};
