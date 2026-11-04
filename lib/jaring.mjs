/* Penjaga jaringan untuk isi kiriman orang lain (dipakai motion-mcp).

   Komposisi berjalan di Chromium dan boleh memuat font/gambar dari internet — tetapi di server
   bersama, `fetch` ke jaringan dalam (metadata cloud 169.254.169.254, API bimp, container
   tetangga) lalu menggambar hasilnya ke frame sama dengan membocorkannya lewat MP4. */
import {lookup} from 'node:dns/promises';
import net from 'node:net';

const PRIVAT = [
  ['10.0.0.0', 8], ['172.16.0.0', 12], ['192.168.0.0', 16], ['127.0.0.0', 8], ['169.254.0.0', 16],
  ['100.64.0.0', 10], ['192.0.0.0', 24], ['192.0.2.0', 24], ['198.18.0.0', 15],
  ['198.51.100.0', 24], ['203.0.113.0', 24], ['0.0.0.0', 8], ['224.0.0.0', 4], ['240.0.0.0', 4],
];
const keAngka = (ip) => ip.split('.').reduce((a, b) => (a << 8) + Number(b), 0) >>> 0;

export function privat(ip) {
  if (net.isIPv6(ip)) {
    const x = ip.toLowerCase();
    if (x.startsWith('::ffff:')) return privat(x.slice(7));
    return x === '::1' || x === '::' || /^f[cd]/.test(x) || /^fe[89ab]/.test(x)
      || x.startsWith('64:ff9b:') || x.startsWith('2001:db8:') || x.startsWith('ff');
  }
  return PRIVAT.some(([a, m]) => (keAngka(ip) >>> (32 - m)) === (keAngka(a) >>> (32 - m)));
}

const cache = new Map();
const TTL_DNS = 60_000, MAKS_CACHE_DNS = 1000;

/* Resolver disimpan singkat saja. Selain menghindari lookup mahal tiap aset, alamat hasil
   resolve inilah yang nanti dipakai untuk sambungan HTTPS agar DNS tidak dapat berubah di
   sela pemeriksaan dan koneksi (DNS rebinding). */
export async function alamatPublik(host, {cari = lookup, sekarang = () => Date.now()} = {}) {
  const h = host.replace(/^\[|\]$/g, '');
  if (net.isIP(h)) {
    if (privat(h)) throw new Error(`host ${host} mengarah ke jaringan privat`);
    return [h];
  }
  const lama = cache.get(h);
  if (lama && lama.hingga > sekarang()) return lama.nilai;
  if (cache.size >= MAKS_CACHE_DNS) cache.delete(cache.keys().next().value);
  const nilai = Promise.resolve(cari(h, {all: true, verbatim: true})).then((jawab) => {
    const alamat = jawab.map((x) => x.address);
    if (!alamat.length || alamat.some(privat)) throw new Error(`host ${host} mengarah ke jaringan privat`);
    return alamat;
  }).catch((e) => { cache.delete(h); throw e; });
  cache.set(h, {hingga: sekarang() + TTL_DNS, nilai});
  return nilai;
}

export async function hostPrivat(host) {
  try { await alamatPublik(host); return false; } catch { return true; }
}

/* Handler page.route: hanya server statis render itu sendiri (asal `izin`) dan alamat publik
   http(s)/data/blob yang lolos. */
export function jagaHalaman(izin) {
  const asal = new URL(izin).origin;
  return async (route) => {
    const u = new URL(route.request().url());
    if (u.origin === asal || u.protocol === 'data:' || u.protocol === 'blob:') return route.continue();
    if ((u.protocol === 'http:' || u.protocol === 'https:') && !(await hostPrivat(u.hostname))) return route.continue();
    return route.abort('blockedbyclient');
  };
}

/* page.route tidak menjangkau WebSocket; Playwright menyediakan penjaga terpisah untuknya. */
export function jagaWebSocket(izin) {
  const asal = new URL(izin).origin;
  return async (route) => {
    const u = new URL(route.url());
    if (u.origin === asal || ((u.protocol === 'ws:' || u.protocol === 'wss:') && !(await hostPrivat(u.hostname)))) return route.connect();
    return route.close();
  };
}
