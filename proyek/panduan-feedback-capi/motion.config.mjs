// Panduan lengkap Feedback CAPI: 16:9, ±7 menit. Enam tutorial 1 menit dipakai ulang sebagai bab.
// Komposisi dibangun oleh bangun.mjs (src/ tidak ikut git). VO bab = VO tutorial sumber + catatan baru.
// Suara terkunci seri Konektor (preset C). Jangan ubah suara, seed, atau parameter per baris: tulis ulang kalimatnya.
import {BAB, HOOK, AKHIR} from './jadwal.mjs';
import {eja} from '../../lib/lafal.mjs';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import tracking from './sumber/tracking.config.mjs';
import rotator from './sumber/rotator.config.mjs';
import ctwa from './sumber/ctwa.config.mjs';
import metaCapi from './sumber/meta-capi.config.mjs';
import konversi from './sumber/konversi.config.mjs';
import otomasi from './sumber/otomasi.config.mjs';

const PETA = JSON.parse(readFileSync(fileURLToPath(new URL('./sumber/peta.json', import.meta.url)), 'utf8')); // awal tiap scene sumber di dalam scene bab
const SUMBER = {tracking, rotator, ctwa, 'meta-capi': metaCapi, konversi, otomasi};

// ── VO: hook, lalu tiap bab (baris sumber yang dipakai + 3 catatan), lalu penutup ──
const vo = [];
const tambah = (l) => vo.push({...l, no: vo.length + 1});
for (const h of HOOK) {
  tambah({sc: h.sc, off: h.off, text: h.text, ...(h.no === 'h5' ? {dengar: /feedback|fidbek/i, coba: 4} : {})});
}
for (const b of BAB) {
  for (const l of SUMBER[b.cfg].vo) {
    if (!b.simpan.includes(l.sc)) continue;
    // Kalimat penutup bab 3 diganti: kalimat aslinya sama dengan bab 5 (dan terdeteksi sebagai VO dobel).
    const teks = b.id === 'c3' && l.sc === 'Hasil' ? 'Closing kembali ke Meta, jadi iklan tahu chat mana yang jadi pembeli.' : l.text;
    tambah({sc: b.id, off: +(PETA[b.id][l.sc] + l.off).toFixed(2), text: teks, ...(l.dengar ? {dengar: l.dengar, coba: l.coba} : {})});
  }
  b.catatan.forEach((c, i) => tambah({sc: `N${b.k}`, off: b.off[i], text: c.vo}));
}
for (const l of AKHIR) {
  tambah({sc: l.sc, off: l.off, text: l.text, ...(l.no === 'r5' ? {dengar: /konektor|connector/i, coba: 4} : {})});
}

// ── SFX: gabungan alias semua sumber (semua mengarah ke stok yang sama) ──
const sfxMap = new Map();
for (const s of Object.values(SUMBER)) for (const x of s.sfx) if (!sfxMap.has(x[0])) sfxMap.set(x[0], x);

