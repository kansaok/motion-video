/* Pemeriksaan rahasia sebelum server membuka port di produksi. Tanpa ini, fallback yang
   mudah ditebak dapat membuat tautan unduh pelanggan lain dapat dipalsukan. */
export function periksaLingkungan(env = process.env) {
  if (env.NODE_ENV !== 'production') return;

  const kurang = [];
  if (String(env.UNDUH_RAHASIA || '').length < 32) kurang.push('UNDUH_RAHASIA (minimal 32 karakter)');
  if (!String(env.BIMP_API_URL || '').trim()) kurang.push('BIMP_API_URL');
  if (!String(env.BIMP_SERVICE_KEY || '').trim()) kurang.push('BIMP_SERVICE_KEY');
  if (String(env.MCP_DEV_TOKEN || '').trim()) kurang.push('MCP_DEV_TOKEN harus kosong di produksi');
  // Dasbor admin opsional, tapi token pendek di sana = tombol batalkan untuk semua akun yang bisa ditebak.
  if (env.ADMIN_TOKEN && String(env.ADMIN_TOKEN).length < 32) kurang.push('ADMIN_TOKEN (minimal 32 karakter, atau kosongkan)');
  if (kurang.length) throw new Error(`konfigurasi produksi tidak aman: ${kurang.join(', ')}`);
}
