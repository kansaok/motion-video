/* Verifikasi. Aturannya: cek harus jalan di atas HASIL AKHIR, bukan berkas sumber, dan
   cek yang tidak mungkin gagal tidak ada gunanya. Cek tabrakan yang mengukur vo/*.mp3
   sementara mixer memakai vo/norm/*.mp3 pernah melaporkan "tidak ada bentrok" yang jujur
   tetapi sama sekali tidak relevan. */
import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {ff, volume, loudness} from './ff.mjs';
import {transkrip} from './el.mjs';

const PITA = 'highpass=f=300,lowpass=f=4000';

/* Klaim "VO ketutupan musik/SFX" diukur di pita bicara 300 Hz - 4 kHz lewat stem terpisah.
   Broadband menipu: angkanya didominasi sub-bass yang sama sekali tidak menutupi suara. */
/* Pita bicara saja TIDAK cukup, dan itu terbukti sesudah satu mix lolos di sini lalu
   dilaporkan "ada dug dug dug di musik, VO-nya jadi tidak kedengeran jelas". Diukur per
   stem pada mix itu:

     musik < 120 Hz        -31,6 dB
     musik 300 Hz - 4 kHz  -40,9 dB
     VO    300 Hz - 4 kHz  -35,1 dB

   Kick-nya 9 dB lebih keras daripada pita bicara musiknya sendiri, DAN 3,5 dB lebih keras
   daripada seluruh pita bicara VO. Elemen paling keras di bus musik adalah kick-nya, di
   atas level VO — dan itu terdengar persis seperti yang dilaporkan, sementara rasio pita
   bicara lulus dengan nyaman di +5,8 dB.

   Yang dibandingkan adalah sub MUSIK lawan pita BICARA VO. Membandingkan sub lawan sub
   tidak berarti apa-apa: VO memang hampir tidak punya energi di bawah 120 Hz, jadi
   selisihnya selalu terlihat besar dan tidak pernah menunjukkan apa pun. */
const SUB = 'lowpass=f=120';

export function masking(stemDir) {
  /** @type {Record<'vo' | 'sfx' | 'mus', number>} */
  const b = {vo: 0, sfx: 0, mus: 0};
  for (const s of ['vo', 'sfx', 'mus']) b[s] = volume(path.join(stemDir, `${s}.wav`), {filter: PITA}).rata;
  const musSub = volume(path.join(stemDir, 'mus.wav'), {filter: SUB}).rata;
  return {...b, musSub, subDiAtasVo: musSub - b.vo,
    voDiAtasSfx: b.vo - b.sfx, voDiAtasMus: b.vo - b.mus};
}

/* Membuktikan sebuah bus BENAR-BENAR masuk ke master. Mengukur stem saja menipu: rata-rata
   yang rendah terlihat seperti "SFX memang pelan", bukan seperti "SFX tidak pernah ada".
   Bus SFX pernah mati total sejak detik lima tanpa satu pun peringatan di log ffmpeg. */
export function busHidup(masterAda, masterTanpa, titikDetik) {
  return titikDetik.map((t) => {
    const a = volume(masterAda, {mulai: t, lama: 0.8}).rata;
    const b = volume(masterTanpa, {mulai: t, lama: 0.8}).rata;
    return {t, ada: a, tanpa: b, selisih: a - b};
  });
}

/* Jendela yang harus benar-benar senyap. Diukur pada MP4 final dan dengan MENCARI rentang
   senyap yang sebenarnya, bukan menguji jendela yang tertulis di mixer apa adanya:
   `volume` dengan eval=frame plus lookahead limiter menggeser gerbang ±0,1 detik, jadi
   perbandingan mentah selalu melaporkan gagal padahal heningnya ada. Yang dilaporkan adalah
   letak dan panjang hening yang benar-benar terdengar. */
