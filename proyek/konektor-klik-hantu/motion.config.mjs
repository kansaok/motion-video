// Iklan "Klik Hantu" — angle #3. Jalankan: motion all
import {eja} from '../../lib/lafal.mjs';

// Sudut yang MENANG di uji berbayar: Rp16.042 per registrasi, lawan Rp90.319 untuk sudut
// funnel. Masuk dari kerugian yang bisa dihitung, bukan dari konsep — itu sebabnya seluruh
// naskah ini angka, bukan istilah. Satu ide saja: kamu bayar klik yang tidak pernah jadi chat.
//
// Klaim sengaja ditahan di "melacak chat asli", BUKAN "atribusi CTWA lengkap": permission
// whatsapp_business_manage_events belum disetujui Meta dan alurnya masih mode fallback.
export default {
  nama: 'konektor-klik-hantu',
  komposisi: 'Iklan Klik Hantu 9x16.dc.html',
  // Empat rasio Meta dari SATU jsx dan SATU master audio. `jugaTulis` menjaga OM_SCENES
  // keempatnya tetap sama; kalau tidak, durasi scene di 4:5 tertinggal satu revisi.
  jugaTulis: [
    'Iklan Klik Hantu 4x5.dc.html',
    'Iklan Klik Hantu 1x1.dc.html',
    'Iklan Klik Hantu 16x9.dc.html',
  ],
  jsx: 'klik-hantu-scene.jsx',
  kapsi: true,                                  // 12 kapsi = 12 baris VO, urut sama
  keluaran: 'konektor-klik-hantu-9x16.mp4',

  // Suara sama dengan dua iklan sebelumnya: satu kampanye, satu brand.
  suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260906, speed: 1.20, stability: 0.22, similarity: 0.80, style: 0.45},

  // Angka ditulis sebagai kata di VO supaya TTS tidak menebak; teks di layar tetap angka.
  // Titik domain diurus `ucapkan()`.
  lafal: {
    cpc: eja('CPC'),
    'link click': 'link klik',
  },

  vo: [
    // Klik 0-4,5 · kartu masuk 0,15 · 200 titik terisi 0,35-1,85 · CPC 2,15 · Terpakai 2,45
    {no: 1,  sc: 'Klik',    off: 0.30, maks: 2.40, text: 'Bulan lalu saya bayar dua ratus klik.'},
    {no: 2,  sc: 'Klik',    off: 2.70, maks: 1.60, text: 'CPC-nya murah banget.'},
    // Sepi 4,5-10,5 · 197 titik menguap 5,05-7,0 · angka 3 pop 6,5 · inbox 6,9 · badge 8,7
    {no: 3,  sc: 'Sepi',    off: 0.30, maks: 2.30, text: 'Yang beneran chat, cuma tiga.'},
    {no: 4,  sc: 'Sepi',    off: 3.00, maks: 1.30, text: 'Sisanya hilang.'},
    {no: 5,  sc: 'Sepi',    off: 4.40, maks: 1.10, text: 'Klik hantu.'},
    // Bakar 10,5-14,5 · rupiah menghitung 10,8-12,8 · chip "cuma 3" 12,8
    {no: 6,  sc: 'Bakar',   off: 0.30, maks: 2.90, text: 'Tiga ratus tiga belas ribu, terbakar.'},
    // Sebab 14,5-20,5 · node lingkaran 14,7-15,0 · chip link_click 15,25 · vonis 16,0
    {no: 7,  sc: 'Sebab',   off: 0.30, maks: 2.50, text: 'Kamu cuma kirim balik link click.'},
    {no: 8,  sc: 'Sebab',   off: 2.90, maks: 2.90, text: 'Jadi Meta cariin pengklik, bukan pembeli.'},
    // Benerin 20,5-26 · chip chat asli 21,25 · bar audiens 21,9-23,7
    {no: 9,  sc: 'Benerin', off: 0.30, maks: 2.50, text: 'Konektor kirim balik chat aslinya.'},
    {no: 10, sc: 'Benerin', off: 2.90, maks: 2.40, text: 'Meta baru cariin yang beneran chat.'},
    // CTA 26-30 · logo 26,1 · judul 26,45 · tombol 26,9
    {no: 11, sc: 'CTA',     off: 0.30, maks: 2.10, text: 'Lacak chat asli, bukan klik.'},
    {no: 12, sc: 'CTA',     off: 2.50, maks: 1.20, text: 'Daftar gratis sekarang!'},
  ],

  tata: {mode: 'jangkar', jeda: 0.12, ekorBiasa: 0.12},

  sfx: [
    ['whoosh',       0.8, 'Very fast short UI transition whoosh, tight and modern, no reverb, one shot'],
    ['dot-cascade',  2.4, 'Rapid fine granular ticking of many small dots appearing one by one, dry, no music'],
    ['odo-roll',     2.6, 'Mechanical odometer digits rolling upward steadily, dry, close mic, no music'],
    ['ui-tick',      0.5, 'One small soft interface tick, warm and rounded, no reverb, one shot'],
    ['ghost-vanish', 2.2, 'Airy reversed swell of many small particles evaporating upward into thin air, ghostly, no music'],
    ['sub-drop',     1.8, 'Deep sub bass drop with a short dark tail, cinematic, dry, one shot'],
    ['chat-pop',     0.6, 'One short soft chat message pop bubble, tight and clean, no reverb, one shot'],
    ['error-buzz',   1.0, 'Short harsh cold digital error buzzer, dry and glitchy, one shot'],
    ['ember-burn',   2.6, 'Low smouldering ember crackle with a dark rumble underneath, dry, no music'],
    ['low-thud',     1.2, 'Low dull thud with a short dark tail, close mic, dry, one shot'],
    ['loop-hum',     3.0, 'Steady circling mechanical hum turning around and around, dry, no melody, no music'],
    ['flip-chime',   1.2, 'Bright confident single note chime as something flips into place, clean, short decay'],
    ['fill-rise',    1.8, 'Smooth rising tone as a bar fills up, clean and hopeful, no reverb tail, one shot'],
    ['brand-boom',   2.0, 'Cinematic brand boom, bright impact over a deep sub, short clean tail, one shot'],
    ['riser',        1.4, 'Short clean tech riser sweeping upward, no reverb tail, one shot'],
    ['btn-click',    0.5, 'One crisp modern button click, tight and clean, no reverb, one shot'],
  ],

  // C = mulai tiap scene · P = awal tiap baris VO · E = akhirnya · S = durasi scene
  cue: ({C, S}) => {
    const q = (sc, off, nama, gain, nada = 0, pan = 0) => ({at: C[sc] + off, nama, gain, nada, pan});
    const KL = 'Klik', SP = 'Sepi', BK = 'Bakar', SB = 'Sebab', BN = 'Benerin';
    return [
      // KLIK — 200 titik terisi. Cascade + odometer dibuat terdengar seperti KEMENANGAN.
      q(KL, 0.10, 'whoosh', 0.30),
      q(KL, 0.35, 'dot-cascade', 0.10),
      q(KL, 0.35, 'odo-roll', 0.10),
      q(KL, 2.15, 'ui-tick', 0.26, 3),
      q(KL, 2.45, 'ui-tick', 0.26, 6),
      // SEPI — 197 titik menguap. Ini bunyi paling penting di seluruh iklan.
      q(SP, -0.13, 'whoosh', 0.32, -2),
      q(SP, 0.55, 'ghost-vanish', 0.17),
      q(SP, 2.00, 'sub-drop', 0.34),
      ...[2.45, 2.63, 2.81].map((o, i) => q(SP, o, 'chat-pop', 0.30, i * 3, i % 2 ? 0.3 : -0.3)),
      q(SP, 4.20, 'error-buzz', 0.28),
      // BAKAR — bara di bawah, odometer rupiah di atasnya
      q(BK, -0.13, 'whoosh', 0.30),
      q(BK, 0.20, 'ember-burn', 0.09),
      q(BK, 0.30, 'odo-roll', 0.11, -2),
      q(BK, 2.30, 'low-thud', 0.32),
      // SEBAB — lingkaran berputar, label merah, lalu vonisnya
      q(SB, -0.13, 'whoosh', 0.30, 2),
      q(SB, 0.15, 'loop-hum', 0.07, -3),
      q(SB, 0.75, 'error-buzz', 0.30),
      q(SB, 1.50, 'low-thud', 0.30),
      // BENERIN — mesin yang sama, umpan yang beda. Hum-nya naik nada, bukan diganti.
      q(BN, -0.13, 'whoosh', 0.30),
      q(BN, 0.15, 'loop-hum', 0.07, 4),
      q(BN, 0.75, 'flip-chime', 0.34),
      q(BN, 1.40, 'fill-rise', 0.28),
      // CTA
      q('CTA', -0.45, 'riser', 0.30),
      q('CTA', 0.05, 'brand-boom', 0.36),
      q('CTA', 0.95, 'btn-click', 0.30),
      q('CTA', S.CTA - 1.0, 'flip-chime', 0.22, 5),
    ];
  },

  musik: [{
    nama: 'musik',
    detik: ({total}) => total + 10,
    titik: [
      ['Klik', 0.0, -17], ['Klik', 3.0, -14],
      ['Sepi', 1.0, -15],
      ['Bakar', 0.5, -13],
      ['Sebab', 1.0, -12],
      ['Benerin', 0.5, -10],
      ['CTA', 0.3, -9],
    ],
    fadeOut: ({total}) => [total - 0.85, 0.75],
    prompt: 'Driving minimal tech house corporate instrumental, 110 BPM, no vocals, high energy '
      + 'and confident. A round sub bass and a tight kick run continuously from the first bar to '
      + 'the last, never stopping. It opens focused with dry ticking percussion over that groove, '
      + 'then adds a bright pluck arpeggio, then wide claps and a simple hopeful lead, then a full '
      + 'confident chorus with an extra bright layer. Energy only ever builds, never drops out. '
      + 'The last third stays at full energy with no breakdown and no fade — the track must '
      + 'still be at its loudest at the forty second mark.',
  }],

  // Iklan ini punya 28 cue dengan banyak bunyi BERTAHAN LAMA (cascade, hantu, bara,
  // hum), bukan one-shot yang cuma menyentak seperti dua iklan sebelumnya. gainSFX 0.72
  // membuat VO cuma +7,3 dB di atas SFX di pita bicara, lawan +13..+14 yang biasa.
  mixer: {gainVO: 1.45, gainSFX: 0.44, duckMusik: {th: 0.15, ratio: 2, attack: 40, release: 220}},

  periksa: {busTitik: [1, 6, 11, 16, 22, 27]},
};
