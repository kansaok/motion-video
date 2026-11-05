/* Pekerja render MCP. Proses ini sengaja terpisah dari server HTTP: ffmpeg dan encode frame
   bersifat sinkron di sejumlah tahap lama, sehingga hanya pekerja yang boleh tertahan olehnya. */
import {readdirSync, rmSync} from 'node:fs';
import path from 'node:path';
import * as Pipa from '../lib/pipa.mjs';
import * as K from '../lib/komposisi.mjs';
import * as T from '../lib/tata.mjs';
import * as Pr from './proyek.mjs';
import {cuplik} from '../lib/render.mjs';

const kirim = (pesan) => process.send?.(pesan);

async function kerjakan({uid, proyek, opsi}) {
  const langkah = (nama) => kirim({langkah: nama});
  const p = Pr.buka(uid, proyek);
  const j = Pr.bacaConfig(p);
  Pr.periksaConfig(p, j);
  const c = Pr.keConfig(p, j);

  langkah('sfx');
  await Pipa.sfx(c);
  langkah('rencana');
  const a = await Pipa.terap(c);
  const laporan = T.laporan(a.scenes, Object.fromEntries(K.bacaScenes(`${c.htmlUtama}.asli`).map((s) => [s.name, s.dur])), c.vo, a.scenes.reduce((x, s) => x + s.dur, 0));

  // timing.js (VO_TIMING + OM_CUES) sudah ditulis `terap` dari timeline yang sama dengan mixer.
  const {vo, total} = a.timing;
  if (total > Pr.BATAS.detik) throw new Error(`video jadi ${total.toFixed(1)} dtk sesudah VO, batas ${Pr.BATAS.detik} dtk`);

  langkah('mix');
  const m = await Pipa.mix(c);
  langkah('render');
  /* Potongan (P6-02): rentang dihitung dari timeline yang baru saja ditulis `terap`. Berkasnya
     terpisah dari MP4 penuh, dan potongan lama dibuang dulu supaya tidak menumpuk di kuota. */
  const parsial = opsi?.scene !== undefined || opsi?.dari !== undefined || opsi?.sampai !== undefined;
  if (opsi?.semuaRasio && !parsial) return semuaRasio(c, p, opsi, {laporan, vo, m});
  /* Draf (P8-07): 540p 15 fps ke `-draf.mp4` (nama dipasang Pipa.render), boleh digabung dengan
     potongan. Seperti potongan: tanpa sampul, subtitle, dan periksa, dan MP4 penuh tidak tertimpa. */
  const draf = Boolean(opsi?.draf);
  if (parsial || draf) {
    const rentang = !parsial ? {} : opsi.scene !== undefined ? Pipa.rentangScene(c, opsi.scene) : {dari: opsi.dari, sampai: opsi.sampai};
    const dasar = path.basename(c.keluaran, '.mp4');
    // Potongan/draf lama dibuang dulu supaya tidak menumpuk di kuota.
    const lama = (/** @type {string} */ f) => (parsial ? f.startsWith(`${dasar}-potong-`) && f.endsWith('.mp4') : f === `${dasar}-draf.mp4`);
    for (const f of readdirSync(c.dir)) if (lama(f)) rmSync(path.join(c.dir, f), {force: true});
    if (parsial) c.keluaran = Pipa.namaPotongan(c.keluaran, rentang);
    const r = await Pipa.render(c, {batasFrame: opsi?.frames, dari: rentang.dari, sampai: rentang.sampai, draf,
      kemajuan: (jadi, totalFrame) => kirim({frame: jadi, totalFrame})});
    Pr.sentuh(p);
    return {
      ...(parsial ? {potongan: {dari: +r.dari.toFixed(3), sampai: +r.sampai.toFixed(3), ...(rentang.nama ? {scene: rentang.nama} : {})}} : {}),
      ...(draf ? {draf: true} : {}),
      detik: +r.detik.toFixed(3), lebar: r.lebar, tinggi: r.tinggi, mp4: path.basename(r.keluaran), sampul: null,
      laporan, vo, audio: {lufs: m.lufs, dbtp: m.dbtp},
    };
  }
  const r = await Pipa.render(c, {batasFrame: opsi?.frames, kemajuan: (jadi, totalFrame) => kirim({frame: jadi, totalFrame})});
  // Subtitle + naskah akhir (P6-04): pelanggan mendapat MP4, sampul, dan SRT dari satu render.
  const sub = c.vo.length ? Pipa.tulisSubtitel(c) : null;
  langkah('periksa');
  const h = await Pipa.periksa(c, {lengkap: false});
  Pr.sentuh(p);

  return {
    detik: r.detik, lebar: r.lebar, tinggi: r.tinggi,
    mp4: path.basename(r.keluaran), sampul: r.sampul ? path.basename(r.sampul) : null,
    srt: sub && path.basename(sub.srt), vtt: sub && path.basename(sub.vtt), naskah: sub && path.basename(sub.naskah),
    laporan, vo,
    audio: {lufs: m.lufs, dbtp: m.dbtp, mp4_lufs: h.mp4?.lufs, mp4_dbtp: h.mp4?.dbtp},
    sampul_kontras: h.sampul ? +(h.sampul.rasio * 100).toFixed(0) : null,
    masking: c.vo.length ? h.masking : null,
  };
}

