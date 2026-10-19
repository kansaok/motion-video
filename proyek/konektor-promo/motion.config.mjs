// "Apa itu Konektor?" V4 — video YouTube 16:9. Jalankan: motion all
//
// Bukan iklan: tidak ada penawaran. Brief lengkap ada di src/prompt.md.
// Sumber: Claude Design e56fa4f6-5264-4855-86be-93fa3520c511 (Konektor Promo.dc.html).
//
// Keputusan yang tidak terbaca dari kode:
// 1. Subtitle, navigasi adegan, dan panduan end screen DIMATIKAN di TWEAK_DEFAULTS.
//    Brief meminta subtitle diunggah sebagai .srt (srt.mjs), bukan dibakar ke video.
// 2. Detik cue diambil dari ekspresi animasi di konektor-promo.jsx, bukan dari cue sheet
//    brief. Contoh: glitch iOS menyala di Sejarah + 19,5 dan pulih di + 20,5, bukan 30,9.
// 3. Sonic logo = satu nada yang digeser +7 semitone (kuint), bukan dua generate.
//
// Revisi 1 (umpan balik Rama, 29 Sep 2026):
// - Dua sunyi 0,8 dtk dari brief DIHAPUS: terdengar sebagai "ada jeda". Sebelum "Buta."
//   sekarang ada satu tukikan musik, bukan senyap total.
// - Naskah lebih santai; Penutup ditutup ajakan "Konek Agent Anda ke MCP Konektor".
// - Intonasi lebih hidup: style 0,30 -> 0,65, stability 0,40 -> 0,22.
// - "AI" ditulis "ei-ai": "ei ai" terbaca "ei a i" di 1:11. "CRM" dibiarkan: "si er em"
//   memberi jeda 0,26 dtk sesudahnya (diuji, lihat IKLAN.md §3).
// - BGM baru 130 BPM: satu era dashboard (3,7 dtk) = dua bar.
// - Gambar dari gambar.mjs: latar, foto tiap era, gembok, sinar logo, end card.

const HINDARI = ['vocals', 'singing', 'choir', 'lyrics', 'spoken word', 'heavy four-on-the-floor kick',
  'booming sub bass', 'trap 808', 'EDM drop', 'dubstep', 'distorted guitar', 'aggressive'];

