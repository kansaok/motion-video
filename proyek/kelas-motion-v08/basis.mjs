// V08 · Iklan Kelas Motion, Rama Digital x AIClub — dua video beda hook (komentar, nol), CTA web.
// Tiap folder <hook>-web cuma berisi `export default buat('<hook>')`. Satu src, satu set SFX, satu BGM.
//
// Sumber brief: src/prompts/V08-kelas-motion-aiclub/prompt.md. Pola sama dengan V07
// (proyek/kelas-motion-v07). Yang menyimpang dari brief, dan sebabnya:
//
// 1. Suara Cahaya, bukan Wulan/Eleven v3: satu merek satu suara. Tag [excited] dll. diganti tanda baca.
// 2. Satu kalimat utuh per scene, supaya suara tidak terputus-putus (permintaan Rama 30 Sep 2026).
// 3. VO tidak membacakan judul kelas dan tanggal: keduanya sudah besar di layar. Naskah brief
//    keluar 33,6 dtk untuk komposisi 25,5 dtk.
// 4. CTA "Daftar sekarang di aiclub.id!" baris sendiri, kalimat terakhir, sama dengan tombol.
// 5. Beat animasi dipaku ke kata VO (transkrip `node ../kelas-motion-v07/kata.mjs`), bukan angka brief.
// 6. BGM chiptune lewat `rencana` (musik-gen.mjs). Generator menaruh drop di 23,0 dtk, bukan 22,3.
//    Kedua video melewati 0,75 dtk kepala trek (3 seperdelapan ketukan), jadi drop jatuh di Daftar.
// 7. Logo AIClub resmi disalin dari repo aiclub.id (app/public/brand), bukan diunduh.
import {existsSync, readFileSync} from 'node:fs';

const HOOK = {
  komentar: 'Pakai software apa? Cuma dua tab. Claude, ElevenLabs, jadi!',
  nol: 'Nol software animasi. Cuma Claude, ElevenLabs, jadi!',
};
const REF = 'komentar-web';

const mulai = (dir, scene) => {
  const f = new URL(`./${dir}/timeline.json`, import.meta.url);
  if (!existsSync(f)) return 0;
  const s = JSON.parse(readFileSync(f, 'utf8'));
  return s.slice(0, s.findIndex((x) => x.name === scene)).reduce((a, x) => a + x.dur, 0);
};

const HINDARI = ['vocals', 'singing', 'lyrics', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
  'breakdown', 'silence', 'quiet intro', 'fade in', 'long fade in', 'sparse', 'ambient pad only'];

