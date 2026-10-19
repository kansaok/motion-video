// V04 · Reels organik "Contekan konten TOF, MOF, BOF" (hook: simpan). Jalankan: motion all
//
// Sumber brief: src/prompts/V04-reels-funnel/prompt.md. Yang menyimpang dari brief, dan sebabnya:
//
// 1. Jadwal 15 kartu kuis TIDAK dipaku ke ketukan tetap 1,5 detik. VO "nama... tahap!" butuh
//    ± 1,9 detik, jadi kartu mengikuti suaranya: muncul saat nama diucapkan, mendarat tepat di
//    kata tahap. Angkanya ditulis kartu.mjs ke jsx dan ke kartu.json (dibaca di bawah).
// 2. Suara Cahaya, bukan Eleven v3: satu merek satu suara. Tag diganti tanda baca.
//    TOF, MOF, BOF dieja per huruf ("Te O eF"), bukan "Tof" seperti brief — keputusan Rama.
// 3. Kalimat penutup "Kirim juga ke teman yang lagi bingung!" jadi baris sendiri, terakhir,
//    intonasi dinaikkan (preferensi tetap Rama untuk ajakan).
// 4. Transisi lembut dan pelan, BGM diduck dalam saat VO bicara; bagian kuis −3 dB ekstra.
// 5. Frame 0 = sampul: "Bingung mau posting apa? Simpan video ini." sudah ada di frame 0.
import {existsSync, readFileSync} from 'node:fs';
import {eja} from '../../lib/lafal.mjs';

const KF = new URL('./kartu.json', import.meta.url);
const KARTU = existsSync(KF) ? JSON.parse(readFileSync(KF, 'utf8'))
  : Array.from({length: 15}, (_, i) => (i < 6 ? [2.0 + i * 1.9, 3.0 + i * 1.9] : [12.4 + (i - 6) * 1.0, 13.3 + (i - 6) * 1.0]));
const SEQ = ['bof', 'tof', 'mof', 'tof', 'bof', 'mof', 'tof', 'mof', 'bof', 'mof', 'tof', 'bof', 'tof', 'bof', 'mof'];
const NADA = {tof: 0, mof: 4, bof: 7};                 // C, E, G dari satu berkas marimba

const NAMA = ['Testimoni', 'Konten relatable', 'Tutorial', 'Mitos versus fakta', 'Demo produk', 'Studi kasus',
  'Tren plus sudut niche', 'Behind the scenes', 'Bongkar keberatan', 'Perbandingan', 'Listicle',
  'Penawaran terbatas', 'Hot take', 'Cara order', 'Jawab FAQ'];
const TAHAP = {tof: 'TOF', mof: 'MOF', bof: 'BOF'};   // dieja huruf: "Te O eF" (lafal di bawah)

/* Seluruh kuis dibaca SATU baris VO. Versi pertama memakai 15 baris terpisah, dan kartu 7-15
   cuma "Tof!" sepanjang 0,34-0,44 detik: tiap potongan punya nada dan jedanya sendiri, dan
   hasilnya dilaporkan "VO-nya keputus-putus". Satu baris membuat intonasinya mengalir; jadwal
   kartu lalu dibaca dari timestamp kata tahapnya (kartu.mjs).
   Kartu 1-6 menyebut nama lalu tahap; kartu 7-15 cuma tahap, dipisah titik — kuisnya makin
   cepat menjelang akhir. */
const RAPID = 6;
const KUIS = NAMA.map((n, i) => (i < RAPID ? `${n}? ${TAHAP[SEQ[i]]}!` : `${i === RAPID ? 'Sisanya, cepat! ' : ''}${TAHAP[SEQ[i]]}.`)).join(' ');

