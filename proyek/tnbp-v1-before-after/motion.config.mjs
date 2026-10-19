// TNBP V1 · Before vs After (Reels 9:16, ±28 dtk) — dari dokumen "Paket Iklan Meta Ads — The No BS Prompting".
//
// Urutan kerja (komposisi ditulis tangan, bukan dari zip Claude Design):
//   motion sfx → motion plan → motion apply → node tools/timing.mjs → motion music → motion mix → motion render → motion check
//
// Yang menyimpang dari brief V1, dan sebabnya:
// 1. Scene RASCI diberi baris VO kedua "Role, Action, Scope, Constraints, Input." supaya tiap huruf
//    yang muncul punya kata yang diucapkan bersamaan (brief: huruf muncul satu per satu).
// 2. Logo ChatGPT/OpenAI TIDAK digambar (aturan penolakan iklan di dokumen). UI chat netral "AI Chat".
// 3. Contoh prompt memakai kedai "Teras Sore", sama dengan sales page (aturan kesinambungan di dokumen).
// 4. Harga diucapkan "sembilan puluh sembilan ribu"; layar tetap "Rp99 ribu".
import {existsSync, readFileSync} from 'node:fs';
import {eja} from '../../lib/lafal.mjs';

// Beat yang dipakai bersama komposisi (src/*.dc.html). Ubah keduanya bersamaan.
const KIRIM_A = 1.75;                                  // pesan pertama terkirim, relatif Hook
const W2 = [0, 0.355, 0.795];                            // "Panjang." "Kaku." "AI banget." — fraksi VO2
const W4 = [0, 0.20, 0.404, 0.648, 0.891];      // awal kata Role/Action/Scope/Constraints/Input di VO4
const tileT = (P, E, i) => P[4] + (E[4] - P[4]) * W4[i];
const kirimB = (P, E) => Math.max(E[4], tileT(P, E, 4) + 0.9) + 0.35;
const HIT = 0.5;                                       // hentakan terbesar = C.Hasil + 0.5

const HINDARI = ['vocals', 'singing', 'lyrics', 'choir', 'long fade in', 'heavy distorted guitar', 'trap 808 glide'];

// Titik A/B bus SFX dipilih di tempat VO diam (dibaca dari timeline.json sesudah plan).
const TL = new URL('./timeline.json', import.meta.url);
const busTitik = (() => {
  if (!existsSync(TL)) return [];
  let a = 0; const C = {};
  for (const s of JSON.parse(readFileSync(TL, 'utf8'))) { C[s.name] = a; a += s.dur; }
  return [+(C.Hasil + HIT + 0.05).toFixed(2), +(C.RASCI + 0.05).toFixed(2)];
})();

