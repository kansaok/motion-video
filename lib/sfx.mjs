// SFX: dari stok, unggahan tangan, atau generator dengan pemeriksaan hasil kosong.
import {readFileSync, writeFileSync, unlinkSync} from 'node:fs';
import path from 'node:path';
import {ff, durasi} from './ff.mjs';
import * as EL from './el.mjs';
import * as S from './stok.mjs';
import {SFX} from './konstanta.mjs';
import {segar, tandai} from './kunci.mjs';

/* Hasil generator SFX diperiksa sebelum diterima. Satu prompt yang sah ("one crisp modern
   button click") pernah kembali nyaris senyap; `silenceremove` menghabiskan sisanya dan
   berkas 253 byte tetap ditulis seolah berhasil. Kegagalannya baru muncul di `mix`, sebagai
   "Error opening input files: Invalid argument" — tanpa menyebut berkas mana atau kenapa.
   Sekarang: ukur, ulang, dan kalau tetap kosong gagalkan dengan menyebut namanya. */
/* SFX yang akan dibuat generator (bukan stok, bukan unggahan, kuncinya tidak segar). Dipakai
   `sfx` dan perkiraan biaya, supaya keduanya menghitung hal yang sama.
   @param {import('./tipe.mjs').Config} c */
export function rencanaSfx(c) {
  return (c.sfx || []).map(([nama, detik, prompt]) => {
    const out = path.join(c.aset, 'sfx', `${nama}.mp3`);
    // ['nama', '@stok/<id>'] = ambil dari sfx-stok/; ['nama', '@luar'] = diunggah tangan (motion-mcp).
    const sumber = typeof detik === 'string' && detik.startsWith('@stok/') ? 'stok' : detik === '@luar' ? 'luar' : 'generator';
    const kunci = {prompt, detik};
    return {nama, detik, prompt, out, sumber, kunci, baru: sumber === 'generator' && !segar(out, kunci)};
  });
}

/**
 * @param {import('./tipe.mjs').Config} c
 * @param {{coba?: number}} [opsi]
 * @returns {Promise<number>} jumlah SFX yang baru dibuat
 */
export async function sfx(c, {coba = SFX.coba} = {}) {
  let baru = 0;
  for (const {nama, detik: d0, prompt, out, sumber, kunci, baru: perlu} of rencanaSfx(c)) {
    if (sumber === 'stok') {
      const d = S.salin(String(d0).slice(6), out); process.stderr.write(`  ${nama} ← stok ${d.id}\n`); continue;
    }
    // Tanpa '@luar', berkas unggahan tangan tidak punya .kunci, dianggap basi, dan digenerate.
    if (!perlu) continue;
    const detik = Number(d0);
    const mentah = path.join(c.aset, 'sfx', `.${nama}.mp3`);
    let terbaik = null;
    for (let putaran = 1; putaran <= coba; putaran++) {
      writeFileSync(mentah, await EL.efek(prompt, detik).catch((e) => { throw EL.beriLabel(`SFX "${nama}"`, e); }));
      ff(['-i', mentah, '-af',
        `silenceremove=start_periods=1:start_duration=${SFX.durasiAwal}:start_threshold=${SFX.ambangAwal}:detection=peak`, out]);
      let d = 0;
      try { d = durasi(out) || 0; } catch { d = 0; } // hasil tak terbaca dihitung 0 dtk: dicoba ulang, kalah dari percobaan lain
      if (!terbaik || d > terbaik.d) terbaik = {d, isi: readFileSync(out)};
      if (d >= SFX.durasiMin) break;
      process.stderr.write(`  ${nama} coba ${putaran}/${coba} — kosong (${d.toFixed(2)}s), ulang\n`);
    }
    unlinkSync(mentah);
    writeFileSync(out, terbaik.isi);
    tandai(out, kunci);
    if (terbaik.d < SFX.durasiMin) {
      throw new Error(`SFX "${nama}" kosong sesudah ${coba} percobaan (${terbaik.d.toFixed(2)}s) — ubah prompt-nya`);
    }
    process.stderr.write(`  ${nama} ✓ ${terbaik.d.toFixed(2)}s\n`); baru++;
  }
  return baru;
}

