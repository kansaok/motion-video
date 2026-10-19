// Konektor Inbox — video promo listing Google Play. 16:9, dengan VO (Rama, 5 Okt 2026).
// Satu baris VO = satu kartu teks (11). Belokan dipanjangkan 7 -> 9 dtk lewat warpB di jsx:
// laptop rotator jatuh di baris 8 (Belokan +2.4), diagram + hentakan di baris 9 (Belokan +5.0).
// Semua data di layar adalah data demo "Toko Ayu" (lihat naskah.md).

export default {
  nama: 'konektor-play-promo',
  komposisi: 'Konektor Play Promo 16x9.dc.html',
  jsx: 'konektor-play-promo.jsx',
  kapsi: true,
  keluaran: 'konektor-play-promo.mp4',

  // Suara DIKUNCI: preset C hype (Rama, 2 Okt 2026), tempo 0.98 (3 Okt 2026).
  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  lafal: {},

  vo: [
    {no: 1,  sc: 'Hook',     off: 0.05, text: 'Chat dari iklan banjir. Siapa yang balas?'},
    {no: 2,  sc: 'Inbox',    off: 0.05, text: 'Semua chat tim, sekarang di satu aplikasi.'},
    {no: 3,  sc: 'Terlewat', off: 0.10, text: 'Chat yang hampir telat langsung ketahuan. Nggak ada yang terlewat!'},
    {no: 4,  sc: 'Wulan',    off: 0.10, text: 'Wulan AI siapkan jawabannya. Tinggal cek, lalu kirim.'},
    {no: 5,  sc: 'Catatan',  off: 0.05, text: 'Catatan internal bikin kerja tim tetap rapi.'},
    {no: 6,  sc: 'Balasan',  off: 0.05, text: 'Balasan cepat? Sekali ketuk!'},
    {no: 7,  sc: 'Belokan',  off: 0.05, text: 'Tapi, iklan mana yang closing?'},
    {no: 8,  sc: 'Belokan',  off: 2.40, text: 'Satu link WhatsApp, chat dibagi rata ke tim.'},
    {no: 9,  sc: 'Belokan',  off: 5.00, text: 'Closing-nya dikirim balik ke Meta!'},
    {no: 10, sc: 'Inti',     off: 0.05, text: 'Jadi, iklan belajar dari pembeli asli.'},
    {no: 11, sc: 'CTA',      off: 0.10, dengar: /konektor|connector/i, coba: 4, text: 'Coba gratis Konektor Inbox di konektor dot id.'},
  ],

  tata: {mode: 'jangkar', jeda: 0.25, ekorBiasa: 0.35, ekor: {CTA: 0.6}},

  sfx: [
    ['sapu',    '@stok/sapu'],
    ['klik',    '@stok/click-soft'],
    ['tik',     '@stok/05-tick'],
    ['gagal',   '@stok/buzz'],
    ['pop',     '@stok/pop-thick'],
    ['ding',    '@stok/notif-ding'],
    ['riser',   '@stok/riser-long'],
    ['hisap',   '@stok/whoosh-rev'],
    ['impact',  '@stok/impact-hit'],
    ['sub',     '@stok/sub-drop'],
    ['chime',   '@stok/chime-send'],
  ],

  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0, pan = 0) => ({at, nama, gain, nada, pan});
    const sapu = (sc, nada = 0) => q(C[sc] - 0.10, 'sapu', 0.14, nada);
    return [
      // Hook: notifikasi menumpuk
      ...[0.42, 0.84, 1.26, 1.68, 2.10, 2.52].map((d, i) => q(C.Hook + d, 'pop', 0.16, i)),
      q(C.Hook + 0.45, 'gagal', 0.12), q(C.Hook + 1.70, 'gagal', 0.12, 2),
      sapu('Inbox'), q(C.Inbox + 1.6, 'tik', 0.12),
      sapu('Terlewat', 2), q(C.Terlewat + 0.7, 'ding', 0.14), q(C.Terlewat + 1.5, 'ding', 0.14, 3),
      sapu('Wulan'), q(C.Wulan + 0.9, 'ding', 0.20), q(C.Wulan + 1.0, 'chime', 0.14),
      sapu('Catatan', -2), q(C.Catatan + 0.5, 'pop', 0.18),
      sapu('Balasan', 2), q(C.Balasan + 0.8, 'klik', 0.22), q(C.Balasan + 1.1, 'ding', 0.14, 4),
      // Belokan: slam "Tapi", laptop, lalu satu-satunya hentakan besar di diagram (+5.0)
      q(C.Belokan + 0.00, 'impact', 0.28, -3), q(C.Belokan + 2.40, 'hisap', 0.18), q(C.Belokan + 2.80, 'tik', 0.14),
      q(C.Belokan + 4.00, 'pop', 0.16), q(C.Belokan + 3.80, 'riser', 0.20),
      q(C.Belokan + 5.00, 'impact', 0.42), q(C.Belokan + 5.02, 'sub', 0.34),
      q(C.Belokan + 5.30, 'hisap', 0.14, 3), q(C.Belokan + 6.40, 'chime', 0.18),
      // Inti: ROAS menghitung naik
      sapu('Inti'), q(C.Inti + 1.0, 'ding', 0.22),
      // CTA
      q(C.CTA + 0.00, 'impact', 0.18, 3), q(C.CTA + 0.40, 'chime', 0.20),
    ];
  },

  musik: [{
    nama: 'bgm',
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'quiet intro', 'fade in', 'sparse'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const inti = ['upbeat energetic tech instrumental', '126 BPM', 'punchy', 'steady and continuous', 'always present'];
      const hentak = C.Belokan + 5.0;
      return [
        b(0, C.Belokan, '[energy]', [...inti, 'confident modern groove from the first beat', 'bright synth stabs', 'crisp claps']),
        b(C.Belokan, hentak, '[build]', [...inti, 'tense then building', 'rising snare roll']),
        b(hentak, total, '[peak]', [...inti, 'bright triumphant', 'full groove']),
        b(total, total + 6, '[tail]', [...inti, 'bright groove continues']),
      ];
    },
    // Bed -17 dB; VO harus >= +12 dB di atas musik. Satu tukikan sebelum hentakan.
    titik: [['Hook', 0, -18.5], ['Belokan', 4.55, -18.5], ['Belokan', 4.60, -28], ['Belokan', 5.00, -28],
      ['Belokan', 5.05, -17.5], ['CTA', 0, -18.5]],
    fadeOut: ({total}) => [total - 0.3, 0.3],
  }],

  sampul: {detik: 1.0},
  mixer: {gainVO: 1.60, gainSFX: 0.95, duckMusik: {th: 0.015, ratio: 12, attack: 20, release: 300}},
  periksa: {busTitik: [1, 10, 20]},
};
