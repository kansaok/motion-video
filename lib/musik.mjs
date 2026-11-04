// Musik: generate, tolak trek berlubang, pangkas kepala senyap.
import {readFileSync, writeFileSync, unlinkSync, existsSync} from 'node:fs';
import path from 'node:path';
import {ff, durasi} from './ff.mjs';
import * as EL from './el.mjs';
import * as K from './komposisi.mjs';
import * as P from './periksa.mjs';
import {MUSIK} from './konstanta.mjs';
import {segar, tandai} from './kunci.mjs';
import {bacaTimeline} from './timeline.mjs';

/* Trek yang akan dibuat generator, dengan durasi yang benar-benar diminta. Dipakai `musik`
   dan perkiraan biaya. Sebelum `plan`, timeline belum ada dan durasi asli komposisi dipakai.
   @param {import('./tipe.mjs').Config} c */
/* `scenes`: `--kering` memberi timeline perkiraannya sendiri. Kunci musik bergantung pada
   timeline (detik/rencana sebagai fungsi C), jadi timeline.json lama memberi jawaban basi.
   @param {import('./tipe.mjs').Config} c @param {import('./tipe.mjs').Scene[]} [scenes] */
export function rencanaMusik(c, scenes = bacaTimeline(c)) {
  const {C, total} = K.jadwal(scenes);
  return (c.musik || []).map((m) => {
    const out = path.join(c.aset, `${m.nama}.mp3`);
    // `luar`: trek dibuat di luar mesin (Suno) dan ditaruh tangan. Tanpa ini berkasnya
    // tidak punya `.kunci`, dianggap basi, dan DITIMPA hasil ElevenLabs tanpa peringatan.
    if (m.luar) return {m, out, baru: false, detik: 0};
    const detik = typeof m.detik === 'function' ? m.detik({C, total}) : m.detik;
    // `rencana` menyusun lagunya per bagian dan dipatok ke batas scene; lihat EL.musik.
    // Durasinya diturunkan dari jumlah bagian, bukan dari `detik`.
    const rencana = typeof m.rencana === 'function' ? m.rencana({C, total}) : m.rencana;
    const panjang = rencana?.length ? rencana.reduce((a, b) => a + (b.detik || 0), 0) : detik;
    return {m, out, detik, rencana, panjang, baru: !segar(out, {prompt: m.prompt, detik, rencana})};
  });
}

/* ── Peta bed sesudah `music`, sebelum mix dan render ─────────────────────────
   Lubang di bed dulu baru ketahuan di `check`, sesudah render beberapa menit, dan trek `luar`
   (Suno, ditaruh tangan) tidak pernah diperiksa sama sekali. Di sini yang diukur adalah
   POTONGAN YANG DIPAKAI: mulai dari `lewati` di trek, dipetakan ke detik video lewat `mulai`,
   dan berhenti di akhir `fadeOut` (dua trek bergantian `bgm`/`bgm-d` dengan jeda yang
   disengaja tidak dituduh bolong; lihat IKLAN.md "Musik boleh berhenti"). Lubang disebut
   dengan detik video, scene, dan bagian `rencana`-nya, supaya yang diminta ulang jelas.
   @param {import('./tipe.mjs').Config} c */
