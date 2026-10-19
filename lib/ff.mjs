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

const analisa = (f, filter) => spawnSync('ffmpeg',
  ['-hide_banner', '-nostats', '-i', f, '-af', filter, '-f', 'null', '-'], {encoding: 'utf8'}).stderr;

export function volume(f, {mulai, lama, filter = ''} = {}) {
  const pra = mulai !== undefined ? ['-ss', String(mulai)] : [];
  const dur = lama !== undefined ? ['-t', String(lama)] : [];
  const log = spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...pra, ...dur, '-i', f,
    '-af', `${filter}${filter ? ',' : ''}volumedetect`, '-f', 'null', '-'], {encoding: 'utf8'}).stderr;
  const num = (re) => { const m = log.match(re); return m ? Number(m[1]) : null; };
  return {puncak: num(/max_volume: (-?[\d.]+) dB/), rata: num(/mean_volume: (-?[\d.]+) dB/)};
}

export const lufs = (f) => {
  const g = analisa(f, 'ebur128=peak=true').match(/I:\s+(-?[\d.]+) LUFS/g);
  return g ? Number(g.at(-1).match(/(-?[\d.]+)/)[1]) : 0;
};
export const puncakSejati = (f) => {
  const m = analisa(f, 'ebur128=peak=true').match(/True peak:\s*\n\s*Peak:\s*(-?[\d.]+)/);
  return m ? Number(m[1]) : 0;
};

/* Cache dikunci ke WAKTU UBAH, bukan ke "berkasnya ada". Kalau sumber diregenerate tapi
   cache tidak, mix diam-diam memakai rekaman lama yang lebih panjang — dan itu terdengar
   sebagai suara dobel yang sangat sulit dilacak. */
export const basi = (sumber, hasil) =>
  !existsSync(hasil) || statSync(hasil).mtimeMs < statSync(sumber).mtimeMs;

// Samakan puncak semua sumber ke -6 dBFS. Tanpa ini, angka gain di mixer tidak berarti apa-apa.
export function ratakan(sumber, hasil, target = -6) {
  if (basi(sumber, hasil)) {
    const p = volume(sumber).puncak ?? 0;
    ff(['-i', sumber, '-af', `volume=${(target - p).toFixed(2)}dB`, hasil]);
  }
  return hasil;
}
