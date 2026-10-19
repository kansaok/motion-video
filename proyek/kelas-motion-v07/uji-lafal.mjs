/* Uji ejaan dalam konteks produksi: tiap varian x tiap seed -> TTS -> STT.
   node proyek/kelas-motion-v07/uji-lafal.mjs */
import * as EL from '../../lib/el.mjs';
const S = {voice: 'iWydkXKoiVtvdn4vLKp9', stability: 0.14, similarity: 0.80, style: 0.72, speed: 1.2};
const U = [
  ...['Klode', 'Klod', 'Klôd', 'Klo\'d'].map((k) => ({
    teks: `${k} bikin animasinya, ilevenlebs isi suara sama musiknya. Videonya jadi!`,
    sebelum: 'Nggak perlu beli after efek, templet, plagin, apalagi jasa. No gimik!',
    sesudah: 'Empat belas video ini, resepnya sama. Termasuk iklan yang lagi kamu tonton!'})),
  ...['Chat Wulan', 'Cet Wulan', 'Chat, Wulan,', 'Chat Mbak Wulan'].map((k) => ({
    teks: `${k} buat daftar!`, o: {style: 0.95, stability: 0.05, speed: 1.05},
    sebelum: 'Kelas moshen, sebelas atau dua belas Oktober. Cuma seratus tujuh puluh sembilan ribu!'})),
];
for (const u of U) await Promise.all([20260930, 20260931, 20260932].map(async (seed) => {
  const b = await EL.suara(u.teks, {...S, ...u.o, seed, sebelum: u.sebelum, sesudah: u.sesudah});
  u[seed] = await EL.transkrip(b);
}));
for (const u of U) console.log(u.teks.slice(0, 26).padEnd(28), [20260930, 20260931, 20260932].map((s) => u[s].slice(0, 34)).join(' | '));
