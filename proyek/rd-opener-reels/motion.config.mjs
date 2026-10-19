// Rama Digital — logo opener 5,05 detik, 9:16. Jalankan: motion all
//
// Sumber: src/opener/README.md (struktur 6 babak + titik hit) dan src/opener/sfx-prompts.md
// (10 prompt + tabel balance). Openernya SFX-driven: gambarnya presisi dan sunyi, jadi
// tiap gerak wajib punya bunyinya sendiri — gambar yang menghentak tanpa bunyi terbaca
// sebagai gambar yang LAMBAT (IKLAN.md §2).
//
// TANPA VO. Lima detik tidak cukup untuk satu kalimat: suara ini membaca 15,7 kar/dtk,
// jadi tagline 36 karakter saja sudah 1,9 detik dan babak Hold cuma 1,15 detik. Menaruhnya
// di situ memelarkan opener jadi ± 8 detik dan merusak motif nadanya.
//
// Motif nada C5 -> A4 -> F5 dari spesifikasi dikerjakan dengan SATU berkas marimba dan
// `nada`: 0 · -3 · +5 semitone. Nada pihak generator tidak bisa dipesan, tetapi
// INTERVAL-nya bisa — dan yang membuat motifnya terasa selesai adalah intervalnya.
export default {
  nama: 'rd-opener-reels',
  komposisi: 'Rama Digital Opener.dc.html',
  jsx: 'rd-opener.jsx',
  kapsi: false,                      // tidak ada kapsi di opener, dan tidak perlu ada
  keluaran: 'rama-digital-opener-9x16.mp4',

  suara: {id: 'ZPI4bKVkeIVdAkOA73qX', seed: 20260910, speed: 1.20,
          stability: 0.34, similarity: 0.78, style: 0.38},
  lafal: {},
  vo: [],                            // lihat catatan di kepala berkas

  tata: {mode: 'jangkar', jeda: 0.15, ekorBiasa: 0.2},

  /* Prompt diambil dari src/opener/sfx-prompts.md apa adanya — sudah ditulis kering,
     one-shot, close-mic, supaya bisa ditumpuk dan ditempel presisi. */
  sfx: [
    ['tick',    1.0, 'Two short precise mechanical ticks, a hard plastic ruler edge tapped twice on a wooden drafting table, tight woody knock with a bright pitched click, very fast decay, metronome-like precision, dry close-mic recording, no reverb, no music, no room ambience, single take'],
    ['marimba', 2.0, 'Single warm marimba note struck with a hard mallet, resonant wooden bar, bright clean attack, long natural decay, solo instrument, dry close-mic recording, no reverb, no music, single hit'],
    ['kertas',  1.0, 'A single large sheet of thick drafting paper dropped flat onto a wooden desk, soft airy whump followed by a brief crisp settle of the paper edges, one clean event, dry close-mic recording, no reverb, no music, single take'],
    ['nyala',   1.5, 'A faint electrical light turning on over a drafting table, one soft short shimmer swelling and settling, delicate and clean, no percussion, dry recording, no reverb, no music, single event'],
    ['pensil',  1.0, 'A sharp graphite pencil drawing one long continuous straight line along a steel ruler on thick paper, steady gritty scratching, consistent pressure, slight rising friction as the stroke speeds up, dry close-mic recording, no reverb, no music, single continuous stroke'],
    ['stempel', 1.0, 'A heavy rubber stamp pressed firmly onto paper on a solid wooden desk, deep low thud with a tight wooden knock and a short puff of paper, authoritative single impact, no rattle afterwards, dry close-mic recording, no reverb, no music, single hit'],
    ['geser',   1.0, 'A small metal drafting square sliding quickly across thick paper on a desk, smooth accelerating paper friction, light and airy, no impact at the end, dry close-mic recording, no reverb, no music, single motion'],
    ['kunci',   2.0, 'A precision drafting machine head locking into position, two-stage mechanical click, first a tight high metal snap then an immediate deeper solid clunk, machined aluminium and steel, extremely tight transient, satisfying and expensive sounding, subtle low weight underneath, dry close-mic recording, no reverb, no music, single decisive lock'],
    ['berat',   1.5, 'One short deep sub bass drop landing once and decaying fast, low weight only, no click, no rattle, no melody, no percussion loop, dry recording, no reverb, no music, single hit'],
    ['getar',   2.0, 'A gust of air rushing outward across a desk making several sheets of paper flutter and lift briefly, soft spreading paper rustle moving away from the listener, decaying naturally, no impact, dry close-mic recording, no reverb, no music, single event'],
    ['sapu',    1.0, 'Two quick soft paper swipes, a sheet of tracing paper pulled swiftly sideways across a smooth desk, silky airy friction, very short, bright and clean, no impact, dry close-mic recording, no reverb, no music'],
    ['pad',     2.0, 'A warm sustained ambient chord swelling softly then decaying naturally to silence, F major, mellow analog pad with gentle glass-like bell shimmer on top, calm confident and premium, slow attack, no percussion, no drums, no rhythm'],
    ['kilau',   2.0, 'A very soft high-frequency shimmer sweeping slowly upward, delicate glass-like sparkle, airy and subtle, background layer, no melody, no percussion, dry recording, no music'],
  ],

  /* Gain diturunkan dari tabel balance di sfx-prompts.md (lock = 0 dB, `kunci` 0,95):
     stempel -4 · pensil -9 · kertas -8 · tick -10 · geser -10 · getar -11 · sapu -12 ·
     pad -14 · kilau -17. Marimba tidak ada di tabel itu — dia motifnya, bukan efeknya,
     jadi ditaruh -7 dan nada penutupnya sedikit di atas dua nada pembuka.

     Momen LOCK 2,47s dilapis empat, dan hanya sekali: `geser` menghisap (-0,41 dtk) ·
     `kunci` memberi TITIK-nya · `berat` memberi BERAT-nya · `marimba` +5 menutup motif.
     Titik hit di bawah persis dari src/opener/README.md, dikurangi awal babaknya. */
  cue: ({C}) => [
    // Count 0,00 — tiga tick presisi. Dua yang pertama membawa nada C5 dan A4.
    {at: C.Count + 0.045, nama: 'tick',    gain: 0.30},
    {at: C.Count + 0.045, nama: 'marimba', gain: 0.42, nada:  0},
    {at: C.Count + 0.155, nama: 'tick',    gain: 0.28, pan:  0.15},
    {at: C.Count + 0.155, nama: 'marimba', gain: 0.36, nada: -3},
    {at: C.Count + 0.265, nama: 'tick',    gain: 0.22, pan: -0.15},
    {at: C.Count + 0.300, nama: 'kertas',  gain: 0.38},

    // Grid 0,40 — grid menyala dari tengah
    {at: C.Grid + 0.00, nama: 'nyala', gain: 0.26},

    // System 1,10 — kotak teal digambar (1,12) lalu distempel penuh (1,80)
    {at: C.System + 0.02, nama: 'pensil',  gain: 0.34},
    {at: C.System + 0.70, nama: 'stempel', gain: 0.60},

    // Agent 2,05 — meluncur (2,06), LOCK (2,47), shockwave (2,52)
    {at: C.Agent + 0.01, nama: 'geser',   gain: 0.30},
    {at: C.Agent + 0.42, nama: 'kunci',   gain: 0.95},
    {at: C.Agent + 0.44, nama: 'berat',   gain: 0.67},
    {at: C.Agent + 0.42, nama: 'marimba', gain: 0.55, nada: 5},
    {at: C.Agent + 0.47, nama: 'getar',   gain: 0.27, pan: -0.55},
    {at: C.Agent + 0.50, nama: 'getar',   gain: 0.25, pan:  0.55, nada: -1},

    // Lockup 2,90 — sapuan "Rama" (3,20) dan "Digital" (3,35), settle (3,52)
    {at: C.Lockup + 0.30, nama: 'sapu', gain: 0.24, pan: -0.25},
    {at: C.Lockup + 0.45, nama: 'sapu', gain: 0.24, pan:  0.25, nada: 2},
    {at: C.Lockup + 0.62, nama: 'tick', gain: 0.16, nada: -7},

    // Hold 3,90 — pad F mayor (3,86) dan kilau menyapu (4,20)
    {at: C.Hold - 0.04, nama: 'pad',   gain: 0.19},
    {at: C.Hold + 0.30, nama: 'kilau', gain: 0.13},
  ],

  /* Bed di bawah SFX. Diminta 14 detik untuk dipakai 5,05 — generator selalu menutup
     treknya dengan fade-out sendiri, dan trek 6 detik menaruh fade itu di dalam gambar
     (IKLAN.md §1).

     Putaran pertama memakai `prompt` satu gumpalan dan `check` melaporkan bed BOLONG
     0,00-1,25 detik pada -71 dB: generator menyusun intro-nya sendiri, dan intro itu
     jatuh persis di seperempat pertama video 5 detik. `rencana` memperbaikinya karena
     bagiannya dipesan satu per satu — bagian pertama 3 detik diminta "always present",
     dan bagian kedua 11 detik cuma tempat jatuh fade penutup generator, tidak pernah
     terdengar. Kata "sparse", "quiet", dan "patient" TIDAK dipakai: generator
     menerjemahkannya sebagai senyap, bukan sebagai tipis.

     Amplop naik pelan lalu MENUKIK 8 dB tepat 0,24 detik sebelum LOCK. Mixer akan
     memperingatkannya; di sini peringatan itu memang diharapkan. Sekali saja per video:
     hening sesaat sebelum hentakan terdengar lebih besar daripada hentakan yang datang
     dari musik yang sudah ramai. */
  musik: [{
    nama: 'bed',
    detik: () => 14,
    mulai: 0,
    fadeOut: ({total}) => [total - 0.6, 0.55],
    titik: [
      ['Count',  0.00, -18],
      ['Grid',   0.10, -17],
      ['System', 0.20, -16],
      ['Agent',  0.10, -17],
      ['Agent',  0.34, -25],     // tukikan yang disengaja, 0,24 dtk sebelum LOCK
      ['Agent',  0.44, -13],
      ['Lockup', 0.10, -15],
      ['Hold',   0.00, -15],
    ],
    prompt: 'warm minimal underscore for a premium design-studio logo opener, soft sustained '
      + 'strings with glass bell shimmer and a light wooden pulse, gentle upward build that '
      + 'resolves cleanly on a warm major chord, calm confident and expensive, F major, '
      + 'no drums, no percussion, no kick, no sub bass, no vocals',
    rencana: () => {
      const hindari = ['vocals', 'drums', 'percussion', 'heavy four-on-the-floor kick',
        'booming sub bass', 'trap 808', 'silence', 'empty intro', 'fade in from nothing'];
      return [
        {detik: 3, teks: '[intro]', hindari, gaya: ['warm sustained strings from the very first beat',
          'steady and continuous', 'always present', 'glass bell shimmer on top',
          'premium design studio underscore', 'F major', 'calm and confident']},
        {detik: 11, teks: '[tail]', hindari, gaya: ['warm sustained strings resolving',
          'steady and continuous', 'glass bell shimmer', 'F major', 'calm and confident']},
      ];
    },
  }],

  // Sampul: lockup penuh — mark, wordmark, tagline, alamat situs sudah semuanya di layar.
  sampul: {detik: 4.85},

  // Tidak ada jendela hening: lima detik ini memang penuh dari ujung ke ujung.
  mixer: {gainSFX: 0.95, gainVO: 1.0},

  periksa: {busTitik: [0.2, 1.2, 2.5, 4.0]},
};
