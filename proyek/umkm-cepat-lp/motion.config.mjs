// UMKM Cepat — "trik rahasia freelancer landing page". 9:16, ±40 detik. Jalankan: motion all
import {eja} from '../../lib/lafal.mjs';
//
// Sumber brief: src/prompt.md. Keputusan yang menyimpang dari brief, beserta sebabnya:
//
// 1. SUARA YOGA (`ZVrEtGeSUGWD8ZxwiQFj`), cowok muda, label `conversational`. Rama meminta
//    suara cowok Indonesia yang "mengajak banget, seolah berbagi trik rahasia". Diukur pada
//    kalimat hook, speed 1,15: Yoga 21,0 · Galih 18,7 · Senandika 17,9 · Jonathan 16,5 ·
//    Ganesh 24,4 kar/dtk (Ganesh berlabel `informative_educational`, terlalu penyiar).
//
// 2. MODEL multilingual v2, BUKAN Eleven v3 seperti brief. v3 terukur 31% lebih lambat dan
//    mengabaikan `speed` (proyek/ctwa-konektor), dan brief menuntut tempo ngebut. Akibatnya
//    tag [whispers] dan [chuckles] tidak ada. Nada "bocorin rahasia" dibawa naskah ("Sini,
//    aku bocorin"), tanda baca, dan speed yang diturunkan pada dua baris bisikan.
//
// 3. Kapsi Hook dan CTA dikosongkan (text null): layar sudah menulis kalimatnya besar-besar,
//    dan kapsi yang mengulangnya ikut jadi sampul (IKLAN.md §5).
//
// 4. Brief menaruh "Kirim" di Prompt 11,3-16,7, tetapi klik tombol kirim di komposisi jatuh
//    di Prompt+6,1 — sesudah scene berakhir di 5,5. VO "Kirim." dipaku ke Prompt+5,95,
//    jadi scene Prompt memanjang dan kliknya terlihat.
//
// 5. CTA VO "Mau tau tools-nya?" sama persis dengan judul layar (IKLAN.md §4). Brief
//    menulis "Mau tools-nya?".
const BISIK = new Set([2, 4, 13]);

const HINDARI = ['vocals', 'lyrics', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
  'distorted 808', 'silence', 'empty gaps', 'fade out', 'corporate stock music'];

/* Cara aset/musik.mp3 dibuat. Pasang di `musik` dengan `nama: 'musik'` untuk membuatnya ulang,
   lalu jalankan bgm.sh. */
const SUMBER_MUSIK = {
  nama: 'musik',
  detik: ({total}) => total + 12,
  rencana: ({C, total}) => {
    const bagian = (dari, sampai, teks, gaya) => ({detik: sampai - dari, teks, gaya, hindari: HINDARI});
    const DASAR = ['sneaky mischievous plucked synth hook', 'fast crisp hi-hat rolls', 'finger snaps',
      'viral tiktok creator beat', '128 bpm', 'instrumental'];
    return [
      bagian(0, C.Reveal, '[intro]',
        [...DASAR, 'starts instantly on beat one', 'tense filtered groove', 'insistent repeating pluck motif', 'always present']),
      bagian(C.Reveal, C.Speed, '[drop]',
        [...DASAR, 'big drop, full drums', 'bouncy driving groove', 'small fills every 4 bars', 'playful and confident']),
      bagian(C.Speed, C.Payoff, '[verse]',
        [...DASAR, 'driving bouncy groove continues', 'forward motion', 'steady and continuous']),
      bagian(C.Payoff, C.CTA, '[chorus]',
        [...DASAR, 'brighter victorious lift', 'wide claps', 'energy rising']),
      bagian(C.CTA, total, '[outro]',
        [...DASAR, 'pluck hook carries', 'lighter drums but still grooving', 'stays present to the last bar']),
      bagian(total, total + 12, '[tail]', [...DASAR, 'closing phrase']),
    ];
  },
};

