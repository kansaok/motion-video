// V02 Iklan Jasa Optimasi Google Maps, gaya pop — SATU basis untuk enam video usaha.
// Tiap folder usaha (gigi/, kecantikan/, ...) cuma berisi `export default buat('<usaha>')`.
//
// Sumber brief: src/prompts/V02-gmaps-pop/prompt.md. Yang menyimpang dari brief, dan sebabnya:
//
// 1. SATU src, SATU set SFX, SATU BGM untuk enam video. Yang beda per usaha cuma kolom cari,
//    nama toko di layar (tweak `hook` di tiap .dc.html), gambar, dan VO baris 1 dan 3.
//    Satu BGM untuk keenamnya: lihat `mulai` di bawah.
// 2. Suara Cahaya, bukan Voice Design + Eleven v3: satu merek satu suara (IKLAN.md §3), dan v3
//    lebih lambat serta mengabaikan `speed`. Tag [curious]/[playful] diganti tanda baca.
// 3. BGM TANPA "punchy 808 kick": kick yang memimpin menutupi VO (IKLAN.md §1). Tenaganya dari
//    pluck, marimba, dan clap.
// 4. Transisi dibuat lembut dan pelan (gain ≤ 0,12), dan BGM diduck dalam saat VO bicara:
//    dua-duanya permintaan Rama di iklan Kelas CTWA.
// 5. CTA jadi baris VO sendiri dan kalimat terakhir: "Yuk chat sekarang sama Wulan!",
//    intonasi dinaikkan. Sama persis dengan tulisan tombolnya.
// 6. Frame 0 sudah berupa gambar selesai (judul + kolom cari), karena frame 0 = sampul.
import {existsSync, readFileSync} from 'node:fs';

const USAHA = {
  gigi:       {cari: 'dokter gigi terdekat',   saingan: 'klinik sebelah',  sekitar: 'klinikmu'},
  kecantikan: {cari: 'facial terdekat',        saingan: 'klinik sebelah',  sekitar: 'klinikmu'},
  restoran:   {cari: 'restoran terdekat',      saingan: 'resto sebelah',   sekitar: 'restomu'},
  bengkel:    {cari: 'bengkel mobil terdekat', saingan: 'bengkel sebelah', sekitar: 'bengkelmu'},
  barbershop: {cari: 'barbershop terdekat',    saingan: 'barber sebelah',  sekitar: 'barbermu'},
  kopi:       {cari: 'kopi terdekat',          saingan: 'kafe sebelah',    sekitar: 'kafemu'},
};

// Tukikan musik apa pun dilarang minta "quiet/sparse" ke generator (IKLAN.md §1); ketegangan
// Serius dibuat amplop, bukan generator.
/* Satu BGM untuk enam video. Scene sesudah Masalah sama panjang di semua video (Kerja
   disamakan ke 6,7 di OM_SCENES tiap .dc.html); yang beda cuma Hook dan Masalah. BGM
   digenerate dari video gigi, yang pembukanya paling panjang, dan video lain MELEWATI
   selisihnya di kepala trek. Dengan begitu drop jatuh tepat di scene Scan di keenamnya. */
const mulai = (usaha, scene) => {
  const f = new URL(`./${usaha}/timeline.json`, import.meta.url);
  if (!existsSync(f)) return 0;
  const s = JSON.parse(readFileSync(f, 'utf8'));
  return s.slice(0, s.findIndex((x) => x.name === scene)).reduce((a, x) => a + x.dur, 0);
};

