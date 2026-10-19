// V06 · Iklan Kelas Motion x Claude Design — dua video beda hook: chat dan tanya. CTA: wa.
// Tiap folder hook cuma berisi `export default buat('<hook>')`. Satu src, satu set SFX.
//
// Sumber brief: src/prompts/V06-kelas-motion/prompt.md. Yang menyimpang dari brief, dan sebabnya:
//
// 1. BGM = trek Suno dangdut "Wulan Muncul, Rame Sekali" (permintaan Rama), bukan trek Suno
//    baru dari brief. bgm.py menyusunnya per video: frame 0 langsung di drop trek (116,08),
//    lalu chorus bar 54 (98,22) pecah tepat di awal scene Daftar. Sambungan di kelipatan bar.
// 2. Suara Cahaya, bukan Eleven v3: satu merek satu suara. Tag diganti tanda baca.
// 3. CTA "Chat Wulan buat daftar!" jadi baris VO sendiri, kalimat terakhir, intonasi dinaikkan,
//    sama persis dengan tulisan tombolnya.
// 4. Thumbnail 14 video demo dicuplik dari MP4 lokal kami sendiri, bukan diunduh dari situs.
// 5. Transisi lembut dan pelan, BGM diduck dalam saat VO bicara (preferensi tetap Rama).
//    Kendang "tak-dung" di potongan scene tetap ada, tapi pelan: dia identitas pop dut.

const HOOK = {
  chat: 'Iklan yang kamu tonton ini, dibikin cuma pakai chat.',
  tanya: 'Ini dibuat pakai software apa? Chat.',
};

