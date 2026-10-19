// Iklan "Klik Hantu" POTONGAN 15 DETIK. Jalankan: motion all
//
// Sudut yang menang, dipendekkan. Untuk kampanye performa langkah berikutnya bukan konsep
// kelima, tapi lebih banyak tembakan dengan sudut yang sudah terbukti — dan potongan
// pendek punya CPM lebih murah untuk diuji.
//
// Salinan terpisah dari proyek 30 detik, bukan sunting berkasnya. Versi 30 detik sudah
// disetujui dan sudah terunggah; menyuntingnya berarti mempertaruhkan aset yang sudah
// jalan demi aset yang belum tentu dipakai.
//
// Yang dipertahankan cuma tulang ceritanya: 200 klik masuk, 197 menguap, CTA. Tiga scene
// yang menjelaskan SEBAB dibuang — di 15 detik tidak ada ruang untuk sebab, cuma untuk luka.
export default {
  nama: 'konektor-klik-hantu-15',
  komposisi: 'Iklan Klik Hantu 15s 9x16.dc.html',
  jugaTulis: [
    'Iklan Klik Hantu 15s 4x5.dc.html',
    'Iklan Klik Hantu 15s 1x1.dc.html',
    'Iklan Klik Hantu 15s 16x9.dc.html',
  ],
  jsx: 'klik-hantu-15-scene.jsx',
  kapsi: true,
  keluaran: 'konektor-klik-hantu-15s-9x16.mp4',

  suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260906, speed: 1.20, stability: 0.22, similarity: 0.80, style: 0.45},

  lafal: {cpc: 'C P C'},

  vo: [
    {no: 1, sc: 'Klik', off: 0.30, maks: 2.40, text: 'Bulan lalu saya bayar dua ratus klik.'},
    {no: 2, sc: 'Klik', off: 2.70, maks: 1.60, text: 'CPC-nya murah banget.'},
    {no: 3, sc: 'Sepi', off: 0.30, maks: 2.30, text: 'Yang beneran chat, cuma tiga.'},
    {no: 4, sc: 'Sepi', off: 3.00, maks: 2.60, text: 'Sisanya hilang. Klik hantu.'},
    {no: 5, sc: 'CTA',  off: 0.30, maks: 2.10, text: 'Lacak chat asli, bukan klik.'},
    {no: 6, sc: 'CTA',  off: 2.50, maks: 1.30, text: 'Daftar gratis sekarang!'},
  ],

  tata: {mode: 'jangkar', jeda: 0.12, ekorBiasa: 0.12},

  sfx: [
    ['whoosh',       0.8, 'Very fast short UI transition whoosh, tight and modern, no reverb, one shot'],
    ['dot-cascade',  2.4, 'Rapid fine granular ticking of many small dots appearing one by one, dry, no music'],
    ['odo-roll',     2.6, 'Mechanical odometer digits rolling upward steadily, dry, close mic, no music'],
    ['ui-tick',      0.5, 'One small soft interface tick, warm and rounded, no reverb, one shot'],
    ['ghost-vanish', 2.2, 'Airy reversed swell of many small particles evaporating upward into thin air, ghostly, no music'],
    ['sub-drop',     1.8, 'Deep sub bass drop with a short dark tail, cinematic, dry, one shot'],
    ['chat-pop',     0.6, 'One short soft chat message pop bubble, tight and clean, no reverb, one shot'],
    ['error-buzz',   1.0, 'Short harsh cold digital error buzzer, dry and glitchy, one shot'],
    ['brand-boom',   2.0, 'Cinematic brand boom, bright impact over a deep sub, short clean tail, one shot'],
    ['riser',        1.4, 'Short clean tech riser sweeping upward, no reverb tail, one shot'],
    ['btn-click',    0.5, 'One crisp modern button click, tight and clean, no reverb, one shot'],
  ],

  cue: ({C, S}) => {
    const q = (sc, off, nama, gain, nada = 0, pan = 0) => ({at: C[sc] + off, nama, gain, nada, pan});
    return [
      q('Klik', 0.10, 'whoosh', 0.30),
      q('Klik', 0.35, 'dot-cascade', 0.10),
      q('Klik', 0.35, 'odo-roll', 0.10),
      q('Klik', 2.15, 'ui-tick', 0.26, 3),
      q('Klik', 2.45, 'ui-tick', 0.26, 6),
      q('Sepi', -0.13, 'whoosh', 0.32, -2),
      q('Sepi', 0.55, 'ghost-vanish', 0.17),
      q('Sepi', 2.00, 'sub-drop', 0.34),
      ...[2.45, 2.63, 2.81].map((o, i) => q('Sepi', o, 'chat-pop', 0.30, i * 3, i % 2 ? 0.3 : -0.3)),
      q('Sepi', 4.20, 'error-buzz', 0.28),
      q('CTA', -0.45, 'riser', 0.30),
      q('CTA', 0.05, 'brand-boom', 0.36),
      q('CTA', 0.95, 'btn-click', 0.30),
      q('CTA', S.CTA - 1.0, 'ui-tick', 0.22, 5),
    ];
  },

  // Musik diminta 25 detik untuk video 15 detik. Alasan yang sama seperti biasa: generator
  // menaruh outro-nya di ujung durasi yang diminta, dan di sini ujung itu jatuh di CTA.
  musik: [{
    nama: 'musik',
    detik: ({total}) => total + 10,
    titik: [
      ['Klik', 0.0, -18], ['Klik', 3.0, -15],
      ['Sepi', 1.0, -14],
      ['CTA', 0.3, -11],
    ],
    fadeOut: ({total}) => [total - 0.85, 0.75],
    prompt: 'Driving minimal tech house corporate instrumental, 110 BPM, no vocals, high energy '
      + 'and confident. A round sub bass and a tight kick run continuously from the first bar to '
      + 'the last, never stopping. It opens focused with dry ticking percussion over that groove, '
      + 'then adds a bright pluck arpeggio, then wide claps and a simple hopeful lead. Energy only '
      + 'ever builds, never drops out. The last third stays at full energy with no breakdown and '
      + 'no fade — the track must still be at its loudest at the twenty five second mark.',
  }],

  mixer: {
    lufsTarget: -14.5,
    gainVO: 1.45, gainSFX: 0.44,
    duckMusik: {th: 0.15, ratio: 2, attack: 40, release: 220},
    bedMusik: {hpf: 82, subF: 105, subG: -9},
  },

  periksa: {busTitik: [1, 5, 9, 13]},
};
