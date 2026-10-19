// Konektor hari 5 — UTM buat iklan ke WhatsApp: UTM = label paket. HABIS mode SYARAT.
// 9:16 utama, 4:5 untuk LinkedIn. Tanpa 16:9 (keputusan Rama 4 Okt). Fakta yang boleh diklaim: naskah.md. Satu baris VO = satu
// kapsi (13 baris). Visual utama = gambar gpt-image-2.5 di src/img/ (aset/img/ aslinya).

export default {
  nama: 'konektor-hari-5',
  komposisi: 'Konektor Hari5 9x16.dc.html',
  jugaTulis: ['Konektor Hari5 4x5.dc.html'],
  jsx: 'hari5-video.jsx',
  kapsi: true,
  keluaran: 'konektor-hari-5-9x16.mp4',

  // Suara DIKUNCI: preset C (Rama, 2 Okt 2026). Tempo 15% lebih pelan (Rama, 3 Okt 2026):
  // speed 1.15 -> 0.98. Sama untuk semua baris.
  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  lafal: {},

  vo: [
    {no: 1,  sc: 'Hook',     off: 0.05, text: 'UTM di link WhatsApp itu nggak kebaca!'},
    {no: 2,  sc: 'Hook',     off: 2.60, text: 'Kecuali lewat satu pintu dulu.'},
    {no: 3,  sc: 'Celah',    off: 0.05, text: 'Pintunya ada di langkah dua.'},
    {no: 4,  sc: 'Label',    off: 0.10, text: 'UTM itu label paket: iklan mana, kampanye apa.'},
    {no: 5,  sc: 'Meta',     off: 0.10, text: 'Di Meta, isi kolom URL Parameters dengan kode otomatis.'},
    {no: 6,  sc: 'Belokan',  off: 0.10, text: 'Tapi link WhatsApp langsung nyobek labelnya!'},
    {no: 7,  sc: 'Belokan',  off: 2.60, text: 'Chat masuk, sumbernya kosong.'},
    {no: 8,  sc: 'Inti',     off: 0.10, text: 'Jadi, UTM harus dibaca sebelum orang masuk WhatsApp.'},
    {no: 9,  sc: 'Langkah1', off: 0.10, text: 'Satu, isi URL Parameters pakai kode otomatis campaign name.'},
    {no: 10, sc: 'Langkah2', off: 0.10, dengar: /konektor|connector/i, coba: 4, text: 'Dua, arahkan iklan ke link rotator Konektor, bukan link WhatsApp langsung.'},
    {no: 11, sc: 'Langkah3', off: 0.20, text: 'Tiga, buka menu Leads. Sumber kampanyenya muncul di tiap chat!'},
    {no: 12, sc: 'CTA',      off: 0.10, text: 'Coba gratis di konektor dot id.'},
    {no: 13, sc: 'CTA',      off: 2.20, text: 'Soalnya UTM di link WhatsApp itu,'},
  ],


  // Jeda antarbaris lebih lega (0.25 dtk) supaya tidak terburu-buru. CTA tanpa ekor panjang:
  // kalimat terakhir menggantung dan video loop ke frame pertama.
  tata: {mode: 'jangkar', jeda: 0.25, ekorBiasa: 0.35, ekor: {CTA: 0.5}},

  sfx: [
    ['sapu',    '@stok/sapu'],
    ['klik',    '@stok/click-soft'],
    ['tombol',  '@stok/btn-click'],
    ['tik',     '@stok/05-tick'],
    ['gagal',   '@stok/buzz'],
    ['pop',     '@stok/pop-thick'],
    ['stempel', '@stok/09-stamp'],
    ['ding',    '@stok/notif-ding'],
    ['riser',   '@stok/riser-long'],
    ['hisap',   '@stok/whoosh-rev'],
    ['impact',  '@stok/impact-hit'],
    ['sub',     '@stok/sub-drop'],
    ['chime',   '@stok/chime-send'],
    ['kirim',   '@stok/dm-kirim'],
  ],

  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0, pan = 0) => ({at, nama, gain, nada, pan});
    const sapu = (sc, nada = 0) => q(C[sc] - 0.10, 'sapu', 0.14, nada);
    return [
      // Hook: link WhatsApp + label sobek, slam teks
      q(C.Hook + 0.30, 'klik', 0.22), q(C.Hook + 1.20, 'hisap', 0.18), q(C.Hook + 1.40, 'gagal', 0.16, 3), q(C.Hook + 2.60, 'impact', 0.22, 3),
      // Celah
      sapu('Celah'), q(C.Celah + 0.20, 'pop', 0.24), q(C.Celah + 1.20, 'stempel', 0.30),
      // Label: tiga paket berlabel
      sapu('Label', 2), q(C.Label + 0.60, 'pop', 0.22, 0, -0.3), q(C.Label + 1.40, 'pop', 0.22, 3), q(C.Label + 2.20, 'pop', 0.22, 6, 0.3),
      // Meta: kolom URL Parameters terisi otomatis
      sapu('Meta', -2), ...[0.8, 1.1, 1.4, 1.7, 2.0].map((d, i) => q(C.Meta + d, 'tik', 0.12, i)), q(C.Meta + 2.60, 'ding', 0.18),
      // Belokan: satu-satunya "tapi", label dirobek, layar merah
      q(C.Belokan + 0.00, 'impact', 0.30, -3), q(C.Belokan + 0.40, 'gagal', 0.20), q(C.Belokan + 2.60, 'pop', 0.20, -2),
      // Inti
      sapu('Inti'), q(C.Inti + 0.20, 'pop', 0.22), q(C.Inti + 2.00, 'stempel', 0.34),
      // Langkah
      q(C.Langkah1 + 0.00, 'impact', 0.18, 2), q(C.Langkah1 + 1.20, 'tik', 0.14),
      q(C.Langkah2 + 0.00, 'impact', 0.18, 4), q(C.Langkah2 + 1.60, 'tombol', 0.26), q(C.Langkah2 + 3.00, 'chime', 0.18),
      // Langkah3: satu-satunya hentakan besar, dilapis empat
      q(C.Langkah3 - 1.30, 'riser', 0.22), q(C.Langkah3 - 0.20, 'hisap', 0.22),
      q(C.Langkah3, 'impact', 0.42), q(C.Langkah3 + 0.02, 'sub', 0.34),
      q(C.Langkah3 + 1.40, 'klik', 0.22), q(C.Langkah3 + 2.40, 'ding', 0.22), q(C.Langkah3 + 2.70, 'chime', 0.20),
      // CTA dan loop
      q(C.CTA + 0.00, 'impact', 0.18, 3), q(C.CTA + 0.40, 'tombol', 0.28), q(C.CTA + 3.40, 'hisap', 0.18),
    ];
  },

  musik: [{
    nama: 'bgm',
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'quiet intro', 'fade in', 'sparse'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const inti = ['upbeat energetic tech instrumental', '126 BPM', 'punchy', 'steady and continuous', 'always present'];
      return [
        b(0, C.Belokan, '[energy]', [...inti, 'curious playful groove from the first beat', 'bright synth stabs', 'crisp claps']),
        b(C.Belokan, C.Langkah1, '[tension]', [...inti, 'tense', 'darker synth', 'tight groove']),
        b(C.Langkah1, C.Langkah3, '[build]', [...inti, 'building', 'rising motif']),
        b(C.Langkah3, total, '[peak]', [...inti, 'bright triumphant', 'full groove']),
        b(total, total + 6, '[tail]', [...inti, 'bright groove continues']),
      ];
    },
    // Musik dijaga pelan: bed -17 dB, VO harus >= +12 dB di atas musik.
    titik: [['Hook', 0, -17], ['Langkah3', -0.45, -17], ['Langkah3', -0.40, -28], ['Langkah3', 0.00, -28],
      ['Langkah3', 0.05, -16], ['CTA', 0, -17]],
    fadeOut: ({total}) => [total - 0.3, 0.3],
  }],

  // Sampul C3 (bin/sampul) ditempel 100 ms pertama: jadi frame 0 di semua platform.
  sampul: {gambar: {'9x16': 'aset/sampul-9x16.png', '4x5': 'aset/sampul-4x5.png'}, mulai: 0, ms: 100},
  mixer: {gainVO: 1.60, gainSFX: 0.95, duckMusik: {th: 0.015, ratio: 12, attack: 20, release: 300}},
  periksa: {busTitik: [1, 10, 20]},
};