export default {
  nama: 'tnbp-v1-before-after',
  komposisi: 'TNBP V1 Before After 9x16.dc.html',
  keluaran: 'tnbp-v1-before-after-9x16.mp4',

    // VO digenerate lewat connector ElevenLabs (flow 1bH4LuzKZI3cJfFrYq9B), suara Zandhira, eleven_v4,
  // lalu dimasukkan ke cache aset/vo oleh tools/impor-vo.mjs. Mengubah teks = generate ulang di connector.
  suara: {id: 'R7biip4PFaCanifKPxe6', model: 'eleven_v4'},

  lafal: {
    ChatGPT: 'Chat G P T',
    RASCI: eja('RASCI'),
    AI: 'A I',
  },

  vo: [
    {no: 1, sc: 'Hook',    off: 0.10, text: 'Ini alasan jawaban ChatGPT lo selalu generik.'},
    {no: 2, sc: 'Generik', off: 1.45, text: 'Panjang. Kaku. AI banget.'},
    {no: 3, sc: 'RASCI',   off: 0.40, text: 'Sekarang pakai lima bagian ini. Namanya RASCI.'},
    {no: 4, sc: 'RASCI',   off: 3.55, text: 'Role, Action, Scope, Constraints, Input.'},
    {no: 5, sc: 'Hasil',   off: 1.10, text: 'Permintaan sama. Hasil beda level!'},
    {no: 6, sc: 'CTA',     off: 0.60, text: 'Framework lengkap, plus dua puluh satu prompt siap pakai.'},
    {no: 7, sc: 'CTA',     off: 3.65, text: 'Cuma sembilan puluh sembilan ribu. Link di bawah!'},
  ],

  tata: {mode: 'jangkar', jeda: 0.15, ekorBiasa: 0.35, ekor: {RASCI: 1.2, CTA: 1.2}},

  // Semua dari sfx-stok/ — tanpa biaya generate.
  sfx: [
    ['ketik',     '@stok/ketik'],
    ['klik',      '@stok/chip-klik'],
    ['kirim',     '@stok/cut-whoosh'],
    ['sapu',      '@stok/air-whoosh-fast'],
    ['pop',       '@stok/03-pop'],
    ['coret',     '@stok/marker-red'],
    ['stempel',   '@stok/11-stamp'],
    ['salah',     '@stok/salah'],
    ['riser',     '@stok/01-riser'],
    ['hisap',     '@stok/whoosh-rev'],
    ['hit',       '@stok/impact-hit'],
    ['sub',       '@stok/sub-drop'],
    ['centang',   '@stok/ding-check'],
    ['blip',      '@stok/checkpoint'],
    ['kaching',   '@stok/kaching'],
    ['jadi',      '@stok/jadi-ding'],
  ],

  cue: ({C, P, E, total}) => {
    const wt2 = (i) => P[2] + (E[2] - P[2]) * W2[i];
    const kb = kirimB(P, E);
    const H = C.Hasil + HIT;
    const d6 = E[6] - P[6];
    return [
      // Hook: ketikan di kolom input, lalu kirim
      {at: 0.15, nama: 'ketik', gain: 0.22},
      {at: 0.15 + 1.25, nama: 'ketik', gain: 0.16, nada: 1},
      {at: KIRIM_A - 0.02, nama: 'klik', gain: 0.28},
      {at: KIRIM_A, nama: 'kirim', gain: 0.22, pan: 0.2},

      // Generik: jawaban mengalir, lalu dicoret di tiap kata VO2
      {at: C.Generik + 0.35, nama: 'blip', gain: 0.18},
      {at: C.Generik + 0.40, nama: 'ketik', gain: 0.10, nada: 3},
      ...[0, 1, 2].flatMap((i) => [
        {at: wt2(i), nama: 'coret', gain: 0.30, nada: i, pan: [-0.35, 0, 0.35][i]},
        {at: wt2(i) + 0.03, nama: 'stempel', gain: 0.26, nada: -i},
      ]),
      {at: wt2(2) + 0.20, nama: 'salah', gain: 0.24},

      // RASCI: transisi, tiap huruf = pop naik nada + ketikan barisnya, lalu kirim
      {at: C.RASCI - 0.28, nama: 'sapu', gain: 0.20},
      ...[0, 1, 2, 3, 4].flatMap((i) => [
        {at: tileT(P, E, i), nama: 'pop', gain: 0.34, nada: [0, 2, 4, 5, 7][i]},
        {at: tileT(P, E, i) + 0.06, nama: 'ketik', gain: 0.13, nada: i % 2},
      ]),
      {at: kb - 0.02, nama: 'klik', gain: 0.28},
      {at: kb, nama: 'kirim', gain: 0.22, pan: 0.2},

      // Hasil: hentakan terbesar, dilapis empat (IKLAN.md §2) — sekali saja di video ini
      {at: H - 1.30, nama: 'riser', gain: 0.30},
      {at: H - 0.20, nama: 'hisap', gain: 0.30},
      {at: H,        nama: 'hit',   gain: 0.42},
      {at: H + 0.02, nama: 'sub',   gain: 0.40},
      {at: H + 0.42, nama: 'centang', gain: 0.34},
      {at: E[5] + 0.15, nama: 'stempel', gain: 0.18, nada: -2},
      {at: E[5] + 0.45, nama: 'pop', gain: 0.26, nada: 7},

      // CTA: buku masuk, isi paket satu per satu, harga
      {at: C.CTA - 0.28, nama: 'sapu', gain: 0.20, nada: -2},
      {at: C.CTA + 0.10, nama: 'stempel', gain: 0.22},
      ...[0.0, 0.32, 0.6, 0.85].map((f, i) => ({at: P[6] + d6 * f, nama: 'pop', gain: 0.26, nada: [0, 2, 4, 7][i]})),
      {at: P[7] - 0.35, nama: 'coret', gain: 0.24},
      {at: P[7] + 0.05, nama: 'kaching', gain: 0.32},
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
        b(0, C.RASCI, '[hook]', [...inti, 'starts on the first beat with full groove', 'no fade in', 'slightly tense', 'steady and continuous']),
        b(C.RASCI, C.Hasil, '[build]', [...inti, 'building groove', 'rising arpeggio', 'clean mids leaving room for voice', 'steady and continuous']),
        b(C.Hasil, C.CTA, '[drop]', [...inti, 'satisfying drop with full energy', 'uplifting', 'steady and continuous']),
        b(C.CTA, total, '[outro hook]', [...inti, 'final hook', 'happy and confident', 'steady and continuous']),
        b(total, total + 8, '[tail]', [...inti, 'final hook continues', 'steady and continuous']),
      ];
    },
    titik: [
      ['Hook', 0, -20], ['Generik', 0.3, -22], ['RASCI', 0.3, -23],
      // satu tukikan disengaja sebelum hentakan terbesar (IKLAN.md §1)
      ['Hasil', HIT - 0.85, -23], ['Hasil', HIT - 0.4, -32], ['Hasil', HIT + 0.05, -17],
      ['Hasil', HIT + 1.4, -22], ['CTA', 0.3, -21],
    ],
  }],

  sampul: {detik: 0},
  mixer: {gainVO: 2.0, gainSFX: 0.75, duckMusik: {th: 0.02, ratio: 10, attack: 25, release: 300}},
  periksa: {busTitik},
};
