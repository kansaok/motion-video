/* Uji ejaan hook V09 dengan eleven_v4: tiap ejaan x 3 seed -> TTS -> STT.
   node proyek/kelas-motion-keresahan/uji-lafal.mjs */
import * as EL from '../../lib/el.mjs';
const S = {voice: 'iWydkXKoiVtvdn4vLKp9', model: 'eleven_v4', stability: 0.14, similarity: 0.80, speed: 1.2};
const sesudah = 'Bukan teori doang, belum lima jam videonya jadi!';
const U = [
  'Harus langganan apa aja? Claude Pro sama Eleven Labs, itu aja!',
  'Harus langganan apa aja? Klo\'d Pro sama Eleven Labs, itu aja!',
  'Harus langganan apa aja? Claude Pro sama ElevenLabs, itu aja!',
  'Bisa buat promo jualan? Promo kelas Eksel, jadi tadi pagi!',
  'Bisa buat promo jualan? Promo kelas Excel, jadi tadi pagi!',
].map((teks) => ({teks}));
const SEED = [20261011, 20261012, 20261013];
for (const u of U) await Promise.all(SEED.map(async (seed) => {
  u[seed] = await EL.transkrip(await EL.suara(u.teks, {...S, seed, sesudah}));
}));
for (const u of U) console.log(u.teks.slice(25, 58).padEnd(34), SEED.map((s) => u[s].slice(24, 60)).join(' | '));
