// Promo Kelas Tracking CTWA — "rahasia agency". 9:16, 45,7 detik. Jalankan: motion all
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {eja} from '../../lib/lafal.mjs';
//
// Sumber brief: src/prompt.md. Keputusan yang menyimpang dari brief, beserta sebabnya:
//
// 1. MUSIK DARI SUNO. Trek mentah di aset/suno-mentah.mp3; `python3 bgm.py` memotongnya
//    ke timeline jadi aset/suno.mp3 (break di Bisik, drop di Wulan). Jalankan ulang tiap
//    `plan` mengubah durasi. `luar: true` mencegah `motion music` menimpanya.
//
// 2. SUARA CAHAYA, bukan Voice Design + Eleven v3 seperti brief. Satu merek satu suara
//    (IKLAN.md §3), dan v3 terukur 31% lebih lambat serta mengabaikan `speed`
//    (proyek/ctwa-konektor). Akibatnya tag [whispers] tidak ada; bisikan dibawa tanda baca.
//
// 3. MEDIA. V1 dan V2 digenerate (`node gambar.mjs`), V3 memakai iklan U1 yang asli.
//    V4 (screenshot Events Manager) dan V5 (rekaman layar MCP) WAJIB asli menurut brief dan
//    belum ada. Selama berkasnya belum ditaruh di src/media/, komposisi menggambar kartu
//    pengganti tanpa merek Meta. Taruh berkas aslinya dan render ulang; tidak ada kode yang
//    perlu diubah.
//
// 4. CTA. VO berbunyi "Daftar lewat WhatsApp", sama persis dengan tombolnya (IKLAN.md §4).
//    Brief menulis "Daftar lewat chat aku".
//
// 6. CTA jadi kalimat TERAKHIR (permintaan Rama): baris brief "Sekarang kamu tahu
//    rahasianya" dibuang supaya penonton tahu langkahnya. Bonus Konektor disebut GRATIS.
//
// 5. "Itu rahasianya" dipindah ke Feedback+4,15, supaya jatuh bersama kartu bukti (4,20)
//    dan hentakan berlapis empat. Brief menaruhnya 0,5 detik lebih awal, di layar kosong.
const SUNO = fileURLToPath(new URL('./aset/suno.mp3', import.meta.url));

