// V03 Iklan Jasa Optimasi Chatbot AI "argo chat" — SATU basis untuk enam video:
// 3 hook (argo, makasih, tebak) × 2 fase tayang (sebelum = s.d. 30 Sep, sudah = mulai 1 Okt).
// Tiap folder `<hook>-<fase>/` cuma berisi `export default buat('<hook>', '<fase>')`.
//
// Sumber brief: src/prompts/V03-chatbot-jev/prompt.md. Yang menyimpang dari brief, dan sebabnya:
//
// 1. SATU src, SATU set SFX, SATU BGM untuk enam video. Yang beda: VO 1 (hook), VO 2 dan 9
//    (fase), dan tweak `hook`/`fase` di tiap .dc.html. BGM digenerate dari video REF (hook
//    terpanjang); video lain melewati selisih pembukanya (`lewati`), jadi drop tetap jatuh
//    tepat saat Jev masuk.
// 2. Suara Cahaya, bukan Eleven v3: satu merek satu suara (IKLAN.md §3). Tag diganti tanda baca.
// 3. BGM TANPA "deep 808 bass": kick dan sub yang memimpin menutupi VO (IKLAN.md §1).
// 4. CTA jadi baris VO sendiri dan kalimat terakhir, "Chat Wulan sekarang!", sama persis
//    dengan tombolnya (tombol diganti dari "Konsultasi sama Wulan"). Kalimat identitas
//    "Sebelum argo jalan, konsultasi dulu sama Wulan." tetap, tepat sebelum CTA.
// 5. Transisi lembut dan pelan, BGM diduck dalam saat VO bicara (preferensi tetap Rama).
// 6. Frame 0 = sampul: judul, jendela chat, dan meteran argo sudah ada di frame 0.
// 7. Naskah dipadatkan: jeda "..." dibuang kecuali sebelum "dan setelahnya". Suara Cahaya
//    membaca naskah brief 53-55 detik untuk komposisi 45 detik.
import {existsSync, readFileSync} from 'node:fs';

const HOOK = {
  argo:    (f) => `${f === 'sudah' ? 'Sejak' : 'Mulai'} 1 Oktober, chatbot kamu kena argo!`,
  makasih: () => 'Pelanggan cuma bilang makasih, chatbot kamu bales 3 bubble. Ditagih!',
  tebak:   () => 'Chatbot kamu masih jadul? Tebak tagihannya bulan depan.',
};

// Video yang BGM-nya digenerate: pembuka (Hook + Aturan) terpanjang, diukur sesudah `plan`.
// Scene mulai Hitung sama panjang di keenam video (Bonus disamakan ke 4,55 di OM_SCENES).
const REF = 'makasih-sebelum';

const mulai = (varian, scene) => {
  const f = new URL(`./${varian}/timeline.json`, import.meta.url);
  if (!existsSync(f)) return 0;
  const s = JSON.parse(readFileSync(f, 'utf8'));
  return s.slice(0, s.findIndex((x) => x.name === scene)).reduce((a, x) => a + x.dur, 0);
};

const HINDARI = ['vocals', 'singing', 'lyrics', 'heavy four-on-the-floor kick', 'booming sub bass', 'deep 808 bass', 'trap 808', 'long fade in'];

