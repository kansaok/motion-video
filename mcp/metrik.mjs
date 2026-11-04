/* Metrik Prometheus untuk /metrik. Sengaja tanpa dependensi: yang dibutuhkan hanya counter,
   gauge, dan histogram berlabel, dan format teksnya stabil.

   Grafik dasar yang harus bisa dibuat dari sini:
     sukses vs gagal  rate(motion_render_total{status="selesai"}[1h]) dan {status="gagal"}
     p95 durasi       histogram_quantile(0.95, rate(motion_render_detik_bucket[1h]))
     per langkah      histogram_quantile(0.95, sum by (le, langkah) (rate(motion_render_langkah_detik_bucket[1h]))) */

import {privat} from '../lib/jaring.mjs';

// Render di VPS berkisar puluhan detik sampai ±15 menit; ember ini menutup rentang itu.
const EMBER = [1, 5, 15, 30, 60, 120, 300, 600, 900, 1800];

const kunciLabel = (label) => Object.entries(label).sort(([a], [b]) => a.localeCompare(b))
  .map(([k, v]) => `${k}="${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`).join(',');
const bungkus = (isi) => (isi ? `{${isi}}` : '');

export function buatRegistri() {
  /** @type {Map<string, {jenis: string, bantuan: string, nilai: Map<string, any>, ember?: number[], ambil?: () => any}>} */
  const m = new Map();
  const daftar = (nama, jenis, bantuan, extra = {}) => {
    if (!m.has(nama)) m.set(nama, {jenis, bantuan, nilai: new Map(), ...extra});
    return m.get(nama);
  };
  return {
    counter(nama, bantuan) {
      const d = daftar(nama, 'counter', bantuan);
      return {tambah: (label = {}, n = 1) => { const k = kunciLabel(label); d.nilai.set(k, (d.nilai.get(k) || 0) + n); }};
    },
    // `ambil` dipanggil saat /metrik diminta, jadi nilainya selalu segar tanpa timer.
    gauge(nama, bantuan, ambil) { daftar(nama, 'gauge', bantuan, {ambil}); },
    histogram(nama, bantuan, ember = EMBER) {
      const d = daftar(nama, 'histogram', bantuan, {ember});
      return {amati: (detik, label = {}) => {
        const k = kunciLabel(label);
        const h = d.nilai.get(k) || {hitung: ember.map(() => 0), jumlah: 0, banyak: 0};
        ember.forEach((b, i) => { if (detik <= b) h.hitung[i]++; });
        h.jumlah += detik; h.banyak++;
        d.nilai.set(k, h);
      }};
    },
    async teks() {
      const out = [];
      for (const [nama, d] of m) {
        out.push(`# HELP ${nama} ${d.bantuan}`, `# TYPE ${nama} ${d.jenis}`);
        if (d.jenis === 'gauge') {
          const v = await d.ambil();
          // Gauge berlabel mengembalikan [[label, nilai], ...]; tanpa label cukup satu angka.
          const baris = typeof v === 'number' ? [[{}, v]] : (v || []);
          for (const [label, n] of baris) out.push(`${nama}${bungkus(kunciLabel(label))} ${n}`);
        } else if (d.jenis === 'counter') {
          for (const [k, n] of d.nilai) out.push(`${nama}${bungkus(k)} ${n}`);
        } else {
          for (const [k, h] of d.nilai) {
            const pre = k ? `${k},` : '';
            d.ember.forEach((b, i) => out.push(`${nama}_bucket{${pre}le="${b}"} ${h.hitung[i]}`));
            out.push(`${nama}_bucket{${pre}le="+Inf"} ${h.banyak}`, `${nama}_sum${bungkus(k)} ${h.jumlah}`, `${nama}_count${bungkus(k)} ${h.banyak}`);
          }
        }
      }
      return `${out.join('\n')}\n`;
    },
  };
}

export const registri = buatRegistri();
export const renderTotal = registri.counter('motion_render_total', 'Render yang berakhir, per status (selesai/gagal).');
export const renderDetik = registri.histogram('motion_render_detik', 'Durasi render dari mulai jalan sampai selesai/gagal, detik.');
export const langkahDetik = registri.histogram('motion_render_langkah_detik', 'Durasi tiap langkah render (sfx, rencana, mix, render, periksa), detik.');
export const cuplikTotal = registri.counter('motion_cuplik_total', 'Permintaan cuplik, per status.');

/* /metrik hanya untuk Prometheus di host/jaringan Docker. Permintaan dari internet selalu
   lewat reverse proxy, yang menambahkan X-Forwarded-For; tolak itu meskipun alamat soket
   proxy-nya privat. `req.ip` sengaja tidak dipakai karena `trust proxy` membuatnya bisa diatur
   klien. */
/**
 * @param {string | undefined} alamat  req.socket.remoteAddress
 * @param {Record<string, any>} header
 */
export function bolehMetrik(alamat, header) {
  if (header['x-forwarded-for'] || header['x-real-ip'] || header.forwarded) return false;
  const ip = String(alamat || '').replace(/^::ffff:/, '');
  return Boolean(ip) && privat(ip);
}
