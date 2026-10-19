// V01 v5 · Promo Kelas Tracking CTWA — versi Dingin (25 dtk, broad) dan Hangat (15 dtk, retarget).
// Satu src (ctwa-v5.jsx memuat dua komposisi), satu set SFX. Folder dingin/ dan hangat/.
//
// Sumber brief: src/prompts/V01-kelas-ctwa-v5/prompt.md. Yang menyimpang dari brief, dan sebabnya:
//
// 1. BGM = trek Suno v4. Dingin memakai susunan v4 mulai dari drop (detik 10,85 di
//    kelas-ctwa-rahasia/aset/suno.mp3), jadi frame 0 langsung dibuka hentakan drop.
//    Hangat memakai chorus trek mentah, bar 54 (detik 98,22), satu-satunya chorus 16 detik
//    yang tidak menabrak break di 114,3.
// 2. ctwa_clid dibaca "ce-te-we-a-ce-el-ai-di" (aturan tetap Rama), bukan "ce te we a klid".
// 3. CTA jadi baris VO sendiri, kalimat terakhir, intonasi dinaikkan, sama persis dengan
//    tombolnya. Tombol Dingin diganti dari "Daftar lewat WhatsApp" jadi "Chat WhatsApp untuk daftar".
// 4. Dua screenshot asli (Ads Manager, Events Manager) belum ada. Selama berkasnya belum
//    ditaruh di src/media/, komposisi menggambar tabel pengganti tanpa merek Meta.
// 5. Frame 0 = sampul: hook Dingin dan kartu jadwal Hangat sudah ada di frame 0.
// 6. Suara Cahaya, bukan Eleven v3: satu merek satu suara. Tag diganti tanda baca.
// 7. VO dipotong ke durasi slotnya (25 dan 15 detik). Naskah brief keluar 31,1 dan 21,9 detik;
//    yang dibuang cuma yang sudah terbaca di layar: tanggal, jam, dan tiga butir "Pulang bawa".
import {eja} from '../../lib/lafal.mjs';

// Jadwal diucapkan pendek ("Senin malam"): tanggal dan jam lengkap sudah besar di kartu sesi.
// Ganti hari di VO baris Kelas (Dingin) dan Jadwal (Hangat) tiap tweak sesi diganti.

const SFX = [
  ['pop',     0.5, 'one bright cartoon bubble pop, short and round, playful, dry close-mic, no reverb, no music, single pop'],
  ['stamp',   0.8, 'one heavy rubber stamp thump on a wooden desk, short punchy low knock, dry close-mic, no reverb, no music, single hit'],
  ['slide',   0.9, 'one quizzical cartoon slide whistle rising upward, short and funny, dry, no reverb, no music, single event'],
  ['uipop',   0.5, 'one soft modern user interface pop, rounded and warm, short click-pop, dry, no reverb, no music, single hit'],
  ['salah',   0.5, 'one short soft error buzz, rounded and gentle, cartoon, not harsh, dry, no reverb, no music, single event'],
  ['zip',     1.2, 'a zippy digital zip sweeping upward in pitch, fast and clean, like data flying away, dry, no reverb, no music, single sweep'],
  ['chime',   1.0, 'a positive notification chime, two rising bright notes, clean and friendly, dry, no reverb, no music, single event'],
  ['kaching', 1.0, 'one short cash register ka-ching bell, bright and happy, dry, no reverb, no music, single event'],
  ['klik',    0.5, 'one chunky satisfying button click, solid plastic press, dry close-mic, no reverb, no music, single click'],
  ['slap',    0.8, 'a sticker slapped onto a table with a bright little ding right after, playful, dry close-mic, no reverb, no music, single event'],
  // Transisi: LEMBUT. Whoosh cerah dilaporkan "kasar, bikin gak fokus".
  ['sapu',    0.6, 'one very soft gentle airy swish, smooth and muted, warm, no harsh high frequencies, no hiss, dry, no reverb, no music, single motion'],
];

