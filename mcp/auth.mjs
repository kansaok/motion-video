/* Token langganan diverifikasi ke API bimp (POST /internal/motion-mcp/verify), bukan disimpan
   di sini: bimp yang tahu siapa yang sudah membayar dan sampai kapan. Hasilnya di-cache
   sebentar supaya satu sesi Claude (puluhan panggilan alat) tidak menjadi puluhan panggilan API,
   dan cukup singkat supaya token yang dicabut atau langganan yang habis berhenti dalam semenit. */
import {createHash} from 'node:crypto';

const API = (process.env.BIMP_API_URL || '').replace(/\/$/, '');
const KUNCI = process.env.BIMP_SERVICE_KEY || '';
const DEV = process.env.MCP_DEV_TOKEN || '';
const cache = new Map();   // sha256(token) -> {s: hasil, t: kedaluwarsa}

export async function verifikasi(token) {
  if (!token || token.length < 20 || token.length > 200) return null;
  // Mode uji lokal tanpa bimp: hanya token dev yang diterima.
  if (DEV && !API) return token === DEV ? {user_id: 0, nama: 'dev', berlaku_sampai: null} : null;
  if (!API || !KUNCI) throw new Error('BIMP_API_URL / BIMP_SERVICE_KEY belum diset');

  const k = createHash('sha256').update(token).digest('hex');
  const c = cache.get(k);
  if (c && c.t > Date.now()) return c.s;

  let s = null;
  try {
    const r = await fetch(`${API}/internal/motion-mcp/verify`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Accept: 'application/json', 'X-Motion-Service-Key': KUNCI},
      body: JSON.stringify({token}),
      signal: AbortSignal.timeout(8000),
    });
    const j = await r.json().catch(() => ({})); // badan bukan JSON = token tidak sah, bukan API mati
    if (r.ok && j.valid) s = {user_id: Number(j.user_id), nama: j.name || '', berlaku_sampai: j.expires_at || null};
  } catch (e) {
    // API bimp mati: pakai hasil terakhir yang sah kalau masih ada, supaya render tidak putus.
    if (c?.s) return c.s;
    throw new Error(`verifikasi token gagal: ${e.message}`);
  }
  cache.set(k, {s, t: Date.now() + (s ? 60e3 : 15e3)});
  if (cache.size > 5000) cache.delete(cache.keys().next().value);
  return s;
}
