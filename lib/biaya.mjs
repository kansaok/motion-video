/* Biaya ElevenLabs: perkiraan SEBELUM generate, konfirmasi bila di atas batas, dan catatan
   realisasi per proyek (`biaya.json`).

   Sebabnya: cache `.kunci` membuat ulang aset begitu permintaannya berubah, dan itu memang
   benar, tetapi satu perubahan kecil yang menyentuh semua baris (`suara.speed`, `lafal`,
   model bawaan) membuat ulang SELURUH VO tanpa bertanya. Laporan biaya `motion all` dulu baru
   muncul di akhir, sesudah kreditnya terbakar. */
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import path from 'node:path';
import {createInterface} from 'node:readline/promises';
import {HARGA, VO, SFX, MUSIK} from './konstanta.mjs';
import {segar} from './kunci.mjs';
import * as CV from './cachevo.mjs';
import {rencanaVo} from './vo.mjs';
import {rencanaSfx} from './sfx.mjs';
import {rencanaMusik} from './musik.mjs';

/** @typedef {'vo' | 'sfx' | 'musik'} Langkah */
/** @typedef {{jenis: Langkah, nama: string, kredit: number, terburuk: number}} Butir */
/** @typedef {{kredit: number, terburuk: number, usd: number, usdTerburuk: number, rincian: Butir[],
 *   hemat?: number, dariCache?: string[]}} Perkiraan  `hemat`: kredit VO yang diambil dari cache lintas proyek */

export const usd = (/** @type {number} */ kredit) => kredit * HARGA.usdPerKredit;
const rp = (/** @type {number} */ n) => Math.round(n).toLocaleString('id-ID');

/* Hanya aset yang AKAN dibuat generator yang dihitung: kunci yang segar, stok, dan unggahan
   (`luar`) gratis. Pemilihannya memakai fungsi rencana yang sama dengan tahap generate-nya,
   jadi perkiraan tidak bisa bilang "0 baru" sementara tahapnya membuat ulang semuanya.
   `terburuk` = semua percobaan ulang terpakai (`maks`/`dengar` VO, SFX kosong, musik bolong).
   @param {import('./tipe.mjs').Config} c
   @param {Langkah[]} langkah
   @param {{scenes?: import('./tipe.mjs').Scene[]}} [o]  timeline perkiraan (`--kering`)
   @returns {Perkiraan} */
export function perkiraan(c, langkah, o = {}) {
  const {scenes} = o;
  /** @type {Butir[]} */
  const rincian = [];
  let hemat = 0;
  /** @type {string[]} */
  const dariCache = [];
  if (langkah.includes('vo') && !c.suara?.luar) {
    for (const {l, file, kunci} of rencanaVo(c).baris) {
      if (segar(file, kunci)) continue;
      const k = kunci.teks.length * HARGA.kreditPerKarakter;
      // Ada di cache VO lintas proyek: gratis, dan penghematannya dilaporkan.
      if (CV.cari(kunci)) { hemat += k; dariCache.push(`VO-${l.no}`); continue; }
      const take = l.maks || l.dengar ? (l.coba ?? VO.coba) : 1;
      rincian.push({jenis: 'vo', nama: `VO-${l.no}`, kredit: k, terburuk: k * take});
    }
  }
  if (langkah.includes('sfx')) {
    for (const r of rencanaSfx(c)) {
      if (!r.baru) continue;
      // API menjepit durasi ke 0,5-30 dtk (EL.efek), jadi itu juga yang ditagih.
      const k = Math.min(30, Math.max(0.5, Number(r.detik))) * HARGA.sfxKreditPerDetik;
      rincian.push({jenis: 'sfx', nama: r.nama, kredit: k, terburuk: k * SFX.coba});
    }
  }
  if (langkah.includes('musik')) {
    for (const r of rencanaMusik(c, scenes)) {
      if (!r.baru) continue;
      const k = Number(r.panjang || 0) * HARGA.musikKreditPerDetik;
      rincian.push({jenis: 'musik', nama: `${r.m.nama} ${Math.round(r.panjang || 0)}s`, kredit: k, terburuk: k * MUSIK.coba});
    }
  }
  const kredit = Math.round(rincian.reduce((a, b) => a + b.kredit, 0));
  const terburuk = Math.round(rincian.reduce((a, b) => a + b.terburuk, 0));
  return {kredit, terburuk, usd: usd(kredit), usdTerburuk: usd(terburuk), rincian,
    ...(hemat ? {hemat, dariCache} : {})};
}

/** @param {Perkiraan} p */
export function ringkas(p) {
  const cache = p.hemat ? [`    cache  ${String(p.dariCache.length).padStart(3)} VO dari cache lintas proyek · hemat ${rp(p.hemat)} kredit ≈ $${usd(p.hemat).toFixed(2)}`] : [];
  if (!p.kredit) return ['  biaya    tidak ada yang perlu digenerate (semua dari cache, stok, atau unggahan)', ...cache].join('\n');
  const per = {};
  for (const b of p.rincian) {
    per[b.jenis] ??= {n: 0, kredit: 0};
    per[b.jenis].n++; per[b.jenis].kredit += b.kredit;
  }
  const baris = Object.entries(per).map(([j, v]) => `    ${j.padEnd(6)} ${String(v.n).padStart(3)} baru · ${rp(v.kredit)} kredit`);
  return [`  biaya    perkiraan ${rp(p.kredit)} kredit ≈ $${p.usd.toFixed(2)} ≈ Rp${rp(p.usd * HARGA.rupiahPerUsd)}`
    + ` (terburuk ${rp(p.terburuk)} kredit ≈ $${p.usdTerburuk.toFixed(2)})`, ...baris, ...cache].join('\n');
}

