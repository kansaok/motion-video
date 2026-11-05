/* Mode kering (P6-11): `motion plan --kering` / `motion all --kering`.

   Semua perhitungan `plan` (durasi baris, posisi, durasi scene, batas scene yang memotong
   kalimat), cue dan musik yang dievaluasi terhadap timeline itu, dan perkiraan biaya, TANPA
   memanggil ElevenLabs dan tanpa menulis ke komposisi, aset, atau timeline.json. Satu-satunya
   berkas yang ditulis adalah laporan di `kerja/kering.json`, untuk agent yang ingin
   membandingkan dampak perubahan config sebelum membakar kredit.

   Durasi VO yang belum ada (atau kuncinya basi) DIPERKIRAKAN dari jumlah karakter terlafal:
     1. kalibrasi proyek: kar/dtk VO yang sudah ada dengan suara yang sama (dinormalkan ke
        speed 1 lewat `speed` di `.kunci`-nya, lalu dikali speed baris);
     2. `suara.kps` (hasil `motion speed` pada speed yang dipakai);
     3. VO.kpsBawaan × speed.
   Durasi TTS tidak deterministik (README `maks`), jadi hasilnya perkiraan, dan laporannya
   menyebut baris mana yang diperkirakan dan dari sumber apa. */
import {existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {durasi} from './ff.mjs';
import {VO} from './konstanta.mjs';
import * as K from './komposisi.mjs';
import * as T from './tata.mjs';
import {perkiraan} from './biaya.mjs';
import {rencanaVo, segarVo, cariCacheVo} from './vo.mjs';
import {rencanaSfx} from './sfx.mjs';
import {rencanaMusik} from './musik.mjs';

const median = (xs) => { const a = [...xs].sort((x, y) => x - y); return a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2; };
const speedBaris = (s, l) => (typeof s.speed === 'function' ? s.speed(l) : s.speed) || 1;

/* kar/dtk pada speed 1, per suara, dari VO yang sudah ada di proyek (segar atau basi: yang
   diukur hanya kecepatan suaranya). @param {import('./tipe.mjs').Config} c */
export function kalibrasi(c) {
  const dir = path.join(c.aset, 'vo');
  /** @type {Record<string, number[]>} */
  const per = {};
  if (!existsSync(dir)) return {};
  for (const f of readdirSync(dir).filter((x) => /^vo-\d+\.mp3$/.test(x))) {
    let k;
    try { k = JSON.parse(readFileSync(path.join(dir, `${f}.kunci`), 'utf8')); } catch { continue; }
    if (!k?.teks || !k.voice) continue;
    let d;
    try { d = durasi(path.join(dir, f)); } catch { continue; }
    if (!(d > 0.3)) continue; // take sangat pendek ("Ya.") didominasi ekor, bukan kecepatan
    (per[k.voice] ||= []).push(k.teks.length / d / (k.speed || 1));
  }
  return Object.fromEntries(Object.entries(per).map(([v, xs]) => [v, {kps: median(xs), n: xs.length}]));
}

/** @param {import('./tipe.mjs').Config} c */
export function perkiraDurasi(c) {
  const s = c.suara || {};
  const kal = kalibrasi(c);
  return rencanaVo(c).baris.map(({l, file, kunci}) => {
    const ada = existsSync(file);
    if (s.luar ? ada : segarVo(file, kunci)) return {no: l.no, l, dur: durasi(file), sumber: 'berkas'};
    // Ada di cache VO lintas proyek: durasinya persis, bukan perkiraan, dan `plan` akan memakainya.
    const dc = !s.luar && cariCacheVo(kunci);
    if (dc) return {no: l.no, l, dur: durasi(dc), sumber: 'cache'};
    const sp = speedBaris(s, l);
    const v = kal[l.voice || s.id];
    const [kps, dari] = v ? [v.kps * sp, `kalibrasi ${v.n} VO proyek`]
      : s.kps ? [s.kps, 'suara.kps'] : [VO.kpsBawaan * sp, 'bawaan'];
    return {no: l.no, l, dur: kunci.teks.length / kps, kps, dari,
      sumber: s.luar ? 'belum diunggah' : ada ? 'basi' : 'baru'};
  });
}

/**
 * @param {import('./tipe.mjs').Config} c
 * @param {{langkah: Array<'vo' | 'sfx' | 'musik'>}} o
 */
export function kering(c, {langkah}) {
  const durasiVo = perkiraDurasi(c);
  // Hanya di memori: `c` dimuat ulang tiap perintah, dan objek ini tidak pernah ditulis balik.
  for (const e of durasiVo) e.l.dur = e.dur;
  const asliHtml = `${c.htmlUtama}.asli`;
  const scenes = K.bacaScenes(existsSync(asliHtml) ? asliHtml : c.htmlUtama).map((x) => ({...x}));
  const peringatan = [];
  let galat = null, hasil = null;
  try { hasil = T.rencana(c.vo, scenes, c.tata || {}); } catch (e) { galat = e.message; }

  for (const e of durasiVo) {
    if (e.l.maks && e.dur > e.l.maks) {
      peringatan.push(`VO-${e.no} ${e.sumber === 'berkas' ? '' : '≈'}${e.dur.toFixed(2)}s > maks ${e.l.maks}s`);
    }
  }

  let cue = [];
  if (hasil) {
    const {total} = hasil;
    const C = /** @type {import('./tipe.mjs').PetaCue} */ (hasil.C);
    const P = Object.fromEntries(c.vo.map((l) => [l.no, l.pos]));
    const E = Object.fromEntries(c.vo.map((l) => [l.no, l.pos + l.dur]));
    const S = Object.fromEntries(scenes.map((x) => [x.name, x.dur]));
    const semua = c.cue ? c.cue({C, P, E, S, total}) : [];
    // Mixer dan timing.js membuang cue di luar video tanpa suara; di sini disebut.
    for (const x of semua) {
      if (!(x.at >= 0 && x.at < total - 0.05)) peringatan.push(`cue ${x.nama} di ${Number(x.at).toFixed(2)}s di luar video (0-${total.toFixed(2)}s): dibuang mixer`);
    }
    cue = semua.filter((x) => x.at >= 0 && x.at < total - 0.05).sort((a, b) => a.at - b.at)
      .map((x) => ({nama: x.nama, at: +x.at.toFixed(3)}));
    const sfx = new Set((c.sfx || []).map(([n]) => n));
    const tanpaSfx = [...new Set(cue.map((x) => x.nama))].filter((n) => !sfx.has(n));
    if (tanpaSfx.length) peringatan.push(`cue tanpa entri sfx: ${tanpaSfx.join(', ')} (mix akan gagal "SFX belum digenerate")`);
    if (c.gate) c.gate({C, P, E, S, total}); // fungsi gate yang rusak ketahuan sekarang, bukan di mix
  }

  const sfx = langkah.includes('sfx') ? rencanaSfx(c).map((r) => ({nama: r.nama, sumber: r.sumber,
    status: r.sumber === 'generator' ? (r.baru ? 'baru' : 'ada') : existsSync(r.out) ? 'ada' : r.sumber === 'luar' ? 'belum diunggah' : 'disalin dari stok'})) : [];
  const musik = langkah.includes('musik') && hasil ? rencanaMusik(c, scenes).map((r) => ({nama: r.m.nama,
    status: r.m.luar ? (existsSync(r.out) ? 'luar, ada' : 'luar, belum ada') : r.baru ? 'baru' : 'ada',
    detik: r.m.luar ? null : +Number(r.panjang || 0).toFixed(1)})) : [];
  const biaya = perkiraan(c, langkah, hasil ? {scenes} : {});

  return {
    galat, peringatan, scenes, asli: hasil?.asli, total: hasil?.total,
    vo: durasiVo.map((e) => ({no: e.no, pos: e.l.pos === undefined ? null : +e.l.pos.toFixed(3), dur: +e.dur.toFixed(3),
      sumber: e.sumber, ...(e.kps ? {kps: +e.kps.toFixed(1), dari: e.dari} : {})})),
    cue, sfx, musik, biaya,
  };
}

/** Laporan di `<proyek>/kerja/kering.json`; satu-satunya berkas yang ditulis mode ini. */
export function simpan(c, h) {
  const dir = path.join(c.dir, 'kerja');
  mkdirSync(dir, {recursive: true});
  const f = path.join(dir, 'kering.json');
  const {scenes, ...sisa} = h;
  writeFileSync(f, JSON.stringify({dibuat: new Date().toISOString(), ...sisa,
    scenes: scenes.map((x) => ({name: x.name, dur: x.dur}))}, null, 1));
  return f;
}

/** @param {ReturnType<typeof kering>} h @param {import('./tipe.mjs').Config} c */
export function lapor(h, c) {
  const rp = (n) => n.toLocaleString('id-ID');
  const baris = ['  KERING: tidak ada panggilan ElevenLabs, komposisi dan aset tidak disentuh'];
  const kira = h.vo.filter((x) => x.sumber !== 'berkas' && x.sumber !== 'cache');
  const cache = h.vo.filter((x) => x.sumber === 'cache').length;
  baris.push(kira.length
    ? `  VO: ${h.vo.length - kira.length - cache} dari berkas, ${cache ? `${cache} dari cache VO, ` : ''}${kira.length} DIPERKIRAKAN (≈ = perkiraan; TTS tidak deterministik)`
    : `  VO: semua ${h.vo.length} baris dari berkas yang ada${cache ? ` (${cache} dari cache VO)` : ''}`);
  for (const x of kira) baris.push(`    VO-${String(x.no).padEnd(3)} ≈${x.dur.toFixed(2)}s  ${x.sumber}, ${x.kps} kar/dtk (${x.dari})`);
  if (h.galat) {
    baris.push(`  ✖ rencana gagal: ${h.galat}`);
  } else {
    baris.push(T.laporan(h.scenes, h.asli, c.vo, h.total));
    if (h.cue.length) baris.push(`  cue: ${h.cue.length} dalam video`);
  }
  for (const s of h.sfx.filter((x) => x.status !== 'ada')) baris.push(`  sfx ${s.nama}: ${s.status}`);
  for (const m of h.musik.filter((x) => x.status !== 'ada')) baris.push(`  musik ${m.nama}: ${m.status}${m.detik ? ` ${m.detik}s` : ''}`);
  for (const p of h.peringatan) baris.push(`  ! ${p}`);
  const b = h.biaya;
  baris.push(b.rincian.length
    ? `  biaya bila dijalankan: ${rp(b.kredit)} kredit ≈ $${b.usd.toFixed(2)}${b.terburuk > b.kredit ? ` (terburuk ${rp(b.terburuk)} ≈ $${b.usdTerburuk.toFixed(2)})` : ''}`
      + ` · ${b.rincian.map((x) => x.nama).slice(0, 8).join(', ')}${b.rincian.length > 8 ? `, +${b.rincian.length - 8}` : ''}`
    : '  biaya bila dijalankan: 0 kredit (tidak ada aset baru)');
  return baris.join('\n');
}
