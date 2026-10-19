// V07 · Iklan Kelas Motion, angle "Cuma 2 tab" — empat video: hook (komentar, nol) x CTA (wa, web).
// Tiap folder <hook>-<cta> cuma berisi `export default buat('<hook>', '<cta>')`. Satu src, satu set SFX, satu BGM.
//
// Sumber brief: src/prompts/V07-kelas-motion-2tab/prompt.md. Yang menyimpang dari brief, dan sebabnya:
//
// 1. Suara Cahaya, bukan Wulan/Eleven v3: satu merek satu suara. Tag [excited] dll. diganti tanda baca.
// 2. Satu baris VO per scene, kalimat utuh. Permintaan Rama 30 Sep 2026: "suara jangan
//    kepotong-potong, harus natural". Deret pendek (After Effects, template, ...) dibaca satu baris.
// 3. CTA "Chat Wulan buat daftar!" baris sendiri, kalimat terakhir, intonasi dinaikkan (preferensi tetap).
//    "Claude" ditulis `Klo'd`: 3 dari 3 seed terdengar "Claude"; `Klode` 0 dari 3 (uji-lafal.mjs).
//    Baris yang menyebut merek diberi `dengar`: take diulang sampai transkripnya cocok.
// 4. Detik beat di Hook, Resep, Daftar dipaku ke kata VO (transkrip), bukan ke angka brief:
//    naskah brief butuh ±30 kar/dtk untuk "jadi" di 1,8 dtk, suara mana pun tidak sanggup.
// 5. BGM ElevenLabs Music lewat `rencana` (bukan satu prompt), 120 BPM. Generator menaruh drop
//    2,7 dtk terlalu awal; bgm.sh menyambung 6 ketukan di build dan menaruhnya di awal Daftar.
//    Satu trek untuk keempat video: ekor Bukti menyamakan awal Daftar di 18,50 dtk.
// 6. Hentakan besar dilapis empat SEKALI, di stempel harga. Tukikan musik 0,4 dtk sebelumnya.
import {existsSync, readFileSync} from 'node:fs';

const HOOK = {
  komentar: 'Pakai software apa? Cuma dua tab. Claude, ElevenLabs, jadi!',
  nol: 'Nol software animasi. Cuma Claude, ElevenLabs, jadi!',
};
const CTA = {
  wa: {text: 'Chat Wulan buat daftar!', dengar: /chat wulan/i},
  web: {text: 'Checkout di ramadigital.id!', dengar: /check ?out/i},
};
// Video dengan Daftar paling lambat. BGM digenerate dari video ini; video lain melewati selisihnya.
const REF = 'komentar-wa';

const mulai = (dir, scene) => {
  const f = new URL(`./${dir}/timeline.json`, import.meta.url);
  if (!existsSync(f)) return 0;
  const s = JSON.parse(readFileSync(f, 'utf8'));
  return s.slice(0, s.findIndex((x) => x.name === scene)).reduce((a, x) => a + x.dur, 0);
};

const HINDARI = ['vocals', 'singing', 'lyrics', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
  'breakdown', 'silence', 'quiet intro', 'fade in', 'long fade in', 'sparse', 'ambient pad only'];

