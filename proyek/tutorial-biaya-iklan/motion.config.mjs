// Tutorial: Biaya Iklan, catat biaya dan lihat ROAS per platform. 16:9, 10 scenes, about 60 s.
// Same voice as the Konektor series (preset C). Structure follows tutorial-leads.
// All cues below are scene-relative (C.<Scene> + n) and follow the T_* schedule in biaya-iklan-tutorial.jsx.

export default {
  nama: 'tutorial-biaya-iklan',
  komposisi: 'Tutorial Biaya Iklan.dc.html',
  jsx: 'biaya-iklan-tutorial.jsx',
  kapsi: false,
  keluaran: 'tutorial-biaya-iklan.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  // ROAS must sound as one word, not as spelled letters (same choice as rd-roas-explainer).
  lafal: {ROAS: 'Roas'},

  vo: [
    {no: 1,  sc: 'Intro',  off: 0.40, text: 'Iklanmu untung atau rugi? Jangan tebak, hitung!'},
    {no: 2,  sc: 'Inti',   off: 0.40, text: 'Catat biaya iklan, Konektor bandingkan dengan nilai closing. Itulah ROAS.'},
    {no: 3,  sc: 'Buka',   off: 0.40, text: 'Buka Biaya Iklan, lalu klik Rekam Biaya Baru.'},
    {no: 4,  sc: 'Manual', off: 0.40, text: 'Pilih platform, misalnya TikTok Ads. Isi jumlah dalam rupiah, pilih tanggal, lalu simpan.'},
    {no: 5,  sc: 'Meta',   off: 0.40, text: 'Pakai Meta Ads? Nggak perlu ketik. Klik Kelola Koneksi, lalu Tambah Akun Baru.'},
    {no: 6,  sc: 'Sync',   off: 0.40, text: 'Klik Sinkronisasi Sekarang. Biaya tujuh hari terakhir masuk sendiri, lalu tiap hari.'},
    {no: 7,  sc: 'Tanda',  off: 0.40, text: 'Ikon awan berarti sinkron otomatis. Ikon pensil berarti input manual.'},
    {no: 8,  sc: 'Hasil',  off: 0.40, dengar: /terlihat|ter lihat/i, coba: 4, text: 'Buka Dashboard. ROAS per platform langsung terlihat!'},
    {no: 9,  sc: 'Tips',   off: 0.40, text: 'Angka beda dengan Meta? Sinkronkan lagi, lalu cek zona waktu workspace.'},
    {no: 10, sc: 'Outro',  off: 1.00, dengar: /konektor|connector/i, coba: 4, text: 'Catat biaya, lihat untungnya. Panduannya di konektor dot id.'},
  ],

  tata: {mode: 'jangkar', jeda: 0.25, ekorBiasa: 0.40},

  sfx: [
    ['pop', '@stok/pop-thick'],
    ['sapu', '@stok/sapu'],
    ['klik', '@stok/click-soft'],
    ['tombol', '@stok/btn-click'],
    ['salin', '@stok/copy-chime'],
    ['centang', '@stok/janji-ceklis'],
    ['chime', '@stok/success-chime'],
    ['jadi', '@stok/jadi-ding'],
    ['riser', '@stok/riser-long'],
    ['hisap', '@stok/whoosh-rev'],
    ['impact', '@stok/impact-hit'],
    ['sub', '@stok/sub-drop'],
  ],

  // Scene-relative cues, aligned with the T_* schedule in biaya-iklan-tutorial.jsx.
  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0) => ({at, nama, gain, nada});
    const klik = (t, n = 0) => q(t, 'klik', 0.18, n);
    const tombol = (t, n = 0) => q(t, 'tombol', 0.26, n);
    const ketik = (t0, jumlah, jarak) => Array.from({length: jumlah}, (_, i) => q(t0 + i * jarak, 'klik', 0.08, 1 + (i % 3)));
    // The one big hit: the ROAS card lands on "terlihat" (T_HIT = Hasil + 2.85).
    const HIT = C.Hasil + 2.85;
    return [
      // Intro: cover card, Untung and Rugi bumps (on the words), second headline
      q(C.Intro + 0.15, 'pop', 0.20),
      q(C.Intro + 1.25, 'pop', 0.14, 2), q(C.Intro + 1.9, 'pop', 0.14, 3),
      q(C.Intro + 2.6, 'sapu', 0.10), q(C.Intro + 2.65, 'pop', 0.14, 4), q(C.Intro + 4.7, 'sapu', 0.12),

      // Inti: Biaya iklan, Nilai closing, divide, equals, ROAS fills
      q(C.Inti + 0.75, 'pop', 0.18, 2), q(C.Inti + 1.2, 'pop', 0.08, 4),
      q(C.Inti + 3.55, 'pop', 0.18, 3), q(C.Inti + 3.95, 'pop', 0.08, 5),
      q(C.Inti + 3.8, 'pop', 0.12, 1), q(C.Inti + 4.4, 'pop', 0.12, 2),
      q(C.Inti + 4.55, 'pop', 0.16, 4), q(C.Inti + 4.6, 'chime', 0.10),
      q(C.Inti + 5.9, 'chime', 0.12), q(C.Inti + 5.95, 'pop', 0.08, 5),

      // Buka: window in, Analitik Iklan, Biaya Iklan, Rekam Biaya Baru
      q(C.Buka - 0.7, 'sapu', 0.12),
      klik(C.Buka + 0.8), q(C.Buka + 0.85, 'sapu', 0.08),
      klik(C.Buka + 1.55), q(C.Buka + 1.6, 'sapu', 0.12), q(C.Buka + 2.0, 'pop', 0.08, 2),
      tombol(C.Buka + 3.4), q(C.Buka + 3.5, 'sapu', 0.12),

      // Manual: TikTok card, amount, Kemarin, Rekam, Konfirmasi, toast, new row
      klik(C.Manual + 2.4), q(C.Manual + 2.45, 'pop', 0.10, 3),
      klik(C.Manual + 3.65, 1), ...ketik(C.Manual + 3.85, 6, 0.17),
      klik(C.Manual + 5.5, 2), q(C.Manual + 5.55, 'pop', 0.08, 3),
      tombol(C.Manual + 6.4), q(C.Manual + 6.55, 'pop', 0.12, 2),
      tombol(C.Manual + 7.4, -1), q(C.Manual + 7.5, 'centang', 0.14, 1), q(C.Manual + 7.55, 'chime', 0.12),
      q(C.Manual + 7.65, 'pop', 0.10, 2), q(C.Manual + 9.0, 'sapu', 0.08),

      // Meta: bumper, Kelola Koneksi, tab Meta Ads, Tambah Akun Baru, menu, cut, card pops after the cut
      q(C.Meta + 0.6, 'sapu', 0.10), q(C.Meta + 0.65, 'pop', 0.20, 1), q(C.Meta + 2.9, 'sapu', 0.08),
      tombol(C.Meta + 3.55), q(C.Meta + 3.65, 'sapu', 0.12),
      klik(C.Meta + 4.45), q(C.Meta + 4.5, 'pop', 0.08, 2),
      klik(C.Meta + 5.25, 1), q(C.Meta + 5.3, 'pop', 0.10, 3),
      klik(C.Meta + 5.85, 2), q(C.Meta + 5.9, 'sapu', 0.16), q(C.Meta + 6.1, 'pop', 0.12, 2),

      // Sync: Sinkronisasi Sekarang, toast, last sync, close, seven rows, daily chip
      tombol(C.Sync + 1.4), q(C.Sync + 1.5, 'chime', 0.10), q(C.Sync + 1.95, 'pop', 0.08, 4),
      tombol(C.Sync + 2.55, -1), q(C.Sync + 2.6, 'sapu', 0.10),
      ...Array.from({length: 7}, (_, i) => q(C.Sync + 2.8 + i * 0.27, 'pop', 0.08, 1 + (i % 5))),
      q(C.Sync + 4.9, 'pop', 0.10, 3), q(C.Sync + 4.95, 'chime', 0.08),

      // Tanda: cloud tooltip, pencil tooltip
      q(C.Tanda + 0.0, 'sapu', 0.10),
      q(C.Tanda + 0.95, 'pop', 0.12, 3), q(C.Tanda + 1.0, 'chime', 0.08),
      q(C.Tanda + 3.0, 'sapu', 0.08), q(C.Tanda + 3.95, 'pop', 0.12, 2), q(C.Tanda + 4.0, 'chime', 0.08),
      q(C.Tanda + 6.5, 'sapu', 0.10),

      // Hasil: Dashboard click, ROAS rows, one big hit on "terlihat", Untung and Rugi tags
      klik(C.Hasil + 0.95), q(C.Hasil + 1.0, 'sapu', 0.12),
      q(C.Hasil + 1.9, 'pop', 0.12, 3), q(C.Hasil + 2.4, 'pop', 0.12, 4),
      q(HIT - 0.85, 'riser', 0.22), q(HIT - 0.15, 'hisap', 0.20),
      q(HIT, 'impact', 0.42), q(HIT + 0.02, 'sub', 0.32),
      q(HIT + 0.5, 'centang', 0.16, 3), q(HIT + 0.55, 'pop', 0.10, 2), q(HIT + 0.65, 'jadi', 0.14), q(HIT + 0.85, 'pop', 0.10, 3),
      q(C.Hasil + 5.0, 'sapu', 0.10),

      // Tips: card, Sinkronisasi Sekarang, Zona Waktu
      q(C.Tips - 0.1, 'sapu', 0.12), q(C.Tips + 0.25, 'pop', 0.16, 2),
      tombol(C.Tips + 2.45), q(C.Tips + 2.8, 'centang', 0.14, 1), q(C.Tips + 2.85, 'pop', 0.10, 2),
      q(C.Tips + 3.9, 'pop', 0.10, 3), q(C.Tips + 4.2, 'centang', 0.14, 3), q(C.Tips + 4.25, 'chime', 0.10),

      q(C.Outro + 0.9, 'sapu', 0.12), q(C.Outro + 1.0, 'pop', 0.22),
    ];
  },

  musik: [{
    nama: 'bgm',
    // Music reused from tutorial-banyak-cs (74 s, 112 BPM). The ElevenLabs music quota is empty.
    luar: true,
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'words', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'quiet intro', 'fade in', 'sparse'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const dasar = ['clean modern product-demo instrumental', '112 BPM', 'steady and continuous', 'always present',
        'light shaker', 'soft pluck', 'no vocals'];
      return [
        b(0, C.Manual, '[focus]', [...dasar, 'focused groove from the very first beat', 'warm and clear']),
        b(C.Manual, C.Hasil, '[flow]', [...dasar, 'a little fuller', 'soft arpeggio', 'forward motion']),
        b(C.Hasil, total, '[lift]', [...dasar, 'brighter', 'open', 'same groove']),
        b(total, total + 8, '[tail]', [...dasar, 'brighter groove continues']),
      ];
    },
    // Bed -27 dB. One dip to -36 dB just before the hit (Hasil + 2.85), then back to -27.
    titik: [
      ['Intro', 0, -27],
      ['Hasil', 2.65, -27], ['Hasil', 2.75, -36], ['Hasil', 2.97, -27],
      ['Outro', 0, -27],
    ],
    fadeOut: ({total}) => [total - 0.35, 0.35],
  }],

  sampul: {detik: 0},
  mixer: {gainVO: 1.60, gainSFX: 0.90, duckMusik: {th: 0.03, ratio: 12, attack: 20, release: 280}},
};
