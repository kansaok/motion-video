// Panduan lengkap AI Agent CRM di Konektor: 16:9, ±7-8 menit. Tiga tutorial 1 menit dipakai ulang sebagai potongan bab.
// Komposisi dibangun oleh bangun.mjs (src/ tidak ikut git). VO bab = VO tutorial sumber + penjelasan baru.
// Suara terkunci seri Konektor (preset C). Jangan ubah suara, seed, atau parameter per baris: tulis ulang kalimatnya.
// Model TTS = bawaan mesin (eleven_v4). v4 mengabaikan `style`, jadi energi datang dari naskah.
import {PIECE, SRC, GANTI, BUANG_HENTAK, BAB, urutan, barisBaru} from './jadwal.mjs';
import {eja} from '../../lib/lafal.mjs';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import agentic from './sumber/agentic.config.mjs';
import otomasi from './sumber/otomasi.config.mjs';
import kalimat from './sumber/kalimat.config.mjs';

const PETA = JSON.parse(readFileSync(fileURLToPath(new URL('./sumber/peta.json', import.meta.url)), 'utf8')); // awal tiap scene sumber di dalam scene potongan
const CFG = {agentic, otomasi, kalimat};
const B = barisBaru();
const URUT = urutan();

// ── VO: mengikuti urutan scene (baris harus berurutan waktu) ──
const vo = [];
const tambah = (l) => vo.push({...l, no: vo.length + 1});
for (const u of URUT) {
  if (u.kind === 'sumber') {
    const sg = SRC.find((s) => s.id === u.name);
    const cfg = PIECE[sg.piece].cfg;
    for (const l of CFG[cfg].vo) {
      if (!sg.simpan.includes(l.sc)) continue;
      const teks = GANTI[`${cfg}:${l.sc}`] ?? l.text;
      tambah({sc: sg.id, off: +(PETA[sg.id][l.sc] + l.off).toFixed(2), text: teks, ...(l.dengar ? {dengar: l.dengar, coba: l.coba} : {})});
    }
  } else if (B[u.name]) {
    for (const l of B[u.name]) tambah({sc: u.name, off: l.off, text: l.text, ...(u.name === 'Cta' ? {dengar: /konektor|connector/i, coba: 4} : {})});
  }
}

// ── SFX: gabungan alias semua sumber (semua mengarah ke stok yang sama) ──
const sfxMap = new Map();
for (const s of Object.values(CFG)) for (const x of s.sfx) if (!sfxMap.has(x[0])) sfxMap.set(x[0], x);

