// Reels PKRT 40 detik — Perizindo, izin edar PKRT untuk pelaku UMKM.
// PREVIEW: berkas keluarannya diberi watermark di komposisi. Jalankan: motion all
//
// Komposisi ditulis NATIF 9:16 (stage 1080x1920) dan seluruh beat animasinya scene-relatif
// dengan offset yang sudah dipatok ke brief. Karena itu durasi scene DIPERTAHANKAN persis
// seperti aslinya — 4/5/6/7/6/7/5 = 40 detik, dan `OM_PLAYBACK` menyetelnya sebagai loop.
// Kalau satu scene melar, beat di dalamnya tidak ikut bergeser dan ekornya jadi diam.
// Jadi tiap baris VO diberi `maks`: kontrak durasi, bukan harapan.
import {eja} from '../../lib/lafal.mjs';

/* Dilarang di SEMUA bagian musik. Kick yang menonjol dan sub yang dalam menimbun VO:
   elemen paling keras di bus musik jadi kick-nya, di atas pita bicara. Tenaganya dibawa
   lapisan atas — ukulele, marimba, tepuk tangan — yang semuanya di atas pita bicara,
   jadi ducking bisa mengurusnya. */
const HINDARI = ['vocals', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
  'silence', 'empty gaps', 'fade out', 'corporate stock music'];