const HINDARI = ['vocals', 'singing', 'lyrics', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808', 'EDM drop', 'long fade in'];

export function buat(usaha) {
  const U = USAHA[usaha];
  if (!U) throw new Error(`usaha tidak dikenal: ${usaha}`);
  const utama = usaha === 'gigi';          // BGM digenerate sekali, lewat video gigi
  return {
    nama: `gmaps-${usaha}`,
    src: '../src',
    komposisi: `V02 Gmaps ${usaha}.dc.html`,
    jsx: 'gmaps-pop.jsx',
    kapsi: false,                         // supers = kata VO, sudah besar di layar
    keluaran: `rama-digital-gmaps-${usaha}-9x16.mp4`,

    suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260926,
            speed: (l) => (l.no === 11 ? 1.05 : 1.20), stability: 0.14, similarity: 0.80, style: 0.72},

    lafal: {
      'Rp 490.000': 'empat ratus sembilan puluh ribu',
      49: 'empat puluh sembilan',
      'tanggal 5': 'tanggal lima',
      barbershop: 'barbersyop',
      omzet: 'omset',                     // "omzet" terbaca "Om Zed" di transkrip
    },

    vo: [
      {no: 1,  sc: 'Hook',    off: 0.10, text: `Orang cari ${U.cari}... kok yang muncul ${U.saingan}?`},
      {no: 2,  sc: 'Masalah', off: 0.10, text: 'Profil Google kamu belum rapi. Jam kosong, fotonya dikit, ulasan gak dibalas.'},
      {no: 3,  sc: 'Scan',    off: 0.10, text: `Kami cek posisimu di 49 titik peta, sekitar ${U.sekitar}.`},
      {no: 4,  sc: 'Kerja',   off: 0.10, text: 'Lalu kami rawat tiap bulan: posting, foto, balas ulasan, dan laporan tiap tanggal 5.'},
      {no: 5,  sc: 'Jujur',   off: 0.15, text: 'Tanpa ulasan palsu. Tanpa janji ranking.'},
      {no: 6,  sc: 'Harga',   off: 0.10, text: 'Mulai Rp 490.000 per bulan.'},
      {no: 7,  sc: 'Banding', off: 0.10, text: 'Harga kami lebih murah daripada waktu kamu, dan harga kopi kamu selama sebulan.'},
      {no: 8,  sc: 'Efek',    off: 0.05, text: 'Efeknya, omzet bisa tetap terjaga, dan gak dicolong sama kompetitor.'},
      {no: 9,  sc: 'Serius',  off: 0.10, text: 'Kompetitor kamu aja serius... masa kamu gak?'},
      {no: 10, sc: 'Cek',     off: 0.10, text: 'Mau tahu dulu posisimu? Cek Profil Maps gratis.'},
      // CTA baris sendiri dan kalimat TERAKHIR. Intonasi dinaikkan, dibaca sedikit lebih lambat.
      {no: 11, sc: 'Cek',     off: 3.30, style: 0.95, stability: 0.05, text: 'Yuk chat sekarang sama Wulan!'},
    ],

    tata: {mode: 'jangkar', jeda: 0.14, ekorBiasa: 0.30, ekor: {Cek: 1.20}},

    // Karakter: bersih, bulat, "bubbly", sedikit kartun. Kering semua.
    sfx: [
      ['swell',   0.5, 'one soft rounded user interface swell pop, bubbly, clean modern app sound, dry, no reverb, no music, single event'],
      ['ketik',   1.0, 'rapid light smartphone touchscreen keyboard taps, soft clicks, clean close-mic, dry, no reverb, no music, single burst'],
      ['pop',     0.3, 'one single soft bubble pop, mid pitch, clean user interface, dry, no reverb, no music, single pop'],
      ['boing',   0.8, 'a comedic cartoon boing combined with a sticker slap on a table, playful and punchy, short tail, dry, no reverb, no music, single event'],
      ['slide',   0.6, 'one quick cartoon question slide whistle going up, short and playful, dry, no reverb, no music, single event'],
      // Transisi: LEMBUT. Whoosh cerah dilaporkan "kasar, bikin gak fokus".
      ['sapu',    0.5, 'one very soft gentle airy swish, smooth and muted, warm, no harsh high frequencies, no hiss, dry, no reverb, no music, single motion'],
      ['tap',     0.3, 'one soft rubbery thump with a tiny pop, gentle and clean, dry, no reverb, no music, single hit'],
      ['bloop',   0.4, 'one soft bubbly bloop with a gentle low thud, like diving into water, muted, dry, no reverb, no music, single event'],
      ['kartu',   0.5, 'a paper card sliding in and landing with a soft thump on a table, clean, dry close-mic, no reverb, no music, single event'],
      ['salah',   0.4, 'one short playful wrong answer buzz, soft and rounded, cartoon, not harsh, two quick low notes, dry, no reverb, no music, single event'],
      ['cascade', 0.7, 'a fast cascade of tiny soft bubble pops moving left to right, light and clean, dry, no reverb, no music, single run'],
      ['pin',     0.7, 'a map pin drop, soft rubbery thud followed by a bright short ding, satisfying, dry, no reverb, no music, single event'],
      ['naik',    1.4, 'an ascending bright sparkle arpeggio on marimba and glockenspiel, positive, spreading outward, dry, no reverb, single run'],
      ['stiker',  0.5, 'a light sticker slap with a small pop, playful, dry close-mic, no reverb, no music, single event'],
      ['flip',    0.4, 'one chunky card flip pop, satisfying, clean and short, dry, no reverb, no music, single event'],
      ['kamera',  0.4, 'one soft modern phone camera shutter click, dry close-mic, no reverb, no music, single click'],
      ['chat',    0.4, 'a soft chat message received pop, friendly, two quick notes, dry, no reverb, no music, single event'],
      ['grafik',  0.9, 'four quick rising user interface blips in ascending steps, clean, dry, no reverb, no music, single run'],
      ['thud',    0.5, 'one deep soft impact thud, low and clean with a short tail, dry, no reverb, no music, single hit'],
      ['coret',   0.4, 'a thick marker pen striking quickly across paper, crisp and satisfying, dry close-mic, no reverb, no music, single stroke'],
      ['kaching', 0.8, 'a bright cash register cha-ching with a soft coin sparkle, cheerful and short, dry, no reverb, no music, single event'],
      ['jam',     1.2, 'a fast ticking clock, rapid tick tock speeding up, clean, dry close-mic, no reverb, no music, single run'],
      ['cangkir', 1.1, 'a rapid sequence of small ceramic cup clinks, quick light clinks, bright and playful, dry, no reverb, no music, single run'],
      ['lari',    0.5, 'a sneaky cartoon tiptoe run whoosh, quick and comedic, dry, no reverb, no music, single motion'],
      ['bonk',    0.7, 'a cartoon bonk on a hard surface followed by a springy boing bouncing away, comedic, dry, no reverb, no music, single event'],
      ['hentak',  0.3, 'one deep punchy text slam hit, short, tight low end, dry, no reverb, no music, single hit'],
      ['scratch', 0.8, 'a playful cartoon record scratch into a bright sticker slap, teasing, dry, no reverb, no music, single event'],
      ['gratis',  0.7, 'a magical bright sparkle chime with a soft pop, happy and short, dry, no reverb, no music, single event'],
      ['kirim',   0.5, 'a chat message sent swoosh with a soft pop, modern messaging app feel, gentle, dry, no reverb, no music, single event'],
      ['klik',    0.4, 'one chunky satisfying button press click, plastic, clean close-mic, dry, no reverb, no music, single click'],
      ['riser',   1.6, 'a quick rising tension riser, bright synth air building in pitch, no impact at the end, no drums, dry, no reverb'],
      ['hisap',   0.6, 'one short reverse whoosh sucking inward and stopping abruptly, soft, no impact, dry, no reverb, no music, single motion'],
      ['impact',  0.8, 'one tight punchy impact hit, rounded and warm, sharp transient, short tail, dry, no reverb, no music, single hit'],
      ['sub',     1.5, 'one deep sub bass drop boom decaying smoothly, low and heavy, no transient click, dry, no music, single hit'],
    ],

    /* Dipaku ke beat animasi di gmaps-pop.jsx (`S + n`). Transisi: fase masuk mulai di
       (scene - 0,32), potong di scene. Satu hentakan dilapis penuh, sekali: kartu harga
       Rp 490.000 di Harga+0,30 (IKLAN.md §2). */
    cue: ({C, total}) => {
      const tr = (sc, nada = 0) => [
        {at: C[sc] - 0.32, nama: 'sapu', gain: 0.10, nada},
        {at: C[sc],        nama: 'tap',  gain: 0.12, nada},
      ];
      return [
        // Hook — kolom cari sudah ada di frame 0; kata diketik, tiga hasil pesaing
        {at: 0.02,             nama: 'swell',  gain: 0.20},
        {at: 0.35,             nama: 'ketik',  gain: 0.18},
        {at: 1.30,             nama: 'pop',    gain: 0.26, nada: 0},
        {at: 1.48,             nama: 'pop',    gain: 0.26, nada: 2},
        {at: 1.66,             nama: 'pop',    gain: 0.26, nada: 4},
        {at: 1.95,             nama: 'boing',  gain: 0.36},
        {at: 2.30,             nama: 'slide',  gain: 0.22, pan: 0.2},

        ...tr('Masalah'),
        {at: C.Masalah + 0.40, nama: 'kartu',  gain: 0.28},
        {at: C.Masalah + 2.05, nama: 'salah',  gain: 0.30, nada: 0},
        {at: C.Masalah + 2.85, nama: 'salah',  gain: 0.30, nada: -1},
        {at: C.Masalah + 4.00, nama: 'salah',  gain: 0.34, nada: -2},

        {at: C.Scan - 0.32,    nama: 'sapu',   gain: 0.10, nada: 2},
        {at: C.Scan,           nama: 'bloop',  gain: 0.14},
        {at: C.Scan + 0.50,    nama: 'cascade', gain: 0.20},
        {at: C.Scan + 1.40,    nama: 'pin',    gain: 0.34},
        {at: C.Scan + 2.20,    nama: 'naik',   gain: 0.28},
        {at: C.Scan + 3.40,    nama: 'stiker', gain: 0.26, pan: -0.2},

        ...tr('Kerja', -2),
        {at: C.Kerja + 0.90,   nama: 'flip',   gain: 0.26, pan: -0.2},
        {at: C.Kerja + 1.40,   nama: 'flip',   gain: 0.26, pan: 0.2, nada: 2},
        {at: C.Kerja + 1.55,   nama: 'kamera', gain: 0.20, pan: 0.2},
        {at: C.Kerja + 2.10,   nama: 'flip',   gain: 0.26, pan: -0.2, nada: 4},
        {at: C.Kerja + 2.80,   nama: 'chat',   gain: 0.22, pan: -0.2},
        {at: C.Kerja + 2.90,   nama: 'flip',   gain: 0.26, pan: 0.2, nada: 5},
        {at: C.Kerja + 3.60,   nama: 'grafik', gain: 0.20, pan: 0.2},
        {at: C.Kerja + 4.40,   nama: 'stiker', gain: 0.24},

        {at: C.Jujur - 0.32,   nama: 'sapu',   gain: 0.10, nada: -4},
        {at: C.Jujur,          nama: 'thud',   gain: 0.18},
        {at: C.Jujur + 0.15,   nama: 'thud',   gain: 0.26},
        {at: C.Jujur + 0.85,   nama: 'coret',  gain: 0.30},
        {at: C.Jujur + 1.50,   nama: 'thud',   gain: 0.26, nada: -1},
        {at: C.Jujur + 2.20,   nama: 'coret',  gain: 0.32, nada: -1},

        // Harga — hentakan berlapis empat, satu-satunya
        {at: C.Harga - 1.00,   nama: 'riser',  gain: 0.26},          // lapis 1
        {at: C.Harga + 0.10,   nama: 'hisap',  gain: 0.26},          // lapis 2
        {at: C.Harga + 0.05,   nama: 'stiker', gain: 0.22},
        {at: C.Harga + 0.30,   nama: 'impact', gain: 0.46},          // lapis 3 — TITIK-nya
        {at: C.Harga + 0.32,   nama: 'sub',    gain: 0.36},          // lapis 4 — BERAT-nya
        {at: C.Harga + 0.40,   nama: 'kaching', gain: 0.30},
        {at: C.Harga + 0.90,   nama: 'boing',  gain: 0.26, pan: 0.3},
        {at: C.Harga + 1.90,   nama: 'coret',  gain: 0.22},
        {at: C.Harga + 2.30,   nama: 'pop',    gain: 0.22, nada: 0},
        {at: C.Harga + 2.50,   nama: 'pop',    gain: 0.22, nada: 2},

        ...tr('Banding'),
        {at: C.Banding + 1.60, nama: 'jam',    gain: 0.20},
        {at: C.Banding + 2.55, nama: 'stiker', gain: 0.22, pan: 0.2},
        {at: C.Banding + 2.75, nama: 'kartu',  gain: 0.24},
        {at: C.Banding + 3.00, nama: 'cangkir', gain: 0.22},

        ...tr('Efek', -2),
        {at: C.Efek + 0.90,    nama: 'grafik', gain: 0.20},
        {at: C.Efek + 2.00,    nama: 'lari',   gain: 0.24, pan: 0.4},
        {at: C.Efek + 2.45,    nama: 'bonk',   gain: 0.34, pan: 0.3},
        {at: C.Efek + 2.90,    nama: 'boing',  gain: 0.26},

        {at: C.Serius - 0.32,  nama: 'sapu',   gain: 0.10, nada: -4},
        {at: C.Serius + 0.15,  nama: 'hentak', gain: 0.28, nada: 0},
        {at: C.Serius + 0.65,  nama: 'hentak', gain: 0.28, nada: 1},
        {at: C.Serius + 1.05,  nama: 'hentak', gain: 0.32, nada: 2},
        {at: C.Serius + 1.90,  nama: 'scratch', gain: 0.32},

        ...tr('Cek', 2),
        {at: C.Cek + 2.55,     nama: 'gratis', gain: 0.30},
        {at: C.Cek + 1.90,     nama: 'kartu',  gain: 0.24},
        {at: C.Cek + 2.20,     nama: 'ketik',  gain: 0.16},
        {at: C.Cek + 3.05,     nama: 'kirim',  gain: 0.24},
        {at: C.Cek + CTA.muncul, nama: 'swell', gain: 0.26, nada: -2},
        {at: C.Cek + CTA.tekan,  nama: 'klik',  gain: 0.42},
        {at: total - 0.55,     nama: 'sapu',   gain: 0.10, nada: -2},
      ];
    },

    musik: [{
      nama: 'bgm', luar: !utama, mulai: 0, lewati: utama ? 0 : mulai('gigi', 'Scan') - mulai(usaha, 'Scan'),
      fadeOut: ({total}) => [total - 0.6, 0.6],
      // Bagian dipatok ke batas scene. Semuanya "selalu ada" (IKLAN.md §1); dinamika dari amplop.
      rencana: ({C, total}) => {
        const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
        const inti = ['modern upbeat pop instrumental', '118 BPM', 'bright plucky synths', 'playful marimba hook', 'snappy claps', 'bouncy bassline', 'glossy and clean'];
        return [
          b(0, C.Scan, '[hook]', [...inti, 'instant hook from the very first beat', 'no fade in', 'steady and continuous']),
          b(C.Scan, C.Jujur, '[drop and groove]', [...inti, 'full beat', 'light groove leaving space for voice-over', 'steady and continuous']),
          b(C.Jujur, C.Harga, '[half-time]', ['modern pop instrumental', 'half-time groove', 'warm pads and bass', 'serious but warm', 'steady and continuous', 'always present']),
          b(C.Harga, C.Serius, '[lift and bounce]', [...inti, 'full energy returns', 'bouncy playful groove', 'pizzicato plucks', 'confident']),
          b(C.Serius, C.Cek, '[tension]', ['modern pop instrumental', 'insistent pulsing low synth note', 'ticking hi-hat', 'tension building', 'steady and continuous']),
          b(C.Cek, total, '[final chorus]', [...inti, 'final chorus', 'marimba hook', 'happy and confident']),
          b(total, total + 6, '[tail]', [...inti, 'final chorus continues', 'steady and continuous']),
        ];
      },
      titik: [
        ['Hook', 0.0, -14], ['Masalah', 3.0, -16],
        ['Scan', 0.0, -14], ['Kerja', 0.5, -17],
        ['Jujur', 0.0, -17], ['Harga', 0.0, -14],
        ['Banding', 0.3, -17], ['Efek', 4.0, -17],
        ['Serius', 0.2, -21], ['Serius', 3.0, -21],   // ketegangan: satu tukikan disengaja
        ['Cek', 0.0, -15],
      ],
    }],

    sampul: {detik: 2.6},                 // kolom cari + stiker "kok yang muncul ... sebelah?"

    // Duck dalam: BGM harus turun saat VO bicara (permintaan Rama, iklan Kelas CTWA).
    mixer: {gainVO: 1.55, gainSFX: 0.74, duckMusik: {th: 0.015, ratio: 14, attack: 25, release: 320}},

    // Titik A/B bus SFX di celah VO: stempel "Tanpa" sebelum baris 5, dan pop sesudah baris 6.
    periksa: {busTitik: [mulai(usaha, 'Jujur') + 0.05, mulai(usaha, 'Harga') + 2.55]},
  };
}

// Detik tombol CTA muncul dan ditekan, diukur dari transkrip VO baris 11.
const CTA = {muncul: 3.35, tekan: 4.0};   // tombol muncul di "Yuk", ditekan di "sekarang"
