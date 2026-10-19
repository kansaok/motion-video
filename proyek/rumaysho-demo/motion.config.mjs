// Biro Jodoh Rumaysho — "Dari daftar sampai menikah", demo aplikasi 90 detik 9:16.
// Jalankan: motion all proyek/rumaysho-demo
//
// Sumber brief: src/"Naskah Audio (VO, BGM, SFX).dc.html" di dalam zip yang sama.
// Empat keputusan yang menyimpang dari bawaan mesin, beserta sebabnya:
//
// 1. DURASI SCENE TIDAK BOLEH BERUBAH. demo-scenes.jsx memakai dua timeline DETIK
//    ABSOLUT — `CAM` (jalur kamera 0-90 dtk) dan `CUR` (jalur kursor). Keduanya tidak
//    ikut bergeser waktu scene memanjang, jadi satu scene yang melar 0,5 detik membuat
//    kursor menekan tombol yang sudah tidak ada di layar. `init` melaporkan "0 array
//    absolut" karena dia memeriksa animations-v3.jsx, BUKAN berkas scene-nya.
//    Akibatnya: tiap baris VO diberi `maks`, dan naskahnya ditulis untuk muat.
//
// 2. MUSIK TANPA SATU PUN ALAT. Brief menulisnya sebagai syarat adab, bukan selera:
//    nasyid a cappella, suara manusia saja. Seluruh daftar alat masuk `hindari`, dan
//    SFX bernada (lonceng, chime) diganti ketukan, kertas, dan napas.
//
// 3. DUA SUARA. Narator ikhwan (Firman) untuk seluruh video; baris yang membahas sisi
//    akhwat — daftar calon dan CV ta'aruf — diisi suara akhwat (Citra) lewat `voice`
//    per baris. Brief menandainya [A].
//
// 4. FRAME 0 DIPERBAIKI DI KOMPOSISI. Judul dan lockup dulu masuk di detik 0,3 dan 0,1,
//    jadi frame pertama nyaris kosong — dan itu sampul bawaan Reels/TikTok (IKLAN.md §5).
//    Sekarang keduanya SELESAI di T=0 dan yang bergerak adalah kameranya.
export default {
  nama: 'rumaysho-demo',
  komposisi: 'Video Demo Aplikasi.dc.html',
  // `jugaTulis` dari kerangka init DIHAPUS: "Video Marketing.dc.html" bukan orientasi
  // lain, melainkan VIDEO LAIN. Dibiarkan, durasi scene-nya ikut ditimpa durasi video ini.
  jsx: 'demo-scenes.jsx',
  kapsi: true,
  keluaran: 'rumaysho-demo-9x16.mp4',

  // Firman 16,0 kar/dtk pada speed 1,0 (diukur `motion speed`). speed 1,08 -> ± 17 kar/dtk.
  // `style` 0,28 — jauh di bawah 0,72 kampanye Rama Digital: brief meminta "hangat, tenang,
  // tanpa energi hard-sell", dan 0,72 membuatnya terdengar berjualan.
  suara: {id: 'i8CJLmX03JoyL7Dl2LaT', seed: 20260911, speed: 1.08,
          stability: 0.42, similarity: 0.82, style: 0.28},

  // Suara akhwat untuk baris bertanda [A] di brief.
  suaraA: 'RbNgJzKAV7jpYJNtCBpj',

  /* Domain punya DUA titik dan hanya yang terakhir dikenali `L.domain()` sebagai TLD.
     Titik pertama dibiarkan, TTS membacanya sebagai akhir kalimat: "birojodoh. rumaysho
     dot kom". Ditulis utuh di sini; teks layar dan kapsi tidak tersentuh. */
  lafal: {
    // `rumaysho` terbaca "roommyshow" waktu ditranskrip balik — vokalnya jatuh ke
    // Inggris. Diuji tiga ejaan pada suara yang sama; `rumaysyo` yang kembali persis
    // sebagai "rumaysho".
    'birojodoh\\.rumaysho\\.com': 'birojodoh dot rumaysyo dot kom',
    "ta'aruf": 'ta-aruf',
    nadzhor: 'nadzor',
    WhatsApp: 'wasap',
    email: 'imel',
    'Barakallahu lakuma wa baraka alaikuma': 'barakallaahu lakumaa, wa baaraka alaikumaa',
  },

  // Satu baris VO = satu kapsi di demo-scenes.jsx, urut dan sescene.
  // `maks` = sisa detik scene-nya. Dia kontrak, bukan saran: kalau take-nya lewat,
  // mesin generate ulang dengan seed lain sampai muat.
  vo: [
    {no: 1,  sc: 'Hook',       off: 0.25, maks: 3.45, text: 'Bismillah. Ingin menikah, tapi bingung mulai dari mana?'},
    {no: 2,  sc: 'Daftar',     off: 0.40, maks: 7.30, text: 'Buka birojodoh.rumaysho.com, lalu daftar. Isi nama, email, dan nomor WhatsApp aktif.'},
    {no: 3,  sc: 'Verifikasi', off: 0.30, maks: 3.40, text: 'Cek email, lalu klik tautan verifikasi.'},
    {no: 4,  sc: 'Login',      off: 0.30, maks: 4.40, text: 'Setelah disetujui, masuk dengan email dan kata sandi Anda.'},
    {no: 5,  sc: 'Dashboard',  off: 0.35, maks: 5.35, text: 'Beranda menyapa Anda, dan menunjukkan data yang masih perlu dilengkapi.'},
    {no: 6,  sc: 'Biodata',    off: 0.35, maks: 6.35, text: "Lengkapi biodata dengan jujur. Inilah yang dibaca calon lewat CV ta'aruf, bukan foto Anda."},
    {no: 7,  sc: 'Kriteria',   off: 0.35, maks: 5.35, text: 'Tentukan kriteria: usia, domisili, pendidikan. Yang muncul hanya yang sesuai.'},
    {no: 8,  sc: 'Materi',     off: 0.35, maks: 5.35, text: 'Sebelum mencari, belajar dulu. Materi nikah dan rekaman kajian terbuka kapan saja.'},
    // Layar ujian berganti jadi layar hasil di Ujian + 5,6 — baris ini harus selesai dulu.
    {no: 9,  sc: 'Ujian',      off: 0.35, maks: 4.95, text: 'Lalu ikuti ujian pra-nikah. Bukan formalitas, ini bekal Anda.'},
    // Nilai berhitung naik Ujian + 6,0 sampai + 8,0; baris ini jatuh persis di situ.
    {no: 10, sc: 'Ujian',      off: 6.05, maks: 2.70, text: 'Alhamdulillah, lulus. Pencarian terbuka.'},
    {no: 11, sc: 'Paket',      off: 0.35, maks: 5.35, text: "Pilih paket sesuai tahapan Anda. Mulai dari gratis, sampai layanan ta'aruf penuh."},
    // [A] — dua baris ini membahas sisi akhwat, diisi suara akhwat sesuai brief.
    {no: 12, sc: 'Kandidat',   off: 0.40, maks: 2.70, voice: 'RbNgJzKAV7jpYJNtCBpj', text: 'Di daftar calon, tidak ada foto.'},
    {no: 13, sc: 'Kandidat',   off: 3.30, maks: 4.20, voice: 'RbNgJzKAV7jpYJNtCBpj', text: 'Hanya inisial, usia, dan domisili. Bacalah CV-nya dengan adab.'},
    {no: 14, sc: 'Tertarik',   off: 0.35, maks: 5.35, text: 'Jika cocok, ketuk Saya Tertarik. Lewat tim pendamping, bukan chat pribadi.'},
    {no: 15, sc: 'Match',      off: 0.35, maks: 3.45, text: 'Bila kedua pihak menerima, pendamping menghubungi Anda.'},
    {no: 16, sc: 'Match',      off: 4.05, maks: 2.70, text: "Lanjut ke ta'aruf, nadzhor, khitbah."},
    {no: 17, sc: 'Nikah',      off: 0.35, maks: 3.40, text: 'Barakallahu lakuma wa baraka alaikuma.'},
    {no: 18, sc: 'Ajak',       off: 0.35, maks: 3.40, text: 'Mulai hari ini. Bagikan ke yang masih menanti.'},
  ],

  // 'jangkar': detik brief ditulis bersama komposisinya, dan di video ini scene TIDAK
  // boleh memanjang sama sekali (lihat catatan 1 di atas). `ekorBiasa` kecil supaya
  // sisa napas satu baris tidak ikut menuntut scene diperpanjang.
  tata: {mode: 'jangkar', jeda: 0.14, ekorBiasa: 0.20},

  /* SFX: organik dan NON-MELODIS. Brief melarang lonceng dan chime bernada — diganti
     ketukan lembut, kertas, napas, dan satu lapis suara manusia. Seluruh prompt memuat
     "no instruments, no music" karena generator suka menyelipkan bel kecil pada kata
     "notification" dan "success". */
  sfx: [
    ['ketik',   1.4, 'light fingertips tapping on a smartphone touchscreen glass, a short run of soft muted taps, gentle and unhurried, dry close-mic recording, no reverb, no instruments, no music, single take'],
    ['tap',     0.8, 'one single soft fingertip tap on smartphone glass, short muted thud with no tone and no ring, dry close-mic recording, no reverb, no instruments, no music, single hit'],
    ['sapu',    1.2, 'a soft human breath exhaling past the microphone as a gentle airy whoosh moving left to right, wind-like, no vocal pitch, no instruments, no music, dry close-mic recording, single motion'],
    ['centang', 1.0, 'one soft short fingertip click followed immediately by a very short warm male hum rising one step, unaccompanied human voice, no instruments, no music, no bell, dry close-mic recording, single event'],
    ['ahh',     2.2, 'a single warm male voice humming one gentle sustained ahh and fading naturally, unaccompanied, no harmony, no instruments, no music, no bell, dry close-mic recording, single note'],
    ['pena',    2.0, 'a fountain pen nib writing one continuous line on thick paper, steady soft scratching at even pressure, dry close-mic recording, no reverb, no instruments, no music, single continuous stroke'],
    ['napas',   1.2, 'a soft calm human breath drawn slowly inward, close and quiet, no vocal pitch, no instruments, no music, dry close-mic recording, single breath'],
    ['kertas',  1.0, 'one sheet of thin paper sliding across another sheet on a wooden desk, soft dry rustle, dry close-mic recording, no reverb, no instruments, no music, single motion'],
  ],

  /* Cue dipaku ke BEAT ANIMASI yang benar-benar ada di demo-scenes.jsx — jendela `typed()`,
     tekanan kursor di `CUR`, dan batas `<Shot>` tiap layar. Offset di bawah dibaca langsung
     dari berkas itu, jalur kursor absolut diubah jadi relatif terhadap scene-nya.

     Pelapisan penuh dipakai SEKALI saja, di momen terbesar video ini: layar hasil ujian
     "Alhamdulillah, lulus" pada Ujian + 5,6. napas (-0,5) menarik · sapu (-0,15) memberi
     tanda · centang memberi TITIK · ahh memberi BERAT-nya. Kalau semua hentakan dilapis,
     tidak ada yang terasa besar (IKLAN.md §2). */
  cue: ({C}) => [
    // Hook — ponsel naik
    {at: C.Hook + 0.10, nama: 'napas', gain: 0.22},
    {at: C.Hook + 0.55, nama: 'kertas', gain: 0.18, pan: -0.2},

    // Daftar — tiga kolom diketik, lalu tombol Daftar (CUR menekan di 10,5 abs)
    {at: C.Daftar - 0.10, nama: 'sapu',  gain: 0.24},
    {at: C.Daftar + 0.70, nama: 'ketik', gain: 0.30},
    {at: C.Daftar + 2.40, nama: 'ketik', gain: 0.28, nada: 1, pan: 0.15},
    {at: C.Daftar + 4.10, nama: 'ketik', gain: 0.28, nada: -1, pan: -0.15},
    {at: C.Daftar + 6.50, nama: 'tap',   gain: 0.40},
    {at: C.Daftar + 6.62, nama: 'centang', gain: 0.24},

    // Verifikasi — layar berhasil
    {at: C.Verifikasi - 0.10, nama: 'sapu',    gain: 0.26},
    {at: C.Verifikasi + 0.25, nama: 'centang', gain: 0.30},

    // Login — email, sandi, tombol Masuk (CUR menekan di 19,7 abs = Login + 3,7)
    {at: C.Login - 0.10, nama: 'sapu',  gain: 0.24},
    {at: C.Login + 1.50, nama: 'ketik', gain: 0.28},
    {at: C.Login + 2.60, nama: 'ketik', gain: 0.26, nada: 1, pan: 0.15},
    {at: C.Login + 3.70, nama: 'tap',   gain: 0.40},

    // Dashboard — sapaan, lalu cincin penanda data belum lengkap
    {at: C.Dashboard - 0.10, nama: 'sapu',  gain: 0.24},
    {at: C.Dashboard + 0.60, nama: 'napas', gain: 0.24},
    {at: C.Dashboard + 1.40, nama: 'kertas', gain: 0.16, pan: 0.2},

    // Biodata — bar kelengkapan naik 0,6 -> 5,2 lalu penuh
    {at: C.Biodata - 0.10, nama: 'sapu',    gain: 0.24},
    {at: C.Biodata + 0.60, nama: 'ketik',   gain: 0.24},
    {at: C.Biodata + 2.60, nama: 'ketik',   gain: 0.22, nada: 1, pan: 0.18},
    {at: C.Biodata + 5.20, nama: 'centang', gain: 0.34, nada: 2},

    // Kriteria — empat pilihan diketuk 0,6 -> 3,6, lalu rentang usia digeser
    {at: C.Kriteria - 0.10, nama: 'sapu', gain: 0.24},
    {at: C.Kriteria + 0.80, nama: 'tap',  gain: 0.30, pan: -0.2},
    {at: C.Kriteria + 1.55, nama: 'tap',  gain: 0.30, nada: 1, pan: 0.2},
    {at: C.Kriteria + 2.30, nama: 'tap',  gain: 0.30, nada: -1, pan: -0.1},
    {at: C.Kriteria + 3.05, nama: 'tap',  gain: 0.30, nada: 2, pan: 0.1},
    {at: C.Kriteria + 3.60, nama: 'kertas', gain: 0.20},

    // Materi — daftar bergulir, satu progres penuh di 4,4
    {at: C.Materi - 0.10, nama: 'sapu',   gain: 0.24},
    {at: C.Materi + 0.80, nama: 'kertas', gain: 0.22, pan: -0.2},
    {at: C.Materi + 2.60, nama: 'kertas', gain: 0.20, pan: 0.2},
    {at: C.Materi + 4.40, nama: 'centang', gain: 0.30},

    // Ujian — jawaban dipilih (CUR 48,4 abs), lalu HENTAKAN TERBESAR di layar hasil
    {at: C.Ujian - 0.10, nama: 'sapu',    gain: 0.24},
    {at: C.Ujian + 2.40, nama: 'tap',     gain: 0.38},
    {at: C.Ujian + 5.10, nama: 'napas',   gain: 0.34},
    {at: C.Ujian + 5.45, nama: 'sapu',    gain: 0.34},
    {at: C.Ujian + 5.60, nama: 'centang', gain: 0.42, nada: 2},
    {at: C.Ujian + 5.70, nama: 'ahh',     gain: 0.40},
    {at: C.Ujian + 8.00, nama: 'centang', gain: 0.26, nada: 4},

    // Paket — tiga paket digulir, satu dipilih (CUR 60,0 abs = Paket + 5,0)
    {at: C.Paket - 0.10, nama: 'sapu',   gain: 0.24},
    {at: C.Paket + 0.80, nama: 'kertas', gain: 0.22, pan: -0.2},
    {at: C.Paket + 2.60, nama: 'kertas', gain: 0.20, pan: 0.2},
    {at: C.Paket + 5.00, nama: 'tap',    gain: 0.38},

    // Kandidat — cincin penanda, daftar digulir, CV dibuka di + 5,4
    {at: C.Kandidat - 0.10, nama: 'sapu',   gain: 0.24},
    {at: C.Kandidat + 0.80, nama: 'napas',  gain: 0.24},
    {at: C.Kandidat + 2.60, nama: 'kertas', gain: 0.22, pan: -0.2},
    {at: C.Kandidat + 4.80, nama: 'tap',    gain: 0.36},
    {at: C.Kandidat + 5.40, nama: 'sapu',   gain: 0.28},

    // Tertarik — tombol ditekan, modal, lalu konfirmasi terkirim
    {at: C.Tertarik - 0.10, nama: 'sapu',    gain: 0.24},
    {at: C.Tertarik + 1.30, nama: 'tap',     gain: 0.38},
    {at: C.Tertarik + 1.70, nama: 'kertas',  gain: 0.22},
    {at: C.Tertarik + 3.90, nama: 'tap',     gain: 0.34},
    {at: C.Tertarik + 4.00, nama: 'centang', gain: 0.32, nada: 2},

    // Match — saling menerima di + 1,9, lalu tiga tahapan tercapai
    {at: C.Match - 0.10, nama: 'sapu',   gain: 0.24},
    {at: C.Match + 1.75, nama: 'napas',  gain: 0.26},
    {at: C.Match + 1.90, nama: 'ahh',    gain: 0.32, nada: 3},
    {at: C.Match + 4.00, nama: 'tap',    gain: 0.28, pan: -0.2},
    {at: C.Match + 5.10, nama: 'tap',    gain: 0.28, nada: 2, pan: 0.2},
    {at: C.Match + 6.20, nama: 'tap',    gain: 0.28, nada: 4},

    // Nikah — layar doa
    {at: C.Nikah - 0.10, nama: 'sapu', gain: 0.26},
    {at: C.Nikah + 0.05, nama: 'ahh',  gain: 0.34, nada: 5},

    // Ajak — logo digambar 0,15 -> 1,85, persis sepanjang goresan pena
    {at: C.Ajak - 0.10, nama: 'sapu', gain: 0.26},
    {at: C.Ajak + 0.15, nama: 'pena', gain: 0.30},
  ],

  /* Musik: nasyid a cappella, SUARA MANUSIA SAJA. Ini syarat adab dari brief, bukan
     selera — seluruh daftar alat musik masuk `hindari` tiap bagian.

     Dipakai `rencana`, bukan `prompt`: satu prompt untuk 90 detik menyerahkan seluruh
     susunan kepada generator dan intro tipisnya jatuh di scene pembuka (IKLAN.md §1).
     Bagian dipatok ke batas scene, mengikuti struktur brief: hum tipis 0-46 dtk,
     harmoni masuk 46 dtk, puncak 82-90 dtk.

     Bagian [tail] 16 detik di ujung TIDAK PERNAH terdengar. Dia ada semata supaya
     fade-out bawaan generator punya tempat jatuh di luar gambar. */
  musik: [{
    nama: 'nasyid',
    detik: ({total}) => total + 16,
    fadeOut: ({total}) => [total - 1.8, 1.8],
    rencana: ({C, total}) => {
      const HINDARI = ['instruments', 'piano', 'guitar', 'strings', 'violin', 'oud', 'synth',
        'bass guitar', 'booming sub bass', 'drums', 'percussion', 'beat', 'tabla', 'duff',
        'clapping', 'heavy four-on-the-floor kick', 'trap 808', 'female vocals', 'autotune',
        'EDM', 'lyrics', 'words'];
      const b = (dari, sampai, teks, gaya) => ({detik: sampai - dari, teks, gaya, hindari: HINDARI});
      // "always present" dan "from the very first beat" itu wajib: kata sparse, quiet,
      // dan patient diterjemahkan generator sebagai SENYAP, dan lubangnya jatuh di
      // scene pembuka (IKLAN.md §1).
      return [
        b(0, C.Login, '[intro]', ['warm male a cappella humming from the very first beat',
          'unaccompanied human voices only', 'steady and continuous', 'always present',
          'major key, slow 70 BPM', 'natural room warmth']),
        b(C.Login, C.Kriteria, '[verse]', ['two layered male voices humming wordlessly',
          'unaccompanied human voices only', 'steady and continuous', 'always present',
          'gentle Middle-Eastern melodic contour', 'hopeful']),
        b(C.Kriteria, C.Ujian, '[verse]', ['layered wordless male humming with soft vocal pad',
          'unaccompanied human voices only', 'steady and continuous', 'warm and patient in tone but never silent']),
        b(C.Ujian, C.Kandidat, '[lift]', ['close male vocal harmony entering',
          'unaccompanied human voices only', 'steady and continuous', 'rising and hopeful']),
        b(C.Kandidat, C.Nikah, '[build]', ['fuller layered male vocal harmony',
          'unaccompanied human voices only', 'steady and continuous', 'warm and uplifting']),
        b(C.Nikah, total, '[peak]', ['full warm male vocal harmony resolving',
          'unaccompanied human voices only', 'steady and continuous', 'joyful and grateful']),
        b(total, total + 16, '[tail]', ['warm male vocal harmony resolving and settling',
          'unaccompanied human voices only', 'steady and continuous']),
      ];
    },
    // Bed -20 dB sesuai brief, naik ke -13 dB di dua scene penutup. Tiap gerakan dibentang
    // belasan detik, jadi tidak ada yang menukik lebih dari 6 dB dalam 1,5 detik.
    titik: [
      ['Hook', 0, -19], ['Daftar', 0, -21], ['Ujian', 0, -20], ['Ujian', 6.0, -17],
      ['Kandidat', 0, -19], ['Match', 0, -17], ['Nikah', 0, -14], ['Ajak', 0, -13],
    ],
  }],

  /* Kartu penutup dibuka dengan ruang hening 0,4 detik sebelum kalimat terakhir, sesuai
     brief. Diikat ke DUA sisi — akhir baris 17 dan awal baris 18 — supaya ekor baris 17
     yang memanjang tidak masuk ke dalam jendela yang seharusnya senyap. */
  gate: ({P, E}) => [[E[17] + 0.06, P[18] - 0.06]],

  /* Sampul kustom: detik 83,4, layar doa dengan ponsel yang menyala. Itu janji produknya
     — bukan formulir pendaftaran. Frame 0 tetap dibuat layak sendiri (IKLAN.md §5). */
  sampul: {detik: 83.4},

  mixer: {
    // Brief: VO -3 dB · BGM -20 dB (duck -26 dB saat VO bicara) · SFX -18 dB.
    gainVO: 1.55, gainSFX: 0.50,
    // th 0,03 ratio 8 — yang menentukan kedalaman ducking itu THRESHOLD, bukan ratio
    // (IKLAN.md §2). th 0,12 membuat ducking mati hampir seluruhnya.
    duckMusik: {th: 0.03, ratio: 8, attack: 90, release: 300},
  },

  // Titik A/B bus SFX harus jatuh di tempat VO sedang DIAM, kalau tidak selisihnya
  // hilang di bawah suara dan bus yang sehat terbaca sebagai bus yang mati.
  periksa: {busTitik: [8.2, 45.85, 68.95]},
};
