/* Versi skema config.json milik proyek MCP.

   Config tersimpan di volume pelanggan berbulan-bulan; skema `Config` di alat.mjs bisa berubah
   di antaranya. Setiap perubahan yang TIDAK kompatibel (field diganti nama, makna berubah, field
   wajib baru) menaikkan VERSI_SKEMA, menambah satu langkah di MIGRASI, dan menaikkan versi
   mayor package.json. Perubahan yang hanya menambah field opsional tidak butuh migrasi.

   Config tanpa `versiSkema` dibuat sebelum field ini ada dan dianggap versi 1. */
export const VERSI_SKEMA = 1;

/** @type {Record<number, (j: Record<string, any>) => Record<string, any>>} langkah dari versi n ke n+1 */
export const MIGRASI = {};

/**
 * @param {Record<string, any>} j
 * @param {{versi?: number, migrasi?: typeof MIGRASI}} [o]
 */
export function migrasiConfig(j, {versi = VERSI_SKEMA, migrasi = MIGRASI} = {}) {
  let v = j.versiSkema ?? 1;
  if (!Number.isInteger(v) || v < 1) throw new Error(`versiSkema config tidak sah: ${j.versiSkema}`);
  if (v > versi) throw new Error(`config memakai versiSkema ${v}, server ini hanya mengenal sampai ${versi} — perbarui motion-mcp`);
  let hasil = {...j};
  while (v < versi) {
    const langkah = migrasi[v];
    if (!langkah) throw new Error(`tidak ada migrasi config dari versiSkema ${v} ke ${v + 1}`);
    hasil = langkah(hasil);
    v++;
  }
  return {...hasil, versiSkema: versi};
}
