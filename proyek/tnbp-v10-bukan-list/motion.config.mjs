// TNBP V10 · "Bukan list prompt mentah" (Reels 9:16, ±30 dtk) — dari dokumen "Paket Iklan Meta Ads — The No BS Prompting".
//
// Urutan kerja (komposisi ditulis tangan, VO dari connector ElevenLabs):
//   connector → aset/vo-luar/vo-NN.mp3 → node tools/impor-vo.mjs → motion sfx → motion plan → motion apply
//   → node tools/timing.mjs → motion music → motion mix → motion render → motion check
//
// Yang menyimpang dari brief V10, dan sebabnya:
// 1. Brief meminta talking head (penulis bicara ke kamera). Wajah tidak bisa direkam di sini, jadi naskah
//    yang sama dibacakan suara Zandhira, dengan visual tipografi kinetik. Kalau rekaman penulis sudah ada,
//    potongan VO-nya bisa menggantikan aset/vo-luar dan komposisinya tetap dipakai sebagai overlay.
// 2. Static "tabel perbandingan List prompt mentah vs Framework RASCI" masuk sebagai scene Banding.
// 3. Tidak menyebut nama atau produk kompetitor (aturan brief).
// 4. "Rp99 ribu" diucapkan "sembilan puluh sembilan ribu"; layar tetap "Rp99.000".
import {existsSync, readFileSync} from 'node:fs';
import {eja} from '../../lib/lafal.mjs';

// Beat yang dipakai bersama komposisi (src/*.dc.html). Ubah keduanya bersamaan.
const STAMP1 = 0.80;                                   // "nggak ada yang kepake" — fraksi VO1
const NGACO = 0.78;                                    // kata "ngaco" — fraksi VO3
const W6 = [0, 0.20, 0.404, 0.648, 0.891];             // Role/Action/Scope/Constraints/Input — fraksi VO6
const CHIP7 = [0.22, 0.36, 0.5, 0.66, 0.86];           // lima kasus muncul sepanjang VO7
const KANAN4 = 0.6;                                    // "tapi cara bikin prompt sendiri" — fraksi VO4
const ISI8 = [0.32, 0.6, 0.8];                         // isi paket sepanjang VO8

const HINDARI = ['vocals', 'singing', 'lyrics', 'choir', 'long fade in', 'heavy distorted guitar', 'trap 808 glide'];

const TL = new URL('./timeline.json', import.meta.url);
const busTitik = (() => {
  if (!existsSync(TL)) return [];
  let a = 0; const C = {};
  for (const s of JSON.parse(readFileSync(TL, 'utf8'))) { C[s.name] = a; a += s.dur; }
  return [+(C.Banding + 0.05).toFixed(2), +(C.CTA + 0.12).toFixed(2)];
})();

