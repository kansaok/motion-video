/* Render .dc.html -> MP4 tanpa aplikasi. Chromium (Playwright) di-seek per frame lewat
   event resmi 'data-om-seek-to-time-frame' dengan `sync: true`, yang memaksa flushSync
   sehingga DOM sudah mencerminkan frame itu ketika dispatchEvent kembali. Frame ditulis
   sebagai JPG lalu digabung ffmpeg bersama master audio.

   Satu tab hanya ±3 frame/detik, jadi frame dibagi ke beberapa tab paralel. Seek-nya
   deterministik, jadi tiap frame berdiri sendiri dan urutan tab tidak penting. */
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {mkdirSync, rmSync, readdirSync, existsSync} from 'node:fs';
import {createServer} from 'node:http';
import path from 'node:path';
import os from 'node:os';
import {readFile, stat} from 'node:fs/promises';
import {ff, puncakSejati} from './ff.mjs';
import {jagaHalaman} from './jaring.mjs';

const SEL = '[data-om-exportable-video-with-duration-secs]';
const MIME = {'.html': 'text/html', '.htm': 'text/html', '.js': 'text/javascript', '.jsx': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.md': 'text/markdown'};

// Server statis internal — satu proses render tidak perlu `python3 -m http.server` terpisah
// yang gampang lupa dimatikan dan bentrok port antar proyek.
export function layani(dirAkar) {
  return new Promise((selesai) => {
    const s = createServer(async (req, res) => {
      try {
        const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
        const f = path.join(dirAkar, rel);
        if (!path.resolve(f).startsWith(path.resolve(dirAkar))) { res.writeHead(403).end(); return; }
        const st = await stat(f);
        if (st.isDirectory()) { res.writeHead(404).end(); return; }
        res.writeHead(200, {'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream'});
        res.end(await readFile(f));
      } catch { res.writeHead(404).end(); }
    });
    s.listen(0, '127.0.0.1', () => selesai({port: s.address().port, tutup: () => s.close()}));
  });
}

function playwright() {
  // Playwright dipinjam dari repo lain kalau tidak terpasang lokal, supaya tidak perlu
  // mengunduh Chromium kedua kalinya. Satu jalur tetap saja tidak cukup: repo yang
  // dipinjami tidak ada di mesin render, dan render gagal di menit terakhir. MOTION_PLAYWRIGHT
  // menunjuk repo mana pun yang sudah punya node_modules/playwright.
  const asal = [import.meta.url,
    process.env.MOTION_PLAYWRIGHT && `file://${process.env.MOTION_PLAYWRIGHT.replace(/\/?$/, '/')}`].filter(Boolean);
  for (const a of asal) { try { return createRequire(a)('playwright'); } catch {} }
  throw new Error('playwright tidak ditemukan — pasang lokal (npm install playwright && '
    + 'npx playwright install chromium) atau set MOTION_PLAYWRIGHT=<repo yang sudah punya>');
}

/* Ukuran viewport bisa ditimpa lewat MOTION_VIEWPORT ("1400x1600"). Bukan soal selera:
   di mesin render yang sedang sesak memori, renderer Chromium MATI pada viewport 1600x1800
   ke atas — "Target crashed", tanpa satu pun galat JavaScript yang menjelaskannya, dan
   tanpa terpengaruh --disable-gpu. Diukur pada komposisi 1080x1920 yang sama:

     1200x1200 ✓   1400x1600 ✓   1600x1800 ✖   1800x2000 ✖   2200x2400 ✖

   Resolusi keluaran TIDAK ikut turun: stage yang lebih kecil membuat `dsf` naik sendiri
   (dia diturunkan dari 1080/lebar-kotak), jadi backing store-nya tetap 1080 piksel. */
const VIEWPORT = (() => {
  const [w, h] = String(process.env.MOTION_VIEWPORT || '2200x2400').split('x').map(Number);
  return {width: w || 2200, height: h || 2400};
})();

async function bukaStage(browser, url, dsf, coba = 3) {
  for (let i = 1; ; i++) {
    try {
      const page = await browser.newPage({viewport: VIEWPORT, deviceScaleFactor: dsf});
      // Komposisi kiriman pelanggan (motion-mcp) tidak boleh menjangkau jaringan dalam.
      if (process.env.MOTION_BLOKIR_PRIVAT === '1') await page.route('**/*', jagaHalaman(url));
      await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 180000});
      await page.waitForSelector(SEL, {timeout: 180000});
      await page.waitForFunction(() => document.fonts.status === 'loaded', null, {timeout: 30000}).catch(() => {});
      await page.waitForTimeout(2000);        // gambar jarak jauh + probe HEAD selesai
      return page;
    } catch (e) {
      if (i >= coba) throw e;
      console.error(`  tab gagal (${e.name}), ulang ${i}/${coba}`);
    }
  }
}