export function buat(hook) {
  if (!HOOK[hook]) throw new Error(`hook tidak dikenal: ${hook}`);
  return {
    nama: `kelas-motion-${hook}`,
    src: '../src',
    komposisi: `V06 Motion ${hook}.dc.html`,
    jsx: 'kelas-motion.jsx',
    kapsi: false,
    keluaran: `rama-digital-kelas-motion-${hook}-9x16.mp4`,

    suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260928,
            speed: (l) => (l.no === 7 ? 1.05 : 1.20), stability: 0.14, similarity: 0.80, style: 0.72},

    lafal: {
      Claude: 'Klode', Design: 'dizain', Motion: 'moshen', ElevenLabs: 'ilevenlebs',
      'di-skip': 'di-sekip', 'Rp 179.000': 'seratus tujuh puluh sembilan ribu',
    },

    vo: [
      // Frame 0 = suara: suku kata pertama jatuh di frame pertama.
      {no: 1, sc: 'Hook',    off: 0.00, text: HOOK[hook]},
      {no: 2, sc: 'Bukti',   off: 0.10, text: 'Tulis brief. Claude Design yang bikin scene-nya. Revisi? Lewat chat juga.'},
      {no: 3, sc: 'Masalah', off: 0.10, text: 'Konten diam di-skip sedetik. Jasa animasi mahal, belajar software lama, template pasaran.'},
      {no: 4, sc: 'Demo',    off: 0.10, text: 'Empat belas video ini dibuat pakai alur yang sama. Sebagian udah tayang jadi iklan.'},
      {no: 5, sc: 'Cara',    off: 0.10, text: 'Brief, Claude Design, ElevenLabs, render. Dua jam, pulang bawa satu video.'},
      {no: 6, sc: 'Daftar',  off: 0.10, text: 'Kelas Motion kali Claude Design. Sebelas atau dua belas Oktober. Rp 179.000.'},
      // CTA baris sendiri dan kalimat TERAKHIR, intonasi dinaikkan. Sama dengan tulisan tombol.
      {no: 7, sc: 'Daftar',  off: 4.00, style: 0.95, stability: 0.05, text: 'Chat Wulan buat daftar!'},
    ],

    tata: {mode: 'jangkar', jeda: 0.12, ekorBiasa: 0.25, ekor: {Daftar: 1.0}},

    sfx: [
      ['ketik',   1.0, 'fast laptop keyboard typing burst then enter key, crisp, close-mic, dry, no reverb, no music, single burst'],
      ['terima',  0.5, 'a chat message received pop, modern phone user interface, dry, no reverb, no music, single event'],
      ['progres', 1.4, 'six quick rising digital blips, clean, dry, no reverb, no music, single run'],
      ['pop',     0.5, 'one bright bubbly cartoon pop, short and round, dry close-mic, no reverb, no music, single pop'],
      ['kartu',   0.5, 'a crisp card flip snap, dry close-mic, no reverb, no music, single event'],
      ['stempel', 0.6, 'one heavy rubber stamp slam, punchy with slight low end, dry, no reverb, no music, single hit'],
      ['swipe',   0.5, 'one very short soft swipe flick, phone user interface, gentle, dry, no reverb, no music, single motion'],
      ['baris',   0.5, 'a quick slide-in swoosh with a soft woody knock, dry, no reverb, no music, single event'],
      ['tik',     0.5, 'one soft bright user interface tick, dry, no reverb, no music, single hit'],
      ['kaching', 0.7, 'a punchy bright cash register cha-ching, dry, no reverb, no music, single event'],
      ['tombol',  0.5, 'one chunky button click with a soft pop, dry close-mic, no reverb, no music, single click'],
      // Potongan scene: kendang "tak-dung", identitas pop dut. Dipasang pelan.
      ['kendang', 0.5, 'one Indonesian dangdut kendang hit, tak then dung, dry, punchy, no reverb, no other instruments, single hit'],
      ['tak',     0.5, 'one single high Indonesian kendang slap, dry, no reverb, no other instruments, single hit'],
      ['riser',   0.6, 'a short soft bright riser swell, gentle, no impact, dry, no reverb'],
    ],

    // Dipaku ke beat animasi di kelas-motion.jsx. Angka di BEAT diganti dari transkrip sesudah `plan`.
    cue: ({C, total}) => [
      {at: 0.00, nama: 'ketik',   gain: 0.14},
      {at: 1.20, nama: 'terima',  gain: 0.22},
      {at: 1.20, nama: 'progres', gain: 0.16},
      ...(hook === 'tanya' ? [{at: BEAT.chat, nama: 'stempel', gain: 0.30}] : []),
      {at: 2.10, nama: 'pop',     gain: 0.24, pan: 0.3},

      {at: C.Bukti, nama: 'kendang', gain: 0.16},
      ...[0.4, 0.8, 1.2, 1.6, 2.0, 2.4].map((t, i) => ({at: C.Bukti + t, nama: 'kartu', gain: 0.18, nada: i})),
      {at: C.Bukti + BEAT.revisi, nama: 'pop', gain: 0.24, pan: -0.2},

      {at: C.Masalah, nama: 'tak', gain: 0.16},
      ...BEAT.masalah.map((t, i) => ({at: C.Masalah + t, nama: 'stempel', gain: 0.32, nada: -i})),

      {at: C.Demo, nama: 'kendang', gain: 0.14, nada: -2},
      ...Array.from({length: 14}, (_, i) => ({at: C.Demo + 0.6 + i * 0.38, nama: 'swipe', gain: 0.08, nada: (i % 3) - 1})),
      {at: C.Demo + 2.6, nama: 'pop', gain: 0.22, pan: -0.3},

      {at: C.Cara, nama: 'kendang', gain: 0.16},
      ...BEAT.cara.map((t, i) => ({at: C.Cara + t, nama: 'baris', gain: 0.22, nada: i * 2})),
      {at: C.Cara + BEAT.duaJam, nama: 'pop', gain: 0.24},

      {at: C.Daftar - 0.30, nama: 'riser', gain: 0.18},
      {at: C.Daftar + 0.8, nama: 'tik', gain: 0.22, pan: -0.2},
      {at: C.Daftar + 1.2, nama: 'tik', gain: 0.22, pan: -0.2, nada: 2},
      {at: C.Daftar + BEAT.harga, nama: 'kaching', gain: 0.32},
      {at: C.Daftar + BEAT.tombol, nama: 'tombol', gain: 0.36},
      {at: total - 0.35, nama: 'kendang', gain: 0.14},
    ],

    // Trek disusun bgm.py per video; tidak ada generate.
    musik: [{
      nama: 'bgm', luar: true, mulai: 0, fadeOut: ({total}) => [total - 0.4, 0.4],
      titik: [['Hook', 0, -15], ['Bukti', 0, -17], ['Masalah', 0, -17], ['Demo', 0, -16], ['Cara', 0, -17], ['Daftar', 0, -14]],
    }],

    sampul: {detik: 0},
    mixer: {gainVO: 1.55, gainSFX: 0.74, duckMusik: {th: 0.015, ratio: 14, attack: 25, release: 320}},
    periksa: {busTitik: [1.25, 2.15]},
  };
}

// Detik dari awal scene masing-masing, diisi dari transkrip VO sesudah `plan`.
const BEAT = {
  chat: 1.3,                   // hook tanya: "Chat." besar muncul
  revisi: 3.1,                 // stiker "revisi? lewat chat juga"
  masalah: [1.1, 1.8, 2.5],    // MAHAL, LAMA, TEMPLATE
  cara: [0.5, 1.2, 1.9, 2.6],  // 4 baris track
  duaJam: 3.4,                 // stiker "2 jam → pulang bawa 1 video"
  harga: 2.4,                  // stempel Rp 179.000
  tombol: 3.8,                 // tombol CTA
};
