// Grupy.chat — logo animation 8,8 detik, 16:9 (1920x1080 asli). Jalankan: motion all
//
// Sumber: src/grupy-sfx-prompts.md (17 SFX + music bed). Titik hit dibaca ulang dari
// src/grupy-anim-v2.jsx, bukan dari tabel md, supaya cue tetap jatuh bila durasi scene diubah.
//
// TANPA VO: logo loop, semua cerita dibawa SFX. Bunyi yang sudah ada di stok dipakai ulang
// (bubble-pop, confetti, chime, marimba-plink, brand-boom, sub); sisanya digenerate.
// Hentakan besar = SPLAT, dilapis empat dan hanya sekali.
export default {
  nama: 'grupy-logo',
  komposisi: 'Grupy Logo Animation v2.dc.html',
  jsx: 'grupy-anim-v2.jsx',
  kapsi: false,
  keluaran: 'grupy-logo-16x9.mp4',

  suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 1, speed: 1.0, stability: 0.40, similarity: 0.80, style: 0.05},
  lafal: {},
  vo: [],

  tata: {mode: 'jangkar', jeda: 0.15, ekorBiasa: 0.2},

  sfx: [
    // dari stok
    ['pop',     '@stok/bubble-pop'],
    ['konfeti', '@stok/confetti'],
    ['chime',   '@stok/09-chime'],
    ['plink',   '@stok/marimba-plink'],
    ['boom',    '@stok/brand-boom'],
    ['sub',     '@stok/sub'],
    // generate — prompt dari grupy-sfx-prompts.md, dibuat kering supaya bisa ditumpuk
    ['tetes',   1.2, 'Cute cartoon slime droplet slowly forming and stretching, soft wet squishy gooey stretch, subtle rising pitch, playful, dry close-mic, no reverb, no music, single event'],
    ['plip',    0.5, 'Single cartoon water droplet detaching, short wet plip pop, bright and cute, dry, no reverb, no music, one shot'],
    ['jatuh',   0.5, 'Short fast cartoon falling whoosh, rising pitch, light airy swish, ends abruptly, dry, no reverb, no music, one shot'],
    ['splat',   0.8, 'Big juicy cartoon slime splat landing on the floor, wet squishy impact with bouncy low thump, satisfying, punchy, cute game style, dry, no reverb, no music, single hit'],
    ['cipratan',0.7, 'Tiny cartoon water droplets scattering and pattering on the floor, light playful splashes, dry, no reverb, no music, single event'],
    ['goyang',  0.8, 'Cartoon jelly slime wobbling and rising up, rubbery squishy stretch, cute, upward pitch, dry, no reverb, no music, single event'],
    ['boing',   0.5, 'Cute short cartoon jump boing spring sound, bouncy, high pitched, game style, dry, no reverb, no music, one shot'],
    ['squish',  0.5, 'Soft cartoon jelly landing squish, small bouncy thud, cute and wet, dry, no reverb, no music, one shot'],
    ['swoosh',  0.6, 'Quick playful cartoon swoosh moving sideways with small bounce, light and airy, dry, no reverb, no music, one shot'],
    ['kilau',   1.2, 'Magical twinkling sparkle shimmer, multiple tiny glittering chimes, cute, airy, fairy dust, no music, no percussion'],
    ['tink',    0.5, 'Tiny cute high pitched glass tink, single soft blink sound, very short, dry, no reverb, no music, one shot'],
    ['keluar',  0.8, 'Soft gentle reverse shimmer whoosh fading out, airy, calm, short, no impact, no music'],
  ],

  /* Gain dari "Tips mixing" md: impact & confetti ±0 dB, drip & sparkle -8..-12 dB.
     Titik di bawah = titik di grupy-anim-v2.jsx (Drip/Splat/Rise/Wordmark/Hold/Outro). */
  cue: ({C}) => {
    const huruf = Array.from({length: 10}, (_, i) => ({
      // st = W + 0.4 + i*0.055; squash huruf jatuh di st + 0.25
      at: C.Wordmark + 0.4 + i * 0.055 + 0.25, nama: 'plink', gain: 0.24,
      nada: [0, 2, 4, 5, 7, 9, 11, 12, 14, 16][i], pan: -0.45 + i * 0.1,
    }));
    return [
      // Drip — tetesan terbentuk, lepas, jatuh
      {at: C.Drip + 0.00, nama: 'tetes', gain: 0.30},
      {at: C.Splat - 0.40, nama: 'plip',  gain: 0.34},
      {at: C.Splat - 0.38, nama: 'jatuh', gain: 0.30},

      // Splat — HENTAKAN BESAR, lapis empat, sekali
      {at: C.Splat + 0.00, nama: 'splat',    gain: 0.95},
      {at: C.Splat + 0.00, nama: 'boom',     gain: 0.55},
      {at: C.Splat + 0.01, nama: 'sub',      gain: 0.50},
      {at: C.Splat + 0.05, nama: 'cipratan', gain: 0.38},

      // Rise — bangkit, lompat, mendarat, mata, gelembung
      {at: C.Rise + 0.00, nama: 'goyang', gain: 0.40},
      {at: C.Rise + 0.55, nama: 'boing',  gain: 0.55},
      {at: C.Rise + 0.60, nama: 'chime',  gain: 0.22, nada: 7},
      {at: C.Rise + 1.15, nama: 'squish', gain: 0.50},
      {at: C.Rise + 1.15, nama: 'pop',    gain: 0.34, pan: -0.3},
      {at: C.Rise + 1.30, nama: 'pop',    gain: 0.30, pan:  0.3, nada: 3},
      {at: C.Rise + 1.55, nama: 'tink',   gain: 0.20},

      // Wordmark — maskot lompat ke kiri, 10 huruf jatuh, konfeti, kilau
      {at: C.Wordmark + 0.05, nama: 'swoosh', gain: 0.38, pan: -0.4},
      ...huruf,
      {at: C.Wordmark + 0.95, nama: 'konfeti', gain: 0.80},
      {at: C.Wordmark + 0.95, nama: 'chime',   gain: 0.30},
      {at: C.Wordmark + 1.00, nama: 'kilau',   gain: 0.22},

      // Hold — kedip
      {at: C.Hold + 0.90, nama: 'tink', gain: 0.18, nada: 2},

      // Outro — pudar untuk loop
      {at: C.Outro + 0.00, nama: 'keluar', gain: 0.24},
    ];
  },

  /* Bed -14..-18 dB (md), tukikan sekali tepat sebelum SPLAT (IKLAN.md §1).
     8,8 detik → dua bagian terpakai (>= 3 dtk) + [tail] yang tidak terdengar. */
  musik: [{
    nama: 'bed',
    detik: () => 18,
    mulai: 0,
    fadeOut: ({total}) => [total - 0.6, 0.55],
    titik: [
      ['Drip',     0.00, -18],
      ['Splat',   -0.35, -17],
      ['Splat',   -0.10, -26],     // tukikan yang disengaja
      ['Splat',    0.08, -14],
      ['Rise',     0.00, -15],
      ['Wordmark', 0.90, -15],
      ['Wordmark', 1.00, -13],
      ['Hold',     0.00, -15],
    ],
    prompt: 'short cheerful cute logo jingle, playful marimba and pizzicato, bouncy, kawaii game vibe, '
      + 'happy resolve, C major, no vocals, no heavy drums',
    rencana: ({C}) => {
      const hindari = ['vocals', 'heavy drums', 'four-on-the-floor kick', 'trap 808', 'dark',
        'silence', 'empty intro', 'fade in from nothing'];
      return [
        {detik: C.Wordmark, teks: '[intro]', hindari, gaya: ['playful marimba and pizzicato from the very first beat',
          'steady and continuous', 'always present', 'bouncy kawaii game vibe', 'C major', 'cute and cheerful']},
        {detik: 5, teks: '[resolve]', hindari, gaya: ['playful marimba and pizzicato', 'bright glockenspiel on top',
          'happy resolve on C major chord', 'steady and continuous', 'cute and cheerful']},
        {detik: 8.5, teks: '[tail]', hindari, gaya: ['playful marimba resolving', 'steady and continuous', 'C major']},
      ];
    },
  }],

  // Sampul: logo penuh (maskot + wordmark), sesudah konfeti turun
  sampul: {detik: 7.2},

  mixer: {gainSFX: 0.95, gainVO: 1.0},
  periksa: {busTitik: [0.6, 3.3, 7.0]},
};