/* Encoder video. libx264 memakai CPU. h264_nvenc memakai GPU NVIDIA dan
   beberapa kali lebih cepat, tetapi nama encoder di `ffmpeg -encoders` tidak
   berarti GPU-nya ada: di mesin kerja ini h264_nvenc, hevc_nvenc, dan av1_nvenc
   terdaftar, sementara /dev/nvidia* tidak ada dan nvidia-smi tidak terpasang.
   NVENC hanya dipakai setelah dua syarat lolos: perangkat NVIDIA terlihat, DAN
   encode percobaan dua frame dengan flag yang sama berhasil. Gagal salah satu
   kembali ke libx264. HEVC dan AV1 tidak dipakai — berkas tetap H.264 yuv420p
   supaya pemutar dan unggahan iklan tidak berubah. MOTION_ENCODER=cpu memaksa
   jalur CPU. */
const ARG_CPU = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '18'];
const ARG_NVENC = ['-c:v', 'h264_nvenc', '-preset', 'p5', '-tune', 'hq',
  '-rc', 'vbr', '-cq', '18', '-b:v', '0', '-profile:v', 'high'];
let pilihanEncoder;

function gpuNvidiaAda() {
  if (existsSync('/dev/nvidia0') || existsSync('/dev/nvidiactl')) return true;
  return spawnSync('nvidia-smi', ['-L'], {stdio: 'ignore'}).status === 0;
}

function nvencKompatibel() {
  const r = spawnSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-f', 'lavfi',
    '-i', 'color=c=black:s=256x256:r=30:d=0.1',
    '-frames:v', '2', ...ARG_NVENC, '-f', 'null', '-',
  ], {stdio: 'ignore'});
  return r.status === 0;
}

export function encoderVideo() {
  if (pilihanEncoder) return pilihanEncoder;
  const paksa = process.env.MOTION_ENCODER;
  if (paksa === 'cpu' || paksa === 'libx264') {
    pilihanEncoder = {nama: 'libx264', arg: ARG_CPU, alasan: 'MOTION_ENCODER=cpu'};
  } else if (!gpuNvidiaAda()) {
    pilihanEncoder = {nama: 'libx264', arg: ARG_CPU, alasan: 'GPU NVIDIA tidak ada'};
  } else if (!nvencKompatibel()) {
    pilihanEncoder = {nama: 'libx264', arg: ARG_CPU, alasan: 'h264_nvenc tidak kompatibel dengan GPU ini'};
  } else {
    pilihanEncoder = {nama: 'h264_nvenc', arg: ARG_NVENC, alasan: 'GPU NVIDIA siap'};
  }
  return pilihanEncoder;
}

