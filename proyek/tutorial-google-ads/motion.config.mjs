// Tutorial: Kirim closing ke Google Ads lewat Konektor (Google Ads API). 16:9, 10 scene, ±58 dtk.
// Suara sama dengan seri Konektor (preset C, speed 0.98). Struktur salinan tutorial-ctwa.

export default {
  nama: 'tutorial-google-ads',
  komposisi: 'Tutorial Google Ads.dc.html',
  jsx: 'gads-tutorial.jsx',
  kapsi: false,
  keluaran: 'tutorial-google-ads.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  // `gclid` dieja otomatis oleh lib/lafal.mjs. ID dan ctId dieja di sini; `ID` hanya
  // sebelum "jenis" supaya ".id" di domain tidak ikut berubah.
  lafal: {
    ctId: 'ce, te, ai, di',
    API: 'ei pi ai',
    ID: (x) => x.replace(/\bID(?= jenis)/g, 'ai di'),
  },

  vo: [
    {no: 1,  sc: 'Intro',      off: 0.40, text: 'Google Ads cuma tahu klik. Closing di WhatsApp? Google nggak pernah tahu.'},
    {no: 2,  sc: 'Koneksi',    off: 0.40, text: 'Pertama, hubungkan akun Google Ads di Kelola Koneksi. Statusnya harus Aktif.'},
    {no: 3,  sc: 'Konversi',   off: 0.40, text: 'Di Google Ads, buka Sasaran, Konversi, lalu pilih tindakan konversinya.'},
    {no: 4,  sc: 'IdKonversi', off: 0.40, text: 'Salin ID jenis konversi. Angka yang sama ada di URL, setelah ctId.'},
    {no: 5,  sc: 'Pasang',     off: 0.40, text: 'Di Tracking Website, pilih mode Google Ads API. Pilih integrasinya, lalu tempel ID tadi.'},
    {no: 6,  sc: 'Closing',    off: 0.40, text: 'Begitu deal, ubah lead jadi Closing, dan isi nilainya.'},
    {no: 7,  sc: 'Kirim',      off: 0.40, dengar: /terkirim|ter kirim/i, coba: 4, text: 'Konektor kirim closing itu ke Google Ads. Terkirim!'},
    {no: 8,  sc: 'Hasil',      off: 0.40, text: 'Statusnya Merekam konversi. Google belajar dari pembeli asli, bukan cuma dari klik.'},
    {no: 9,  sc: 'Tips',       off: 0.40, text: 'Aktifkan Auto-tagging, supaya gclid ikut tercatat.'},
    {no: 10, sc: 'Outro',      off: 1.00, dengar: /konektor|connector/i, coba: 4, text: 'Panduannya, di konektor.id.'},
  ],

  tata: {mode: 'jangkar', jeda: 0.18, ekorBiasa: 0.40},

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

  // Semua cue memakai C.<Scene> + n, diselaraskan dengan jadwal di gads-tutorial.jsx.
  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0) => ({at, nama, gain, nada});
    const klik = (t, n = 0) => q(t, 'klik', 0.18, n);
    const tombol = (t, n = 0) => q(t, 'tombol', 0.26, n);
    const [I, K, V, D, P, S, R, H, T, O] = ['Intro', 'Koneksi', 'Konversi', 'IdKonversi', 'Pasang', 'Closing', 'Kirim', 'Hasil', 'Tips', 'Outro'].map((n) => C[n]);
    return [
      // Intro: kotak Google, gelembung chat, tanda tanya
      q(I + 0.25, 'pop', 0.26), q(I + 1.5, 'pop', 0.20, 2),
      q(I + 1.55, 'pop', 0.10, 1), q(I + 1.65, 'pop', 0.10, 3), q(I + 1.75, 'pop', 0.10, 2), q(I + 1.85, 'pop', 0.10, 4), q(I + 1.95, 'pop', 0.10, 1),
      q(I + 2.5, 'pop', 0.22, 5), q(K - 0.9, 'sapu', 0.14),

      // Koneksi: Kelola Koneksi, tab Google Ads (Beta), status Aktif
      tombol(K + 2.2), q(K + 2.3, 'sapu', 0.12), klik(K + 3.4), q(K + 3.5, 'sapu', 0.10), q(K + 4.8, 'pop', 0.14, 3), q(K + 4.85, 'chime', 0.12),

      // Konversi: tab Google, Sasaran, Konversi, baris tindakan
      klik(V + 0.0), q(V + 0.1, 'sapu', 0.12), klik(V + 2.3), klik(V + 3.4), q(V + 3.45, 'sapu', 0.12),
      klik(V + 5.0), q(V + 5.05, 'sapu', 0.12),

      // IdKonversi: salin ID, ctId di URL
      klik(D + 1.2), klik(D + 1.3, 1), q(D + 1.35, 'salin', 0.18), q(D + 2.3, 'sapu', 0.12),
      q(D + 3.9, 'pop', 0.20, 4), q(D + 3.95, 'chime', 0.10),

      // Pasang: Tracking Website, Ubah, mode, integrasi, tempel ID, Simpan
      klik(P + 0.0), q(P + 0.1, 'sapu', 0.12), klik(P + 0.6), q(P + 0.65, 'sapu', 0.12),
      klik(P + 1.5), q(P + 1.55, 'pop', 0.12, 2), klik(P + 2.0), q(P + 2.15, 'sapu', 0.14),
      klik(P + 2.7), q(P + 2.75, 'pop', 0.12, 3), tombol(P + 3.4), q(P + 3.45, 'centang', 0.14, 1),
      klik(P + 4.2), q(P + 4.25, 'pop', 0.12, 2), tombol(P + 4.8), q(P + 4.85, 'centang', 0.14, 2),
      klik(P + 5.5), q(P + 6.0, 'salin', 0.16), q(P + 6.05, 'pop', 0.12, 4),
      tombol(P + 7.1), q(P + 7.2, 'centang', 0.16, 3), q(P + 7.25, 'chime', 0.10),

      // Closing: Leads, menu status, nilai, konfirmasi
      klik(S + 0.25), q(S + 0.3, 'sapu', 0.12), klik(S + 1.0), q(S + 1.05, 'pop', 0.12, 2), klik(S + 1.8),
      q(S + 2.6, 'klik', 0.10, 1), q(S + 2.72, 'klik', 0.10, 2), q(S + 2.84, 'klik', 0.10, 1), q(S + 2.96, 'klik', 0.10, 2),
      tombol(S + 3.5), q(S + 3.6, 'centang', 0.14, 1), q(S + 3.65, 'pop', 0.12, 4),
      klik(S + 4.5), q(S + 4.55, 'sapu', 0.12),

      // Kirim: Log pengiriman; satu-satunya hentakan besar di "Terkirim!" (Kirim + 2,5 dtk)
      klik(R + 0.5), q(R + 0.55, 'sapu', 0.12), q(R + 0.8, 'pop', 0.12, 2),
      q(R + 1.6, 'riser', 0.22), q(R + 2.4, 'hisap', 0.20),
      q(R + 2.5, 'impact', 0.42), q(R + 2.52, 'sub', 0.32),
      q(R + 3.0, 'centang', 0.16, 3), q(R + 3.15, 'jadi', 0.14), q(R + 3.5, 'sapu', 0.10), q(R + 5.0, 'sapu', 0.10),

      // Hasil: Merekam konversi, closing balik ke Google, pembeli naik
      klik(H + 0.0), q(H + 0.05, 'sapu', 0.12), q(H + 0.7, 'pop', 0.18, 2), q(H + 0.72, 'chime', 0.12),
      q(H + 2.0, 'sapu', 0.14), q(H + 2.3, 'pop', 0.20, 2), q(H + 2.9, 'sapu', 0.14), q(H + 3.3, 'pop', 0.20, 3),
      q(H + 3.5, 'pop', 0.08, 1), q(H + 3.65, 'pop', 0.08, 3), q(H + 3.8, 'pop', 0.08, 5), q(H + 3.95, 'pop', 0.08, 1), q(H + 4.1, 'pop', 0.08, 3), q(H + 4.25, 'pop', 0.08, 5),
      q(H + 4.4, 'chime', 0.16),

      // Tips: Auto-tagging dan gclid
      q(T + 0.0, 'sapu', 0.12), q(T + 1.0, 'pop', 0.14, 2), q(T + 1.1, 'chime', 0.12),
      q(T + 2.4, 'pop', 0.16, 3), q(T + 2.5, 'chime', 0.10), q(T + 5.1, 'pop', 0.16, 4), q(T + 5.2, 'chime', 0.12),

      q(O + 0.9, 'sapu', 0.12), q(O + 1.0, 'pop', 0.22),
    ];
  },

  musik: [{
    nama: 'bgm',
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'words', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'quiet intro', 'fade in', 'sparse'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const dasar = ['clean modern product-demo instrumental', '112 BPM', 'steady and continuous', 'always present',
        'light shaker', 'soft pluck', 'no vocals'];
      return [
        b(0, C.IdKonversi, '[focus]', [...dasar, 'focused groove from the very first beat', 'warm and clear']),
        b(C.IdKonversi, C.Kirim, '[flow]', [...dasar, 'a little fuller', 'soft arpeggio', 'forward motion']),
        b(C.Kirim, total, '[lift]', [...dasar, 'brighter', 'open', 'same groove']),
        b(total, total + 8, '[tail]', [...dasar, 'brighter groove continues']),
      ];
    },
    titik: [
      ['Intro', 0, -23],
      ['Kirim', 2.30, -23], ['Kirim', 2.40, -32], ['Kirim', 2.62, -22],
      ['Outro', 0, -23],
    ],
    fadeOut: ({total}) => [total - 0.35, 0.35],
  }],

  sampul: {detik: 1.6},
  mixer: {gainVO: 1.60, gainSFX: 0.90, duckMusik: {th: 0.03, ratio: 8, attack: 20, release: 280}},
};