export default {
  nama: 'kelas-ctwa-rahasia',
  komposisi: 'Promo Kelas CTWA v4.dc.html',
  jsx: 'ctwa-v4.jsx',
  kapsi: true,                                  // 12 kapsi = 12 baris VO; layar menampilkan 5-12
  keluaran: 'rama-digital-kelas-ctwa-rahasia-9x16.mp4',

  // Baris CTA (12) dibaca sedikit lebih lambat supaya tiap katanya menghentak.
  suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260926, speed: (l) => (l.no === 12 ? 1.05 : 1.20),
          stability: 0.14, similarity: 0.80, style: 0.72},

  // Teks layar tidak disentuh. `ctwa_clid` harus di atas `ctwa`: penggantian jalan urut.
  // ctwa_clid dibaca "ce-te-we-a-ce-el-ai-di" (keputusan Rama, 26 Sep 2026), BUKAN "klid".
  // "Ai Di" meniru pola TLD `.id` yang sudah terbukti; "I D" dibaca "i de".
  lafal: {
    ctwa_clid: `${eja('CTWA CL')} Ai Di`,
    ctwa: eja('CTWA'),
    capi: 'Kapi',
    mcp: eja('MCP'),
    claude: 'Klode',
    'Rp 179 ribu': 'seratus tujuh puluh sembilan ribu',
    gratis: 'gratis',
  },

  // Teksnya sama persis dengan `const caps` di ctwa-v4.jsx.
  vo: [
    {no: 1,  sc: 'Hook',     off: 0.10, text: 'Ini yang agency besar rahasiakan dari kamu.'},
    {no: 2,  sc: 'Boncos',   off: 0.10, text: 'Mereka iklan CTWA, tapi kok gak boncos? Gimana caranya?'},
    {no: 3,  sc: 'Bisik',    off: 0.25, text: 'Sini, sini... aku kasih tau.'},
    {no: 4,  sc: 'Wulan',    off: 0.15, text: 'Kenalin, aku Wulan, AI dari Rama Digital.'},
    {no: 5,  sc: 'Journey',  off: 0.30, text: 'Journey CTWA: klik iklan, chat, beli.'},
    {no: 6,  sc: 'Clid',     off: 0.30, text: 'Tiap chat dari iklan bawa kode: ctwa_clid.'},
    {no: 7,  sc: 'Clid',     off: 3.10, text: 'Kode asal iklan.'},
    {no: 8,  sc: 'Feedback', off: 0.40, text: 'Pas dia beli, kodenya balik ke Meta lewat CAPI.'},
    {no: 9,  sc: 'Feedback', off: 4.15, text: 'Itu rahasianya. Meta jadi belajar dari pembeli.'},
    {no: 10, sc: 'Kelas',    off: 0.30, text: 'Di kelas, Mas Ari ajarin caranya, plus Meta Ads pakai Claude.'},
    {no: 11, sc: 'Daftar',   off: 0.30, text: 'Kelas Tracking CTWA, Rp 179 ribu, plus Konektor GRATIS!'},
    // CTA baris sendiri, kalimat terakhir. Intonasi dinaikkan: style 0,95, stability 0,05.
    {no: 12, sc: 'Daftar',   off: 4.60, style: 0.95, stability: 0.05, text: 'Daftar lewat WhatsApp, sekarang!'},
  ],

  // Semua beat di ctwa-v4.jsx scene-relatif (`at + n`), jadi scene hanya boleh memanjang.
  // Daftar ditutup kartu yang menahan sampai frame terakhir, jadi ekornya pendek.
  tata: {mode: 'jangkar', jeda: 0.14, ekorBiasa: 0.30, ekor: {Daftar: 1.20}},

  // Nada kartun-pop, cocok dengan stiker bergaris tebal. Kering semua: reverb jadi lumpur
  // di speaker HP.
  sfx: [
    ['stamp',   0.8, 'one heavy rubber stamp thump on a wooden desk, short punchy low knock, dry close-mic, no reverb, no music, single hit'],
    ['pop',     0.5, 'one bright cartoon bubble pop, short and round, playful, dry close-mic, no reverb, no music, single pop'],
    // Transisi dibuat LEMBUT: whoosh cepat yang cerah dilaporkan "kasar, bikin gak fokus".
    ['whoosh',  0.6, 'one very soft gentle airy swish, smooth and muted, warm, no harsh high frequencies, no hiss, dry, no reverb, no music, single motion'],
    ['scratch', 1.2, 'a short comedic vinyl record scratch followed by a springy cartoon boing, playful, dry, no reverb, no music, single event'],
    ['slide',   0.9, 'one quizzical cartoon slide whistle rising upward, short and funny, dry, no reverb, no music, single event'],
    ['shhh',    1.0, 'one soft intimate close-mic shhh whisper, gentle breath, dry, no reverb, no music, single event'],
    ['sparkle', 1.2, 'a short magical sparkle chime, bright twinkling bell shimmer, dry, no reverb, no music, single event'],
    ['uipop',   0.4, 'one soft modern user interface pop, rounded and warm, short click-pop, dry, no reverb, no music, single hit'],
    ['blip',    0.8, 'a quick run of tiny digital blip ticks moving fast, light and precise, dry, no reverb, no music, single run'],
    ['zoom',    0.8, 'a soft smooth low whoosh gliding inward, muted and warm, no harsh high frequencies, no hiss, dry, no reverb, no music, single motion'],
    ['slap',    0.8, 'a sticker slapped onto a table with a bright little ding right after, playful, dry close-mic, no reverb, no music, single event'],
    ['zip',     1.2, 'a zippy digital zip sweeping upward in pitch, fast and clean, like data flying away, dry, no reverb, no music, single sweep'],
    ['chime',   1.0, 'a positive notification chime, two rising bright notes, clean and friendly, dry, no reverb, no music, single event'],
    ['ketik',   1.2, 'a short burst of fast laptop keyboard typing, light plastic keys, dry close-mic, no reverb, no music, single burst'],
    ['klik',    0.5, 'one chunky satisfying button click, solid plastic press, dry close-mic, no reverb, no music, single click'],
    ['kaching', 1.0, 'one short cash register ka-ching bell, bright and happy, dry, no reverb, no music, single event'],
    ['riser',   1.6, 'a quick rising tension riser, bright synth air building in pitch, no impact at the end, no drums, dry, no reverb'],
    ['hisap',   0.6, 'one short reverse whoosh sucking inward and stopping abruptly, no impact, dry, no reverb, no music, single motion'],
    ['impact',  0.8, 'one tight punchy cinematic impact hit, sharp transient, short tail, dry, no reverb, no music, single hit'],
    ['sub',     1.5, 'one deep sub bass drop boom decaying smoothly, low and heavy, no transient click, dry, no music, single hit'],
  ],

  // Dipaku ke beat animasi di ctwa-v4.jsx. Panel baru meluncur masuk di (scene - 0,35).
  // Satu hentakan dilapis penuh, sekali: kartu bukti di Feedback+4,20 (IKLAN.md §2).
  cue: ({C, total}) => [
    // Hook — gambar sudah jadi di frame 0; balok hitam menutup "rahasiakan"
    {at: 0.02,           nama: 'whoosh', gain: 0.12},
    {at: C.Hook + 1.10,  nama: 'stamp',  gain: 0.46},
    {at: C.Hook + 1.70,  nama: 'uipop',  gain: 0.22},
    {at: C.Hook + 2.20,  nama: 'pop',    gain: 0.34, pan: 0.3},

    // Boncos
    {at: C.Boncos - 0.35, nama: 'whoosh',  gain: 0.12},
    {at: C.Boncos + 2.25, nama: 'scratch', gain: 0.40},
    {at: C.Boncos + 3.20, nama: 'slide',   gain: 0.30, pan: -0.2},

    // Bisik — bisikan
    {at: C.Bisik - 0.35, nama: 'whoosh', gain: 0.12, nada: -3},
    {at: C.Bisik - 0.10, nama: 'shhh',   gain: 0.20},

    // Wulan
    {at: C.Wulan - 0.35, nama: 'whoosh',  gain: 0.12},
    {at: C.Wulan + 0.10, nama: 'sparkle', gain: 0.34},
    {at: C.Wulan + 0.45, nama: 'pop',     gain: 0.30, pan: 0.3, nada: 2},
    {at: C.Wulan + 1.20, nama: 'pop',     gain: 0.30, pan: -0.3},

    // Journey — tiga node naik nada, titik berjalan turun
    {at: C.Journey - 0.35, nama: 'whoosh', gain: 0.12},
    {at: C.Journey + 0.60, nama: 'uipop',  gain: 0.34, nada: 0},
    {at: C.Journey + 1.40, nama: 'uipop',  gain: 0.34, nada: 3},
    {at: C.Journey + 2.20, nama: 'uipop',  gain: 0.36, nada: 7},
    {at: C.Journey + 2.40, nama: 'blip',   gain: 0.18},

    // Clid — zoom ke chat, label menempel
    {at: C.Clid - 0.20, nama: 'zoom', gain: 0.12},
    {at: C.Clid + 2.40, nama: 'slap', gain: 0.40},
    {at: C.Clid + 3.20, nama: 'pop',  gain: 0.28, pan: -0.3},

    // Feedback — LUNAS, kode balik ke Meta, lalu bukti
    {at: C.Feedback - 0.20, nama: 'zoom',   gain: 0.12, nada: -2},
    {at: C.Feedback + 0.80, nama: 'stamp',  gain: 0.44, nada: 2},
    {at: C.Feedback + 1.40, nama: 'zip',    gain: 0.30, pan: 0.3},
    {at: C.Feedback + 2.50, nama: 'pop',    gain: 0.28, pan: 0.4},
    {at: C.Feedback + 2.80, nama: 'blip',   gain: 0.18, nada: 2},
    {at: C.Feedback + 2.90, nama: 'riser',  gain: 0.30},           // lapis 1 dari 4
    {at: C.Feedback + 4.00, nama: 'hisap',  gain: 0.34},           // lapis 2
    {at: C.Feedback + 4.20, nama: 'impact', gain: 0.56},           // lapis 3 — TITIK-nya
    {at: C.Feedback + 4.22, nama: 'sub',    gain: 0.42},           // lapis 4 — BERAT-nya
    {at: C.Feedback + 4.55, nama: 'chime',  gain: 0.20},
    {at: C.Feedback + 4.70, nama: 'pop',    gain: 0.30, pan: 0.3},
    {at: C.Feedback + 4.80, nama: 'uipop',  gain: 0.22, nada: 3},
    {at: C.Feedback + 5.05, nama: 'uipop',  gain: 0.22, nada: 5},

    // Kelas — Mas Ari, demo chat
    {at: C.Kelas - 0.35, nama: 'whoosh', gain: 0.12},
    {at: C.Kelas + 0.50, nama: 'pop',    gain: 0.26, pan: -0.3},
    {at: C.Kelas + 1.20, nama: 'pop',    gain: 0.24, nada: -2},
    {at: C.Kelas + 1.60, nama: 'uipop',  gain: 0.30, pan: 0.3},
    {at: C.Kelas + 1.80, nama: 'ketik',  gain: 0.24, pan: 0.3},
    {at: C.Kelas + 2.40, nama: 'pop',    gain: 0.24, pan: 0.3, nada: 3},
    {at: C.Kelas + 3.50, nama: 'blip',   gain: 0.16, pan: 0.3},

    // Daftar — dua sesi, harga, tombol ditekan
    {at: C.Daftar - 0.35, nama: 'whoosh',  gain: 0.12},
    {at: C.Daftar + 0.60, nama: 'pop',     gain: 0.24, pan: 0.3},
    {at: C.Daftar + 0.90, nama: 'slap',    gain: 0.30, pan: -0.3},
    {at: C.Daftar + 1.10, nama: 'slap',    gain: 0.30, pan: 0.3, nada: 2},
    {at: C.Daftar + 1.90, nama: 'kaching', gain: 0.30},
    {at: C.Daftar + 4.60, nama: 'slap',    gain: 0.36, pan: 0.3, nada: 3},   // GRATIS!
    {at: C.Daftar + 4.65, nama: 'sparkle', gain: 0.30, pan: 0.3},
    {at: C.Daftar + 5.50, nama: 'uipop',   gain: 0.34},                     // tombol
    {at: C.Daftar + 7.15, nama: 'klik',    gain: 0.44},
    {at: total - 0.55,    nama: 'whoosh',  gain: 0.12, nada: -2},
  ],

  /* Trek Suno. Taruh di aset/suno.mp3, sudah dipotong ke durasi video dan mulai tanpa
     hening. Amplop rata di -14 dB dengan SATU tukikan disengaja di Bisik, supaya bisikan
     terdengar jelas dan drop di Wulan terasa (IKLAN.md §1). Tukikannya cuma -18: break
     BGM di situ sudah membuang bass, dan -24 di atasnya terukur -50 dB, bed bolong 2 detik. */
  musik: existsSync(SUNO) ? [{
    nama: 'suno', luar: true, mulai: 0,
    fadeOut: ({total}) => [total - 0.6, 0.6],
    titik: [
      ['Hook', 0.0, -13], ['Boncos', 2.3, -14],
      ['Bisik', 0.1, -18], ['Bisik', 2.6, -18],
      ['Wulan', 0.0, -14], ['Journey', 0.6, -18],
      ['Kelas', 0.0, -17], ['Daftar', 0.0, -15],
    ],
  }] : [],

  // Sampul kustom: kartu bukti sudah mendarat dan stiker "ini rahasianya" terbaca.
  sampul: {detik: 0},

  // Duck lebih dalam: pada th 0,03 ratio 8 VO cuma +5,7 dB di atas musik, dilaporkan "BGM kegedean".
  mixer: {gainVO: 1.55, gainSFX: 0.74, duckMusik: {th: 0.015, ratio: 14, attack: 25, release: 320}},

  // Titik A/B bus SFX di celah VO: bus yang sehat terbaca 0,0 dB kalau VO sedang bicara.
  periksa: {busTitik: [2.8, 18.2]},
};
