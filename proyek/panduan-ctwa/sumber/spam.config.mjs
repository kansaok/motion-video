// Tutorial: Spam dari iklan Click-to-WhatsApp — tandai, Loss, kecualikan di Meta. 16:9, 9 scene, ±63 dtk.
// Suara sama dengan seri Konektor (preset C, speed 0.98). Struktur salinan tutorial-ctwa.

export default {
  nama: 'tutorial-spam',
  komposisi: 'Tutorial Spam.dc.html',
  jsx: 'spam-tutorial.jsx',
  kapsi: false,
  keluaran: 'tutorial-spam.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20261010, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  // Kunci terpanjang di atas. 'WhatsApp' sendiri dibaca "wasap" (IKLAN.md, tabel ejaan).
  lafal: {'Click-to-WhatsApp': 'Klik tu wasap', 'Custom Audience': 'kastem odiens', WhatsApp: 'wasap'},

  vo: [
    {no: 1,  sc: 'Intro',      off: 0.40, text: 'Iklan jalan, chat masuk, tapi sebagian spam. Dibalas satu-satu, waktu CS habis, dan budget iklan bocor.'},
    {no: 2,  sc: 'Masuk',      off: 0.40, text: 'Ini chat spam, tapi datangnya lewat iklan. Jangan dibalas.'},
    {no: 3,  sc: 'Tandai',     off: 0.40, text: 'Tandai dengan label Spam.'},
    {no: 4,  sc: 'Tandai',     off: 3.60, text: 'Ubah tahapnya jadi Loss. Tidak ada event ke Meta, jadi laporan lead tetap bersih.'},
    {no: 5,  sc: 'Leads',      off: 0.40, text: 'Di Leads, filter status Loss, lalu ekspor. Ini daftar nomor yang mau dikecualikan.'},
    {no: 6,  sc: 'Audiens',    off: 0.40, text: 'Di Meta, buat Custom Audience dari customer list. Unggah daftar tadi.'},
    {no: 7,  sc: 'Kecualikan', off: 0.40, dengar: /mereka/i, coba: 4, text: 'Di ad set, kecualikan audiens itu. Iklan berhenti menjangkau mereka!'},
    {no: 8,  sc: 'Hasil',      off: 0.40, text: 'Budget kembali ke calon pembeli asli, bukan ke spam.'},
    {no: 9,  sc: 'Tips',       off: 0.40, text: 'Jangan balas spam, cukup tandai. Perbarui audiens pengecualiannya tiap minggu dari ekspor Leads.'},
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

  // Semua cue scene-relatif (C.<Scene> + n), diselaraskan dengan jadwal T_* di spam-tutorial.jsx.
  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0) => ({at, nama, gain, nada});
    const klik = (t, n = 0) => q(t, 'klik', 0.18, n);
    const tombol = (t, n = 0) => q(t, 'tombol', 0.26, n);
    const ketik = (t, n = 4) => Array.from({length: n}, (_, i) => q(t + i * 0.12, 'klik', 0.10, i % 2 ? 2 : 1));
    return [
      // Intro: judul, 7 gelembung chat (1,3 + i*0,12), tiga penanda SPAM (3,4 + k*0,15), koin bocor (4,6), teks (5,5)
      q(C.Intro + 0.15, 'pop', 0.26),
      ...[0, 1, 2, 3, 4, 5, 6].map((i) => q(C.Intro + 1.3 + i * 0.12, 'pop', 0.10, [1, 3, 2, 4, 1, 3, 2][i])),
      q(C.Intro + 3.4, 'pop', 0.18, -3), q(C.Intro + 3.55, 'pop', 0.18, -4), q(C.Intro + 3.7, 'pop', 0.18, -5),
      q(C.Intro + 4.6, 'sapu', 0.12), q(C.Intro + 4.82, 'pop', 0.08, -2), q(C.Intro + 5.04, 'pop', 0.08, -3), q(C.Intro + 5.26, 'pop', 0.08, -4),
      q(C.Intro + 5.5, 'pop', 0.22, 5),
      // jendela masuk (ms - 1,1)
      q(C.Masuk - 1.0, 'sapu', 0.14),

      // Masuk: klik baris Promo Pulsa 88 (0,9), chip data iklan (2,2), penanda Jangan dibalas (4,2)
      klik(C.Masuk + 0.9), q(C.Masuk + 0.95, 'sapu', 0.10),
      q(C.Masuk + 2.2, 'pop', 0.16, 2), q(C.Masuk + 2.25, 'chime', 0.10),
      q(C.Masuk + 4.2, 'pop', 0.20, -4),

      // Tandai: + Label (0,6), Buat label baru (1,3), ketik Spam (1,7), swatch merah (2,45), Simpan (2,9), chip Spam (3,0)
      klik(C.Tandai + 0.6), q(C.Tandai + 0.65, 'pop', 0.12, 2),
      klik(C.Tandai + 1.3), q(C.Tandai + 1.35, 'sapu', 0.10),
      ...ketik(C.Tandai + 1.7, 4),
      klik(C.Tandai + 2.45, 1),
      tombol(C.Tandai + 2.9), q(C.Tandai + 3.0, 'pop', 0.16, 3), q(C.Tandai + 3.05, 'centang', 0.14, 1),
      // segmen Loss (4,9), toast (5,0), callout Tidak ada event ke Meta (6,4)
      klik(C.Tandai + 4.9), q(C.Tandai + 4.95, 'pop', 0.16, -2), q(C.Tandai + 5.0, 'centang', 0.14, 2),
      q(C.Tandai + 6.4, 'pop', 0.20, 1), q(C.Tandai + 6.45, 'chime', 0.12),

      // Leads: nav Leads (0,45), Filter Status (1,3), Loss (2,0, baris menyusut), Ekspor (3,4), Ekspor Data Terfilter (4,1), toast (4,5), berkas (4,75)
      klik(C.Leads + 0.45), q(C.Leads + 0.5, 'sapu', 0.12),
      klik(C.Leads + 1.3), q(C.Leads + 1.35, 'pop', 0.12, 2),
      klik(C.Leads + 2.0), q(C.Leads + 2.1, 'sapu', 0.12),
      klik(C.Leads + 3.4), q(C.Leads + 3.45, 'pop', 0.12, 2),
      tombol(C.Leads + 4.1), q(C.Leads + 4.5, 'centang', 0.14, 1), q(C.Leads + 4.55, 'chime', 0.12),
      q(C.Leads + 4.75, 'pop', 0.16, 4), q(C.Leads + 4.8, 'salin', 0.12),

      // Audiens: tab Meta (0,3), Create audience (0,9), Custom audience (1,5), Customer list (2,3), Next (2,9), Upload file (3,6), berkas terunggah (3,7-4,3), ketik nama (4,8), Upload and create (6,3), baris baru (6,5)
      klik(C.Audiens + 0.3), q(C.Audiens + 0.35, 'sapu', 0.12),
      klik(C.Audiens + 0.9), q(C.Audiens + 0.95, 'pop', 0.12, 2),
      klik(C.Audiens + 1.5), q(C.Audiens + 1.55, 'sapu', 0.10),
      klik(C.Audiens + 2.3, 1),
      tombol(C.Audiens + 2.9), q(C.Audiens + 2.95, 'sapu', 0.10),
      klik(C.Audiens + 3.6), q(C.Audiens + 3.7, 'pop', 0.12, 2), q(C.Audiens + 4.3, 'centang', 0.14, 3),
      klik(C.Audiens + 4.7, 1), ...ketik(C.Audiens + 4.8, 6),
      tombol(C.Audiens + 6.3), q(C.Audiens + 6.35, 'sapu', 0.10),
      q(C.Audiens + 6.5, 'pop', 0.16, 4), q(C.Audiens + 6.55, 'chime', 0.12),

      // Kecualikan: nav Ad sets (0,3), Exclude (1,5), kolom cari (2,3), pilih Spam CTWA - Okt (4,45)
      klik(C.Kecualikan + 0.3), q(C.Kecualikan + 0.35, 'sapu', 0.12),
      klik(C.Kecualikan + 1.5), q(C.Kecualikan + 1.55, 'pop', 0.12, 2),
      klik(C.Kecualikan + 2.3), q(C.Kecualikan + 2.35, 'pop', 0.12, 3),
      klik(C.Kecualikan + 4.45),
      // Satu-satunya hentakan besar: chip "Excluded: Spam CTWA - Okt" muncul (4,6 dtk di scene Kecualikan), pada kata "mereka".
      q(C.Kecualikan + 3.3, 'riser', 0.22), q(C.Kecualikan + 4.4, 'hisap', 0.20),
      q(C.Kecualikan + 4.6, 'impact', 0.42), q(C.Kecualikan + 4.62, 'sub', 0.32),
      q(C.Kecualikan + 5.1, 'centang', 0.16, 3), q(C.Kecualikan + 5.25, 'jadi', 0.14),

      // Hasil: jendela keluar (0,1), iklan (0,3), gelembung spam (0,5-0,74), coretan (1,0-1,24), panah (1,4), pembeli asli (2,0), budget utuh (2,6)
      q(C.Hasil + 0.1, 'sapu', 0.14), q(C.Hasil + 0.3, 'pop', 0.18, 2),
      q(C.Hasil + 0.5, 'pop', 0.10, 1), q(C.Hasil + 0.62, 'pop', 0.10, 3), q(C.Hasil + 0.74, 'pop', 0.10, 2),
      q(C.Hasil + 1.0, 'klik', 0.14, -3), q(C.Hasil + 1.12, 'klik', 0.14, -4), q(C.Hasil + 1.24, 'klik', 0.14, -5),
      q(C.Hasil + 1.4, 'sapu', 0.14), q(C.Hasil + 2.0, 'pop', 0.20, 3), q(C.Hasil + 2.3, 'pop', 0.08, 1), q(C.Hasil + 2.5, 'pop', 0.08, 3),
      q(C.Hasil + 2.6, 'pop', 0.18, 5), q(C.Hasil + 2.7, 'chime', 0.16),

      // Tips: kartu (−0,1), tip 1 (0,4), tip 2 (3,4)
      q(C.Tips + 0.0, 'sapu', 0.12), q(C.Tips + 0.4, 'pop', 0.14, 2), q(C.Tips + 3.4, 'pop', 0.14, 3), q(C.Tips + 3.5, 'chime', 0.12),

      q(C.Outro + 0.9, 'sapu', 0.12), q(C.Outro + 1.0, 'pop', 0.22),
    ];
  },

  musik: [{
    nama: 'bgm',
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'words', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'fade in'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const dasar = ['clean modern product-demo instrumental', '112 BPM', 'steady and continuous', 'always present',
        'light shaker', 'soft pluck', 'no vocals'];
      return [
        b(0, C.Leads, '[focus]', [...dasar, 'focused groove from the very first beat', 'warm and clear']),
        b(C.Leads, C.Kecualikan, '[flow]', [...dasar, 'a little fuller', 'soft arpeggio', 'forward motion']),
        b(C.Kecualikan, total, '[lift]', [...dasar, 'brighter', 'open', 'same groove']),
        b(total, total + 8, '[tail]', [...dasar, 'brighter groove continues']),
      ];
    },
    // Tukikan −32 dB sesaat sebelum hentakan "Excluded" (4,6 dtk di scene Kecualikan), lalu balik.
    titik: [
      ['Intro', 0, -23],
      ['Kecualikan', 4.40, -23], ['Kecualikan', 4.50, -32], ['Kecualikan', 4.72, -22],
      ['Outro', 0, -23],
    ],
    fadeOut: ({total}) => [total - 0.35, 0.35],
  }],

  sampul: {detik: 1.6},
  mixer: {gainVO: 1.60, gainSFX: 0.90, duckMusik: {th: 0.03, ratio: 8, attack: 20, release: 280}},
};
