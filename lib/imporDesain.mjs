/* Impor proyek Claude Design lewat endpoint internal OmeletteService (P6-10).
   Endpoint ini tidak berdokumen dan bisa berubah tanpa pemberitahuan, jadi SELURUH asumsi
   tentang bentuk responsnya ada di sini (`daftarDariRespons`, `isiDariRespons`) dan setiap
   penyimpangan jadi galat yang menyebut kunci yang benar-benar diterima. Lapisan browser
   (bin/impor-design.mjs) hanya mengirim POST; semua validasi diuji tanpa jaringan.

   Bentuk respons yang diasumsikan (dari prosedur README, 29 Sep 2026; BELUM diverifikasi ulang
   terhadap endpoint hidup sejak dipindah ke skrip): ListFiles → {files:[{path,size}]},
   GetFile → {content:<base64>}. Nama kunci alternatif yang diterima dicatat di KUNCI_*. */

import {mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';

export const LAYANAN = '/design/anthropic.omelette.api.v1alpha.OmeletteService';
const KUNCI_DAFTAR = ['files', 'items', 'entries'];
const KUNCI_ISI = ['content', 'data', 'contents'];
// Sama dengan batas ekstrak zip: tautan Design tidak boleh jadi jalan memutar batas itu.
export const BATAS = Object.freeze({berkas: 2000, bytes: 300 * 1048576});

/** Ambil projectId dari tautan claude.ai atau terima id polos. UUID atau token [A-Za-z0-9_-]{16,}. */
export function idProyek(masukan) {
  const s = String(masukan || '').trim();
  if (/^[A-Za-z0-9_-]{16,}$/.test(s)) return s;
  let u;
  try { u = new URL(s); } catch { throw new Error(`bukan tautan atau projectId: "${s.slice(0, 80)}"`); }
  if (u.hostname !== 'claude.ai') throw new Error(`tautan harus di claude.ai, bukan ${u.hostname}`);
  const uuid = u.pathname.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  if (uuid) return uuid[0];
  const seg = u.pathname.split('/').filter(Boolean).reverse().find((x) => /^[A-Za-z0-9_-]{16,}$/.test(x));
  if (!seg) throw new Error(`projectId tidak ditemukan di ${u.pathname}; berikan id-nya langsung`);
  return seg;
}

const ringkasKunci = (o) => (o && typeof o === 'object' ? `{${Object.keys(o).slice(0, 8).join(', ')}}` : typeof o);

/** @returns {{path: string, size?: number}[]} */
export function daftarDariRespons(r) {
  const kunci = KUNCI_DAFTAR.find((k) => Array.isArray(r?.[k]));
  if (!kunci) throw new Error(`ListFiles tidak memuat daftar berkas (dicari: ${KUNCI_DAFTAR.join('/')}); respons berkunci ${ringkasKunci(r)} — endpoint kemungkinan berubah`);
  return r[kunci].map((x, i) => {
    if (typeof x?.path !== 'string' || !x.path) throw new Error(`ListFiles entri ${i} tanpa "path"; berkunci ${ringkasKunci(x)}`);
    return {path: x.path, size: x.size};
  });
}

export function isiDariRespons(r, jalur) {
  const kunci = KUNCI_ISI.find((k) => typeof r?.[k] === 'string');
  if (!kunci) throw new Error(`GetFile ${jalur} tanpa isi (dicari: ${KUNCI_ISI.join('/')}); respons berkunci ${ringkasKunci(r)} — endpoint kemungkinan berubah`);
  const b64 = r[kunci];
  if (b64 && !/^[A-Za-z0-9+/\s]+={0,2}\s*$/.test(b64)) throw new Error(`GetFile ${jalur}: isi bukan base64`);
  return Buffer.from(b64, 'base64');
}

/* Jalur dari server tidak dipercaya: traversal menulis di luar src/, dan berkas tersembunyi
   (`.git`, `.env`) tidak ada gunanya untuk komposisi. */
export function jalurAmanRel(p) {
  const n = path.posix.normalize(String(p).replace(/^\/+/, ''));
  if (!n || n === '.' || n.startsWith('..') || n.includes('\0') || path.posix.isAbsolute(n)
    || n.split('/').some((s) => s.startsWith('.'))) throw new Error(`jalur berkas tidak aman: ${JSON.stringify(String(p).slice(0, 80))}`);
  return n;
}

/* Editor menyajikan versi yang disuntiki <style>/<script data-omelette-injected> (21 KB, bukan
   1,6 KB aslinya). Yang disuntik tidak mengandung </style>/</script> di dalamnya, jadi
   pencocokan tidak serakah. Tag lain berdata yang sama (mis. <link>) ikut dibuang. */
export function bersihkan(html) {
  const sebelum = html.length;
  const hasil = html
    .replace(/<style\b[^>]*\bdata-omelette-injected\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script\b[^>]*\bdata-omelette-injected\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<link\b[^>]*\bdata-omelette-injected\b[^>]*>/gi, '');
  if (/data-omelette-injected/i.test(hasil)) throw new Error('masih ada data-omelette-injected sesudah dibersihkan (bentuk tag baru?)');
  return {html: hasil, dibuang: sebelum - hasil.length};
}

/**
 * Ambil semua berkas proyek dan tulis ke `dirSrc`.
 * @param {{daftar: () => Promise<any>, ambil: (path: string) => Promise<any>}} sumber
 *   pembungkus POST; tes menyuntiknya, skrip memakai fetch di dalam halaman claude.ai.
 */
export async function impor(sumber, dirSrc, {batas = BATAS, log = (/** @type {string} */ _s) => {}} = {}) {
  const daftar = daftarDariRespons(await sumber.daftar());
  if (!daftar.length) throw new Error('proyek Design tidak berisi berkas');
  if (daftar.length > batas.berkas) throw new Error(`${daftar.length} berkas, batas ${batas.berkas}`);
  const sudah = new Set();
  let bytes = 0, dibuang = 0;
  const hasil = [];
  for (const {path: jalur} of daftar) {
    const rel = jalurAmanRel(jalur);
    if (sudah.has(rel)) throw new Error(`jalur ganda: ${rel}`);
    sudah.add(rel);
    let isi = isiDariRespons(await sumber.ambil(jalur), jalur);
    // Kolom `size` di ListFiles bisa basi; panjang isi GetFile yang dipercaya.
    if (/\.html?$/i.test(rel)) {
      const b = bersihkan(isi.toString('utf8'));
      dibuang += b.dibuang;
      isi = Buffer.from(b.html, 'utf8');
    }
    bytes += isi.length;
    if (bytes > batas.bytes) throw new Error(`isi proyek melewati ${Math.floor(batas.bytes / 1048576)} MB`);
    const tujuan = path.join(dirSrc, rel);
    mkdirSync(path.dirname(tujuan), {recursive: true});
    writeFileSync(tujuan, isi);
    hasil.push({path: rel, bytes: isi.length});
    log(`  ${rel} (${isi.length} B)`);
  }
  return {berkas: hasil, bytes, dibuang};
}
