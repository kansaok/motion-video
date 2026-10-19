// Muat .env dari akar motion-engine. Nilai yang sudah ada di process.env menang,
// supaya bisa ditimpa per perintah tanpa menyentuh berkas.
import {readFileSync, existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const AKAR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const berkas = process.env.MOTION_ENV || path.join(AKAR, '.env');
if (existsSync(berkas)) {
  for (const baris of readFileSync(berkas, 'utf8').split('\n')) {
    const m = baris.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) process.env[m[1]] ??= m[2].trim().replace(/^["']|["']$/g, '');
  }
}

// Dipanggil sebelum perintah yang butuh kunci, supaya gagalnya jelas dan awal —
// bukan setengah jalan sesudah separuh VO tergenerate.
export function wajib(...nama) {
  const hilang = nama.filter((n) => !process.env[n]);
  if (hilang.length) {
    throw new Error(
      `Kunci belum ada di ${berkas}: ${hilang.join(', ')}\n` +
      `Salin .env.example jadi .env lalu isi nilainya.`);
  }
}