/* o = {dirSrc, berkas, audio, keluaran, fps, tab, batasFrame} */
// Gambar sampul untuk orientasi video ini: satu path, atau {'9x16','16x9','4x5','1x1'}.
function pilihSampul(sampul, W, H, dir = '.') {
  const g = sampul?.gambar;
  if (!g) return null;
  const r = W / H, kunci = r < 0.7 ? '9x16' : r < 0.9 ? '4x5' : r > 1.3 ? '16x9' : '1x1';
  const f = typeof g === 'string' ? g : g[kunci];
  if (!f) return null;
  const p = path.isAbsolute(f) ? f : path.join(dir, f);
  if (!existsSync(p)) throw new Error(`gambar sampul tidak ada: ${p}`);
  return p;
}

export async function render(o) {
  const fps = o.fps || 30, tab = o.tab || Number(process.env.WORKERS) || 6;
  const srv = await layani(o.dirSrc);
  const url = `http://127.0.0.1:${srv.port}/${encodeURIComponent(o.berkas)}`;
  const {chromium} = playwright();
  const browser = await chromium.launch({args: ['--mute-audio', '--disable-dev-shm-usage']});
  // Direktori frame unik per PROSES. Dua rantai render yang tidak sengaja jalan bersamaan
  // pernah saling menimpa isinya: log melaporkan "900 frame ✓" padahal MP4-nya 2 detik.
  const dirFrame = path.join(os.tmpdir(), `frames-${path.basename(o.keluaran).replace(/\W+/g, '-')}-${process.pid}`);
  try {
    const probe = await bukaStage(browser, url, 1);
    const kotak = await probe.locator(SEL).boundingBox();
    const detik = Number(await probe.locator(SEL).getAttribute('data-om-exportable-video-with-duration-secs')) || 60;
    await probe.close();

    /* Ukuran keluaran diturunkan dari ASPEK stage, bukan dipilih dari dua preset. Pola
       lama hanya mengenal 9:16 dan 16:9, jadi stage 4:5 dan 1:1 — dua format feed Meta yang
       paling banyak dipakai — dipaksa jadi 1080x1920 dan gambarnya gepeng.
       Sisi pendek 1080, sisi panjang mengikuti aspek dan dibatasi 1920 (batas Meta).
       Dibulatkan ke bilangan genap: h264 yuv420p menolak dimensi ganjil. */
    const genap = (n) => Math.round(n / 2) * 2;
    const aspek = kotak.width / kotak.height;
    const W = aspek >= 1 ? Math.min(1920, genap(1080 * aspek)) : 1080;
    const H = aspek >= 1 ? 1080 : Math.min(1920, genap(1080 / aspek));
    const dsf = Math.min(4, Math.max(W / kotak.width, H / kotak.height));
    const total = o.batasFrame || Math.round(detik * fps);
    console.log(`  stage ${kotak.width.toFixed(0)}x${kotak.height.toFixed(0)} css → ${W}x${H} · ${detik}s · ${total} frame · ${tab} tab`);

    rmSync(dirFrame, {recursive: true, force: true});
    mkdirSync(dirFrame, {recursive: true});
    const t0 = Date.now(); let jadi = 0;
    const bagian = Math.ceil(total / tab);
    await Promise.all(Array.from({length: tab}, async (_, w) => {
      const dari = w * bagian, sampai = Math.min(total, dari + bagian);
      if (dari >= sampai) return;
      const page = await bukaStage(browser, url, dsf);
      const b = await page.locator(SEL).boundingBox();
      const clip = {x: Math.round(b.x), y: Math.round(b.y), width: Math.round(b.width), height: Math.round(b.height)};
      for (let f = dari; f < sampai; f++) {
        await page.evaluate(([sel, time]) => document.querySelector(sel).dispatchEvent(
          new CustomEvent('data-om-seek-to-time-frame', {detail: {time, sync: true}})), [SEL, f / fps]);
        /* `<video>` di dalam komposisi di-seek lewat `currentTime`, dan decode-nya asinkron.
           Tanpa menunggu `seeked`, screenshot menangkap frame sebelumnya atau frame kosong.
           Komposisi tanpa video tidak membayar apa pun selain satu evaluate. */
        await page.evaluate(() => {
          const vs = [...document.querySelectorAll('video')].filter((v) => v.readyState > 0 && v.offsetParent);
          if (!vs.length) return;
          return Promise.all(vs.map((v) => new Promise((r) => {
            const siap = () => (v.requestVideoFrameCallback ? v.requestVideoFrameCallback(() => r()) : r());
            if (v.seeking) v.addEventListener('seeked', siap, {once: true}); else r();
            setTimeout(r, 1500);
          })));
        });
        await page.screenshot({clip, type: 'jpeg', quality: 95, animations: 'disabled',
          path: path.join(dirFrame, `${String(f).padStart(6, '0')}.jpg`)});
        if (++jadi % 240 === 0) {
          const kec = jadi / ((Date.now() - t0) / 1000);
          process.stderr.write(`  ${jadi}/${total} frame · ${kec.toFixed(1)} fps · sisa ~${Math.round((total - jadi) / kec)}s\n`);
        }
      }
      await page.close();
    }));

    const ada = readdirSync(dirFrame).filter((f) => f.endsWith('.jpg')).length;
    if (ada !== total) throw new Error(`frame tidak lengkap: ${ada}/${total} — ada render lain yang menimpa?`);
    if (!existsSync(o.audio)) throw new Error(`audio tidak ada: ${o.audio}`);

    /* Puncak dikalibrasi DI SINI, oleh ffmpeg yang benar-benar membuat berkasnya.
       Mixer memvalidasi puncaknya terhadap encode AAC percobaannya sendiri — dan encode itu
       dibuat oleh ffmpeg di mesin tempat `mix` berjalan, sementara berkas yang dikirim
       dibuat oleh ffmpeg di mesin render. Terukur pada satu master.wav yang sama persis:

         ffmpeg 6.1.1  ->  -1,3 dBTP
         ffmpeg 8.1.1  ->  +0,7 dBTP

       Dua dB selisih, dan mixer lolos sementara berkas yang dikirim melanggar spesifikasi.
       Selisihnya tidak tetap: dia bergantung pada materinya, dan encoder AAC melonjak paling
       jauh pada materi padat seperti hentakan yang dilapis. Jadi tidak bisa dikompensasi
       dengan margin tetap — harus diukur.

       Satu encode percobaan (audio saja, hitungan detik) memberi angkanya, lalu selisihnya
       dipakai sebagai gain pada mux yang sebenarnya. Frame tidak dirender ulang. */
    const cek = path.join(os.tmpdir(), `pk-${process.pid}.m4a`);
    ff(['-i', o.audio, '-c:a', 'aac', '-b:a', '192k', cek]);
    const pkAac = puncakSejati(cek), pkWav = puncakSejati(o.audio);
    rmSync(cek, {force: true});
    /* Dikoreksi dengan LIMITER, bukan dengan gain. Gain rata menurunkan puncaknya DAN
       loudness-nya sekaligus: koreksi -0,5 dB memberi puncak yang benar dan LUFS meleset
       jadi -14,8. Limiter hanya menyentuh momen paling keras, jadi loudness-nya tinggal. */
    const lonjak = pkAac - pkWav;                 // seberapa jauh encoder AAC melonjak
    const targetWav = -1.2 - lonjak;              // puncak WAV supaya AAC-nya mendarat di -1,2
    const af = pkAac > -1.2
      ? ['-af', `alimiter=limit=${Math.pow(10, targetWav / 20).toFixed(4)}:level=disabled`] : [];
    if (af.length) {
      console.log(`  puncak AAC di mesin ini ${pkAac} dBTP (lonjak ${lonjak.toFixed(1)} dB) `
        + `→ limiter ${targetWav.toFixed(2)} dBFS`);
    }

    /* Sampul gambar (Rama, 2 Okt 2026): gambar sampul gpt-image-2.5 ditempel di atas video
       selama `ms` milidetik mulai detik `mulai` (bawaan 0 dan 100 ms). Di detik 0 dia
       menjadi frame 0, yaitu sampul bawaan Reels, TikTok, LinkedIn, dan Threads. Gambar
       dipilih per orientasi lewat `sampul.gambar` {'9x16','16x9','4x5','1x1'} atau satu path.
       Ditempel di mux yang sama, jadi video tidak di-encode dua kali. */
    const gambar = pilihSampul(o.sampul, W, H, o.dirProyek);
    const mulai = Number(o.sampul?.mulai ?? 0), ms = Number(o.sampul?.ms ?? 100) / 1000;
    const vf = `scale=${W}:${H}:flags=lanczos,format=yuv420p`;
    const video = gambar
      ? ['-loop', '1', '-i', gambar, '-filter_complex',
        `[0:v]${vf}[v0];[2:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},format=yuv420p[s];`
        + `[v0][s]overlay=0:0:enable='between(t,${mulai.toFixed(3)},${(mulai + ms).toFixed(3)})':shortest=1[v]`,
        '-map', '[v]', '-map', '1:a']
      : ['-vf', vf];
    const enc = encoderVideo();
    console.log(`  encoder ${enc.nama} — ${enc.alasan}`);
    ff(['-framerate', String(fps), '-i', path.join(dirFrame, '%06d.jpg'), '-i', o.audio,
      ...video, ...af,
      ...enc.arg, '-r', String(fps),
      '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', o.keluaran]);
    /* Sampul kustom ditulis di samping MP4. Instagram, TikTok, dan LinkedIn memakai frame 0
       kalau pengunggah tidak memilih sendiri — dan Meta Ads Manager serta TikTok sama-sama
       menerima gambar sampul terpisah, yang menurut riset iklan mengalahkan frame otomatis.
       Detiknya dari config; bawaannya 0, jadi yang tertulis adalah frame yang benar-benar
       dilihat orang di feed. */
    const jpg = o.keluaran.replace(/\.mp4$/i, '-sampul.jpg');
    const tS = gambar ? mulai : Math.max(0, Math.min(detik - 0.05, Number(o.sampul?.detik ?? 0)));
    if (gambar) ff(['-i', gambar, '-vf', `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}`, '-q:v', '2', jpg]);
    else ff(['-ss', tS.toFixed(3), '-i', o.keluaran, '-frames:v', '1', '-q:v', '2', jpg]);
    return {keluaran: o.keluaran, sampul: jpg, sampulDetik: tS, lebar: W, tinggi: H, frame: total, detik};
  } finally {
    await browser.close();
    srv.tutup();
    rmSync(dirFrame, {recursive: true, force: true});
  }
}