export function buat(hook, fase) {
  if (!HOOK[hook] || !['sebelum', 'sudah'].includes(fase)) throw new Error(`varian tidak dikenal: ${hook}-${fase}`);
  const varian = `${hook}-${fase}`;
  const utama = varian === REF;
  const kata = fase === 'sudah' ? 'Sejak' : 'Mulai';
  return {
    nama: `jev-${varian}`,
    src: '../src',
    komposisi: `V03 Jev ${hook} ${fase}.dc.html`,
    jsx: 'jev-argo.jsx',
    kapsi: false,
    keluaran: `rama-digital-jev-${hook}-${fase}-9x16.mp4`,

    suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260926,
            speed: (l) => (l.no === 10 ? 1.05 : 1.20), stability: 0.14, similarity: 0.80, style: 0.72},

    lafal: {
      '1 Oktober': 'satu Oktober',
      'Rp356,65': 'tiga ratus lima puluh enam perak',
      '3 bubble': 'tiga bubble',
    },

    vo: [
      {no: 1,  sc: 'Hook',   off: 0.10, text: HOOK[hook](fase)},
      {no: 2,  sc: 'Aturan', off: 0.10, text: `${kata} 1 Oktober, Meta nagih tiap balasan chatbot. Lewat seribu, Rp356,65 per pesan!`},
      {no: 3,  sc: 'Hitung', off: 0.10, text: 'Bayangin, sebulan sepuluh ribu balasan: tiga koma dua juta. Ke Meta doang!'},
      {no: 4,  sc: 'Dobel',  off: 0.10, text: 'Chatbot jadul bayar dua kali: tagihan Meta, plus biaya AI.'},
      {no: 5,  sc: 'Jadul',  off: 0.10, text: 'Soalnya dia bales semua chat, dan tiap bales, baca ulang seluruh riwayat.'},
      {no: 6,  sc: 'Jev',    off: 0.10, text: 'Model Jev mikir dulu sebelum AI jawab: balas, lewati, tandai buat tim, atau keluarkan dari follow-up.'},
      {no: 7,  sc: 'Bukti',  off: 0.10, text: 'Biaya AI harian satu klien kami. Sebelum diperbaiki Rama Digital... dan setelahnya.'},
      {no: 8,  sc: 'Bonus',  off: 0.10, text: 'Plus bonus chatbot Web, kalau order sebelum tujuh Oktober!'},
      {no: 9,  sc: 'Cek',    off: 0.10, text: fase === 'sudah' ? 'Argo udah jalan. Konsultasi dulu sama Wulan.' : 'Sebelum argo jalan, konsultasi dulu sama Wulan.'},
      // CTA baris sendiri dan kalimat TERAKHIR, intonasi dinaikkan. Sama dengan tulisan tombol.
      {no: 10, sc: 'Cek',    off: 3.20, style: 0.95, stability: 0.05, text: 'Chat Wulan sekarang!'},
    ],

    tata: {mode: 'jangkar', jeda: 0.14, ekorBiasa: 0.30, ekor: {Cek: 1.20}},

    // Karakter: bersih, bulat, sedikit kartun, bernuansa koin dan argo taksi. Kering semua.
    sfx: [
      ['ting',    0.5, 'a taxi meter click followed by a bright cheerful coin ting, short and clean, dry, no reverb, no music, single event'],
      ['argo',    2.0, 'fast light mechanical taxi meter ticking, steady clean ticks, dry close-mic, no reverb, no music, continuous'],
      ['stiker',  0.6, 'a comedic sticker slap with a short cartoon boing, playful, dry, no reverb, no music, single event'],
      ['isi',     1.0, 'a rising bubbly fill sound ascending smoothly, playful user interface, dry, no reverb, no music, single run'],
      ['luber',   0.6, 'a rubbery overflow boing with a short soft error buzz, cartoon, not harsh, dry, no reverb, no music, single event'],
      ['kaching', 0.7, 'a punchy cash register cha-ching, bright and short, dry, no reverb, no music, single event'],
      ['koin',    1.2, 'a rapid cascade of tiny coin clinks speeding up, light and bright, dry, no reverb, no music, single run'],
      ['struk',   0.5, 'a short crisp receipt printer burst, dry close-mic, no reverb, no music, single event'],
      ['ai',      0.5, 'a short soft robotic blip with a small coin ting, cute, dry, no reverb, no music, single event'],
      ['riwayat', 1.4, 'fast paper shuffling and page flipping, rising in pace, dry close-mic, no reverb, no music, single run'],
      ['lega',    0.8, 'three bright coin ting notes descending gently, relieved and soft, with a soft whoosh down, dry, no reverb, no music, single phrase'],
      ['sortir',  0.5, 'a quick soft swoosh into a gentle clack, sorting a card, dry, no reverb, no music, single event'],
      ['bar',     0.9, 'eight quick rising user interface blips, slight tension, clean, dry, no reverb, no music, single run'],
      ['kecil',   0.6, 'a satisfying tiny pop with a sparkle chime, relief, dry, no reverb, no music, single event'],
      ['bonus',   0.8, 'a magical bright sparkle burst with a single kendang drum hit, celebratory, dry, no reverb, no music, single event'],
      ['chat',    0.5, 'a soft chat pop, friendly, two quick notes, dry, no reverb, no music, single event'],
      ['ketik',   1.2, 'light smartphone keyboard taps, soft clean clicks, dry close-mic, no reverb, no music, single burst'],
      ['kirim',   0.5, 'a chat message sent swoosh with a soft pop, gentle, dry, no reverb, no music, single event'],
      ['klik',    0.5, 'one chunky satisfying button press click, clean close-mic, dry, no reverb, no music, single click'],
      // Transisi: LEMBUT. Whoosh cerah dilaporkan "kasar, bikin gak fokus".
      ['sapu',    0.5, 'one very soft gentle airy swish, smooth and muted, warm, no harsh high frequencies, no hiss, dry, no reverb, no music, single motion'],
      ['tap',     0.5, 'one soft rubbery thump with a tiny pop, gentle and clean, dry, no reverb, no music, single hit'],
      ['kertas',  0.8, 'a long receipt printer spitting paper quickly then a soft paper tear, dry close-mic, no reverb, no music, single event'],
      ['riser',   1.6, 'a quick rising tension riser, bright synth air building in pitch, no impact at the end, no drums, dry, no reverb'],
      ['hisap',   0.6, 'one short reverse whoosh sucking inward and stopping abruptly, soft, no impact, dry, no reverb, no music, single motion'],
      ['impact',  0.8, 'one tight punchy impact hit, rounded and warm, sharp transient, short tail, dry, no reverb, no music, single hit'],
      ['sub',     1.5, 'one deep sub bass drop boom decaying smoothly, low and heavy, no transient click, dry, no music, single hit'],
    ],

    /* Dipaku ke beat animasi di jev-argo.jsx. Motif identitas: tiga "ting" naik di hook,
       ticking argo sampai Jev masuk (makin cepat lewat nada), lalu "ting" turun saat lega.
       Satu hentakan berlapis empat, sekali: Jev masuk (drop BGM) di Jev+0,00. */
    cue: ({C, total}) => {
      const tr = (sc, nada = 0) => [
        {at: C[sc] - 0.32, nama: 'sapu', gain: 0.10, nada},
        {at: C[sc],        nama: 'tap',  gain: 0.12, nada},
      ];
      const lega = C.Jev + 2.2;
      const argo = [];      // ticking tiap 2 detik dari 1,9 sampai argo melambat, nada naik pelan
      for (let t = 1.9, i = 0; t < lega - 0.4; t += 2.0, i++) argo.push({at: t, nama: 'argo', gain: 0.08, nada: Math.min(4, i * 0.5), pan: 0.3});
      return [
        // Hook — tiga bubble bot, tiap bubble satu "ting" naik 2 semitone
        {at: 0.30, nama: 'chat',   gain: 0.20, pan: -0.2},
        {at: 0.70, nama: 'ting',   gain: 0.30, nada: 0, pan: 0.2},
        {at: 1.05, nama: 'ting',   gain: 0.30, nada: 2, pan: 0.2},
        {at: 1.40, nama: 'ting',   gain: 0.32, nada: 4, pan: 0.2},
        {at: HOOK_STIKER, nama: 'stiker', gain: 0.36},
        ...argo,

        ...tr('Aturan'),
        {at: C.Aturan + 2.10, nama: 'isi',     gain: 0.24},
        {at: C.Aturan + 3.20, nama: 'luber',   gain: 0.28},
        {at: C.Aturan + 4.10, nama: 'kaching', gain: 0.32},
        {at: C.Aturan + 5.20, nama: 'stiker',  gain: 0.22, pan: -0.2},

        {at: C.Hitung - 0.32, nama: 'sapu',    gain: 0.10, nada: 2},
        {at: C.Hitung,        nama: 'tap',     gain: 0.12, nada: 2},
        {at: C.Hitung + 1.60, nama: 'koin',    gain: 0.22},
        {at: C.Hitung + 2.60, nama: 'kaching', gain: 0.36, nada: -3},
        {at: C.Hitung + 4.00, nama: 'stiker',  gain: 0.24, pan: 0.3},

        // Struk raksasa menutup layar
        {at: C.Dobel - 0.32,  nama: 'kertas',  gain: 0.18},
        {at: C.Dobel + 0.90,  nama: 'struk',   gain: 0.28, pan: -0.2},
        {at: C.Dobel + 1.90,  nama: 'struk',   gain: 0.28, pan: 0.2, nada: -2},
        {at: C.Dobel + 2.90,  nama: 'stiker',  gain: 0.22, pan: 0.3},

        {at: C.Jadul - 0.32,  nama: 'sapu',    gain: 0.10, nada: -4},
        {at: C.Jadul,         nama: 'tap',     gain: 0.12, nada: -4},
        {at: C.Jadul + 1.25,  nama: 'ai',      gain: 0.24, pan: 0.3},
        {at: C.Jadul + 1.80,  nama: 'ai',      gain: 0.24, pan: 0.3, nada: 1},
        {at: C.Jadul + 2.35,  nama: 'ai',      gain: 0.26, pan: 0.3, nada: 2},
        {at: C.Jadul + 2.90,  nama: 'riwayat', gain: 0.20},

        // Jev masuk: hentakan berlapis empat, lalu argo melambat
        {at: C.Jev - 1.30,    nama: 'riser',   gain: 0.26},          // lapis 1
        {at: C.Jev - 0.20,    nama: 'hisap',   gain: 0.26},          // lapis 2
        {at: C.Jev,           nama: 'impact',  gain: 0.44},          // lapis 3 — TITIK-nya
        {at: C.Jev + 0.02,    nama: 'sub',     gain: 0.34},          // lapis 4 — BERAT-nya
        {at: C.Jev + 2.20,    nama: 'sortir',  gain: 0.22, nada: 0},
        {at: C.Jev + 2.75,    nama: 'sortir',  gain: 0.22, nada: 2},
        {at: lega,            nama: 'lega',    gain: 0.30},
        {at: C.Jev + 3.45,    nama: 'sortir',  gain: 0.22, nada: 4},
        {at: C.Jev + 4.95,    nama: 'sortir',  gain: 0.22, nada: 5},
        {at: C.Jev + 5.20,    nama: 'stiker',  gain: 0.22},

        ...tr('Bukti'),
        {at: C.Bukti + 0.80,  nama: 'bar',     gain: 0.20},
        {at: C.Bukti + 2.60,  nama: 'stiker',  gain: 0.22, pan: -0.2},
        {at: C.Bukti + BUKTI_HIJAU, nama: 'kecil', gain: 0.34},
        {at: C.Bukti + BUKTI_HIJAU + 0.2, nama: 'stiker', gain: 0.22, pan: 0.2},

        {at: C.Bonus - 0.32,  nama: 'sapu',    gain: 0.10, nada: 3},
        {at: C.Bonus + 0.05,  nama: 'bonus',   gain: 0.34},
        {at: C.Bonus + 1.30,  nama: 'chat',    gain: 0.24, pan: 0.3},
        {at: C.Bonus + 1.70,  nama: 'chat',    gain: 0.24, pan: 0.3, nada: 3},
        {at: C.Bonus + 2.30,  nama: 'stiker',  gain: 0.24, pan: -0.2},

        ...tr('Cek', 2),
        {at: C.Cek + 2.00,    nama: 'chat',    gain: 0.20},
        {at: C.Cek + 2.30,    nama: 'ketik',   gain: 0.16},
        {at: C.Cek + 3.10,    nama: 'kirim',   gain: 0.24},
        {at: C.Cek + CTA.muncul, nama: 'chat', gain: 0.22, nada: -3},
        {at: C.Cek + CTA.tekan,  nama: 'klik', gain: 0.42},
        {at: total - 0.55,    nama: 'ting',    gain: 0.26},           // sonic logo penutup
      ];
    },

    musik: [{
      nama: 'bgm', luar: !utama, mulai: 0, lewati: utama ? 0 : mulai(REF, 'Hitung') - mulai(varian, 'Hitung'),
      fadeOut: ({total}) => [total - 0.6, 0.6],
      rencana: ({C, total}) => {
        const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
        const inti = ['modern Indonesian pop dangdut koplo instrumental', '128 BPM', 'punchy koplo kendang groove', 'bright suling bamboo flute',
          'plucky synth', 'snappy claps', 'light tambourine', 'glossy TikTok viral production'];
        return [
          b(0, C.Hitung, '[hook]', [...inti, 'instant kendang fill into a catchy 3-note coin-like flute motif', 'no fade in', 'steady and continuous']),
          b(C.Hitung, C.Jadul, '[verse]', [...inti, 'groovy verse', 'ticking hi-hat like a taxi meter', 'energy rising', 'steady and continuous']),
          b(C.Jadul, C.Jev, '[tension]', ['modern Indonesian pop dangdut instrumental', 'tense filtered groove', 'fast ticking hi-hat', 'building tension', 'steady and continuous', 'always present']),
          b(C.Jev, C.Bonus, '[drop and chorus]', [...inti, 'big koplo drop', 'full kendang', 'flute hook', 'happy relief', 'bouncy chorus leaving room for voice']),
          b(C.Bonus, C.Cek, '[lift]', [...inti, 'rising kendang roll', 'sparkle synth', 'celebratory']),
          b(C.Cek, total, '[final chorus]', [...inti, 'final chorus with the 3-note flute hook', 'happy and confident']),
          b(total, total + 6, '[tail]', [...inti, 'final chorus continues', 'steady and continuous']),
        ];
      },
      titik: [
        ['Hook', 0.0, -14], ['Aturan', 0.5, -17],
        ['Jadul', 0.0, -18], ['Jadul', 3.8, -19],
        ['Jev', 0.0, -14], ['Jev', 1.0, -17],
        ['Bonus', 0.0, -15], ['Cek', 0.0, -15],
      ],
    }],

    sampul: {detik: 2.4},                 // tiga bubble ber-tag +Rp356,65 dan stiker hook besar

    mixer: {gainVO: 1.55, gainSFX: 0.74, duckMusik: {th: 0.015, ratio: 14, attack: 25, release: 320}},

    // Titik A/B bus SFX di celah VO: bunyi transisi di awal Hitung dan "+Bonus" sebelum VO 8.
    periksa: {busTitik: [mulai(varian, 'Hitung') + 0.02, mulai(varian, 'Bonus') + 0.06]},
  };
}

// Detik yang dipaku ke kata VO, diukur dari transkrip sesudah `plan`. "bot" terbaca "buat",
// jadi hook makasih memakai "chatbot" (di layar juga).
const HOOK_STIKER = 1.9;                       // stiker hook besar
const BUKTI_HIJAU = 4.7;                       // batang hijau "dan setelahnya"
const CTA = {muncul: 3.25, tekan: 3.9};         // tombol muncul di "Chat", ditekan di "sekarang"
