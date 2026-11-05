// Pembungkus ffmpeg/ffprobe. Kegagalan ffmpeg WAJIB berisik: pernah tiga putaran
// pengukuran berturut-turut membaca stem lama karena galat mixer ditelan diam-diam.
import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync, statSync} from 'node:fs';

export function ff(args) {
  try {
    return execFileSync('ffmpeg',
      ['-hide_banner', '-loglevel', process.env.FFLOG || 'error', '-y', ...args],
      {stdio: ['ignore', 'pipe', 'pipe']});
  } catch (e) {
    const err = (e.stderr?.toString() || '').split('\n')
      .filter((l) => /Error|Invalid|out of range|No such/.test(l)).slice(0, 3);
    console.error('  ✖ ffmpeg gagal:', err.join(' | ') || e.message.slice(0, 200));
    throw e;
  }
}

export const durasi = (f) => Number(execFileSync('ffprobe',
  ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], {encoding: 'utf8'}).trim());

/** @param {string} f @returns {{lebar: number, tinggi: number}} */
export function ukuranGambar(f) {
  const [lebar, tinggi] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height', '-of', 'csv=p=0', f], {encoding: 'utf8'}).trim().split(',').map(Number);
  return {lebar, tinggi};
}

const analisa = (f, filter) => spawnSync('ffmpeg',
  ['-hide_banner', '-nostats', '-i', f, '-af', filter, '-f', 'null', '-'], {encoding: 'utf8'}).stderr;

/**
 * @param {string} f
 * @param {{mulai?: number, lama?: number, filter?: string}} [opsi]
 */
export function volume(f, {mulai, lama, filter = ''} = {}) {
  const pra = mulai !== undefined ? ['-ss', String(mulai)] : [];
  const dur = lama !== undefined ? ['-t', String(lama)] : [];
  const log = spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...pra, ...dur, '-i', f,
    '-af', `${filter}${filter ? ',' : ''}volumedetect`, '-f', 'null', '-'], {encoding: 'utf8'}).stderr;
  const num = (re) => { const m = log.match(re); return m ? Number(m[1]) : null; };
  return {puncak: num(/max_volume: (-?[\d.]+) dB/), rata: num(/mean_volume: (-?[\d.]+) dB/)};
}

const bacaLufs = (/** @type {string} */ log) => {
  const g = log.match(/I:\s+(-?[\d.]+) LUFS/g);
  return g ? Number(g.at(-1).match(/(-?[\d.]+)/)[1]) : 0;
};
const bacaPuncak = (/** @type {string} */ log) => {
  const m = log.match(/True peak:\s*\n\s*Peak:\s*(-?[\d.]+)/);
  return m ? Number(m[1]) : 0;
};
/* LUFS saja, TANPA `peak=true` (P8-09). True peak melakukan oversampling 4x dan tidak ikut
   menentukan loudness terintegrasi, padahal loop loudness mixer memanggil ini sampai 40 kali
   per mix. Angka I identik (ebur128 yang sama). */
export const lufs = (/** @type {string} */ f) => bacaLufs(analisa(f, 'ebur128'));
export const puncakSejati = (/** @type {string} */ f) => bacaPuncak(analisa(f, 'ebur128=peak=true'));
/* LUFS dan puncak sejati dari SATU lintasan, untuk yang butuh keduanya (`check`, laporan MCP). */
export function loudness(/** @type {string} */ f) {
  const log = analisa(f, 'ebur128=peak=true');
  return {lufs: bacaLufs(log), dbtp: bacaPuncak(log)};
}

/* Cache dikunci ke WAKTU UBAH, bukan ke "berkasnya ada". Kalau sumber diregenerate tapi
   cache tidak, mix diam-diam memakai rekaman lama yang lebih panjang — dan itu terdengar
   sebagai suara dobel yang sangat sulit dilacak. */
export const basi = (sumber, hasil) =>
  !existsSync(hasil) || statSync(hasil).mtimeMs < statSync(sumber).mtimeMs;

/* Gain (dB) yang menyamakan puncak satu sumber ke -6 dBFS. Tanpa ini, angka gain di mixer tidak
   berarti apa-apa. Dulu (`ratakan`) gain itu ditulis ke MP3 baru (`vo/norm/`, `sfx/norm/`,
   `-norm.mp3`): setiap VO, SFX, dan musik di-encode MP3 dua kali sebelum mix, dan berkas antara itu
   ikut memakan kuota. Sekarang mixer menerapkannya di filtergraph (`volume=<g>dB` di kepala rantai
   tiap masukan): angka sama, satu generasi lossy lebih sedikit (P8-09).
   @param {string} sumber @param {number} [target] */
export function gainRata(sumber, target = -6) {
  return target - (volume(sumber).puncak ?? 0);
}
