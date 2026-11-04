// Musik: generate, tolak trek berlubang, pangkas kepala senyap.
import {readFileSync, writeFileSync, unlinkSync} from 'node:fs';
import path from 'node:path';
import {ff, durasi} from './ff.mjs';
import * as EL from './el.mjs';
import * as K from './komposisi.mjs';
import * as P from './periksa.mjs';
import {MUSIK} from './konstanta.mjs';
import {segar, tandai} from './kunci.mjs';
import {bacaTimeline} from './timeline.mjs';

/* Trek musik diperiksa SEBELUM diterima. Generator mengembalikan trek yang tidak rata apa
   pun prompt-nya — satu trek 31 detik keluar dengan dua breakdown 24 dB di detik 8 dan 26,
   dan itu terdengar sebagai musik yang mati di tengah iklan. Meminta "no breakdown" di
   prompt tidak menolong karena hasilnya tidak deterministik. Kompresor bed di mixer memotong
   ketidakrataan setengahnya, tetapi tidak bisa mengarang musik yang memang tidak ada.
   Jadi: ukur, dan minta lagi. Trek terata dari beberapa percobaan yang dipakai. */
/**
 * @param {import('./tipe.mjs').Config} c
 * @param {{coba?: number}} [opsi]
 * @returns {Promise<number>} jumlah trek yang baru dibuat
 */
export async function musik(c, {coba = 3} = {}) {
  const scenes = bacaTimeline(c);
  const {C, total} = K.jadwal(scenes);
  let baru = 0;
  for (const m of c.musik || []) {
    const out = path.join(c.aset, `${m.nama}.mp3`);
    m.file = out;
    // `luar`: trek dibuat di luar mesin (Suno) dan ditaruh tangan. Tanpa ini berkasnya
    // tidak punya `.kunci`, dianggap basi, dan DITIMPA hasil ElevenLabs tanpa peringatan.
    if (m.luar) continue;
    const detik = typeof m.detik === 'function' ? m.detik({C, total}) : m.detik;
    // `rencana` menyusun lagunya per bagian dan dipatok ke batas scene; lihat EL.musik.
    // Durasinya diturunkan dari jumlah bagian, bukan dari `detik`.
    const rencana = typeof m.rencana === 'function' ? m.rencana({C, total}) : m.rencana;
    if (segar(out, {prompt: m.prompt, detik, rencana})) continue;
    let terbaik = null;
    for (let i = 1; i <= coba; i++) {
      writeFileSync(out, await EL.musik(m.prompt, detik, rencana));
      // Ekor diabaikan lebih panjang di sini: fade penutup ada di trek sumbernya juga.
      const {lubang, galat} = P.lubang(out, MUSIK.lubang);
      if (galat) throw new Error(`musik ${m.nama}: ${galat}`);
      const dalam = lubang.reduce((a, x) => a + (x.sampai - x.dari), 0);
      process.stderr.write(`  ${m.nama} coba ${i}/${coba} — ${lubang.length ? `${lubang.length} lubang, ${dalam.toFixed(1)}s` : 'rata ✓'}\n`);
      if (!terbaik || dalam < terbaik.dalam) {
        terbaik = {dalam, isi: readFileSync(out)};
      }
      if (!lubang.length) break;
    }
    /* Senyap di KEPALA trek dipangkas, sama seperti VO dan SFX. Trek yang dihasilkan
       generator sering dibuka dengan 0,3-0,6 detik hening; dibiarkan, iklan 30 detik mulai
       dengan bed kosong — terukur sebagai lubang dan terdengar sebagai pembuka yang lemas.
       Aman dipangkas karena trek diminta 10 detik lebih panjang dari yang dipakai. */
    const mentahM = `${out}.take.mp3`;
    writeFileSync(mentahM, terbaik.isi);
    /* Gerbang trim musik -45 dB, BUKAN -58 dB seperti VO dan SFX. Ambang serendah itu ada
       supaya letusan konsonan tak bersuara di awal kata VO tidak ikut terbuang — dan trek
       musik tidak punya masalah itu. Yang dipunyai trek musik justru kebalikannya: banyak
       yang membuka dengan fade dari senyap, dan ramp di bawah -45 dB itu lolos gerbang -58
       dB sambil sama sekali tidak terdengar. Satu trek 55 detik terukur -62 dB pada dua
       detik pertamanya: lolos trim, lalu dilaporkan `check` sebagai bed yang bolong tepat
       di scene pembuka. -45 dB masih 45 dB di bawah puncak — tidak ada isi musik yang
       hilang, hanya ramp yang memang tidak pernah terdengar. */
    ff(['-i', mentahM, '-af',
      `silenceremove=start_periods=1:start_duration=${MUSIK.durasiAwal}:start_threshold=${MUSIK.ambangAwal}:detection=peak`, out]);
    unlinkSync(mentahM);
    tandai(out, {prompt: m.prompt, detik, rencana});
    process.stderr.write(`  ${m.nama} ✓ ${durasi(out).toFixed(2)}s${terbaik.dalam ? ` (sisa ${terbaik.dalam.toFixed(1)}s lubang — terata dari ${coba} percobaan)` : ''}\n`);
    baru++;
  }
  return baru;
}

