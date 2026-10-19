// Konektor.id — "Automation Feedback Conversion". Recreate Reels "Meta Automatic Events",
// dengan tempelan dokumen resmi Meta (aset/meta-*.png, diambil 30 Sep 2026) dan solusi Konektor.
// Naskah, pecahan video sumber, dan fakta yang boleh diklaim: naskah.md.
import {eja} from '../../lib/lafal.mjs';

export default {
  nama: 'konektor-feedback-otomatis',
  komposisi: 'Automation Feedback Conversion.dc.html',
  jsx: 'konektor-ad.jsx',
  // Kapsi komposisi = satu kalimat per scene, jendelanya diturunkan dari CUES sendiri, jadi
  // tidak perlu digeser. Beat di dalam scene memakai `at(f) = f * durasi`: ikut melar.
  kapsi: false,
  keluaran: 'konektor-feedback-otomatis-9x16.mp4',

  // Cahaya: suara kampanye. Lafal "Automation Feedback Conversion", "Automatic Events", dan
  // "C T W A" diuji balik lewat STT 30 Sep 2026, 2 dari 2 seed benar tanpa ejaan khusus.
  suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260930, speed: (l) => (l.no === 12 ? 1.05 : 1.20), stability: 0.14, similarity: 0.80, style: 0.72},
  lafal: {CTWA: eja('CTWA')},

  vo: [
    {no: 1,  sc: 'Hook',      off: 0.00, text: 'Meta sekarang bisa nebak sendiri, chat WhatsApp mana yang jadi lead, mana yang closing.'},
    {no: 2,  sc: 'Twist',     off: 0.10, text: 'Tapi tebakan itu nggak otomatis bikin iklan kamu makin pintar.'},
    {no: 3,  sc: 'Nama',      off: 0.10, text: 'Fiturnya namanya Automatic Events.'},
    {no: 4,  sc: 'CaraKerja', off: 0.10, text: 'Chat dari iklan CTWA masuk, AI Meta baca isinya.'},
    {no: 5,  sc: 'Event',     off: 0.10, text: 'Kelihatan kayak lead atau pembelian? Event-nya dicatat.'},
    {no: 6,  sc: 'Twist2',    off: 0.10, text: 'Tapi baca dokumennya. Event itu baru kepakai iklan kalau dilaporkan lewat Conversions API.'},
    {no: 7,  sc: 'Tebak',     off: 0.10, text: 'Dan AI cuma nebak dari kata-kata. CS kamu yang tahu siapa yang beneran transfer.'},
    {no: 8,  sc: 'Solusi',    off: 0.35, dengar: /automation feedback conversion/i, coba: 6, text: 'Di Konektor, ada Automation Feedback Conversion.'},
    {no: 9,  sc: 'Status',    off: 0.10, text: 'CS cukup ganti status lead di inbox.'},
    {no: 10, sc: 'Kirim',     off: 0.10, text: 'Konektor kirim Lead atau Purchase, lengkap sama nominalnya, ke Meta. Otomatis.'},
    {no: 11, sc: 'Log',       off: 0.10, text: 'Tiap kiriman tercatat. Kelihatan mana yang masuk, mana yang gagal.'},
    // CTA: kalimat terakhir, baris sendiri, intonasi naik. Kata VO = tulisan tombol.
    {no: 12, sc: 'CTA',       off: 0.15, style: 0.95, stability: 0.05, dengar: /daftar gratis/i, coba: 6,
      text: 'Daftar gratis sekarang di Konektor.id!'},
  ],

  // jangkar: durasi brief (OM_SCENES) jadi batas bawah, supaya beat animasi punya ruang.
  tata: {mode: 'jangkar', jeda: 0.12, ekorBiasa: 0.30, ekor: {CTA: 1.4}},

  sfx: [
    ['sapu',     '@stok/sapu'],
    ['spidol',   '@stok/marker-sweep'],
    ['centang',  '@stok/pen-check'],
    ['chat',     '@stok/chat-pop'],
    ['pindai',   '@stok/pindai'],
    ['pop',      '@stok/pop-thick'],
    ['klik',     '@stok/click-soft'],
    ['tombol',   '@stok/btn-click'],
    ['notif',    '@stok/notif-ding'],
    ['kirim',    '@stok/dm-kirim'],
    ['kasir',    '@stok/kasir-struk'],
    ['gagal',    '@stok/buzz'],
    ['chime',    '@stok/chime-send'],
    ['riser',    '@stok/riser-long'],
    ['hisap',    '@stok/whoosh-rev'],
    ['impact',   '@stok/impact-hit'],
    ['sub',      '@stok/sub-drop'],
  ],

  // Beat animasi di konektor-ad.jsx memakai `at(f) = f * durasi scene`, jadi cue ditulis
  // sebagai pecahan scene yang sama: b('Status', 0.43) = dropdown berubah ke Won.
  cue: ({C, S, total}) => {
    const b = (sc, f) => C[sc] + f * S[sc];
    const q = (at, nama, gain, nada = 0, pan = 0) => ({at, nama, gain, nada, pan});
    const sapu = (sc, nada = 0) => q(C[sc] - 0.10, 'sapu', 0.12, nada);
    return [
      // Hook: kartu dok turun, dua highlight digores, LEAD lalu CLOSING
      q(0.00, 'pop', 0.24),
      q(b('Hook', 0.30), 'spidol', 0.30, 0, -0.2),
      q(b('Hook', 0.42), 'spidol', 0.26, 2, 0.2),
      q(b('Hook', 0.60), 'pop', 0.32, 2, -0.2),
      q(b('Hook', 0.80), 'pop', 0.34, 5, 0.2),
      // Twist: ikon AI bertanda tanya, lalu tanda ≠
      sapu('Twist'),
      q(b('Twist', 0.08), 'pop', 0.24, -2),
      q(b('Twist', 0.34), 'gagal', 0.18),
      // Nama: zoom ke checkbox, centang, label
      sapu('Nama', 2),
      q(b('Nama', 0.36), 'centang', 0.40),
      q(b('Nama', 0.46), 'notif', 0.20),
      // CaraKerja: iklan diketuk, chat masuk dua gelembung, pemindai membaca
      sapu('CaraKerja', -2),
      q(b('CaraKerja', 0.22), 'klik', 0.26),
      q(b('CaraKerja', 0.36), 'chat', 0.26, 0, -0.2),
      q(b('CaraKerja', 0.44), 'chat', 0.26, 3, 0.2),
      q(b('CaraKerja', 0.58), 'pindai', 0.22),
      // Event: dua chip
      sapu('Event', 3),
      q(b('Event', 0.16), 'pop', 0.28, 0, -0.3),
      q(b('Event', 0.50), 'pop', 0.28, 4, 0.3),
      q(b('Event', 0.70), 'klik', 0.20, 7),
      // Twist2: spidol di Conversions API
      sapu('Twist2'),
      q(b('Twist2', 0.12), 'spidol', 0.32),
      // Tebak: tebakan AI kalah, transfer masuk menang
      sapu('Tebak', -3),
      q(b('Tebak', 0.10), 'gagal', 0.16, -2, -0.3),
      q(b('Tebak', 0.28), 'kasir', 0.30, 0, 0.3),
      q(b('Tebak', 0.60), 'pop', 0.28, 5, 0.3),
      // Solusi: satu-satunya hentakan besar, dilapis empat
      q(C.Solusi - 1.30, 'riser', 0.22),
      q(C.Solusi - 0.20, 'hisap', 0.22),
      q(C.Solusi, 'impact', 0.42),
      q(C.Solusi + 0.02, 'sub', 0.34),
      // Status: klik dropdown, pilih Won, popup nilai, simpan
      sapu('Status', 2),
      q(b('Status', 0.24), 'klik', 0.26),
      q(b('Status', 0.43), 'tombol', 0.30),
      q(b('Status', 0.50), 'pop', 0.24, 3),
      q(b('Status', 0.80), 'tombol', 0.30, 2),
      // Kirim: paket lepas, terbang, mendarat di Meta
      sapu('Kirim', 4),
      q(b('Kirim', 0.05), 'pop', 0.24),
      q(b('Kirim', 0.16), 'kirim', 0.30),
      q(b('Kirim', 0.63), 'chime', 0.30),
      // Log: tiga baris, baris ketiga gagal
      sapu('Log', -2),
      q(b('Log', 0.14), 'klik', 0.22),
      q(b('Log', 0.30), 'klik', 0.22, 3),
      q(b('Log', 0.46), 'gagal', 0.18),
      // CTA: logo, tombol berdenyut
      sapu('CTA', 5),
      q(C.CTA + 0.05, 'pop', 0.30),
      q(b('CTA', 0.24), 'tombol', 0.32),
      q(total - 1.2, 'chime', 0.20),
    ];
  },

  musik: [{
    nama: 'bgm',
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'quiet intro', 'fade in', 'sparse'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const inti = ['modern tech corporate instrumental', '120 BPM', 'bright pluck arpeggio', 'crisp hi-hats and claps',
        'steady and continuous', 'always present'];
      return [
        b(0, C.CaraKerja, '[hook]', [...inti, 'curious and tense', 'starts on the first beat', 'insistent repeating motif']),
        b(C.CaraKerja, C.Solusi, '[build]', [...inti, 'rising tension', 'motif grows layer by layer']),
        b(C.Solusi, C.CTA, '[lift]', [...inti, 'bright confident chorus', 'hopeful lead', 'full groove']),
        b(C.CTA, total, '[end]', [...inti, 'confident chorus continues', 'full groove']),
        b(total, total + 8, '[tail]', [...inti, 'chorus continues']),
      ];
    },
    // Tukikan 0,45 dtk sebelum hentakan Solusi; sisanya rata (trek `rencana` sudah rata).
    titik: [['Hook', 0, -15], ['Solusi', -0.50, -15], ['Solusi', -0.45, -24], ['Solusi', 0.00, -24],
      ['Solusi', 0.05, -13], ['CTA', 0, -12]],
    fadeOut: ({total}) => [total - 0.6, 0.6],
  }],

  sampul: {detik: 0},
  mixer: {gainVO: 1.60, gainSFX: 0.95, duckMusik: {th: 0.015, ratio: 14, attack: 25, release: 320}},
};
