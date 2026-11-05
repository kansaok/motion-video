/* Cache VO lintas proyek (P6-07). Kalimat standar (CTA, penutup domain, sapaan) dan proyek yang
   disalin untuk angle/rasio lain mengucapkan baris yang sama persis dengan suara yang sama;
   tanpa cache bersama, tiap proyek membayar ulang ke ElevenLabs.

   Kuncinya adalah kunci `.kunci` yang sama dengan cache per proyek (`rencanaVo`): teks
   terlafal, suara, model, seed, parameter suara, `maks`/`dengar`/`coba`, DAN kalimat
   sebelum/sesudah. Konteks tetangga ikut membentuk intonasi dan durasi (satu baris yang
   dipendekkan lima karakter pernah keluar 0,4 dtk LEBIH panjang karena tetangganya berubah),
   jadi baris yang sama dengan tetangga berbeda sengaja tidak dianggap sama.

   Berkas: `<dir>/<sha256 kunci>.mp3` + `.kunci` (JSON kunci persis, dibandingkan saat dibaca:
   berkas rusak atau sidik bertabrakan tidak pernah dipakai) + `.json` (asal: proyek, baris).
   `MOTION_CACHE_VO`: jalur lain, atau `off` untuk mematikan. */
import {createHash} from 'node:crypto';
import {copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/** @param {Record<string, string | undefined>} [env] @returns {string | null} */
export function dirCache(env = process.env) {
  const v = env.MOTION_CACHE_VO;
  if (v && ['0', 'off', 'mati', 'false'].includes(v.toLowerCase())) return null;
  return v || path.join(os.homedir(), '.motion', 'cache-vo');
}

/** @param {object} kunci */
export const sidik = (kunci) => createHash('sha256').update(JSON.stringify(kunci)).digest('hex');

/** Berkas cache untuk kunci ini, atau null. @param {object} kunci @param {string | null} [dir] */
export function cari(kunci, dir = dirCache()) {
  if (!dir) return null;
  const h = sidik(kunci), f = path.join(dir, `${h}.mp3`);
  try {
    return existsSync(f) && readFileSync(path.join(dir, `${h}.kunci`), 'utf8') === JSON.stringify(kunci) ? f : null;
  } catch { return null; } // .kunci hilang/tak terbaca = tidak ada di cache
}

/* Simpan satu VO jadi. Gagal menyimpan (disk penuh, izin) tidak boleh menggagalkan `plan`:
   VO-nya sudah ada di proyek, cache hanya penghemat.
   @param {object} kunci @param {string} berkas @param {Record<string, unknown>} [asal] @param {string | null} [dir] */
export function simpan(kunci, berkas, asal = {}, dir = dirCache()) {
  if (!dir || cari(kunci, dir)) return false;
  try {
    mkdirSync(dir, {recursive: true});
    const h = sidik(kunci), f = path.join(dir, `${h}.mp3`), tmp = `${f}.${process.pid}.tmp`;
    // Salin lalu rename: proses lain yang membaca di tengah tidak pernah mendapat mp3 setengah jadi.
    copyFileSync(berkas, tmp);
    renameSync(tmp, f);
    writeFileSync(path.join(dir, `${h}.json`), JSON.stringify({...asal, dibuat: new Date().toISOString()}));
    // `.kunci` ditulis terakhir: tanpa itu entri belum dianggap ada.
    writeFileSync(path.join(dir, `${h}.kunci`), JSON.stringify(kunci));
    return true;
  } catch (e) {
    process.stderr.write(`  ! cache VO tidak tersimpan (${e.code || e.message}); VO proyek tetap utuh\n`);
    return false;
  }
}
