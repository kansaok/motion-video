// Tutorial: AI Agent di Konektor, gratis (kunci OpenRouter sendiri). 16:9, 12 scene, ±66 dtk.
// Suara sama dengan seri Konektor (preset C, speed 0.98). Struktur salinan tutorial-google-ads.
import {eja} from '../../lib/lafal.mjs';

export default {
  nama: 'tutorial-agentic',
  komposisi: 'Tutorial Agentic.dc.html',
  jsx: 'agentic-tutorial.jsx',
  kapsi: false,
  keluaran: 'tutorial-agentic.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  lafal: {
    CRM: eja('CRM'),
    API: 'ei pi ai',
    AI: 'ei ai',
  },

  vo: [
    {no: 1,  sc: 'Intro',       off: 0.40, text: 'CRM dengan AI Agent biasanya mulai sekitar 159 dolar sebulan. Jutaan rupiah.'},
    {no: 2,  sc: 'Gratis',      off: 0.40, text: 'Di Konektor, AI Agent-nya gratis. Tanpa biaya tambahan. Kamu cuma bayar pemakaian AI ke OpenRouter.'},
    {no: 3,  sc: 'Saldo',       off: 0.40, text: 'Pertama, isi saldo di OpenRouter. Buka Credits, klik Add Credits.'},
    {no: 4,  sc: 'Kunci',       off: 0.40, text: 'Buka API Keys, klik New Key, beri nama, lalu klik Create.'},
    {no: 5,  sc: 'Salin',       off: 0.40, text: 'Salin kuncinya. OpenRouter menampilkannya cuma sekali.'},
    {no: 6,  sc: 'Tempel',      off: 0.40, text: 'Di Konektor, buka AI Wulan, Agent dan model. Tempel kunci, klik Uji kunci, Simpan.'},
    {no: 7,  sc: 'Model',       off: 0.40, text: 'Model per tugas sudah terisi, dengan pilihan yang murah. Ganti kalau perlu.'},
    {no: 8,  sc: 'Pengetahuan', off: 0.40, text: 'Isi Pengetahuan: FAQ, harga, info toko. Agent menjawab dari datamu, bukan menebak.'},
    {no: 9,  sc: 'Otomatis',    off: 0.40, text: 'Nyalakan Balas otomatis. Atur juga Serah ke tim, untuk chat yang perlu manusia.'},
    {no: 10, sc: 'Balas',       off: 0.40, dengar: /detik/i, coba: 4, text: 'Pelanggan bertanya, agent langsung membalas. Dalam hitungan detik!'},
    {no: 11, sc: 'Tips',        off: 0.40, text: 'Tips: pasang Credit limit, supaya biaya terkendali.'},
    {no: 12, sc: 'Outro',       off: 1.00, dengar: /konektor|connector/i, coba: 4, text: 'Panduannya, di konektor.id.'},
  ],

  tata: {mode: 'jangkar', jeda: 0.25, ekorBiasa: 0.40},

  sfx: [
    ['pop', '@stok/pop-thick'],
    ['sapu', '@stok/sapu'],
    ['klik', '@stok/click-soft'],
    ['tombol', '@stok/btn-click'],
    ['salin', '@stok/copy-chime'],
    ['centang', '@stok/janji-ceklis'],
    ['chime', '@stok/success-chime'],
    ['jadi', '@stok/jadi-ding'],
    ['riser', '@stok/riser-long'],
    ['hisap', '@stok/whoosh-rev'],
    ['impact', '@stok/impact-hit'],
    ['sub', '@stok/sub-drop'],
  ],

  // Semua cue memakai C.<Scene> + n, diselaraskan dengan jadwal di agentic-tutorial.jsx.
  cue: ({C}) => {
    const q = (at, nama, gain, nada = 0) => ({at, nama, gain, nada});
    const klik = (t, n = 0) => q(t, 'klik', 0.18, n);
    const tombol = (t, n = 0) => q(t, 'tombol', 0.26, n);
    const ketik = (t0, n, gap = 0.12) => Array.from({length: n}, (_, i) => q(t0 + i * gap, 'klik', 0.09, 1 + (i % 2)));
    const [I, G, S, K, Sn, Tm, Md, Pg, Ot, Bl, Ti, Ou] = ['Intro', 'Gratis', 'Saldo', 'Kunci', 'Salin', 'Tempel', 'Model', 'Pengetahuan', 'Otomatis', 'Balas', 'Tips', 'Outro'].map((n) => C[n]);
    return [
      // Intro: harga CRM dengan AI Agent, "jutaan rupiah", dicoret
      q(I + 0.25, 'pop', 0.26), q(I + 5.4, 'pop', 0.22, 2), q(I + 7.0, 'sapu', 0.16), q(I + 7.1, 'pop', 0.10, 1),

      // Gratis: reveal (tanpa hentakan besar), lalu alur biaya
      q(G + 0.1, 'sapu', 0.14), q(G + 2.2, 'pop', 0.30), q(G + 2.25, 'chime', 0.18), q(G + 3.0, 'pop', 0.20, 2), q(G + 3.05, 'centang', 0.14),
      q(G + 4.7, 'sapu', 0.14), q(G + 5.0, 'pop', 0.20, 1), q(G + 5.7, 'sapu', 0.12), q(G + 6.3, 'pop', 0.20, 3), q(G + 6.35, 'chime', 0.10),

      // Saldo: jendela naik, Credits, Add Credits
      q(S - 0.8, 'sapu', 0.14), klik(S + 3.0), q(S + 3.05, 'sapu', 0.12), tombol(S + 4.4), q(S + 4.45, 'pop', 0.12, 3),

      // Kunci: API Keys, New Key, nama, Expiration, Credit limit, Create
      klik(K + 1.5), q(K + 1.55, 'sapu', 0.12), tombol(K + 2.9), q(K + 3.0, 'pop', 0.14, 2), klik(K + 3.2),
      ...ketik(K + 3.4, 6, 0.12),
      klik(K + 4.45), q(K + 4.5, 'pop', 0.12, 2), klik(K + 5.0), q(K + 5.05, 'pop', 0.12, 3),
      tombol(K + 6.0), q(K + 6.1, 'centang', 0.14, 2), q(K + 6.2, 'pop', 0.14, 3),

      // Salin: Copy, kunci tampil sekali
      klik(Sn + 1.2), klik(Sn + 1.3, 1), q(Sn + 1.35, 'salin', 0.18), q(Sn + 1.9, 'pop', 0.20, 4), q(Sn + 1.95, 'chime', 0.10),

      // Tempel: tab Konektor, Agent & model, tempel, Uji kunci, Simpan
      klik(Tm + 0.6), q(Tm + 0.65, 'sapu', 0.14), klik(Tm + 2.7), q(Tm + 2.75, 'sapu', 0.12), klik(Tm + 4.0),
      q(Tm + 4.4, 'salin', 0.16), q(Tm + 4.45, 'pop', 0.12, 4),
      tombol(Tm + 5.5), q(Tm + 6.3, 'pop', 0.14, 2), q(Tm + 6.35, 'chime', 0.12),
      tombol(Tm + 7.0), q(Tm + 7.1, 'centang', 0.16, 3), q(Tm + 7.15, 'chime', 0.10),

      // Model: gulir ke Model per tugas
      q(Md + 0.0, 'sapu', 0.12), klik(Md + 3.0), q(Md + 3.05, 'pop', 0.12, 2),

      // Pengetahuan: tab, Tambah sumber, Tanya-jawab, isi, Simpan dan proses
      q(Pg - 0.2, 'sapu', 0.10), klik(Pg + 0.7), q(Pg + 0.75, 'sapu', 0.12), tombol(Pg + 1.7), q(Pg + 1.8, 'pop', 0.12, 2),
      klik(Pg + 2.3), q(Pg + 2.4, 'pop', 0.14, 3), klik(Pg + 2.55), ...ketik(Pg + 2.7, 4, 0.12),
      klik(Pg + 3.35), ...ketik(Pg + 3.5, 5, 0.12), klik(Pg + 4.3), ...ketik(Pg + 4.5, 6, 0.14),
      tombol(Pg + 5.75), q(Pg + 5.85, 'centang', 0.14, 1), q(Pg + 6.7, 'pop', 0.16, 3), q(Pg + 6.72, 'chime', 0.12),

      // Otomatis: Balas otomatis, konfirmasi, Simpan, Serah ke tim
      klik(Ot + 0.4), q(Ot + 0.45, 'sapu', 0.12), klik(Ot + 1.4), q(Ot + 1.5, 'pop', 0.14, 2), tombol(Ot + 2.2), q(Ot + 2.3, 'centang', 0.14, 2),
      tombol(Ot + 2.9), q(Ot + 3.0, 'centang', 0.14, 3), q(Ot + 3.05, 'chime', 0.10), klik(Ot + 3.5), q(Ot + 3.55, 'sapu', 0.12),
      klik(Ot + 4.3), q(Ot + 4.4, 'pop', 0.14, 2), tombol(Ot + 5.4), q(Ot + 5.5, 'centang', 0.14, 1),

      // Balas: Kotak Masuk; SATU-SATUNYA hentakan besar di balasan pertama agent (Balas + 2,7 dtk)
      klik(Bl + 0.25), q(Bl + 0.3, 'sapu', 0.12), q(Bl + 0.9, 'pop', 0.20, 2),
      q(Bl + 1.2, 'riser', 0.22), q(Bl + 2.5, 'hisap', 0.20),
      q(Bl + 2.7, 'impact', 0.42), q(Bl + 2.72, 'sub', 0.32),
      q(Bl + 3.2, 'centang', 0.16, 3), q(Bl + 3.35, 'jadi', 0.14), q(Bl + 3.7, 'sapu', 0.10),

      // Tips: Credit limit
      q(Ti + 0.0, 'sapu', 0.12), q(Ti + 0.5, 'pop', 0.14, 2), q(Ti + 0.55, 'chime', 0.12),
      q(Ti + 1.0, 'pop', 0.16, 3), q(Ti + 1.05, 'chime', 0.10), q(Ti + 3.2, 'pop', 0.16, 4), q(Ti + 3.25, 'chime', 0.12),

      q(Ou + 0.9, 'sapu', 0.12), q(Ou + 1.0, 'pop', 0.22),
    ];
  },

  musik: [{
    nama: 'bgm',
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'words', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'quiet intro', 'fade in', 'sparse'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const dasar = ['clean modern product-demo instrumental', '112 BPM', 'steady and continuous', 'always present',
        'light shaker', 'soft pluck', 'no vocals'];
      return [
        b(0, C.Tempel, '[focus]', [...dasar, 'focused groove from the very first beat', 'warm and clear']),
        b(C.Tempel, C.Balas, '[flow]', [...dasar, 'a little fuller', 'soft arpeggio', 'forward motion']),
        b(C.Balas, total, '[lift]', [...dasar, 'brighter', 'open', 'same groove']),
        b(total, total + 8, '[tail]', [...dasar, 'brighter groove continues']),
      ];
    },
    // Bed samar (-27 dB). Satu tukikan sengaja tepat sebelum hentakan balasan agent (Balas + 2,7 dtk).
    titik: [
      ['Intro', 0, -27],
      ['Balas', 2.50, -27], ['Balas', 2.60, -36], ['Balas', 2.82, -26],
      ['Outro', 0, -27],
    ],
    fadeOut: ({total}) => [total - 0.35, 0.35],
  }],

  sampul: {detik: 1.6},
  mixer: {gainVO: 1.60, gainSFX: 0.90, duckMusik: {th: 0.03, ratio: 8, attack: 20, release: 280}},
};
