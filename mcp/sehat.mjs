/* Kesiapan server untuk menerima render. `/hidup` hanya membuktikan proses menjawab;
   `/siap` (dan `/sehat`, yang dipakai HEALTHCHECK Docker) juga memastikan alat render ada dan
   disk DATA masih cukup. Tanpa cek disk, render baru diterima lalu gagal di tengah encode
   setelah menghabiskan beberapa menit CPU — dan sisa frame-nya memperparah disk yang penuh. */
import {statfsSync, existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';

const angka = (x, bawaan) => (Number.isFinite(Number(x)) && Number(x) > 0 ? Number(x) : bawaan);
// Satu render 180 dtk menulis ±1-2 GB frame sementara; ambang bawaan memberi ruang dua render.
export const MIN_DISK_MB = angka(process.env.MIN_DISK_MB, 4096);

/** @param {string} dir */
export function diskBebasMb(dir) {
  const s = statfsSync(dir);
  return Math.floor((s.bavail * s.bsize) / 1048576);
}

function ffmpegAda() {
  const r = spawnSync('ffmpeg', ['-version'], {stdio: 'ignore', timeout: 3000});
  return r.status === 0;
}

function chromiumAda() {
  try {
    const {chromium} = createRequire(import.meta.url)('playwright');
    return existsSync(chromium.executablePath());
  } catch { return false; } // playwright tidak terpasang = Chromium tidak tersedia
}

/* ffmpeg/Chromium tidak berubah selama proses hidup kecuali image rusak; cek ulang tiap menit
   cukup dan menghindari spawn ffmpeg di setiap healthcheck 30 detik. Disk selalu diukur segar. */
const TTL = 60_000;
let cache = null;

/**
 * @param {{dir: string, minDiskMb?: number, sekarang?: () => number,
 *   cekFfmpeg?: () => boolean, cekChromium?: () => boolean, bebas?: (dir: string) => number}} o
 */
export function kesiapan({dir, minDiskMb = MIN_DISK_MB, sekarang = Date.now,
  cekFfmpeg = ffmpegAda, cekChromium = chromiumAda, bebas = diskBebasMb}) {
  if (!cache || sekarang() - cache.t > TTL || cekFfmpeg !== cache.f || cekChromium !== cache.c) {
    cache = {t: sekarang(), f: cekFfmpeg, c: cekChromium, ffmpeg: cekFfmpeg(), chromium: cekChromium()};
  }
  let diskMb = null;
  try { diskMb = bebas(dir); } catch { diskMb = null; } // DATA belum ada/tak terbaca: dianggap tidak siap
  const alasan = [];
  if (!cache.ffmpeg) alasan.push('ffmpeg tidak dapat dijalankan');
  if (!cache.chromium) alasan.push('Chromium Playwright tidak ditemukan');
  if (diskMb === null) alasan.push(`ruang disk ${dir} tidak dapat dibaca`);
  else if (diskMb < minDiskMb) alasan.push(`disk tersisa ${diskMb} MB, minimal ${minDiskMb} MB`);
  return {siap: alasan.length === 0, alasan, ffmpeg: cache.ffmpeg, chromium: cache.chromium, diskBebasMb: diskMb};
}
