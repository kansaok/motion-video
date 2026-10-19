// V09 Keresahan · Iklan Kelas Motion untuk sesi Senin 12 Okt 19.30 WIB — 24 video:
// 12 keresahan dari kolom komentar x CTA (wa, web). Tiap folder <keresahan>-<cta> berisi
// `export default buat('<keresahan>', '<cta>')`. Satu src, satu set SFX, satu BGM.
//
// Komposisi dari Rama (Claude Design, zip "Kelas Motion Cuma 2 Tab (1)", 11 Okt 2026). Scene sesudah
// Hook sama dengan V08 Senin Malam (proyek/kelas-motion-senin), termasuk beat yang dipaku ke kata VO.
// Yang berbeda:
//
// 1. Hook membaca pertanyaan komentar lalu jawabannya. Beat HookKomen dipaku per keresahan (KT).
// 2. Panjang Hook beda tiap keresahan, jadi drop BGM disamakan lewat `lewati`, bukan lewat ekor scene.
// 3. VO eleven_v4. "Chat Wulan" dibaca "Chat Mbak Wulan" (lihat IKLAN.md §3).
import {existsSync, readFileSync} from 'node:fs';

// Satu video = satu keresahan dari kolom komentar. VO membaca pertanyaannya, lalu jawabannya.
const HOOK = {
  claude:  'Apa iya cuma pakai Claude bisa bagus? Lihat hasil kelas pagi tadi!',
  newbie:  'Bisa buat newbie, kak? Yang pagi juga mulai dari nol!',
  edit:    'Nggak paham edit video, bisa? Nggak perlu, kamu cuma ngetik!',
  coding:  'Harus bisa coding dulu? Nggak, cukup bahasa Indonesia!',
  waktu:   'Dua jam beneran cukup? Pulang bawa satu video, beneran!',
  vo:      'Suaraku jelek, gimana voice over-nya? Ngomong dua menit, AI yang lanjutin!',
  revisi:  'Mau revisi, ulang dari awal? Cuma bagian itu yang di-render!',
  modal:   "Harus langganan apa aja? Klo'd Pro sama ElevenLabs, itu aja!",
  laptop:  'Laptop biasa, kuat nggak? Semua jalan di browser!',
  capcut:  'Bedanya sama CapCut apa? Kamu ngetik, bukan nge-drag!',
  online:  'Online doang, bisa ngikutin? Praktik bareng, hasil langsung dicek!',
  jualan:  'Bisa buat promo jualan? Promo kelas Eksel, jadi tadi pagi!',
};
// Jumlah kata jawaban di layar (Q[k].a di kelas-motion-v09.jsx), untuk cue pop tiap kata.
const NJAWAB = {claude: 3, newbie: 5, edit: 5, coding: 3, waktu: 4, vo: 5, revisi: 5, modal: 4, laptop: 4, capcut: 4, online: 4, jualan: 4};
// Drop BGM di trek bgm.mp3 (bgm.sh). Tiap video melewati kepala trek sampai drop jatuh di awal Daftar.
const DROP = 25.49;
const CTA = {
  wa: {text: 'Chat Wulan buat daftar!', dengar: /chat (mbak )?wulan/i},
  web: {text: 'Checkout di ramadigital.id!', dengar: /check ?out/i},
};

const mulai = (dir, scene) => {
  const f = new URL(`./${dir}/timeline.json`, import.meta.url);
  if (!existsSync(f)) return 0;
  const s = JSON.parse(readFileSync(f, 'utf8'));
  return s.slice(0, s.findIndex((x) => x.name === scene)).reduce((a, x) => a + x.dur, 0);
};

