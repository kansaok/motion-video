// TNBP V11 · "AI jadi admin marketing UMKM" (Reels 9:16, ±30 dtk) — dari dokumen "Paket Iklan Meta Ads — The No BS Prompting".
//
// Urutan kerja (komposisi ditulis tangan, VO dari connector ElevenLabs):
//   connector → aset/vo-luar/vo-NN.mp3 → node tools/impor-vo.mjs → motion sfx → motion plan → motion apply
//   → node tools/timing.mjs → motion music → motion mix → motion render → motion check
//
// Yang menyimpang dari brief V11, dan sebabnya:
// 1. Brief hanya memberi teks layar per beat, tanpa naskah VO. VO ditulis dari teks layar itu, satu baris per beat.
// 2. Detik 0-3 "pemilik usaha sibuk di kasir" tidak bisa direkam; pakai opsi brief yang lain: teks besar
//    + tumpukan notifikasi (chat belum dibalas, belum posting, pesanan numpuk).
// 3. "Screen recording" digambar ulang sebagai layar chat AI netral (tanpa logo ChatGPT/OpenAI, aturan dokumen).
// 4. Contoh usaha fiktif "Ayam Geprek Bu Ani". Catatan brief dipatuhi: AI "membantu", bukan "menggantikan
//    karyawan" — balasan chat diberi label "cek dulu sebelum kirim".
import {existsSync, readFileSync} from 'node:fs';
import {eja} from '../../lib/lafal.mjs';

// Beat demo, relatif awal scene — dipakai bersama komposisi (src/*.dc.html). Ubah keduanya bersamaan.
const ROW0 = {Caption: 0.35, Chat: 0.95, Promo: 0.35};     // baris R mulai diketik (Chat: chat pelanggan masuk dulu)
const ROW = 0.42;                                          // jarak antarbaris R-A-S-C-I
const kirim = (sc) => ROW0[sc] + 5 * ROW + 0.15;
const hasil = (sc) => kirim(sc) + 0.45;
const ISI5 = [0.05, 0.4, 0.75];                            // isi paket sepanjang VO5

const HINDARI = ['vocals', 'singing', 'lyrics', 'choir', 'long fade in', 'heavy distorted guitar', 'trap 808 glide'];

const TL = new URL('./timeline.json', import.meta.url);
const busTitik = (() => {
  if (!existsSync(TL)) return [];
  let a = 0; const C = {};
  for (const s of JSON.parse(readFileSync(TL, 'utf8'))) { C[s.name] = a; a += s.dur; }
  return [+(C.CTA + 0.04).toFixed(2), +(C.Promo + hasil('Promo') + 1.15).toFixed(2)];
})();