export function hening(berkas, [a, b], o = {}) {
  const ambang = o.ambang ?? -60, langkah = o.langkah ?? 0.02, toleransi = o.toleransi ?? 0.25;
  const dari = Math.max(0, a - toleransi), sampai = b + toleransi;
  /* Rentangnya didekode SEKALI, lalu puncak tiap jendela `langkah` dihitung di memori (P8-09).
     Dulu satu proses ffmpeg per 20 ms: dua jendela gate 0,6 dtk = ±110 proses, 7,7 dtk di video
     60 dtk. Batas jendela dan ambangnya sama persis. Berkas yang gagal dibaca dulu menghasilkan
     puncak null di semua jendela, yaitu "senyap", dan lolos palsu; kini gagal dengan sebabnya. */
  const SR = 48000;
  let pcm;
  try {
    const buf = execFileSync('ffmpeg', ['-v', 'error', '-ss', String(dari), '-t', String(sampai - dari), '-i', berkas,
      '-ac', '2', '-ar', String(SR), '-f', 'f32le', '-'], {maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe']});
    pcm = new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.length / 4));
  } catch (e) {
    const sebab = String(e.stderr || '').trim().split('\n').at(-1) || e.message.split('\n')[0];
    return {minta: [a, b], dapat: null, lama: 0, lolos: false, galat: `ffmpeg gagal membaca ${path.basename(berkas)}: ${sebab}`};
  }
  const puncakDi = (/** @type {number} */ t) => {
    const i0 = Math.round((t - dari) * SR) * 2, i1 = Math.min(pcm.length, Math.round((t + langkah - dari) * SR) * 2);
    if (i0 >= i1) return null;                    // sesudah akhir berkas: tidak ada audio = senyap, seperti dulu
    let m = 0;
    for (let i = i0; i < i1; i++) { const v = Math.abs(pcm[i]); if (v > m) m = v; }
    return m > 0 ? 20 * Math.log10(m) : null;
  };
  let mulai = null, akhir = null, terbaik = null;
  for (let t = dari; t < sampai; t += langkah) {
    const p = puncakDi(t);
    const sepi = p === null || p <= ambang;
    if (sepi && mulai === null) mulai = t;
    if (!sepi && mulai !== null) { akhir = t; if (!terbaik || akhir - mulai > terbaik[1] - terbaik[0]) terbaik = [mulai, akhir]; mulai = null; }
  }
  if (mulai !== null) { akhir = sampai; if (!terbaik || akhir - mulai > terbaik[1] - terbaik[0]) terbaik = [mulai, akhir]; }
  const minta = b - a;
  return terbaik
    ? {minta: [a, b], dapat: terbaik, lama: terbaik[1] - terbaik[0], lolos: terbaik[1] - terbaik[0] >= minta * 0.7}
    : {minta: [a, b], dapat: null, lama: 0, lolos: false};
}

/* Transkrip balik stem VO. Menangkap seluruh kelas kesalahan sekaligus: baris dobel karena
   cache basi, baris hilang, urutan tertukar, dan pelafalan yang salah — kalau ejaan ulang
   seperti "desbord" kembali jadi "dashboard", bunyinya memang benar. */