const DUCK = {gainVO: 1.55, gainSFX: 0.74, duckMusik: {th: 0.015, ratio: 14, attack: 25, release: 320}};
const LAFAL = {ctwa_clid: `${eja('CTWA CL')} Ai Di`, ctwa: eja('CTWA'), capi: 'Kapi', mcp: eja('MCP'), claude: 'Klode',
  'Rp179.000': 'seratus tujuh puluh sembilan ribu'};

const DINGIN = {
  nama: 'kelas-ctwa-v5-dingin',
  komposisi: 'Promo Kelas CTWA v5 Dingin.dc.html',
  keluaran: 'rama-digital-kelas-ctwa-v5-dingin-9x16.mp4',
  vo: [
    {no: 1, sc: 'Hook',    off: 0.10, text: 'Chat dari iklan banyak. Yang beli siapa? Meta nggak tahu.'},
    {no: 2, sc: 'Masalah', off: 0.10, text: 'Di Ads Manager, yang kelihatan cuma chat. Jadi Meta cari orang yang suka chat, bukan yang beli.'},
    {no: 3, sc: 'Rahasia', off: 0.10, text: 'Rahasia agency: kirim data pembeli balik ke Meta, pakai ctwa_clid dan CAPI.'},
    {no: 4, sc: 'Kelas',   off: 0.10, text: 'Kelas dua jam bareng Ari Eko. Senin malam, Rp179.000.'},
    {no: 5, sc: 'CTA',     off: 0.10, style: 0.95, stability: 0.05, text: 'Chat WhatsApp untuk daftar!'},
  ],
  ekor: {CTA: 1.0},
  cue: ({C, total}) => [
    {at: 0.02,           nama: 'sapu',  gain: 0.10},
    {at: 0.45,           nama: 'pop',   gain: 0.28, nada: 0},
    {at: 0.63,           nama: 'pop',   gain: 0.28, nada: 2},
    {at: 0.81,           nama: 'pop',   gain: 0.30, nada: 4},
    {at: 2.75,           nama: 'stamp', gain: 0.40},
    {at: 2.00,           nama: 'slide', gain: 0.26},
    {at: C.Masalah - 0.35, nama: 'sapu', gain: 0.10},
    {at: C.Masalah + 0.60, nama: 'uipop', gain: 0.24},
    {at: C.Masalah + 2.00, nama: 'uipop', gain: 0.28, nada: 3},
    {at: C.Masalah + 2.20, nama: 'salah', gain: 0.30},
    {at: C.Masalah + 4.60, nama: 'stamp', gain: 0.30, nada: 2},
    {at: C.Rahasia - 0.35, nama: 'sapu', gain: 0.10, nada: -3},
    {at: C.Rahasia + 0.80, nama: 'uipop', gain: 0.22, nada: 0},
    {at: C.Rahasia + 1.20, nama: 'uipop', gain: 0.22, nada: 3},
    {at: C.Rahasia + 1.40, nama: 'chime', gain: 0.24},
    {at: C.Rahasia + 1.60, nama: 'uipop', gain: 0.22, nada: 5},
    {at: C.Rahasia + 2.20, nama: 'zip',   gain: 0.26},
    {at: C.Rahasia + 2.40, nama: 'slap',  gain: 0.28},
    {at: C.Rahasia + 3.00, nama: 'uipop', gain: 0.24, nada: -2},
    {at: C.Kelas - 0.35,   nama: 'sapu',  gain: 0.10},
    {at: C.Kelas + 1.50,   nama: 'slap',  gain: 0.28},
    {at: C.Kelas + 2.40,   nama: 'kaching', gain: 0.30},
    {at: C.Kelas + 3.00,   nama: 'pop',   gain: 0.22},
    {at: C.CTA - 0.35,     nama: 'sapu',  gain: 0.10, nada: 2},
    {at: C.CTA + 0.60,     nama: 'uipop', gain: 0.28},
    {at: C.CTA + 1.50,     nama: 'klik',  gain: 0.42},
    {at: C.CTA + 1.00,     nama: 'pop',   gain: 0.20},
  ],
  // Susunan v4 mulai dari drop: frame 0 langsung hentakan.
  musik: {lewati: 10.85, titik: [['Hook', 0, -15], ['Masalah', 0.5, -18], ['Kelas', 0, -17], ['CTA', 0, -15]]},
  sampul: {detik: 2.2},
};