export function buat(hook, cta) {
  if (!HOOK[hook] || !CTA[cta]) throw new Error(`varian tidak dikenal: ${hook}-${cta}`);
  const B = BEAT[hook];
  const dir = `${hook}-${cta}`;
  const utama = dir === REF;
  return {
    nama: `kelas-motion-v07-${dir}`,
    src: '../src',
    komposisi: `V07 2tab ${hook} ${cta}.dc.html`,
    jsx: 'kelas-motion-v07.jsx',
    kapsi: false,
    keluaran: `rama-digital-kelas-motion-2tab-${dir}-9x16.mp4`,

    suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260930,
            speed: (l) => (l.no === 6 ? 1.05 : 1.20), stability: 0.14, similarity: 0.80, style: 0.72},

    lafal: {
      Claude: "Klo'd", ElevenLabs: 'ilevenlebs', Motion: 'moshen', 'After Effects': 'after efek',
      gimmick: 'gimik', plugin: 'plagin', template: 'templet', 'Rp 179.000': 'seratus tujuh puluh sembilan ribu',
    },

    vo: [
      // Frame 0 = suara: suku kata pertama jatuh di frame pertama. Hook sedikit lebih naik.
      {no: 1, sc: 'Hook',   off: 0.00, style: 0.85, dengar: /claude/i, coba: 8, text: HOOK[hook]},
      {no: 2, sc: 'Coret',  off: 0.10, dengar: /gimmick|gimik/i, text: 'Nggak perlu beli After Effects, template, plugin, apalagi jasa. No gimmick!'},
      {no: 3, sc: 'Resep',  off: 0.10, dengar: /^claude/i, coba: 8, text: 'Claude bikin animasinya, ElevenLabs isi suara sama musiknya. Videonya jadi!'},
      {no: 4, sc: 'Bukti',  off: 0.10, text: 'Empat belas video ini, resepnya sama. Termasuk iklan yang lagi kamu tonton!'},
      {no: 5, sc: 'Daftar', off: 0.10, text: 'Kelas Motion, sebelas atau dua belas Oktober. Cuma Rp 179.000!'},
      // CTA baris sendiri dan kalimat TERAKHIR, intonasi dinaikkan. Sama dengan tulisan tombol.
      {no: 6, sc: 'Daftar', off: 0.10, style: 0.95, stability: 0.05, ...CTA[cta]},
    ],

    // Ekor Bukti menaruh awal Daftar di 18,50 dtk di keempat video = drop BGM (bgm.sh).
    tata: {mode: 'jangkar', jeda: 0.10, ekorBiasa: 0.25, ekor: {Bukti: hook === 'nol' ? 0.83 : 0.64, Daftar: 1.0}},

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

    // Detik di BEAT dipaku ke kata VO (transkrip sesudah `plan`) dan sama dengan kelas-motion-v07.jsx.
    cue: ({C, total}) => {
      const iris = (sc, nada = 0) => ({at: C[sc], nama: 'sapu', gain: 0.12, nada});
      return [
        // Hook: frame 0 langsung berbunyi.
        {at: 0.00, nama: 'notif', gain: 0.24},
        {at: 0.02, nama: 'pop',   gain: 0.20, pan: -0.2},
        {at: B.cuma, nama: 'pop', gain: 0.18, nada: 2},
        {at: B.tab[0], nama: 'boing', gain: 0.26, pan: -0.3},
        {at: B.tab[1], nama: 'zip',   gain: 0.16},
        {at: B.tab[2], nama: 'boing', gain: 0.26, pan: 0.3, nada: 3},
        {at: B.jadi - 0.20, nama: 'hisap',   gain: 0.18},
        {at: B.jadi,        nama: 'stempel', gain: 0.46},
        {at: B.jadi + 0.02, nama: 'kilau',   gain: 0.26},
        {at: B.jadi + 0.02, nama: 'sub',     gain: 0.16},

        // Coret: 6 kartu pop (nada naik), tiap kartu dicoret 0,2 dtk kemudian.
        iris('Coret'),
        ...[0, 1, 2, 3, 4, 5].flatMap((i) => [
          {at: C.Coret + 0.45 + i * 0.5, nama: 'pop',   gain: 0.18, nada: i, pan: i % 2 ? 0.25 : -0.25},
          {at: C.Coret + 0.65 + i * 0.5, nama: 'coret', gain: 0.24, nada: -i * 0.5},
        ]),
        {at: C.Coret + B.gimmick, nama: 'squeak', gain: 0.28},

        // Resep: 3 kartu meluncur di katanya.
        iris('Resep', 2),
        ...B.resep.map((t, i) => ({at: C.Resep + t, nama: 'geser', gain: 0.24, nada: i * 2})),
        {at: C.Resep + B.resep[2] + 0.04, nama: 'pop', gain: 0.22},
        {at: C.Resep + B.resepStiker, nama: 'squeak', gain: 0.24, nada: 2},

        // Bukti: swipe pelan tiap video, stiker "termasuk iklan ini".
        iris('Bukti', -2),
        ...Array.from({length: 14}, (_, i) => ({at: C.Bukti + 0.5 + i * 0.25, nama: 'swipe', gain: 0.07, nada: (i % 3) - 1})),
        {at: C.Bukti + B.iklanIni, nama: 'squeak', gain: 0.26, nada: 4},

        // Daftar: satu-satunya hentakan besar, dilapis empat di stempel harga.
        iris('Daftar', 3),
        {at: C.Daftar + B.sesi[0], nama: 'tik', gain: 0.24, pan: -0.2},
        {at: C.Daftar + B.sesi[1], nama: 'tik', gain: 0.24, pan: 0.2, nada: 2},
        {at: C.Daftar + B.harga - 1.3, nama: 'riser',  gain: 0.20},
        {at: C.Daftar + B.harga - 0.2, nama: 'hisap',  gain: 0.20},
        {at: C.Daftar + B.harga,       nama: 'impact', gain: 0.42},
        {at: C.Daftar + B.harga + 0.02, nama: 'sub',   gain: 0.34},
        {at: C.Daftar + B.harga + 0.04, nama: 'kaching', gain: 0.36},
        {at: C.Daftar + B.harga + 0.30, nama: 'kilau', gain: 0.16, nada: 2},
        {at: C.Daftar + B.tombol, nama: 'tombol', gain: 0.34},
        {at: C.Daftar + B.tombol + 0.02, nama: 'pop', gain: 0.18, nada: 3},
        {at: total - 0.35, nama: 'sapu', gain: 0.10},
      ];
    },

    musik: [{
      // Trek disusun bgm.sh dari bgm-gen.mp3. Untuk generate ulang: ganti nama jadi 'bgm-gen' dan
      // `luar: !utama`, jalankan `motion music` di komentar-wa, lalu kembalikan dan jalankan bgm.sh.
      nama: 'bgm', luar: true, mulai: 0,
      fadeOut: ({total}) => [total - 0.5, 0.5],
      rencana: ({C, total}) => {
        const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
        const inti = ['playful bouncy pop instrumental', '120 BPM', 'plucky marimba', 'bright synth stabs', 'bubbly bass',
          'crisp handclaps', 'modern TikTok ad energy', 'fun and confident, not childish', 'steady and continuous'];
        return [
          b(0, C.Resep, '[hook]', [...inti, 'starts instantly on a hard hit on the first beat', 'no intro', 'stop-and-go stabs', 'always present']),
          b(C.Resep, C.Daftar, '[build]', [...inti, 'groove keeps rolling', 'cartoon-ish whistle hook', 'energy rising', 'building toward a drop']),
          b(C.Daftar, total, '[drop]', [...inti, 'big chorus drop', 'brass stabs', 'full groove', 'euphoric and exciting']),
          b(total, total + 6, '[tail]', [...inti, 'chorus groove continues', 'full groove']),
        ];
      },
      // Tukikan 0,4 dtk tepat sebelum stempel harga: satu-satunya, supaya hentakannya terasa besar.
      // Trek mentah: 0-8 dtk -21 dB, build 8-18,5 -16 dB, drop -13 dB. Amplop meratakan lompatan di 8 dtk.
      titik: [['Hook', 0, -11], ['Hook', 7.8, -11], ['Hook', 8.1, -15.5], ['Bukti', 0, -16], ['Daftar', 0, -15],
        ['Daftar', B.harga - 0.5, -15], ['Daftar', B.harga - 0.4, -23], ['Daftar', B.harga, -23], ['Daftar', B.harga + 0.05, -15]],
    }],

    sampul: {detik: 0},
    mixer: {gainVO: 1.60, gainSFX: 0.95, duckMusik: {th: 0.015, ratio: 14, attack: 25, release: 320}},
    periksa: {busTitik: [0.02, mulai(dir, 'Coret') + 0.02]},
  };
}

// Detik dipaku ke kata VO (transkrip `node kata.mjs <varian>` sesudah `plan`). Hook: detik absolut;
// lainnya dari awal scene. Angka yang sama ada di BT, kelas-motion-v07.jsx. Ubah keduanya bersamaan.
const BEAT = {
  komentar: {cuma: 1.30, tab: [2.28, 2.58, 2.78], jadi: 3.68, gimmick: 3.86, resep: [0.12, 1.48, 3.54], resepStiker: 4.0,
             iklanIni: 2.32, sesi: [0.76, 1.42], harga: 2.76, tombol: 4.40},
  nol:      {cuma: 1.38, tab: [1.64, 1.95, 2.10], jadi: 2.98, gimmick: 3.94, resep: [0.12, 1.66, 3.98], resepStiker: 4.4,
             iklanIni: 2.32, sesi: [0.76, 1.42], harga: 2.76, tombol: 4.40},
};
