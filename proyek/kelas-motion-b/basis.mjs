// V06 · Iklan Kelas Motion x Claude Design — dua video beda hook (chat, tanya), CTA wa.
// Tiap folder hook cuma berisi `export default buat('<hook>')`. Satu src, satu set SFX.
// (Proyek terpisah dari proyek/kelas-motion milik sesi lain; permintaan Rama 28 Sep 2026.)
//
// Sumber brief: src/prompts/V06-kelas-motion/prompt.md. Yang menyimpang dari brief, dan sebabnya:
//
// 1. BGM = trek Suno dangdut "Wulan Muncul, Rame Sekali" (permintaan Rama), bukan trek baru.
//    bgm.py menyusunnya per video: frame 0 di drop (116,08), chorus bar 54 (98,22) pecah tepat
//    di awal Daftar. Sambungan di kelipatan bar (134,3 BPM, 1 bar = 1,786 dtk), bukan 120 BPM.
// 2. Suara Cahaya, bukan Eleven v3: satu merek satu suara. Tag diganti tanda baca.
// 3. CTA "Chat Wulan buat daftar!" jadi baris VO sendiri, kalimat terakhir, intonasi dinaikkan,
//    sama persis dengan tulisan tombolnya.
// 4. 14 thumbnail demo dicuplik dari MP4 lokal kami sendiri (src/media/v06-motion/), bukan
//    diunduh dari situs: gambar situs tampil kosong saat render.
// 5. VO dipadatkan ke teks di layar. Naskah brief keluar 36,4 detik untuk komposisi 28 detik.
//    Nama kelas tidak diucapkan: judulnya sudah besar di scene Daftar.
// 6. Transisi lembut, BGM diduck dalam saat VO bicara (preferensi tetap Rama). Kendang
//    "tak-dung" di potongan scene tetap ada tapi pelan: dia identitas pop dut.

const HOOK = {
  chat: 'Iklan ini dibikin pakai chat.',
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
      // `maks`: take pertama hook chat berhenti 1,4 detik sesudah "Iklan"; generate ulang sampai rapat.
      {no: 1, sc: 'Hook',    off: 0.00, maks: hook === 'chat' ? 2.3 : 2.9, text: HOOK[hook]},
      {no: 2, sc: 'Bukti',   off: 0.10, text: 'Tulis brief, Claude Design yang gerakin. Revisi? Lewat chat juga.'},
      {no: 3, sc: 'Masalah', off: 0.10, text: 'Konten statis di-skip sedetik. Mahal. Lama. Template.'},
      {no: 4, sc: 'Demo',    off: 0.10, text: 'Empat belas video, satu alur yang sama. Sebagian udah tayang jadi iklan.'},
      {no: 5, sc: 'Cara',    off: 0.10, text: 'Brief, Claude Design, ElevenLabs, render. Dua jam, pulang bawa satu video.'},
      {no: 6, sc: 'Daftar',  off: 0.10, text: 'Sebelas atau dua belas Oktober. Rp 179.000.'},
      // CTA baris sendiri dan kalimat TERAKHIR, intonasi dinaikkan. Sama dengan tulisan tombol.
      {no: 7, sc: 'Daftar',  off: 3.40, style: 0.95, stability: 0.05, text: 'Chat Wulan buat daftar!'},
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

    // Dipaku ke beat animasi di kelas-motion.jsx. Angka BEAT diisi dari transkrip sesudah `plan`.
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
      ...Array.from({length: 14}, (_, i) => ({at: C.Demo + 0.6 + i * 0.36, nama: 'swipe', gain: 0.08, nada: (i % 3) - 1})),
      {at: C.Demo + BEAT.tayang, nama: 'pop', gain: 0.22, pan: -0.3},

      {at: C.Cara, nama: 'kendang', gain: 0.16},
      ...BEAT.cara.map((t, i) => ({at: C.Cara + t, nama: 'baris', gain: 0.22, nada: i * 2})),
      {at: C.Cara + BEAT.duaJam, nama: 'pop', gain: 0.24},

      {at: C.Daftar - 0.30, nama: 'riser', gain: 0.18},
      {at: C.Daftar + BEAT.sesi[0], nama: 'tik', gain: 0.22, pan: -0.2},
      {at: C.Daftar + BEAT.sesi[1], nama: 'tik', gain: 0.22, pan: -0.2, nada: 2},
      {at: C.Daftar + BEAT.harga, nama: 'kaching', gain: 0.32},
      {at: C.Daftar + BEAT.tombol, nama: 'tombol', gain: 0.36},
      {at: total - 0.35, nama: 'kendang', gain: 0.14},
    ],

    // Trek disusun bgm.py per video; tidak ada generate.
    musik: [{
      nama: 'bgm', luar: true, mulai: 0, fadeOut: ({total}) => [total - 0.4, 0.4],
      titik: [['Hook', 0, -15], ['Bukti', 0, -17], ['Masalah', 0, -17], ['Demo', 0, -16], ['Cara', 0, -17], ['Daftar', 0, -15]],
    }],

    sampul: {detik: 0},
    mixer: {gainVO: 1.55, gainSFX: 0.74, duckMusik: {th: 0.015, ratio: 14, attack: 25, release: 320}},
    periksa: {busTitik: [0.02, 1.25]},
  };
}

// Detik dari awal scene masing-masing, diisi dari transkrip VO sesudah `plan`.
// Angka yang sama ada di kelas-motion.jsx; ubah keduanya bersamaan.
const BEAT = {
  chat: 1.85,                  // hook tanya: "Chat." besar muncul
  revisi: 2.75,                // stiker "revisi? lewat chat juga"
  masalah: [1.7, 2.3, 2.9],    // MAHAL, LAMA, TEMPLATE
  tayang: 2.6,                 // stiker "sebagian udah tayang jadi iklan"
  cara: [0.2, 0.6, 1.45, 2.1], // 4 baris track: Brief, Claude Design, ElevenLabs, render
  duaJam: 2.9,                 // stiker "2 jam → pulang bawa 1 video"
  sesi: [0.15, 0.9],           // "Sebelas", "dua belas"
  harga: 2.05,                 // stempel Rp 179.000
  tombol: 4.3,                 // klik tombol di kata "daftar"
};
