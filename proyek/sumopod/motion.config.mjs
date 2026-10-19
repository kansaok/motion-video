// SumoPod Promo — config motion-engine. Jalankan: motion all
//
// Komposisi = sumber kebenaran. Seluruh beat di sumopod-film.jsx scene-relatif
// (`C.dp + n`), jadi durasi scene aman dipanjangkan. Offset VO di bawah diambil
// dari beat animasi itu, bukan dari brief.
export default {
  nama: 'sumopod',
  komposisi: 'SumoPod Promo - Portrait.dc.html',
  jugaTulis: ['SumoPod Promo - Landscape.dc.html'],   // timing identik, satu jsx
  jsx: 'sumopod-film.jsx',
  kapsi: true,                                        // 23 kapsi = 23 baris VO, urut sama
  keluaran: 'sumopod-9x16.mp4',

  // Kecepatan baca diukur dulu pada satu baris naskah ini, speed 1,15: Yoga 21,5 kar/dtk ·
  // Firman 19,6 · Senandika 18,5 · Cahaya 16,3 · Jonathan 16,2 · Galih 15,7 · Satria 9,6.
  // Satria terdengar paling pas tapi 9,6 kar/dtk membuat 67 detik komposisi jadi 89 detik.
  // Senandika: muda, jelas, percaya diri — cukup cepat tanpa terdengar kejar setoran.
  suara: {id: 'eESTQeTcGUli0jYysKtx', seed: 20260830, speed: 1.10, stability: 0.38, similarity: 0.82, style: 0.08},

  // Istilah Inggris ditulis ulang dengan ejaan Indonesia. Teks di layar tidak disentuh.
  lafal: {
    sumopod: 'Sumo Pod', deploy: 'diploy', 'crash loop': 'kresy lup', yaml: 'yamel',
    cloud: 'klaud', setup: 'setap', container: 'kontainer', template: 'templat',
    'health check': 'helt cek', live: 'laif', n8n: 'en eit en', whatsapp: 'Watsap',
    api: 'A P I', wordpress: 'Wordpres', dollar: 'dolar', reseller: 'riseler',
    'dot com': 'dot kom', vps: 've pe es',
  },

  vo: [
    // Derita Jam 2 — enam poster cut di +0 / +1,25 / +2,5 / +3,9 / +5,3 / +6,5
    {no: 1,  sc: 'Derita Jam 2', off: 0.15, text: 'Jam dua pagi. Deploy kamu gagal lagi.'},
    {no: 2,  sc: 'Derita Jam 2', off: 2.55, text: 'Crash loop. Tagihan cloud luar.'},
    {no: 3,  sc: 'Derita Jam 2', off: 5.35, text: 'Empat ratus baris YAML.'},
    {no: 4,  sc: 'Derita Jam 2', off: 7.05, text: 'Capek?'},
    // Reveal — kubus merakit +0,4, flash +1,25, logo +1,5, tagline +3,0, pil +4,4
    {no: 5,  sc: 'Reveal', off: 2.30, text: 'Kenalin: SumoPod. Deploy tanpa drama.'},
    {no: 6,  sc: 'Reveal', off: 4.90, text: 'VPS Jakarta, bayar Rupiah.'},
    // Deploy 15 Detik — pilih +1,12, klik +1,9, log +2,5/+4,4/+6,6/+9,0, LIVE +12,05
    {no: 7,  sc: 'Deploy 15 Detik', off: 0.55,  text: 'Pilih template. Klik deploy.'},
    {no: 8,  sc: 'Deploy 15 Detik', off: 2.60,  text: 'Nggak ada YAML. Nggak ada setup server.'},
    {no: 9,  sc: 'Deploy 15 Detik', off: 5.60,  text: 'Container nyala di Jakarta, domain langsung jadi.'},
    {no: 10, sc: 'Deploy 15 Detik', off: 9.10,  text: 'Health check beres.'},
    {no: 11, sc: 'Deploy 15 Detik', off: 12.25, text: 'Lima belas detik. Live. Gitu doang.'},
    // 100 Template — headline +0,3/+0,55, kubus berputar +1,6 / +3,6 / +5,6 / +7,6
    {no: 12, sc: '100 Template', off: 0.40, text: 'Satu klik, seratus lebih aplikasi.'},
    {no: 13, sc: '100 Template', off: 3.00, text: 'n8n, WhatsApp API, WordPress, Postgres, Redis, Grafana.'},
    {no: 14, sc: '100 Template', off: 7.30, text: 'Tinggal pilih, langsung jalan.'},
    // Bayar Rupiah — coret +0,9, blok Rp jatuh +2,0, harga bergulir +2,9, centang +5,8
    {no: 15, sc: 'Bayar Rupiah', off: 0.30, text: 'Harga cloud, versi waras.'},
    {no: 16, sc: 'Bayar Rupiah', off: 2.95, text: 'Bayar Rupiah, bukan dollar.'},
    {no: 17, sc: 'Bayar Rupiah', off: 4.95, text: 'Mulai puluhan ribu per bulan.'},
    {no: 18, sc: 'Bayar Rupiah', off: 7.05, text: 'Tanpa kartu kredit, tanpa pusing kurs.'},
    // Karya Anak Bangsa — bendera +0,05, judul +1,05/+1,25, paragraf +2,6, lockup +4,2
    {no: 19, sc: 'Karya Anak Bangsa', off: 1.10, text: 'Karya anak bangsa.'},
    {no: 20, sc: 'Karya Anak Bangsa', off: 2.70, text: 'Dibangun developer Indonesia. Server di Jakarta.'},
    {no: 21, sc: 'Karya Anak Bangsa', off: 6.00, text: 'Bukan reseller. Beneran bikin.'},
    // CTA — ketikan +0,25, logo +1,6, tombol +2,9, subline +4,1
    {no: 22, sc: 'CTA', off: 1.70, text: 'Buka SumoPod dot com.'},
    {no: 23, sc: 'CTA', off: 3.10, text: 'Deploy pertamamu, lima belas detik dari sekarang.'},
  ],

  // Offset di atas diturunkan dari beat animasi, jadi dipakai sebagai batas bawah:
  // scene hanya boleh memanjang kalau satu baris benar-benar tidak muat.
  tata: {mode: 'jangkar', jeda: 0.14, ekorBiasa: 0.45},

  // Film ini bekerja lewat hard cut dan hentakan, bukan tekstur. Semua kering.
  sfx: [
    ['sub-drop',      1.8, 'Deep sub bass drop with a short dark tail, cinematic, dry, one shot'],
    ['whoosh-cut',    0.8, 'Very fast short transition whoosh, tight and modern, no reverb, one shot'],
    ['error-buzz',    1.0, 'Short harsh digital error buzzer, cold and glitchy, dry, one shot'],
    ['cash-drop',     1.2, 'Heavy dull money thud landing on a table, dry, close mic, one shot'],
    ['paper-scroll',  2.0, 'Fast dry paper and text scrolling past, granular ticking, no music, no reverb'],
    ['glitch-hit',    0.8, 'Hard digital glitch impact with a bit crushed stutter, aggressive, dry, one shot'],
    ['cube-assemble', 1.6, 'Mechanical sci-fi parts snapping and locking together, precise and metallic, dry'],
    ['brand-boom',    2.0, 'Cinematic brand boom, bright impact over a deep sub, short clean tail, one shot'],
    ['sparkle-up',    1.6, 'Bright fine particles rising upward, light shimmer, no melody, dry'],
    ['ui-click',      0.5, 'One crisp modern interface click, tight and clean, no reverb, one shot'],
    ['ui-select',     0.5, 'One soft interface select blip, warm and rounded, no reverb, one shot'],
    ['terminal-type', 1.2, 'Quick burst of mechanical keyboard typing, close and dry, one shot'],
    ['odo-roll',      2.5, 'Mechanical odometer digits rolling steadily, dry, close mic, no music'],
    ['deploy-launch', 2.2, 'Smooth rising tech launch whoosh opening into a wide bright hit, clean, one shot'],
    ['success-chime', 1.5, 'Bright confident two note success chime, modern and clean, short decay'],
    ['stamp-slam',    1.0, 'Heavy rubber stamp slam impact on paper, dry and punchy, one shot'],
    ['flag-whip',     1.2, 'Large fabric flag whipping once in the wind, dry, close, one shot'],
  ],

  // C = detik mulai tiap scene · P = posisi tiap baris VO · S = durasi tiap scene
  cue: ({C, P, S}) => {
    const q = (sc, off, nama, gain, nada = 0, pan = 0) => ({at: C[sc] + off, nama, gain, nada, pan});
    const D = 'Derita Jam 2', R = 'Reveal', DP = 'Deploy 15 Detik';
    const TP = '100 Template', RP = 'Bayar Rupiah', KB = 'Karya Anak Bangsa';
    return [
      // DERITA — satu hentakan pembuka, lalu satu whoosh per potongan poster
      q(D, 0.02, 'sub-drop', 0.34),
      ...[1.25, 2.50, 3.90, 5.30, 6.50].map((o, i) => q(D, o, 'whoosh-cut', 0.26, [0, 2, -1, 3, -3][i], i % 2 ? 0.4 : -0.4)),
      q(D, 2.55, 'error-buzz', 0.30),
      q(D, 3.95, 'cash-drop', 0.32),
      q(D, 5.35, 'paper-scroll', 0.22),
      q(D, 6.55, 'glitch-hit', 0.34),
      // REVEAL — kubus merakit, flash, logo
      q(R, 0.40, 'cube-assemble', 0.30),
      q(R, 1.25, 'brand-boom', 0.38),
      q(R, 1.52, 'sparkle-up', 0.22),
      q(R, 4.40, 'ui-select', 0.22, 4),
      // DEPLOY — kursor pilih, klik, empat baris log, odometer, lalu LIVE
      q(DP, 0.05, 'whoosh-cut', 0.24),
      q(DP, 1.12, 'ui-select', 0.30),
      q(DP, 1.90, 'ui-click', 0.34),
      q(DP, 2.15, 'terminal-type', 0.24),
      q(DP, 2.00, 'odo-roll', 0.18),
      ...[2.50, 4.40, 6.60, 9.00].map((o, i) => q(DP, o, 'ui-click', 0.18, 3 - i)),
      q(DP, 5.00, 'whoosh-cut', 0.16, 5, 0.5),
      q(DP, 9.40, 'whoosh-cut', 0.16, -4, -0.5),
      q(DP, 12.05, 'deploy-launch', 0.38),
      q(DP, 12.15, 'success-chime', 0.32),
      // 100 TEMPLATE — dua headline menghentak, empat sisi kubus berputar
      q(TP, 0.00, 'whoosh-cut', 0.26),
      q(TP, 0.30, 'stamp-slam', 0.32),
      q(TP, 0.55, 'stamp-slam', 0.26, 3),
      ...[1.60, 3.60, 5.60, 7.60].map((o, i) => q(TP, o, 'ui-select', 0.22, i * 2, i % 2 ? 0.35 : -0.35)),
      // BAYAR RUPIAH — coret dollar, blok Rp jatuh, angka bergulir, tiga centang
      q(RP, 0.00, 'whoosh-cut', 0.26, -2),
      q(RP, 0.90, 'stamp-slam', 0.24, 5),
      q(RP, 2.00, 'cash-drop', 0.36),
      q(RP, 2.90, 'odo-roll', 0.26),
      q(RP, 4.90, 'stamp-slam', 0.30),
      ...[5.80, 6.20, 6.60].map((o, i) => q(RP, o, 'ui-select', 0.20, i * 3)),
      // KARYA ANAK BANGSA — bendera menghantam, dua judul, lockup
      q(KB, 0.05, 'flag-whip', 0.34),
      q(KB, 1.05, 'stamp-slam', 0.32),
      q(KB, 1.25, 'stamp-slam', 0.28, -3),
      q(KB, 4.20, 'sparkle-up', 0.20),
      // CTA — ketikan, logo, tombol, penutup
      q('CTA', 0.00, 'whoosh-cut', 0.26),
      q('CTA', 0.25, 'terminal-type', 0.24),
      q('CTA', 1.60, 'brand-boom', 0.36),
      q('CTA', 2.90, 'success-chime', 0.30),
      q('CTA', S.CTA - 1.5, 'sparkle-up', 0.20),
    ];
  },

  // Satu trek: gelap dan tegang di derita, terbuka di Reveal, puncak di LIVE dan CTA.
  musik: [{
    nama: 'musik',
    detik: ({total}) => total + 1.0,
    titik: [
      ['Derita Jam 2', 0.0, -22], ['Derita Jam 2', 6.3, -15],
      ['Reveal', 0.0, -13],
      ['Deploy 15 Detik', 0.5, -18], ['Deploy 15 Detik', 12.0, -12],
      ['100 Template', 0.0, -14],
      ['Bayar Rupiah', 0.0, -16],
      ['Karya Anak Bangsa', 0.0, -13],
      ['CTA', 0.0, -12],
    ],
    fadeOut: ({total}) => [total - 1.5, 1.3],
    prompt: 'Modern tech promo instrumental, 124 BPM, no vocals. Opens dark and tense with a low sub drone, '
      + 'a dry ticking pulse and cold glitch textures, no melody. A short riser cuts into a bright confident '
      + 'drop with a punchy kick, a wide synth bass and a simple hopeful arpeggio. It pulls back to a steady '
      + 'minimal groove with soft plucks, then builds again into a big open chorus with claps and a bright '
      + 'lead. A warm proud section with strings over the same groove. It ends on a strong final hit and a '
      + 'clean short tail, fading fully to silence.',
  }],

  // Satu tarikan napas tepat sebelum "Lima belas detik. Live." — diikat ke barisnya,
  // bukan ke batas scene, supaya tidak bergeser waktu naskah berubah panjang.
  gate: ({P}) => [[P[11] - 0.80, P[11] - 0.22]],

  mixer: {gainVO: 1.45, gainSFX: 0.66, duckMusik: {th: 0.02, ratio: 9, attack: 70, release: 240}},

  periksa: {busTitik: [1, 9, 20, 33, 45, 55, 62]},
};