export default {
  nama: 'panduan-feedback-capi',
  komposisi: 'Panduan Feedback CAPI.dc.html',
  kapsi: false,
  keluaran: 'panduan-feedback-capi.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  lafal: {'Click-to-WhatsApp': 'Klik tu wasap', WhatsApp: 'wasap', uniquecode: 'unik kode', CAPI: eja('CAPI')},

  vo,

  tata: {mode: 'jangkar', jeda: 0.18, ekorBiasa: 0.40},

  sfx: [...sfxMap.values()],

  cue: ({C, total}) => {
    const q = (at, nama, gain, nada = 0) => ({at, nama, gain, nada});
    const out = [];

    // Bab sumber: cue tutorial asli, ditempel ke scene yang dipakai. Scene yang dibuang (Intro, Tips, Outro) jadi NaN dan dibuang.
    for (const b of BAB) {
      const peta = new Proxy({}, {get: (t, p) => (typeof p === 'string' && b.simpan.includes(p) ? C[b.id] + PETA[b.id][p] : NaN)});
      out.push(...SUMBER[b.cfg].cue({C: peta, P: {}, E: {}, S: {}, total}));
    }

    // Pembuka
    out.push(
      q(C.Hasil + 0.0, 'riser', 0.18), q(C.Hasil + 0.15, 'pop', 0.22, 2), q(C.Hasil + 0.75, 'hisap', 0.18),
      q(C.Hasil + 0.85, 'impact', 0.40), q(C.Hasil + 0.87, 'sub', 0.30), q(C.Hasil + 1.3, 'chime', 0.12),
      q(C.Hasil + 4.5, 'pop', 0.16, 3), q(C.Hasil + 4.9, 'sapu', 0.12), q(C.Hasil + 5.3, 'pop', 0.16, 4),
      q(C.Masalah + 0.5, 'pop', 0.18, 2), q(C.Masalah + 1.3, 'sapu', 0.12), q(C.Masalah + 2.4, 'sapu', 0.12),
      q(C.Masalah + 3.7, 'pop', 0.14, -2), q(C.Masalah + 5.4, 'pop', 0.16, 3), q(C.Masalah + 7.9, 'pop', 0.16, 4), q(C.Masalah + 8.7, 'sapu', 0.10),
      q(C.Janji + 0.5, 'pop', 0.22, 3), q(C.Janji + 2.0, 'sapu', 0.12),
      ...[0, 1, 2, 3, 4, 5].map((i) => q(C.Janji + 7.6 + i * 0.55, 'pop', 0.14, i)),
      q(C.Janji + 10.9, 'chime', 0.14), q(C.Janji + 11.0, 'jadi', 0.12),
    );

    // Kartu judul bab 1-7
    for (let k = 1; k <= 7; k++) out.push(q(C[`J${k}`] + 0.0, 'sapu', 0.14), q(C[`J${k}`] + 0.06, 'pop', 0.20, 3));

    // Catatan bab: satu bunyi per baris, mengikuti offset VO
    for (const b of BAB) {
      const n = C[`N${b.k}`];
      b.off.forEach((o, i) => out.push(q(n + o - 0.1, 'pop', 0.16, 2 + i), q(n + o - 0.05, i === 2 ? 'centang' : 'sapu', i === 2 ? 0.14 : 0.10, i === 2 ? 3 : 0)));
    }

    // Ringkasan, tips, penutup
    for (let i = 0; i < 6; i++) out.push(q(C.Ringkas + 2.5 + i * 1.15, 'pop', 0.12, i), q(C.Ringkas + 2.85 + i * 1.15, 'centang', 0.12, 2));
    AKHIR.filter((l) => l.sc === 'Tips').forEach((l) => out.push(q(C.Tips + l.off - 0.1, 'pop', 0.16, 3), q(C.Tips + l.off, 'sapu', 0.10)));
    out.push(q(C.Cta + 0.15, 'pop', 0.22), q(C.Cta + 1.0, 'chime', 0.12));

    return out.filter((x) => Number.isFinite(x.at));
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
        b(0, C.c1, '[hook]', [...dasar, 'focused groove from the very first beat', 'warm and clear']),
        b(C.c1, C.J2, '[step one]', [...dasar, 'same groove', 'soft arpeggio']),
        b(C.J2, C.J3, '[step two]', [...dasar, 'a little fuller', 'forward motion']),
        b(C.J3, C.J4, '[step three]', [...dasar, 'a little fuller', 'soft arpeggio']),
        b(C.J4, C.J5, '[step four]', [...dasar, 'forward motion', 'same groove']),
        b(C.J5, C.J6, '[step five]', [...dasar, 'brighter', 'open', 'same groove']),
        b(C.J6, C.J7, '[step six]', [...dasar, 'brighter', 'forward motion']),
        b(C.J7, total, '[wrap up]', [...dasar, 'warm and resolved', 'same groove']),
        b(total, total + 8, '[tail]', [...dasar, 'brighter groove continues']),
      ];
    },
    titik: [
      ['Hasil', 0, -29.5],
      ['Cta', 0, -29.5],
    ],
    fadeOut: ({total}) => [total - 0.35, 0.35],
  }],

  sampul: {detik: 2.4},
  mixer: {gainVO: 1.60, gainSFX: 0.90, duckMusik: {th: 0.03, ratio: 8, attack: 20, release: 280}},
  // titik hentakan besar: pembuka, c3 Kirim, c5 Kirim, c6 Kirim (dihitung dari timeline 10 Okt 2026)
  periksa: {busTitik: [1.0, 182.8, 307.3, 368.4]},
};
