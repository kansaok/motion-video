/* Webhook render (P6-08): klien tidak perlu memoll `status_render` tiap 20 detik.

   URL kiriman pelanggan dipanggil SERVER ini, jadi penjaganya sama dengan unduhan URL:
   - hanya https, tanpa kredensial di URL, host harus ter-resolve ke alamat publik;
   - diperiksa saat render diantrekan (gagal cepat) DAN saat dikirim: koneksi dibuat ke IP yang
     baru saja diperiksa (SNI/Host tetap nama host), jadi DNS yang berganti di antara keduanya
     (rebinding) tidak bisa membawa POST ke metadata cloud atau container tetangga;
   - redirect tidak diikuti.

   Tanda tangan: rahasia per render = HMAC(UNDUH_RAHASIA, "webhook:" + id render), dikembalikan
   sekali di jawaban `render`. Server tidak menyimpan rahasia apa pun dan tidak menaruhnya di
   render.json atau `status_render`. Header `X-Motion-Waktu` (detik unix) dan
   `X-Motion-Tanda: sha256=<hex HMAC(rahasia, waktu + "." + body)>`: waktu ikut ditandatangani
   supaya penerima bisa menolak kiriman lama yang diulang. */
import {createHmac, timingSafeEqual} from 'node:crypto';
import https from 'node:https';
import {alamatPublik} from '../lib/jaring.mjs';

export const WEBHOOK = Object.freeze({coba: 3, jedaMs: [2_000, 10_000], batasMs: 10_000, maksPanjangUrl: 500});

/** @param {string} id @param {string} [kunci] */
export function rahasiaWebhook(id, kunci = process.env.UNDUH_RAHASIA) {
  if (!kunci) throw new Error('UNDUH_RAHASIA belum diset: webhook tidak bisa ditandatangani');
  return createHmac('sha256', kunci).update(`webhook:${id}`).digest('hex');
}

/** @param {string} rahasia @param {number | string} waktu @param {string} body */
export const tanda = (rahasia, waktu, body) => `sha256=${createHmac('sha256', rahasia).update(`${waktu}.${body}`).digest('hex')}`;

/* Untuk penerima (dan tes): bandingkan dalam waktu konstan, tolak yang lebih tua dari `toleransi`.
   @param {string} rahasia @param {string} waktu @param {string} body @param {string} t */
export function cekTanda(rahasia, waktu, body, t, {toleransiDetik = 300, sekarang = Date.now()} = {}) {
  if (!(Math.abs(sekarang / 1000 - Number(waktu)) <= toleransiDetik)) return false;
  const a = Buffer.from(tanda(rahasia, waktu, body)), b = Buffer.from(String(t || ''));
  return a.length === b.length && timingSafeEqual(a, b);
}

/* Periksa dan resolve SEKALI; alamat yang dikembalikan adalah yang dipakai untuk koneksi.
   Resolve kedua untuk menyambung akan membuka celah rebinding di antara keduanya.
   @param {string} url @param {{publik?: (host: string) => Promise<string[]>}} [o]
   @returns {Promise<{u: URL, alamat: string}>} */
async function periksaDanResolve(url, {publik = alamatPublik} = {}) {
  let u;
  try { u = new URL(String(url)); } catch { throw new Error('webhook bukan URL yang sah'); }
  if (String(url).length > WEBHOOK.maksPanjangUrl) throw new Error(`webhook lebih dari ${WEBHOOK.maksPanjangUrl} karakter`);
  if (u.protocol !== 'https:') throw new Error('webhook harus https');
  if (u.username || u.password) throw new Error('webhook tidak boleh memuat kredensial; pakai tanda tangan X-Motion-Tanda');
  let alamat;
  try { [alamat] = await publik(u.hostname); } catch { /* ditangani di bawah */ }
  if (!alamat) throw new Error(`webhook ditolak: ${u.hostname} tidak ter-resolve ke alamat publik`);
  return {u, alamat};
}

/** Tolak URL yang tidak boleh dipanggil server.
 * @param {string} url @param {{publik?: (host: string) => Promise<string[]>}} [o] @returns {Promise<URL>} */
export const periksaWebhook = async (url, o) => (await periksaDanResolve(url, o)).u;

/* Satu POST ke IP yang sudah diperiksa. `tls` hanya untuk tes (CA sertifikat uji). */
function posHttps(u, alamat, body, header, {batasMs = WEBHOOK.batasMs, tls = {}} = {}) {
  return new Promise((selesai, gagal) => {
    const req = https.request({hostname: alamat, port: Number(u.port) || 443, path: `${u.pathname}${u.search}`, method: 'POST',
      servername: u.hostname, headers: {...header, Host: u.host, 'Content-Length': Buffer.byteLength(body)}, timeout: batasMs, ...tls}, (res) => {
      res.resume();
      res.once('end', () => selesai(res.statusCode || 0));
      res.once('error', gagal);
    });
    req.once('timeout', () => req.destroy(new Error(`tidak menjawab dalam ${Math.round(batasMs / 1000)} dtk`)));
    req.once('error', gagal);
    req.end(body);
  });
}

/**
 * Kirim satu peristiwa render. Tidak pernah melempar: hasilnya dilaporkan di `status_render`.
 * @param {string} url @param {Record<string, unknown>} isi @param {string} rahasia
 * @param {{publik?: (host: string) => Promise<string[]>, tunggu?: (ms: number) => Promise<unknown>,
 *   sekarang?: () => number, tls?: Record<string, unknown>}} [o]
 * @returns {Promise<{terkirim: boolean, status?: number, percobaan: number, galat?: string}>}
 */
export async function kirimWebhook(url, isi, rahasia, o = {}) {
  const {publik = alamatPublik, tunggu = (ms) => new Promise((r) => setTimeout(r, ms)), sekarang = () => Date.now(), tls} = o;
  const body = JSON.stringify(isi);
  let galat = '', status;
  for (let i = 1; i <= WEBHOOK.coba; i++) {
    try {
      const {u, alamat} = await periksaDanResolve(url, {publik});
      const waktu = String(Math.floor(sekarang() / 1000));
      status = await posHttps(u, alamat, body, {'Content-Type': 'application/json', 'User-Agent': 'motion-mcp',
        'X-Motion-Waktu': waktu, 'X-Motion-Tanda': tanda(rahasia, waktu, body)}, {tls});
      if (status >= 200 && status < 300) return {terkirim: true, status, percobaan: i};
      galat = `HTTP ${status}`;
      // 4xx selain 429 = penerima menolak isinya; mengulang tidak mengubah apa pun.
      if (status < 500 && status !== 429) return {terkirim: false, status, percobaan: i, galat};
    } catch (e) {
      galat = String(e.message || e).slice(0, 200);
      // URL yang kini ter-resolve ke jaringan privat tidak akan membaik dengan diulang.
      if (/ditolak|harus https|kredensial|bukan URL/.test(galat)) return {terkirim: false, percobaan: i, galat};
    }
    if (i < WEBHOOK.coba) await tunggu(WEBHOOK.jedaMs[i - 1]);
  }
  return {terkirim: false, ...(status ? {status} : {}), percobaan: WEBHOOK.coba, galat};
}
