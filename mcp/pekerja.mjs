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
  if (parsial) {
    const rentang = opsi.scene !== undefined ? Pipa.rentangScene(c, opsi.scene) : {dari: opsi.dari, sampai: opsi.sampai};
    const dasar = path.basename(c.keluaran, '.mp4');
    for (const f of readdirSync(c.dir)) if (f.startsWith(`${dasar}-potong-`) && f.endsWith('.mp4')) rmSync(path.join(c.dir, f), {force: true});
    c.keluaran = Pipa.namaPotongan(c.keluaran, rentang);
    const r = await Pipa.render(c, {batasFrame: opsi?.frames, dari: rentang.dari, sampai: rentang.sampai,
      kemajuan: (jadi, totalFrame) => kirim({frame: jadi, totalFrame})});
    Pr.sentuh(p);
    return {
      potongan: {dari: +r.dari.toFixed(3), sampai: +r.sampai.toFixed(3), ...(rentang.nama ? {scene: rentang.nama} : {})},
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