// Ambil beberapa frame dari komposisi hidup untuk memeriksa tata letak, tanpa render penuh.
export async function cuplik(dirSrc, berkas, detikArr, keDir, awalan = '') {
  const srv = await layani(dirSrc);
  const {chromium} = playwright();
  const browser = await chromium.launch({args: ['--mute-audio', '--disable-dev-shm-usage']});
  const hasil = [];
  try {
    const page = await bukaStage(browser, `http://127.0.0.1:${srv.port}/${encodeURIComponent(berkas)}`, 0.4);
    const b = await page.locator(SEL).boundingBox();
    const clip = {x: Math.round(b.x), y: Math.round(b.y), width: Math.round(b.width), height: Math.round(b.height)};
    mkdirSync(keDir, {recursive: true});
    for (const t of detikArr) {
      await page.evaluate(([sel, time]) => document.querySelector(sel).dispatchEvent(
        new CustomEvent('data-om-seek-to-time-frame', {detail: {time: Number(time), sync: true}})), [SEL, t]);
      const f = path.join(keDir, `${awalan}t${String(t).replace('.', '_')}.jpg`);
      await page.screenshot({clip, type: 'jpeg', quality: 86, animations: 'disabled', path: f});
      hasil.push(f);
    }
  } finally { await browser.close(); srv.tutup(); }
  return hasil;
}
