// Iklan "Tangga Sinyal" (V4). Jalankan: motion all
//
// Tesis brief: "Meta cuma sepintar data yang kamu kasih." Dibuat konkret lewat SATU mesin
// yang disuapi tiga hal berbeda — geometri mesinnya tidak bergerak sepanjang tiga putaran,
// yang berubah cuma token yang masuk dan orang yang keluar.
//
// Sengaja TIDAK mengulang V1: di sana argumennya kerugian (200 klik, 3 chat). Di sini
// argumennya kualitas sinyal. Satu-satunya angka yang dipakai adalah angka nyata dari akun
// sendiri; putaran kedua dan ketiga tanpa angka karena ROAS per jenis event belum ada
// datanya, dan brief melarang memakai angka yang belum ada.
export default {
  nama: 'konektor-sinyal',
  komposisi: 'Iklan Tangga Sinyal 9x16.dc.html',
  jugaTulis: [
    'Iklan Tangga Sinyal 4x5.dc.html',
    'Iklan Tangga Sinyal 1x1.dc.html',
    'Iklan Tangga Sinyal 16x9.dc.html',
  ],
  jsx: 'sinyal-scene.jsx',
  kapsi: true,
  keluaran: 'konektor-sinyal-9x16.mp4',

  suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260906, speed: 1.20, stability: 0.22, similarity: 0.80, style: 0.45},

  // "lead form" dibuang dari VO sama sekali. Ditulis apa adanya maupun diganti 'lid form',
  // transkrip balik sama-sama mengembalikan "delete form". Token di layar tetap `Lead`
  // (nama event Meta yang sebenarnya); VO memakai kata Indonesia, sesuai aturan brief.
  lafal: {
    'link click': 'link klik',
  },

  vo: [
    // Mesin 0-4,5 · kotak masuk 0,15 · judul 0,15
    {no: 1,  sc: 'Mesin', off: 0.30, maks: 1.60, text: 'Meta itu mesin.'},
    {no: 2,  sc: 'Mesin', off: 2.00, maks: 2.30, text: 'Sepintar data yang kamu kasih.'},
    // Klik 4,5-9,5 · token jatuh 4,75-5,45 · mesin berdenyut 5,45 · orang keluar 5,55
    {no: 3,  sc: 'Klik',  off: 0.30, maks: 1.90, text: 'Kasih dia link click.'},
    {no: 4,  sc: 'Klik',  off: 2.30, maks: 1.90, text: 'Dia cariin pengklik.'},
    // Lead 9,5-14 · pola yang sama, token berbeda
    {no: 5,  sc: 'Lead',  off: 0.30, maks: 1.80, text: 'Kasih dia isian form.'},
    {no: 6,  sc: 'Lead',  off: 2.20, maks: 2.00, text: 'Dia cariin pengisi form.'},
    // Chat 14-19
    {no: 7,  sc: 'Chat',  off: 0.30, maks: 1.80, text: 'Kasih dia chat asli.'},
    {no: 8,  sc: 'Chat',  off: 2.20, maks: 1.80, text: 'Dia cariin pembeli.'},
    // Sama 19-24 · tiga kartu 19,2 / 19,4 / 19,6 · vonis 20,5
    {no: 9,  sc: 'Sama',  off: 0.30, maks: 1.40, text: 'Mesinnya sama.'},
    {no: 10, sc: 'Sama',  off: 1.80, maks: 2.40, text: 'Yang beda, apa yang kamu suapin.'},
    // CTA 24-28
    {no: 11, sc: 'CTA',   off: 0.30, maks: 2.40, text: 'Kirim balik chat asli, bukan klik.'},
    {no: 12, sc: 'CTA',   off: 2.50, maks: 1.20, text: 'Daftar gratis sekarang!'},
  ],

  tata: {mode: 'jangkar', jeda: 0.12, ekorBiasa: 0.12},

  sfx: [
    ['whoosh',      0.8, 'Very fast short UI transition whoosh, tight and modern, no reverb, one shot'],
    ['machine-hum', 3.0, 'Low steady mechanical machine hum idling, dry, no melody, no music'],
    ['token-drop',  0.9, 'One object dropping into a slot and landing with a soft mechanical clunk, dry, one shot'],
    ['machine-thunk', 1.2, 'Heavy mechanical machine stamping once, deep and solid, dry, one shot'],
    ['spill-out',   1.6, 'Many small light objects tumbling out onto a tray in quick succession, dry, no music'],
    ['low-thud',    1.2, 'Low dull thud with a short dark tail, close mic, dry, one shot'],
    ['chime-up',    1.2, 'Bright confident single note chime, modern and clean, short decay, one shot'],
    ['success-ding', 1.2, 'Bright confident single note success ding, modern and clean, short decay'],
    ['brand-boom',  2.0, 'Cinematic brand boom, bright impact over a deep sub, short clean tail, one shot'],
    ['riser',       1.4, 'Short clean tech riser sweeping upward, no reverb tail, one shot'],
    ['btn-click',   0.5, 'One crisp modern button click, tight and clean, no reverb, one shot'],
  ],

  // Tiga putaran memakai POLA CUE yang sama persis, cuma nada dan gain-nya naik.
  // Telinga menangkap pengulangan itu sebelum otak menangkap argumennya, dan itu memang
  // yang dimaksud: mesinnya sama.
  cue: ({C, S}) => {
    const q = (sc, off, nama, gain, nada = 0, pan = 0) => ({at: C[sc] + off, nama, gain, nada, pan});
    const putaran = (sc, nada) => [
      q(sc, -0.13, 'whoosh', 0.26, nada),
      q(sc, 0.25, 'token-drop', 0.28, nada),
      q(sc, 0.95, 'machine-thunk', 0.30, nada),
      q(sc, 1.10, 'spill-out', 0.22, nada),
    ];
    return [
      q('Mesin', 0.10, 'whoosh', 0.28),
      q('Mesin', 0.30, 'machine-hum', 0.10),
      ...putaran('Klik', -3),
      ...putaran('Lead', 0),
      ...putaran('Chat', 4),
      q('Chat', 2.20, 'chime-up', 0.26, 4),
      // SAMA — tiga kartu, lalu vonisnya
      q('Sama', -0.13, 'whoosh', 0.30, 2),
      ...[0.20, 0.38, 0.56].map((o, i) => q('Sama', o, 'low-thud', 0.24, i * 3, [-0.3, 0, 0.3][i])),
      q('Sama', 1.55, 'success-ding', 0.28),
      // CTA
      q('CTA', -0.45, 'riser', 0.30),
      q('CTA', 0.05, 'brand-boom', 0.36),
      q('CTA', 0.95, 'btn-click', 0.30),
      q('CTA', S.CTA - 1.0, 'success-ding', 0.22, 5),
    ];
  },

  musik: [{
    nama: 'musik',
    detik: ({total}) => total + 10,
    titik: [
      ['Mesin', 0.0, -19], ['Mesin', 3.0, -17],
      ['Klik', 1.0, -17],
      ['Lead', 1.0, -15],
      ['Chat', 1.0, -13],
      ['Sama', 0.5, -11],
      ['CTA', 0.3, -11],
    ],
    fadeOut: ({total}) => [total - 0.85, 0.75],
    prompt: 'Driving minimal tech house corporate instrumental, 110 BPM, no vocals, high energy '
      + 'and confident. A round sub bass and a tight kick run continuously from the first bar to '
      + 'the last, never stopping. It opens focused with dry ticking percussion over that groove, '
      + 'then adds a bright pluck arpeggio, then wide claps and a simple hopeful lead, then a full '
      + 'confident chorus with an extra bright layer. Energy only ever builds, never drops out. '
      + 'The last third stays at full energy with no breakdown and no fade — the track must '
      + 'still be at its loudest at the forty second mark.',
  }],

  // lufsTarget -14,5: encode AAC di MP4 menaikkan true peak ±0,6 dB di atas master WAV,
  // lebih besar dari margin di mixer. True peak batas keras; LUFS dinormalkan Meta.
  mixer: {
    lufsTarget: -14.5,
    gainVO: 1.45, gainSFX: 0.58,
    duckMusik: {th: 0.15, ratio: 2, attack: 40, release: 220},
    bedMusik: {hpf: 82, subF: 105, subG: -9},
  },

  periksa: {busTitik: [1, 6, 11, 16, 20, 25]},
};