const HANGAT = {
  nama: 'kelas-ctwa-v5-hangat',
  komposisi: 'Promo Kelas CTWA v5 Hangat.dc.html',
  keluaran: 'rama-digital-kelas-ctwa-v5-hangat-9x16.mp4',
  vo: [
    {no: 1, sc: 'Jadwal',   off: 0.10, text: 'Sesi berikutnya: Senin malam, setengah delapan.'},
    {no: 2, sc: 'Pengajar', off: 0.10, text: 'Pengajarnya Ari Eko Prasethio.'},
    {no: 3, sc: 'Bawa',     off: 0.10, text: 'Pulang bawa tiga hal, plus Konektor gratis sebulan.'},
    {no: 4, sc: 'Daftar',   off: 0.10, text: 'Rp179.000.'},
    {no: 5, sc: 'Daftar',   off: 1.00, style: 0.95, stability: 0.05, text: 'Chat WhatsApp untuk daftar!'},
  ],
  ekor: {Daftar: 1.0},
  cue: ({C}) => [
    {at: 0.02,             nama: 'sapu',  gain: 0.10},
    {at: 1.30,             nama: 'slap',  gain: 0.30},
    {at: C.Pengajar - 0.35, nama: 'sapu', gain: 0.10},
    {at: C.Pengajar + 0.10, nama: 'uipop', gain: 0.24},
    {at: C.Pengajar + 0.50, nama: 'pop',  gain: 0.22, pan: -0.2},
    {at: C.Pengajar + 1.20, nama: 'pop',  gain: 0.20, nada: -2},
    {at: C.Bawa - 0.35,    nama: 'sapu',  gain: 0.10, nada: -2},
    {at: C.Bawa + 0.60,    nama: 'uipop', gain: 0.28, nada: 0},
    {at: C.Bawa + 1.30,    nama: 'uipop', gain: 0.28, nada: 3},
    {at: C.Bawa + 2.00,    nama: 'uipop', gain: 0.30, nada: 7},
    {at: C.Daftar - 0.35,  nama: 'sapu',  gain: 0.10, nada: 2},
    {at: C.Daftar + 0.10,  nama: 'kaching', gain: 0.32},
    {at: C.Daftar + 0.50,  nama: 'pop',   gain: 0.20},
    {at: C.Daftar + 2.10,  nama: 'uipop', gain: 0.26},
    {at: C.Daftar + 3.50,  nama: 'klik',  gain: 0.42},
  ],
  // Chorus trek mentah, bar 54: 16 detik penuh sebelum break di 114,3.
  // Chorus trek ini padat: amplop −3 dB di bawah Dingin, supaya VO ≥ +9 dB di atas musik (terukur +5,8).
  musik: {lewati: 98.22, titik: [['Jadwal', 0, -18], ['Bawa', 0.3, -20], ['Daftar', 0, -17]]},
  sampul: {detik: 0},
};

export function buat(v) {
  const V = {dingin: DINGIN, hangat: HANGAT}[v];
  return {
    nama: V.nama, src: '../src', komposisi: V.komposisi, jsx: 'ctwa-v5.jsx', kapsi: false, keluaran: V.keluaran,
    suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260927,
            speed: (l) => (l.style ? 1.05 : 1.20), stability: 0.14, similarity: 0.80, style: 0.72},
    lafal: LAFAL,
    vo: V.vo,
    tata: {mode: 'jangkar', jeda: 0.14, ekorBiasa: 0.25, ekor: V.ekor},
    sfx: SFX,
    cue: V.cue,
    musik: [{nama: 'bgm', luar: true, mulai: 0, lewati: V.musik.lewati, fadeOut: ({total}) => [total - 0.5, 0.5], titik: V.musik.titik}],
    sampul: V.sampul,
    mixer: DUCK,
    periksa: {busTitik: [0.03, 1.35]},
  };
}
