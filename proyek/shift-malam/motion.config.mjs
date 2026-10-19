// "SHIFT MALAM" — trailer horor 32,5 detik. Karya Surya Wisesa. Jalankan: motion all
//
// Bukan iklan: tidak ada CTA, tidak ada merek, dan sunyi dipakai sebagai alat.
// Sumber cue = `Audio - Shift Malam.md` yang ikut di dalam zip, DIKOREKSI terhadap
// komposisinya di titik yang berbeda (lihat catatan di tiap blok).
//
// DURASI SCENE TIDAK BOLEH BERUBAH. `trailer.jsx` memuat satu array detik ABSOLUT —
// `blinkAt()`: fast [1.4 3.6 6.4 10.8 14.6 18.2 21.4] · slow [24.6 27.4]. Kedip lampu itu
// tidak ikut bergeser kalau scene melar, jadi seluruh SFX kedip akan meleset dari gambarnya.
// Karena itu tiap baris VO diberi `maks` yang muat di dalam scene-nya, dan `ekorBiasa`
// dipangkas ke 0,05.
export default {
  nama: 'shift-malam',
  komposisi: 'Trailer Shift Malam.dc.html',
  jsx: 'trailer.jsx',
  // Kapsi sudah ditulis tangan di dalam komposisi dengan jendela `until` sendiri, dan
  // bentuknya `<Captions items={[...]}>` — bukan `const caps = [...]` yang bisa digeser
  // mesin. VO-lah yang dipaskan ke kapsi, bukan sebaliknya.
  kapsi: false,
  keluaran: 'shift-malam.mp4',

  // Firman: pria dewasa, narrative_story, 14,1 kar/dtk pada speed 0,9 (diukur).
  // Baris terpendek ("Sampai malam ini.", 17 kar) harus muat 1,25 detik -> speed 0,95.
  suara: {id: 'i8CJLmX03JoyL7Dl2LaT', seed: 20260907, speed: 0.95,
          stability: 0.35, similarity: 0.80, style: 0.25},

  lafal: {},

  // Empat baris, tiap satunya jatuh tepat di jendela kapsi yang sudah ada di komposisi:
  // 0,9-3,3 · Gerak+2,7-3,9 · Sadar+0,9-2,6 · Sadar+3,0-4,8.
  vo: [
    {no: 1, sc: 'Gudang', off: 0.90, maks: 2.30, text: 'Setiap malam selalu sama.'},
    {no: 2, sc: 'Gerak',  off: 2.70, maks: 1.25, text: 'Sampai malam ini.'},
    {no: 3, sc: 'Sadar',  off: 0.90, maks: 1.60, text: 'Isi kotaknya kosong.'},
    {no: 4, sc: 'Sadar',  off: 3.00, maks: 1.80, text: 'Seperti dirinya.'},
  ],

  tata: {mode: 'jangkar', jeda: 0.15, ekorBiasa: 0.05},

  sfx: [
    ['hum-neon',     3.0, 'Fluorescent tube light electrical hum starting up, buzzing ballast, close mic'],
    ['step',         1.2, 'Single slow footstep on bare concrete floor, rubber sole, large empty warehouse reverb'],
    ['flicker',      1.2, 'Fluorescent light flickering, rapid electrical stutter and buzz'],
    ['flicker-rise', 1.6, 'Fluorescent tube flicker with rising electrical whine, ominous'],
    ['cloth',        1.0, 'Cotton work shirt fabric rustle, small movement, close'],
    ['whoosh-dark',  1.4, 'Short low air whoosh camera push, dark, no impact'],
    ['box-settle',   1.4, 'Cardboard box shifting very slightly on a metal shelf, tiny scrape, unsettling'],
    ['thump1',       1.5, 'Single dull thump from inside a closed cardboard box, like a fist hitting it from within, dry and close'],
    ['box-crackle',  1.2, 'Cardboard flexing and crackling after an impact, short, dry'],
    ['thump2',       1.8, 'Hard thump from inside a cardboard box, the box scrapes a few centimetres across a metal shelf, gritty'],
    ['rack-ring',    2.2, 'Steel shelving rack resonating after a hit, low metallic ring, reverberant warehouse'],
    ['gasp',         1.2, 'Sharp inhale gasp, male, scared, very close mic'],
    ['sting',        1.4, 'Short violent violin string stab, horror sting, one hit'],
    ['thump3',       2.0, 'Three fast violent thumps from inside a cardboard box, desperate, hollow, close'],
    ['sleeve',       1.0, 'Work shirt sleeve fabric stretch, arm raising, close'],
    ['hand-tap',     1.0, 'Hand palm touching a dry cardboard surface, soft hollow tap'],
    ['box-drag',     2.4, 'Cardboard box dragged off a metal shelf, long grinding scrape, cardboard flexing under weight'],
    ['box-catch',    1.4, 'Cardboard box thumping into two hands, dull, contents shifting softly inside'],
    ['inside-shift', 1.4, 'Something soft shifting inside a cardboard box, very faint, close'],
    ['breath-hold',  1.6, 'Held breath then a trembling exhale through the nose, close mic'],
    ['tape-peel',    2.2, 'Packing tape slowly peeled off cardboard, sticky, close mic'],
    ['flap-open',    2.0, 'Cardboard box flaps opening slowly, dry cardboard creak and pop, close mic'],
    ['riser-glass',  3.0, 'Rising high frequency shimmer riser, glassy, no impact'],
    ['white-swell',  2.4, 'Pure white noise swelling with a 1kHz sine tone rising, clinical, sterile'],
    ['cut-click',    0.8, 'Abrupt digital cut to silence, single sharp click'],
    ['tinnitus',     3.0, 'High pitched tinnitus tone in complete silence, steady'],
    ['tick',         0.6, 'Single soft digital tick, terminal cursor blink, dry, tiny'],
    ['derender',     2.6, 'World de-rendering, glass and data shattering into digital particles, granular crunch, reversed reverb'],
    ['sub-drop',     2.2, 'Deep sub bass drop, cinematic, dark tail'],
    ['glitch',       2.0, 'Intermittent digital glitch bursts, bit-crushed static, unsettling'],
    ['vanish',       1.6, 'Metallic structure vanishing into a digital whoosh, pitched down'],
    ['heartbeat',    2.2, 'Slow human heartbeat, two beats, deep and close'],
    ['cursor-whine', 1.4, 'Two soft terminal cursor ticks with a faint electronic whine'],
    ['title-impact', 3.0, 'Massive cinematic horror title impact, distorted low brass hit with a metal tail, huge reverb'],
    ['cymbal-rev',   2.4, 'Reverse cymbal swell rising into a hard stop, dark'],
    ['whisper-far',  1.4, 'Very faint distorted whisper, unintelligible, far away'],
  ],

  /* Tiap hentakan di layar wajib punya bunyinya sendiri. Tiga dentuman kotak dipatok ke
     impuls yang benar-benar ada di `trailer.jsx` (`imp(T, CUES.Gerak + 0.65 / 1.5 / 2.75`),
     bukan ke angka di dokumen — dokumennya kebetulan sama, dan itu diperiksa satu per satu.

     Dua koreksi terhadap dokumen, keduanya karena komposisi yang menang:
     - dengung putih: dokumen 18,4; `white` di jsx baru mulai Blank-1,1 = 19,4 -> dipakai 19,0
     - dunia rontok: dokumen 23,5; `dr` di jsx mulai Sadar-0,5 = 23,0 -> dipakai 23,45,
       supaya Blank tetap benar-benar kosong sampai batasnya. */
  cue: ({C}) => {
    const q = (at, nama, gain, o = {}) => ({at, nama, gain, ...o});
    return [
      // Gudang 0,0-4,5
      q(0.00, 'hum-neon', 0.22),
      q(0.30, 'step', 0.26, {pan: -0.30}),
      q(1.10, 'step', 0.24, {pan: -0.20, nada: -1}),
      q(1.40, 'flicker', 0.28),
      q(1.90, 'step', 0.26, {pan: -0.10, nada: 1}),
      q(2.20, 'cloth', 0.18),
      q(3.60, 'flicker-rise', 0.28),

      // Kotak 4,5-8,0 — potongan kamera lalu debu dan sunyi
      q(C.Kotak, 'whoosh-dark', 0.30),
      q(6.40, 'flicker', 0.20, {nada: 2}),
      q(7.40, 'box-settle', 0.26, {pan: 0.35}),

      // Gerak 8,0-12,0 — inti horor
      q(C.Gerak + 0.65, 'thump1', 0.42, {pan: 0.30}),
      q(C.Gerak + 0.75, 'box-crackle', 0.30, {pan: 0.30}),
      q(C.Gerak + 1.50, 'thump2', 0.48, {pan: 0.30}),
      q(C.Gerak + 1.60, 'rack-ring', 0.34, {pan: 0.25}),
      q(C.Gerak + 2.00, 'gasp', 0.38),
      q(C.Gerak + 2.05, 'sting', 0.34),
      q(C.Gerak + 2.75, 'thump3', 0.52, {pan: 0.20}),
      q(C.Gerak + 3.20, 'box-settle', 0.24, {pan: 0.20}),

      // Ambil 12,0-16,0
      q(C.Ambil + 0.15, 'sleeve', 0.20),
      q(C.Ambil + 0.60, 'hand-tap', 0.24),
      q(C.Ambil + 1.00, 'box-drag', 0.38, {pan: 0.25}),
      q(C.Ambil + 1.90, 'box-catch', 0.38),
      q(C.Ambil + 2.40, 'inside-shift', 0.22),
      q(C.Ambil + 3.30, 'breath-hold', 0.26),

      // Buka 16,0-20,5
      q(C.Buka + 0.40, 'tape-peel', 0.30),
      q(C.Buka + 0.90, 'flap-open', 0.34),
      q(C.Buka + 1.60, 'riser-glass', 0.30),
      q(C.Buka + 2.20, 'whoosh-dark', 0.28, {nada: -3}),
      q(18.20, 'flicker', 0.18, {nada: 3}),
      q(19.00, 'white-swell', 0.36),
      q(C.Blank - 0.05, 'cut-click', 0.34),

      // Blank 20,5-23,5 — sunyi adalah senjata; hanya tinnitus dan kursor
      q(C.Blank + 0.02, 'tinnitus', 0.18),
      q(C.Blank + 0.50, 'tick', 0.22),
      q(C.Blank + 1.50, 'tick', 0.22),
      q(C.Blank + 2.50, 'tick', 0.22),

      // Sadar 23,5-28,5 — dunia rontok jadi data
      q(C.Sadar - 0.05, 'derender', 0.44),
      q(C.Sadar + 0.20, 'sub-drop', 0.42),
      q(C.Sadar + 0.50, 'glitch', 0.26),
      q(24.60, 'flicker', 0.20, {nada: -2}),
      q(C.Sadar + 2.10, 'vanish', 0.30, {pan: -0.35}),
      q(C.Sadar + 2.50, 'glitch', 0.22, {nada: 2}),
      q(C.Sadar + 2.90, 'heartbeat', 0.32),
      q(27.40, 'flicker', 0.18, {nada: -3}),
      q(C.Sadar + 3.90, 'cursor-whine', 0.26),

      // Judul 28,5-32,5 — SATU hentakan berlapis empat, sekali saja per video
      q(C.Judul - 1.30, 'riser-glass', 0.30, {nada: -4}),
      q(C.Judul - 0.60, 'cymbal-rev', 0.32),
      q(C.Judul, 'title-impact', 0.55),
      q(C.Judul + 0.02, 'sub-drop', 0.45, {nada: -2}),
      q(C.Judul + 1.90, 'tick', 0.24),
      q(C.Judul + 3.10, 'whisper-far', 0.22),
    ];
  },

  /* Tiga trek, bukan satu. Blank 20,5-23,5 harus benar-benar kosong, dan meminta generator
     membuat bagian "near silence" adalah cara yang sudah terbukti menghasilkan lubang
     (IKLAN.md §1). Jadi lubangnya dibuat dengan TIDAK memutar musik di situ: `bgm` berhenti
     di 20,5 dan `bgm-d` baru mulai di 23,5. */
  musik: [
    {
      nama: 'amb',
      detik: 26,
      mulai: 0,
      titik: [['Gudang', 0, -26], ['Kotak', 0, -25], ['Gerak', 0, -24],
              ['Ambil', 0, -25], ['Buka', 0, -26], ['Blank', -0.4, -30]],
      fadeOut: () => [20.30, 0.20],
      prompt: 'Empty concrete warehouse room tone at night. One continuous deep air '
        + 'conditioning rumble that never stops, a steady fluorescent light electrical hum '
        + 'with a constant 50Hz buzz, always present from the first second to the last. '
        + 'Faint far-away traffic through a thick wall. No melody, no voices, no percussion.',
    },
    {
      nama: 'bgm',
      detik: 25,
      mulai: 0,
      // Naik pelan sampai kotak terbuka, lalu berhenti tanpa penyelesaian di batas Blank.
      titik: [['Gudang', 0, -20], ['Kotak', 0, -19], ['Gerak', 0, -17],
              ['Ambil', 0, -16], ['Buka', 0, -14], ['Buka', 3.5, -11], ['Blank', -0.2, -13]],
      fadeOut: () => [20.30, 0.20],
      rencana: () => {
        const H = ['vocals', 'drums', 'heavy four-on-the-floor kick', 'trap 808',
                   'silence', 'fade out', 'empty gaps'];
        return [
          {detik: 8.0, teks: '[intro]',  gaya: ['dark ambient horror score', 'one sustained low drone in D minor', 'metallic room resonance', 'always present and continuous', 'unsettling'], hindari: H},
          {detik: 4.0, teks: '[unease]', gaya: ['dark ambient horror', 'dissonant high string harmonic entering', 'steady and continuous low drone underneath', 'growing wrongness'], hindari: H},
          {detik: 4.5, teks: '[build]',  gaya: ['horror tension cue', 'bowed double bass tremolo rising in pitch', 'insistent ticking granular pulse getting closer', 'continuous'], hindari: H},
          {detik: 4.0, teks: '[peak]',   gaya: ['dissonant string cluster swelling', 'high tension', 'ends unresolved on one held note', 'no impact hit'], hindari: H},
          // Bagian buangan. TIDAK dipakai (trek dipotong di 20,5) — dia ada supaya fade-out
          // bawaan generator jatuh di sini, bukan di tengah scene Buka. Trek versi 20,06
          // detik turun 16 dB mulai detik 18,5 dan `check` melaporkannya sebagai bed bolong.
          {detik: 4.5, teks: '[tail]',   gaya: ['same dissonant string cluster held', 'continuous', 'no resolution'], hindari: H},
        ];
      },
    },
    {
      nama: 'bgm-d',
      detik: 9,
      mulai: ({C}) => C.Sadar,
      /* Satu tukikan yang disengaja tepat sebelum hentakan terbesar (IKLAN.md §1):
         -13 -> -24 dB dalam 0,45 detik, lalu meledak masuk di kartu judul. Mixer akan
         memperingatkannya; di titik ini peringatan itu memang diharapkan. */
      titik: [['Sadar', 0, -18], ['Sadar', 1.5, -15], ['Sadar', 3.6, -13],
              ['Judul', -0.45, -24], ['Judul', 0, -9], ['Judul', 2.2, -13], ['Judul', 3.6, -24]],
      fadeOut: ({total}) => [total - 0.4, 0.40],
      rencana: () => {
        const H = ['vocals', 'heavy four-on-the-floor kick', 'trap 808', 'silence', 'empty gaps'];
        return [
          {detik: 3.0, teks: '[collapse]', gaya: ['digital horror', 'granular glitch textures shredding a choir sample', 'continuous crunch', 'reversed reverb'], hindari: H},
          {detik: 3.0, teks: '[drop]',     gaya: ['deep sub bass drop', 'distorted synth brass swell', 'cinematic horror climax', 'always present'], hindari: H},
          {detik: 3.0, teks: '[title]',    gaya: ['one massive distorted impact then a long low tail', 'dark cinematic title card', 'metallic decay'], hindari: H},
        ];
      },
    },
  ],

  // Trailer horor: SFX yang memimpin, bukan musik. VO nyaris bisik jadi dinaikkan.
  mixer: {
    lufsTarget: -14.5,
    gainVO: 1.80, gainSFX: 0.92,
    duckMusik: {th: 0.03, ratio: 8, attack: 40, release: 300},
    bedMusik: {hpf: 80, subF: 115, subG: -9},
  },

  periksa: {busTitik: [2, 9, 14, 18, 22, 26, 30]},
};
