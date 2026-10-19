// Skenario travel umroh: dari iklan sampai DP. 16:9, 14 scene, ±180 dtk.
// Suara sama dengan seri Konektor (preset C). Naskah: naskah.md. Struktur salinan tutorial-meta-capi.
import {readFileSync} from 'node:fs';
import {eja} from '../../lib/lafal.mjs';

// Kata VO berstempel waktu (aset/kata.json, dari kata.mjs): animasi dan bunyi jatuh di kata, bukan di tebakan detik.
const KATA = JSON.parse(readFileSync(new URL('./aset/kata.json', import.meta.url), 'utf8'));
const norm = (w) => w.toLowerCase().replace(/[^\w]/g, '');
const mulaiKata = (no, kata, k = 0) => {
  const key = String(kata).toLowerCase();
  let n = 0;
  for (const [w, t] of KATA[no].words.map((x) => [norm(x[0]), x[1]])) if (w.startsWith(key) || (key.startsWith(w) && w.length > 2)) { if (n++ === k) return t; }
  throw new Error(`kata "${kata}" tidak ada di baris ${no}`);
};

export default {
  nama: 'skenario-umroh',
  komposisi: 'Skenario Umroh.dc.html',
  jsx: 'skenario-umroh.jsx',
  kapsi: false,
  keluaran: 'skenario-umroh.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  // Kunci terpanjang di atas. Hanya cara baca; teks layar tidak disentuh.
  lafal: {'Click-to-WhatsApp': 'Klik tu wasap', WhatsApp: 'wasap', AI: 'ei-ai', CTWA: eja('CTWA'), CS: eja('CS')},

  vo: [
    {no: 1,  sc: 'Hook',     off: 0.30, text: 'Tiga ratus chat dari iklan umroh. Tapi Meta tidak tahu, siapa yang akhirnya DP.'},
    {no: 2,  sc: 'Hook',     off: 5.40, text: 'Di video ini, kita ikuti satu calon jamaah, dari klik iklan sampai DP terkirim balik ke Meta.'},
    {no: 3,  sc: 'Masalah',  off: 0.50, text: 'Calon jamaah tidak langsung daftar. Tanya paket, minta brosur, diskusi keluarga, baru DP.'},
    {no: 4,  sc: 'Masalah',  off: 7.60, text: 'Selama itu, Meta cuma melihat satu hal: siapa yang chat.'},
    {no: 5,  sc: 'Masalah',  off: 11.70, text: 'Jadi iklan makin jago mencari orang yang suka bertanya. Bukan yang berangkat.'},
    {no: 6,  sc: 'Klik',     off: 0.60, text: 'Kenalkan, Bu Rina. Kamis malam, ia klik iklan paket Januari, lalu chat lewat WhatsApp.'},
    {no: 7,  sc: 'Klik',     off: 7.60, text: 'Konektor langsung mencatatnya sebagai lead baru, lengkap dengan data iklan asalnya.'},
    {no: 8,  sc: 'Malam',    off: 0.90, text: 'Jam sepuluh malam, tim sudah pulang. AI Agent yang membalas.'},
    {no: 9,  sc: 'Malam',    off: 5.40, text: 'Jawabannya diambil dari Pengetahuan yang kamu isi: jadwal, hotel, dan harga paket.'},
    {no: 10, sc: 'Malam',    off: 11.20, text: 'Lalu ia bertanya balik: berangkat berapa orang, rencana bulan apa?'},
    {no: 11, sc: 'Serah',    off: 1.40, text: 'Begitu Bu Rina tanya cara bayar DP, AI berhenti, dan menyerahkan chat ke tim.'},
    {no: 12, sc: 'Status',   off: 1.00, text: 'Paginya, CS melanjutkan. Statusnya naik: Merespons, lalu Berkualitas.'},
    {no: 13, sc: 'Hot',      off: 0.60, text: 'Seminggu kemudian, Bu Rina menulis: kami mau daftar berdua.'},
    {no: 14, sc: 'Hot',      off: 4.90, text: 'Aturan Otomatisasi membaca kalimat itu, dan mengubah status ke Hot. Sendiri.'},
    {no: 15, sc: 'DP',       off: 0.80, text: 'Tagihan DP dikirim. DP masuk. CS pilih Closing, lalu isi harga paketnya.'},
    {no: 16, sc: 'Purchase', off: 0.50, dengar: /diterima|di terima/i, coba: 4, text: 'Detik itu juga, Konektor mengirim Purchase ke Meta, dengan nilai dan iklan asalnya. Diterima!'},
    {no: 17, sc: 'Inti',     off: 0.60, text: 'Jadi, iklan belajar dari jamaah yang DP, bukan dari yang sekadar bertanya.'},
    {no: 18, sc: 'Setup',    off: 0.50, text: 'Setupnya enam langkah.'},
    {no: 19, sc: 'Setup',    off: 2.50, text: 'Sambungkan WhatsApp dan Meta, hubungkan iklan Click-to-WhatsApp, lalu atur Closing jadi Purchase.'},
    {no: 20, sc: 'Setup',    off: 8.50, text: 'Isi Pengetahuan untuk AI Agent, atur Serah ke tim, lalu pasang aturan Hot.'},
    {no: 21, sc: 'Harapan',  off: 0.60, text: 'Minggu pertama, rapikan status. Minggu kedua sampai keempat, DP pertama mulai mengajari iklan.'},
    {no: 22, sc: 'Harapan',  off: 6.90, text: 'Naikkan budget saat DP masuk tiap minggu, dan biaya per jamaah masih aman. Bertahap, bukan sekaligus.'},
    {no: 23, sc: 'Musim',    off: 0.50, text: 'Satu lagi: visa umroh musim ini terakhir terbit sembilan Maret. Paket Ramadan dijual dari sekarang.'},
    {no: 24, sc: 'Outro',    off: 0.60, dengar: /konektor|connector/i, coba: 4, text: 'Template pesan, isi Pengetahuan, dan aturannya ada di konektor dot id slash skenario.'},
    {no: 25, sc: 'Outro',    off: 7.60, text: 'Supaya tiga ratus chat berikutnya, Meta tahu siapa yang berangkat.'},
  ],

  sfx: [
    ['pop', '@stok/pop-thick'],
    ['sapu', '@stok/sapu'],
    ['klik', '@stok/click-soft'],
    ['tombol', '@stok/btn-click'],
    ['salin', '@stok/copy-chime'],
    ['ketik', '@stok/keyboard-type'],
    ['centang', '@stok/janji-ceklis'],
    ['kirim', '@stok/dm-kirim'],
    ['jadi', '@stok/jadi-ding'],
    ['chime', '@stok/success-chime'],
    ['riser', '@stok/riser-long'],
    ['hisap', '@stok/whoosh-rev'],
    ['impact', '@stok/impact-hit'],
    ['sub', '@stok/sub-drop'],
  ],

  // Semua cue jatuh di kata VO: at(baris, kata, kemunculan, geser). Selaras dengan skenario-umroh.jsx.
  cue: ({C, P}) => {
    const at = (no, kata, k = 0, d = 0) => P[no] + mulaiKata(no, kata, k) + d;
    const q = (t, nama, gain, nada = 0) => ({at: t, nama, gain, nada});
    const klik = (t, n = 0) => q(t, 'klik', 0.18, n);
    const tombol = (t, n = 0) => q(t, 'tombol', 0.26, n);
    const sapu = (t, g = 0.12) => q(t, 'sapu', g);
    const pop = (t, n = 0, g = 0.18) => q(t, 'pop', g, n);
    const hk = C.Hook, ms = C.Masalah, kl = C.Klik, ml = C.Malam, sh = C.Serah, st = C.Status, ht = C.Hot, dp = C.DP, pc = C.Purchase, it = C.Inti, su = C.Setup, hr = C.Harapan, mu = C.Musim, ot = C.Outro;
    const tHit = at(16, 'diterima');
    const flowAt = [at(2, 'iklan'), at(2, 'iklan', 0, 0.5), at(2, 'iklan', 0, 0.8), at(2, 'sampai', 0, -0.3), at(2, 'sampai'), at(2, 'dp', 0, 0.15), at(2, 'terkirim'), at(2, 'meta')];
    return [
      // HOOK: angka naik, DP: ?, garis alur 8 titik
      ...[0.1, 0.3, 0.5, 0.7, 0.9, 1.1].map((d, i) => pop(hk + d, i, 0.10)), pop(hk + 1.35, 5, 0.20), q(hk + 1.4, 'chime', 0.10),
      pop(at(1, 'dp', 0, -0.1), -3, 0.24), q(at(1, 'dp', 0, -0.1), 'sapu', 0.10),
      sapu(hk + 5.1, 0.14),
      ...flowAt.map((t, i) => pop(t, i, 0.16)), q(flowAt[7] + 0.05, 'jadi', 0.16), sapu(hk + 12.5),

      // MASALAH
      sapu(ms + 0.15, 0.14),
      pop(at(3, 'tanya', 0, -0.1), 0, 0.18), pop(at(3, 'minta', 0, -0.1), 1, 0.18), pop(at(3, 'diskusi', 0, -0.1), 2, 0.18), pop(at(3, 'baru', 0, -0.5), 3, 0.18), pop(at(3, 'dp', 0, -0.15), 5, 0.22),
      pop(at(4, 'meta'), 3, 0.22), sapu(at(4, 'meta', 0, -0.15), 0.10), pop(at(4, 'chat', 0, 0.3), 1, 0.12),
      sapu(at(5, 'jadi', 0, -0.5), 0.12),
      ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => pop(at(5, 'mencari') + i * 0.34, i % 5, 0.08)),
      pop(at(5, 'bukan'), -4, 0.22), q(at(5, 'bukan', 0, 0.1), 'sapu', 0.10),

      // KLIK
      sapu(kl + 0.2, 0.14), pop(at(6, 'kamis', 0, -0.1), 4, 0.14), sapu(at(6, 'kamis', 0, -0.1), 0.10),
      pop(at(6, 'rina', 0, -0.1), 2, 0.20),
      tombol(at(6, 'klik', 0, 0.05)), q(at(6, 'klik', 0, 0.10), 'centang', 0.14, 1),
      q(at(6, 'chat', 0, -0.1), 'kirim', 0.28),
      sapu(kl + 6.6, 0.14), sapu(kl + 6.8, 0.12),
      pop(at(7, 'mencatatnya', 0, -0.1), 3, 0.20), q(at(7, 'mencatatnya', 0, -0.05), 'chime', 0.12),
      pop(at(7, 'baru', 0, 0.5), 1, 0.14), pop(at(7, 'lengkap', 0, -0.05), 2, 0.16), pop(at(7, 'data'), 4, 0.18),

      // MALAM
      klik(ml + 0.55), sapu(ml + 0.65),
      pop(at(8, 'agent', 0, 0.05), 0, 0.10),
      pop(at(8, 'agent', 0, 0.55), 2, 0.20), q(at(8, 'agent', 0, 0.6), 'chime', 0.10),
      sapu(at(9, 'jawabannya', 0, 0.1), 0.14),
      pop(at(9, 'jadwal', 0, -0.1), 1, 0.14), pop(at(9, 'hotel', 0, -0.1), 2, 0.14), pop(at(9, 'harga', 0, -0.15), 3, 0.14),
      sapu(ml + 10.7, 0.12),
      pop(at(10, 'bertanya'), 4, 0.20), q(at(10, 'bertanya', 0, 0.05), 'chime', 0.10),

      // SERAH
      pop(at(11, 'tanya', 0, -0.2), -1, 0.18),
      sapu(at(11, 'cara', 0, -0.15), 0.14),
      pop(at(11, 'bayar', 0, -0.05), 2, 0.18),
      pop(at(11, 'berhenti'), -3, 0.24), q(at(11, 'berhenti', 0, 0.05), 'tombol', 0.14, -3),
      pop(at(11, 'menyerahkan', 0, -0.1), 1, 0.12), pop(at(11, 'menyerahkan'), 3, 0.20),
      pop(at(11, 'tim', 0, -0.1), 3, 0.12), pop(at(11, 'tim', 0, 0.1), 4, 0.24), q(at(11, 'tim', 0, 0.15), 'chime', 0.14), pop(at(11, 'tim', 0, 0.45), 4, 0.12),
      sapu(sh + 7.2, 0.12),

      // STATUS
      sapu(st + 0.1), pop(st + 0.15, 2, 0.14),
      klik(at(12, 'melanjutkan', 0, -0.2)), pop(at(12, 'melanjutkan', 0, -0.15), 1, 0.12),
      pop(at(12, 'melanjutkan', 0, 0.3), 0, 0.16),
      pop(at(12, 'merespon'), 2, 0.22), pop(at(12, 'berkualitas'), 4, 0.22), q(at(12, 'berkualitas', 0, 0.05), 'chime', 0.12),

      // HOT
      sapu(at(13, 'seminggu', 0, -0.1)), pop(at(13, 'seminggu', 0, -0.05), 3, 0.14),
      pop(at(13, 'kami', 0, -0.1), -1, 0.18),
      sapu(at(14, 'aturan', 0, -0.1), 0.14), pop(at(14, 'aturan'), 2, 0.18),
      pop(at(14, 'membaca'), 1, 0.12), pop(at(14, 'kalimat', 0, 0.2), 1, 0.12),
      pop(at(14, 'hot'), 5, 0.24), q(at(14, 'hot', 0, 0.05), 'chime', 0.14),
      sapu(ht + 10.5, 0.12),

      // DP
      sapu(dp + 0.1), pop(dp + 0.15, 4, 0.14),
      klik(dp + 0.12), klik(dp + 0.9), sapu(dp + 0.95, 0.10),
      klik(at(15, 'dikirim', 0, 0.1)), pop(at(15, 'dikirim', 0, 0.12), 3, 0.20),
      klik(dp + 3.0), sapu(dp + 3.05, 0.10),
      klik(at(15, 'closing', 0, 0.05)), pop(at(15, 'closing', 0, 0.08), 5, 0.22),
      sapu(at(15, 'closing', 0, 0.35), 0.14),
      q(at(15, 'isi'), 'ketik', 0.16), q(at(15, 'isi', 0, 0.45), 'ketik', 0.14), q(at(15, 'harga', 0, 0.15), 'ketik', 0.14),
      tombol(dp + 6.55), q(dp + 6.6, 'centang', 0.16, 1), pop(dp + 6.72, 3, 0.18), q(dp + 6.85, 'jadi', 0.14), pop(dp + 6.8, 5, 0.12),

      // PURCHASE: satu-satunya hentakan besar, dilapis empat, di "Diterima!"
      klik(pc + 0.55), sapu(pc + 0.65), klik(pc + 1.65), sapu(pc + 1.7),
      pop(at(16, 'konektor', 0, 0.6), 2, 0.16), q(at(16, 'konektor', 0, 0.65), 'kirim', 0.20),
      pop(at(16, 'iklan'), 3, 0.14),
      q(tHit - 1.3, 'riser', 0.22), q(tHit - 0.2, 'hisap', 0.20),
      q(tHit, 'impact', 0.42), q(tHit + 0.02, 'sub', 0.32),
      q(tHit + 0.45, 'centang', 0.16, 3), q(tHit + 0.6, 'jadi', 0.14),
      sapu(pc + 7.55, 0.12), klik(pc + 6.95), sapu(pc + 7.0),
      pop(pc + 7.3, 5, 0.22), q(pc + 7.35, 'chime', 0.14),
      sapu(pc + 12.3, 0.12),

      // INTI
      sapu(it - 0.1),
      ...[['iklan', 0], ['belajar', 1], ['dari', 2], ['jamaah', 3], ['yang', 4]].map(([w, n]) => pop(at(17, w, 0, -0.05), n, 0.10)),
      pop(at(17, 'dp', 0, -0.05), 5, 0.26), q(at(17, 'dp'), 'chime', 0.14),
      ...[['bukan', 0], ['sekadar', 2], ['bertanya', 1]].map(([w, n]) => pop(at(17, w, 0, -0.05), n, 0.10)),
      ...[0, 1, 2, 3, 4].map((i) => pop(at(17, 'dp') + 0.3 + i * 0.3, i + 1, 0.09)),

      // SETUP
      sapu(su - 0.1), pop(at(18, 'setup', 0, -0.05), 3, 0.24),
      ...[0, 1, 2, 3, 4, 5].map((i) => pop(su + 0.5 + i * 0.1, i, 0.07)),
      pop(at(19, 'whatsapp'), 1, 0.20), pop(at(19, 'meta'), 2, 0.16),
      pop(at(19, 'klik', 0, -0.2), 2, 0.20), q(at(19, 'klik', 0, 0.5), 'chime', 0.12),
      pop(at(19, 'closing', 0, -0.2), 3, 0.20), q(at(19, 'closing', 0, 0.6), 'centang', 0.14, 2),
      pop(at(20, 'pengetahuan', 0, -0.1), 1, 0.20),
      pop(at(20, 'serah', 0, -0.1), 2, 0.20), pop(at(20, 'serah', 0, 0.4), 4, 0.12),
      pop(at(20, 'pasang', 0, -0.1), 3, 0.20), pop(at(20, 'pasang', 0, 0.6), 5, 0.14),
      q(at(19, 'whatsapp', 0, 1.4), 'centang', 0.10, 0), q(at(19, 'klik', 0, 1.2), 'centang', 0.10, 1), q(at(19, 'closing', 0, 1.2), 'centang', 0.10, 2),
      q(at(20, 'pengetahuan', 0, 1.3), 'centang', 0.10, 3), q(at(20, 'serah', 0, 1.3), 'centang', 0.10, 4), q(at(20, 'pasang', 0, 1.3), 'centang', 0.10, 5),
      q(su + 14.4, 'jadi', 0.12),

      // HARAPAN
      sapu(hr - 0.1),
      pop(at(21, 'minggu', 0, -0.05), 1, 0.20), pop(at(21, 'minggu', 1, -0.05), 3, 0.20), pop(at(21, 'mengajari', 0, 0.2), 5, 0.20),
      sapu(at(22, 'naikkan', 0, -0.3), 0.14),
      pop(at(22, 'budget'), 1, 0.18), pop(at(22, 'dp'), 2, 0.18), pop(at(22, 'masuk', 0, 0.1), 3, 0.18), pop(at(22, 'minggu'), 4, 0.18),
      q(at(22, 'biaya'), 'centang', 0.16, 2), pop(at(22, 'bertahap', 0, 0.1), 4, 0.20),
      sapu(at(22, 'bertahap', 0, -0.5), 0.12),
      pop(at(22, 'sekaligus', 0, -0.2), -5, 0.22), q(at(22, 'sekaligus', 0, 0.3), 'impact', 0.14, -4), pop(at(22, 'sekaligus', 0, 0.35), -6, 0.18),

      // MUSIM
      sapu(mu - 0.1), sapu(at(23, 'visa', 0, -0.15), 0.12), pop(at(23, 'visa', 0, -0.1), 2, 0.16),
      pop(at(23, '9', 0, -0.05), 2, 0.26), q(at(23, '9', 0, 0.0), 'tombol', 0.16),
      sapu(at(23, 'paket'), 0.14), pop(at(23, 'paket', 0, 1.5), 4, 0.20), q(at(23, 'paket', 0, 1.55), 'chime', 0.12),

      // OUTRO
      sapu(ot + 0.2, 0.14), pop(ot + 0.3, 3, 0.22),
      pop(at(24, 'template', 0, -0.05), 1, 0.18), pop(at(24, 'pengetahuan', 0, -0.1), 2, 0.18), pop(at(24, 'aturannya', 0, -0.05), 3, 0.18),
      q(at(24, 'konektor'), 'ketik', 0.16), q(at(24, 'konektor', 0, 0.6), 'ketik', 0.14), q(at(24, 'konektor', 0, 1.2), 'ketik', 0.14),
      pop(at(24, 'konektor', 0, 1.9), 4, 0.16),
      sapu(at(25, 'supaya', 0, -0.6), 0.14),
      ...[0, 1, 2, 3, 4, 5].map((i) => pop(at(25, 'tahu', 0, -0.1) + i * 0.26, i, 0.11)),
      q(at(25, 'tahu', 0, 1.4), 'jadi', 0.20), q(at(25, 'tahu', 0, 1.45), 'chime', 0.16),
    ];
  },

  // Musik 5 bagian (naskah): masalah -> malam -> proses -> puncak sesudah hentakan -> setup dan outro.
  musik: [{
    nama: 'bgm',
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'words', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'quiet intro', 'fade in', 'sparse'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const dasar = ['clean modern product-demo instrumental', '112 BPM', 'steady and continuous', 'always present',
        'light shaker', 'soft pluck', 'no vocals'];
      const hit = C.Purchase + 6.02;
      return [
        b(0, C.Klik, '[masalah]', [...dasar, 'focused groove from the very first beat', 'warm and clear']),
        b(C.Klik, C.Status, '[malam]', [...dasar, 'softer and warmer', 'gentle arpeggio', 'calm but present']),
        b(C.Status, hit, '[proses]', [...dasar, 'a little fuller', 'soft arpeggio', 'forward motion']),
        b(hit, C.Setup, '[puncak]', [...dasar, 'brighter', 'open', 'same groove']),
        b(C.Setup, total, '[setup]', [...dasar, 'calm and bright', 'same groove', 'resolving']),
        b(total, total + 8, '[tail]', [...dasar, 'bright groove continues']),
      ];
    },
    // BGM pelan (Rama): bed -27 dB, tukikan -38 dB sebelum hentakan, VO harus >= +20 dB di atas musik.
    titik: [['Hook', 0, -27],
      ['Purchase', 5.57, -27], ['Purchase', 5.62, -38], ['Purchase', 6.02, -38], ['Purchase', 6.07, -26], ['Purchase', 7.5, -27],
      ['Outro', 0, -27]],
    fadeOut: ({total}) => [total - 0.35, 0.35],
  }],

  // Frame 0 = adegan Hook (tabel Ads Manager sudah penuh): sampul diambil dari frame 0.
  sampul: {detik: 0},
  mixer: {gainVO: 1.60, gainSFX: 0.95, duckMusik: {th: 0.015, ratio: 12, attack: 20, release: 300}},
  // Titik A/B bus SFX: SFX berbunyi dan VO diam.
  periksa: {busTitik: [37.95, 80.85, 102.9]},
  tata: {mode: 'jangkar', jeda: 0.25, ekorBiasa: 0.40, ekor: {Outro: 0.30}},
};
