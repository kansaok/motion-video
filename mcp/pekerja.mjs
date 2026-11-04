/* Pekerja render MCP. Proses ini sengaja terpisah dari server HTTP: ffmpeg dan encode frame
   bersifat sinkron di sejumlah tahap lama, sehingga hanya pekerja yang boleh tertahan olehnya. */
import {rmSync} from 'node:fs';
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
  const r = await Pipa.render(c, {batasFrame: opsi?.frames, kemajuan: (jadi, totalFrame) => kirim({frame: jadi, totalFrame})});
  langkah('periksa');
  const h = await Pipa.periksa(c, {lengkap: false});
  Pr.sentuh(p);

  return {
    detik: r.detik, lebar: r.lebar, tinggi: r.tinggi,
    mp4: path.basename(r.keluaran), sampul: r.sampul ? path.basename(r.sampul) : null,
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
