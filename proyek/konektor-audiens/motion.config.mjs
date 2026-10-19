// Iklan "Audiens Kosong" (V2) — Pilar B. Jalankan: motion all
import {eja} from '../../lib/lafal.mjs';

// Hook paling konfrontatif di brief: menyuruh orang membuka Ads Manager-nya sendiri,
// bukan mendengarkan klaim. Angkanya kasus akun sendiri — 20 orang, tiga lookalike
// INACTIVE — sesuai catatan brief bahwa itu lebih jujur daripada testimoni yang belum ada.
//
// Brief-nya minta MEKANISME, bukan "tunggu traffic saja". Jadi inti visualnya satu:
// jalur perekaman yang berhenti tepat di lompatan ke WhatsApp.
export default {
  nama: 'konektor-audiens',
  komposisi: 'Iklan Audiens Kosong 9x16.dc.html',
  jugaTulis: [
    'Iklan Audiens Kosong 4x5.dc.html',
    'Iklan Audiens Kosong 1x1.dc.html',
    'Iklan Audiens Kosong 16x9.dc.html',
  ],
  jsx: 'audiens-scene.jsx',
  kapsi: true,
  keluaran: 'konektor-audiens-9x16.mp4',

  suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260906, speed: 1.20, stability: 0.22, similarity: 0.80, style: 0.45},

  lafal: {
    lla: eja('LLA'),
  },

  vo: [
    // Buka 0-4,5 · tabel masuk 0,1 · empat baris 0,4-0,88
    {no: 1,  sc: 'Buka',   off: 0.30, maks: 2.90, text: 'Coba buka tab Audiences kamu. Sekarang.'},
    {no: 2,  sc: 'Buka',   off: 3.30, maks: 1.00, text: 'Aku tunggu.'},
    // Kosong 4,5-10,5 · kamera mendekat ke angka 7,1
    {no: 3,  sc: 'Kosong', off: 0.30, maks: 2.50, text: 'Custom audience-mu isinya berapa?'},
    {no: 4,  sc: 'Kosong', off: 2.90, maks: 1.90, text: 'Punyaku dua puluh orang.'},
    // Sebab 10,5-16,5 · jalur maju 10,9-12,5 · label "rekaman berhenti" 12,4
    {no: 5,  sc: 'Sebab',  off: 0.30, maks: 2.10, text: 'Kenapa? Rekamannya berhenti.'},
    {no: 6,  sc: 'Sebab',  off: 2.60, maks: 2.40, text: 'Pas orangnya pindah ke WhatsApp.'},
    // Mati 16,5-20,5 · tiga kotak 16,7 / 17,0 / 17,3 · vonis 17,8
    {no: 7,  sc: 'Mati',   off: 0.30, maks: 2.70, text: 'Sumbernya kosong, lookalike-nya mati.'},
    // Isi 20,5-26 · jalur tersambung 20,9-22,5 · kartu hasil 21,5
    {no: 8,  sc: 'Isi',    off: 0.30, maks: 2.20, text: 'Konektor ngerekam terusannya.'},
    {no: 9,  sc: 'Isi',    off: 2.60, maks: 2.50, text: 'Audiensnya keisi, lookalike hidup.'},
    // CTA 26-30
    {no: 10, sc: 'CTA',    off: 0.30, maks: 2.10, text: 'Lacak chat asli, bukan klik.'},
    {no: 11, sc: 'CTA',    off: 2.50, maks: 1.20, text: 'Daftar gratis sekarang!'},
  ],

  tata: {mode: 'jangkar', jeda: 0.12, ekorBiasa: 0.12},

  sfx: [
    ['whoosh',      0.8, 'Very fast short UI transition whoosh, tight and modern, no reverb, one shot'],
    ['ui-open',     0.9, 'One soft interface panel opening click, warm and rounded, no reverb, one shot'],
    ['row-tick',    0.5, 'One small soft interface tick as a table row appears, dry, one shot'],
    ['heartbeat',   1.6, 'Two slow low dull heartbeat thuds, dark and close, dry, no music'],
    ['error-buzz',  1.0, 'Short harsh cold digital error buzzer, dry and glitchy, one shot'],
    ['trace-run',   2.0, 'Smooth continuous electronic tracing tone travelling along a line, dry, no melody'],
    ['cut-snap',    0.9, 'One sharp snap of a line being cut, cold and abrupt, dry, one shot'],
    ['low-thud',    1.2, 'Low dull thud with a short dark tail, close mic, dry, one shot'],
    ['flatline',    1.8, 'Flat cold sustained tone like a dead monitor, thin and lifeless, no music'],
    ['reconnect',   1.4, 'Bright confident connecting click followed by a short rising tone, clean, one shot'],
    ['fill-rise',   1.8, 'Smooth rising tone as a bar fills up, clean and hopeful, no reverb tail, one shot'],
    ['success-ding', 1.2, 'Bright confident single note success ding, modern and clean, short decay'],
    ['brand-boom',  2.0, 'Cinematic brand boom, bright impact over a deep sub, short clean tail, one shot'],
    ['riser',       1.4, 'Short clean tech riser sweeping upward, no reverb tail, one shot'],
    ['btn-click',   0.5, 'One crisp modern button click, tight and clean, no reverb, one shot'],
  ],

  // Bunyi bertahan lama (trace-run, flatline, heartbeat) ditahan rendah — pelajaran dari
  // iklan sebelumnya: yang mendominasi pita bicara justru one-shot terangnya.
  cue: ({C, S}) => {
    const q = (sc, off, nama, gain, nada = 0, pan = 0) => ({at: C[sc] + off, nama, gain, nada, pan});
    const BK = 'Buka', KS = 'Kosong', SB = 'Sebab', MT = 'Mati', IS = 'Isi';
    return [
      // BUKA — panel dibuka, empat baris tabel masuk
      q(BK, 0.05, 'ui-open', 0.30),
      ...[0.40, 0.56, 0.72, 0.88].map((o, i) => q(BK, o, 'row-tick', 0.24, i * 2)),
      // KOSONG — angka 20 berdenyut. Detak jantung pelan: sepi, bukan panik.
      q(KS, 0.10, 'whoosh', 0.28, -2),
      q(KS, 2.60, 'heartbeat', 0.20),
      q(KS, 4.60, 'error-buzz', 0.26),
      // SEBAB — garis berjalan, lalu DIPUTUS. cut-snap adalah bunyi kunci iklan ini.
      q(SB, -0.13, 'whoosh', 0.30),
      q(SB, 0.40, 'trace-run', 0.16),
      q(SB, 2.05, 'cut-snap', 0.34),
      q(SB, 2.30, 'low-thud', 0.28),
      // MATI — tiga kotak, lalu nada datar
      q(MT, -0.13, 'whoosh', 0.28, 2),
      ...[0.20, 0.50, 0.80].map((o, i) => q(MT, o, 'low-thud', 0.24, -i * 2)),
      q(MT, 1.30, 'flatline', 0.16),
      // ISI — sambungan tersambung, jalur jalan sampai ujung, audiens terisi
      q(IS, -0.13, 'whoosh', 0.30),
      q(IS, 0.30, 'reconnect', 0.32),
      q(IS, 0.45, 'trace-run', 0.16, 3),
      q(IS, 1.45, 'fill-rise', 0.26),
      q(IS, 2.60, 'success-ding', 0.30),
      // CTA
      q('CTA', -0.45, 'riser', 0.30),
      q('CTA', 0.05, 'brand-boom', 0.36),
      q('CTA', 0.95, 'btn-click', 0.30),
      q('CTA', S.CTA - 1.0, 'success-ding', 0.22, 5),
    ];
  },

  musik: [{
    nama: 'musik',
    detik: ({total}) => total + 10,
    titik: [
      ['Buka', 0.0, -19], ['Buka', 3.0, -17],
      ['Kosong', 1.0, -18],
      ['Sebab', 0.5, -16],
      ['Mati', 0.5, -15],
      ['Isi', 0.5, -12],
      ['CTA', 0.3, -11],
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

  // Sub bed dipotong lebih dalam dari bawaan: cek `sub bed` melaporkan musik <120 Hz
  // ada di -34,5 dB, yaitu 1,1 dB DI ATAS pita bicara VO. Kick-nya mencuri jatah headroom
  // VO lewat LUFS terintegrasi tanpa pernah benar-benar menutupinya.
  // lufsTarget -14,5, bukan -14. Master WAV keluar -1,4 dBTP tetapi encode AAC di dalam
  // MP4 menaikkannya ke -0,8 — +0,6 dB, lebih besar dari margin 0,3 dB di mixer, jadi
  // spesifikasi -1,0 dBTP terlanggar. True peak itu batas keras (distorsi sesudah platform
  // encode ulang); LUFS toh dinormalkan Meta. Jadi 0,5 dB LUFS ditukar demi headroom peak.
  mixer: {
    lufsTarget: -14.5,
    gainVO: 1.45, gainSFX: 0.36,
    duckMusik: {th: 0.15, ratio: 2, attack: 40, release: 220},
    bedMusik: {hpf: 82, subF: 105, subG: -9},
  },

  periksa: {busTitik: [1, 7, 12, 17, 22, 27]},
};