export default {
  nama: 'umkm-cepat-lp',
  komposisi: 'Video LP UMKM Cepat.dc.html',
  jsx: 'lp-video.jsx',
  kapsi: true,                                  // 15 kapsi = 15 baris VO; 4 di antaranya kosong
  keluaran: 'umkm-cepat-lp-rahasia-9x16.mp4',

  // Stability rendah + style tinggi: ayunan nada yang membuat suaranya terdengar mengajak,
  // bukan membaca (IKLAN.md §3). Dua baris bisikan dibaca lebih pelan.
  suara: {id: 'ZVrEtGeSUGWD8ZxwiQFj', seed: 20260926, speed: (l) => (BISIK.has(l.no) ? 1.10 : 1.20),
          stability: 0.18, similarity: 0.80, style: 0.70},

  // Teks layar tidak disentuh.
  lafal: {
    'landing page': 'lending pejj',
    umkm: eja('UMKM'),
    whatsapp: 'wasap',
    client: 'klien',
    happy: 'hepi',
    'tools-nya': 'tuls-nya',
    'loading-nya': 'loding-nya',
    lp: 'El Pe',
  },

  // Teksnya sepadan dengan `const caps` di src/lp-video.jsx, urut sama.
  vo: [
    {no: 1,  sc: 'Hook',   off: 0.10, maks: 3.0, text: 'Client bayar aku dua setengah juta buat landing page.'},
    {no: 2,  sc: 'Hook',   off: 3.00, maks: 1.7, text: 'Yang mereka gak tau...'},
    {no: 3,  sc: 'Client', off: 0.30, maks: 2.5, text: 'Mereka kira aku begadang tiga hari.'},
    {no: 4,  sc: 'Client', off: 2.90, maks: 1.5, text: 'Sini, aku bocorin...'},
    {no: 5,  sc: 'Reveal', off: 0.15, maks: 2.4, text: 'Aku cuma pakai ini. UMKM Cepat!'},
    {no: 6,  sc: 'Prompt', off: 0.30, maks: 2.8, text: 'Tinggal ceritain usahanya, kayak chat biasa.'},
    {no: 7,  sc: 'Prompt', off: 5.95, maks: 0.8, text: 'Kirim.'},
    {no: 8,  sc: 'Build',  off: 0.30, maks: 3.2, text: 'Desain, tulisan, menu, tombol WhatsApp, langsung jadi!'},
    {no: 9,  sc: 'Build',  off: 4.50, maks: 1.6, text: 'Gak sampai lima menit!'},
    {no: 10, sc: 'Speed',  off: 0.30, maks: 1.6, text: 'Dan loading-nya cepet,'},
    {no: 11, sc: 'Speed',  off: 2.80, maks: 2.1, text: 'jadi yang klik iklan gak keburu kabur.'},
    {no: 12, sc: 'Payoff', off: 0.30, maks: 1.8, text: 'Client happy, aku happy.'},
    {no: 13, sc: 'Payoff', off: 2.20, maks: 1.9, text: 'Kerjanya? Lima menit.'},
    {no: 14, sc: 'CTA',    off: 0.15, maks: 1.4, text: 'Mau tau tools-nya?'},
    {no: 15, sc: 'CTA',    off: 1.50, maks: 1.9, text: 'Komen LP, aku kirim link-nya!'},
  ],

  // Semua beat di lp-video.jsx scene-relatif (`C.X + n`), jadi scene hanya boleh memanjang.
  // CTA ditutup kartu yang menahan sampai frame terakhir.
  tata: {mode: 'jangkar', jeda: 0.12, ekorBiasa: 0.25, ekor: {CTA: 1.10}},

  // Kering semua: reverb jadi lumpur di speaker HP. Whoosh transisi lembut (IKLAN.md §1).
  sfx: [
    ['slam',    0.9, 'one heavy cinematic impact slam with a cash register cha-ching layered on top, punchy, dry, no reverb, no music, single hit'],
    ['whoosh',  0.6, 'one very soft gentle airy swish, smooth and muted, warm, no harsh high frequencies, no hiss, dry, no reverb, no music, single motion'],
    ['up',      0.5, 'one quick short upward whoosh, light and soft, dry, no reverb, no music, single motion'],
    ['ding',    0.6, 'one soft modern notification ding, clean and friendly, dry, no reverb, no music, single event'],
    ['tick',    0.3, 'one soft short user interface tick pop, tiny and rounded, dry, no reverb, no music, single tick'],
    ['tape',    0.9, 'one low secretive hit with a tape stop slowing down, sneaky, dry, no reverb, no music, single event'],
    ['masuk',   0.4, 'one phone message received pop, bubbly, short, dry, no reverb, no music, single pop'],
    ['kirim',   0.4, 'one light message sent swoosh, short and soft, dry, no reverb, no music, single event'],
    ['riser',   1.4, 'a quick rising tension riser, bright synth air building in pitch, no impact at the end, no drums, dry, no reverb'],
    ['hisap',   0.6, 'one short reverse whoosh sucking inward and stopping abruptly, no impact, dry, no reverb, no music, single motion'],
    ['impact',  0.8, 'one tight punchy cinematic impact hit, sharp transient, short tail, dry, no reverb, no music, single hit'],
    ['sub',     1.5, 'one deep sub bass drop boom decaying smoothly, low and heavy, no transient click, dry, no music, single hit'],
    ['zoom',    0.7, 'a soft smooth low whoosh gliding inward, muted and warm, no harsh high frequencies, no hiss, dry, no reverb, no music, single motion'],
    ['ketik',   2.5, 'very fast laptop keyboard typing, light clicky plastic keys, continuous burst, dry close-mic, no reverb, no music'],
    ['klik',    0.3, 'one crisp single mouse click, dry close-mic, no reverb, no music, single click'],
    ['pop',     0.4, 'one bright cartoon bubble pop, short and round, playful, dry close-mic, no reverb, no music, single pop'],
    ['stopwatch', 2.5, 'a fast ticking stopwatch accelerating, light mechanical ticks, dry, no reverb, no music'],
    ['sukses',  0.9, 'one stopwatch click followed by a bright success chime, two rising notes, dry, no reverb, no music, single event'],
    ['zip',     0.5, 'one super fast zippy swoosh, clean digital zip, dry, no reverb, no music, single sweep'],
    ['ping',    0.4, 'one bright short positive ping, clean bell tone, dry, no reverb, no music, single event'],
    ['buzz',    0.5, 'one soft low error buzz, short, muted, dry, no reverb, no music, single event'],
    ['stamp',   0.6, 'one heavy rubber stamp thud on a wooden desk, short punchy low knock, dry close-mic, no reverb, no music, single hit'],
    ['kaching', 0.9, 'one short cash register ka-ching bell, bright and happy, dry, no reverb, no music, single event'],
    ['tap',     0.4, 'two soft quick phone keyboard taps, dry close-mic, no reverb, no music'],
    ['sparkle', 1.0, 'a short magical sparkle chime, bright twinkling bell shimmer, dry, no reverb, no music, single event'],
  ],

  // Dipaku ke beat animasi di src/lp-video.jsx. Satu hentakan dilapis penuh, sekali:
  // reveal UMKM Cepat (IKLAN.md §2).
  cue: ({C, P, total}) => [
    // Hook — Rp2,5 JT dibanting di frame 0, lalu terlempar ke atas
    {at: 0.00,          nama: 'slam',   gain: 0.46},
    {at: C.Hook + 1.02, nama: 'up',     gain: 0.20},
    {at: C.Hook + 1.20, nama: 'ding',   gain: 0.26, pan: -0.2},
    {at: C.Hook + 1.30, nama: 'tick',   gain: 0.18, nada: 0},
    {at: C.Hook + 1.55, nama: 'tick',   gain: 0.18, nada: 2},
    {at: C.Hook + 1.80, nama: 'tick',   gain: 0.18, nada: 4},
    {at: C.Hook + 3.00, nama: 'tape',   gain: 0.34},

    // Client — wipe masuk, chat bergantian
    {at: C.Client - 0.30, nama: 'whoosh', gain: 0.12},
    {at: C.Client + 0.50, nama: 'masuk',  gain: 0.24, pan: -0.3},
    {at: C.Client + 1.70, nama: 'kirim',  gain: 0.22, pan: 0.3},
    {at: C.Client + 3.00, nama: 'masuk',  gain: 0.24, pan: -0.3, nada: 1},
    {at: C.Client + 4.30, nama: 'kirim',  gain: 0.22, pan: 0.3, nada: 1},

    // Reveal — hentakan berlapis empat, satu-satunya di video ini
    {at: C.Reveal - 1.30, nama: 'riser',  gain: 0.24},             // lapis 1
    {at: C.Reveal - 0.20, nama: 'hisap',  gain: 0.30},             // lapis 2
    {at: C.Reveal + 0.00, nama: 'impact', gain: 0.52},             // lapis 3 — TITIK-nya
    {at: C.Reveal + 0.02, nama: 'sub',    gain: 0.38},             // lapis 4 — BERAT-nya
    {at: C.Reveal + 0.35, nama: 'sparkle', gain: 0.16, pan: 0.2},

    // Prompt — zoom ke kotak input, ketik, klik kirim
    {at: C.Prompt + 0.00, nama: 'zoom',  gain: 0.12},
    {at: C.Prompt + 0.95, nama: 'ketik', gain: 0.20, pan: 0.15},
    {at: C.Prompt + 3.40, nama: 'ketik', gain: 0.18, pan: 0.15, nada: 1},
    {at: C.Prompt + 6.10, nama: 'klik',  gain: 0.44},
    {at: C.Prompt + 6.30, nama: 'stopwatch', gain: 0.12, pan: -0.4},

    // Build — website tersusun, timer berhenti di 04:52
    {at: C.Build - 0.05, nama: 'impact', gain: 0.22, nada: 3},
    {at: C.Build + 0.50, nama: 'pop', gain: 0.20, nada: 0},
    {at: C.Build + 1.50, nama: 'pop', gain: 0.22, nada: 2, pan: -0.2},
    {at: C.Build + 3.30, nama: 'pop', gain: 0.22, nada: 4, pan: 0.2},
    {at: C.Build + 3.74, nama: 'pop', gain: 0.22, nada: 6, pan: -0.2},
    {at: C.Build + 4.18, nama: 'pop', gain: 0.22, nada: 8, pan: 0.2},
    {at: C.Build + 5.30, nama: 'pop', gain: 0.30, nada: 10},        // tombol WA
    {at: C.Build + 6.00, nama: 'sukses', gain: 0.32},                // timer berhenti

    // Speed — LP biasa loading pelan, UMKM Cepat langsung tampil
    {at: C.Speed - 0.30, nama: 'whoosh', gain: 0.12, nada: -2},
    {at: C.Speed + 1.30, nama: 'zip',    gain: 0.28, pan: 0.35},
    {at: C.Speed + 1.90, nama: 'ping',   gain: 0.26, pan: 0.35},
    {at: C.Speed + 5.00, nama: 'buzz',   gain: 0.24, pan: -0.35},

    // Payoff — invoice dicap LUNAS
    {at: C.Payoff - 0.30, nama: 'whoosh',  gain: 0.12},
    {at: C.Payoff + 1.40, nama: 'stamp',   gain: 0.46},
    {at: C.Payoff + 1.50, nama: 'kaching', gain: 0.28},

    // CTA — ketik "LP", komentar terkirim
    {at: C.CTA - 0.30, nama: 'whoosh',  gain: 0.12, nada: 2},
    {at: C.CTA + 1.40, nama: 'tap',     gain: 0.30},
    {at: C.CTA + 2.30, nama: 'pop',     gain: 0.30, nada: 3},
    {at: C.CTA + 2.90, nama: 'sparkle', gain: 0.24},
    {at: total - 0.50, nama: 'whoosh',  gain: 0.10, nada: -2},
  ],

  /* Musik per bagian, dipatok ke batas scene (IKLAN.md §1). Tenaga "sneaky trap" brief
     dibawa pluck, hi-hat, dan snap — bukan 808: kick dan sub yang memimpin menimbun VO.
     Bagian `[tail]` di ujung tidak pernah terdengar; dia menampung fade-out generator. */
  /* Trek dari aset/musik.mp3 (dibuat oleh SUMBER_MUSIK di atas), digeser oleh bgm.sh supaya
     drop-nya jatuh di Reveal. Generator menaruh drop di detik 14,975, bukan di batas
     bagian [drop] 9,90 yang diminta. `luar: true` mencegah `motion music` menimpanya.
     Trek mentah naik 11 dB di drop: amplop di bawah mengompensasi, bukan menambah arc. */
  musik: [{
    nama: 'bgm', luar: true, mulai: 0,
    titik: [
      ['Hook', 0.0, -11], ['Client', 3.0, -11],
      ['Reveal', 0.0, -17], ['Prompt', 0.0, -18],
      ['Build', 0.0, -18], ['Speed', 0.0, -18], ['Payoff', 0.0, -17], ['CTA', 0.0, -18],
    ],
    fadeOut: ({total}) => [total - 0.6, 0.6],
  }],

  // Sampul kustom: kartu "Ini yang mereka gak tau…" sudah terbaca.
  sampul: {detik: 3.6},

  // Kick trek ini -8 dBFS di puncaknya; subG menjaganya di bawah pita bicara VO (IKLAN.md §1).
  mixer: {gainVO: 1.60, gainSFX: 0.80, duckMusik: {th: 0.02, ratio: 10, attack: 25, release: 300}, bedMusik: {subG: -6}},

  // Titik A/B bus SFX di celah VO: bus yang sehat terbaca 0,0 dB kalau VO sedang bicara.
  periksa: {busTitik: [8.6, 18.0]},
};
