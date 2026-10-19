// GrowthCircle — "Sisa Pekan Hidupmu" (Portrait 1080x1920).
// Brief: src/AUDIO-GUIDE.md — timecode-nya benar-benar cocok dengan komposisi, jadi mode
// 'jangkar' aman. Yang tidak cocok cuma panjang naskah: 838 karakter untuk 54,5 detik.
export default {
  nama: 'sisa-pekan',
  komposisi: 'Sisa Pekan Hidupmu - Portrait.html',
  jugaTulis: ['Sisa Pekan Hidupmu.html'],     // versi landscape, timing-nya identik
  keluaran: 'sisa-pekan-9x16.mp4',

  // Cahaya diukur pada baris asli naskah ini: 14,9 kar/dtk di speed 1,00 · 16,2 di 1,10 ·
  // 18,5 di 1,20. Panduan menyarankan 0,95-1,0, tapi di situ bicara saja sudah 56 detik
  // tanpa satu pun jeda. Angka dieja panjang memakan waktu jauh di atas dugaan hitungan kata.
  suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260829, speed: 1.20, stability: 0.42, similarity: 0.80, style: 0.05},

  // Satu kata membuat model menebak; dua kata terbaca jelas.
  lafal: {growthcircle: 'Growth Circle'},

  vo: [
    {no: 1,  sc: 'Sekotak',  off: 0.8, text: 'Ini satu pekan hidupmu. Seratus enam puluh delapan jam.'},
    {no: 2,  sc: 'Sekotak',  off: 2.6, text: 'Sekali lewat, tidak pernah kembali.'},
    {no: 3,  sc: 'Total',    off: 0.7, text: 'Kalau umurmu maksimal enam puluh tahun, seluruh hidupmu hanya tiga ribu seratus dua puluh pekan.'},
    {no: 4,  sc: 'Terpakai', off: 0.5, text: 'Usiamu sekarang dua puluh satu tahun. Seribu sembilan puluh dua pekan sudah terpakai.'},
    {no: 5,  sc: 'Terpakai', off: 3.7, text: 'Tiga puluh lima persen hidupmu… habis.'},
    {no: 6,  sc: 'Sisa',     off: 0.5, text: 'Sisanya dua ribu dua puluh delapan pekan. Itu saja jatahnya.'},
    {no: 7,  sc: 'Tidur',    off: 0.5, text: 'Potong tidur delapan jam sehari: enam ratus tujuh puluh enam pekan hilang.'},
    {no: 8,  sc: 'Tidur',    off: 4.7, text: 'Yang benar-benar kamu sadari: seribu tiga ratus lima puluh dua pekan.'},
    {no: 9,  sc: 'Nyata',    off: 0.7, text: 'Itu semua yang kamu punya untuk kerja, belajar, dan bereksperimen.'},
    {no: 10, sc: 'Takut',    off: 0.6, text: 'Jadi, mau sampai kapan?'},
    {no: 11, sc: 'Takut',    off: 2.2, text: 'Takut bertanya. Takut mencoba. Takut bergerak.'},
    {no: 12, sc: 'Takut',    off: 5.8, text: 'Setiap kotak yang hilang, hilang selamanya.'},
    {no: 13, sc: 'Gerak',    off: 0.6, text: 'Yuk, gerak bersama GrowthCircle. Komunitas yang terus tumbuh.'},
    {no: 14, sc: 'Tumbuh',   off: 0.8, text: 'Semoga semua ilmu dari mentor-mentor GrowthCircle membawa arah perubahan untuk hidupmu.'},
  ],

  // Jangkar panduan cocok dengan komposisi (VO-03 5,2 vs beat 5,1 · VO-04 11,0 vs 10,9),
  // jadi dipakai sebagai batas bawah: baris tidak boleh mulai sebelum gambarnya muncul.
  tata: {mode: 'jangkar', jeda: 0.16, ekorBiasa: 0.35},

  // Panduan §3. Semua kering tanpa reverb — video ini bekerja lewat tekstur butiran
  // (kotak berguguran, grid tumbuh), bukan lewat hentakan sinematik.
  sfx: [
    ['tick-single',      0.5, 'One short dry tick, small and papery, no pitch, no reverb, one shot'],
    ['whoosh-pullback',  4.8, 'Long slow smooth whoosh pulling backwards and widening over five seconds, airy and calm, no impact at the end, dry'],
    ['grid-build',       4.0, 'Granular ticking texture of thousands of tiny dry clicks stacking up into a gentle crescendo, close and papery, no music, no reverb'],
    ['counter-roll',     3.2, 'Rolling mechanical digit counter spinning steadily then stopping with one clean click, dry, close mic'],
    ['dust-fade',        3.2, 'Very quiet airy hiss fading away, like dust settling, no pitch, dry'],
    ['impact-soft',      1.4, 'Soft low muffled impact, gentle and rounded, no reverb tail, one shot'],
    ['charge-up',        2.2, 'Quiet rising energy charge, smooth and hopeful, stopping cleanly at the top, dry'],
    ['granular-fall',    4.0, 'Layered sand and small gravel falling continuously, dry and close, no music, no reverb'],
    ['counter-stop',     0.5, 'One firm decisive mechanical click, dry, one shot'],
    ['pulse-low',        0.9, 'One low soft heartbeat pulse, dull and round, no pitch, dry, one shot'],
    ['question-stinger', 1.6, 'Short tense stinger rising and cutting off abruptly, dry, unsettling, one shot'],
    ['blip-hard',        0.5, 'One hard dry blip, sharp and cold, no reverb, one shot'],
    ['erosion-ticks',    6.0, 'Sparse random dry ticks slowly getting denser over six seconds, like something being eroded grain by grain, no music'],
    ['logo-swoosh',      1.6, 'Smooth bright swoosh with a light shimmer tail, clean and modern, one shot'],
    ['logo-chime',       1.8, 'Soft warm two note brand chime, gentle and confident, short decay'],
    ['sparkle-regrow',   4.0, 'Fine granular particles rising upward, light and hopeful, soft shimmer, no melody'],
    ['warm-pad-hit',     2.0, 'One warm soft pad hit opening gently, hopeful, medium decay, one shot'],
    ['fade-tail',        2.0, 'Long soft reverb tail closing and settling into silence, warm, no attack'],
  ],

  /* Timecode panduan §3, dikonversi ke offset scene. Dua cue diambil dari KOMPOSISI karena
     di situ dokumennya meleset: `counter_stop` ditulis 26,3 padahal penghitung baru berhenti
     di Tidur+6,6; tiga `blip_hard` ditulis 36,2/37,0/37,8 padahal FearLine muncul di
     Takut+1,9/+2,7/+3,5. Yang menang komposisinya. */
  cue: ({C, S}) => {
    const q = (sc, off, nama, gain, nada = 0, pan = 0) => ({at: C[sc] + off, nama, gain, nada, pan});
    return [
      // SEKOTAK — satu kotak, lalu kamera menjauh
      q('Sekotak', 0.2, 'tick-single', 0.30),
      q('Sekotak', 2.5, 'whoosh-pullback', 0.26),
      // TOTAL — 3.120 kotak terbentuk (komposisi: Counter di Total+0,9 dur 3)
      q('Total', -0.5, 'grid-build', 0.28),
      q('Total', 0.9, 'counter-roll', 0.24),
      // TERPAKAI — kotak memudar, lalu kamera zoom ke garis usia (komposisi: Terpakai+4,7)
      q('Terpakai', 0.4, 'dust-fade', 0.24),
      q('Terpakai', 4.6, 'impact-soft', 0.34),
      // SISA — menyala hijau, angka 2.028 berjalan (komposisi: Counter di Sisa+0,7)
      q('Sisa', 0.4, 'charge-up', 0.28),
      q('Sisa', 0.7, 'counter-roll', 0.24),
      // TIDUR — 676 kotak berguguran, lalu angka berhenti di 1.352
      q('Tidur', 0.7, 'granular-fall', 0.30, 0, -0.6),
      q('Tidur', 2.4, 'granular-fall', 0.26, -2, 0.6),
      q('Tidur', 6.6, 'counter-stop', 0.30),
      // NYATA — empat denyut rendah tiap 1,2 detik
      ...[0.5, 1.7, 2.9, 4.1].map((o) => q('Nyata', o, 'pulse-low', 0.30)),
      // TAKUT — pertanyaan, tiga blip, dan kotak yang terus terkikis
      q('Takut', 0.4, 'question-stinger', 0.34),
      ...[1.9, 2.7, 3.5].map((o, i) => q('Takut', o, 'blip-hard', 0.30, i)),
      q('Takut', 1.4, 'erosion-ticks', 0.22),
      // GERAK — hening 0,3 dtk digate di mixer, lalu logo masuk
      q('Gerak', 0.2, 'logo-swoosh', 0.34),
      q('Gerak', 0.6, 'logo-chime', 0.32),
      q('Gerak', 1.0, 'sparkle-regrow', 0.24),
      // TUMBUH — penutup
      q('Tumbuh', 0.5, 'warm-pad-hit', 0.30),
      q('Tumbuh', S.Tumbuh - 1.4, 'fade-tail', 0.26),
    ];
  },

  // Panduan §2: satu trek, tujuh bagian, minor -> mayor di adegan Gerak.
  musik: [{
    nama: 'musik',
    detik: ({total}) => total + 1.0,
    titik: [
      ['Sekotak',  0.0, -24], ['Sekotak', 1.0, -22],   // intro sparse
      ['Terpakai', 0.0, -19],                          // tension build
      ['Tidur',    0.0, -20],                          // drop-off, terasa tenggelam
      ['Nyata',    0.0, -19],                          // held tension
      ['Takut',    0.0, -15],                          // puncak tegang
      ['Gerak',    0.0, -13],                          // release, mayor
      ['Tumbuh',   0.0, -15],                          // outro hangat
    ],
    fadeOut: ({total}) => [total - 1.6, 1.4],
    prompt: 'Cinematic minimal electronic instrumental, 92 BPM, no vocals. Starts sparse and quiet with a single piano note '
      + 'and a sub bass drone, no drums. A slow eighth note arpeggio and a low string swell build tension. Then the high '
      + 'frequencies drop away as if sinking, with a soft heartbeat kick. One held note with a faint ticking clock. '
      + 'Tension peaks with dry drums and short risers. Then it turns to a major key with a wide warm pad and soft claps, '
      + 'feeling like release. It ends with a warm hopeful outro of pad and piano with a long decay, fading fully to silence.',
  }],

  // Panduan §3: "41,8 — potong semua SFX 0,3 detik" tepat sebelum logo masuk. Diikat ke
  // adegan Gerak, dan ditaruh SESUDAH VO-12 selesai supaya suara tidak menembusnya.
  gate: ({C}) => [[C.Gerak - 0.28, C.Gerak + 0.09]],

  // Panduan §4: duck -7 dB, attack 80 ms, release 250 ms.
  mixer: {gainVO: 1.45, gainSFX: 0.62, duckMusik: {th: 0.02, ratio: 8, attack: 80, release: 250}},

  periksa: {busTitik: [0.2, 12, 27, 42, 51]},
};