const HINDARI = ['vocals', 'singing', 'lyrics', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808', 'long fade in'];

export default {
  nama: 'reels-contekan',
  komposisi: 'V04 Reels Contekan TOF MOF BOF.dc.html',
  jsx: 'funnel-contekan.jsx',
  kapsi: false,
  keluaran: 'rama-digital-reels-contekan-9x16.mp4',

  suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260927,
          speed: (l) => (l.no === 10 ? 1.05 : 1.20), stability: 0.14, similarity: 0.80, style: 0.72},

  lafal: {
    // TOF/MOF/BOF dieja per huruf: "Te O eF", "eM O eF", "Be O eF" (keputusan Rama, 27 Sep 2026).
    TOF: eja('TOF'), MOF: eja('MOF'), BOF: eja('BOF'),
    'Custom Audience': 'kastem odiens',
    insight: 'insait',
    niche: 'nis',
    Listicle: 'listikel',
    'Hot take': 'hot teik',
    FAQ: eja('FAQ'),
  },

  vo: [
    {no: 1, sc: 'Hook',   off: 0.10, text: 'Bingung mau posting apa? Simpan video ini!'},
    {no: 2, sc: 'Salah',  off: 0.10, text: 'Isinya jualan semua? Orang kabur. Edukasi semua? Nggak ada yang beli. Tiap konten punya tugas.'},
    {no: 3, sc: 'Funnel', off: 0.10, text: 'Tugasnya ada tiga. TOF, biar kenal. MOF, biar percaya. BOF, biar beli.'},
    {no: 4, sc: 'Sortir', off: 0.10, style: 0.85, text: 'Oke, tebak! Konten ini masuk mana?'},
    {no: 5, sc: 'Sortir', off: KARTU[0][0], style: 0.85, text: KUIS},
    {no: 6, sc: 'Sortir', off: KARTU[14][1] + 0.6, style: 0.85, text: 'Nah, ini contekannya. Screenshot, ya!'},
    {no: 7, sc: 'Target', off: 0.10, text: 'Kalau dipasang iklan: TOF ke orang baru. MOF sama BOF, retarget pakai Custom Audience.'},
    {no: 8, sc: 'Porsi',  off: 0.10, text: 'Porsi seminggu: tiga TOF, dua MOF, satu BOF. Terus geser sesuai angka di insight kamu.'},
    {no: 9, sc: 'Simpan', off: 0.10, text: 'Simpan dulu, buka lagi pas mau bikin konten.'},
    // Ajakan kirim: baris sendiri, kalimat TERAKHIR, intonasi dinaikkan.
    {no: 10, sc: 'Simpan', off: 2.60, style: 0.95, stability: 0.05, text: 'Kirim juga ke teman yang lagi bingung!'},
  ],

  tata: {mode: 'jangkar', jeda: 0.10, ekorBiasa: 0.30, ekor: {Simpan: 1.1}},

  sfx: [
    ['pop',     0.5, 'one bright bubbly cartoon pop, short and round, dry close-mic, no reverb, no music, single pop'],
    ['motif',   0.8, 'three quick playful marimba notes rising C E G, bright wooden mallet, dry, no reverb, no other instruments, single phrase'],
    ['salah',   0.5, 'one short comedic wrong-answer buzzer, soft and rounded, not harsh, dry, no reverb, no music, single event'],
    ['stempel', 0.5, 'a rubber stamp thump with a small sparkle, dry close-mic, no reverb, no music, single event'],
    ['marimba', 0.6, 'one single marimba note C with a soft woody knock, warm mallet, clean decay, dry, no reverb, no music, single hit'],
    ['thud',    0.5, 'one soft user interface thud, rounded and warm, dry, no reverb, no music, single hit'],
    ['kartu',   0.5, 'a quick crisp card flip pop, dry close-mic, no reverb, no music, single event'],
    ['tiktok',  0.8, 'a light game-show clock tick tock, two soft ticks, clean, dry, no reverb, no music, single event'],
    ['terbang', 0.5, 'one short soft airy swoosh, gentle, dry, no reverb, no music, single motion'],
    ['selesai', 1.0, 'a satisfying correct-answer chime ascending C E G with a sparkle, bright and happy, dry, no reverb, single phrase'],
    ['jepret',  0.5, 'one phone camera shutter click, clean, dry close-mic, no reverb, no music, single click'],
    ['geser',   0.5, 'a quick soft slide-in swoosh with a gentle knock, dry, no reverb, no music, single event'],
    ['target',  0.5, 'a clean target lock-on beep, two short soft tones, dry, no reverb, no music, single event'],
    ['simpan',  0.5, 'a bookmark ribbon flick with a soft click, dry close-mic, no reverb, no music, single event'],
    ['kirim',   0.5, 'a chat message sent swoosh with a soft pop, gentle, dry, no reverb, no music, single event'],
    // Transisi: LEMBUT. Whoosh cerah dilaporkan "kasar, bikin gak fokus".
    ['sapu',    0.6, 'one very soft gentle airy swish, smooth and muted, warm, no harsh high frequencies, no hiss, dry, no reverb, no music, single motion'],
    ['tap',     0.5, 'one soft rubbery thump with a tiny pop, gentle and clean, dry, no reverb, no music, single hit'],
  ],

  /* Dipaku ke beat animasi di funnel-contekan.jsx. Identitas: nada kolom C/E/G (satu berkas
     marimba, `nada` 0/+4/+7) di layar Funnel, di tiap pendaratan kartu, dan di Porsi. */
  cue: ({C, total}) => {
    const tr = (sc, nada = 0) => [
      {at: C[sc] - 0.32, nama: 'sapu', gain: 0.10, nada},
      {at: C[sc],        nama: 'tap',  gain: 0.12, nada},
    ];
    const S = C.Sortir;
    const kartu = KARTU.flatMap(([a, land], i) => [
      {at: S + a,          nama: 'kartu',   gain: 0.14},
      {at: S + a + 0.2,    nama: 'tiktok',  gain: i < 3 ? 0.16 : 0.12},
      {at: S + land - 0.45, nama: 'terbang', gain: 0.12},
      {at: S + land,       nama: 'marimba', gain: 0.30, nada: NADA[SEQ[i]]},
    ]);
    const selesai = S + KARTU[14][1];
    return [
      {at: 0.02, nama: 'sapu',  gain: 0.10},
      {at: 1.20, nama: 'pop',   gain: 0.26},
      {at: 1.50, nama: 'motif', gain: 0.30},

      ...tr('Salah'),
      {at: C.Salah + SALAH[0], nama: 'salah', gain: 0.28},
      {at: C.Salah + SALAH[1], nama: 'salah', gain: 0.28, nada: -1},
      {at: C.Salah + SALAH[2], nama: 'stempel', gain: 0.32},

      {at: C.Funnel - 0.32, nama: 'sapu', gain: 0.10, nada: 2},
      {at: C.Funnel,        nama: 'tap',  gain: 0.12, nada: 2},
      ...FUNNEL.map((t, i) => ({at: C.Funnel + t, nama: 'marimba', gain: 0.32, nada: [0, 4, 7][i]})),

      {at: S - 0.32, nama: 'sapu', gain: 0.10},
      {at: S + 0.15, nama: 'thud', gain: 0.18, nada: 0},
      {at: S + 0.30, nama: 'thud', gain: 0.18, nada: 2},
      {at: S + 0.45, nama: 'thud', gain: 0.18, nada: 4},
      ...kartu,
      {at: selesai + 0.05, nama: 'selesai', gain: 0.32},
      {at: selesai + 2.00, nama: 'jepret',  gain: 0.34},

      {at: C.Target - 0.32, nama: 'sapu', gain: 0.10, nada: -2, pan: 0.3},
      {at: C.Target,        nama: 'tap',  gain: 0.12, nada: -2},
      {at: C.Target + 1.35, nama: 'geser', gain: 0.22, pan: -0.2},
      {at: C.Target + 3.10, nama: 'geser', gain: 0.22, pan: -0.2, nada: 2},
      {at: C.Target + 4.00, nama: 'geser', gain: 0.22, pan: -0.2, nada: 4},
      {at: C.Target + 5.90, nama: 'target', gain: 0.26},

      ...tr('Porsi', 2),
      ...[[1.1, 0], [1.25, 0], [1.4, 0], [2.1, 4], [2.25, 4], [2.9, 7]].map(([t, n]) => ({at: C.Porsi + t, nama: 'marimba', gain: 0.24, nada: n})),

      ...tr('Simpan', 3),
      {at: C.Simpan + 1.30, nama: 'simpan', gain: 0.28},
      {at: C.Simpan + 2.60, nama: 'kirim',  gain: 0.26},
      {at: total - 0.8,     nama: 'motif',  gain: 0.26},        // sonic logo penutup
    ];
  },

  musik: [{
    nama: 'bgm', mulai: 0, fadeOut: ({total}) => [total - 0.6, 0.6],
    rencana: ({C, total}) => {
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const inti = ['playful upbeat funky pop instrumental', '120 BPM', 'C major', 'bouncy bass', 'crisp claps', 'muted funk guitar',
        'bright marimba and pizzicato plucks', 'light game-show quiz feel', 'glossy modern production'];
      const selesai = C.Sortir + KARTU[14][1];
      return [
        b(0, C.Salah, '[hook]', [...inti, 'instant hook with a catchy marimba C E G motif', 'no fade in', 'steady and continuous']),
        b(C.Salah, C.Funnel, '[groove]', [...inti, 'groove with two comedic wrong-answer brass stabs', 'steady and continuous']),
        b(C.Funnel, C.Sortir, '[build]', [...inti, 'building groove', 'C E G motif one note per bar', 'rising']),
        b(C.Sortir, selesai, '[quiz]', [...inti, 'light quiz groove', 'soft ticking clock layer', 'clean mids leaving room for voice', 'small drum fills', 'steady and continuous']),
        b(selesai, C.Target, '[chorus]', [...inti, 'satisfying resolve hit into a full celebratory chorus with the hook']),
        b(C.Target, C.Porsi, '[focus]', [...inti, 'tight focused groove', 'bass stabs', 'room for voice', 'steady and continuous']),
        b(C.Porsi, C.Simpan, '[count]', [...inti, 'lighter groove', 'marimba counting up', 'steady and continuous']),
        b(C.Simpan, total, '[final hook]', [...inti, 'final hook', 'happy and confident']),
        b(total, total + 6, '[tail]', [...inti, 'final hook continues', 'steady and continuous']),
      ];
    },
    titik: [
      ['Hook', 0, -14], ['Salah', 0.3, -16], ['Funnel', 0.3, -16],
      ['Sortir', 0.3, -19],                                  // kuis: −3 dB ekstra, nama kartu harus jelas
      ['Target', 0, -16], ['Porsi', 0, -16], ['Simpan', 0, -15],
    ],
  }],

  sampul: {detik: 0},
  mixer: {gainVO: 1.55, gainSFX: 0.74, duckMusik: {th: 0.015, ratio: 14, attack: 25, release: 320}},
  periksa: {busTitik: [1.2, 3.55]},
};

// Diisi dari transkrip VO sesudah `plan`: detik dari awal scene masing-masing.
const SALAH = [1.6, 3.55, 5.4];     // "orang kabur" · "nggak ada yang beli" · "tugas."
const FUNNEL = [1.3, 2.75, 4.3];   // batang TOF, MOF, BOF
