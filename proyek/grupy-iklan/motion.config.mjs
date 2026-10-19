// grupy-iklan — "Habis scrap, ringkas". 9:16, ±40 dtk, framework HABIS. Teks VO = kapsi, sama persis.
// Suara Maya (pilihan Rama, 2 Okt 2026): 13,8 kar/dtk pada speed 1,0.
import {eja} from '../../lib/lafal.mjs';

export default {
  nama: 'grupy-iklan',
  komposisi: "Grupy Iklan Video.dc.html",
  jsx: "grupy-ad.jsx",
  kapsi: true,
  keluaran: 'grupy-iklan.mp4',

  suara: {id: 'U3dExJoUNcmTY5H6GMuG', seed: 20261002, speed: 1.2, stability: 0.22, similarity: 0.8, style: 0.7},

  // Teks layar tidak disentuh. CSV dieja huruf; grupy dibaca "grupi".
  lafal: {CSV: eja('CSV'), grupy: 'grupi', WhatsApp: 'wasap'},

  vo: [
    {no: 1,  sc: 'Hasil',   off: 0.15, text: 'Masih copy nomor member grup satu-satu?'},
    {no: 2,  sc: 'Alasan',  off: 0.10, text: 'Ada dua kerjaan grup yang beres sekali klik.'},
    {no: 3,  sc: 'Alasan',  off: 1.80, text: 'Yang kedua paling bikin lega.'},
    {no: 4,  sc: 'Bukti',   off: 0.10, text: 'Buka Grupy.'},
    {no: 5,  sc: 'Bukti',   off: 1.60, text: 'Pilih grup.'},
    {no: 6,  sc: 'Bukti',   off: 3.40, text: 'Klik Unduh CSV.'},
    {no: 7,  sc: 'Bukti',   off: 5.20, text: 'Semua nomor member langsung jadi satu file.'},
    {no: 8,  sc: 'Belokan', off: 0.10, text: 'Tapi kamu ikut lima puluh grup,'},
    {no: 9,  sc: 'Belokan', off: 2.40, text: 'dan chatnya ribuan.'},
    {no: 10, sc: 'Inti',    off: 0.10, text: 'Jadi, grup itu cukup dibaca ringkasannya,'},
    {no: 11, sc: 'Inti',    off: 3.50, text: 'bukan semua chatnya.'},
    {no: 12, sc: 'Step',    off: 0.10, text: 'Satu, hubungkan nomor WhatsApp kamu.'},
    {no: 13, sc: 'Step',    off: 2.50, text: 'Dua, pilih grup yang mau dipantau.'},
    {no: 14, sc: 'Step',    off: 5.00, text: 'Tiga, buka Ringkasan.'},
    {no: 15, sc: 'Step',    off: 7.00, text: 'Semua grup terangkum otomatis!'},
    {no: 16, sc: 'Sambung', off: 0.10, text: 'Coba di grupy dot chat.'},
    {no: 17, sc: 'Sambung', off: 1.60, text: 'Daripada copy nomor satu-satu,'},
  ],

  // Sambung tanpa outro: kalimat terakhir menggantung, video loop ke scene pertama.
  tata: {mode: 'jangkar', jeda: 0.10, ekorBiasa: 0.25, ekor: {Sambung: 0.5}},

  sfx: [
    ['sapu',    '@stok/sapu'],
    ['klik',    '@stok/click-soft'],
    ['tombol',  '@stok/btn-click'],
    ['tik',     '@stok/05-tick'],
    ['pop',     '@stok/pop-thick'],
    ['stempel', '@stok/09-stamp'],
    ['ding',    '@stok/notif-ding'],
    ['ping',    '@stok/notif-ping'],
    ['alarm',   '@stok/alarm-tap'],
    ['spam',    '@stok/ping-spam'],
    ['gagal',   '@stok/buzz'],
    ['chime',   '@stok/chime-send'],
    ['salin',   '@stok/copy-chime'],
    ['riser',   '@stok/riser-long'],
    ['hisap',   '@stok/whoosh-rev'],
    ['impact',  '@stok/impact-hit'],
    ['sub',     '@stok/sub-drop'],
  ],

  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0, pan = 0) => ({at, nama, gain, nada, pan});
    const S = C.Step, L = C.Belokan, B = C.Bukti, A = C.Alasan, I = C.Inti, Z = C.Sambung;
    return [
      // Hasil: hitungan nomor tersalin tiap 0,75 dtk, lalu tekanan "satu-satu?"
      q(C.Hasil + 0.05, 'pop', 0.22), q(C.Hasil + 0.80, 'tik', 0.14), q(C.Hasil + 1.55, 'tik', 0.14, 2),
      q(C.Hasil + 1.40, 'stempel', 0.24), q(C.Hasil + 2.30, 'tik', 0.14, 4),
      // Alasan: dua kartu, tanda tanya
      q(A - 0.10, 'sapu', 0.14), q(A + 0.05, 'pop', 0.24), q(A + 0.45, 'pop', 0.24, 3), q(A + 0.70, 'ding', 0.18, 2),
      // Bukti: tap beranda, pilih grup, centang, unduh
      q(B - 0.10, 'sapu', 0.14, 3), q(B + 1.30, 'klik', 0.26), q(B + 2.40, 'klik', 0.26, 2),
      q(B + 3.35, 'sapu', 0.12, 5), q(B + 4.00, 'tombol', 0.26), q(B + 4.70, 'tombol', 0.30), q(B + 4.78, 'salin', 0.22),
      q(B + 5.40, 'chime', 0.22, 2),
      // Belokan: layar merah, 50 grup, badge menumpuk, alarm dan notif bertumpuk
      q(L + 0.00, 'impact', 0.30, -3), q(L + 0.10, 'gagal', 0.16),
      ...[0, 1, 2, 3, 4].map((i) => q(L + 0.30 + i * 0.12, 'ping', 0.14, i * 2, i % 2 ? 0.4 : -0.4)),
      q(L + 1.00, 'alarm', 0.26, -2), q(L + 1.30, 'spam', 0.20, 3, -0.3),
      ...[0, 1, 2, 3, 4, 5].map((i) => q(L + 2.55 + i * 0.22, i % 2 ? 'spam' : 'ping', 0.18, i, i % 2 ? 0.4 : -0.4)),
      q(L + 2.40, 'alarm', 0.24, 2), q(L + 3.60, 'alarm', 0.22, 4), q(L + 4.00, 'gagal', 0.16, -2),
      // Inti: chat menyusut jadi satu kartu ringkasan
      q(I + 0.00, 'sapu', 0.18, -2), q(I + 0.30, 'pop', 0.24), q(I + 1.20, 'stempel', 0.30), q(I + 3.50, 'pop', 0.20, 3),
      q(I + 5.50, 'chime', 0.22, 4),
      // Step: tiga langkah
      q(S + 0.00, 'impact', 0.18, 2), q(S + 1.60, 'ding', 0.18), q(S + 2.70, 'tombol', 0.26),
      q(S + 2.50, 'sapu', 0.14, 3),
      ...[3.4, 3.8, 4.2, 4.6].map((d, i) => q(S + d, 'klik', 0.22, i * 2, i % 2 ? 0.3 : -0.3)),
      q(S + 5.00, 'sapu', 0.14, 4), q(S + 6.30, 'tombol', 0.28),
      // Satu-satunya hentakan besar, dilapis empat, di "Semua grup terangkum otomatis!"
      q(S + 5.70, 'riser', 0.22), q(S + 6.80, 'hisap', 0.22),
      q(S + 7.00, 'impact', 0.42), q(S + 7.02, 'sub', 0.34),
      q(S + 7.60, 'ding', 0.22), q(S + 8.00, 'pop', 0.26, 5), q(S + 8.30, 'chime', 0.22, 2),
      // Sambung dan loop
      q(Z + 0.00, 'impact', 0.18, 3), q(Z + 0.25, 'pop', 0.22, 2), q(Z + 0.80, 'tombol', 0.26),
      q(Z + 2.60, 'hisap', 0.16),
    ];
  },

  musik: [{
    nama: 'bgm',
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'quiet intro', 'fade in', 'sparse'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const inti = ['upbeat playful tech instrumental', '126 BPM', 'punchy', 'steady and continuous', 'always present'];
      const hit = C.Step + 6.5;
      return [
        b(0, C.Belokan, '[energy]', [...inti, 'driving groove from the first beat', 'bright pluck synth', 'crisp claps']),
        b(C.Belokan, C.Inti, '[tension]', [...inti, 'tense', 'darker synth', 'tight groove']),
        b(C.Inti, hit, '[build]', [...inti, 'building', 'rising motif', 'bright']),
        b(hit, total, '[peak]', [...inti, 'bright triumphant', 'full groove']),
        b(total, total + 6, '[tail]', [...inti, 'bright groove continues']),
      ];
    },
    // Musik dijaga pelan: bed -20 dB (-17 memberi VO cuma +7,1 dB di atas musik). Satu tukikan sebelum hentakan besar; Belokan tukik kecil (5 dB).
    titik: [['Hasil', 0, -20], ['Belokan', -0.05, -20], ['Belokan', 0.20, -25], ['Belokan', 0.80, -20],
      ['Step', 6.55, -20], ['Step', 6.60, -31], ['Step', 7.00, -31], ['Step', 7.05, -19], ['Sambung', 0, -20]],
    fadeOut: ({total}) => [total - 0.3, 0.3],
  }],

  sampul: {detik: 1.5},
  mixer: {gainVO: 1.60, gainSFX: 0.95, duckMusik: {th: 0.015, ratio: 12, attack: 20, release: 300}},
  periksa: {busTitik: [1, 10, 20]},
};
