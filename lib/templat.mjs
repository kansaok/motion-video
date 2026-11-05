/* Pustaka templat komposisi (P6-05): `templat/<nama>/` berisi
     templat.json        nama, judul, deskripsi, scene, cocok untuk
     src/                komposisi kontrak v2 (Video.html) + isi.js (teks layar yang diganti pengguna)
     motion.config.mjs   config CLI: suara ElevenLabs, musik `rencana`, SFX `@stok/`, cue fungsi
     config.json         config MCP: bentuk JSON + ekspresi detik (VO/musik diunggah pelanggan)

   Dua config karena dua pintu masuk punya kontrak berbeda (CLI menjalankan fungsi dan membuat
   VO/musik sendiri; MCP hanya menerima JSON dan aset unggahan). test/templat.test.mjs menjaga
   keduanya tetap sama naskah, scene, dan SFX-nya. */
import {cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {AKAR} from './env.mjs';

export const DIR = path.join(AKAR, 'templat');
const NAMA = /^[a-z0-9][a-z0-9-]{1,40}$/;

/** @returns {Array<{nama: string, judul: string, deskripsi: string, cocok: string, scene: string[], detik: number}>} */
export function daftar(dir = DIR) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((n) => NAMA.test(n) && existsSync(path.join(dir, n, 'templat.json')))
    .map((n) => ({nama: n, ...JSON.parse(readFileSync(path.join(dir, n, 'templat.json'), 'utf8'))}))
    .sort((a, b) => a.nama.localeCompare(b.nama));
}

/** @param {string} nama */
export function buka(nama, dir = DIR) {
  if (!NAMA.test(String(nama)) || !existsSync(path.join(dir, nama, 'templat.json'))) {
    throw new Error(`templat "${nama}" tidak ada; pilihan: ${daftar(dir).map((t) => t.nama).join(', ')}`);
  }
  const d = path.join(dir, nama);
  return {dir: d, src: path.join(d, 'src'), meta: JSON.parse(readFileSync(path.join(d, 'templat.json'), 'utf8'))};
}

/** Berkas src templat sebagai [jalur relatif, isi]. @param {string} nama */
export function berkasSrc(nama, dir = DIR) {
  const t = buka(nama, dir);
  const out = [];
  const jalan = (d, rel) => {
    for (const e of readdirSync(d, {withFileTypes: true})) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) jalan(path.join(d, e.name), r); else out.push([r, readFileSync(path.join(d, e.name))]);
    }
  };
  jalan(t.src, '');
  return out;
}

/** Config MCP templat (JSON). @param {string} nama */
export const configMcp = (nama, dir = DIR) => JSON.parse(readFileSync(path.join(buka(nama, dir).dir, 'config.json'), 'utf8'));

/* `motion init --templat=<nama> <folder>`: salin src + config CLI. Folder yang sudah punya
   config tidak ditimpa: templat dipakai untuk memulai, bukan untuk menimpa pekerjaan.
   @param {string} nama @param {string} tujuan */
export function pasang(nama, tujuan, dir = DIR) {
  const t = buka(nama, dir);
  const cfg = path.join(tujuan, 'motion.config.mjs');
  if (existsSync(cfg)) throw new Error(`config sudah ada, tidak ditimpa: ${cfg}`);
  if (existsSync(path.join(tujuan, 'src')) && readdirSync(path.join(tujuan, 'src')).length) {
    throw new Error(`${path.join(tujuan, 'src')} sudah berisi berkas; pakai folder kosong`);
  }
  mkdirSync(tujuan, {recursive: true});
  cpSync(t.src, path.join(tujuan, 'src'), {recursive: true});
  // Nama proyek = nama folder; keluaran mengikuti, supaya dua proyek dari satu templat tidak sama.
  const namaProyek = path.basename(path.resolve(tujuan)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || nama;
  writeFileSync(cfg, readFileSync(path.join(t.dir, 'motion.config.mjs'), 'utf8').replaceAll('__NAMA__', namaProyek));
  return {templat: t.meta, src: path.join(tujuan, 'src'), config: cfg};
}