export function buat(hook) {
  if (!HOOK[hook]) throw new Error(`hook tidak dikenal: ${hook}`);
  const B = BEAT[hook];
  const dir = `${hook}-web`;
  return {
    nama: `kelas-motion-v08-${dir}`,
    src: '../src',
    komposisi: `V08 aiclub ${hook} web.dc.html`,
    jsx: 'kelas-motion-v08.jsx',
    kapsi: false,
    keluaran: `rama-digital-kelas-motion-aiclub-${dir}-9x16.mp4`,

    suara: {id: 'iWydkXKoiVtvdn4vLKp9', seed: 20260930,
            speed: (l) => (l.no === 7 ? 1.05 : 1.20), stability: 0.14, similarity: 0.80, style: 0.72},

    lafal: {
      Claude: "Klo'd", ElevenLabs: 'ilevenlebs', Motion: 'moshen', 'After Effects': 'after efek',
      gimmick: 'gimik', plugin: 'plagin', template: 'templet', AIClub: 'ei-ai klab', build: 'bilt',
      'Rp 179.000': 'seratus tujuh puluh sembilan ribu', 'Rp 149.000': 'seratus empat puluh sembilan ribu',
    },

    vo: [
      {no: 1, sc: 'Hook',   off: 0.00, style: 0.85, dengar: /claude/i, coba: 8, text: HOOK[hook]},
      {no: 2, sc: 'Coret',  off: 0.10, dengar: /gimmick|gimik/i, text: 'Nggak perlu beli After Effects, template, plugin, apalagi jasa. No gimmick!'},
      {no: 3, sc: 'Resep',  off: 0.10, dengar: /^claude/i, coba: 8, text: 'Claude bikin animasinya, ElevenLabs isi suara sama musiknya. Videonya jadi!'},
      {no: 4, sc: 'Bukti',  off: 0.10, text: 'Empat belas video ini, resepnya sama. Termasuk iklan yang lagi kamu tonton!'},
      {no: 5, sc: 'Member', off: 0.10, style: 0.85, dengar: /(club|klab).*build/i, coba: 6, text: 'Khusus member AIClub, dari Aceh sampai Papua. Waktunya build!'},
      {no: 6, sc: 'Daftar', off: 0.10, text: 'Normalnya Rp 179.000. Member cuma Rp 149.000!'},
      // CTA baris sendiri dan kalimat TERAKHIR, intonasi dinaikkan. Sama dengan tulisan tombol.
      {no: 7, sc: 'Daftar', off: 0.10, style: 0.95, stability: 0.05, dengar: /daftar.*(club|klab)/i, coba: 6, text: 'Daftar sekarang di aiclub.id!'},
    ],

    tata: {mode: 'jangkar', jeda: 0.10, ekorBiasa: 0.25, ekor: {Member: EKOR_MEMBER[hook], Daftar: 0.8}},

    sfx: [
      ['notif',   '@stok/chat-blip'],
      ['blip',    0.5, 'one 8-bit jump blip, short bright retro game sound, square wave, dry, no reverb, no music, single event'],
      ['powerup', 1.0, 'an 8-bit power-up sound with a sparkly arcade chime rising, punchy and exciting, retro game, dry, no reverb, no music, single event'],
      ['stempel', '@stok/stamp-slam'],
      ['wipe',    0.5, 'a soft fast 8-bit pixel transition sweep, gentle, retro game, no harsh high frequencies, dry, no reverb, no music, single sweep'],
      ['pop',     0.5, 'one soft chiptune pop, short and round, retro game, dry, no reverb, no music, single pop'],
      ['zap',     0.4, 'one quick 8-bit laser zap, short, retro arcade, dry, no reverb, no music, single event'],
      ['tick',    0.5, 'one tiny arcade tick, very short, retro game, dry, no reverb, no music, single tick'],
      ['koin',    0.5, 'one 8-bit coin pickup blip, very short and bright, retro game, dry, no reverb, no music, single event'],
      ['tombol',  0.5, 'one chunky arcade button press with a soft click, dry close-mic, no reverb, no music, single press'],
      ['hisap',   '@stok/whoosh-rev'],
      ['riser',   '@stok/riser-long'],
      ['impact',  '@stok/impact-hit'],
      ['sub',     '@stok/sub'],
    ],

    cue: ({C, total}) => {
      const wipe = (sc, nada = 0) => ({at: C[sc], nama: 'wipe', gain: 0.12, nada});
      return [
        // Hook
        {at: 0.00, nama: 'notif', gain: 0.24},
        {at: 0.02, nama: 'pop',   gain: 0.20, pan: -0.2},
        {at: B.cuma, nama: 'pop', gain: 0.18, nada: 2},
        {at: B.tab[0], nama: 'blip', gain: 0.24, pan: -0.3},
        {at: B.tab[1], nama: 'zap',  gain: 0.14, nada: 5},
        {at: B.tab[2], nama: 'blip', gain: 0.24, pan: 0.3, nada: 3},
        {at: B.jadi - 0.20, nama: 'hisap',   gain: 0.18},
        {at: B.jadi,        nama: 'stempel', gain: 0.40},
        {at: B.jadi + 0.02, nama: 'powerup', gain: 0.26},
        {at: B.jadi + 0.02, nama: 'sub',     gain: 0.16},

        // Coret: 6 kartu pop (nada naik), tiap kartu dicoret laser 0,2 dtk kemudian.
        wipe('Coret'),
        ...[0, 1, 2, 3, 4, 5].flatMap((i) => [
          {at: C.Coret + 0.45 + i * 0.5, nama: 'pop', gain: 0.18, nada: i, pan: i % 2 ? 0.25 : -0.25},
          {at: C.Coret + 0.65 + i * 0.5, nama: 'zap', gain: 0.20, nada: -i * 0.5},
        ]),
        {at: C.Coret + B.gimmick, nama: 'powerup', gain: 0.18, nada: -3},

        // Resep
        wipe('Resep', 2),
        ...B.resep.map((t, i) => ({at: C.Resep + t, nama: 'pop', gain: 0.22, nada: i * 2})),
        {at: C.Resep + B.resepStiker, nama: 'blip', gain: 0.22, nada: 5},

        // Bukti
        wipe('Bukti', -2),
        ...Array.from({length: 14}, (_, i) => ({at: C.Bukti + 0.4 + i * 0.25, nama: 'tick', gain: 0.07, nada: (i % 3) - 1})),
        {at: C.Bukti + B.iklanIni, nama: 'blip', gain: 0.22, nada: 7},

        // Member: koin tiap kota, nada naik.
        wipe('Member', 3),
        ...Array.from({length: 15}, (_, i) => ({at: C.Member + B.kota + i * 0.09, nama: 'koin', gain: 0.10, nada: i * 0.5})),
        {at: C.Member + B.build, nama: 'powerup', gain: 0.22},

        // Daftar: satu-satunya hentakan besar, dilapis empat di stempel harga member.
        wipe('Daftar', 5),
        {at: C.Daftar + B.sesi[0], nama: 'tick', gain: 0.22, pan: -0.2},
        {at: C.Daftar + B.sesi[1], nama: 'tick', gain: 0.22, pan: 0.2, nada: 2},
        {at: C.Daftar + B.lama, nama: 'tick', gain: 0.18, nada: -3},
        {at: C.Daftar + B.coret, nama: 'zap', gain: 0.26, nada: -4},
        {at: C.Daftar + B.harga - 1.3, nama: 'riser',  gain: 0.20},
        {at: C.Daftar + B.harga - 0.2, nama: 'hisap',  gain: 0.20},
        {at: C.Daftar + B.harga,       nama: 'impact', gain: 0.42},
        {at: C.Daftar + B.harga + 0.02, nama: 'sub',   gain: 0.34},
        {at: C.Daftar + B.harga + 0.04, nama: 'powerup', gain: 0.30},
        {at: C.Daftar + B.gabung, nama: 'koin', gain: 0.14, nada: 5},
        {at: C.Daftar + B.tombol, nama: 'tombol', gain: 0.34},
        {at: total - 0.35, nama: 'wipe', gain: 0.10},
      ];
    },

    musik: [{
      // aset/bgm.mp3 -> ../../komentar-web/aset/bgm-gen.mp3 (dibuat `node musik-gen.mjs`).
      // Drop trek terukur di 23,0 dtk (crash + pita 5 kHz naik 5 dB); awal Daftar 22,30.
      nama: 'bgm', luar: true, mulai: 0, lewati: 0.75,
      fadeOut: ({total}) => [total - 0.5, 0.5],
      rencana: ({C, total}) => {
        const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
        const inti = ['playful 8-bit chiptune pop instrumental', '120 BPM', 'square-wave lead', 'bouncy chiptune bass',
          'crisp claps', 'arcade blips', 'modern TikTok ad energy', 'fun and confident', 'steady and continuous'];
        return [
          b(0, C.Resep, '[hook]', [...inti, 'starts instantly on a hard hit on the first beat', 'no intro', 'stop-and-go stabs', 'always present']),
          b(C.Resep, C.Member, '[groove]', [...inti, 'groove keeps rolling', 'energy rising']),
          b(C.Member, C.Daftar, '[lift]', [...inti, 'brighter lift', 'arpeggio climbing', 'building toward a drop']),
          b(C.Daftar, total, '[drop]', [...inti, 'big chorus drop', 'arcade power-up sweep', 'full groove', 'euphoric and exciting']),
          b(total, total + 6, '[tail]', [...inti, 'chorus groove continues', 'full groove']),
        ];
      },
      titik: TITIK(B),
    }],

    sampul: {detik: 0},
    mixer: {gainVO: 1.60, gainSFX: 0.95, duckMusik: {th: 0.015, ratio: 14, attack: 25, release: 320}},
    periksa: {busTitik: [0.02, mulai(dir, 'Coret') + 0.02]},
  };
}