export default {
  nama: 'perizindo-pkrt',
  komposisi: 'Reels PKRT 40s.dc.html',
  jsx: 'pkrt-reels.jsx',
  // Kapsi ditulis balik ke `const caps` di jsx, jadi teks di layar selalu mengikuti VO.
  // Bentuk `<Captions items={[...]}>` inline yang asli TIDAK dikenali `geserKapsi`:
  // dia mengembalikan 0 tanpa galat dan seluruh kapsi diam-diam meleset.
  kapsi: true,
  keluaran: 'perizindo-pkrt-preview-9x16.mp4',

  /* Suara Cahaya, parameter kampanye yang sudah diuji: style 0,72 memberi ayunan nada yang
     membuat pembacanya terdengar peduli, stability 0,14 menjaga ayunan itu tidak diratakan
     balik jadi pembaca berita. speed 1,20 adalah batas API.
     Diukur pada speed 1,15: Cahaya 17,2 kar/dtk — jadi naskah 40 detik ini ditulis untuk
     ±575 karakter, bukan 668 karakter versi brief. Yang dibuang adalah baris yang
     membacakan ulang teks yang sudah ada di layar. */
  suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260909, speed: 1.20, stability: 0.14, similarity: 0.80, style: 0.72},

  /* Hanya teks yang dikirim ke TTS yang disentuh; teks di layar tetap "500 pcs" dan
     "5.000 pcs" karena begitulah pelaku UMKM menulisnya.
     Angka ditulis sebagai kata: "5.000" berisiko dibaca sebagai desimal, dan itu baru
     ketahuan sesudah satu lintasan TTS penuh. */
  lafal: {
    pkrt: eja('PKRT'),
    angka: (x) => x
      .replace(/\b5\.000\b/g, 'lima ribu')
      .replace(/\b500\b/g, 'lima ratus')
      .replace(/\b14\b/g, 'empat belas'),
    pcs: 'pieces',
  },

  /* Tiap `off` diikat ke beat animasi scene-nya, dibaca dari pkrt-reels.jsx:
       Hook      1,25 kartu merah jatuh · 1,95 layar meredup · 2,05 sticker jadi DIHAPUS
       Momentum  0,25 foto pemilik · 0,40-2,70 angka 0->1.247 · 1,50/2,00/2,50 chip pesanan
       Ditolak   0,25 & 1,50 dua gelembung chat · 2,60 titik mengetik · 3,50/3,90/4,30 stempel ✕
       Kenali    0,30-0,81 kartu P-K-R-T · 1,60 kepanjangan · 2,10 doodle · 2,50 tiga produk
                 3,40/3,90/4,40 tiga fakta · 5,10 permenkes · 5,70 badge izin edar
       Jebakan   0,30/0,60/0,90 tiga kartu kelas · 2,80 "kelasnya kita pilih sendiri"
                 3,80 kartu merah "Salah pilih? Ulang dari nol."
       Solusi    0,30/0,85/1,40/1,95 empat langkah (centang +0,5) · 3,00 kartu 14 hari
                 3,90 rak toko · 4,40 konfeti · 4,50-5,25 empat pintu
       Penutup   0,20-2,35 rangkaian logo · 1,15 konfeti · 1,95 baris CTA · 2,65 nomor WA

     Brief menaruh 19 baris di sini. Dua dibuang karena membacakan ulang teks layar:
     "Sekali beres, aman lima tahun" sudah jadi sticker fakta ketiga, dan "Bukan karena
     kualitasnya" sudah dijawab kartu merah yang berbunyi "Belum ada nomor izin edar PKRT".
     Detik yang dihemat dipakai supaya tiap kalimat sempat selesai sebelum scene berganti. */
  vo: [
    // HOOK — tiga detik pertama adalah saringan. Kalimat pertama sudah berupa angka.
    {no: 1,  sc: 'Hook',     off: 0.20, maks: 1.70, text: 'Sehari laku 500 pcs.'},
    {no: 2,  sc: 'Hook',     off: 1.95, maks: 1.45, text: 'Terus hilang gitu aja.'},

    // MOMENTUM — kilas balik, euforia
    {no: 3,  sc: 'Momentum', off: 0.25, maks: 1.85, text: 'Dua minggu lalu masih lancar.'},
    {no: 4,  sc: 'Momentum', off: 2.20, maks: 2.35, text: 'Orderan masuk terus, stok sampai habis.'},

    // DITOLAK — pintu tertutup, dan sebabnya satu pertanyaan
    {no: 5,  sc: 'Ditolak',  off: 0.25, maks: 2.20, text: 'Ada yang mau ambil 5.000 pcs.'},
    {no: 6,  sc: 'Ditolak',  off: 2.55, maks: 1.35, text: 'Cuma nanya satu hal.'},
    {no: 7,  sc: 'Ditolak',  off: 3.80, maks: 1.70, text: 'Kita belum punya jawabannya.'},

    // KENALI — pencerahan
    {no: 8,  sc: 'Kenali',   off: 0.25, maks: 2.50, text: 'Sabun dan deterjen masuk PKRT.'},
    {no: 9,  sc: 'Kenali',   off: 2.45, maks: 2.15, text: 'Perbekalan Kesehatan Rumah Tangga.'},
    {no: 10, sc: 'Kenali',   off: 4.65, maks: 1.85, text: 'Wajib ada izin edar Kemenkes.'},

    // JEBAKAN — biayanya, lalu risikonya
    {no: 11, sc: 'Jebakan',  off: 0.30, maks: 1.60, text: 'Nah, di sini jebakannya.'},
    {no: 12, sc: 'Jebakan',  off: 2.20, maks: 1.75, text: 'Kelasnya kita pilih sendiri.'},
    {no: 13, sc: 'Jebakan',  off: 3.85, maks: 1.75, text: 'Salah pilih, ulang dari nol.'},

    // SOLUSI — tunjukkan pekerjaannya selesai, jangan sebutkan kemampuannya
    {no: 14, sc: 'Solusi',   off: 0.30, maks: 2.20, text: 'Tenang, bagian ini kami yang bantu.'},
    {no: 15, sc: 'Solusi',   off: 2.70, maks: 2.10, text: '14 hari kerja, beres.'},
    {no: 16, sc: 'Solusi',   off: 4.50, maks: 2.10, text: 'Produkmu siap masuk toko mana aja.'},

    // PENUTUP — 0,20-2,00 dikosongkan untuk rangkaian logo, CTA menyusul sesudahnya.
    // Kata di VO sama persis dengan tulisan di layar, supaya penonton tahu yang dimaksud.
    {no: 17, sc: 'Penutup',  off: 2.10, maks: 1.95, text: 'Yuk cek kelas produkmu, gratis.'},
  ],

  // `jangkar`: detik brief jadi batas bawah. Dengan `maks` di tiap baris, tidak ada scene
  // yang perlu memanjang dan totalnya tetap 40 detik — syarat loop.
  tata: {mode: 'jangkar', jeda: 0.12, ekorBiasa: 0.25},

  /* Kering semua: iklan feed ditonton lewat speaker HP, dan reverb jadi lumpur.
     Nada hangat, bukan tech — ini iklan UMKM, bukan iklan SaaS. */
  sfx: [
    // Hook — hentakan terbesar seluruh iklan, dilapis empat (riser, hisap, transien, sub)
    ['riser-long',   2.2, 'Warm acoustic tension riser building upward to a hard stop, no reverb tail, one shot'],
    ['whoosh-rev',   1.0, 'Short reverse whoosh sucking inward and stopping dead, tight, dry, one shot'],
    ['notif-slam',   1.0, 'One hard phone notification slam, sharp attack, plastic and dry, one shot'],
    ['thud-low',     1.4, 'Heavy dull thud landing on a surface, low and close mic, dry, one shot'],
    ['sub-drop',     1.6, 'Deep clean sub bass drop, low and round, no click, no distortion, one shot'],
    ['glitch',       0.6, 'Very short digital glitch stutter, dry and tight, one shot'],
    ['whoosh-dark',  1.2, 'Short downward pitched dark whoosh, dry, no reverb, one shot'],
    // Momentum — kilas balik, angka berjalan, chip pesanan
    ['rewind',       1.0, 'Short tape rewind reverse zip, analog and dry, one shot'],
    ['riser-soft',   2.6, 'Soft bright rising swell, warm and gentle, no percussion, no tail'],
    ['counter-tick', 2.6, 'Mechanical counter digits ticking upward steadily, dry, close mic, no music'],
    ['blip',         0.5, 'One short cheerful UI notification blip, bright and warm, dry, one shot'],
    // Ditolak — chat masuk, lalu stempel menutup pintu
    ['swoosh-cut',   0.7, 'One fast hard cut swoosh, tight and modern, no reverb, one shot'],
    ['chat-pop',     0.6, 'One soft chat bubble pop message sound, warm and dry, one shot'],
    ['typing',       1.2, 'Very soft typing indicator blips repeating gently, quiet and dry'],
    ['stamp',        1.0, 'One heavy rubber stamp impact on paper, dry, close mic, one shot'],
    // Kenali — huruf mendarat, spidol menggambar, fakta dikonfirmasi
    ['sweep-bright', 1.0, 'Short bright airy transition sweep, clean and warm, no reverb, one shot'],
    ['pop-card',     0.6, 'One playful bouncy pop like a card landing, warm and dry, one shot'],
    ['marker',       1.2, 'A felt marker drawing one quick stroke on paper, dry, close mic, one shot'],
    ['chime-soft',   1.0, 'One soft warm confirmation chime, gentle and clean, short decay, one shot'],
    ['seal',         1.2, 'One soft official seal press with a gentle low body, dry, one shot'],
    // Jebakan — kartu masuk, metronom, lalu kesalahan
    ['card-slide',   0.8, 'One card sliding in and settling, soft paper friction, dry, one shot'],
    ['tick-metro',   1.0, 'One dry metronome tick, wooden and close mic, no reverb, one shot'],
    ['buzz-error',   1.2, 'One short low error buzz with a dull impact, dry and tight, one shot'],
    // Solusi — langkah selesai, konfeti, pintu terbuka
    ['ding-check',   0.9, 'One bright satisfying checkmark ding, clean and warm, short decay, one shot'],
    ['confetti',     1.4, 'One confetti party popper burst with paper flutter, dry, one shot'],
    // Penutup — logo dirakit dari bentuk geometris
    ['pen-draw',     0.9, 'A fine pen drawing one smooth continuous line, soft and dry, one shot'],
    ['bloom',        1.2, 'One soft warm air pad blooming open, gentle, short, one shot'],
    ['tack',         0.4, 'One tight wooden tack click of a solid piece locking into place, dry, one shot'],
    ['swish-rot',    1.2, 'One rotating swish spinning and stopping dead, dry, no tail, one shot'],
    ['shimmer',      2.2, 'A bright metallic bell shimmer sweeping slowly, clean, gentle long decay'],
    ['breath-sweep', 1.6, 'A very soft airy breath sweep passing by, gentle and clean, one shot'],
    ['tail-rev',     1.6, 'One reverse cymbal swell falling downward into silence, clean, one shot'],
  ],

  /* Tiap hentakan di layar punya bunyinya sendiri: gambar yang menghentak tanpa bunyi
     terbaca sebagai gambar yang LAMBAT, bukan gambar yang sunyi.
     Semua `at` scene-relatif dan diturunkan dari beat yang benar-benar ada di jsx. */
  cue: ({C, S, P, E}) => {
    const q = (sc, off, nama, gain, nada = 0, pan = 0) => ({at: C[sc] + off, nama, gain, nada, pan});
    return [
      /* HOOK — pelapisan penuh dipakai SEKALI di seluruh iklan, di sini: kartu merah yang
         jatuh adalah pemicu stop-scroll. Kalau semua hentakan dilapis, tidak ada yang besar. */
      q('Hook', 0.05, 'riser-long', 0.26),
      q('Hook', 1.05, 'whoosh-rev', 0.30),
      q('Hook', 1.25, 'notif-slam', 0.40),
      q('Hook', 1.27, 'thud-low', 0.34, -2),
      q('Hook', 1.29, 'sub-drop', 0.32, -3),
      q('Hook', 1.55, 'glitch', 0.22, 2),
      q('Hook', 2.00, 'whoosh-dark', 0.28, -3),
      q('Hook', 2.05, 'stamp', 0.24, 1),          // sticker LAKU -> DIHAPUS

      // MOMENTUM — kilas balik, angka naik, tiga chip pesanan
      q('Momentum', 0.00, 'rewind', 0.30),
      q('Momentum', 0.20, 'riser-soft', 0.22),
      q('Momentum', 0.40, 'counter-tick', 0.20),
      ...[1.50, 2.00, 2.50].map((o, i) => q('Momentum', o, 'blip', 0.26, i * 2, [-0.3, 0, 0.3][i])),
      q('Momentum', 2.60, 'chime-soft', 0.20, 3), // grafik menyentuh puncaknya

      // DITOLAK — potongan keras, dua pesan, mengetik, tiga stempel makin berat
      q('Ditolak', 0.00, 'swoosh-cut', 0.32, -2),
      q('Ditolak', 0.25, 'chat-pop', 0.28, 0, -0.3),
      q('Ditolak', 1.50, 'chat-pop', 0.28, -2, -0.3),
      q('Ditolak', 2.60, 'typing', 0.16, 0, 0.3),
      ...[3.50, 3.90, 4.30].map((o, i) => q('Ditolak', o, 'stamp', 0.28 + i * 0.04, -i * 2)),
      ...[3.52, 3.92, 4.32].map((o, i) => q('Ditolak', o, 'thud-low', 0.16 + i * 0.04, -i * 2)),

      // KENALI — sapuan terang, empat huruf mendarat naik nada, spidol, tiga fakta, badge
      q('Kenali', 0.00, 'sweep-bright', 0.28),
      ...[0.30, 0.47, 0.64, 0.81].map((o, i) => q('Kenali', o, 'pop-card', 0.28, i * 2, [-0.35, -0.12, 0.12, 0.35][i])),
      q('Kenali', 2.10, 'marker', 0.22),
      ...[3.40, 3.90, 4.40].map((o, i) => q('Kenali', o, 'chime-soft', 0.22, i * 2, [-0.25, 0, 0.25][i])),
      q('Kenali', 5.70, 'seal', 0.28, -1),

      // JEBAKAN — tiga kartu masuk, metronom mulai, lalu kesalahannya
      ...[0.30, 0.60, 0.90].map((o, i) => q('Jebakan', o, 'card-slide', 0.26, i * 2, 0.25 - i * 0.25)),
      q('Jebakan', 2.80, 'tick-metro', 0.24),
      q('Jebakan', 3.30, 'tick-metro', 0.24, 1),
      q('Jebakan', 3.65, 'whoosh-rev', 0.24, 2),
      q('Jebakan', 3.80, 'buzz-error', 0.34),
      q('Jebakan', 3.82, 'thud-low', 0.28, -2),

      // SOLUSI — transisi naik, empat centang naik nada, konfeti, empat pintu
      q('Solusi', 0.00, 'sweep-bright', 0.28, 3),
      ...[0.80, 1.35, 1.90, 2.45].map((o, i) => q('Solusi', o, 'ding-check', 0.26, i * 2, [-0.3, -0.1, 0.1, 0.3][i])),
      q('Solusi', 3.00, 'seal', 0.24, 1),          // kartu 14 hari kerja
      q('Solusi', 3.90, 'pop-card', 0.24, -2),     // rak toko
      q('Solusi', 4.40, 'confetti', 0.30),
      ...[4.50, 4.75, 5.00, 5.25].map((o, i) => q('Solusi', o, 'pop-card', 0.24, i * 2, [-0.3, -0.1, 0.1, 0.3][i])),

      /* PENUTUP — logo dirakit: garis digambar, bidang terisi, tiga keping mengunci.
         Tiga klik keping harus terdengar sebagai SATU frasa berirama, bukan tiga bunyi
         terpisah — jaraknya 0,15 dan 0,18 detik, dan sub hanya di keping ketiga. */
      q('Penutup', 0.20, 'pen-draw', 0.24),
      q('Penutup', 0.20, 'swish-rot', 0.24),
      q('Penutup', 0.55, 'bloom', 0.24),
      q('Penutup', 0.65, 'tack', 0.26, 0, -0.25),
      q('Penutup', 0.80, 'tack', 0.28, 2, 0.25),
      q('Penutup', 0.98, 'tack', 0.30, 4),
      q('Penutup', 1.00, 'sub-drop', 0.26, -2),
      q('Penutup', 1.15, 'confetti', 0.24),
      // sembilan huruf PERIZINDO naik satu per satu, jarak 0,05 detik, pelan
      ...Array.from({length: 9}, (_, i) => q('Penutup', 1.20 + i * 0.05, 'tack', 0.10, 6, -0.4 + i * 0.1)),
      q('Penutup', 1.55, 'shimmer', 0.24, 0, -0.5),
      q('Penutup', 1.60, 'breath-sweep', 0.16, 0, 0.4),
      q('Penutup', 2.65, 'chime-soft', 0.24, 4),   // nomor WhatsApp mendarat
      {at: E[17] + 0.35, nama: 'tail-rev', gain: 0.24},  // menyambung ke awal loop
    ];
  },

  /* Musik disusun PER BAGIAN dan dipatok ke batas scene, bukan satu prompt untuk satu
     gumpalan 40 detik. Satu prompt menyerahkan seluruh susunan lagu ke generator, dan
     puncaknya jatuh di detik yang tidak ada hubungannya dengan cerita.

     Bagian `[tail]` di ujung TIDAK PERNAH terdengar. Dia ada semata supaya fade-out yang
     selalu ditambahkan generator jatuh di luar bagian yang dipakai — kalau tidak, musiknya
     mulai turun di dalam scene Penutup, persis di kalimat CTA. */
  musik: [{
    nama: 'musik',
    detik: ({total}) => total + 12,
    rencana: ({C, total}) => {
      const bagian = (dari, sampai, teks, gaya) => ({detik: sampai - dari, teks, gaya, hindari: HINDARI});
      const DASAR = ['warm acoustic pop', 'ukulele and plucked guitar', 'marimba', 'light finger claps', '100 bpm'];
      return [
        // Tegang tetapi SELALU terdengar. Minta "sparse" atau "quiet" dan generator
        // mengembalikan senyap — dua kali menghasilkan lubang di scene pembuka.
        bagian(0, C.Momentum, '[intro]',
          [...DASAR, 'one insistent repeating muted pluck motif', 'minor key', 'tense but always present', 'no drums yet']),
        bagian(C.Momentum, C.Ditolak, '[verse]',
          [...DASAR, 'full bright beat enters', 'happy major key', 'shaker and claps', 'forward motion', 'sunny']),
        bagian(C.Ditolak, C.Kenali, '[bridge]',
          [...DASAR, 'turns to minor', 'beat thins out to a steady pulse', 'held back and uneasy', 'steady and continuous']),
        bagian(C.Kenali, C.Jebakan, '[verse]',
          [...DASAR, 'bright again', 'marimba carries the main motif', 'clear and friendly', 'gentle groove']),
        bagian(C.Jebakan, C.Solusi, '[break]',
          [...DASAR, 'drums drop to a single ticking pulse', 'tense', 'insistent repeating motif', 'minor key', 'always audible']),
        bagian(C.Solusi, C.Penutup, '[chorus]',
          [...DASAR, 'full band returns', 'most optimistic section', 'wide claps', 'energy only rising', 'build to a peak near the end']),
        bagian(C.Penutup, total, '[outro]',
          [...DASAR, 'warm confident resolve', 'bright and open', 'stays at full energy to the last bar']),
        bagian(total, total + 12, '[tail]', [...DASAR, 'quiet closing chord']),
      ];
    },
    /* Amplop MENGOMPENSASI arc yang sudah dimiliki trek, bukan menambah arc kedua.
       Trek mentah diukur dulu (mean_volume per 3 detik), dan dia naik pelan dari -20,5 dB
       di detik 0 ke -16,8 dB di detik 39. Angka di bawah adalah level yang DIINGINKAN
       dikurangi simpangan itu, jadi scene pembuka tidak jatuh dua kali.

       Satu tukikan yang disengaja: -6 dB di Penutup+0,60, supaya rangkaian bunyi logo
       punya ruang. Brief memintanya, dan mixer memang akan memperingatkannya. */
    titik: [
      ['Hook', 0.00, -16.5], ['Hook', 3.20, -16.5],
      ['Momentum', 0.80, -15.0], ['Momentum', 4.40, -15.2],
      ['Ditolak', 1.00, -17.5], ['Ditolak', 5.20, -17.5],
      ['Kenali', 0.80, -16.0], ['Kenali', 6.20, -16.0],
      ['Jebakan', 0.90, -18.5], ['Jebakan', 5.20, -18.5],
      ['Solusi', 0.90, -16.0], ['Solusi', 6.40, -15.5],
      ['Penutup', 0.15, -15.5], ['Penutup', 0.60, -21.0],  // ruang untuk rangkaian logo
      ['Penutup', 1.35, -15.5], ['Penutup', 4.00, -16.2],
    ],
    fadeOut: ({total}) => [total - 0.8, 0.7],
  }],

  /* Bed diturunkan, ducking diperdalam, VO dinaikkan — ketiganya sekaligus, karena satu
     saja tidak cukup. Diukur PER JENDELA BARIS di pita bicara 300 Hz - 4 kHz (rata-rata
     berkas menipu: VO 31 detik dalam video 40 detik selalu terlihat pelan di rata-rata):

       baris  4 (Momentum)  VO -0,2 dB DI BAWAH musik   <- tenggelam
       baris 14 (Solusi)    VO +1,5 dB
       baris 15 (Solusi)    VO +2,0 dB
       baris 10 (Kenali)    VO +2,7 dB

     Yang menentukan kedalaman ducking adalah THRESHOLD, bukan ratio: th 0,05 melewatkan
     terlalu banyak. th 0,03 dengan ratio 8 adalah setelan yang sudah diuji. */
  mixer: {
    gainVO: 1.75, gainSFX: 0.84,
    duckMusik: {th: 0.03, ratio: 8, attack: 25, release: 260},
    bedMusik: {subG: -8},
  },

  /* Sampul kustom dicuplik di detik 1,60 — saat kartu merah "Produk kamu dihapus" sudah
     mendarat dan bergoyang. Itu bingkai paling memutus scroll di seluruh iklan, dan Meta
     Ads Manager serta TikTok sama-sama menerima gambar sampul terpisah.
     Frame 0 tetap wajib layak sendiri: itu sampul BAWAAN di Reels dan TikTok, dan TikTok
     tidak mengizinkannya diganti sesudah unggah. `motion check` mengukurnya. */
  sampul: {detik: 1.60},

  // Tanpa `gate`. Jeda visual di brief (0:35,2-0:36,9) justru berisi rangkaian bunyi logo;
  // gerbang hening akan mematikan bus SFX dan musik tepat di situ.

  // Titik uji A/B bus SFX: tiap satunya jatuh di cue yang pasti berbunyi.
  periksa: {busTitik: [1.3, 6.0, 12.6, 15.4, 25.8, 32.5, 35.3]},
};
