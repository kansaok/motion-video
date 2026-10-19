// TNBP V2 · "Tool instan" (Reels 9:16, 15-20 dtk) — dari dokumen "Paket Iklan Meta Ads — The No BS Prompting".
//
// Urutan kerja (komposisi ditulis tangan, VO dari connector ElevenLabs):
//   connector → aset/vo-luar/vo-NN.mp3 → node tools/impor-vo.mjs → motion sfx → motion plan → motion apply
//   → node tools/timing.mjs → motion music → motion mix → motion render → motion check
//
// Yang menyimpang dari brief V2, dan sebabnya:
// 1. Brief hanya memberi teks layar per beat; VO ditulis dari teks itu, satu kalimat per beat.
// 2. Detik 0-2: opsi "teks besar di layar hitam" (wajah bingung tidak bisa direkam).
// 3. Layar BI1MP PromptAuthority digambar ulang (bukan rekaman layar asli). Kalau rekaman asli tersedia,
//    taruh sebagai <video> di scene Ketik/Tanya/Hasil — renderer sudah menunggu `seeked` per frame.
import {existsSync, readFileSync} from 'node:fs';

// Beat relatif awal scene — dipakai bersama komposisi (src/*.dc.html). Ubah keduanya bersamaan.
const KETIK = [0.3, 1.9];           // [mulai, lama] mengetik permintaan
const KIRIM = 2.4;                  // tombol kirim (relatif Ketik)
const TANYA = [0.2, 1.55, 2.9];     // pertanyaan tool muncul (relatif Tanya)
const JAWAB = 0.6;                  // jawaban diketik sesudah pertanyaan
const HIT = 0.3;                    // prompt jadi (relatif Hasil) — hentakan terbesar
const GULIR = [0.9, 2.6];           // prompt digulir cepat [mulai, lama]
const SALIN = 3.8;                  // tombol "Salin prompt" ditekan

const HINDARI = ['vocals', 'singing', 'lyrics', 'choir', 'long fade in', 'heavy distorted guitar', 'trap 808 glide'];

const TL = new URL('./timeline.json', import.meta.url);
const busTitik = (() => {
  if (!existsSync(TL)) return [];
  let a = 0; const C = {};
  for (const s of JSON.parse(readFileSync(TL, 'utf8'))) { C[s.name] = a; a += s.dur; }
  return [+(C.Hasil + HIT + 0.04).toFixed(2), +(C.Ketik + KIRIM + 0.05).toFixed(2)];
})();

