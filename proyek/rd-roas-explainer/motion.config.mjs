// LEMBAR #03 "Panel yang bilang aman" — explainer ROAS 9:16. Jalankan: motion all
//
// Sumber brief: src/reels/roas-data-driven.md · rangka src/framework/lembar.md.
// Tiga keputusan yang menyimpang dari brief, beserta sebabnya:
//
// 1. TANPA MUSIK. Brief menulis "Musik: tidak ada" dan itu dipertahankan. Panel gelap
//    adalah satu-satunya "mesin" di video ini; bed musik membuatnya jadi iklan.
//    Akibatnya `check` akan melaporkan bed musik kosong — itu memang tidak ada.
//
// 2. NASKAH DIPENDEKKAN ± 130 karakter. Suara pilihan (ZPI4bKVkeIVdAkOA73qX) membaca
//    15,7 kar/dtk pada speed 1,0 — di bawah Cahaya 16,3 dan separuh Yoga 21,5. Naskah
//    brief butuh 95,3 detik pada suara ini, sementara komposisinya ditulis 87 detik.
//    Yang dibuang HANYA kalimat yang membacakan ulang angka di layar (IKLAN.md §3),
//    bukan aritmetikanya: 1,2 = 9jt ÷ 7,5jt dan batas aman = 1 ÷ 0,5 tetap tertutup.
//
// 3. Larik kapsi di .jsx diubah dari `CAPS` bertuple jadi `const caps` ber-`at`,
//    supaya `apply` menulis ulang waktunya dari posisi VO yang benar-benar terukur.
//    Sebelumnya jendela kapsi dibekukan di 1,0-3,3 detik: baris terpanjang berbunyi
//    2,0 detik lebih lama daripada kapsinya dan ekornya tampil tanpa teks.
export default {
  nama: 'rd-roas-explainer',
  komposisi: 'ROAS Data Driven.dc.html',
  jsx: 'rd-roas-share.jsx',
  kapsi: true,
  keluaran: 'rama-digital-roas-9x16.mp4',

  // Suara pilihan Rama. `style` 0,38 — di antara brief video ini ("warm and calm, no
  // announcer energy" = 0,25) dan angka kampanye Rama Digital (0,72). 0,25 pada durasi
  // 90 detik terdengar rata; 0,72 membuatnya berjualan, dan video ini mengajar.
  suara: {id: 'ZPI4bKVkeIVdAkOA73qX', seed: 20260910, speed: 1.20,
          stability: 0.34, similarity: 0.78, style: 0.38},

  // ROAS harus terdengar sebagai KATA, bukan dieja huruf per huruf: seluruh babak Nama
  // dibangun supaya huruf R-O-A-S masuk satu per satu DI LAYAR lalu VO menamainya sekali.
  lafal: {ROAS: 'Roas', budget: 'bajet'},

  // Kalimatnya sama persis dengan `const caps` di rd-roas-share.jsx.
  vo: [
    {no: 1,  sc: 'Umpan',     off:  0.40, text: 'Jam sembilan pagi. Ada order masuk: tiga ratus ribu.'},
    {no: 2,  sc: 'Umpan',     off:  3.90, text: 'Iklan hari ini habis dua ratus lima puluh ribu.'},
    {no: 3,  sc: 'Umpan',     off:  6.20, text: 'Kelihatannya menang, kan?'},
    {no: 4,  sc: 'Balikan',   off:  0.40, text: 'Tiap hari jalan. Dua ratus lima puluh ribu, kali tiga puluh.'},
    {no: 5,  sc: 'Balikan',   off:  3.50, text: 'Sebulan: tujuh juta lima keluar.'},
    {no: 6,  sc: 'Balikan',   off:  5.80, text: 'Yang order dari iklan: tiga puluh orang.'},
    {no: 7,  sc: 'Balikan',   off:  8.90, text: 'Sembilan juta masuk.'},
    {no: 8,  sc: 'Balikan',   off: 11.10, text: 'Panelnya bilang aman. Untung satu juta lima. Yakin?'},
    {no: 9,  sc: 'Bukti',     off:  0.30, text: 'Tiga puluh lima ribu brand, setahun penuh.'},
    {no: 10, sc: 'Bukti',     off:  2.60, text: 'Tengahnya: seribu iklan, balik seribu delapan ratus enam puluh.'},
    {no: 11, sc: 'Perih',     off:  0.30, text: 'Tapi tiga ratus ribu itu bukan uang Rio.'},
    {no: 12, sc: 'Perih',     off:  2.60, text: 'Obat dan alat empat puluh lima ribu. Transport tiga puluh.'},
    {no: 13, sc: 'Perih',     off:  6.30, text: 'Upah dua teknisi tujuh puluh lima ribu.'},
    {no: 14, sc: 'Perih',     off:  8.80, text: 'Yang beneran sisa: seratus lima puluh ribu.'},
    {no: 15, sc: 'Perih',     off: 11.30, text: 'Tiga puluh order: empat juta lima. Iklannya tujuh juta lima.'},
    {no: 16, sc: 'Tikaman',   off:  0.30, text: 'Notifikasi yang bikin seneng tadi...'},
    {no: 17, sc: 'Tikaman',   off:  2.80, text: '...sebenarnya minus seratus ribu.'},
    {no: 18, sc: 'Tikaman',   off:  4.60, text: 'Yang mahal bukan iklannya. Yang mahal: baca satu angka.'},
    {no: 19, sc: 'Redam',     off:  0.30, text: 'Itu wajar. Nggak ada yang salah pasang iklan.'},
    {no: 20, sc: 'Redam',     off:  2.40, text: 'Panelnya cuma nunjukin yang gampang diukur.'},
    {no: 21, sc: 'Belok',     off:  0.30, text: 'Ada yang bagi dua angka dulu, sebelum nambah budget.'},
    {no: 22, sc: 'Belok',     off:  3.10, text: 'Omzet iklan dibagi belanja iklan. Rio dapat satu koma dua.'},
    {no: 23, sc: 'Belok',     off:  5.90, text: 'Karena yang sisa cuma setengah, batas amannya dua.'},
    {no: 24, sc: 'Nama',      off:  0.40, text: 'Satu koma dua, padahal butuhnya dua.'},
    {no: 25, sc: 'Nama',      off:  2.90, text: 'Angka yang barusan kamu hitung itu, ada namanya.'},
    {no: 26, sc: 'Nama',      off:  5.80, text: 'ROAS.'},
    {no: 27, sc: 'Nama',      off:  7.20, text: 'Selamat. Kamu sudah memahami apa itu ROAS.'},
    {no: 28, sc: 'Nama',      off:  9.70, text: 'Yang dibagi omzet, bukan untung.'},
    {no: 29, sc: 'Kirim',     off:  0.40, text: 'Sekarang satu hal doang.'},
    {no: 30, sc: 'Kirim',     off:  2.90, text: 'Kirim ini ke temenmu yang megang iklan. Yang mungkin belum tau.'},
    {no: 31, sc: 'Kirim',     off:  6.60, text: 'Yang paling butuh angka ini, yang paling yakin iklannya aman.'},
    {no: 32, sc: 'Kirim',     off:  9.70, text: 'Rama Digital.'},
    {no: 33, sc: 'Kirim',     off: 10.60, text: 'Besok: kenapa ROAS dua belum tentu untung.'},
  ],

  // 'jangkar': detik brief ditulis bersama komposisinya dan tiap unsur digerbang
  // `CUES.Scene + n`, jadi scene hanya boleh memanjang. `ekorBiasa` kecil — batas
  // scene di lembar ini bukan potongan gambar, cuma kamera yang terus turun.
  tata: {mode: 'jangkar', jeda: 0.13, ekorBiasa: 0.25},

  // Kering semua, satu ruang: lembar kertas dan panel mesin. Reverb bikin lumpur di
  // speaker HP. Prompt ditulis Inggris — generator ElevenLabs paling patuh di situ.
  sfx: [
    ['notif',  1.0, 'one soft single phone notification chime, gentle two-note bell, short and polite, dry close-mic recording, no reverb, no music, single event'],
    ['paper',  1.0, 'a single sheet of thick paper settling flat on a wooden desk, soft airy whump with a brief crisp edge settle, dry close-mic recording, no reverb, no music, single take'],
    ['pen',    1.2, 'a sharp graphite pencil drawing one long continuous straight line along a steel ruler on thick paper, steady gritty scratching, consistent pressure, dry close-mic recording, no reverb, no music, single continuous stroke'],
    ['stamp',  1.2, 'a heavy rubber stamp pressed firmly onto paper on a solid wooden desk, deep low thud with a tight wooden knock and a short puff of paper, authoritative single impact, dry close-mic recording, no reverb, no music, single hit'],
    ['angka',  2.0, 'a mechanical odometer counter rolling numbers upward quickly then stopping, fast tiny metal clicks in a steady run, precise and light, dry close-mic recording, no reverb, no music, single run'],
    ['panel',  1.5, 'a small machine display powering on, one soft low electronic hum swelling with a single quiet digital blip on top, clean and modern, dry recording, no reverb, no music, single event'],
    ['jarum',  1.0, 'a thin metal gauge needle snapping to a position and settling, one tight high metallic tick with a very short spring wobble, dry close-mic recording, no reverb, no music, single hit'],
    ['potong', 1.0, 'one clean short paper cut with sharp scissors, single crisp slicing snip, dry close-mic recording, no reverb, no music, single cut'],
    ['tumpul', 1.5, 'one soft deep wooden thud on a heavy desk, low and dull with no ring and no rattle, dry close-mic recording, no reverb, no music, single hit'],
    ['gelap',  2.5, 'a low dark sustained tone swelling underneath and holding, minor and heavy, cello-like analog weight, no percussion, no drums, no melody, dry recording, no reverb'],
    ['riser',  2.0, 'a slow quiet tension riser rising steadily in pitch and intensity, thin metallic air building, no impact at the end, no percussion, no drums, dry recording, no reverb'],
    ['hisap',  1.5, 'one short reverse air suck pulling inward and stopping abruptly, thin airy whoosh played backwards, no impact, dry recording, no reverb, no music, single motion'],
    ['huruf',  1.0, 'one single short marimba note struck with a hard mallet, warm wooden bar, bright attack, quick natural decay, solo instrument, dry close-mic recording, no reverb, no music, single hit'],
    ['hadiah', 2.5, 'a warm bright bell chord ringing once and decaying naturally, glass-like and generous, major and resolved, solo instrument, no percussion, dry close-mic recording, no reverb, no music, single hit'],
    ['pesawat',1.5, 'a small folded paper plane thrown and gliding away through still air, one light quick paper whoosh moving away from the listener, no impact, dry close-mic recording, no reverb, no music, single motion'],
    ['kunci',  2.0, 'a precision mechanism locking into position, two-stage click, a tight high metal snap then an immediate deeper solid clunk, machined aluminium, satisfying and expensive, dry close-mic recording, no reverb, no music, single decisive lock'],
  ],

  /* Cue dipaku ke BEAT ANIMASI (`C.Scene + offset` yang benar-benar ada di .jsx),
     bukan ke baris VO: unsurnya digerbang cue, jadi gambarnya jatuh di situ walau
     naskahnya berubah panjang. Offset di bawah dibaca langsung dari rd-roas-share.jsx.

     Satu hentakan dilapis penuh, sekali saja: panel berubah jadi RUGI di Perih+14,0.
     riser (-1,3 dtk) menarik perhatian · hisap (-0,2) memberi tanda · stamp memberi
     TITIK-nya · gelap memberi BERAT-nya. Kalau semua hentakan dilapis, tidak ada yang
     terasa besar (IKLAN.md §2). */
  cue: ({C}) => [
    // Umpan — order masuk, panel harian
    {at: C.Umpan + 0.30, nama: 'notif',  gain: 0.42},
    {at: C.Umpan + 0.80, nama: 'angka',  gain: 0.22},
    {at: C.Umpan + 3.40, nama: 'paper',  gain: 0.30},
    {at: C.Umpan + 3.80, nama: 'panel',  gain: 0.26},
    {at: C.Umpan + 4.00, nama: 'angka',  gain: 0.18, nada: -2},
    {at: C.Umpan + 6.20, nama: 'paper',  gain: 0.26, pan: 0.2},

    // Balikan — dua batang, panel bilang AMAN
    {at: C.Balikan +  0.40, nama: 'pen',    gain: 0.24},
    {at: C.Balikan +  3.20, nama: 'pen',    gain: 0.30, pan: -0.25},
    {at: C.Balikan +  3.40, nama: 'angka',  gain: 0.22},
    {at: C.Balikan +  5.60, nama: 'paper',  gain: 0.26},
    {at: C.Balikan +  8.60, nama: 'pen',    gain: 0.32, pan: 0.25, nada: -1},
    {at: C.Balikan +  8.80, nama: 'angka',  gain: 0.24},
    {at: C.Balikan + 10.60, nama: 'panel',  gain: 0.30},
    {at: C.Balikan + 12.00, nama: 'stamp',  gain: 0.40},
    {at: C.Balikan + 13.80, nama: 'tumpul', gain: 0.34},

    // Bukti — satu angka luar di mistar
    {at: C.Bukti + 0.30, nama: 'paper',  gain: 0.28},
    {at: C.Bukti + 2.00, nama: 'pen',    gain: 0.26},
    {at: C.Bukti + 2.60, nama: 'jarum',  gain: 0.34},
    {at: C.Bukti + 4.60, nama: 'paper',  gain: 0.20, pan: -0.2},

    // Perih — satu order dibongkar, lalu panel berubah jadi RUGI
    {at: C.Perih +  0.30, nama: 'paper',  gain: 0.28},
    {at: C.Perih +  2.60, nama: 'potong', gain: 0.30, nada:  0},
    {at: C.Perih +  3.40, nama: 'potong', gain: 0.29, nada: -1, pan: -0.2},
    {at: C.Perih +  4.90, nama: 'potong', gain: 0.28, nada: -2, pan:  0.2},
    {at: C.Perih +  6.30, nama: 'potong', gain: 0.27, nada: -3},
    {at: C.Perih +  8.40, nama: 'angka',  gain: 0.22},
    {at: C.Perih + 11.20, nama: 'pen',    gain: 0.26},
    {at: C.Perih + 12.50, nama: 'panel',  gain: 0.30},
    {at: C.Perih + 12.70, nama: 'riser',  gain: 0.30},          // lapis 1 dari 4
    {at: C.Perih + 13.80, nama: 'hisap',  gain: 0.34},          // lapis 2
    {at: C.Perih + 14.00, nama: 'stamp',  gain: 0.62},          // lapis 3 — TITIK-nya
    {at: C.Perih + 14.02, nama: 'gelap',  gain: 0.44},          // lapis 4 — BERAT-nya

    // Tikaman — kartu pembuka kembali, sekarang minus
    {at: C.Tikaman + 0.15, nama: 'notif',  gain: 0.34, nada: -4},
    {at: C.Tikaman + 2.80, nama: 'tumpul', gain: 0.36},
    {at: C.Tikaman + 4.40, nama: 'paper',  gain: 0.24},
    {at: C.Tikaman + 5.20, nama: 'paper',  gain: 0.20, pan: 0.2},

    // Redam — empat detik napas. Dua bunyi paling pelan di seluruh video.
    {at: C.Redam + 0.30, nama: 'paper', gain: 0.16},
    {at: C.Redam + 2.40, nama: 'paper', gain: 0.14, pan: -0.2},

    // Belok — bagi dua angka, mistar kedua dengan dua jarum
    {at: C.Belok + 0.30, nama: 'paper', gain: 0.26},
    {at: C.Belok + 2.80, nama: 'pen',   gain: 0.28},
    {at: C.Belok + 4.60, nama: 'angka', gain: 0.24},
    {at: C.Belok + 5.60, nama: 'pen',   gain: 0.24, pan: 0.2},
    {at: C.Belok + 6.00, nama: 'jarum', gain: 0.34},
    {at: C.Belok + 6.60, nama: 'jarum', gain: 0.36, nada: 3},

    // Nama — R-O-A-S masuk satu per satu, lalu hadiahnya
    {at: C.Nama +  0.40, nama: 'paper',  gain: 0.24},
    {at: C.Nama +  5.40, nama: 'huruf',  gain: 0.34, nada:  0},
    {at: C.Nama +  5.54, nama: 'huruf',  gain: 0.35, nada:  2},
    {at: C.Nama +  5.68, nama: 'huruf',  gain: 0.36, nada:  4},
    {at: C.Nama +  5.82, nama: 'huruf',  gain: 0.38, nada:  7},
    {at: C.Nama +  7.00, nama: 'hadiah', gain: 0.30},
    {at: C.Nama +  9.70, nama: 'paper',  gain: 0.20},

    // Kirim — pesawat kertas, lalu kotak amber terbang jadi mark
    {at: C.Kirim +  0.40, nama: 'paper',   gain: 0.24},
    {at: C.Kirim +  2.90, nama: 'pen',     gain: 0.26},
    {at: C.Kirim +  3.40, nama: 'pesawat', gain: 0.34, pan: 0.35},
    {at: C.Kirim +  6.40, nama: 'paper',   gain: 0.20},
    {at: C.Kirim +  9.30, nama: 'pesawat', gain: 0.30, nada: -2, pan: -0.3},
    {at: C.Kirim + 10.05, nama: 'kunci',   gain: 0.46},
    {at: C.Kirim + 10.90, nama: 'paper',   gain: 0.18},
  ],

  // Tanpa musik — lihat catatan 1 di kepala berkas.
  musik: [],

  // Sampul kustom: panel bilang AMAN, tepat sebelum satu kata "Yakin?". Itu pertanyaan
  // yang membuat orang berhenti scroll, bukan jawabannya. Diverifikasi lewat motion shot.
  sampul: {detik: 21.4},

  // Satu jeda yang disengaja: sesudah kata "ROAS" berbunyi, sebelum "Selamat".
  // Diikat ke DUA sisi, jadi ekor baris 26 tidak bisa masuk ke dalamnya.
  gate: ({P, E}) => [[E[26] + 0.15, P[27] - 0.30]],

  // Tanpa bed musik, VO tidak perlu dipaksa naik; yang perlu dijaga cuma jarak ke SFX.
  mixer: {gainVO: 1.42, gainSFX: 0.60},

  /* Titik A/B bus SFX. Putaran pertama memakai 0,4 dan 8,5 detik dan keduanya kembali
     0,0 dB — bukan karena SFX-nya tidak masuk, tetapi karena di dua titik itu VO sedang
     berbunyi dan selisihnya hilang di bawahnya. Ukur di titik yang VO-nya sedang diam,
     kalau tidak cek ini melapor "0,0 dB" — angka yang persis sama dengan bus yang mati. */
  periksa: {busTitik: [22.4, 28.8, 42.5, 70.3]},
};