export default {
  nama: 'tnbp-v11-admin-umkm',
  komposisi: 'TNBP V11 Admin UMKM 9x16.dc.html',
  keluaran: 'tnbp-v11-admin-umkm-9x16.mp4',

  // VO lewat connector ElevenLabs, suara Zandhira, eleven_v4; diimpor oleh tools/impor-vo.mjs (atempo = tempoVO).
  suara: {id: 'R7biip4PFaCanifKPxe6', model: 'eleven_v4'},
  tempoVO: 1.12,

  lafal: {RASCI: eja('RASCI'), AI: 'A I'},

  vo: [
    {no: 1, sc: 'Hook',    off: 0.10, text: 'Punya usaha, tapi nggak punya admin marketing?'},
    {no: 2, sc: 'Caption', off: 0.20, text: 'Tenang. Pakai satu prompt RASCI, caption jualan langsung jadi.'},
    {no: 3, sc: 'Chat',    off: 0.20, text: 'Pelanggan komplain pesanan telat? AI bantu susun balasan yang sopan.'},
    {no: 4, sc: 'Promo',   off: 0.20, text: 'Bingung promo akhir pekan? Minta tiga ide, tinggal pilih.'},
    {no: 5, sc: 'CTA',     off: 0.50, text: 'Framework RASCI, dua puluh satu prompt, dan tool pembuat prompt.'},
    {no: 6, sc: 'CTA',     off: 4.20, text: 'Cuma sembilan puluh sembilan ribu. Link di bawah!'},
  ],

  tata: {mode: 'jangkar', jeda: 0.12, ekorBiasa: 0.3, ekor: {CTA: 1.0}},

  // Semua dari sfx-stok/ — tanpa biaya generate.
  sfx: [
    ['notif',    '@stok/notif-masuk'],
    ['chat',     '@stok/chat-pop'],
    ['ketik',    '@stok/ketik'],
    ['pop',      '@stok/03-pop'],
    ['klik',     '@stok/chip-klik'],
    ['kirim',    '@stok/cut-whoosh'],
    ['blip',     '@stok/checkpoint'],
    ['centang',  '@stok/ding-check'],
    ['sapu',     '@stok/air-whoosh-fast'],
    ['struk',    '@stok/struk-cetak'],
    ['riser',    '@stok/01-riser'],
    ['hisap',    '@stok/whoosh-rev'],
    ['hit',      '@stok/impact-hit'],
    ['sub',      '@stok/sub-drop'],
    ['kaching',  '@stok/kaching'],
    ['jadi',     '@stok/jadi-ding'],
  ],

  cue: ({C, P, E, total}) => {
    const at = (no, f) => P[no] + (E[no] - P[no]) * f;
    const demo = (sc, nadaDasar = 0) => [
      {at: C[sc] - 0.28, nama: 'sapu', gain: 0.20, nada: nadaDasar},
      ...[0, 1, 2, 3, 4].flatMap((i) => [
        {at: C[sc] + ROW0[sc] + i * ROW, nama: 'pop', gain: 0.26, nada: nadaDasar + [0, 2, 4, 5, 7][i]},
        {at: C[sc] + ROW0[sc] + i * ROW + 0.04, nama: 'ketik', gain: 0.10, nada: i % 2},
      ]),
      {at: C[sc] + kirim(sc) - 0.02, nama: 'klik', gain: 0.26},
      {at: C[sc] + kirim(sc), nama: 'kirim', gain: 0.20, pan: 0.2},
      {at: C[sc] + hasil(sc), nama: 'blip', gain: 0.18},
      {at: C[sc] + hasil(sc) + 0.05, nama: 'ketik', gain: 0.10, nada: 3},
      {at: C[sc] + hasil(sc) + 1.1, nama: 'centang', gain: 0.30},
    ];
    return [
      // Hook: notifikasi menumpuk
      {at: 0.02, nama: 'notif', gain: 0.30},
      {at: 0.45, nama: 'notif', gain: 0.28, nada: 2, pan: 0.3},     // = JATUH di komposisi
      {at: 0.90, nama: 'notif', gain: 0.28, nada: 4, pan: -0.3},
      {at: 1.35, nama: 'struk', gain: 0.20},

      ...demo('Caption'),
      {at: C.Chat + 0.15, nama: 'chat', gain: 0.32},
      ...demo('Chat', -2),
      ...demo('Promo', 2),

      // CTA: hentakan terbesar (lapis empat, sekali per video) — produk dibanting masuk
      {at: C.CTA - 1.30, nama: 'riser', gain: 0.28},
      {at: C.CTA - 0.20, nama: 'hisap', gain: 0.28},
      {at: C.CTA,        nama: 'hit',   gain: 0.40},
      {at: C.CTA + 0.02, nama: 'sub',   gain: 0.38},
      ...ISI5.map((f, i) => ({at: at(5, f), nama: 'pop', gain: 0.26, nada: [0, 4, 7][i]})),
      {at: P[6] + 0.05, nama: 'kaching', gain: 0.32},
      {at: total - 1.0, nama: 'jadi', gain: 0.26},
    ];
  },

  musik: [{
    nama: 'bgm', mulai: 0, fadeOut: ({total}) => [total - 0.7, 0.7],
    rencana: ({C, total}) => {
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const inti = ['warm upbeat acoustic pop instrumental', '105 BPM', 'bright ukulele and acoustic guitar strums', 'light claps',
        'bouncy bass', 'friendly small-business ad feel', 'glossy social media production'];
      return [
        // Hook (2,6 dtk) di bawah batas API 3 dtk per bagian, jadi digabung dengan Caption.
        b(0, C.Chat, '[hook]', [...inti, 'starts on the first beat', 'no fade in', 'busy then relieved', 'steady and continuous']),
        b(C.Chat, C.Promo, '[groove]', [...inti, 'relaxed confident groove', 'clean mids leaving room for voice', 'steady and continuous']),
        b(C.Promo, C.CTA, '[build]', [...inti, 'building energy', 'rising', 'steady and continuous']),
        b(C.CTA, total, '[chorus]', [...inti, 'full happy chorus', 'confident', 'steady and continuous']),
        b(total, total + 8, '[tail]', [...inti, 'chorus continues', 'steady and continuous']),
      ];
    },
    titik: [
      ['Hook', 0, -20], ['Caption', 0.3, -22], ['Chat', 0.3, -23], ['Promo', 0.3, -22],
      // satu tukikan disengaja sebelum hentakan terbesar (IKLAN.md §1)
      ['CTA', -0.85, -22], ['CTA', -0.4, -31], ['CTA', 0.05, -16], ['CTA', 1.4, -21],
    ],
  }],

  sampul: {detik: 0},
  mixer: {gainVO: 2.0, gainSFX: 0.6, duckMusik: {th: 0.02, ratio: 10, attack: 25, release: 300}},
  periksa: {busTitik},
};
