/* Uji ejaan CTA dengan eleven_v4, konteks produksi: tiap ejaan x 3 seed -> TTS -> STT.
   node proyek/kelas-motion-senin/uji-lafal.mjs */
import * as EL from '../../lib/el.mjs';
const S = {voice: 'iWydkXKoiVtvdn4vLKp9', model: 'eleven_v4', stability: 0.05, similarity: 0.80, speed: 1.05};
const sebelum = 'Senin malam, giliran kamu. Cuma seratus tujuh sembilan ribu!';
const U = ['Chat Wulan buat daftar!', 'Chet Wulan buat daftar!', 'Chat, Wulan, buat daftar!', 'Chat Mbak Wulan buat daftar!', 'Cet Wulan buat daftar!']
  .map((teks) => ({teks}));
const SEED = [20261011, 20261012, 20261013];
for (const u of U) await Promise.all(SEED.map(async (seed) => {
  const b = await EL.suara(u.teks, {...S, seed, sebelum});
  u[seed] = await EL.transkrip(b);
}));
for (const u of U) console.log(u.teks.padEnd(30), SEED.map((s) => u[s].slice(0, 30)).join(' | '));
