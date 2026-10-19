// Iklan jasa Rama Digital — "Digital Marketing Setup". Jalankan: motion all
//
// Komposisi ini ditulis NATIF 16:9 (stage 1920x1080, PAD 132, semua top absolut < 1080),
// jadi landscape dikerjakan duluan tanpa menyentuh .jsx sama sekali. Rasio lain menyusul
// setelah versi ini disetujui — dan itu cuma menambah .dc.html + `jugaTulis`, bukan .jsx baru.
//
// v2 — putaran pertama terdengar datar dan gambarnya monoton. Tiga hal diubah bersamaan,
// karena satu saja tidak cukup:
//   1. `style` suara 0,30 -> 0,58 dan `stability` 0,28 -> 0,20. Ini yang menaikkan intonasi.
//   2. Naskah dipendekkan dan diberi tanda seru. TTS membaca tanda baca sebagai perintah nada.
//   3. Animasi dirombak di .jsx, dan cue di bawah ini diikat ulang ke beat yang baru.

export default {
  nama: 'rama-digital-ads',
  komposisi: 'Iklan Digital Marketing Setup.dc.html',
  // Empat rasio Meta dari SATU .jsx dan SATU master audio. `jugaTulis` menjaga OM_SCENES
  // keempatnya tetap sama; kalau tidak, durasi scene di 4:5 tertinggal satu revisi.
  jugaTulis: [
    'Iklan Digital Marketing Setup 9x16.dc.html',
    'Iklan Digital Marketing Setup 4x5.dc.html',
    'Iklan Digital Marketing Setup 1x1.dc.html',
  ],
  jsx: 'iklan-scene.jsx',
  // Tidak ada array kapsi di jsx ini, dan memang tidak perlu: tiap scene sudah berupa teks
  // besar di layar. Menumpuk kapsi di atasnya cuma menutupi headline-nya sendiri.
  kapsi: false,
  keluaran: 'rama-digital-lead-dari-mana-16x9.mp4',

  // Cahaya, suara yang sama dengan dua iklan Konektor. `style` dinaikkan jauh: putaran
  // pertama memakai 0,30 dan hasilnya rata — benar tetapi tidak mengajak. 0,58 memberi
  // ayunan nada; `stability` diturunkan ke 0,20 supaya ayunan itu tidak diratakan balik.
  suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260906, speed: 1.20, stability: 0.20, similarity: 0.80, style: 0.58},

  // Serapan yang dibaca model secara Inggris. Teks di LAYAR tidak disentuh.
  lafal: {
    audience: 'odiens',
    whatsapp: 'wasap',
    landing: 'lending',
  },

  // Tiap `off` diikat ke beat animasi v2, bukan ke detik enak dibaca:
  //   Hook      0,08 eyebrow · 0,22 kata "Bisnis kamu sudah" · 0,42 angka besar · 2,35 pertanyaan SLAM
  //   Diagnosis 0,50 baris mono · 0,72 headline kata per kata · 2,72 headline amber
  //   Laporan   0,06 kartu · 0,40-1,80 angka berhitung · 2,40 stempel SLAM · 3,02 sub
  //   Rantai    0,20/0,36/0,52 tiga simpul · 1,70 PUTUS + flash merah · 2,25/2,60 headline
  //   Bukti     0,22 Rp 300rb dari kiri · 0,90 Rp 2 M dari kanan · 1,45 garis menyatukan
  //   Janji     0,10 baris italic · 0,85 headline · 1,50 amber · 1,72 garis
  //   Paket     0,16 headline · 0,50 tiga kartu · 1,30 kartu terangkat · 2,15 tombol CTA
  //
  // `maks` = kontrak durasi per baris. Durasi TTS tidak deterministik; tanpa ini satu take
  // yang kebetulan 0,4 detik lebih panjang menggeser seluruh scene sesudahnya.
  vo: [
    {no: 1,  sc: 'Hook',      off: 0.18, maks: 2.35, text: 'Bisnis kamu udah lama jalan.'},
    {no: 2,  sc: 'Hook',      off: 2.32, maks: 2.30, text: 'Masih pusing cari audience?'},

    {no: 3,  sc: 'Diagnosis', off: 0.60, maks: 2.35, text: 'Masalahnya bukan di iklanmu!'},
    {no: 4,  sc: 'Diagnosis', off: 2.72, maks: 2.05, text: 'Tapi di sistem datanya.'},

    {no: 5,  sc: 'Laporan',   off: 0.40, maks: 2.35, text: 'Laporan bulanan penuh angka.'},
    {no: 6,  sc: 'Laporan',   off: 2.35, maks: 2.05, text: 'Tapi lead-nya dari mana?'},

    {no: 7,  sc: 'Rantai',    off: 0.10, maks: 2.30, text: 'Iklan, landing, WhatsApp.'},
    {no: 8,  sc: 'Rantai',    off: 2.25, maks: 2.75, text: 'Ujungnya putus. Budget jalan terus!'},

    // Satu baris utuh, bukan dua penggal. Scene ini cuma 3,5 detik dan layar sudah memuat
    // "PER HARI" / "PER BULAN" — VO cukup membawa rentangnya.
    {no: 9,  sc: 'Bukti',     off: 0.30, maks: 3.20, text: 'Dari tiga ratus ribu, sampai dua miliar!'},

    {no: 10, sc: 'Janji',     off: 0.25, maks: 3.50, text: 'Bukan janji omzet. Tapi data yang kebaca.'},

    // CTA. Putaran pertama menutup dengan "Ngobrol tiga puluh menit dulu" — sopan, dan
    // tidak menyuruh apa pun. Sekarang kata kerjanya di depan dan sama persis dengan
    // tulisan di tombolnya, supaya penonton tahu tombol mana yang dimaksud.
    {no: 11, sc: 'Paket',     off: 0.20, maks: 1.80, text: 'Pilih titik masuknya!'},
    {no: 12, sc: 'Paket',     off: 2.10, maks: 2.85, text: 'Klik chat sekarang. Kita mulai dari datamu!'},
  ],

  tata: {mode: 'jangkar', jeda: 0.12, ekorBiasa: 0.12},

  // Kering semua. Iklan feed ditonton lewat speaker HP: reverb jadi lumpur.
  sfx: [
    ['whoosh',       0.8, 'Very fast short UI transition whoosh, tight and modern, no reverb, one shot'],
    ['click-thick',  0.6, 'One thick rounded interface click, deep and confident, dry, one shot'],
    ['counter-tick', 2.4, 'Mechanical counter digits ticking upward steadily, dry, close mic, no music'],
    ['pop-panel',    0.7, 'One soft panel pop appearing, tight and clean, no reverb, one shot'],
    ['pop-shimmer',  1.6, 'Thick pop opening into fine bright shimmer particles, clean, one shot'],
    ['pop-small',    0.5, 'One small soft pop blip, warm and rounded, no reverb, one shot'],
    ['snap',         0.5, 'One tight snappy transient like a finger snap, bright and dry, one shot'],
    ['sweep-line',   1.0, 'Short soft airy sweep of a thin line being drawn across, clean, dry, one shot'],
    ['glitch-cut',   0.9, 'Short harsh digital glitch of a cable being cut, cold and broken, dry, one shot'],
    ['thud-heavy',   1.2, 'Heavy dull thud landing hard on a surface, dry, close mic, one shot'],
    ['riser',        1.4, 'Short clean tech riser sweeping upward, no reverb tail, one shot'],
    ['impact-wide',  1.8, 'Wide cinematic impact with a deep sub and a short clean tail, one shot'],
    ['chime-up',     1.2, 'Bright confident single note chime, modern and clean, short decay, one shot'],
    ['btn-click',    0.5, 'One crisp modern button click, tight and clean, no reverb, one shot'],
  ],

  // C = mulai tiap scene · P = awal tiap baris VO · E = akhirnya · S = durasi scene
  //
  // Lebih rapat daripada v1: tiap SLAM di layar sekarang punya bunyinya sendiri. Gambar yang
  // menghentak tanpa bunyi terbaca sebagai gambar yang lambat, bukan gambar yang sunyi.
  cue: ({C, S}) => {
    const q = (sc, off, nama, gain, nada = 0, pan = 0) => ({at: C[sc] + off, nama, gain, nada, pan});
    return [
      // HOOK — eyebrow menyapu, angka meledak masuk, tiap tahun yang dilewati berdetak
      q('Hook', 0.08, 'whoosh', 0.30),
      q('Hook', 0.42, 'impact-wide', 0.30),
      q('Hook', 0.50, 'counter-tick', 0.20),
      ...[0.91, 1.32, 1.74].map((o, i) => q('Hook', o, 'pop-small', 0.16, i * 2, [-0.25, 0, 0.25][i])),
      q('Hook', 2.28, 'riser', 0.26),
      q('Hook', 2.35, 'pop-shimmer', 0.36),
      // DIAGNOSIS — pertanyaan naik, dua headline masuk dari kiri, amber mendarat keras
      q('Diagnosis', -0.15, 'whoosh', 0.32, 2),
      q('Diagnosis', 0.50, 'sweep-line', 0.20),
      q('Diagnosis', 0.72, 'snap', 0.26, 2, -0.25),
      q('Diagnosis', 0.86, 'snap', 0.26, 0, 0.25),
      q('Diagnosis', 2.72, 'thud-heavy', 0.32, -2),
      // LAPORAN — latar jadi terang, kartu masuk, angka berhitung, stempel menghantam
      q('Laporan', -0.15, 'whoosh', 0.34, 3),
      q('Laporan', 0.06, 'pop-panel', 0.28),
      q('Laporan', 0.40, 'counter-tick', 0.22),
      q('Laporan', 1.80, 'click-thick', 0.20),
      q('Laporan', 2.32, 'riser', 0.24),
      q('Laporan', 2.40, 'impact-wide', 0.38),
      q('Laporan', 2.46, 'pop-shimmer', 0.30),
      q('Laporan', 3.02, 'pop-small', 0.18),
      // RANTAI — kembali gelap, tiga simpul terbang masuk, sambungan terakhir putus
      q('Rantai', -0.15, 'whoosh', 0.34, -2),
      ...[0.20, 0.36, 0.52].map((o, i) => q('Rantai', o, 'click-thick', 0.28, i * 2, [-0.35, 0, 0.35][i])),
      q('Rantai', 1.70, 'glitch-cut', 0.40),
      q('Rantai', 1.74, 'thud-heavy', 0.30, -3),
      q('Rantai', 2.25, 'snap', 0.26),
      q('Rantai', 2.60, 'impact-wide', 0.32),
      // BUKTI — dua angka masuk dari dua tepi, garis amber menyatukannya
      q('Bukti', -0.15, 'whoosh', 0.30, 1),
      q('Bukti', 0.22, 'pop-small', 0.26, 0, -0.35),
      q('Bukti', 0.75, 'sweep-line', 0.26),
      q('Bukti', 0.90, 'pop-small', 0.26, 3, 0.35),
      q('Bukti', 1.45, 'chime-up', 0.28, 2),
      // JANJI — italic menyapu, janji mendarat, garis amber ditarik
      q('Janji', -0.15, 'whoosh', 0.28, 2),
      q('Janji', 0.85, 'snap', 0.24),
      q('Janji', 1.50, 'impact-wide', 0.32),
      q('Janji', 1.72, 'sweep-line', 0.26, 2),
      // PAKET — latar terang, tiga kartu, kartu tengah terangkat, tombol CTA menghentak
      q('Paket', -0.32, 'riser', 0.32),
      q('Paket', 0.02, 'impact-wide', 0.36),
      ...[0.50, 0.63, 0.76].map((o, i) => q('Paket', o, 'pop-panel', 0.26, i * 2, [-0.30, 0, 0.30][i])),
      q('Paket', 1.30, 'chime-up', 0.30),
      q('Paket', 1.38, 'pop-shimmer', 0.24, 4),
      q('Paket', 2.15, 'btn-click', 0.34),
      q('Paket', 2.18, 'impact-wide', 0.26, 3),
      q('Paket', S.Paket - 0.85, 'chime-up', 0.24, 5),
    ];
  },

  musik: [{
    nama: 'musik',
    // Lebih panjang dari videonya, lalu dipakai bagian depannya saja: generator menyusun
    // arc penuh sepanjang durasi yang diminta, jadi outro-nya jatuh di luar bagian terpakai.
    detik: ({total}) => total + 10,
    // v2 menaikkan seluruh amplop 2-3 dB dan hasilnya kick bed menutupi VO. Diturunkan
    // 6 dB, di bawah level v1 — tetapi bed-nya TIDAK dibuat mulai dari nol: yang
    // salah levelnya, bukan keputusan supaya bed sudah hidup di bar pertama.
    // Naiknya tetap landai; tukikan di batas scene terdengar seperti musik bolong.
    titik: [
      ['Hook', 0.0, -21], ['Hook', 3.0, -19],
      ['Diagnosis', 1.0, -18],
      ['Laporan', 0.5, -19], ['Laporan', 3.0, -17],
      ['Rantai', 0.5, -18], ['Rantai', 3.0, -16],
      ['Bukti', 0.5, -16],
      ['Janji', 0.5, -17],
      ['Paket', 0.3, -14],
    ],
    fadeOut: ({total}) => [total - 0.85, 0.75],
    // Energinya dipindahkan dari kick ke lapisan atas. Prompt v2 meminta "punchy kick" dan
    // "driving offbeat bass", dan generatornya menurut: hasilnya bed yang dipimpin bunyi
    // dug-dug-dug. Yang membawa tenaga sekarang arpeggio, hi-hat, dan tepuk tangan —
    // semuanya di atas pita bicara, jadi ducking bisa mengurusnya.
    prompt: 'High energy modern corporate tech instrumental, 112 BPM, no vocals, driving and '
      + 'confident from the very first bar. The energy comes from the top layers, not from the '
      + 'drums: a bright pluck arpeggio, a tight ticking hi-hat, light shakers, and wide soft '
      + 'claps carry the movement. The kick is soft, rounded and restrained, mixed well behind '
      + 'those layers, and the bass is a light muted pulse rather than a deep sub. No heavy '
      + 'four-on-the-floor, no booming low end, no trap 808. It opens already moving, then adds '
      + 'a simple hopeful lead, then a full triumphant final section with an extra bright layer. '
      + 'Energy only ever builds, never drops out, and there is no quiet intro. The last third '
      + 'stays at full energy with no breakdown and no fade — the track must still be at its '
      + 'loudest at the forty second mark.',
  }],

  // gainSFX naik 0,70 -> 0,80: tiap SLAM sekarang punya cue-nya sendiri, dan pada 0,70
  // hentakan itu terdengar seperti latar, bukan seperti hentakan.
  //
  // duckMusik ratio 2 -> 3: pada ratio 2 bed hanya mundur sekitar 6 dB, dan itu tidak cukup
  // untuk bed yang punya ketukan tetap. `bedMusik.subG` memotong bodi kick 8 dB di 100 Hz,
  // di atas potongan bawaan library — trek ini memang dipimpin kick-nya.
  mixer: {
    gainVO: 1.45, gainSFX: 0.80,
    duckMusik: {th: 0.14, ratio: 3, attack: 30, release: 240},
    bedMusik: {subG: -8},
  },

  periksa: {busTitik: [1, 6, 12, 18, 24, 29]},
};