export default {
  nama: 'tnbp-v2-tool-instan',
  komposisi: 'TNBP V2 Tool Instan 9x16.dc.html',
  keluaran: 'tnbp-v2-tool-instan-9x16.mp4',

  // VO lewat connector ElevenLabs, suara Zandhira, eleven_v4; diimpor oleh tools/impor-vo.mjs (atempo = tempoVO).
  suara: {id: 'R7biip4PFaCanifKPxe6', model: 'eleven_v4'},
  tempoVO: 1.12,

  lafal: {'No BS': 'No B S'},

  vo: [
    {no: 1, sc: 'Hook',  off: 0.10, text: 'Males nyusun prompt? Pakai ini.'},
    {no: 2, sc: 'Ketik', off: 0.20, text: 'Ketik maunya pakai bahasa biasa.'},
    {no: 3, sc: 'Tanya', off: 0.20, text: 'Jawab beberapa pertanyaan singkat.'},
    {no: 4, sc: 'Hasil', off: 0.45, text: 'Langsung jadi prompt profesional!'},
    {no: 5, sc: 'CTA',   off: 0.30, text: 'Bonusnya ada di ebook The No BS Prompting. Link di bawah!'},
  ],

  tata: {mode: 'jangkar', jeda: 0.12, ekorBiasa: 0.3, ekor: {CTA: 1.0}},

  // Semua dari sfx-stok/ — tanpa biaya generate.
  sfx: [
    ['ketik',    '@stok/ketik'],
    ['klik',     '@stok/chip-klik'],
    ['kirim',    '@stok/chime-send'],
    ['tanya',    '@stok/chat-pop'],
    ['jawab',    '@stok/bubble-pop'],
    ['gulir',    '@stok/paper-scroll'],
    ['sapu',     '@stok/air-whoosh-fast'],
    ['stempel',  '@stok/11-stamp'],
    ['centang',  '@stok/ding-check'],
    ['riser',    '@stok/01-riser'],
    ['hisap',    '@stok/whoosh-rev'],
    ['hit',      '@stok/impact-hit'],
    ['sub',      '@stok/sub-drop'],
    ['jadi',     '@stok/jadi-ding'],
  ],

  cue: ({C, total}) => [
    // Hook: teks besar, "Pakai ini." dibanting
    {at: 0.02, nama: 'stempel', gain: 0.26},
    {at: 1.45, nama: 'stempel', gain: 0.30, nada: 3},          // = PAKAI di komposisi (kata "Pakai ini")

    // Ketik
    {at: C.Ketik - 0.28, nama: 'sapu', gain: 0.20},
    {at: C.Ketik + KETIK[0], nama: 'ketik', gain: 0.20},
    {at: C.Ketik + KETIK[0] + 1.0, nama: 'ketik', gain: 0.16, nada: 1},
    {at: C.Ketik + KIRIM - 0.02, nama: 'klik', gain: 0.28},
    {at: C.Ketik + KIRIM, nama: 'kirim', gain: 0.26},

    // Tanya: tiap pertanyaan + jawaban
    ...TANYA.flatMap((t, i) => [
      {at: C.Tanya + t, nama: 'tanya', gain: 0.28, nada: [0, 2, 4][i]},
      {at: C.Tanya + t + JAWAB, nama: 'ketik', gain: 0.12, nada: i % 2},
      {at: C.Tanya + t + JAWAB + 0.35, nama: 'jawab', gain: 0.24, nada: [0, 2, 4][i], pan: 0.25},
    ]),

    // Hasil: hentakan terbesar (lapis empat, sekali per video), lalu prompt digulir cepat
    {at: C.Hasil + HIT - 1.30, nama: 'riser', gain: 0.28},
    {at: C.Hasil + HIT - 0.20, nama: 'hisap', gain: 0.28},
    {at: C.Hasil + HIT,        nama: 'hit',   gain: 0.40},
    {at: C.Hasil + HIT + 0.02, nama: 'sub',   gain: 0.38},
    {at: C.Hasil + GULIR[0], nama: 'gulir', gain: 0.22},
    {at: C.Hasil + SALIN - 0.02, nama: 'klik', gain: 0.28},
    {at: C.Hasil + SALIN + 0.05, nama: 'centang', gain: 0.30},

    // CTA
    {at: C.CTA - 0.28, nama: 'sapu', gain: 0.20, nada: -2},
    {at: C.CTA + 0.10, nama: 'stempel', gain: 0.22},
    {at: total - 1.0, nama: 'jadi', gain: 0.26},
  ],

  musik: [{
    nama: 'bgm', mulai: 0, fadeOut: ({total}) => [total - 0.6, 0.6],
    rencana: ({C, total}) => {
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const inti = ['modern lo-fi tech pop instrumental', '100 BPM', 'punchy clean drums', 'warm plucky synth bass',
        'bright pluck lead', 'glossy social media ad production', 'confident and playful'];
      // Hook (±2 dtk) di bawah batas API 3 dtk per bagian, jadi digabung dengan Ketik.
      return [
        b(0, C.Tanya, '[hook]', [...inti, 'starts on the first beat with full groove', 'no fade in', 'steady and continuous']),
        // Percobaan pertama bolong 6,0-7,25 dtk (-60 dB) di awal bagian ini; drum diminta tetap jalan.
        b(C.Tanya, C.Hasil, '[build]', [...inti, 'drums keep playing the whole time', 'building groove', 'rising arpeggio', 'always present', 'steady and continuous']),
        b(C.Hasil, C.CTA, '[drop]', [...inti, 'satisfying drop with full energy', 'uplifting', 'steady and continuous']),
        b(C.CTA, total, '[outro hook]', [...inti, 'final hook', 'happy and confident', 'steady and continuous']),
        b(total, total + 8, '[tail]', [...inti, 'final hook continues', 'steady and continuous']),
      ];
    },
    titik: [
      ['Hook', 0, -21], ['Ketik', 0.3, -24], ['Tanya', 0.3, -25],
      // satu tukikan disengaja sebelum hentakan terbesar (IKLAN.md §1)
      ['Hasil', HIT - 0.85, -25], ['Hasil', HIT - 0.4, -33], ['Hasil', HIT + 0.05, -18],
      ['Hasil', HIT + 1.4, -24], ['CTA', 0.3, -23],
    ],
  }],

  sampul: {detik: 0},
  mixer: {gainVO: 2.0, gainSFX: 0.65, duckMusik: {th: 0.02, ratio: 10, attack: 25, release: 300}},
  periksa: {busTitik},
};
