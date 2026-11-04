// BI1MP · Live Bootcamp "Bikin Video Motion untuk Sosmed Tanpa Editor (Claude for Video)" — Reels 9:16, 30 dtk.
// Angle: DREAM untuk content creator — "bayangin konten videomu keren tiap hari, tanpa jago edit".
//
// Urutan kerja (komposisi ditulis tangan, VO dari connector ElevenLabs):
//   connector → aset/vo-luar/vo-NN.mp3 → node tools/impor-vo.mjs → motion plan → motion apply
//   → node tools/timing.mjs → python3 tools/bgm.py → motion sfx → motion mix → motion render → motion check --cepat
//
// Menyimpang dari biasanya, dan sebabnya:
// 1. Musik TIDAK dari ElevenLabs Music: connector di sesi ini versi terbatas (tanpa musik) dan
//    api.elevenlabs.io tidak terjangkau. tools/bgm.py menyintesis trek 120 BPM yang dipatok ke batas
//    scene (bar = 2 dtk): drop tepat di C.Harga (18,0), hening 0,45 dtk sebelumnya. `luar: true`.
// 2. "Claude" dibaca TTS sebagai "Cloud" (IKLAN.md §3) — naskah VO memakai "Klode", layar & kapsi
//    membawa mereknya.
// 3. Detik kata di kapsi komposisi dari silencedetect VO yang sudah diimpor (tempo 1,04).
export default {
  nama: 'claude-for-video',
  komposisi: 'Claude for Video 9x16.dc.html',
  keluaran: 'claude-for-video-9x16.mp4',

  // VO lewat connector ElevenLabs, suara Zandhira (sama dengan TNBP), eleven_v4.
  suara: {id: 'R7biip4PFaCanifKPxe6', model: 'eleven_v4'},
  tempoVO: 1.04,
  lafal: {},

  vo: [
    {no: 1, sc: 'Hook',   off: 0.15, text: 'Bayangin, konten videomu keren tiap hari, tanpa jago edit!'},
    {no: 2, sc: 'Alur',   off: 0.20, text: 'Ide, script, storyboard, sampai video jadi,'},
    {no: 3, sc: 'Claude', off: 0.25, text: 'semua dibantu Klode.'},
    {no: 4, sc: 'Event',  off: 0.35, text: 'Live bootcamp, empat November, via Zoom.'},
    {no: 5, sc: 'Harga',  off: 0.45, text: 'Cuma tiga ratus tujuh puluh sembilan ribu, bonus Member Pro setahun!'},
    {no: 6, sc: 'CTA',    off: 0.90, text: 'Daftar sekarang, wujudkan konten impianmu!'},
  ],
  tata: {mode: 'jangkar', jeda: 0.12, ekorBiasa: 0.3, ekor: {CTA: 0.05}},

  // Semua dari sfx-stok/ — tanpa biaya generate.
  sfx: [
    ['kilau',   '@stok/dreamy-flash'],
    ['sparkle', '@stok/sparkle'],
    ['shine',   '@stok/13-shine'],
    ['notif',   '@stok/alert-soft'],
    ['hitung',  '@stok/counter-digital'],
    ['cap',     '@stok/stamp-final'],
    ['hit',     '@stok/impact-hit'],
    ['sub',     '@stok/sub-drop'],
    ['boom',    '@stok/brand-boom'],
    ['riser',   '@stok/riser--kelas-ctwa-rahasia'],
    ['hisap',   '@stok/whoosh-rev'],
    ['sapu',    '@stok/sapu'],
    ['wush',    '@stok/air-whoosh-soft'],
    ['swish',   '@stok/cut-whoosh'],
    ['pop',     '@stok/pop-soft'],
    ['blip',    '@stok/03-pop'],
    ['centang', '@stok/ding-check'],
    ['chime',   '@stok/chime-up'],
    ['kilauP',  '@stok/sparkle-chime'],
    ['ketik',   '@stok/ketik--nayaka-explainer'],
    ['klik',    '@stok/btn-click'],
    ['kaching', '@stok/kaching'],
    ['logo',    '@stok/logo-hit'],
    ['konfeti', '@stok/confetti-pop'],
    ['jadi',    '@stok/jadi-ding'],
  ],

  cue: ({C, P, total}) => {
    const kartu = [P[2], P[2] + 0.59, P[2] + 1.27, P[2] + 2.3];
    const ra = C.Claude + 1.45;
    const bp = P[5] + 2.2;
    return [
      // HOOK — mimpi: notifikasi berdatangan, angka naik
      {at: 0.02, nama: 'kilau', gain: 0.20},
      {at: 0.10, nama: 'hitung', gain: 0.10, pan: -0.3},
      {at: 0.55, nama: 'notif', gain: 0.26, pan: 0.45},
      {at: 1.15, nama: 'notif', gain: 0.24, nada: 3, pan: -0.45},
      {at: P[1] + 1.76, nama: 'sparkle', gain: 0.16, pan: 0.2},
      {at: P[1] + 2.90, nama: 'cap', gain: 0.38},
      {at: P[1] + 2.92, nama: 'hit', gain: 0.16},
      {at: C.Alur - 0.35, nama: 'wush', gain: 0.14, pan: 0.4},

      // ALUR — tiap kartu punya bunyinya sendiri, nada naik
      ...kartu.flatMap((a, i) => [
        {at: a, nama: 'pop', gain: 0.28, nada: [0, 2, 4, 7][i], pan: i % 2 ? 0.35 : -0.35},
        {at: a - 0.04, nama: 'swish', gain: 0.10, pan: i % 2 ? 0.5 : -0.5},
        {at: a + 0.35, nama: 'centang', gain: 0.13, nada: [0, 2, 4, 7][i]},
      ]),
      {at: kartu[3] + 0.25, nama: 'chime', gain: 0.18},
      {at: C.Claude - 0.45, nama: 'hisap', gain: 0.24},

      // CLAUDE
      {at: C.Claude, nama: 'kilau', gain: 0.24},
      {at: C.Claude + 0.05, nama: 'shine', gain: 0.16},
      {at: C.Claude + 0.42, nama: 'ketik', gain: 0.13},
      {at: P[3] + 1.0, nama: 'kilauP', gain: 0.24},
      {at: ra, nama: 'notif', gain: 0.18, nada: 5},
      ...[0, 1, 2].map((i) => ({at: ra + 0.25 + i * 0.18, nama: 'blip', gain: 0.22, nada: [0, 4, 7][i], pan: (i - 1) * 0.4})),
      {at: ra + 0.40, nama: 'hitung', gain: 0.12},
      {at: C.Event - 0.30, nama: 'wush', gain: 0.15, pan: -0.4},

      // EVENT
      {at: P[4] - 0.20, nama: 'pop', gain: 0.22, nada: -2},
      {at: P[4] + 0.05, nama: 'swish', gain: 0.13},
      {at: P[4] + 0.30, nama: 'sapu', gain: 0.10},
      {at: P[4] + 1.00, nama: 'cap', gain: 0.32},
      {at: P[4] + 1.35, nama: 'pop', gain: 0.22, nada: 2, pan: 0.4},
      {at: P[4] + 2.05, nama: 'blip', gain: 0.24, nada: 5, pan: 0.4},
      {at: P[4] + 2.07, nama: 'klik', gain: 0.12, pan: 0.4},
      {at: P[4] + 2.55, nama: 'shine', gain: 0.18},
      {at: C.Harga - 1.62, nama: 'riser', gain: 0.30},
      {at: C.Harga - 0.45, nama: 'hisap', gain: 0.30},

      // HARGA — hentakan terbesar, lapis empat, sekali per video
      {at: C.Harga,        nama: 'hit',   gain: 0.42},
      {at: C.Harga + 0.01, nama: 'sub',   gain: 0.40},
      {at: C.Harga + 0.02, nama: 'boom',  gain: 0.34},
      {at: C.Harga + 0.04, nama: 'kilau', gain: 0.20},
      {at: P[5] + 0.40, nama: 'kaching', gain: 0.30},
      {at: C.Harga + 0.50, nama: 'shine', gain: 0.16, pan: 0.3},
      {at: bp, nama: 'logo', gain: 0.32},
      {at: bp + 0.03, nama: 'konfeti', gain: 0.18},
      ...[0, 1, 2, 3, 4].map((i) => ({at: bp + 0.55 + i * 0.24, nama: 'pop', gain: 0.22, nada: [0, 2, 4, 5, 7][i], pan: 0.3})),
      {at: bp + 0.55 + 1.2 + 0.1, nama: 'jadi', gain: 0.24},
      {at: C.CTA - 0.35, nama: 'wush', gain: 0.16, pan: 0.4},

      // CTA
      {at: C.CTA + 0.05, nama: 'shine', gain: 0.18},
      {at: C.CTA + 0.15, nama: 'pop', gain: 0.26, nada: -3},
      {at: P[6] + 0.35, nama: 'klik', gain: 0.36},
      {at: P[6] + 0.37, nama: 'chime', gain: 0.20, nada: 2},
      {at: P[6] + 1.10, nama: 'swish', gain: 0.10, pan: 0.4},
      {at: P[6] + 1.67, nama: 'sparkle', gain: 0.20},
      {at: P[6] + 2.40, nama: 'pop', gain: 0.20, nada: 4},
      {at: P[6] + 2.65, nama: 'blip', gain: 0.18, nada: 7},
      {at: P[6] + 2.90, nama: 'kilauP', gain: 0.22},
      {at: total - 1.40, nama: 'jadi', gain: 0.20, nada: 5},
    ];
  },

  musik: [{
    nama: 'bgm', luar: true, mulai: 0, fadeOut: ({total}) => [total - 0.8, 0.8],
    titik: [
      ['Hook', 0, -19], ['Hook', 0.3, -21], ['Alur', 0.2, -21], ['Claude', 0.2, -21], ['Event', 0.2, -21],
      ['Event', 3.4, -19],
      // satu tukikan disengaja sebelum hentakan terbesar (IKLAN.md §1)
      ['Harga', -0.5, -19], ['Harga', -0.1, -28], ['Harga', 0.03, -16], ['Harga', 1.6, -21],
      ['CTA', 0.2, -20], ['CTA', 3.5, -18],
    ],
  }],

  sampul: {detik: 0},
  mixer: {gainVO: 2.0, gainSFX: 0.6, duckMusik: {th: 0.02, ratio: 10, attack: 25, release: 300}},
  periksa: {busTitik: [9.6, 18.05, 24.2]},
};
