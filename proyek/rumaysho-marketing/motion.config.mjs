// Biro Jodoh Rumaysho — "Jaga prosesnya, jaga kehormatannya", iklan 45 detik 9:16.
// Jalankan: motion all proyek/rumaysho-marketing
//
// Sumber brief: src/"Naskah Audio (VO, BGM, SFX).dc.html" di dalam zip yang sama.
// Keputusan yang menyimpang dari bawaan mesin, beserta sebabnya:
//
// 1. DURASI SCENE TIDAK BOLEH BERUBAH. marketing-scenes.jsx memakai `PHONE`, satu
//    jalur DETIK ABSOLUT 8,6-45,0 yang membawa ponsel masuk di Privasi dan keluar di
//    Damping. Jalur itu tidak ikut bergeser waktu scene memanjang, jadi ponselnya akan
//    tertinggal di layar yang salah. Tiap baris VO karena itu diberi `maks`.
//
// 2. MUSIK TANPA SATU PUN ALAT — nasyid a cappella, suara manusia saja. Syarat adab
//    dari brief, bukan selera. Seluruh daftar alat masuk `hindari`, dan SFX bernada
//    (lonceng, chime) diganti ketukan, kertas, goresan pena, dan napas.
//
// 3. DUA SUARA. Narator ikhwan (Firman); scene Privasi yang membahas sisi akhwat diisi
//    suara akhwat (Citra) lewat `voice` per baris. Brief menandainya [A].
//
// 4. FRAME 0 DIPERBAIKI DI KOMPOSISI. Kicker, judul, wordmark, dan logo dulu masuk di
//    detik 0,2-1,4 — frame pertama nyaris kosong, dan itu sampul bawaan Reels/TikTok
//    (IKLAN.md §5). Sekarang keempatnya SELESAI di T=0; yang bergerak sejak frame 0
//    adalah sisa tarikan logo dan subjudul yang masuk di detik 0,9.
export default {
  nama: 'rumaysho-marketing',
  komposisi: 'Video Marketing.dc.html',
  // `jugaTulis` dari kerangka init DIHAPUS: "Video Demo Aplikasi.dc.html" bukan orientasi
  // lain, melainkan VIDEO LAIN. Dibiarkan, durasi scene-nya ikut ditimpa durasi video ini.
  jsx: 'marketing-scenes.jsx',
  kapsi: true,
  keluaran: 'rumaysho-marketing-9x16.mp4',

  suara: {id: 'i8CJLmX03JoyL7Dl2LaT', seed: 20260911, speed: 1.08,
          stability: 0.42, similarity: 0.82, style: 0.28},

  lafal: {
    // `rumaysho` terbaca "roommyshow" waktu ditranskrip balik — vokalnya jatuh ke
    // Inggris. Diuji tiga ejaan pada suara yang sama; `rumaysyo` yang kembali persis
    // sebagai "rumaysho".
    'birojodoh\\.rumaysho\\.com': 'birojodoh dot rumaysyo dot kom',
    "ta'aruf": 'ta-aruf',
    nadzhor: 'nadzor',
  },

  vo: [
    {no: 1,  sc: 'Hook',    off: 0.15, maks: 4.60, text: 'Separuh agama itu menunggu. Yang berat bukan niatnya.'},
    {no: 2,  sc: 'Masalah', off: 0.35, maks: 4.40, text: 'Bertahun-tahun mencari, dan tetap tidak ada yang menjaga prosesnya.'},
    // [A] — scene Privasi membahas sisi akhwat, diisi suara akhwat sesuai brief.
    {no: 3,  sc: 'Privasi', off: 0.35, maks: 3.30, voice: 'RbNgJzKAV7jpYJNtCBpj', text: 'Di Biro Jodoh Rumaysho, foto Anda tidak dipajang.'},
    {no: 4,  sc: 'Privasi', off: 3.80, maks: 3.90, voice: 'RbNgJzKAV7jpYJNtCBpj', text: 'Hanya inisial, usia, dan domisili, lewat tim pendamping.'},
    {no: 5,  sc: 'Ilmu',    off: 0.35, maks: 6.35, text: 'Sebelum dan sesudah menikah, ilmunya disiapkan: materi nikah, kajian, sampai mendidik anak.'},
    {no: 6,  sc: 'Damping', off: 0.30, maks: 5.40, text: "Anda tidak sendirian. Ta'aruf, nadzhor, khitbah, sampai akad, semua didampingi."},
    // Nama pembimbing dan nomor badan hukum SUDAH terbaca di kartu — VO tidak
    // membacakannya ulang (IKLAN.md §3), detiknya dipakai untuk harga.
    {no: 7,  sc: 'Amanah',  off: 0.30, maks: 4.20, text: 'Melayani sejak dua ribu tujuh belas, di bawah yayasan berbadan hukum.'},
    {no: 8,  sc: 'Amanah',  off: 4.55, maks: 2.10, text: 'Paketnya mulai dari gratis.'},
    {no: 9,  sc: 'Ajakan',  off: 0.35, maks: 4.58, text: 'Jangan menunda kebaikan. Daftar hari ini di birojodoh.rumaysho.com.'},
    {no: 10, sc: 'Ajakan',  off: 5.00, maks: 1.75, text: 'Kirim ke teman yang menanti.'},
  ],

  // `ekor` scene terakhir dikecilkan: batas Ajakan bukan potongan gambar, melainkan
  // kartu penutup yang memang menahan sampai frame terakhir. Dengan ekor biasa 0,20
  // detik, scene itu membulat naik ke 7,05 detik dan videonya keluar 45,05 detik.
  tata: {mode: 'jangkar', jeda: 0.14, ekorBiasa: 0.20, ekor: {Ajakan: 0.05}},

  sfx: [
    ['tap',     0.8, 'one single soft fingertip tap on smartphone glass, short muted thud with no tone and no ring, dry close-mic recording, no reverb, no instruments, no music, single hit'],
    ['sapu',    1.2, 'a soft human breath exhaling past the microphone as a gentle airy whoosh moving left to right, wind-like, no vocal pitch, no instruments, no music, dry close-mic recording, single motion'],
    ['centang', 1.0, 'one soft short fingertip click followed immediately by a very short warm male hum rising one step, unaccompanied human voice, no instruments, no music, no bell, dry close-mic recording, single event'],
    ['ahh',     2.2, 'a single warm male voice humming one gentle sustained ahh and fading naturally, unaccompanied, no harmony, no instruments, no music, no bell, dry close-mic recording, single note'],
    ['pena',    2.0, 'a fountain pen nib writing one continuous line on thick paper, steady soft scratching at even pressure, dry close-mic recording, no reverb, no instruments, no music, single continuous stroke'],
    ['coret',   0.8, 'one quick single pen stroke crossing out a word on paper, short dry scratch, dry close-mic recording, no reverb, no instruments, no music, single stroke'],
    ['napas',   1.2, 'a soft calm human breath drawn slowly inward, close and quiet, no vocal pitch, no instruments, no music, dry close-mic recording, single breath'],
    ['kertas',  1.0, 'one sheet of thin paper sliding across another sheet on a wooden desk, soft dry rustle, dry close-mic recording, no reverb, no instruments, no music, single motion'],
  ],

  /* Cue dipaku ke beat animasi yang benar-benar ada di marketing-scenes.jsx: `Kicker`,
     `Big`, `TickCard`, `CrossCard`, `BigStages` (at + 0,35 + i*0,42), dan `PriceRow`
     (at + 0,3 + i*0,32).

     Pelapisan penuh dipakai SEKALI, di pengungkapan terbesar video ini: lencana privasi
     "foto tidak dipajang" pada Privasi + 1,4. napas menarik · sapu memberi tanda ·
     centang memberi TITIK · ahh memberi BERAT-nya. */
  cue: ({C}) => [
    // Hook — logo selesai ditarik di 0,5, subjudul masuk di 0,9
    {at: 0.00, nama: 'pena',   gain: 0.24},
    {at: 0.90, nama: 'kertas', gain: 0.20, pan: -0.2},

    // Masalah — tiga kartu dicoret, goresan digambar at + 0,45 sampai at + 1,0
    {at: C.Masalah - 0.10, nama: 'sapu',  gain: 0.26},
    {at: C.Masalah + 0.90, nama: 'tap',   gain: 0.26, pan: -0.25},
    {at: C.Masalah + 1.35, nama: 'coret', gain: 0.30, pan: -0.25},
    {at: C.Masalah + 1.60, nama: 'tap',   gain: 0.26, nada: 1, pan: 0.25},
    {at: C.Masalah + 2.05, nama: 'coret', gain: 0.30, nada: 1, pan: 0.25},
    {at: C.Masalah + 2.30, nama: 'tap',   gain: 0.26, nada: -1},
    {at: C.Masalah + 2.75, nama: 'coret', gain: 0.30, nada: -1},

    // Privasi — HENTAKAN TERBESAR: lencana privasi mendarat di + 1,4
    {at: C.Privasi - 0.10, nama: 'sapu',    gain: 0.26},
    {at: C.Privasi + 0.90, nama: 'napas',   gain: 0.30},
    {at: C.Privasi + 1.25, nama: 'sapu',    gain: 0.32},
    {at: C.Privasi + 1.40, nama: 'centang', gain: 0.42, nada: 2},
    {at: C.Privasi + 1.50, nama: 'ahh',     gain: 0.38},
    {at: C.Privasi + 3.00, nama: 'tap',     gain: 0.26, pan: -0.2},
    {at: C.Privasi + 3.70, nama: 'tap',     gain: 0.26, nada: 1, pan: 0.2},
    {at: C.Privasi + 4.40, nama: 'tap',     gain: 0.26, nada: 2},

    // Ilmu — empat kartu bekal
    {at: C.Ilmu - 0.10, nama: 'sapu',   gain: 0.26},
    {at: C.Ilmu + 1.60, nama: 'kertas', gain: 0.24, pan: -0.2},
    {at: C.Ilmu + 2.20, nama: 'kertas', gain: 0.22, nada: 1, pan: 0.2},
    {at: C.Ilmu + 2.80, nama: 'kertas', gain: 0.22, nada: -1, pan: -0.1},
    {at: C.Ilmu + 3.40, nama: 'kertas', gain: 0.22, nada: 2, pan: 0.1},

    // Damping — lima tahapan masuk berurutan
    {at: C.Damping - 0.10, nama: 'sapu', gain: 0.26},
    {at: C.Damping + 0.35, nama: 'tap',  gain: 0.28, pan: -0.25},
    {at: C.Damping + 0.77, nama: 'tap',  gain: 0.28, nada: 1, pan: -0.1},
    {at: C.Damping + 1.19, nama: 'tap',  gain: 0.28, nada: 2},
    {at: C.Damping + 1.61, nama: 'tap',  gain: 0.28, nada: 3, pan: 0.1},
    {at: C.Damping + 2.03, nama: 'tap',  gain: 0.30, nada: 5, pan: 0.25},
    {at: C.Damping + 2.15, nama: 'ahh',  gain: 0.24, nada: 5},

    // Amanah — dua kartu legalitas, lalu tiga baris harga
    {at: C.Amanah - 0.10, nama: 'sapu',    gain: 0.26},
    {at: C.Amanah + 1.10, nama: 'centang', gain: 0.26},
    {at: C.Amanah + 1.60, nama: 'centang', gain: 0.26, nada: 2},
    {at: C.Amanah + 2.70, nama: 'kertas',  gain: 0.22, pan: -0.2},
    {at: C.Amanah + 3.02, nama: 'kertas',  gain: 0.22, nada: 1},
    {at: C.Amanah + 3.34, nama: 'tap',     gain: 0.32, nada: 3, pan: 0.2},

    // Ajakan — logo digambar + 0,15 sampai + 1,9, persis sepanjang goresan pena
    {at: C.Ajakan - 0.10, nama: 'sapu', gain: 0.28},
    {at: C.Ajakan + 0.15, nama: 'pena', gain: 0.30},
    {at: C.Ajakan + 1.95, nama: 'ahh',  gain: 0.26, nada: 5},
  ],

  /* Musik: nasyid a cappella, SUARA MANUSIA SAJA (syarat adab dari brief).
     `rencana`, bukan `prompt` — bed pendek pun butuh rencana, karena generator menyusun
     INTRO-nya sendiri dan intro tipis itu jatuh di scene pembuka (IKLAN.md §1).
     Struktur mengikuti brief: hum tunggal 0-10 dtk, harmoni 10-31 dtk, puncak 38-45 dtk.
     Bagian [tail] 14 detik di ujung TIDAK PERNAH terdengar; dia ada semata supaya
     fade-out bawaan generator punya tempat jatuh di luar gambar. */
  musik: [{
    nama: 'nasyid',
    detik: ({total}) => total + 14,
    fadeOut: ({total}) => [total - 1.6, 1.6],
    rencana: ({C, total}) => {
      const HINDARI = ['instruments', 'piano', 'guitar', 'strings', 'violin', 'oud', 'synth',
        'bass guitar', 'booming sub bass', 'drums', 'percussion', 'beat', 'tabla', 'duff',
        'clapping', 'heavy four-on-the-floor kick', 'trap 808', 'female vocals', 'autotune',
        'EDM', 'lyrics', 'words'];
      const b = (dari, sampai, teks, gaya) => ({detik: sampai - dari, teks, gaya, hindari: HINDARI});
      return [
        b(0, C.Privasi, '[intro]', ['warm male a cappella humming from the very first beat',
          'unaccompanied human voices only', 'steady and continuous', 'always present',
          'major key, slow 70 BPM', 'natural room warmth']),
        b(C.Privasi, C.Damping, '[verse]', ['two layered male voices humming wordlessly in close harmony',
          'unaccompanied human voices only', 'steady and continuous', 'always present',
          'gentle Middle-Eastern melodic contour', 'hopeful']),
        b(C.Damping, C.Ajakan, '[build]', ['fuller layered male vocal harmony',
          'unaccompanied human voices only', 'steady and continuous', 'warm and uplifting']),
        b(C.Ajakan, total, '[peak]', ['full warm male vocal harmony resolving',
          'unaccompanied human voices only', 'steady and continuous', 'joyful and grateful']),
        b(total, total + 14, '[tail]', ['warm male vocal harmony resolving and settling',
          'unaccompanied human voices only', 'steady and continuous']),
      ];
    },
    titik: [
      ['Hook', 0, -19], ['Masalah', 0, -21], ['Privasi', 0, -20], ['Ilmu', 0, -19],
      ['Damping', 0, -18], ['Amanah', 0, -17], ['Ajakan', 0, -13],
    ],
  }],

  /* Ruang hening sebelum kartu penutup, sesuai brief. Diikat ke DUA sisi — akhir baris 8
     dan awal baris 9 — supaya ekor baris 8 yang memanjang tidak masuk ke dalamnya. */
  gate: ({P, E}) => [[E[8] + 0.06, P[9] - 0.06]],

  // Sampul kustom: detik 12,6, saat lencana "foto tidak dipajang" sudah mendarat dan
  // ponselnya sudah di tempat. Itu nilai jual utamanya, bukan judul pembuka.
  sampul: {detik: 12.6},

  mixer: {
    gainVO: 1.55, gainSFX: 0.50,
    duckMusik: {th: 0.03, ratio: 8, attack: 90, release: 300},
  },

  // Titik A/B bus SFX jatuh di celah VO: di tempat VO sedang berbunyi, selisih SFX
  // hilang di bawahnya dan bus yang sehat terbaca 0,0 dB — sama persis dengan bus mati.
  periksa: {busTitik: [4.95, 9.95, 24.95]},
};
