// V05 · Reels organik "Pattern Interrupt" — dua hook untuk A/B test: grafik dan gagal.
// Tiap folder hook cuma berisi `export default buat('<hook>')`. Satu src, satu set SFX, satu BGM.
//
// Tidak ada brief V05 di zip. Naskah VO disusun dari teks di layar (supers = kata VO), dengan
// preferensi tetap Rama: suara Cahaya, transisi lembut, BGM diduck dalam, ajakan jadi kalimat
// terakhir dengan intonasi dinaikkan. Grafik hook = insight asli Reels V04 (uploads/ di zip).
// VO dipadatkan ke ±34 detik (versi pertama 43,8 untuk komposisi 29,5): yang sudah terbaca di
// layar tidak diucapkan lagi — stiker "kenapa bisa?" dan link 91 framework.
//
// BGM digenerate dari video gagal (hook terpanjang). Video grafik MELEWATI selisih pembukanya
// (`lewati`), jadi bagian lagu tetap jatuh di batas scene yang sama di kedua video.
import {existsSync, readFileSync} from 'node:fs';

const HOOK = {
  grafik: 'Delapan puluh persen kabur di detik kedua. Kenapa?',
  gagal: 'Gagal. Reels kami ditinggal delapan puluh persen penonton di detik kedua.',
};
const REF = 'gagal';

const mulai = (hook, scene) => {
  const f = new URL(`./${hook}/timeline.json`, import.meta.url);
  if (!existsSync(f)) return 0;
  const s = JSON.parse(readFileSync(f, 'utf8'));
  return s.slice(0, s.findIndex((x) => x.name === scene)).reduce((a, x) => a + x.dur, 0);
};