export function buat(hook, cta) {
  if (!HOOK[hook] || !CTA[cta]) throw new Error(`varian tidak dikenal: ${hook}-${cta}`);
  const B = {...KT0, ...KT[hook]};
  const D = BEAT.daftar;
  const dir = `${hook}-${cta}`;
  // Kelipatan 0,25 dtk (seperdelapan ketukan 120 BPM), supaya frame 0 tetap di ketukan.
  const lewati = Math.max(0, Math.round((DROP - mulai(dir, 'Daftar')) / 0.25) * 0.25);
  return {
    nama: `kelas-motion-keresahan-${dir}`,
    src: '../src',
    komposisi: `V09 ${hook} ${cta}.dc.html`,
    jsx: 'kelas-motion-v09.jsx',
    kapsi: false,
    keluaran: `rama-digital-kelas-motion-keresahan-${dir}-9x16.mp4`,

    suara: {id: 'iWydkXKoiVtvdn4vLKp9', model: 'eleven_v4', seed: 20261011,
            speed: (l) => (l.no === 7 ? 1.05 : 1.20), stability: 0.14, similarity: 0.80, style: 0.72},

    // 'Chat Mbak Wulan' terdengar benar 3 dari 3 seed di v4; 'Chat Wulan' 0 dari 3 ("Cap/Cat Wulan"). uji-lafal.mjs
    lafal: {'Chat Wulan': 'Chat Mbak Wulan', Motion: 'moshen', motion: 'moshen', 'Rp 179.000': 'seratus tujuh sembilan ribu',
      // v4, 11 Okt 2026: ElevenLabs dan Claude ditulis apa adanya; 'Excel' terdengar "EXO", 'Eksel' 3 dari 3 benar.
      // "Claude Pro" 0 dari 3 ("Cloud Pro"), "Klo'd Pro" 1 dari 3: baris itu diulang sampai transkripnya cocok.
      newbie: 'nyubi', 'voice over': 'vois over', 'nge-drag': 'nge-dreg', browser: 'brauser', AI: 'ei-ai'},

    vo: [
      // Frame 0 = suara: suku kata pertama jatuh di frame pertama.
      {no: 1, sc: 'Hook',   off: 0.00, ...(/Claude|Klo'd/.test(HOOK[hook]) ? {dengar: /claude/i, coba: 8} : {}), text: HOOK[hook]},
      {no: 2, sc: 'Twist',  off: 0.10, text: 'Bukan teori doang, belum lima jam videonya jadi!'},
      {no: 3, sc: 'Bukti',  off: 0.10, text: 'Ini karya peserta tadi pagi, ada yang pakai suaranya sendiri!'},
      {no: 4, sc: 'Aha',    off: 0.10, text: 'Sampai mereka bilang, ternyata segampang ini!'},
      {no: 5, sc: 'Chat',   off: 0.10, text: 'Grupnya langsung rame ucapan terima kasih!'},
      {no: 6, sc: 'Daftar', off: 0.10, text: 'Senin malam giliran kamu, cuma Rp 179.000!'},
      // CTA baris sendiri dan kalimat TERAKHIR, intonasi dinaikkan. Sama dengan tulisan tombol.
      {no: 7, sc: 'Daftar', off: 0.10, stability: 0.05, ...CTA[cta]},
    ],

    tata: {mode: 'jangkar', jeda: 0.10, ekorBiasa: 0.25, ekor: {Daftar: 1.0}},

    sfx: [
      ['notif',   '@stok/chat-blip'],
      ['pop',     '@stok/pop'],
      ['boing',   0.6, 'one bouncy cartoon boing pop, springy and short, playful and bright, dry close-mic, no reverb, no music, single event'],
      ['zip',     '@stok/zip--umkm-cepat-lp'],
      ['hisap',   '@stok/whoosh-rev'],
      ['stempel', '@stok/stamp-slam'],
      ['kilau',   1.0, 'a bright magical sparkle burst with quick twinkling chimes, exciting and short, dry, no reverb, no music, single event'],
      ['sapu',    '@stok/sapu'],
      ['coret',   '@stok/coret'],
      ['squeak',  0.5, 'one bright squeaky rubber toy pop, playful and short, dry close-mic, no reverb, no music, single pop'],
      ['geser',   '@stok/geser'],
      ['swipe',   '@stok/swoosh-hapus'],
      ['tik',     '@stok/tik-ui'],
      ['riser',   '@stok/riser-long'],
      ['impact',  '@stok/impact-hit'],
      ['sub',     '@stok/sub'],
      ['kaching', '@stok/kaching'],
      ['tombol',  '@stok/btn-click'],
    ],

    // Detik dari awal scene sama dengan konstanta di kelas-motion-v08.jsx. Ubah keduanya bersamaan.
    cue: ({C, total}) => {
      const iris = (sc, nada = 0) => ({at: C[sc], nama: 'sapu', gain: 0.12, nada});
      return [
        ...hookCue(B, NJAWAB[hook]),

        // Twist: dua panel meluncur, VS, hitungan jam di "belum lima jam", coretan di "videonya".
        iris('Twist'),
        {at: C.Twist + 0.02, nama: 'geser', gain: 0.22, pan: -0.3},
        {at: C.Twist + 0.12, nama: 'geser', gain: 0.22, pan: 0.3, nada: 2},
        {at: C.Twist + 0.40, nama: 'boing', gain: 0.24},
        ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({at: C.Twist + 1.66 + i * 0.09, nama: 'tik', gain: 0.10, nada: i})),
        {at: C.Twist + 2.40, nama: 'stempel', gain: 0.30},
        {at: C.Twist + 2.60, nama: 'coret', gain: 0.26},
        {at: C.Twist + 3.10, nama: 'squeak', gain: 0.24, nada: 2},
        {at: C.Twist + 3.40, nama: 'hisap', gain: 0.16},

        // Bukti: tiga HP terbang masuk, carousel berputar dua kali.
        {at: C.Bukti + 0.02, nama: 'zip', gain: 0.16},
        ...[0, 1, 2].map((i) => ({at: C.Bukti + 0.20 + i * 0.12, nama: 'swipe', gain: 0.10, nada: i, pan: (i - 1) * 0.3})),
        {at: C.Bukti + 0.65, nama: 'pop', gain: 0.20},
        {at: C.Bukti + 3.40, nama: 'geser', gain: 0.20, nada: 1},
        {at: C.Bukti + 4.70, nama: 'geser', gain: 0.20, nada: 3},
        {at: C.Aha - 0.25, nama: 'hisap', gain: 0.16},

        // Aha: empat kartu dibanting bertumpuk, nada naik.
        ...[0, 1, 2, 3].flatMap((i) => [
          {at: C.Aha + 0.12 + i * 1.08, nama: 'stempel', gain: 0.22, nada: i},
          {at: C.Aha + 0.20 + i * 1.08, nama: 'pop', gain: 0.14, nada: i * 2, pan: i % 2 ? 0.25 : -0.25},
        ]),

        // Chat: empat testimoni naik, reaksi, ledakan emoji.
        iris('Chat', 2),
        ...[0, 1, 2, 3].flatMap((i) => [
          {at: C.Chat + 0.15 + i * 0.55, nama: 'notif', gain: 0.20, nada: i},
          {at: C.Chat + 0.45 + i * 0.55, nama: 'pop', gain: 0.12, nada: i + 2},
        ]),
        {at: C.Chat + 2.05, nama: 'kilau', gain: 0.24},
        {at: C.Chat + 2.20, nama: 'squeak', gain: 0.22, nada: 3},

        // Daftar: chip jadwal, lalu satu-satunya hentakan besar di harga, lalu tombol.
        iris('Daftar', 3),
        {at: C.Daftar + D.chip, nama: 'stempel', gain: 0.32},
        {at: C.Daftar + D.chip + 0.02, nama: 'kilau', gain: 0.18},
        {at: C.Daftar + D.harga - 1.3, nama: 'riser',  gain: 0.20},
        {at: C.Daftar + D.harga - 0.2, nama: 'hisap',  gain: 0.20},
        {at: C.Daftar + D.harga,       nama: 'impact', gain: 0.42},
        {at: C.Daftar + D.harga + 0.02, nama: 'sub',   gain: 0.34},
        {at: C.Daftar + D.harga + 0.04, nama: 'kaching', gain: 0.36},
        {at: C.Daftar + D.harga + 0.30, nama: 'kilau', gain: 0.16, nada: 2},
        {at: C.Daftar + D.tombol, nama: 'tombol', gain: 0.34},
        {at: C.Daftar + D.tombol + 0.02, nama: 'pop', gain: 0.18, nada: 3},
        {at: total - 0.35, nama: 'sapu', gain: 0.10},
      ];
    },

    musik: [{
      // Trek disusun bgm.sh dari bgm-gen.mp3 (trek V07). `luar` mencegah `motion music` menimpanya.
      nama: 'bgm', luar: true, mulai: 0, lewati,
      fadeOut: ({total}) => [total - 0.5, 0.5],
      // Tukikan 0,4 dtk tepat sebelum stempel harga: satu-satunya, supaya hentakannya terasa besar.
      titik: [['Hook', 0, -11], ['Twist', 0, -14], ['Bukti', 0, -16], ['Daftar', 0, -15],
        ['Daftar', D.harga - 0.5, -15], ['Daftar', D.harga - 0.4, -23], ['Daftar', D.harga, -23], ['Daftar', D.harga + 0.05, -15]],
    }],

    sampul: {detik: +(B.st + 0.25).toFixed(2)},
    mixer: {gainVO: 1.60, gainSFX: 0.95, duckMusik: {th: 0.015, ratio: 14, attack: 25, release: 320}},
    periksa: {busTitik: [mulai(dir, 'Twist') + 0.03, mulai(dir, 'Bukti') + 0.02]},
  };
}

// Cue hook komen: detik absolut, sama dengan HookKomen di kelas-motion-v09.jsx (kt).
const hookCue = (B, n) => [
  {at: 0.00, nama: 'notif', gain: 0.24},
  {at: 0.05, nama: 'pop', gain: 0.20, pan: -0.2},
  ...[0, 1, 2, 3, 4, 5].map((i) => ({at: 0.45 + i * 0.18, nama: 'tik', gain: 0.07, nada: i})),
  {at: 0.90, nama: 'boing', gain: 0.18, pan: -0.3},
  {at: B.qe - 0.20, nama: 'hisap', gain: 0.18},
  {at: B.qe, nama: 'stempel', gain: 0.44},
  {at: B.qe + 0.02, nama: 'sub', gain: 0.16},
  ...Array.from({length: n}, (_, i) => ({at: B.a + i * B.step, nama: 'pop', gain: 0.16, nada: i * 2, pan: i % 2 ? 0.25 : -0.25})),
  {at: B.a + (n - 1) * B.step + 0.02, nama: 'kilau', gain: 0.22},
  {at: B.st, nama: 'squeak', gain: 0.22, nada: 2},
];

// Detik per keresahan, dari transkrip `node kata.mjs <k>-wa`. Angka yang sama ada di KT, kelas-motion-v09.jsx.
const KT0 = {qe: 1.42, a: 2.2, step: 0.1, st: 3.2};
const KT = {
  claude: {qe: 2.60, a: 3.24, step: 0.26, st: 4.60},
  newbie: {qe: 1.45, a: 1.84, step: 0.25, st: 3.50},
  edit:   {qe: 1.95, a: 2.40, step: 0.41, st: 4.50},
  coding: {qe: 1.35, a: 1.90, step: 0.64, st: 4.15},
  waktu:  {qe: 1.50, a: 2.10, step: 0.52, st: 4.20},
  vo:     {qe: 2.75, a: 3.24, step: 0.40, st: 5.30},
  revisi: {qe: 2.20, a: 2.70, step: 0.27, st: 4.30},
  modal:  {qe: 1.45, a: 1.92, step: 0.67, st: 4.50},
  laptop: {qe: 2.00, a: 2.36, step: 0.42, st: 4.10},
  capcut: {qe: 1.60, a: 2.28, step: 0.47, st: 4.20},
  online: {qe: 1.95, a: 2.42, step: 0.49, st: 4.60},
  jualan: {qe: 1.35, a: 1.92, step: 0.46, st: 4.30},
};

// Detik dari awal scene. Angka Daftar sama dengan `chipAt`, `priceAt`, `btnAt` di kelas-motion-v09.jsx.
const BEAT = {
  daftar:     {chip: 1.6, harga: 2.44, tombol: 4.35},
};