/* Semua rasio (P8-11): komposisi utama + `jugaTulis` dari satu master, lewat Pipa.renderVarian yang
   sama dengan `motion render --semua-varian` (OM_SCENES tiap varian dicek terhadap timeline sebelum
   Chromium dibuka; satu varian gagal tidak menghentikan yang lain). Nama keluaran dibuat server dari
   id proyek, bukan dari kiriman pelanggan. `langkah('render')` dikirim sebelum tiap rasio: watchdog
   induk mereset jam "macet" di sana, jadi jeda encode + buka Chromium antar-rasio tidak dibaca macet.
   @param {any} c @param {any} p @param {any} opsi @param {{laporan: any, vo: any, m: any}} o */
async function semuaRasio(c, p, opsi, {laporan, vo, m}) {
  const draf = Boolean(opsi.draf);
  const varian = (c.jugaTulis || []).map((/** @type {string} */ k) => ({komposisi: k, keluaran: `${p.meta.id}-${Pipa.namaPendek(k)}.mp4`}));
  // Langkah 'render' rasio pertama sudah dikirim kerjakan(); renderVarian memanggil `log` sebelum TIAP
  // rasio, jadi yang pertama dilewati supaya hitungan rasio di status_render tidak lebih satu.
  let ke = 0;
  const h = await Pipa.renderVarian({...c, varian}, {batasFrame: opsi.frames, draf,
    log: () => { if (ke++) kirim({langkah: 'render'}); }, kemajuan: (/** @type {number} */ jadi, /** @type {number} */ totalFrame) => kirim({frame: jadi, totalFrame})});
  const [utama] = h;
  if (utama.galat) throw new Error(`komposisi utama ${utama.komposisi}: ${utama.galat}`);
  const sub = !draf && c.vo.length ? Pipa.tulisSubtitel(c) : null;
  Pr.sentuh(p);
  const ringkas = (/** @type {any} */ x) => ({komposisi: x.komposisi, ...(x.galat ? {galat: x.galat} : {
    rasio: x.rasio, lebar: x.lebar, tinggi: x.tinggi, detik: +x.detik.toFixed(3), mp4: path.basename(x.keluaran),
    sampul: x.sampul ? path.basename(x.sampul) : null, mp4_lufs: x.mp4?.lufs, mp4_dbtp: x.mp4?.dbtp,
    sampul_kontras: x.kontras === null ? null : +(x.kontras * 100).toFixed(0), masalah: x.masalah})});
  const u = /** @type {any} */ (ringkas(utama));
  return {
    ...(draf ? {draf: true} : {}),
    detik: u.detik, lebar: u.lebar, tinggi: u.tinggi, mp4: u.mp4, sampul: u.sampul,
    srt: sub && path.basename(sub.srt), vtt: sub && path.basename(sub.vtt), naskah: sub && path.basename(sub.naskah),
    laporan, vo,
    audio: {lufs: m.lufs, dbtp: m.dbtp, mp4_lufs: u.mp4_lufs, mp4_dbtp: u.mp4_dbtp},
    sampul_kontras: u.sampul_kontras,
    varian: h.map(ringkas),
  };
}

async function kerjakanCuplik({uid, proyek, komposisi, detik}) {
  const p = Pr.buka(uid, proyek);
  const html = Pr.jalurAman(p.src, komposisi);
  const ke = path.join(p.dir, 'cuplikan');
  // Hasil lama dapat memakan kuota; direktori ini selalu dibangun ulang untuk satu permintaan.
  rmSync(ke, {recursive: true, force: true});
  const hasil = await cuplik(p.src, path.relative(p.src, html), detik, ke);
  return {cuplikan: hasil};
}

process.once('message', async (/** @type {any} */ pesan) => {
  try {
    kirim({hasil: pesan?.mode === 'cuplik' ? await kerjakanCuplik(pesan) : await kerjakan(pesan)});
  } catch (e) {
    kirim({galat: String(e?.message || e).slice(0, 1500)});
  } finally {
    process.disconnect?.();
  }
});
