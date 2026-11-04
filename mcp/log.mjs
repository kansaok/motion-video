/* Log server: satu objek JSON per baris, supaya agregator log (docker json-file, Loki, dsb.)
   bisa memfilter per akun/render tanpa regex.

   Yang TIDAK boleh tercatat: token (ada di path /mcp/<token> dan header), teks naskah VO,
   dan URL unggahan (sering memuat tanda tangan sementara). Kunci-kunci itu dibuang di sini,
   bukan diandalkan pada disiplin tiap pemanggil. */
const TERLARANG = /^(token|authorization|text|teks|naskah|url|isi|base64|sig|kunci)$/i;
const MAKS_TEKS = 500;

function bersih(nilai, kedalaman = 0) {
  if (typeof nilai === 'string') return nilai.length > MAKS_TEKS ? `${nilai.slice(0, MAKS_TEKS)}…` : nilai;
  if (nilai instanceof Error) return bersih(nilai.message, kedalaman);
  if (!nilai || typeof nilai !== 'object' || kedalaman > 3) return nilai;
  if (Array.isArray(nilai)) return nilai.slice(0, 20).map((x) => bersih(x, kedalaman + 1));
  return Object.fromEntries(Object.entries(nilai)
    .filter(([k]) => !TERLARANG.test(k))
    .map(([k, v]) => [k, bersih(v, kedalaman + 1)]));
}

/**
 * @param {'info' | 'warn' | 'error'} level
 * @param {string} pesan
 * @param {Record<string, any>} [data]  mis. {uid, render, langkah, ms}
 * @param {(baris: string) => void} [tulis]
 */
export function log(level, pesan, data = {}, tulis = level === 'info' ? (b) => process.stdout.write(b) : (b) => process.stderr.write(b)) {
  const baris = JSON.stringify({t: new Date().toISOString(), level, pesan, ...bersih(data)});
  tulis(`${baris}\n`);
  return baris;
}

export const info = (pesan, data) => log('info', pesan, data);
export const peringatan = (pesan, data) => log('warn', pesan, data);
export const galat = (pesan, data) => log('error', pesan, data);