export default {
  nama: 'tnbp-v10-bukan-list',
  komposisi: 'TNBP V10 Bukan List 9x16.dc.html',
  keluaran: 'tnbp-v10-bukan-list-9x16.mp4',

  // VO lewat connector ElevenLabs, suara Zandhira, eleven_v4; diimpor oleh tools/impor-vo.mjs (atempo = tempoVO).
  suara: {id: 'R7biip4PFaCanifKPxe6', model: 'eleven_v4'},
  tempoVO: 1.25,                                         // naskah V10 panjang; 1,12 menghasilkan 35,5 dtk, lewat batas 30 dtk brief

  lafal: {
    RASCI: eja('RASCI'),
    'No BS': 'No B S',
  },

  vo: [
    {no: 1, sc: 'Hook',     off: 0.10, text: 'Udah beli ribuan prompt, tapi nggak ada yang kepake?'},
    {no: 2, sc: 'Contekan', off: 0.20, text: 'Wajar. List prompt itu kayak contekan.'},
    {no: 3, sc: 'Contekan', off: 2.40, text: 'Begitu kasus lo beda sedikit, hasilnya langsung ngaco.'},
    {no: 4, sc: 'Banding',  off: 0.20, text: 'Yang lo butuhin bukan prompt lebih banyak, tapi cara bikin prompt sendiri.'},
    {no: 5, sc: 'RASCI',    off: 0.15, text: 'Gue pakai framework RASCI.'},
    {no: 6, sc: 'RASCI',    off: 2.00, text: 'Role, Action, Scope, Constraints, Input.'},
    {no: 7, sc: 'RASCI',    off: 5.00, text: 'Lima bagian ini bisa dipakai untuk kasus apa pun, dari caption sampai laporan.'},
    {no: 8, sc: 'CTA',      off: 0.30, text: 'Framework-nya ada di ebook The No BS Prompting, plus dua puluh satu contoh prompt dan tool pembuat prompt.'},
    {no: 9, sc: 'CTA',      off: 5.00, text: 'Sembilan puluh sembilan ribu. Link-nya di bawah!'},
  ],

  tata: {mode: 'jangkar', jeda: 0.1, ekorBiasa: 0.3, ekor: {Banding: 0.45, CTA: 0.9}},

  // Semua dari sfx-stok/ — tanpa biaya generate.
  sfx: [
    ['tumpuk',    '@stok/card-place'],
    ['scroll',    '@stok/paper-scroll'],
    ['stempel',   '@stok/09-stamp'],
    ['halaman',   '@stok/page-flip'],
    ['flip',      '@stok/flip'],
    ['salah',     '@stok/error-buzz'],
    ['sapu',      '@stok/air-whoosh-fast'],
    ['swap',      '@stok/deep-swap-whoosh'],
    ['pop',       '@stok/03-pop'],
    ['coret',     '@stok/marker-red'],
    ['centang',   '@stok/ding-check'],
    ['riser',     '@stok/01-riser'],
    ['hisap',     '@stok/whoosh-rev'],
    ['hit',       '@stok/impact-hit'],
    ['sub',       '@stok/sub-drop'],
    ['kaching',   '@stok/kaching'],
    ['jadi',      '@stok/jadi-ding'],
  ],

  cue: ({C, P, E, total}) => {
    const at = (no, f) => P[no] + (E[no] - P[no]) * f;
    return [
      // Hook: tumpukan berkas prompt, lalu dicap "belum dipakai"
      {at: 0.05, nama: 'scroll', gain: 0.18},
      ...[0.25, 0.55, 0.85, 1.15].map((t, i) => ({at: t, nama: 'tumpuk', gain: 0.20, nada: i, pan: [-0.4, 0.4, -0.2, 0.2][i]})),
      {at: at(1, STAMP1), nama: 'stempel', gain: 0.34},

      // Contekan: kartu contekan, kasus diganti, hasilnya ngaco
      {at: C.Contekan - 0.28, nama: 'sapu', gain: 0.20},
      {at: C.Contekan + 0.05, nama: 'halaman', gain: 0.30},
      {at: P[3] + 0.05, nama: 'flip', gain: 0.30},
      {at: at(3, NGACO), nama: 'salah', gain: 0.26},

      // Banding: tabel — kiri dicoret, kanan dicentang
      {at: C.Banding - 0.3, nama: 'swap', gain: 0.24},
      ...[0, 1, 2].map((i) => ({at: at(4, 0.23) + i * 0.3, nama: 'coret', gain: 0.22, nada: i})),
      ...[0, 1, 2].map((i) => ({at: at(4, KANAN4) + i * 0.35, nama: 'pop', gain: 0.30, nada: [0, 4, 7][i]})),

      // RASCI: hentakan terbesar di nama framework (lapis empat, sekali per video), lalu huruf per kata
      {at: C.RASCI - 1.0, nama: 'riser', gain: 0.28},
      {at: C.RASCI - 0.2, nama: 'hisap', gain: 0.28},
      {at: C.RASCI,       nama: 'hit',   gain: 0.40},
      {at: C.RASCI + 0.02, nama: 'sub',  gain: 0.38},
      ...W6.map((f, i) => ({at: at(6, f), nama: 'pop', gain: 0.32, nada: [0, 2, 4, 5, 7][i]})),
      ...CHIP7.map((f, i) => ({at: at(7, f), nama: 'tumpuk', gain: 0.22, nada: i, pan: [-0.3, 0.3, -0.15, 0.15, 0][i]})),
      {at: E[7] + 0.1, nama: 'centang', gain: 0.30},

      // CTA
      {at: C.CTA - 0.28, nama: 'sapu', gain: 0.20, nada: -2},
      {at: C.CTA + 0.10, nama: 'stempel', gain: 0.22, nada: 3},
      ...ISI8.map((f, i) => ({at: at(8, f), nama: 'pop', gain: 0.26, nada: [0, 4, 7][i]})),
      {at: P[9] - 0.3, nama: 'coret', gain: 0.24},
      {at: P[9] + 0.05, nama: 'kaching', gain: 0.32},
      {at: total - 1.0, nama: 'jadi', gain: 0.26},
    ];
  },

  musik: [{
    nama: 'bgm', mulai: 0, fadeOut: ({total}) => [total - 0.7, 0.7],
    rencana: ({C, total}) => {
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const inti = ['modern lo-fi tech pop instrumental', '100 BPM', 'punchy clean drums', 'warm plucky synth bass',
        'bright pluck lead', 'glossy social media ad production', 'confident and playful'];
      return [
        b(0, C.Banding, '[hook]', [...inti, 'starts on the first beat with full groove', 'no fade in', 'slightly tense and sarcastic', 'steady and continuous']),
        b(C.Banding, C.RASCI, '[build]', [...inti, 'building groove', 'rising arpeggio', 'clean mids leaving room for voice', 'steady and continuous']),
        b(C.RASCI, C.CTA, '[drop]', [...inti, 'satisfying drop with full energy', 'uplifting', 'steady and continuous']),
        b(C.CTA, total, '[outro hook]', [...inti, 'final hook', 'happy and confident', 'steady and continuous']),
        b(total, total + 8, '[tail]', [...inti, 'final hook continues', 'steady and continuous']),
      ];
    },
    // Bed mulai -20 dB: suara Zandhira di V1 baru +9,9 dB di atas musik dengan bed -20/-23.
    titik: [
      ['Hook', 0, -20], ['Contekan', 0.3, -22], ['Banding', 0.3, -23],
      // satu tukikan disengaja sebelum hentakan terbesar (IKLAN.md §1)
      ['RASCI', -0.85, -23], ['RASCI', -0.4, -32], ['RASCI', 0.05, -17],
      ['RASCI', 1.4, -22], ['CTA', 0.3, -21],
    ],
  }],

  sampul: {detik: 0},
  mixer: {gainVO: 2.0, gainSFX: 0.75, duckMusik: {th: 0.02, ratio: 10, attack: 25, release: 300}},
  periksa: {busTitik},
};