export default {
  nama: 'panduan-ai-agent',
  komposisi: 'Panduan AI Agent.dc.html',
  kapsi: false,
  keluaran: 'panduan-ai-agent.mp4',

  suara: {id: 'Se50W0zoqlDUbFxvcN9h', seed: 20260930, speed: 0.98, stability: 0.25, similarity: 0.8, style: 0.85},
  lafal: {CRM: eja('CRM'), CSV: eja('CSV'), PDF: eja('PDF'), CS: eja('CS'), API: 'ei pi ai', AI: 'ei ai', WhatsApp: 'wasap'},

  vo,

  tata: {mode: 'jangkar', jeda: 0.25, ekorBiasa: 0.40},

  sfx: [...sfxMap.values()],

  cue: ({C, total}) => {
    const q = (at, nama, gain, nada = 0) => ({at, nama, gain, nada});
    const out = [];
    const at = (L, i) => L[i].off - 0.1;

    // Potongan sumber: cue tutorial asli, ditempel ke scene yang dipakai. Scene yang dibuang jadi NaN dan disaring.
    for (const sg of SRC) {
      const cfg = PIECE[sg.piece].cfg;
      const peta = new Proxy({}, {get: (t, p) => (typeof p === 'string' && sg.simpan.includes(p) ? C[sg.id] + PETA[sg.id][p] : NaN)});
      let cs = CFG[cfg].cue({C: peta, P: {}, E: {}, S: {}, total});
      if (BUANG_HENTAK.has(cfg)) cs = cs.filter((x) => !['riser', 'hisap', 'impact', 'sub'].includes(x.nama));
      out.push(...cs);
    }

    // Pembuka: hentakan besar (empat lapis) di kartu closing
    {
      const L = B.Hasil, o = L[0].off, d = L[0].dur;
      const tTyp = o + 0.30 * d, tAi = o + 0.41 * d, t3 = o + 0.55 * d, tCard = o + 0.62 * d + 0.15;
      out.push(
        q(C.Hasil + o + 0.5, 'pop', 0.20, 2), q(C.Hasil + tTyp, 'sapu', 0.10), q(C.Hasil + tAi, 'pop', 0.20, 3), q(C.Hasil + tAi + 0.05, 'chime', 0.10),
        q(C.Hasil + t3, 'pop', 0.18, 4),
        q(C.Hasil + tCard - 1.3, 'riser', 0.18), q(C.Hasil + tCard - 0.2, 'hisap', 0.18),
        q(C.Hasil + tCard, 'impact', 0.40), q(C.Hasil + tCard + 0.02, 'sub', 0.30), q(C.Hasil + tCard + 0.5, 'chime', 0.12),
      );
    }
    {
      const L = B.Janji, t0 = at(L, 1);
      out.push(q(C.Janji + 0.4, 'pop', 0.22, 3), q(C.Janji + 1.6, 'sapu', 0.12));
      for (let i = 0; i < 6; i++) out.push(q(C.Janji + t0 + 0.2 + i * 0.4, 'pop', 0.14, i));
      out.push(q(C.Janji + t0 + 2.9, 'chime', 0.14), q(C.Janji + t0 + 2.95, 'jadi', 0.12));
    }

    // Kartu judul bab 1-7
    for (const b of BAB) out.push(q(C[`J${b.k}`] + 0.0, 'sapu', 0.14), q(C[`J${b.k}`] + 0.06, 'pop', 0.20, 3));

    // Penjelasan bab 1
    for (const nama of ['Agent', 'Tim']) {
      B[nama].forEach((l, i) => out.push(q(C[nama] + l.off - 0.1, 'pop', 0.16, 2 + i), q(C[nama] + l.off - 0.05, 'sapu', 0.10)));
    }
    {
      const L = B.Tim;
      out.push(q(C.Tim + at(L, 1) + 0.3, 'pop', 0.14, 3), q(C.Tim + at(L, 3) + 0.5, 'pop', 0.14, 4), q(C.Tim + at(L, 3) + 2.4, 'centang', 0.14, 3));
    }
    // Bab 4: sumber dan uji
    {
      const L = B.Sumber;
      out.push(q(C.Sumber + at(L, 0) + 0.1, 'sapu', 0.12));
      for (let i = 0; i < 3; i++) out.push(q(C.Sumber + at(L, i + 1) + 0.05, 'pop', 0.18, 2 + i), q(C.Sumber + at(L, i + 1) + 0.1, 'sapu', 0.10));
    }
    {
      const L = B.Uji, t0 = L[0].off, d0 = L[0].dur, q2 = at(L, 2) + 0.1;
      out.push(
        q(C.Uji + t0 + 1.0, 'klik', 0.18, 1), q(C.Uji + t0 + d0 - 0.9, 'tombol', 0.26), q(C.Uji + at(L, 1) + 0.3, 'pop', 0.18, 3), q(C.Uji + at(L, 1) + 0.35, 'chime', 0.12),
        q(C.Uji + at(L, 2) - 0.2, 'sapu', 0.12), q(C.Uji + q2, 'klik', 0.18, 2), q(C.Uji + q2 + 1.3, 'tombol', 0.26), q(C.Uji + q2 + 1.9, 'pop', 0.16, 1), q(C.Uji + q2 + 3.4, 'pop', 0.16, 4),
      );
    }
    // Bab 5: dua cara
    {
      const L = B.Pilih;
      out.push(q(C.Pilih + at(L, 0) + 0.1, 'pop', 0.20, 2), q(C.Pilih + at(L, 1) + 0.1, 'pop', 0.20, 4), q(C.Pilih + at(L, 2) + 0.1, 'pop', 0.18, 3), q(C.Pilih + at(L, 2) + 0.15, 'centang', 0.14, 3));
    }
    // Bab 6: jembatan
    {
      const L = B.Jembatan, t0 = at(L, 0);
      for (let i = 0; i < 4; i++) out.push(q(C.Jembatan + t0 + 0.2 + i * 1.0, 'pop', 0.18, 1 + i), q(C.Jembatan + t0 + 0.7 + i * 1.0, 'sapu', 0.10));
      out.push(q(C.Jembatan + at(L, 1) + 0.4, 'pop', 0.18, 2), q(C.Jembatan + at(L, 1) + 0.45 * L[1].dur + 0.5, 'pop', 0.18, 4));
    }
    // Bab 7: biaya
    {
      const L = B.Biaya;
      out.push(q(C.Biaya + at(L, 0) + 0.1, 'pop', 0.22, 2), q(C.Biaya + at(L, 0) + 0.15, 'chime', 0.12), q(C.Biaya + at(L, 1) + 0.1, 'pop', 0.20, 3),
        q(C.Biaya + at(L, 2), 'pop', 0.16, 4), q(C.Biaya + at(L, 3) + 0.1, 'sapu', 0.14), q(C.Biaya + at(L, 3) + 0.15, 'pop', 0.18, 1), q(C.Biaya + at(L, 3) + 3.6, 'sapu', 0.14));
    }

    // Catatan bab: satu bunyi per baris, mengikuti offset VO
    for (const k of Object.keys(B).filter((n) => /^N\d$/.test(n))) {
      B[k].forEach((l, i) => out.push(q(C[k] + l.off - 0.1, 'pop', 0.16, 2 + i), q(C[k] + l.off - 0.05, i === 2 ? 'centang' : 'sapu', i === 2 ? 0.14 : 0.10, i === 2 ? 3 : 0)));
    }

    // Ringkasan, tips, penutup
    {
      const L = B.Ringkas, o = L[0].off, step = (L[0].dur - 3.2) / 6;
      for (let i = 0; i < 6; i++) out.push(q(C.Ringkas + o + 2.4 + i * step, 'pop', 0.12, i), q(C.Ringkas + o + 2.75 + i * step, 'centang', 0.12, 2));
    }
    B.TipsAkhir.forEach((l, i) => out.push(q(C.TipsAkhir + l.off - 0.2, 'pop', 0.16, 3), q(C.TipsAkhir + l.off - 0.1, 'sapu', 0.10)));
    out.push(q(C.Cta + 0.15, 'pop', 0.22), q(C.Cta + 1.0, 'chime', 0.12));

    return out.filter((x) => Number.isFinite(x.at) && x.at >= 0);
  },

  // Kredit musik ElevenLabs tidak cukup (6.876 diminta, 1.965 tersisa pada 11 Okt 2026), jadi bed memakai ulang trek
  // panduan-feedback-capi (112 BPM, gaya sama): 0-300 dtk + 30 bar (64,29 dtk) diulang dari 235,71 dtk, crossfade 1 dtk.
  // `luar: true` mencegah `motion music` menimpa berkasnya. `rencana` di bawah hanya catatan: tidak dipakai.
  musik: [{
    nama: 'bgm',
    luar: true,
    rencana: ({C, total}) => {
      const HINDARI = ['vocals', 'lyrics', 'words', 'heavy four-on-the-floor kick', 'booming sub bass', 'trap 808',
        'breakdown', 'silence', 'quiet intro', 'fade in', 'sparse'];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya, hindari: HINDARI});
      const dasar = ['clean modern product-demo instrumental', '112 BPM', 'steady and continuous', 'always present',
        'light shaker', 'soft pluck', 'no vocals'];
      return [
        b(0, C.J1, '[hook]', [...dasar, 'focused groove from the very first beat', 'warm and clear']),
        b(C.J1, C.J2, '[chapter one]', [...dasar, 'same groove', 'soft arpeggio']),
        b(C.J2, C.J3, '[chapter two]', [...dasar, 'a little fuller', 'forward motion']),
        b(C.J3, C.J4, '[chapter three]', [...dasar, 'a little fuller', 'soft arpeggio']),
        b(C.J4, C.J5, '[chapter four]', [...dasar, 'forward motion', 'same groove']),
        b(C.J5, C.J6, '[chapter five]', [...dasar, 'brighter', 'open', 'same groove']),
        b(C.J6, C.J7, '[chapter six]', [...dasar, 'brighter', 'forward motion']),
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

  sampul: {detik: 5.8},
  mixer: {gainVO: 1.60, gainSFX: 0.90, duckMusik: {th: 0.03, ratio: 8, attack: 20, release: 280}},
  periksa: {busTitik: [4.6, 277.2, 346.8]},
};
