// Iklan "Klik Hantu 12 detik" — dibangun ulang untuk retensi. Jalankan: motion all
//
// Data penayangan: rata-rata tonton 2-6 detik pada video 15-30 detik. Lima iklan
// sebelumnya dibangun sebagai argumen dan CTA-nya mendarat di detik 25 — tidak pernah
// sampai. Di sini CTA muncul di detik 2,65 dan tidak pernah pergi.
//
// Naskahnya pendek dan menghentak, satu kalimat per payoff. Tidak ada kalimat penyiapan;
// baris pertama SUDAH isi papan buktinya.
export default {
  nama: 'konektor-hantu-12',
  komposisi: 'Iklan Hantu 12s 9x16.dc.html',
  jugaTulis: [
    'Iklan Hantu 12s 4x5.dc.html',
    'Iklan Hantu 12s 1x1.dc.html',
    'Iklan Hantu 12s 16x9.dc.html',
  ],
  jsx: 'hantu-12-scene.jsx',
  kapsi: true,
  keluaran: 'konektor-hantu-12s-9x16.mp4',

  suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260907, speed: 1.20, stability: 0.22, similarity: 0.80, style: 0.45},

  lafal: {'link click': 'link klik'},

  // Satu baris per payoff, dan tiap baris mendarat TEPAT di hentakan visualnya.
  vo: [
    {no: 1, sc: 'Papan',   off: 0.15, maks: 1.10, text: 'Dua ratus klik.'},
    {no: 2, sc: 'Jawab',   off: 0.00, maks: 1.20, text: 'Tiga yang chat.'},
    {no: 3, sc: 'Bakar',   off: 0.00, maks: 2.35, text: 'Tiga ratus tiga belas ribu hangus.'},
    {no: 4, sc: 'Sebab',   off: 0.00, maks: 2.15, text: 'Meta cuma dikasih link click.'},
    {no: 5, sc: 'Benerin', off: 0.00, maks: 2.40, text: 'Konektor kirim balik chat aslinya.'},
    {no: 6, sc: 'Tutup',   off: 0.00, maks: 1.80, text: 'Daftar gratis sekarang.'},
  ],

  // Tiap baris HARUS mulai tepat di batas scene-nya, karena di situ hentakan visualnya
  // jatuh. `jeda` 0 supaya tidak ada baris yang terdorong maju.
  tata: {mode: 'jangkar', jeda: 0.0, ekorBiasa: 0.05},

  sfx: [
    ['slam-hit',    1.2, 'One hard tight impact hit landing instantly, punchy and dry, no reverb, one shot'],
    ['ghost-puff',  1.4, 'Short airy puff of many small particles blinking out at once, ghostly, dry, one shot'],
    ['sub-drop',    1.8, 'Deep sub bass drop with a short dark tail, cinematic, dry, one shot'],
    ['error-buzz',  1.0, 'Short harsh cold digital error buzzer, dry and glitchy, one shot'],
    ['flip-chime',  1.2, 'Bright confident single note chime as something flips into place, clean, short decay'],
    ['cta-pop',     1.0, 'One bright confident pop as a button appears, modern and clean, short decay, one shot'],
    ['brand-boom',  2.0, 'Cinematic brand boom, bright impact over a deep sub, short clean tail, one shot'],
  ],

  // Satu bunyi per payoff, tepat di hentakannya. Tidak ada bed yang bertahan lama:
  // di 12 detik tiap bunyi harus punya alasan.
  cue: ({C}) => {
    const q = (sc, off, nama, gain, nada = 0) => ({at: C[sc] + off, nama, gain, nada});
    return [
      q('Jawab',   -0.02, 'ghost-puff', 0.30),
      q('Jawab',   0.00,  'slam-hit', 0.34),
      q('Bakar',   0.00,  'sub-drop', 0.32),
      q('Bakar',   0.02,  'slam-hit', 0.26, -3),
      q('Bakar',   0.28,  'cta-pop', 0.28),
      q('Sebab',   0.00,  'error-buzz', 0.30),
      q('Benerin', 0.00,  'flip-chime', 0.32),
      q('Tutup',   0.00,  'brand-boom', 0.34),
    ];
  },

  musik: [{
    nama: 'musik',
    detik: ({total}) => total + 10,
    titik: [
      ['Papan', 0.0, -16],
      ['Jawab', 0.0, -13],
      ['Bakar', 0.0, -12],
      ['Sebab', 0.0, -12],
      ['Benerin', 0.0, -11],
      ['Tutup', 0.0, -10],
    ],
    fadeOut: ({total}) => [total - 0.5, 0.45],
    prompt: 'Driving minimal tech house corporate instrumental, 112 BPM, no vocals, high energy '
      + 'and confident from the very first beat. A round sub bass and a tight kick run '
      + 'continuously from bar one to the last, never stopping, with close hi hats and a bright '
      + 'pluck arpeggio. No intro, no build up, no breakdown — it starts already at full groove '
      + 'and only gains layers. The last third stays at its loudest with no fade.',
  }],

  mixer: {
    lufsTarget: -14.5,
    gainVO: 1.45, gainSFX: 0.50,
    duckMusik: {th: 0.15, ratio: 2, attack: 40, release: 220},
    bedMusik: {hpf: 82, subF: 105, subG: -9},
  },

  periksa: {busTitik: [1, 3, 6, 9, 11]},
};
