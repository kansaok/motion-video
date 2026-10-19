// Iklan pelatihan AI perusahaan — Rama Digital, angle "Era AGI". Jalankan: motion all
//
// Zip-nya memuat DUA video: iklan jasa setup (sudah selesai, proyek rama-digital-ads) dan
// yang ini. `init` menolak menebak dan diberi --komposisi="Iklan Claude Cowork 9x16.dc.html".
//
// Komposisi ditulis NATIF 9:16 (stage 1080x1920, PAD 76, semua top absolut < 1920), jadi
// 9:16 dikerjakan duluan tanpa menyentuh .jsx. Rasio lain menyusul.
import {eja} from '../../lib/lafal.mjs';

/* Dilarang di SEMUA bagian musik. Kick yang menonjol dan sub yang dalam pernah membuat
   VO tertimbun di iklan sebelumnya: elemen paling keras di bus musik jadi kick-nya, di
   atas level pita bicara VO. Tenaganya dibawa lapisan atas — arpeggio, hi-hat, tepuk
   tangan — yang semuanya di atas pita bicara, jadi ducking bisa mengurusnya. */
const HINDARI = ['vocals', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
  'silence', 'empty gaps', 'fade out'];

export default {
  nama: 'rama-pelatihan-cowork',
  komposisi: 'Iklan Claude Cowork 9x16.dc.html',
  // Tiga rasio dari SATU .jsx dan SATU master audio. Ketiganya selebar 1080, jadi metrik
  // mendatarnya identik; yang berbeda cuma tingginya. `jugaTulis` menjaga OM_SCENES sama.
  // 16:9 sengaja tidak dibuat: komposisi tegak selalu paling lemah di sana.
  jugaTulis: [
    'Iklan Claude Cowork 4x5.dc.html',
    'Iklan Claude Cowork 1x1.dc.html',
  ],
  jsx: 'cowork-scene.jsx',
  // Tidak ada array kapsi di jsx ini. Tiap scene sudah berupa teks besar di layar.
  kapsi: false,
  keluaran: 'rama-digital-era-agi-9x16.mp4',

  // Suara SAMA dengan iklan jasa setup, dengan parameter yang sama. Dua iklan dari satu
  // merek harus terdengar satu merek, dan penonton iklan ini sebagian sudah menonton itu.
  /* style 0,58 -> 0,72 dan stability 0,20 -> 0,14. Ayunan nada itu yang membuat pembacanya
     terdengar peduli; `stability` yang tinggi meratakannya balik jadi pembaca berita.
     Naskahnya ikut ditulis untuk itu: kalimat pendek, tanda seru dan tanda tanya di tempat
     yang memang naik nadanya, dan koma dipakai sebagai jeda yang disengaja. */
  suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260907, speed: 1.20, stability: 0.14, similarity: 0.80, style: 0.72},

  // Akronim dieja huruf kapital berspasi — bentuk yang terbukti tidak menyatu di TTS.
  // WULAN TIDAK dieja: itu nama, dan memang dibaca sebagai kata.
  // Kunci yang lebih panjang harus di ATAS yang pendek; penggantian jalan urut.
  /* "Claude" harus terdengar Claude, bukan Cloud. Diuji balik lewat speech-to-text pada
     suara yang sama, satu kalimat yang sama:

       ditulis            terdengar
       Claude             "Cloud Kwork"      ✖ mereknya hilang, dan Cowork ikut rusak
       Klod               "Cloud Cowork"     ✖
       Kloud              "Cloud Cowork"     ✖
       Klode              "Claude Cowork"    ✓

     Cloud itu kategori produk lain, dan iklan ini justru menjual kelas tentang Claude. */
  lafal: {
    claude: 'Klode',
    cowork: 'kowork',
    mcp: eja('MCP'),
    agi: eja('AGI'),
    ai: eja('AI'),
  },

  // Tiap `off` diikat ke beat animasi scene-nya:
  //   Nisan     0,05 eyebrow · 0,10-1,20 nisan naik · 1,90 "Era agentic sudah lewat"
  //   Nyala     0,35-1,35 retak · 1,45-2,40 cahaya amber · 1,50-2,70 nisan terbelah
  //             1,75-2,60 "ERA AGI" menyala · 2,70 baris penutup
  //   Sebelum   0,20 headline · 0,75/1,17/1,59/2,01 empat brief · 2,90-4,10 angka 1 ke 47
  //             4,35 "AI-nya pintar. Ingatannya nol." · 4,80-5,50 palang merah
  //   Cowork    0,20 judul · 0,55 panel · tugas selesai 3,00/3,70/4,40/5,00 · 5,20 penutup
  //   MCP       0,18 judul · 0,95 node · 1,50-3,52 empat kabel · 2,35+ chip menyala · 4,50 catatan
  //   Ingatan   0,18 headline · 0,55/1,40/2,25 tiga kartu rantai · 3,60 arti "niteni"
  //   Urgensi   0,15 headline · 0,50-3,30 dua jalur balapan · 2,40 penutup
  //   Tawaran   0,20 headline · 0,85 harga · 1,20 dua kartu · 1,60 bukti · 2,05 tombol CTA
  //
  // `maks` = kontrak durasi per baris. Durasi TTS tidak deterministik.
  vo: [
    // NISAN — hook. Tiga detik pertama menentukan sisanya, jadi kalimat pertama harus
    // sudah berupa pernyataan yang memutus scroll, bukan pembukaan.
    {no: 1,  sc: 'Nisan',    off: 0.25, maks: 2.10, text: 'Era agentic udah mati.'},
    {no: 2,  sc: 'Nisan',    off: 1.95, maks: 2.55, text: 'Tim kamu belum sempat pakai!'},

    // NYALA — nisan retak, terbelah, ERA AGI menyala di belakangnya
    {no: 3,  sc: 'Nyala',    off: 0.40, maks: 2.30, text: 'Yang datang sekarang jauh lebih besar.'},
    {no: 4,  sc: 'Nyala',    off: 2.85, maks: 1.45, text: 'Era AGI!'},

    // SEBELUM — masalahnya, dengan angkanya
    // Masalah harus SPESIFIK, bukan umum, dan biayanya harus punya angka. "AI-nya belum
    // optimal" tidak menggerakkan siapa pun; "empat puluh tujuh kali bulan ini" iya.
    {no: 5,  sc: 'Sebelum',  off: 0.30, maks: 2.65, text: 'Tiap pagi kamu jelasin ulang dari nol.'},
    {no: 6,  sc: 'Sebelum',  off: 2.85, maks: 1.95, text: 'Empat puluh tujuh kali bulan ini!'},
    {no: 7,  sc: 'Sebelum',  off: 4.70, maks: 1.25, text: 'Ingatannya nol.'},

    // COWORK — kunci pertama
    {no: 8,  sc: 'Cowork',   off: 0.25, maks: 1.75, text: 'Kunci pertama: Claude Cowork.'},
    {no: 9,  sc: 'Cowork',   off: 2.45, maks: 2.95, text: 'Satu perintah, empat pekerjaan jalan bareng.'},
    {no: 10, sc: 'Cowork',   off: 5.20, maks: 1.75, text: 'Bukan ngobrol. Kelar!'},

    // MCP — kunci kedua
    {no: 11, sc: 'MCP',      off: 0.20, maks: 1.60, text: 'Kunci kedua: MCP.'},
    {no: 12, sc: 'MCP',      off: 2.40, maks: 2.35, text: 'Agent-nya pegang sistem kantormu,'},
    {no: 13, sc: 'MCP',      off: 4.10, maks: 2.20, text: 'bukan cuma ngobrol di chat.'},

    // INGATAN — kunci ketiga
    // "Observasi, klaim, konteks" dibuang: ketiga kata itu SUDAH terbaca sebagai label di
    // tiga kartu rantainya. VO yang membacakan ulang teks layar memakan detik tanpa
    // menambah apa pun — dan detik itu yang dipakai "niteni", satu-satunya kata di scene
    // ini yang tidak bisa ditebak penonton.
    {no: 14, sc: 'Ingatan',  off: 0.25, maks: 2.90, text: 'Kunci ketiga: ingatan yang nggak hilang.'},
    {no: 15, sc: 'Ingatan',  off: 3.60, maks: 1.85, text: 'Orang Jawa nyebutnya niteni.'},

    // URGENSI — kenapa sekarang
    // Agitasi dengan akibat bisnisnya, bukan dengan sifat produknya.
    {no: 16, sc: 'Urgensi',  off: 0.20, maks: 2.50, text: 'Kompetitormu nggak nunggu kamu paham!'},
    {no: 17, sc: 'Urgensi',  off: 2.40, maks: 1.75, text: 'Selisihnya cuma latihan.'},

    // TAWARAN — harga jatuh bersama angkanya di layar, CTA menyusul sesudah tombolnya
    // muncul. Kelas Rp 9,8 juta perlu angkanya disebut, bukan disembunyikan.
    // CTA menyebut tombolnya DAN alasan menekannya. "Konsultasi" saja tidak menjelaskan
    // apa yang penonton dapat kalau dia menekannya.
    {no: 18, sc: 'Tawaran',  off: 0.90, maks: 2.60, text: 'Mulai sembilan juta delapan ratus ribu.'},
    {no: 19, sc: 'Tawaran',  off: 3.35, maks: 2.20, text: 'Chat WULAN, minta jadwalnya sekarang!'},
  ],

  tata: {mode: 'jangkar', jeda: 0.12, ekorBiasa: 0.12},

  // Kering semua. Iklan feed ditonton lewat speaker HP: reverb jadi lumpur.
  sfx: [
    ['whoosh',       0.8, 'Very fast short UI transition whoosh, tight and modern, no reverb, one shot'],
    ['whoosh-rev',   1.1, 'Short reverse whoosh sucking inward and stopping dead, tight, dry, one shot'],
    ['riser',        1.4, 'Short clean tech riser sweeping upward, no reverb tail, one shot'],
    ['riser-long',   2.6, 'Long rising cinematic tension riser building to a hard stop, clean, no tail'],
    // Hentakan dilapis: transien memberi titiknya, sub memberi beratnya. Satu berkas
    // yang berusaha jadi keduanya selalu kalah pada salah satunya.
    ['impact-wide',  1.8, 'Wide cinematic impact with a deep sub and a short clean tail, one shot'],
    ['impact-hit',   0.7, 'One sharp dry transient hit, very fast attack, no tail at all, one shot'],
    ['sub-drop',     1.6, 'Deep clean sub bass drop, low and round, no click, no distortion, one shot'],
    ['stone-set',    1.6, 'Heavy stone slab settling onto ground, dull and massive, dry, one shot'],
    ['stone-crack',  1.2, 'Dry stone cracking open, sharp splintering rock, close mic, one shot'],
    ['stone-split',  2.0, 'Heavy stone breaking apart and grinding, massive and dry, one shot'],
    ['ignite',       1.8, 'Bright warm energy igniting and blooming outward, clean, no reverb, one shot'],
    ['msg-ping',     0.6, 'One short soft message notification blip, warm and dry, one shot'],
    ['counter-tick', 2.4, 'Mechanical counter digits ticking upward steadily, dry, close mic, no music'],
    ['alarm-tap',    1.0, 'One single soft alarm tap, cold and sparse, dry, no repeat, one shot'],
    ['thud-heavy',   1.2, 'Heavy dull thud landing hard on a surface, dry, close mic, one shot'],
    ['pop-panel',    0.7, 'One soft panel pop appearing, tight and clean, no reverb, one shot'],
    ['task-done',    0.8, 'One short satisfying completion tick, bright and clean, dry, one shot'],
    ['connect',      0.9, 'One clean electrical connection click with a short bright zap, dry, one shot'],
    ['snap',         0.5, 'One tight snappy transient like a finger snap, bright and dry, one shot'],
    ['sweep-line',   1.0, 'Short soft airy sweep of a thin line being drawn across, clean, dry, one shot'],
    ['chime-up',     1.2, 'Bright confident single note chime, modern and clean, short decay, one shot'],
    ['chime-tri',    1.6, 'Three bright ascending chime notes resolving upward, clean and modern, one shot'],
    ['btn-click',    0.5, 'One crisp modern button click, tight and clean, no reverb, one shot'],
  ],

  // C = mulai tiap scene · P = awal tiap baris VO · E = akhirnya · S = durasi scene
  cue: ({C, S}) => {
    const q = (sc, off, nama, gain, nada = 0, pan = 0) => ({at: C[sc] + off, nama, gain, nada, pan});
    return [
      // NISAN — nisan mendarat, lalu diam. Scene ini hidup dari keheningannya.
      q('Nisan', 0.10, 'stone-set', 0.34),
      q('Nisan', 0.12, 'sub-drop', 0.26, -4),
      q('Nisan', 1.90, 'alarm-tap', 0.20, -3),
      // NYALA — hentakan terbesar di seluruh iklan, jadi dilapis empat: riser panjang
      // menariknya, whoosh terbalik menghisap, transien memberi titiknya, sub memberi
      // beratnya. Musiknya ikut menukik di 1,45 lalu meledak — hening sebelum hentakan.
      q('Nyala', 0.35, 'stone-crack', 0.34),
      q('Nyala', 0.20, 'riser-long', 0.30),
      q('Nyala', 1.30, 'whoosh-rev', 0.30),
      q('Nyala', 1.50, 'stone-split', 0.36, -2),
      q('Nyala', 1.52, 'impact-hit', 0.34),
      q('Nyala', 1.54, 'sub-drop', 0.34, -3),
      q('Nyala', 1.75, 'ignite', 0.38),
      q('Nyala', 2.10, 'impact-wide', 0.30),
      // SEBELUM — empat pesan yang sama, lalu angkanya menghitung
      q('Sebelum', -0.15, 'whoosh', 0.30, 2),
      ...[0.75, 1.17, 1.59, 2.01].map((o, i) => q('Sebelum', o, 'msg-ping', 0.24, -i, [-0.3, -0.1, 0.1, 0.3][i])),
      q('Sebelum', 2.90, 'counter-tick', 0.22),
      q('Sebelum', 4.35, 'thud-heavy', 0.30, -2),
      q('Sebelum', 4.80, 'sweep-line', 0.24, -3),
      // COWORK — panel masuk, empat pekerjaan selesai satu per satu
      q('Cowork', -0.15, 'whoosh', 0.32, 3),
      q('Cowork', 0.55, 'pop-panel', 0.28),
      ...[3.00, 3.70, 4.40, 5.00].map((o, i) => q('Cowork', o, 'task-done', 0.26, i * 2, [-0.3, -0.1, 0.1, 0.3][i])),
      q('Cowork', 5.20, 'snap', 0.26),
      // MCP — node muncul, empat kabel tersambung, tiap chip menyala
      q('MCP', -0.15, 'whoosh', 0.30, -2),
      q('MCP', 0.95, 'impact-wide', 0.30),
      ...[2.35, 2.69, 3.03, 3.37].map((o, i) => q('MCP', o, 'connect', 0.26, i * 2, [-0.3, 0.3, -0.3, 0.3][i])),
      q('MCP', 4.50, 'chime-tri', 0.24, 2),
      // INGATAN — tiga kartu rantai, dua sambungan ditarik
      q('Ingatan', -0.15, 'whoosh', 0.30, 1),
      ...[0.55, 1.40, 2.25].map((o, i) => q('Ingatan', o, 'pop-panel', 0.26, i * 2)),
      ...[1.75, 2.60].map((o, i) => q('Ingatan', o, 'sweep-line', 0.22, i * 3)),
      q('Ingatan', 3.60, 'chime-up', 0.22, 2),
      // URGENSI — dua jalur balapan, satu jauh di depan
      q('Urgensi', -0.30, 'riser-long', 0.28),
      q('Urgensi', 0.15, 'impact-wide', 0.32),
      q('Urgensi', 0.50, 'sweep-line', 0.26, 4),
      q('Urgensi', 2.40, 'snap', 0.26, -2),
      // TAWARAN — latar jadi terang, harga mendarat, tombol menghentak
      q('Tawaran', -0.55, 'riser-long', 0.30),
      q('Tawaran', 0.05, 'impact-wide', 0.34),
      q('Tawaran', 0.07, 'impact-hit', 0.30),
      q('Tawaran', 0.85, 'snap', 0.28),
      ...[1.20, 1.38].map((o, i) => q('Tawaran', o, 'pop-panel', 0.24, i * 2, i ? 0.3 : -0.3)),
      q('Tawaran', 2.05, 'btn-click', 0.32),
      q('Tawaran', 2.07, 'impact-hit', 0.28, 3),
      q('Tawaran', 2.09, 'sub-drop', 0.24, -2),
      q('Tawaran', S.Tawaran - 0.85, 'chime-tri', 0.26, 3),
    ];
  },

  /* Musik disusun PER BAGIAN, bukan satu prompt untuk satu gumpalan 55 detik. Itu yang
     dilaporkan sebagai "monoton": generator memilih sendiri di mana lagunya membangun dan
     di mana memuncak, dan tempat itu tidak ada hubungannya dengan ceritanya.

     Tiap bagian di bawah dipatok ke batas scene, jadi bangunan musiknya jatuh persis di
     tempat gambarnya menghentak. Satu teknik lagi yang dipakai di sini: bed DITURUNKAN
     sesaat tepat sebelum nisannya terbelah, lalu meledak masuk — hening sebelum hentakan
     terdengar lebih besar daripada hentakan yang datang dari musik yang sudah ramai.

     Durasi total diturunkan dari jumlah bagian, bukan dari `detik`. Sepuluh detik terakhir
     memang tidak terpakai — itu tempat outro generator jatuh, di luar bagian yang dipakai. */
  musik: [{
    nama: 'musik',
    detik: ({total}) => total + 10,
    rencana: ({C}) => {
      const bagian = (dari, sampai, teks, gaya, hindari) =>
        ({detik: sampai - dari, teks, gaya, hindari: hindari || HINDARI});
      return [
        bagian(0, C.Nyala, '[intro]',
          ['dark cinematic', 'low sustained drone', 'slow ticking pulse', 'sparse but always audible', 'minor key', 'tense']),
        bagian(C.Nyala, C.Sebelum, '[riser and impact]',
          ['tension riser', 'big cinematic hit at the start of the second half', 'bright bloom after the hit', 'triumphant turn', 'shimmering pad']),
        bagian(C.Sebelum, C.Cowork, '[verse]',
          ['restless ticking percussion', 'minor key', 'insistent repeating motif', 'muted pulse bass',
           'steady and continuous', 'tense but always present']),
        bagian(C.Cowork, C.MCP, '[lift]',
          ['bright pluck arpeggio enters', 'hopeful major turn', 'tight hi-hat', 'light shakers', 'forward motion']),
        bagian(C.MCP, C.Urgensi, '[build]',
          ['layers adding one by one', 'confident and steady', 'bright arpeggio', 'wide soft claps', 'energy only rising']),
        bagian(C.Urgensi, C.Tawaran, '[peak]',
          ['highest tension', 'driving offbeat pulse', 'urgent', 'no breakdown']),
        bagian(C.Tawaran, C.Tawaran + 16, '[chorus]',
          ['full triumphant resolve', 'bright confident lead', 'wide and open', 'stays at full energy to the last bar', 'no fade']),
      ];
    },
    /* Amplop ini MENGOMPENSASI, bukan menambah. Trek yang dihasilkan generator sudah punya
       arc-nya sendiri; menumpuk ramp gelap-ke-terang kedua di atasnya membuat ayunannya
       lebih dari 20 dB dan detik-detik pertama jatuh jadi lubang.

       Yang DISENGAJA di sini cuma satu: tukikan 0,45 detik tepat sebelum nisannya terbelah.
       Peringatan "amplop menukik" di mixer memang menyala untuk titik itu — dan di sini itu
       memang yang diminta, bukan kecelakaan. */
    titik: [
      ['Nisan', 0.0, -15], ['Nisan', 3.5, -15],
      ['Nyala', 1.05, -14], ['Nyala', 1.45, -23],   // hening sesaat sebelum belahannya
      ['Nyala', 1.90, -13], ['Nyala', 3.0, -14],
      ['Sebelum', 1.0, -16], ['Sebelum', 4.5, -16],
      ['Cowork', 0.5, -16], ['Cowork', 5.0, -15],
      ['MCP', 1.0, -15],
      ['Ingatan', 1.0, -16],
      ['Urgensi', 0.3, -14],
      ['Tawaran', 0.3, -13],
    ],
    fadeOut: ({total}) => [total - 0.9, 0.8],
  }],

  /* gainSFX 0,86, bukan 0,95. Pada 0,95 encode AAC di MESIN RENDER melonjak ke +0,7 dBTP
     — melanggar batas -1,0 — sementara mixer di mesin ini lolos di -1,3. Master yang sama
     persis, ffmpeg berbeda versi (6.1.1 lawan 8.1.1), dan encoder AAC melonjak paling jauh
     pada materi padat seperti hentakan yang dilapis. Yang diukur RMS turun; yang didengar
     tidak, karena pukulannya tetap dilapis transien + sub. */
  mixer: {
    gainVO: 1.45, gainSFX: 0.86,
    duckMusik: {th: 0.14, ratio: 3, attack: 30, release: 240},
    bedMusik: {subG: -8},
  },

  periksa: {busTitik: [2, 8, 14, 20, 27, 34, 41]},
};