/** Batas per perintah: `BIAYA_MAKS_USD` di .env atau lingkungan, selain itu bawaan. */
export function batasUsd(env = process.env) {
  if (env.BIAYA_MAKS_USD === undefined || env.BIAYA_MAKS_USD === '') return HARGA.maksUsdBawaan;
  const n = Number(env.BIAYA_MAKS_USD);
  if (!Number.isFinite(n) || n < 0) throw new Error(`BIAYA_MAKS_USD tidak sah: ${env.BIAYA_MAKS_USD}`);
  return n;
}

async function tanyaTerminal(/** @type {string} */ soal) {
  const rl = createInterface({input: process.stdin, output: process.stderr});
  try { return await rl.question(soal); } finally { rl.close(); }
}

/* Perkiraan di atas batas butuh persetujuan. Tanpa terminal (agent, CI, pipa) tidak ada yang
   bisa ditanya, jadi perintahnya GAGAL dan harus diulang dengan `--ya` secara sadar.
   @param {Perkiraan} p
   @param {{ya?: boolean, batas?: number, tty?: boolean, tanya?: (s: string) => Promise<string>}} [o] */
export async function jaga(p, {ya = false, batas = batasUsd(), tty = Boolean(process.stdin.isTTY), tanya = tanyaTerminal} = {}) {
  if (ya || p.usd <= batas) return;
  const pesan = `perkiraan biaya $${p.usd.toFixed(2)} (${rp(p.kredit)} kredit, ${p.rincian.length} aset) `
    + `di atas BIAYA_MAKS_USD $${batas.toFixed(2)}`;
  if (!tty) throw new Error(`${pesan}. Periksa apakah memang sebanyak itu yang berubah, lalu ulangi dengan --ya.`);
  const j = await tanya(`  ! ${pesan}. Lanjut? [y/N] `);
  if (!/^(y|ya|yes)$/i.test(j.trim())) throw new Error('dibatalkan: biaya di atas batas');
}

/* Realisasi per perintah ke `<proyek>/biaya.json`. Diukur dari selisih kredit terpakai akun
   sebelum dan sesudah perintah; pemakaian lain di akun yang sama pada saat itu ikut terhitung.
   @param {string} dir
   @param {{perintah: string, perkiraan: number, realisasi: number | null, hemat?: number}} e
   @param {Date} [sekarang] */
export function catat(dir, e, sekarang = new Date()) {
  const f = path.join(dir, 'biaya.json');
  let isi = [];
  try { if (existsSync(f)) isi = JSON.parse(readFileSync(f, 'utf8')); } catch { isi = []; } // berkas rusak: mulai catatan baru daripada menggagalkan perintah yang sudah berbayar
  if (!Array.isArray(isi)) isi = [];
  isi.push({t: sekarang.toISOString(), ...e, usd: +usd(e.realisasi ?? e.perkiraan).toFixed(4)});
  writeFileSync(f, `${JSON.stringify(isi, null, 1)}\n`);
  return isi.at(-1);
}

/* Bungkus satu perintah CLI: cetak perkiraan, minta persetujuan bila perlu, jalankan, lalu catat
   realisasinya. Kalau gerbangnya menolak, `kerja` TIDAK PERNAH dipanggil.
   @template T
   @param {import('./tipe.mjs').Config} c
   @param {string} perintah
   @param {Langkah[]} langkah
   @param {() => Promise<T>} kerja
   @param {{ya?: boolean, cetak?: boolean, kuota?: () => Promise<{terpakai: number}>, log?: (s: string) => void,
     jagaOpsi?: Parameters<typeof jaga>[1]}} [o]
   @returns {Promise<T>} */
export async function berbiaya(c, perintah, langkah, kerja, o = {}) {
  const log = o.log || ((s) => console.log(s));
  const p = perkiraan(c, langkah);
  if (p.kredit || p.hemat || o.cetak) log(ringkas(p));
  if (!p.kredit) {
    // Semua dari cache: tidak ada yang ditanyakan, tapi penghematannya tetap tercatat.
    if (p.hemat) catat(c.dir, {perintah, perkiraan: 0, realisasi: null, hemat: p.hemat});
    return kerja();
  }
  await jaga(p, {...o.jagaOpsi, ya: o.ya});
  const kuota = o.kuota || (async () => (await import('./el.mjs')).kuota());
  const awal = await kuota().catch(() => null);
  try {
    return await kerja();
  } finally {
    const akhir = awal && await kuota().catch(() => null);
    const selisih = awal && akhir ? akhir.terpakai - awal.terpakai : null;
    // Negatif = kuota bulanan direset di tengah perintah; angka itu tidak berarti apa-apa.
    catat(c.dir, {perintah, perkiraan: p.kredit, realisasi: selisih !== null && selisih >= 0 ? selisih : null,
      ...(p.hemat ? {hemat: p.hemat} : {})});
  }
}
