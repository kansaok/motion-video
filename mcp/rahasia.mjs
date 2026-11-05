/* Kunci API ElevenLabs milik pelanggan (P8-12, BYOK). Dengan kunci itu server membuat VO langsung
   (`buat_vo`), menggantikan generate + poll + unggah per baris lewat connector: 23 baris dulu ±70
   panggilan tool.

   Yang dijaga:
   - Tersimpan terenkripsi AES-256-GCM dengan kunci turunan HKDF dari `KUNCI_ENKRIPSI` (rahasia server
     sendiri, >= 32 karakter, terpisah dari UNDUH_RAHASIA supaya rotasinya tidak saling menyeret).
     Tanpa rahasia itu fitur ini mati, bukan jatuh ke penyimpanan polos.
   - Ciphertext diikat ke uid lewat AAD: berkas yang disalin ke akun lain gagal didekripsi.
   - Di `DATA/rahasia/`, di luar folder proyek: pekerja render (bwrap) hanya memasang proyek aktif,
     jadi Chromium yang menjalankan JS pelanggan tidak pernah bisa membacanya.
   - Berkas 0600, ditulis lewat rename. Kunci tidak pernah dikembalikan alat MCP atau dicatat di log. */
import {createCipheriv, createDecipheriv, hkdfSync, randomBytes} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {DATA} from './proyek.mjs';

const MIN = 32;
/** @param {Record<string, string | undefined>} [env] */
export const aktif = (env = process.env) => String(env.KUNCI_ENKRIPSI || '').length >= MIN;

/** @param {Record<string, string | undefined>} env */
function kunciAes(env) {
  if (!aktif(env)) throw new Error('penyimpanan kunci pelanggan belum diaktifkan di server ini (KUNCI_ENKRIPSI)');
  return Buffer.from(hkdfSync('sha256', String(env.KUNCI_ENKRIPSI), 'motion-mcp', 'elevenlabs-byok-v1', 32));
}

/** @param {string} teks @param {number} uid @param {Record<string, string | undefined>} [env] */
export function enkripsi(teks, uid, env = process.env) {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', kunciAes(env), iv);
  c.setAAD(Buffer.from(`uid:${Number(uid)}`));
  const data = Buffer.concat([c.update(teks, 'utf8'), c.final()]);
  return {v: 1, iv: iv.toString('base64'), tag: c.getAuthTag().toString('base64'), data: data.toString('base64')};
}

/** @param {{v: number, iv: string, tag: string, data: string}} j @param {number} uid @param {Record<string, string | undefined>} [env] */
export function dekripsi(j, uid, env = process.env) {
  if (j?.v !== 1) throw new Error('format kunci tersimpan tidak dikenal');
  const d = createDecipheriv('aes-256-gcm', kunciAes(env), Buffer.from(j.iv, 'base64'));
  d.setAAD(Buffer.from(`uid:${Number(uid)}`));
  d.setAuthTag(Buffer.from(j.tag, 'base64'));
  return Buffer.concat([d.update(Buffer.from(j.data, 'base64')), d.final()]).toString('utf8');
}

const berkas = (/** @type {number} */ uid, akar = DATA) => path.join(akar, 'rahasia', `${Number(uid)}.json`);

/** @param {number} uid @param {string} kunci @param {{akar?: string, env?: Record<string, string | undefined>}} [o] */
export function simpan(uid, kunci, {akar = DATA, env = process.env} = {}) {
  const f = berkas(uid, akar);
  mkdirSync(path.dirname(f), {recursive: true, mode: 0o700});
  const tmp = `${f}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(enkripsi(kunci, uid, env)), {mode: 0o600});
  renameSync(tmp, f);
}

/** @param {number} uid @param {{akar?: string, env?: Record<string, string | undefined>}} [o] @returns {string | null} */
export function baca(uid, {akar = DATA, env = process.env} = {}) {
  const f = berkas(uid, akar);
  if (!existsSync(f)) return null;
  try { return dekripsi(JSON.parse(readFileSync(f, 'utf8')), uid, env); } catch (e) {
    // Rahasia server dirotasi atau berkas rusak: pelanggan cukup menyimpan ulang kuncinya.
    throw new Error(`kunci ElevenLabs tersimpan tidak bisa dibuka (${e.message}) — simpan ulang dengan kunci_elevenlabs`);
  }
}

/** @param {number} uid @param {{akar?: string}} [o] */
export const hapus = (uid, {akar = DATA} = {}) => rmSync(berkas(uid, akar), {force: true});
/** @param {number} uid @param {{akar?: string}} [o] */
export const ada = (uid, {akar = DATA} = {}) => existsSync(berkas(uid, akar));