const HINDARI = ['vocals', 'singing', 'lyrics', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808', 'long fade in'];

export function buat(hook) {
  if (!HOOK[hook]) throw new Error(`hook tidak dikenal: ${hook}`);
  const utama = hook === REF;
  return {
    nama: `pattern-interrupt-${hook}`,
    src: '../src',
    komposisi: `V05 PI ${hook}.dc.html`,
    jsx: 'pattern-interrupt.jsx',
    kapsi: false,
    keluaran: `rama-digital-pattern-interrupt-${hook}-9x16.mp4`,

    suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260927,
            speed: (l) => (l.no === 9 ? 1.05 : 1.20), stability: 0.14, similarity: 0.80, style: 0.72},

    lafal: {'di-skip': 'di-sekip', AI: eja2('AI')},

    vo: [
      // Pattern interrupt: suara mulai di frame pertama, tanpa jeda.
      {no: 1, sc: 'Hook',   off: 0.05, text: HOOK[hook]},
      {no: 2, sc: 'Salah',  off: 0.10, text: 'Frame pertamanya mirip slide iklan. Otak lagi scroll otomatis, yang mirip pola, dilewati.'},
      {no: 3, sc: 'Nama',   off: 0.10, text: 'Namanya Pattern Interrupt: patahkan pola, di frame pertama.'},
      {no: 4, sc: 'Cara',   off: 0.10, text: 'Tiga caranya. Satu: baris yang melawan ekspektasi.'},
      {no: 5, sc: 'Cara',   off: CT[1],  text: 'Dua: tampil kayak konten, bukan iklan.'},
      {no: 6, sc: 'Cara',   off: CT[2],  text: 'Tiga: angka yang blak-blakan.'},
      {no: 7, sc: 'Jangan', off: 0.10, text: 'Yang bikin di-skip: intro logo, before after klise, template bau AI.'},
      {no: 8, sc: 'Tutup',  off: 0.10, text: 'Kamu masih nonton sampai sini? Itu polanya.'},
      // Ajakan simpan: baris sendiri, kalimat TERAKHIR, intonasi dinaikkan.
      {no: 9, sc: 'Tutup', off: 1.80, style: 0.95, stability: 0.05, text: 'Simpan buat bikin hook!'},
    ],

    tata: {mode: 'jangkar', jeda: 0.12, ekorBiasa: 0.25, ekor: {Tutup: 1.0}},

    sfx: [
      ['glitch',  0.6, 'one short punchy digital glitch hit with a tape stop, attention grabbing but not harsh, dry, no reverb, no music, single hit'],
      ['anjlok',  1.0, 'a quick descending pitch swoop falling down, cartoonish drop, soft, dry, no reverb, no music, single sweep'],
      ['stiker',  0.5, 'a light sticker slap with a small pop, playful, dry close-mic, no reverb, no music, single event'],
      ['kartu',   0.5, 'a paper card sliding in and landing with a soft thump, clean, dry close-mic, no reverb, no music, single event'],
      ['stempel', 0.6, 'one heavy rubber stamp thump on paper, short punchy low knock, dry close-mic, no reverb, no music, single hit'],
      ['ketik',   0.8, 'a short burst of soft typewriter keys, light and quick, dry close-mic, no reverb, no music, single burst'],
      ['ding',    0.6, 'one bright clean idea ding, small bell, cheerful, dry, no reverb, no music, single hit'],
      ['kick',    0.5, 'one quick soft swoosh into a gentle card clack, dry, no reverb, no music, single event'],
      ['coret',   0.4, 'a thick marker pen striking quickly across paper, crisp and satisfying, dry close-mic, no reverb, no music, single stroke'],
      ['hit',     0.8, 'one tight punchy warm impact hit with a short sparkle tail, satisfying, dry, no reverb, no music, single hit'],
      ['simpan',  0.5, 'a bookmark ribbon flick with a soft click, dry close-mic, no reverb, no music, single event'],
      ['pop',     0.5, 'one bright bubbly cartoon pop, short and round, dry close-mic, no reverb, no music, single pop'],
      // Transisi: LEMBUT. Potongannya hard cut + punch-in; bunyinya cuma tap pelan.
      ['tap',     0.5, 'one soft rubbery thump with a tiny pop, gentle and clean, dry, no reverb, no music, single hit'],
      ['sapu',    0.6, 'one very soft gentle airy swish, smooth and muted, warm, no harsh high frequencies, no hiss, dry, no reverb, no music, single motion'],
    ],

    cue: ({C, total}) => {
      const cut = (sc, nada = 0) => ({at: C[sc], nama: 'tap', gain: 0.14, nada});
      return [
        {at: 0.00, nama: 'glitch', gain: 0.30},
        {at: 0.30, nama: 'anjlok', gain: 0.20},
        {at: 1.30, nama: 'stiker', gain: 0.26},

        cut('Salah'),
        {at: C.Salah + 0.20, nama: 'kartu',   gain: 0.24},
        {at: C.Salah + SALAH.cap, nama: 'stempel', gain: 0.38},

        cut('Nama', 2),
        {at: C.Nama + 0.05, nama: 'ketik', gain: 0.18},
        {at: C.Nama + NAMA.taruh, nama: 'ding', gain: 0.26},
        {at: C.Nama + NAMA.taruh + 0.5, nama: 'stiker', gain: 0.22, pan: 0.2},

        cut('Cara', -2),
        ...CT.flatMap((t, i) => [
          {at: C.Cara + t, nama: 'kick', gain: 0.22, nada: i * 2},
          {at: C.Cara + t + 0.6, nama: 'kartu', gain: 0.20, nada: i},
        ]),

        cut('Jangan', -3),
        ...JANGAN.map((t, i) => ({at: C.Jangan + t, nama: 'coret', gain: 0.28, nada: -i})),

        cut('Tutup', 3),
        {at: C.Tutup + TUTUP.pola, nama: 'hit',    gain: 0.36},
        {at: C.Tutup + TUTUP.simpan, nama: 'simpan', gain: 0.28},
        {at: C.Tutup + TUTUP.link, nama: 'pop', gain: 0.22},
        {at: total - 0.4, nama: 'sapu', gain: 0.10},
      ];
    },

    musik: [{
      nama: 'bgm', luar: !utama, mulai: 0, lewati: utama ? 0 : mulai(REF, 'Salah') - mulai(hook, 'Salah'),
      fadeOut: ({total}) => [total - 0.5, 0.5],
      rencana: ({C, total}) => {
        const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
        const inti = ['modern punchy lo-fi hip hop bounce instrumental', '96 BPM', 'crisp snare', 'warm electric piano', 'plucky bass', 'vinyl texture', 'confident and curious'];
        return [
          b(0, C.Nama, '[hook]', [...inti, 'starts instantly on the first beat', 'no fade in', 'tight groove', 'steady and continuous']),
          b(C.Nama, C.Cara, '[reveal]', [...inti, 'brighter lift', 'rising synth pad', 'steady and continuous']),
          b(C.Cara, C.Tutup, '[groove]', [...inti, 'bouncy groove leaving room for voice', 'steady and continuous']),
          b(C.Tutup, total, '[payoff]', [...inti, 'satisfying payoff', 'full groove', 'happy']),
          b(total, total + 6, '[tail]', [...inti, 'groove continues', 'steady and continuous']),
        ];
      },
      titik: [['Hook', 0, -15], ['Salah', 0, -17], ['Nama', 0, -16], ['Cara', 0, -17], ['Tutup', 0, -15]],
    }],

    sampul: {detik: 0},
    mixer: {gainVO: 1.55, gainSFX: 0.74, duckMusik: {th: 0.015, ratio: 14, attack: 25, release: 320}},
    periksa: {busTitik: [0.02, mulai(hook, 'Salah') + 0.03]},
  };
}

// Awal kartu Cara (detik dari awal scene), sama dengan CT di pattern-interrupt.jsx.
const CT = [0, 3.2, 6.4];
// Detik yang dipaku ke kata VO, dari transkrip sesudah `plan`.
const SALAH = {cap: 1.4};                 // cap "MIRIP SLIDE IKLAN"
const NAMA = {taruh: 2.0};                // stiker "taruhannya di frame pertama"
const JANGAN = [0.75, 1.35, 1.95];        // coretan tiga larangan
const TUTUP = {pola: 0.8, simpan: 1.8, link: 2.3};
function eja2(k) { return k.split('').join(' '); }
