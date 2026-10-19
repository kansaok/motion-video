/* Uji ejaan "build" dalam konteks produksi: tiap varian x 3 seed -> TTS -> STT. */
import * as EL from '../../lib/el.mjs';
const S = {voice: 'iWydkXKoiVtvdn4vLKp9', stability: 0.14, similarity: 0.80, style: 0.85, speed: 1.2};
const U = ['build', 'bild', 'bilt', 'bil-d', 'ngebild'].map((k) => ({
  teks: `Khusus member ei-ai klab, dari Aceh sampai Papua. Waktunya ${k}!`,
  sebelum: 'Empat belas video ini, resepnya sama. Termasuk iklan yang lagi kamu tonton!',
  sesudah: 'Normalnya seratus tujuh puluh sembilan ribu. Member cuma seratus empat puluh sembilan ribu!'}));
for (const u of U) await Promise.all([20260930, 20260931, 20260932].map(async (seed) => {
  u[seed] = await EL.transkrip(await EL.suara(u.teks, {...S, seed, sebelum: u.sebelum, sesudah: u.sesudah}));
}));
for (const u of U) console.log(u.teks.slice(-12).padEnd(14), [20260930, 20260931, 20260932].map((s) => u[s].slice(-22)).join(' | '));