export function periksaBed(c) {
  const scenes = bacaTimeline(c);
  const {C, total} = K.jadwal(scenes);
  const sceneDi = (/** @type {number} */ t) => {
    let nama = scenes[0]?.name;
    for (const s of scenes) if (C[s.name] <= t + 1e-6) nama = s.name;
    return nama;
  };
  const nilai = (v) => (typeof v === 'function' ? v({C, total}) : v);
  const {jendela: W, turun} = MUSIK.bed;
  const hasil = [];
  for (const m of c.musik || []) {
    const file = path.join(c.aset, `${m.nama}.mp3`);
    if (!existsSync(file)) continue;
    const mulai = Number(nilai(m.mulai) || 0), lewati = Number(m.lewati || 0);
    const fade = nilai(m.fadeOut);
    const sampai = Math.min(total, fade ? fade[0] + fade[1] : total);
    const lama = Math.max(0, sampai - mulai);
    const {db, galat} = P.levelJendela(file, W, {mulai: lewati, lama});
    // Trek yang lebih pendek dari bagian yang dipakai: sisa detiknya senyap di video.
    const habis = galat ? null : db.length * W < lama - W ? mulai + db.length * W : null;
    const lengkap = habis === null ? db : [...db, ...Array(Math.ceil((lama - db.length * W) / W)).fill(-120)];
    const med = lengkap.length ? P.median(db.length ? db : lengkap) : null;
    const rencana = nilai(m.rencana);
    const bagianDi = (/** @type {number} */ tTrek) => {
      if (!rencana?.length) return null;
      let a = 0;
      for (const [i, b] of rencana.entries()) { a += b.detik || 0; if (tTrek < a) return {ke: i + 1, teks: b.teks || ''}; }
      return null;
    };
    /** @type {Array<{dari: number, sampai: number, min: number, scene: string, bagian: {ke: number, teks: string} | null}>} */
    const bolong = [];
    if (med !== null) {
      let awal = null;
      for (let i = 0; i <= lengkap.length; i++) {
        const turunDi = i < lengkap.length && lengkap[i] < med - turun;
        if (turunDi && awal === null) awal = i;
        if (!turunDi && awal !== null) {
          const dari = mulai + awal * W;
          bolong.push({dari, sampai: mulai + i * W, min: Math.min(...lengkap.slice(awal, i)),
            scene: sceneDi(dari), bagian: bagianDi(lewati + awal * W)});
          awal = null;
        }
      }
    }
    hasil.push({nama: m.nama, luar: Boolean(m.luar), mulai, sampai, median: med, db: lengkap, lubang: bolong, habis, galat});
  }
  return hasil;
}

/** @param {ReturnType<typeof periksaBed>} hasil */
export function laporBed(hasil) {
  const baris = [];
  for (const h of hasil) {
    const label = `  bed ${h.nama.padEnd(8)}`;
    if (h.galat) { baris.push(`${label} ✖ tidak dapat diperiksa — ${h.galat}`); continue; }
    baris.push(`${label} ${P.sparkline(h.db, h.median)}  median ${h.median.toFixed(1)} dB · `
      + `${h.mulai.toFixed(1)}-${h.sampai.toFixed(1)}s video${h.lubang.length ? '' : ' · rata ✓'}`);
    if (h.habis !== null) baris.push(`    ✖ trek habis di detik ${h.habis.toFixed(1)} video — minta trek lebih panjang`);
    for (const x of h.lubang) {
      const bagian = x.bagian ? `, bagian ${x.bagian.ke}${x.bagian.teks ? ` ${x.bagian.teks}` : ''}` : '';
      baris.push(`    ✖ lubang ${x.dari.toFixed(0)}-${x.sampai.toFixed(0)}s (${x.min.toFixed(0)} dB, `
        + `${(x.min - h.median).toFixed(0)} dB dari median; scene ${x.scene}${bagian})`);
    }
    if (h.lubang.length) {
      baris.push(h.luar
        ? '      trek luar: ganti treknya, atau tutup lubang dengan amplop/SFX'
        : `      regenerate: hapus aset/${h.nama}.mp3 lalu \`motion music\`${h.lubang.some((x) => x.bagian) ? ', dan ubah bagian itu di `rencana` (jangan minta "sparse/quiet")' : ''}`);
      baris.push('      jeda yang disengaja: pakai dua trek (`bgm` berhenti lewat `fadeOut`, `bgm-d` mulai sesudahnya) — IKLAN.md');
    }
  }
  return baris.join('\n');
}

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
export async function musik(c, {coba = MUSIK.coba} = {}) {
  let baru = 0;
  for (const {m, out, detik, rencana, baru: perlu} of rencanaMusik(c)) {
    m.file = out;
    if (!perlu) continue;
    let terbaik = null;
    for (let i = 1; i <= coba; i++) {
      writeFileSync(out, await EL.musik(m.prompt, detik, rencana).catch((e) => { throw EL.beriLabel(`musik "${m.nama}"`, e); }));
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

