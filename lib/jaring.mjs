/* Penjaga jaringan untuk isi kiriman orang lain (dipakai motion-mcp).

   Komposisi berjalan di Chromium dan boleh memuat font/gambar dari internet — tetapi di server
   bersama, `fetch` ke jaringan dalam (metadata cloud 169.254.169.254, API bimp, container
   tetangga) lalu menggambar hasilnya ke frame sama dengan membocorkannya lewat MP4. */
import {lookup} from 'node:dns/promises';
import net from 'node:net';

const PRIVAT = [
  ['10.0.0.0', 8], ['172.16.0.0', 12], ['192.168.0.0', 16], ['127.0.0.0', 8], ['169.254.0.0', 16],
  ['100.64.0.0', 10], ['0.0.0.0', 8], ['224.0.0.0', 4],
];
const keAngka = (ip) => ip.split('.').reduce((a, b) => (a << 8) + Number(b), 0) >>> 0;

export function privat(ip) {
  if (net.isIPv6(ip)) {
    const x = ip.toLowerCase();
    if (x.startsWith('::ffff:')) return privat(x.slice(7));
    return x === '::1' || x === '::' || /^f[cd]/.test(x) || /^fe[89ab]/.test(x);
  }
  return PRIVAT.some(([a, m]) => (keAngka(ip) >>> (32 - m)) === (keAngka(a) >>> (32 - m)));
}

const cache = new Map();
export async function hostPrivat(host) {
  const h = host.replace(/^\[|\]$/g, '');
  if (net.isIP(h)) return privat(h);
  if (!cache.has(h)) cache.set(h, lookup(h, {all: true}).then((a) => a.some((x) => privat(x.address))).catch(() => true));
  return cache.get(h);
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