export async function transkripStem(stemVo, naskah, bahasa = 'id') {
  const mp3 = stemVo.replace(/\.wav$/, '-16k.mp3');
  ff(['-i', stemVo, '-ac', '1', '-ar', '16000', '-b:a', '64k', mp3]);
  const teks = await transkrip(readFileSync(mp3), bahasa);
  writeFileSync(stemVo.replace(/\.wav$/, '-transkrip.txt'), teks);

  const kata = (s) => s.toLowerCase().replace(/…/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
  const T = kata(teks);
  // 5-gram yang muncul dua kali = satu baris terdengar dua kali
  const lihat = {}, dobel = [];
  for (let i = 0; i + 5 <= T.length; i++) {
    const k = T.slice(i, i + 5).join(' ');
    if (lihat[k] !== undefined) dobel.push(k);
    lihat[k] = i;
  }
  // urutan: tiap baris harus muncul setelah baris sebelumnya
  const mirip = (a, b) => a === b || a.replace(/e/g, '') === b.replace(/e/g, '')
    || (a.length > 3 && b.length > 3 && (a.startsWith(b.slice(0, 4)) || b.startsWith(a.slice(0, 4))));
  let i = 0; const lewat = [];
  for (const w of naskah.flatMap((l) => kata(l))) {
    let j = i; while (j < T.length && !mirip(T[j], w)) j++;
    if (j < T.length && j - i < 8) i = j + 1; else lewat.push(w);
  }
  return {teks, kata: T.length, dobel, tidakKetemu: lewat};
}

/**
 * Level RMS (dBFS) per jendela. `mulai`/`lama` membatasi ke potongan yang benar-benar dipakai.
 * @param {string} wav
 * @param {number} W lebar jendela (detik)
 * @param {{mulai?: number, lama?: number}} [o]
 * @returns {{db: number[], galat?: string}}
 */
export function levelJendela(wav, W, {mulai, lama} = {}) {
  const SR = 8000;
  let buf;
  try {
    buf = execFileSync('ffmpeg', ['-v', 'error', ...(mulai ? ['-ss', String(mulai)] : []),
      ...(lama !== undefined ? ['-t', String(lama)] : []), '-i', wav, '-ac', '1', '-ar', String(SR), '-f', 's16le', '-'],
    {maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe']});
  } catch (e) {
    // Jangan laporkan "tanpa lubang" untuk berkas yang gagal dibaca: itu lolos palsu.
    const sebab = String(e.stderr || '').split('\n').map((l) => l.trim()).filter(Boolean).at(-1) || e.message.split('\n')[0];
    return {db: [], galat: `ffmpeg gagal membaca ${path.basename(wav)}: ${sebab}`};
  }
  const n = Math.round(SR * W), total = Math.floor(buf.length / 2), db = [];
  for (let i = 0; i + n <= total; i += n) {
    let s = 0;
    for (let k = 0; k < n; k++) { const v = buf.readInt16LE((i + k) * 2); s += v * v; }
    db.push(10 * Math.log10(s / n / (32768 ** 2) + 1e-12));
  }
  return {db};
}

export const median = (/** @type {number[]} */ xs) => [...xs].sort((a, b) => a - b)[xs.length >> 1];

/* Peta level teks: satu karakter per jendela, skala median-24 dB (kosong) s/d puncak (penuh).
   Lubang terlihat sekilas sebagai celah di tengah deretan balok, tanpa membuka DAW.
   @param {number[]} db @param {number} med */
export function sparkline(db, med) {
  const BALOK = ' ▁▂▃▄▅▆▇█', bawah = med - 24, atas = Math.max(med + 6, ...db);
  return db.map((v) => BALOK[Math.max(0, Math.min(8, Math.round(((v - bawah) / (atas - bawah)) * 8)))]).join('');
}

/* Lubang di bed musik. "Transisi scene terasa dipaksakan, ada jeda musik" ternyata bukan
   soal gambar: satu jendela hening yang dipasang di config membuat musiknya BENAR-BENAR nol
   selama 0,4 detik tepat di batas scene, dan amplop yang menukik 7 dB di batas berikutnya
   menjatuhkannya sampai -65 dB. Dua-duanya lolos setiap cek yang ada dan hanya ketahuan
   dengan mendengarkan.

   Diukur terhadap MEDIAN trek itu sendiri, bukan ambang mutlak: intro yang memang tipis
   selalu di bawah ambang mutlak dan akan dituduh bolong setiap kali. Ekor diabaikan karena
   fade-out penutup memang disengaja. */
/** @typedef {{dari: number, sampai: number, min: number}} Lubang */
/**
 * @param {string} wav
 * @param {{jendela?: number, turun?: number, minLama?: number, abaikanEkor?: number}} [o]
 * @returns {{median: number | null, lubang: Lubang[], galat?: string}}
 */
export function lubang(wav, o = {}) {
  // Jendela 0,25 detik, bukan 0,1: di intro yang sengaja tipis, jarak antar-ketukan sendiri
  // jatuh belasan dB di bawah median dan setiap satu di antaranya dilaporkan sebagai lubang.
  // 0,25 merata-ratakan ketukan, dan `minLama` 0,35 membuang sisa celah musikal yang wajar
  // sambil tetap menangkap lubang sungguhan (gate 0,4 detik dan duck 2,3 detik).
  const W = o.jendela ?? 0.25;
  const {db, galat} = levelJendela(wav, W);
  if (galat) return {median: null, lubang: [], galat};
  if (!db.length) return {median: null, lubang: []};
  const med = median(db);
  const batasEkor = db.length - Math.round((o.abaikanEkor ?? 1.5) / W);
  const turun = o.turun ?? 8, minLama = o.minLama ?? 0.35;
  const out = [];
  let mulai = null;
  for (let i = 0; i <= db.length; i++) {
    const bolong = i < batasEkor && i < db.length && db[i] < med - turun;
    if (bolong) { if (mulai === null) mulai = i; continue; }
    if (mulai !== null) {
      if ((i - mulai) * W >= minLama) {
        out.push({dari: mulai * W, sampai: i * W, min: Math.min(...db.slice(mulai, i))});
      }
      mulai = null;
    }
  }
  return {median: med, lubang: out};
}

/* ── Sampul ─────────────────────────────────────────────────────────────────────
   Frame 0 BUKAN sekadar frame pertama: itu sampul yang dipakai Instagram Reels, TikTok,
   dan LinkedIn kalau pengunggah tidak memilih sendiri, dan TikTok tidak mengizinkannya
   diganti sesudah unggah. Videonya bisa sempurna dan tetap muncul di feed sebagai kotak
   kosong.

   Diukur pada 41 berkas MP4 yang sudah dirender di repo ini — 35 di antaranya dibuka
   dengan fade dari warna rata:

     sumopod-9x16          rasio 0,01      konektor-audiens-1x1   rasio 0,19
     sisa-pekan-9x16       rasio 0,08      ctwa-konektor-1x1      rasio 0,33
     konektor-funnel-1x1   rasio 0,16      lead-dari-mana-16x9    rasio 0,55
     konektor-hantu-12s    rasio 0,94 ✓    shift-malam            rasio 1,01 ✓

   Yang diukur adalah RASIO terhadap median detik pertamanya sendiri, bukan ambang mutlak.
   Ambang mutlak menuduh trailer gelap yang memang berkontras rendah sepanjang scene
   pembukanya: "Shift Malam" hanya 20,3 simpangan dan sampulnya justru benar. */
export function sampul(mp4, o = {}) {
  const lebar = o.lebar || 96;
  const sd = (t) => {
    let buf;
    try {
      buf = execFileSync('bash', ['-c',
        `ffmpeg -v error -ss ${t} -i ${JSON.stringify(mp4)} -vframes 1 `
        + `-vf scale=${lebar}:-1 -f rawvideo -pix_fmt gray -`], {maxBuffer: 1 << 24});
    } catch { return null; } // detik di luar durasi/frame rusak: kandidat sampul ini dilewati
    if (!buf.length) return null;
    let m = 0; for (const v of buf) m += v; m /= buf.length;
    let a = 0; for (const v of buf) a += (v - m) ** 2;
    return Math.sqrt(a / buf.length);
  };
  const sd0 = sd(0);
  if (sd0 === null) return null;
  const lain = [0.1, 0.2, 0.3, 0.4, 0.5, 0.7, 0.9].map(sd).filter((x) => x !== null).sort((a, b) => a - b);
  if (!lain.length) return {sd0, med: sd0, rasio: 1};
  const med = lain[lain.length >> 1];
  return {sd0, med, rasio: med > 0 ? sd0 / med : 1};
}

// Satu lintasan ebur128 untuk keduanya (dulu dua lintasan atas MP4 yang sama).
export function ringkas(mp4) {
  return loudness(mp4);
}