// Amplop BGM. Trek chiptune sudah rata (-12 dB tiap 0,5 dtk), jadi amplopnya rata juga. Tukikan 0,4 dtk sebelum stempel harga member.
const TITIK = (B) => [['Hook', 0, -14], ['Member', 0, -14], ['Daftar', 0, -13],
  ['Daftar', B.harga - 0.5, -14], ['Daftar', B.harga - 0.4, -23], ['Daftar', B.harga, -23], ['Daftar', B.harga + 0.05, -13]];
// Ekor scene Member menaruh awal Daftar di detik yang sama di kedua video (= drop BGM).
const EKOR_MEMBER = {komentar: 0.25, nol: 0.25};

// Beat dipaku ke kata VO (transkrip sesudah `motion plan`). Hook: detik absolut; lainnya dari awal scene.
// Angka yang sama ada di BT, kelas-motion-v08.jsx. Ubah keduanya bersamaan.
const BEAT = {
  komentar: {cuma: 1.30, tab: [2.28, 2.58, 2.78], jadi: 3.68, gimmick: 3.86, resep: [0.12, 1.48, 3.54], resepStiker: 3.9,
             iklanIni: 2.30, kota: 1.0, build: 3.04, sesi: [0.3, 0.6], lama: 0.10, coret: 2.50, harga: 3.00, gabung: 3.6, tombol: 4.52},
  nol:      {cuma: 1.38, tab: [1.64, 1.95, 2.10], jadi: 2.98, gimmick: 3.94, resep: [0.12, 1.66, 3.98], resepStiker: 4.4,
             iklanIni: 2.30, kota: 1.0, build: 3.04, sesi: [0.3, 0.6], lama: 0.10, coret: 2.50, harga: 3.00, gabung: 3.6, tombol: 4.52},
};
