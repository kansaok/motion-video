// Tutorial: Halaman Leads, ubah status jadi Closing. 16:9, 10 scene, ±58 dtk.
// Suara sama dengan seri Konektor (preset C). Struktur salinan tutorial-banyak-cs.
// Status: VO, musik, dan render menunggu kuota ElevenLabs. Cue di bawah scene-relatif.

export default {
  nama: 'tutorial-leads',
  komposisi: 'Tutorial Leads.dc.html',
  jsx: 'leads-tutorial.jsx',
  kapsi: false,
  keluaran: 'tutorial-leads.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},

  vo: [
    {no: 1,  sc: 'Intro',  off: 0.40, text: 'Lead sudah closing. Tapi iklanmu tahu nggak?'},
    {no: 2,  sc: 'Inti',   off: 0.40, text: 'Di Leads, satu klik status mengirim hasilnya ke iklan.'},
    {no: 3,  sc: 'Buka',   off: 0.40, text: 'Buka Pelacakan dan Iklan, lalu Leads. Empat kartu di atas: total, lead baru, closing, dan nilai.'},
    {no: 4,  sc: 'Saring', off: 0.40, text: 'Klik tab Aktif. Cari pakai nama atau nomor lengkap, lalu saring Sumber dan Platform.'},
    {no: 5,  sc: 'Status', off: 0.40, text: 'Pelanggan sudah bayar? Klik statusnya, pilih Closing.'},
    {no: 6,  sc: 'Nilai',  off: 0.40, text: 'Isi Jumlah Nilai, klik Konfirmasi Update.'},
    {no: 7,  sc: 'Kirim',  off: 0.40, dengar: /terkirim|ter kirim/i, coba: 4, text: 'Closing tercatat sebagai pendapatan, dan terkirim ke iklan!'},
    {no: 8,  sc: 'Detail', off: 0.40, text: 'Mau tahu dari iklan mana? Buka Lihat Detail, cek Identifier Klik.'},
    {no: 9,  sc: 'Tips',   off: 0.40, text: 'Lead nggak muncul? Hapus filternya, lalu matikan Sembunyikan Pengunjung.'},
    {no: 10, sc: 'Outro',  off: 1.00, dengar: /konektor|connector/i, coba: 4, text: 'Ubah status, iklan ikut belajar. Panduannya di konektor dot id.'},
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

  // Semua cue scene-relatif (C.<Scene> + n), selaras dengan jadwal T_* di leads-tutorial.jsx.
  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0) => ({at, nama, gain, nada});
    const klik = (t, n = 0) => q(t, 'klik', 0.18, n);
    const tombol = (t, n = 0) => q(t, 'tombol', 0.26, n);
    const ketik = (t0, jumlah, jarak) => Array.from({length: jumlah}, (_, i) => q(t0 + i * jarak, 'klik', 0.08, 1 + (i % 3)));
    return [
      // Intro: kartu lead Closing, garis putus, kartu iklan, tiga chip, tanda tanya
      q(C.Intro + 0.15, 'pop', 0.20), q(C.Intro + 1.3, 'sapu', 0.10),
      q(C.Intro + 1.7, 'pop', 0.16, 2),
      q(C.Intro + 2.0, 'pop', 0.12, 3), q(C.Intro + 2.15, 'pop', 0.12, 4), q(C.Intro + 2.3, 'pop', 0.12, 5),
      q(C.Intro + 2.2, 'pop', 0.20, -2), q(C.Intro + 4.1, 'sapu', 0.12),

      // Inti: kartu Leads, panah umpan balik, tiga chip menyala satu per satu
      q(C.Inti + 0.5, 'pop', 0.18), q(C.Inti + 1.3, 'sapu', 0.10), q(C.Inti + 1.6, 'pop', 0.14, 2),
      q(C.Inti + 2.4, 'pop', 0.14, 3), q(C.Inti + 2.45, 'chime', 0.10),
      q(C.Inti + 3.0, 'pop', 0.14, 4), q(C.Inti + 3.05, 'chime', 0.10),
      q(C.Inti + 3.6, 'pop', 0.14, 5), q(C.Inti + 3.65, 'chime', 0.12),
      q(C.Inti + 3.9, 'pop', 0.12, 1), q(C.Inti + 4.7, 'sapu', 0.14),

      // Buka: jendela masuk, sorot grup, klik Leads, empat kartu
      q(C.Buka - 0.7, 'sapu', 0.12),
      q(C.Buka + 0.8, 'pop', 0.10, 2), klik(C.Buka + 2.0), q(C.Buka + 2.05, 'sapu', 0.12),
      q(C.Buka + 2.3, 'pop', 0.08, 1), q(C.Buka + 2.45, 'pop', 0.08, 2), q(C.Buka + 2.6, 'pop', 0.08, 3), q(C.Buka + 2.75, 'pop', 0.08, 4),
      q(C.Buka + 4.3, 'pop', 0.12, 2), q(C.Buka + 5.0, 'pop', 0.12, 3), q(C.Buka + 5.7, 'pop', 0.12, 4), q(C.Buka + 6.4, 'pop', 0.12, 5),

      // Saring: tab Aktif, ketik nama, buka Filter, Sumber, Platform, saklar
      klik(C.Saring + 1.0), q(C.Saring + 1.05, 'sapu', 0.08),
      klik(C.Saring + 1.9), ...ketik(C.Saring + 2.1, 12, 0.1),
      tombol(C.Saring + 4.1), q(C.Saring + 4.15, 'sapu', 0.10),
      klik(C.Saring + 4.8, 1), q(C.Saring + 4.85, 'pop', 0.10, 3),
      klik(C.Saring + 5.8, 2), q(C.Saring + 5.85, 'pop', 0.10, 4),
      q(C.Saring + 6.5, 'pop', 0.10, 2),

      // Status: belokan pelanggan sudah bayar, klik status, pilih Closing
      q(C.Status + 0.25, 'pop', 0.16, 3), q(C.Status + 0.3, 'chime', 0.10),
      klik(C.Status + 1.9), q(C.Status + 1.95, 'sapu', 0.10),
      tombol(C.Status + 3.8, -1), q(C.Status + 3.9, 'sapu', 0.12),

      // Nilai: ketik jumlah, Konfirmasi Update, badge jadi Closing
      klik(C.Nilai + 0.9, 1), ...ketik(C.Nilai + 1.1, 9, 0.09),
      tombol(C.Nilai + 3.5), q(C.Nilai + 3.6, 'centang', 0.14, 1), q(C.Nilai + 3.65, 'chime', 0.12),
      q(C.Nilai + 3.7, 'sapu', 0.08), q(C.Nilai + 3.9, 'pop', 0.10, 2),

      // Kirim: kartu Closing dan Total Nilai, Konversi, Log pengiriman, Terkirim
      q(C.Kirim + 0.2, 'pop', 0.10, 3), q(C.Kirim + 0.95, 'pop', 0.10, 4),
      klik(C.Kirim + 1.7), q(C.Kirim + 1.75, 'sapu', 0.12),
      klik(C.Kirim + 2.4), q(C.Kirim + 2.75, 'pop', 0.10, 1),

      // Satu-satunya hentakan besar: "terkirim" (status Terkirim, 3,42 dtk di scene Kirim).
      q(C.Kirim + 2.65, 'riser', 0.22), q(C.Kirim + 3.35, 'hisap', 0.20),
      q(C.Kirim + 3.45, 'impact', 0.42), q(C.Kirim + 3.47, 'sub', 0.32),
      q(C.Kirim + 3.95, 'centang', 0.16, 3), q(C.Kirim + 4.1, 'jadi', 0.14),
      q(C.Kirim + 4.45, 'pop', 0.10, 2), q(C.Kirim + 6.2, 'sapu', 0.10),

      // Detail: kembali ke Leads, Lihat Detail, Parameter Atribusi, Identifier Klik
      klik(C.Detail + 0.5), q(C.Detail + 0.55, 'sapu', 0.10),
      klik(C.Detail + 1.8), q(C.Detail + 1.9, 'sapu', 0.12), q(C.Detail + 2.0, 'pop', 0.12, 2),
      q(C.Detail + 2.7, 'pop', 0.14, 3), q(C.Detail + 2.75, 'chime', 0.10),
      q(C.Detail + 3.9, 'pop', 0.14, 5), q(C.Detail + 3.95, 'chime', 0.12),
      q(C.Detail + 5.6, 'sapu', 0.10),

      // Tips: Hapus Filter, daftar kembali penuh, saklar mati
      q(C.Tips - 0.1, 'sapu', 0.12), q(C.Tips + 0.25, 'pop', 0.16, 2),
      tombol(C.Tips + 2.5), q(C.Tips + 2.6, 'centang', 0.14, 1),
      q(C.Tips + 2.7, 'pop', 0.08, 2), q(C.Tips + 2.82, 'pop', 0.08, 3), q(C.Tips + 2.94, 'pop', 0.08, 4),
      tombol(C.Tips + 4.0, -2), q(C.Tips + 4.1, 'centang', 0.14, 3), q(C.Tips + 4.15, 'pop', 0.10, 5),

      q(C.Outro + 0.9, 'sapu', 0.12), q(C.Outro + 1.0, 'pop', 0.22),
    ];
  },

  musik: [{
    nama: 'bgm',
    // Musik dipakai ulang dari tutorial-banyak-cs (74 dtk, 112 BPM). Kuota musik ElevenLabs habis pada 11 Okt 2026.
    luar: true,
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'words', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'quiet intro', 'fade in', 'sparse'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const dasar = ['clean modern product-demo instrumental', '112 BPM', 'steady and continuous', 'always present',
        'light shaker', 'soft pluck', 'no vocals'];
      return [
        b(0, C.Saring, '[focus]', [...dasar, 'focused groove from the very first beat', 'warm and clear']),
        b(C.Saring, C.Kirim, '[flow]', [...dasar, 'a little fuller', 'soft arpeggio', 'forward motion']),
        b(C.Kirim, total, '[lift]', [...dasar, 'brighter', 'open', 'same groove']),
        b(total, total + 8, '[tail]', [...dasar, 'brighter groove continues']),
      ];
    },
    // Bed -27 dB. Satu tukikan ke -36 dB tepat sebelum hentakan (3,45 dtk di scene Kirim), lalu kembali ke -27.
    titik: [
      ['Intro', 0, -27],
      ['Kirim', 3.25, -27], ['Kirim', 3.35, -36], ['Kirim', 3.57, -27],
      ['Outro', 0, -27],
    ],
    fadeOut: ({total}) => [total - 0.35, 0.35],
  }],

  sampul: {detik: 0},
  mixer: {gainVO: 1.60, gainSFX: 0.90, duckMusik: {th: 0.03, ratio: 12, attack: 20, release: 280}},
};