export default {
  nama: 'konektor-promo',
  komposisi: 'Konektor Promo.dc.html',
  keluaran: 'konektor-apa-itu-konektor-16x9.mp4',

  suara: {id: '1k39YpzqXZn52BgyLyGO', seed: 20260930, speed: 1.10, stability: 0.22, similarity: 0.80, style: 0.65},

  // Teks layar tidak disentuh. MCP = em-si-pi dan ROAS = ro-as dari brief.
  lafal: {
    '2000-an': 'dua ribuan', MCP: 'em si pi', AI: 'ei-ai', WhatsApp: 'wasap', ROAS: 'roas',
    dashboard: 'desbord', Campaign: 'kempen', lead: 'lid', closing: 'klosing', template: 'templet',
    budget: 'bajet', 'di-follow up': 'di folow ap',
  },

  vo: [
    // Hook: kalimat Rama, verbatim.
    {no: 1, sc: 'Hook', off: 0.40, text: 'Saya mau ajak Anda mengenal perkembangan marketing dari tahun 2000-an sampai sekarang.'},
    {no: 2, sc: 'Hook', off: 6.20, text: 'Yang ujungnya mungkin bikin Anda menggaruk kepala.'},

    // Satu baris per era, 0,8 dtk sesudah era menyala (ERA_L 3,7 dtk).
    {no: 3, sc: 'Sejarah', off: 0.80, text: 'Iklan mulai mengikuti kata kunci.'},
    {no: 4, sc: 'Sejarah', off: 4.50, text: 'Siapa saja bisa beriklan.'},
    {no: 5, sc: 'Sejarah', off: 8.20, text: 'Pelanggan jadi target baru.'},
    {no: 6, sc: 'Sejarah', off: 11.90, text: 'Setiap klik mulai tercatat.'},
    {no: 7, sc: 'Sejarah', off: 15.60, text: 'Mesin mulai membagi budget.'},
    {no: 8, sc: 'Sejarah', off: 19.30, text: 'Tapi, ada satu hal yang nggak pernah kita ukur.'},
    {no: 9, sc: 'Sejarah', off: 23.00, text: 'Mesin memutuskan lebih banyak.'},
    {no: 10, sc: 'Sejarah', off: 26.70, text: 'AI bisa memakai alat kerja.'},
    {no: 11, sc: 'Sejarah', off: 30.40, text: 'AI mulai membaca data iklan.'},
    {no: 12, sc: 'Sejarah', off: 33.60, text: 'Dua puluh enam tahun, semuanya bisa diukur.'},
    {no: 13, sc: 'Sejarah', off: 37.20, text: 'Kecuali satu.'},

    // Twist: "Buta." menghantam di + 4,0. Dua kalimat pendek digabung supaya tidak terputus.
    {no: 14, sc: 'Twist', off: 0.30, text: 'Sekarang, coba tanya ke AI.'},
    {no: 15, sc: 'Twist', off: 4.40, text: 'AI paling pintar sedunia pun nyerah.'},
    {no: 16, sc: 'Twist', off: 6.75, text: 'Bukan karena dia bodoh, tapi karena dia nggak bisa lihat chat Anda.'},
    {no: 17, sc: 'Twist', off: 11.20, text: 'Terus, gimana biar dia bisa lihat?'},

    {no: 18, sc: 'Konektor', off: 0.60, text: 'Konektor adalah lapisan data yang menghubungkan CRM, chat WhatsApp, dan iklan Anda ke AI.'},
    {no: 19, sc: 'Konektor', off: 7.40, text: 'Tinggal colok CRM Anda ke Konektor.'},
    {no: 20, sc: 'Konektor', off: 12.20, text: 'Konektor langsung baca iklan, lead, dan chat Anda.'},
    {no: 21, sc: 'Konektor', off: 17.40, text: 'Lalu, satu MCP bawa semuanya ke Agent Anda.'},
    {no: 22, sc: 'Konektor', off: 22.30, text: 'Sekarang, bisa nggak dia jawab?'},

    // Payoff: A = +9 (audit chat), Ld = +31 (lead), Cp = +41 (campaign).
    {no: 23, sc: 'Payoff', off: 0.40, text: 'Tambahkan Konektor di Agent.'},
    {no: 24, sc: 'Payoff', off: 3.20, text: 'Cari, izinkan, langsung tersambung.'},
    {no: 25, sc: 'Payoff', off: 7.20, text: 'Terus, tanya hal yang sama.'},
    {no: 26, sc: 'Payoff', off: 11.00, text: 'Nah, sekarang dia bisa jawab.'},
    {no: 27, sc: 'Payoff', off: 15.40, text: 'Ada yang chat tiga kali, tapi baru dibalas lima jam kemudian.'},
    {no: 28, sc: 'Payoff', off: 19.60, text: 'Harga udah dikirim, tapi nggak di-follow up.'},
    {no: 29, sc: 'Payoff', off: 23.80, text: 'Ada juga yang cuma dibalas template, terus ditinggal.'},
    {no: 30, sc: 'Payoff', off: 28.20, text: 'Pantes aja pembelinya pada kabur.'},
    {no: 31, sc: 'Payoff', off: 33.90, text: 'Dia juga tahu lead mana yang layak dikejar.'},
    {no: 32, sc: 'Payoff', off: 37.60, text: 'Dan di tahap mana mereka mandek.'},
    {no: 33, sc: 'Payoff', off: 41.40, text: 'Campaign mana yang bagus, dan mana yang cuma bagus di dashboard.'},
    {no: 34, sc: 'Payoff', off: 46.20, text: 'ROAS-nya bagus, closing-nya nol. Kita semua pernah, kan?'},

    // Penutup: logo masuk di + 6,3 (L0), tombol ajakan di + 7,8.
    {no: 35, sc: 'Penutup', off: 0.30, text: 'Colok CRM apa pun.'},
    {no: 36, sc: 'Penutup', off: 2.30, text: 'Sambungkan satu MCP ke Agent.'},
    {no: 37, sc: 'Penutup', off: 4.80, text: 'Tanya apa saja.'},
    {no: 38, sc: 'Penutup', off: 6.60, text: 'Konektor.'},
    // Ajakan = kalimat terakhir, intonasi paling kuat (preferensi tetap Rama). Kata = teks tombol.
    {no: 39, sc: 'Penutup', off: 7.80, text: 'Konek Agent Anda ke MCP Konektor, dan rasakan keajaiban baru!', style: 0.95, stability: 0.05},
  ],

  tata: {mode: 'jangkar', jeda: 0.15, ekorBiasa: 0.30, ekor: {Penutup: 0.05}},

  sfx: [
    // generate — tidak ada di stok
    ['tik',       0.5, 'Single precise mechanical clock tick, small and dry, close mic, one shot, no reverb'],
    ['flip',      0.6, 'Split-flap flip clock card flipping once, crisp plastic clack, dry, close mic, one shot'],
    ['pindai',    1.4, 'Soft digital scanner beam sweeping across a screen from left to right, airy and clean, dry, one shot'],
    ['gembok',    0.7, 'Metal padlock snapping shut, one crisp solid click-clack, dry, close mic, one shot'],
    ['piano',     3.0, 'One single high soft piano note left ringing, gentle and questioning, natural decay, one note only, no melody'],
    ['nada-logo', 1.2, 'One clean warm digital bell tone, a single pitched note, soft attack, smooth short decay, no reverb, one shot'],
    ['akor',      2.6, 'One warm major chord swelling softly on felt piano and warm pad, gentle resolution, clean decay, no percussion'],
    // stok
    ['neon', '@stok/hum-neon'],
    ['kilau', '@stok/10-shine'],
    ['sapu', '@stok/sapu'],
    ['kaca', '@stok/glass-tap'],
    ['ketik', '@stok/ketik--nayaka-explainer'],
    ['naik', '@stok/hitung-naik'],
    ['tarik', '@stok/10-zoom-out'],
    ['duk', '@stok/bass-duk'],
    ['kertas', '@stok/card-slide'],
    ['titik', '@stok/dot-cascade'],
    ['blip', '@stok/03-pop'],
    ['seret', '@stok/seret'],
    ['glitch', '@stok/glitch-short'],
    ['mati', '@stok/power-down'],
    ['nyala', '@stok/lampu-hum'],
    ['toggle', '@stok/klik'],
    ['soket', '@stok/konek-chunk'],
    ['sub-drop', '@stok/sub-drop'],
    ['kirim', '@stok/checkpoint'],
    ['titik-ketik', '@stok/blip'],
    ['pop', '@stok/chat-pop'],
    ['hantam', '@stok/cut-impact'],
    ['sub', '@stok/sub'],
    ['bloom', '@stok/dreamy-flash'],
    ['marimba', '@stok/marimba'],
    ['garis', '@stok/garis-tone'],
    ['hijau', '@stok/fill-rise'],
    ['aliran', '@stok/data-flow'],
    ['chime', '@stok/09-chime'],
    ['klik', '@stok/cursor-click'],
    ['gulir', '@stok/scroll-tick'],
    ['merah', '@stok/blip-error'],
    ['cymbal', '@stok/cymbal-rev'],
    ['drone', '@stok/drone-gelap'],
  ],

  cue: ({C, P: PV}) => {
    const q = (sc, off, nama, gain, nada = 0, pan = 0) => ({at: C[sc] + off, nama, gain, nada, pan});
    // Sonic logo 1,0 dtk: klik soket rendah → dua nada naik kuint → bloom hangat.
    const logo = (sc, off, k = 1) => [
      q(sc, off, 'soket', 0.20 * k, -5), q(sc, off + 0.08, 'nada-logo', 0.26 * k),
      q(sc, off + 0.32, 'nada-logo', 0.26 * k, 7), q(sc, off + 0.50, 'bloom', 0.20 * k),
    ];
    const H = 'Hook', J = 'Sejarah', W = 'Twist', K = 'Konektor', P = 'Payoff', N = 'Penutup';
    const L = 3.7, ENDE = 9 * L, L0 = 6.3;
    // Denyut ubin Chat mengikuti puncak sin(3,2 T) di komposisi — T absolut.
    const denyut = [];
    for (let k = 0; k < 200; k++) {
      const t = (Math.PI / 2 + 2 * Math.PI * k) / 3.2;
      if (t > C[J] + ENDE + 0.2 && t < C[W] - 0.2) denyut.push({at: t, nama: 'duk', gain: 0.16, nada: -5});
    }
    const era = (i) => i * L;
    const A = 9, Ld = 31, Cp = 41;
    return [
      // ── Hook: detak jam sampai 3,0, flip-clock menyala di 0,6. Drone gelap mengisi pembuka.
      q(H, 0, 'drone', 0.10),
      ...[0, 0.5, 1.0, 1.5, 2.0, 2.5].map((t, i) => q(H, t, 'tik', 0.20, 0, i % 2 ? 0.15 : -0.15)),
      q(H, 0.60, 'flip', 0.26), q(H, 0.60, 'neon', 0.12),
      q(H, 0.80, 'kilau', 0.14),
      q(H, 2.60, 'sapu', 0.10),
      q(H, 3.00, 'kaca', 0.14),
      q(H, 3.80, 'ketik', 0.12), q(H, 5.00, 'ketik', 0.12, 1),
      q(H, 5.60, 'naik', 0.10),
      q(H, 9.00, 'tarik', 0.12),

      // ── Sejarah: flip tiap era, nada naik setengah langkah (C4 → G#4)
      q(J, 0, 'duk', 0.26),
      ...Array.from({length: 9}, (_, i) => q(J, era(i), 'flip', 0.24, i)),
      ...Array.from({length: 8}, (_, i) => q(J, era(i + 1), 'sapu', 0.08)),
      ...Array.from({length: 8}, (_, i) => q(J, era(i + 1) + 0.55, 'kaca', 0.12, i % 3)),
      q(J, era(0) + 1.95, 'blip', 0.14),                                    // "Iklan · Toko A"
      q(J, era(1) + 0.60, 'kertas', 0.20),                                  // kartu iklan sidebar
      q(J, era(2) + 1.35, 'titik', 0.10),                                   // titik biru menyebar
      ...[0.85, 1.45, 2.05].map((o, i) => q(J, era(3) + o, 'blip', 0.16, [0, 3, 7][i])),   // 3 event pixel
      q(J, era(4) + 0.60, 'seret', 0.16), q(J, era(4) + 1.90, 'seret', 0.12, 2),
      q(J, era(5) + 0.75, 'pop', 0.14),                                     // dialog iOS
      q(J, era(5) + 1.00, 'glitch', 0.22), q(J, era(5) + 1.05, 'mati', 0.18),
      q(J, era(5) + 2.00, 'nyala', 0.20), q(J, era(5) + 2.65, 'blip', 0.14, 5),   // Conversions API
      q(J, era(6) + 1.55, 'toggle', 0.22),
      q(J, era(7) + 1.95, 'soket', 0.24),
      q(J, era(8) + 0.95, 'pindai', 0.16),
      q(J, ENDE, 'tarik', 0.10), q(J, ENDE + 0.10, 'neon', 0.10),
      ...denyut,
      {at: C[W] - 1.8, nama: 'sapu', gain: 0.10, nada: -2},

      // ── Twist: ketik → kirim → titik → jawaban → gembok → tukikan musik → "Buta."
      q(W, 0, 'sapu', 0.12), q(W, 0, 'sub-drop', 0.20),
      q(W, 0.30, 'ketik', 0.12),
      q(W, 2.00, 'kirim', 0.22),
      q(W, 2.20, 'titik-ketik', 0.10),
      q(W, 2.80, 'pop', 0.24),
      q(W, 3.00, 'gembok', 0.30),
      q(W, 4.00, 'hantam', 0.40), q(W, 4.02, 'sub', 0.36), q(W, 4.00, 'duk', 0.22, -3),
      {at: PV[17] - 0.05, nama: 'piano', gain: 0.18},                      // menggantung di "gimana..."

      // ── Konektor
      ...logo(K, 0.10),
      q(K, 2.00, 'kilau', 0.14),
      ...Array.from({length: 7}, (_, i) => q(K, 7.0 + i * 0.3, 'marimba', 0.16, [0, 2, 4, 7, 9, 12, 14][i], -0.3 + i * 0.05)),
      ...Array.from({length: 7}, (_, i) => q(K, 7.0 + i * 0.3, 'soket', 0.10, i)),
      q(K, 7.20, 'garis', 0.06),
      ...[13.0, 13.9, 14.8].map((o, i) => q(K, o, 'blip', 0.20, i * 7, 0.3)),
      q(K, 16.80, 'garis', 0.05, 5),
      q(K, 17.20, 'soket', 0.24),
      q(K, 18.40, 'chime', 0.18),
      q(K, 21.50, 'hijau', 0.18),
      q(K, 22.00, 'aliran', 0.08), q(K, 25.00, 'aliran', 0.07),
      {at: C[P] - 0.40, nama: 'sapu', gain: 0.10},

      // ── Payoff: sambung
      ...[1.4, 2.5, 4.2, 6.2].map((o) => q(P, o, 'klik', 0.24)),
      q(P, 2.80, 'ketik', 0.10, 2),
      ...logo(P, 3.30, 0.5),                                                // sonic logo -6 dB
      q(P, 6.80, 'chime', 0.20),
      ...[0, 1, 2, 3].map((i) => q(P, 7.0 + i * 0.12, 'kirim', 0.10, i * 2)),
      q(P, 7.40, 'ketik', 0.12),
      // audit chat
      q(P, A + 0.2, 'pop', 0.20), q(P, A + 0.7, 'blip', 0.10), q(P, A + 1.4, 'kirim', 0.14),
      q(P, A + 1.8, 'sapu', 0.08),
      q(P, A + 5.4, 'gulir', 0.10),
      ...[6.2, 10.4, 14.6].map((o) => q(P, A + o, 'sapu', 0.08)),
      ...[6.2, 10.4, 14.6].map((o, i) => q(P, A + o + 0.05, 'merah', 0.20, -i)),
      q(P, A + 18.2, 'gulir', 0.10),
      q(P, A + 18.6, 'akor', 0.22),
      // lead
      q(P, Ld + 0.2, 'pop', 0.20), q(P, Ld + 0.7, 'blip', 0.10), q(P, Ld + 1.4, 'kirim', 0.14),
      q(P, Ld + 2.8, 'sapu', 0.08), q(P, Ld + 2.85, 'blip', 0.14, 7),
      q(P, Ld + 6.6, 'sapu', 0.08), q(P, Ld + 6.65, 'merah', 0.14, 3),
      // campaign
      q(P, Cp + 0.2, 'pop', 0.20), q(P, Cp + 0.7, 'blip', 0.10), q(P, Cp + 1.4, 'kirim', 0.14),
      q(P, Cp + 3.0, 'sapu', 0.08), q(P, Cp + 3.05, 'blip', 0.14, 7),
      q(P, Cp + 5.6, 'sapu', 0.08), q(P, Cp + 5.65, 'merah', 0.22), q(P, Cp + 5.65, 'duk', 0.16),
      {at: C[N] - 0.60, nama: 'cymbal', gain: 0.14},

      // ── Penutup: klik soket lembut ×3 nada naik, logo, tombol ajakan
      ...[0.3, 2.3, 4.8].map((o, i) => q(N, o, 'marimba', 0.14, [0, 4, 7][i])),
      ...[0.3, 2.3, 4.8].map((o, i) => q(N, o, 'soket', 0.10, i * 2)),
      ...logo(N, L0),
      q(N, L0 + 0.8, 'kilau', 0.14),
      q(N, L0 + 1.5, 'blip', 0.22, 7), q(N, L0 + 1.5, 'hijau', 0.14),      // tombol ajakan muncul
      q(N, L0 + 3.9, 'chime', 0.12),                                        // "dan rasakan keajaiban baru"
    ];
  },

  // Bagian dipatok ke beat komposisi. 130 BPM: satu era (3,7 dtk) = dua bar.
  musik: [{
    nama: 'musik',
    mulai: 0,
    // Delapan bagian, bukan enam belas: tiap batas bagian memberi generator tempat untuk
    // breakdown. Versi 16 bagian terukur bolong di 0-9 dtk (-42 dB) dan 119,8-124,8 dtk (-34 dB).
    rencana: ({C, total}) => {
      const tolak = [...HINDARI, 'breakdown', 'silence', 'quiet intro', 'fade in', 'sparse'];
      const b = (dari, sampai, teks, gaya) => ({detik: Number((sampai - dari).toFixed(2)), teks, gaya, hindari: tolak});
      const J = C.Sejarah, W = C.Twist, K = C.Konektor, P = C.Payoff, N = C.Penutup;
      return [
        b(0, J, '[intro]', ['modern tech groove at 130 BPM, full energy from the very first second', 'ticking hi-hats and clock-like percussion',
          'warm analog synth chords', 'curious and intriguing', 'steady and continuous', 'always present']),
        b(J, J + 33.3, '[montage]', ['upbeat modern tech montage groove at 130 BPM', 'punchy claps and crisp hi-hats', 'plucky synth arpeggio',
          'a new layer every two bars, rising steadily', 'optimistic and driving', 'steady and continuous']),
        b(J + 33.3, J + 37.2, '[peak]', ['130 BPM', 'full euphoric peak', 'wide bright chords', 'big and exciting']),
        b(J + 37.2, K, '[tension]', ['tense half-time pulse at 130 BPM', 'low pulsing synth bass and ticking percussion', 'dark and mysterious',
          'an unresolved question', 'steady and continuous', 'always present']),
        b(K, P, '[reveal]', ['bright uplifting groove at 130 BPM', 'shimmering synth chords, warm piano, bouncy bass and claps',
          'hopeful and inspiring', 'builds to a triumphant chorus', 'full from the first beat', 'steady and continuous']),
        b(P, N, '[groove]', ['130 BPM', 'confident friendly modern groove', 'plucky synths, finger snaps, clean guitar chops, bass, claps',
          'curious and upbeat', 'steady and continuous', 'always present']),
        b(N, total, '[finale]', ['130 BPM', 'uplifting anthemic finale', 'big warm chords, bright synth lead, claps', 'inspiring and joyful',
          'ends on a strong resolved chord', 'always present']),
        {detik: 10, teks: '[tail]', gaya: ['warm chord resolving', 'steady and continuous'], hindari: HINDARI},
      ];
    },
    // Satu tukikan disengaja tepat sebelum "Buta." (IKLAN.md §1). Titik lain diukur ulang per
    // baris VO sesudah mix pertama.
    titik: [
      ['Hook', 0, -18], ['Hook', 9.5, -17],
      ['Sejarah', 0, -18], ['Sejarah', 31, -17], ['Sejarah', 37.2, -18], ['Sejarah', 39.8, -19],
      ['Twist', 3.10, -18], ['Twist', 3.55, -27], ['Twist', 4.00, -15], ['Twist', 5.0, -19], ['Twist', 12.0, -19],
      ['Konektor', 0.2, -17], ['Konektor', 20.8, -18], ['Konektor', 21.8, -15], ['Konektor', 25.5, -16],
      ['Payoff', 0.5, -18], ['Payoff', 5.5, -20], ['Payoff', 22, -20], ['Payoff', 27.6, -16], ['Payoff', 31, -18], ['Payoff', 49.0, -19],
      ['Penutup', 0.5, -18], ['Penutup', 5.7, -19], ['Penutup', 6.3, -17], ['Penutup', 19.0, -16],
    ],
    fadeOut: ({total}) => [total - 2.5, 2.4],
  }],

  mixer: {
    lufsTarget: -14,
    gainVO: 1.75, gainSFX: 0.70,
    duckMusik: {th: 0.015, ratio: 14, attack: 25, release: 320},
    bedMusik: {hpf: 70, subF: 100, subG: -6},
  },

  // YouTube memakai thumbnail kustom. Sampul = "Buta." sudah mendarat. Diisi sesudah plan.
  sampul: {detik: 54.4},

  // Titik A/B bus SFX di celah VO. Diisi sesudah plan.
  periksa: {busTitik: [54.1, 84.9, 96.2, 146.55]},
};
