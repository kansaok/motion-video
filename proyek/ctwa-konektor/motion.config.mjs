// Iklan CTWA Konektor.id — config motion-engine. Jalankan: motion all
import {eja} from '../../lib/lafal.mjs';
//
// Komposisi = sumber kebenaran. Seluruh beat di ctwa-ad-scene.jsx scene-relatif
// (`A.blind + n`, dan `A` alias dari CUES), jadi durasi scene aman diubah.
//
// Batasnya: ini iklan Meta 30 detik. Video BOLEH melar di mesin, tapi tidak boleh —
// slot 30s adalah spesifikasi penayangannya. Jadi tiap baris VO ditulis supaya muat di
// jendela beat-nya, bukan sebaliknya. Anggaran karakter dihitung dari 17,4 kar/dtk
// (Yoga Voice @ speed 1.08, hasil `motion speed`), lalu dikoreksi ke durasi TTS yang nyata.
export default {
  nama: 'ctwa-konektor',
  komposisi: 'Iklan CTWA Konektor 9x16.dc.html',
  // Empat rasio Meta dari SATU jsx dan SATU master audio. `jugaTulis` menjaga OM_SCENES
  // keempatnya tetap sama; kalau tidak, durasi scene di 4:5 diam-diam tertinggal satu revisi.
  //   9:16 Reels & Stories · 4:5 dan 1:1 feed · 16:9 in-stream
  jugaTulis: [
    'Iklan CTWA Konektor 4x5.dc.html',
    'Iklan CTWA Konektor 1x1.dc.html',
    'Iklan CTWA Konektor 16x9.dc.html',
  ],
  jsx: 'ctwa-ad-scene.jsx',
  kapsi: true,                                  // 12 kapsi = 12 baris VO, urut sama
  keluaran: 'ctwa-konektor-9x16.mp4',

  // Diukur pada satu kalimat naskah ini, speed 1.12: Maya 15,9 kar/dtk · Cahaya 15,3 ·
  // Aita 14,3 · honeypie 14,3 · Nilasari 14,0 · Velora 13,8.
  // Maya paling cepat tapi berlabel `advertisement` — brief menolak gaya announcer.
  //
  // `eleven_v3` (yang mendukung audio tag) diuji dan DITOLAK: 31% lebih lambat pada
  // kalimat yang sama (3,47 dtk lawan 2,64) dan mengabaikan `speed`. Naskah 23 detik jadi
  // 31 detik — tidak muat di slot 30 detik.
  // style TIDAK mengubah tempo: 2,64 dtk di style 0.30 maupun 0.50. Jadi aman dinaikkan
  // jauh, dan itu satu-satunya tuas ekspresi yang tersisa. speed dibatasi API di 0,7-1,2.
  suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260905, speed: 1.20, stability: 0.22, similarity: 0.80, style: 0.45},

  // `eja()` menulis akronim sebagai huruf kapital berspasi. Menulis nama hurufnya sendiri
  // ('Ce Te We A') TERDENGAR SALAH — TTS menyatukannya jadi "chat-wa"; dibuktikan lewat
  // transkrip balik. Alasan lengkap dan seluruh hasil ukurnya ada di lib/lafal.mjs.
  // CAPI justru dibaca satu kata, bukan dieja.
  // Titik domain TIDAK di sini: `Konektor.id` -> "Konektor dot Ai Di" diurus `ucapkan()`.
  // Kunci 'ctwa clid' harus di ATAS 'ctwa' — penggantian jalan urut.
  lafal: {
    'ctwa clid': eja('CTWA CLID'),
    ctwa: eja('CTWA'),
    capi: 'Kapi',
    roas: 'ro-as',
  },

  vo: [
    // Hook 0-4 · 8 kartu chat masuk 0,30-1,84 · badge unread berhenti naik 2,60
    {no: 1,  sc: 'Hook',      off: 0.30, text: 'Chat WhatsApp rame. Tapi iklanmu tetap boncos?'},
    // BlindSpot 4-9 · layar geser masuk 3,85 · kolom 0 berdenyut 5,40 · kartu statistik 6,10
    {no: 2,  sc: 'BlindSpot', off: 0.05, text: 'Iklan CTWA nggak lewat landing page.'},
    {no: 3,  sc: 'BlindSpot', off: 2.10, text: 'Di ads manager? Closing kamu nol.'},
    // Clid 9-15 · panel payload naik 10,50 · baris menyala hijau 11,40
    // · spotlight besar 12,50-14,90. Ejaan delapan huruf sengaja jatuh DI DALAM
    // jendela spotlight itu: penonton mendengar dan membaca hurufnya bersamaan.
    {no: 4,  sc: 'Clid',      off: 0.20, text: 'Padahal tiap chat iklan bawa ID.'},
    {no: 5,  sc: 'Clid',      off: 2.00, text: 'Namanya ctwa clid.'},
    // Chain 15-20 · lima langkah menyala 15,83-18,47 · badge business_messaging 19,00
    {no: 6,  sc: 'Chain',     off: 0.15, text: 'Konektor langsung simpan ID itu.'},
    {no: 7,  sc: 'Chain',     off: 2.25, text: 'Pas closing, balik ke Meta lewat CAPI.'},
    // Dashboard 20-25 · angka menghitung 20,40-22,60 · zoom ke kartu ROAS 22,60
    {no: 8,  sc: 'Dashboard', off: 0.25, text: 'Ketahuan chat mana yang jadi duit!'},
    {no: 9,  sc: 'Dashboard', off: 2.35, text: 'Scale yang cuan, matiin yang boncos!'},
    // CTA 25-30 · logo 25,10 · judul 25,50 · tombol 26,00 · fade ke hitam 29,55
    {no: 10, sc: 'CTA',       off: 0.20, text: 'Tracking CTWA? Cuma di Konektor.id.'},
    {no: 11, sc: 'CTA',       off: 2.60, text: 'Daftar gratis sekarang!'},
  ],

  // Offset di atas diturunkan dari beat animasi, jadi dipakai sebagai batas bawah.
  // ekor 0,20 supaya scene tidak ikut melar hanya untuk menampung tarikan napas.
  tata: {mode: 'jangkar', jeda: 0.12, ekorBiasa: 0.15},

  // Semua kering. Iklan feed ditonton lewat speaker HP: reverb jadi lumpur.
  sfx: [
    ['chat-pop',     0.6, 'One short soft chat message pop bubble, tight and clean, no reverb, one shot'],
    ['notif-ding',   1.0, 'One small bright notification ding, modern and clean, short decay, one shot'],
    ['whoosh',       0.8, 'Very fast short UI transition whoosh, tight and modern, no reverb, one shot'],
    ['scroll-tick',  2.2, 'Fine dry ticking of a list scrolling past, granular, no music, no reverb'],
    ['low-thud',     1.2, 'Low dull thud with a short dark tail, close mic, dry, one shot'],
    ['impact-dull',  1.0, 'Muted heavy impact hitting a soft surface, dry and punchy, one shot'],
    ['panel-slide',  1.2, 'Low air whoosh of a panel sliding up into place, smooth and dark, one shot'],
    ['key-tick',     1.0, 'Four quick mechanical keyboard ticks, close and dry, one shot'],
    ['shimmer-hit',  1.8, 'Bright impact opening into fine rising shimmer particles, clean, one shot'],
    ['riser',        1.4, 'Short clean tech riser sweeping upward, no reverb tail, one shot'],
    ['pop-thick',    0.8, 'One thick rounded pop, deep and confident, dry, one shot'],
    ['click-soft',   0.5, 'One soft interface select blip, warm and rounded, no reverb, one shot'],
    ['chime-send',   1.2, 'Small confident two note data send chime, modern and clean, short decay'],
    ['counter-tick', 2.4, 'Mechanical counter digits ticking upward steadily, dry, close mic, no music'],
    ['sub-drop',     1.8, 'Deep sub bass drop with a short dark tail, cinematic, dry, one shot'],
    ['btn-click',    0.5, 'One crisp modern button click, tight and clean, no reverb, one shot'],
  ],

  // C = detik mulai tiap scene · P = posisi tiap baris VO · S = durasi tiap scene
  cue: ({C, S}) => {
    const q = (sc, off, nama, gain, nada = 0, pan = 0) => ({at: C[sc] + off, nama, gain, nada, pan});
    const H = 'Hook', B = 'BlindSpot', L = 'Clid', N = 'Chain', D = 'Dashboard';
    return [
      // HOOK — delapan chat masuk beruntun, nadanya naik tiap kartu, lalu badge berhenti
      ...Array.from({length: 8}, (_, i) =>
        q(H, 0.32 + i * 0.22, 'chat-pop', 0.30, i, i % 2 ? 0.34 : -0.34)),
      q(H, 2.60, 'notif-ding', 0.30),
      // BLINDSPOT — ganti layar, tabel discroll, angka nol berdenyut, dua kartu boncos
      q(B, -0.13, 'whoosh', 0.34),
      q(B, 0.80, 'scroll-tick', 0.18),
      q(B, 1.40, 'low-thud', 0.32),
      q(B, 2.10, 'impact-dull', 0.30),
      q(B, 2.35, 'impact-dull', 0.26, 3, 0.3),
      // CLID — bubble chat, panel payload naik, baris menyala, lalu spotlight
      q(L, -0.13, 'whoosh', 0.34, -2),
      q(L, 0.30, 'chat-pop', 0.28),
      q(L, 0.70, 'click-soft', 0.26, 4),
      q(L, 1.00, 'chat-pop', 0.26, -3, 0.35),
      q(L, 1.50, 'panel-slide', 0.30),
      q(L, 1.80, 'key-tick', 0.22),
      q(L, 2.40, 'shimmer-hit', 0.34),
      q(L, 3.10, 'riser', 0.24),
      q(L, 3.50, 'pop-thick', 0.34),
      // CHAIN — pill ctwa_clid melewati lima langkah, nadanya naik, lalu badge CAPI
      q(N, -0.13, 'whoosh', 0.34),
      ...[0.83, 1.49, 2.15, 2.81, 3.47].map((o, i) =>
        q(N, o, 'click-soft', 0.24, i * 2, i % 2 ? 0.3 : -0.3)),
      q(N, 4.00, 'chime-send', 0.30),
      // DASHBOARD — angka menghitung, empat bar funnel tumbuh, zoom ke kartu ROAS
      q(D, -0.13, 'whoosh', 0.34, 2),
      q(D, 0.40, 'counter-tick', 0.20),
      ...[1.00, 1.35, 1.70, 2.05].map((o, i) =>
        q(D, o, 'whoosh', 0.14, 4 - i * 2, i % 2 ? 0.4 : -0.4)),
      q(D, 2.60, 'sub-drop', 0.30),
      // CTA — HP naik keluar frame, brand masuk, tombol berdenyut
      q('CTA', -0.55, 'riser', 0.30),
      q('CTA', 0.05, 'shimmer-hit', 0.36),
      q('CTA', 1.00, 'btn-click', 0.30),
      ...[1.40, 1.54, 1.68].map((o, i) => q('CTA', o, 'click-soft', 0.18, i * 3)),
      q('CTA', S.CTA - 1.2, 'chime-send', 0.22),
    ];
  },

  // Satu trek 31 detik. Minor dan tertahan sampai payload muncul, penuh dari Chain,
  // terang di Dashboard, dan berhenti bersih sebelum loop mengulang.
  musik: [{
    nama: 'musik',
    // Diminta 40 detik untuk video 30 detik, dan 30 detik pertamanya saja yang dipakai.
    // Generator menyusun arc penuh sepanjang durasi yang diminta: trek 31 detik menaruh
    // OUTRO-nya di detik 26-31 — persis di CTA — dan itu terukur sebagai lubang 25 dB.
    // Diminta 40 detik, outro itu jatuh di luar bagian yang dipakai. Fade penutup diurus
    // mixer lewat `fadeOut`, jadi outro dari generator memang tidak dibutuhkan.
    detik: ({total}) => total + 10,
    // Naik landai dan MONOTON. Versi sebelumnya menukik ke -21 dB tepat di batas
    // BlindSpot, dan bed-nya jatuh sampai -65 dB — terdengar persis seperti musiknya
    // bolong di tiap pindah scene. Gerakan tercuram di sini 3 dB per 3,4 detik.
    titik: [
      ['Hook', 0.0, -17], ['Hook', 3.4, -14],
      ['BlindSpot', 2.5, -14],
      ['Clid', 0.0, -13], ['Clid', 3.5, -11],
      ['Chain', 1.5, -11],
      ['Dashboard', 1.0, -10],
      ['CTA', 0.3, -9],
    ],
    fadeOut: ({total}) => [total - 0.85, 0.75],
    // Tidak ada lagi bagian "bass drops out": bed yang sengaja dikosongkan terdengar
    // sebagai kerusakan, bukan dinamika. Groove-nya jalan terus, hanya lapisannya bertambah.
    prompt: 'Driving minimal tech house corporate instrumental, 110 BPM, no vocals, high energy '
      + 'and confident. A round sub bass and a tight kick run continuously from the first bar to '
      + 'the last, never stopping. It opens focused with dry ticking percussion over that groove, '
      + 'then adds a bright pluck arpeggio, then wide claps and a simple hopeful lead, then a full '
      + 'confident chorus with an extra bright layer. Energy only ever builds, never drops out. '
      + 'The last third stays at full energy with no breakdown and no fade — the track must '
      + 'still be at its loudest at the forty second mark.',
  }],

  // TIDAK ADA `gate`. Jendela hening 0,4 detik yang dulu dipasang di sini jatuh tepat di
  // transisi ke Clid dan membuat musiknya benar-benar NOL (-120 dB) — persis "jeda musik"
  // yang dilaporkan. Di iklan 30 detik tiap celah sudah diisi whoosh transisi; heningnya
  // tidak punya tempat.

  // Brief: VO > SFX > musik, SFX tidak boleh menutup konsonan VO, duck 6 dB.
  // `ratio: 10` menjatuhkan musik 20 dB dan menghapusnya selama 2,3 detik di CTA — itu
  // bukan ducking, itu lubang. Tetapi ratio saja tidak cukup: `th: 0.05` setara -26 dBFS,
  // jadi hampir seluruh suara melewatinya dan tetap tertekan penuh. Ambangnya yang harus
  // naik. th 0.15 (-16,5 dB) + ratio 2 menahan duck di sekitar 5-6 dB.
  mixer: {gainVO: 1.45, gainSFX: 0.72, duckMusik: {th: 0.15, ratio: 2, attack: 40, release: 220}},

  periksa: {busTitik: [1, 6, 12, 17, 22, 27]},
};
