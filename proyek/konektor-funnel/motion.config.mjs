// Iklan Funnel TOF/MOF/BOF Konektor.id — angle #2. Jalankan: motion all
import {eja} from '../../lib/lafal.mjs';

// Explainer full-frame, bukan POV HP — sengaja beda dari video #1 supaya dua iklan ini
// tidak terasa kembar. Slot penayangan tetap 30 detik, jadi tiap baris ditulis supaya muat
// di jendela beat-nya; scene TIDAK boleh melar.
export default {
  nama: 'konektor-funnel',
  komposisi: 'Iklan Funnel TOF-MOF-BOF 9x16.dc.html',
  // Empat rasio Meta dari SATU jsx dan SATU master audio. `jugaTulis` menjaga OM_SCENES
  // keempatnya tetap sama; kalau tidak, durasi scene di 4:5 tertinggal satu revisi.
  jugaTulis: [
    'Iklan Funnel TOF-MOF-BOF 4x5.dc.html',
    'Iklan Funnel TOF-MOF-BOF 1x1.dc.html',
    'Iklan Funnel TOF-MOF-BOF 16x9.dc.html',
  ],
  jsx: 'funnel-ad-scene.jsx',
  kapsi: true,                                  // 12 kapsi = 12 baris VO, urut sama
  keluaran: 'konektor-funnel-9x16.mp4',

  // Suara SAMA dengan video #1. Satu kampanye harus terdengar satu brand, dan penonton
  // video #2 adalah orang yang sudah menonton video #1 (retargeting 50%+).
  suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260905, speed: 1.20, stability: 0.22, similarity: 0.80, style: 0.45},

  // LPWA dan CTWA dieja huruf. TOF/MOF/BOF TIDAK — brief minta dibaca sebagai kata, dan
  // memang begitu orang menyebutnya. fbclid: "F B" dieja, "clid" satu kata.
  // Titik domain diurus `ucapkan()`: Konektor.id -> "Konektor dot Ai Di".
  // Kunci yang lebih panjang harus di ATAS yang pendek — penggantian jalan urut.
  lafal: {
    'ctwa clid': eja('CTWA CLID'),
    fbclid: `${eja('FB')} klid`,
    ctwa: eja('CTWA'),
    lpwa: eja('LPWA'),
    roas: 'ro-as',
  },

  // `maks` = batas detik untuk baris itu. Durasi TTS tidak deterministik, jadi baris yang
  // jendelanya sempit diberi kontrak: mesin generate ulang sampai muat. Tanpa itu satu take
  // yang kebetulan 0,4 detik lebih panjang memelarkan scene-nya dan video lewat 30 detik.
  vo: [
    // Rantai ceritanya: masalah -> dilema palsu -> DIBANTAH -> sebab sebenarnya ->
    // urutan yang benar -> hasil -> merek. Versi sebelumnya melompat dari "dua-duanya
    // dipakai" langsung ke "tracking putus" tanpa jembatan, dan itu yang terasa terputus.
    // Baris 4 adalah jembatan itu.
    // `maks` = kontrak durasi; durasi TTS tidak deterministik dan jendelanya sempit.

    // Hook 0-4 · judul masuk 0,15 · tiga lane masuk 0,20/0,38/0,56 · penanda "putus" 1,20
    {no: 1,  sc: 'Hook',      off: 0.15, maks: 3.55, text: 'Funnel-mu ada TOF, MOF, BOF. Tapi nggak jalan?'},
    // Confuse 4-9 · dua kartu rute 4,30 dan 4,50 · badge "Dua-duanya dipakai." 6,30-7,00
    {no: 2,  sc: 'Confuse',   off: 0.10, maks: 2.55, text: 'Masih mikir LPWA apa CTWA?'},
    {no: 3,  sc: 'Confuse',   off: 2.60, maks: 2.20, text: 'Jawabannya: dua-duanya.'},
    // Broken 9-14 · label TRACKING PUTUS 9,20 · tiga kartu merah 9,50 / 9,95 / 10,40
    {no: 4,  sc: 'Broken',    off: 0.25, maks: 2.20, text: 'Tapi masalahnya bukan di situ.'},
    {no: 5,  sc: 'Broken',    off: 2.55, maks: 2.30, text: 'Tracking-mu putus di tengah jalan.'},
    // Blueprint 14-22 · lane melebar 13,60-14,60 · kamera turun ke TOF 16,20, ke MOF 18,20,
    // ke BOF 19,00, kembali 21,20. Tiga baris stage mengikuti KAMERA, bukan detik brief.
    // Lane di layar sudah memuat rinciannya, jadi VO memberi alurnya: dingin, hangat, panas.
    {no: 6,  sc: 'Blueprint', off: 0.30, maks: 1.80, text: 'Ini urutan yang bener.'},
    {no: 7,  sc: 'Blueprint', off: 2.20, maks: 2.10, text: 'Yang dingin masuk lewat LPWA.'},
    {no: 8,  sc: 'Blueprint', off: 4.20, maks: 1.90, text: 'Yang udah mampir, dikejar.'},
    {no: 9,  sc: 'Blueprint', off: 6.00, maks: 1.90, text: 'Yang udah chat, dikunci.'},
    // Result 22-26 · lane mengecil 21,60-22,50 · counter audiens 22,50-24,20 · ROAS 22,90
    {no: 10, sc: 'Result',    off: 0.40, maks: 3.20, text: 'Satu tracking, empat audiens, ROAS kebaca.'},
    // CTA 26-30 · logo 26,10 · judul 26,50 · tombol 27,00 · chip 27,40
    {no: 11, sc: 'CTA',       off: 0.30, maks: 2.50, text: 'Semua nyambung di Konektor.id.'},
    {no: 12, sc: 'CTA',       off: 2.60, maks: 1.10, text: 'Daftar gratis sekarang!'},
  ],

  tata: {mode: 'jangkar', jeda: 0.12, ekorBiasa: 0.10},

  // Kering semua. Iklan feed ditonton lewat speaker HP: reverb jadi lumpur.
  sfx: [
    ['whoosh',       0.8, 'Very fast short UI transition whoosh, tight and modern, no reverb, one shot'],
    ['click-thick',  0.6, 'One thick rounded interface click, deep and confident, dry, one shot'],
    ['buzz-low',     1.2, 'Low soft warning buzz with a short dark tail, dry, one shot'],
    ['pop-panel',    0.7, 'One soft panel pop appearing, tight and clean, no reverb, one shot'],
    ['pop-shimmer',  1.6, 'Thick pop opening into fine bright shimmer particles, clean, one shot'],
    ['glitch-cut',   0.9, 'Short harsh digital glitch of a cable being cut, cold and broken, dry, one shot'],
    ['thud-heavy',   1.2, 'Heavy dull thud landing hard on a surface, dry, close mic, one shot'],
    ['alarm-tap',    1.0, 'One single soft alarm tap, cold and sparse, dry, no repeat, one shot'],
    ['riser',        1.4, 'Short clean tech riser sweeping upward, no reverb tail, one shot'],
    ['impact-wide',  1.8, 'Wide cinematic impact with a deep sub and a short clean tail, one shot'],
    ['chime-up',     1.2, 'Bright confident single note chime, modern and clean, short decay, one shot'],
    ['counter-tick', 2.4, 'Mechanical counter digits ticking upward steadily, dry, close mic, no music'],
    ['pop-small',    0.5, 'One small soft pop blip, warm and rounded, no reverb, one shot'],
    ['btn-click',    0.5, 'One crisp modern button click, tight and clean, no reverb, one shot'],
  ],

  // C = mulai tiap scene · P = awal tiap baris VO · E = akhirnya · S = durasi scene
  cue: ({C, S}) => {
    const q = (sc, off, nama, gain, nada = 0, pan = 0) => ({at: C[sc] + off, nama, gain, nada, pan});
    const H = 'Hook', F = 'Confuse', B = 'Broken', P = 'Blueprint', R = 'Result';
    return [
      // HOOK — judul masuk, tiga lane menghentak, lalu penanda "putus" berdenyut pelan
      q(H, 0.15, 'whoosh', 0.30),
      ...[0.20, 0.38, 0.56].map((o, i) => q(H, o, 'click-thick', 0.30, i * 2, [-0.35, 0, 0.35][i])),
      ...[1.30, 2.30, 3.30].map((o, i) => q(H, o, 'buzz-low', 0.16, -i)),
      // CONFUSE — dua kartu rute, lalu badge "Dua-duanya dipakai."
      q(F, -0.13, 'whoosh', 0.32),
      q(F, 0.30, 'pop-panel', 0.28, 2, -0.3),
      q(F, 0.50, 'pop-panel', 0.28, -1, 0.3),
      q(F, 2.30, 'pop-shimmer', 0.36),
      // BROKEN — kabel putus, tiga kartu makin berat, satu ketuk alarm
      q(B, -0.13, 'glitch-cut', 0.34),
      ...[0.50, 0.95, 1.40].map((o, i) => q(B, o, 'thud-heavy', 0.26 + i * 0.04, -i * 2)),
      q(B, 2.90, 'alarm-tap', 0.26),
      // BLUEPRINT — lane melebar, lalu satu chime naik tiap stage yang disorot kamera
      q(P, -0.40, 'riser', 0.30),
      q(P, 0.20, 'impact-wide', 0.36),
      ...[2.20, 4.20, 6.00].map((o, i) => q(P, o, 'chime-up', 0.26, i * 4)),
      // RESULT — lane mengecil, angka menghitung, tiga kartu ROAS
      q(R, -0.40, 'whoosh', 0.30, 3),
      q(R, 0.50, 'counter-tick', 0.20),
      ...[0.90, 1.08, 1.26].map((o, i) => q(R, o, 'pop-small', 0.22, i * 3, i % 2 ? 0.3 : -0.3)),
      // CTA — masuk menghentak, tombol berdenyut
      q('CTA', -0.45, 'riser', 0.30),
      q('CTA', 0.05, 'impact-wide', 0.36),
      q('CTA', 1.00, 'btn-click', 0.30),
      q('CTA', S.CTA - 1.0, 'chime-up', 0.22, 5),
    ];
  },

  // Satu keluarga dengan video #1: tech-house minimal yang sama, potongan berbeda.
  musik: [{
    nama: 'musik',
    // 40 detik untuk video 30 detik. Generator menyusun arc penuh sepanjang durasi yang
    // diminta, jadi outro-nya jatuh di luar bagian yang dipakai — bukan di CTA.
    detik: ({total}) => total + 10,
    // Naik landai dan monoton. Tukikan di batas scene terdengar seperti musik bolong.
    titik: [
      ['Hook', 0.0, -17], ['Hook', 3.4, -14],
      ['Confuse', 2.5, -14],
      ['Broken', 0.0, -15], ['Broken', 3.5, -13],
      ['Blueprint', 0.4, -11],
      ['Result', 0.5, -10],
      ['CTA', 0.3, -9],
    ],
    fadeOut: ({total}) => [total - 0.85, 0.75],
    prompt: 'Driving minimal tech house corporate instrumental, 110 BPM, no vocals, high energy '
      + 'and confident. A round sub bass and a tight kick run continuously from the first bar to '
      + 'the last, never stopping. It opens focused with dry ticking percussion over that groove, '
      + 'then adds a bright pluck arpeggio, then wide claps and a simple hopeful lead, then a full '
      + 'confident chorus with an extra bright layer. Energy only ever builds, never drops out. '
      + 'The last third stays at full energy with no breakdown and no fade — the track must '
      + 'still be at its loudest at the forty second mark.',
  }],

  // Tidak ada `gate`. Di iklan 30 detik tiap celah sudah diisi whoosh transisi.
  mixer: {gainVO: 1.45, gainSFX: 0.72, duckMusik: {th: 0.15, ratio: 2, attack: 40, release: 220}},

  periksa: {busTitik: [1, 6, 11, 16, 23, 28]},
};
