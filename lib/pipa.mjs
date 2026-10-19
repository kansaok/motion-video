// Rantai kerja: zip -> src -> vo -> rencana -> terap -> sfx -> musik -> mix -> render -> periksa.
// Tiap langkah bisa dijalankan sendiri dan aman diulang; yang sudah ada tidak digenerate lagi.
import {readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync, copyFileSync} from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {ff, durasi} from './ff.mjs';
import * as EL from './el.mjs';
import * as K from './komposisi.mjs';
import * as T from './tata.mjs';
import * as M from './mix.mjs';
import * as R from './render.mjs';
import * as P from './periksa.mjs';
import * as L from './lafal.mjs';
import * as S from './stok.mjs';

export async function muat(dirProyek) {
  const f = ['motion.config.mjs', 'config.mjs'].map((n) => path.join(dirProyek, n)).find(existsSync);
  if (!f) throw new Error(`config tidak ada di ${dirProyek} (butuh motion.config.mjs)`);
  const cfg = (await import(`${f}?t=${Date.now()}`)).default;
  cfg.dir = dirProyek;
  cfg.src = path.join(dirProyek, cfg.src || 'src');
  cfg.aset = path.join(dirProyek, 'aset');
  cfg.stem = path.join(dirProyek, 'stem');
  cfg.htmlUtama = path.join(cfg.src, cfg.komposisi);
  for (const d of [`${cfg.aset}/vo`, `${cfg.aset}/sfx`, cfg.stem]) mkdirSync(d, {recursive: true});
  return cfg;
}

/* Detik akhir suara: ujung jendela 10 ms terakhir yang puncaknya >= -45 dB. Letupan
   terpisah (< 80 ms, sesudah >= 0,4 dtk di bawah -50 dB) dilewati: itu derau ujung take,
   bukan kata. */
export function akhirSuara(f) {
  const pcm = execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'],
    {maxBuffer: 1 << 28});
  const x = new Float32Array(pcm.buffer, pcm.byteOffset, pcm.length / 4);
  const db = [];
  for (let i = 0; i < x.length; i += 160) {
    let p = 0;
    for (let j = i; j < Math.min(i + 160, x.length); j++) p = Math.max(p, Math.abs(x[j]));
    db.push(20 * Math.log10(p || 1e-9));
  }
  let k = db.length - 1;
  for (;;) {
    while (k >= 0 && db.at(k) < -45) k--;
    if (k < 0) return 0;
    let a = k; while (a >= 0 && db.at(a) >= -45) a--;
    let s = a; while (s >= 0 && db.at(s) < -50) s--;
    if (k - a < 8 && a - s >= 40) { k = s; continue; }
    return (k + 1) * 0.01;
  }
}

const simpanTimeline = (c, scenes) => writeFileSync(path.join(c.dir, 'timeline.json'), JSON.stringify(scenes, null, 1));
const bacaTimeline = (c) => {
  const f = path.join(c.dir, 'timeline.json');
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : K.bacaScenes(c.htmlUtama);
};

/* ── unzip ─────────────────────────────────────────────────────────────────── */
export function bongkar(zip, dirProyek) {
  const src = path.join(dirProyek, 'src');
  mkdirSync(src, {recursive: true});
  execFileSync('unzip', ['-oq', zip, '-d', src]);
  const {html, jsx} = K.temukan(src);
  if (!html.length) throw new Error('tidak ada berkas .html yang memuat OM_SCENES di dalam zip');
  return {src, html, jsx};
}

/* ── VO ────────────────────────────────────────────────────────────────────── */
export function ucapkan(teks, lafal = {}) {
  let x = teks;
  // Lafal config jalan duluan supaya bisa menimpa aturan bawaan kalau memang perlu.
  for (const [k, v] of Object.entries(lafal)) {
    if (typeof v === 'function') { x = v(x); continue; }
    const sama = (m) => (m[0] === m[0].toUpperCase() && /[a-z]/i.test(m[0]) ? v[0].toUpperCase() + v.slice(1) : v);
    x = x.replace(new RegExp(`\\b${k}\\b`, 'gi'), sama);
  }
  // Domain diurus di sini, bukan di `lafal` tiap config: tiap video menyebut domainnya
  // sendiri, dan sekali terlewat salahnya terdengar di kalimat penutup.
  return L.domain(L.klikId(x));
}

/* Durasi TTS TIDAK deterministik, dan itu berulang kali merusak rencana. Satu baris yang
   DIPENDEKKAN lima karakter pernah keluar 0,4 detik LEBIH panjang, karena konteks kalimat
   tetangganya ikut berubah. Di slot iklan yang ketat, selisih itu cukup untuk memelarkan
   satu scene dan membuat seluruh video meleset dari slotnya.

   `maks` pada satu baris mengubah batas itu jadi kontrak: generate ulang dengan seed
   berbeda sampai muat. Kalau sampai habis percobaan tidak pernah muat, take TERPENDEK yang
   dipakai dan selisihnya dilaporkan — bukan diam-diam dibiarkan lewat. */
/* Cache generator dikunci ke PERMINTAANNYA, bukan ke "berkasnya ada". Kuncinya ditulis
   berdampingan sebagai `.kunci`; begitu naskah, prompt, atau parameter suara berubah,
   asetnya diregenerate.

   Tanpa ini satu putaran revisi hilang tanpa jejak: naskah diperbaiki, `style` suara
   dinaikkan, `plan` dijalankan ulang — dan yang dipakai tetap rekaman lama, karena
   berkasnya kebetulan sudah ada. Hasilnya identik dengan putaran sebelumnya sampai ke
   durasi scene-nya, dan itu terbaca seperti perbaikannya yang tidak berhasil. Berlaku
   untuk VO, SFX, dan musik sekaligus — ketiganya dulu memakai syarat yang sama. */
function segar(berkas, kunci) {
  try {
    return existsSync(berkas) && readFileSync(`${berkas}.kunci`, 'utf8') === JSON.stringify(kunci);
  } catch { return false; }
}
const tandai = (berkas, kunci) => writeFileSync(`${berkas}.kunci`, JSON.stringify(kunci));

export async function vo(c, {paksa = false, coba = 4} = {}) {
  const s = c.suara || {};
  /* Sebelum 10 Okt 2026 model bawaan adalah eleven_multilingual_v2, dan kuncinya tidak
     mencatat model. Proyek yang sudah punya VO dengan kunci lama tetap memakai v2. Kalau
     tidak, `plan` berikutnya membuat ulang seluruh VO-nya dengan suara lain dan membakar
     kredit. Tulis `suara.model` untuk memindahkan proyek lama ke model baru. */
  const dirVo = path.join(c.aset, 'vo');
  const warisanV2 = !s.model && existsSync(dirVo) && readdirSync(dirVo)
    .filter((f) => f.endsWith('.mp3.kunci'))
    .some((f) => { try { return !('model' in JSON.parse(readFileSync(path.join(dirVo, f), 'utf8'))); } catch { return false; } });
  const model = s.model || (warisanV2 ? 'eleven_multilingual_v2' : EL.MODEL_SUARA);
  const modelKunci = s.model || (warisanV2 ? undefined : EL.MODEL_SUARA);
  for (const l of c.vo) {
    const no = String(l.no).padStart(2, '0');
    l.file = path.join(c.aset, 'vo', `vo-${no}.mp3`);
    /* `suara.luar`: VO dibuat di luar mesin (connector ElevenLabs di Claude, lewat motion-mcp)
       dan sudah ditrim saat diunggah. Tidak ada kunci API di sini, jadi jangan pernah generate —
       baris yang belum diunggah harus gagal dengan menyebut nomornya. */
    if (s.luar) {
      if (!existsSync(l.file)) throw new Error(`VO-${l.no} belum diunggah ("${l.text.slice(0, 40)}")`);
      l.dur = durasi(l.file);
      continue;
    }
    const i = c.vo.indexOf(l);
    const kunci = {
      teks: ucapkan(l.text, c.lafal), maks: l.maks, dengar: l.dengar && String(l.dengar), coba: l.coba,
      voice: l.voice || s.id, model: modelKunci, bahasa: s.bahasa, seed: s.seed,
      // `style`/`stability` per baris: baris CTA butuh intonasi lebih naik daripada sisanya.
      stability: l.stability ?? s.stability, similarity: s.similarity, style: l.style ?? s.style,
      speed: typeof s.speed === 'function' ? s.speed(l) : s.speed,
      sebelum: c.vo[i - 1] && ucapkan(c.vo[i - 1].text, c.lafal),
      sesudah: c.vo[i + 1] && ucapkan(c.vo[i + 1].text, c.lafal),
    };
    if (paksa && existsSync(l.file)) unlinkSync(l.file);
    if (!segar(l.file, kunci)) {
      const mentah = `${l.file}.take.mp3`;
      let terbaik = null;
      const n = l.coba ?? coba;
      for (let putaran = 0; putaran < (l.maks || l.dengar ? n : 1); putaran++) {
        writeFileSync(mentah, await EL.suara(ucapkan(l.text, c.lafal), {
          voice: l.voice || s.id, model, bahasa: s.bahasa,
          // Seed digeser tiap percobaan; seed yang sama mengembalikan take yang sama persis.
          seed: s.seed === undefined ? undefined : s.seed + putaran,
          stability: l.stability ?? s.stability, similarity: s.similarity, style: l.style ?? s.style,
          speed: typeof s.speed === 'function' ? s.speed(l) : s.speed,
          // konteks CUKUP satu kalimat tetangga — satu paragraf penuh membuat durasi melar
          sebelum: c.vo[i - 1] && ucapkan(c.vo[i - 1].text, c.lafal),
          sesudah: c.vo[i + 1] && ucapkan(c.vo[i + 1].text, c.lafal),
        }));
        /* Ambang trim: 10 ms di atas -58 dB, BUKAN 30 ms di atas -50 dB. Letusan konsonan
           tak bersuara di awal kata (t, k, p, s, c, f) cuma 10-20 ms dan pelan, jadi syarat
           30 ms tidak pernah terpenuhi dan seluruh awalannya ikut terbuang sebagai "senyap".
           Diuji pada satu take yang sama, ditranskrip balik:
             tanpa trim          1,280s -> "Toh pakai LPWA"
             0,03 / -50 dB       1,071s -> "Love pakai LPWA"   awalannya hancur
             0,01 / -58 dB       1,123s -> "Toh pakai LPWA"    utuh
           Ini mengenai setiap baris yang diawali konsonan tak bersuara — sebagian besar
           kata Indonesia — dan tidak pernah terlihat kecuali baris itu ditranskrip balik. */
        const potong = 'silenceremove=start_periods=1:start_duration=0.01:start_threshold=-58dB:detection=peak';
        /* EKOR dipotong di -45 dB selama 100 ms, bukan -58 dB. Dua hal menahan trim -58 dB, dan
           senyapnya ikut terbawa ke timeline. Rama mendengarnya sebagai "ada jeda":
           - napas dan derau sesudah kata terakhir (-47 s/d -58 dB): vo-16 membawa 0,85 dtk;
           - letupan 60 ms di -32 s/d -39 dB SESUDAH 0,5 dtk senyap digital, di ujung take.
             Syarat 40 ms berhenti di letupan itu; syarat 100 ms membuangnya (2,16 -> 1,60 dtk).
           Diukur pada suara 1k39YpzqXZn52BgyLyGO. Syarat konsonan di atas hanya untuk AWAL kata. */
        /* Ekor: cari jendela 10 ms TERAKHIR di atas -45 dB (akhirSuara), simpan SISA_EKOR
           peluruhan sesudahnya, lalu fade-out. Dulu dipakai silenceremove terbalik dengan
           syarat 100 ms: bunyi akhir yang lebih pendek dari 100 ms (letupan "t"/"k", suku kata
           terakhir yang pelan) ikut terbuang. Hari 3 (2 Okt 2026): 9 dari 12 baris masih
           berbunyi -14 s/d -35 dB di 120 ms terakhirnya, dan Rama mendengarnya "kepotong".
           Napas (-47 s/d -58 dB) dan letupan terpisah sesudah senyap tetap terbuang. */
        const SISA_EKOR = 0.25, FADE_EKOR = 0.08;
        const awalan = `${l.file}.awal.wav`;
        ff(['-i', mentah, '-af', potong, awalan]);
        const panjang = Math.min(durasi(awalan), akhirSuara(awalan) + SISA_EKOR);
        ff(['-i', awalan, '-af', `atrim=0:${panjang.toFixed(3)},afade=t=in:st=0:d=0.015,`
          + `afade=t=out:st=${Math.max(0, panjang - FADE_EKOR).toFixed(3)}:d=${FADE_EKOR}`, l.file]);
        unlinkSync(awalan);
        const d = durasi(l.file);
        /* `dengar`: take diterima hanya kalau transkrip baliknya cocok. Ejaan yang sama bisa
           benar di satu seed dan salah di seed lain ("Chat Wulan" -> "Jadwulan", "Klode" ->
           "Kalau dia"), jadi yang dikunci adalah hasil dengarnya, bukan ejaannya. */
        const ok = !l.dengar || l.dengar.test(await EL.transkrip(readFileSync(l.file)));
        const muat = !l.maks || d <= l.maks;
        const skor = (ok ? 0 : 2) + (muat ? 0 : 1);
        if (!terbaik || skor < terbaik.skor || (skor === terbaik.skor && d < terbaik.d)) terbaik = {d, skor, ok, isi: readFileSync(l.file)};
        if (ok && muat) break;
        process.stderr.write(`  vo-${no} coba ${putaran + 1}/${n} — ${ok ? '' : 'transkrip tidak cocok '}${muat ? '' : `${d.toFixed(2)}s > maks ${l.maks}s`}\n`);
      }
      unlinkSync(mentah);
      writeFileSync(l.file, terbaik.isi);
      tandai(l.file, kunci);
      const lewat = l.maks && terbaik.d > l.maks;
      if (!terbaik.ok) process.stderr.write(`  vo-${no} ! transkrip MASIH tidak cocok ${l.dengar} sesudah ${n} take\n`);
      process.stderr.write(`  vo-${no} ${lewat ? '!' : '✓'} ${terbaik.d.toFixed(2)}s`
        + `${lewat ? ` — MASIH lewat maks ${l.maks}s, scene akan melar` : ''}\n`);
    }
    l.dur = durasi(l.file);
  }
  return c.vo;
}

/* ── rencana ───────────────────────────────────────────────────────────────── */
export async function rencana(c) {
  await vo(c);
  // Selalu mulai dari durasi ASLI komposisi. Kalau dihitung dari html yang sudah pernah
  // ditulisi, scene akan memanjang lagi dan lagi tiap kali plan dijalankan ulang.
  const asliHtml = `${c.htmlUtama}.asli`;
  const kerja = K.bacaScenes(existsSync(asliHtml) ? asliHtml : c.htmlUtama).map((s) => ({...s}));
  const {C, total, asli} = T.rencana(c.vo, kerja, c.tata || {});
  simpanTimeline(c, kerja);
  return {scenes: kerja, C, total, asli};
}

/* ── terap ke komposisi ────────────────────────────────────────────────────── */
export async function terap(c) {
  const {scenes, C} = await rencana(c);
  const peta = Object.fromEntries(scenes.map((s) => [s.name, s.dur]));
  const berkas = [c.komposisi, ...(c.jugaTulis || [])].map((f) => path.join(c.src, f)).filter(existsSync);
  berkas.forEach(K.cadangkan);
  let n = 0;
  for (const f of berkas) if (K.tulisScenes(f, peta)) n++;

  let kapsi = 0, jangkar = 0;
  if (c.jsx) {
    const jsx = path.join(c.src, c.jsx);
    K.cadangkan(jsx);
    /* `.asli` adalah sumber kebenarannya, bukan salinan cadangan: tiap `apply` menerapkan
       ulang dari sana supaya durasi tidak bertumpuk. Menyunting berkas kerjanya saja lalu
       menjalankan `apply` membuang suntingan itu TANPA jejak — satu rombakan animasi penuh
       pernah hilang begitu, dan render berikutnya terlihat seperti perbaikannya gagal. */
    /* `.terap` = isi yang terakhir ditulis apply sendiri. Tanpa itu, geserKapsi di run pertama
       sudah membuat berkas kerja berbeda dari `.asli`, dan setiap apply kedua (misalnya
       sesudah satu baris VO diganti) berhenti di sini padahal tidak ada suntingan tangan. */
    const jejak = `${jsx}.terap`, kerja = readFileSync(jsx);
    if (existsSync(`${jsx}.asli`) && !kerja.equals(readFileSync(`${jsx}.asli`))
      && !(existsSync(jejak) && kerja.equals(readFileSync(jejak)))) {
      throw new Error(`${path.basename(jsx)} berbeda dari ${path.basename(jsx)}.asli — `
        + 'apply akan membuang suntingannya. Salin ke .asli dulu kalau suntingan itu memang dipakai.');
    }
    K.pulihkan(jsx);                                    // selalu terap dari keadaan asli
    const off = (no, d = 0) => { const l = c.vo.find((x) => x.no === no); return Math.max(0, l.pos - C[l.sc] + d); };
    if (c.kapsi) kapsi = K.geserKapsi(jsx, c.vo.map((l) => l.pos - C[l.sc]));
    if (c.jangkar) jangkar += K.geserJangkar(jsx, Object.fromEntries(
      Object.entries(c.jangkar).map(([v, no]) => [v, off(no, -0.10)])));
    if (c.deret) jangkar += K.geserDeret(jsx, Object.fromEntries(
      Object.entries(c.deret).map(([v, nos]) => [v, nos.map((no) => off(no, -0.10))])));
    copyFileSync(jsx, jejak);
  }
  return {html: n, kapsi, jangkar, scenes};
}

/* ── SFX & musik ───────────────────────────────────────────────────────────── */
/* Hasil generator SFX diperiksa sebelum diterima. Satu prompt yang sah ("one crisp modern
   button click") pernah kembali nyaris senyap; `silenceremove` menghabiskan sisanya dan
   berkas 253 byte tetap ditulis seolah berhasil. Kegagalannya baru muncul di `mix`, sebagai
   "Error opening input files: Invalid argument" — tanpa menyebut berkas mana atau kenapa.
   Sekarang: ukur, ulang, dan kalau tetap kosong gagalkan dengan menyebut namanya. */
const SFX_MIN = 0.08;

export async function sfx(c, {coba = 3} = {}) {
  let baru = 0;
  for (const [nama, detik, prompt] of c.sfx || []) {
    const out = path.join(c.aset, 'sfx', `${nama}.mp3`);
    // ['nama', '@stok/<id>'] = ambil dari sfx-stok/, tanpa generate. Lihat `motion stok`.
    if (typeof detik === 'string' && detik.startsWith('@stok/')) {
      const d = S.salin(detik.slice(6), out); process.stderr.write(`  ${nama} ← stok ${d.id}\n`); continue;
    }
    // ['nama', '@luar'] = berkas diunggah tangan (motion-mcp). Tanpa ini dianggap basi dan digenerate.
    if (detik === '@luar') continue;
    const kunci = {prompt, detik};
    if (segar(out, kunci)) continue;
    const mentah = path.join(c.aset, 'sfx', `.${nama}.mp3`);
    let terbaik = null;
    for (let putaran = 1; putaran <= coba; putaran++) {
      writeFileSync(mentah, await EL.efek(prompt, detik));
      // Ambang -58 dB, sama seperti VO: transien pendek dan pelan tidak boleh ikut terbuang.
      ff(['-i', mentah, '-af',
        'silenceremove=start_periods=1:start_duration=0.01:start_threshold=-58dB:detection=peak', out]);
      let d = 0;
      try { d = durasi(out) || 0; } catch { d = 0; }
      if (!terbaik || d > terbaik.d) terbaik = {d, isi: readFileSync(out)};
      if (d >= SFX_MIN) break;
      process.stderr.write(`  ${nama} coba ${putaran}/${coba} — kosong (${d.toFixed(2)}s), ulang\n`);
    }
    unlinkSync(mentah);
    writeFileSync(out, terbaik.isi);
    tandai(out, kunci);
    if (terbaik.d < SFX_MIN) {
      throw new Error(`SFX "${nama}" kosong sesudah ${coba} percobaan (${terbaik.d.toFixed(2)}s) — ubah prompt-nya`);
    }
    process.stderr.write(`  ${nama} ✓ ${terbaik.d.toFixed(2)}s\n`); baru++;
  }
  return baru;
}

/* Trek musik diperiksa SEBELUM diterima. Generator mengembalikan trek yang tidak rata apa
   pun prompt-nya — satu trek 31 detik keluar dengan dua breakdown 24 dB di detik 8 dan 26,
   dan itu terdengar sebagai musik yang mati di tengah iklan. Meminta "no breakdown" di
   prompt tidak menolong karena hasilnya tidak deterministik. Kompresor bed di mixer memotong
   ketidakrataan setengahnya, tetapi tidak bisa mengarang musik yang memang tidak ada.
   Jadi: ukur, dan minta lagi. Trek terata dari beberapa percobaan yang dipakai. */
export async function musik(c, {coba = 3} = {}) {
  const scenes = bacaTimeline(c);
  const {C, total} = K.jadwal(scenes);
  let baru = 0;
  for (const m of c.musik || []) {
    const out = path.join(c.aset, `${m.nama}.mp3`);
    m.file = out;
    // `luar`: trek dibuat di luar mesin (Suno) dan ditaruh tangan. Tanpa ini berkasnya
    // tidak punya `.kunci`, dianggap basi, dan DITIMPA hasil ElevenLabs tanpa peringatan.
    if (m.luar) continue;
    const detik = typeof m.detik === 'function' ? m.detik({C, total}) : m.detik;
    // `rencana` menyusun lagunya per bagian dan dipatok ke batas scene; lihat EL.musik.
    // Durasinya diturunkan dari jumlah bagian, bukan dari `detik`.
    const rencana = typeof m.rencana === 'function' ? m.rencana({C, total}) : m.rencana;
    if (segar(out, {prompt: m.prompt, detik, rencana})) continue;
    let terbaik = null;
    for (let i = 1; i <= coba; i++) {
      writeFileSync(out, await EL.musik(m.prompt, detik, rencana));
      // Ekor diabaikan lebih panjang di sini: fade penutup ada di trek sumbernya juga.
      const {lubang} = P.lubang(out, {turun: 10, minLama: 0.5, abaikanEkor: 2.5});
      const dalam = lubang.reduce((a, x) => a + (x.sampai - x.dari), 0);
      process.stderr.write(`  ${m.nama} coba ${i}/${coba} — ${lubang.length ? `${lubang.length} lubang, ${dalam.toFixed(1)}s` : 'rata ✓'}\n`);
      if (!terbaik || dalam < terbaik.dalam) {
        terbaik = {dalam, isi: readFileSync(out)};
      }
      if (!lubang.length) break;
    }
    /* Senyap di KEPALA trek dipangkas, sama seperti VO dan SFX. Trek yang dihasilkan
       generator sering dibuka dengan 0,3-0,6 detik hening; dibiarkan, iklan 30 detik mulai
       dengan bed kosong — terukur sebagai lubang dan terdengar sebagai pembuka yang lemas.
       Aman dipangkas karena trek diminta 10 detik lebih panjang dari yang dipakai. */
    const mentahM = `${out}.take.mp3`;
    writeFileSync(mentahM, terbaik.isi);
    /* Gerbang trim musik -45 dB, BUKAN -58 dB seperti VO dan SFX. Ambang serendah itu ada
       supaya letusan konsonan tak bersuara di awal kata VO tidak ikut terbuang — dan trek
       musik tidak punya masalah itu. Yang dipunyai trek musik justru kebalikannya: banyak
       yang membuka dengan fade dari senyap, dan ramp di bawah -45 dB itu lolos gerbang -58
       dB sambil sama sekali tidak terdengar. Satu trek 55 detik terukur -62 dB pada dua
       detik pertamanya: lolos trim, lalu dilaporkan `check` sebagai bed yang bolong tepat
       di scene pembuka. -45 dB masih 45 dB di bawah puncak — tidak ada isi musik yang
       hilang, hanya ramp yang memang tidak pernah terdengar. */
    ff(['-i', mentahM, '-af',
      'silenceremove=start_periods=1:start_duration=0.02:start_threshold=-45dB:detection=peak', out]);
    unlinkSync(mentahM);
    tandai(out, {prompt: m.prompt, detik, rencana});
    process.stderr.write(`  ${m.nama} ✓ ${durasi(out).toFixed(2)}s${terbaik.dalam ? ` (sisa ${terbaik.dalam.toFixed(1)}s lubang — terata dari ${coba} percobaan)` : ''}\n`);
    baru++;
  }
  return baru;
}

/* ── mix ───────────────────────────────────────────────────────────────────── */
export async function mix(c, {matikan} = {}) {
  await vo(c);
  const scenes = bacaTimeline(c);
  const {C, total} = K.jadwal(scenes);
  T.tempatkan(c.vo, C, c.tata || {});
  /* P = awal tiap baris, E = AKHIRNYA. Tanpa E, jendela hening cuma bisa diikat ke awal
     baris berikutnya — dan begitu satu baris memanjang, ekornya masuk ke jendela yang
     seharusnya senyap. Itu lolos sampai MP4 dan baru ketahuan di `check`. Diikat ke E,
     jendelanya menempel pada dua tetangganya sekaligus dan tidak bisa lagi menimpa. */
  const P_ = Object.fromEntries(c.vo.map((l) => [l.no, l.pos]));
  const E_ = Object.fromEntries(c.vo.map((l) => [l.no, l.pos + l.dur]));
  const S = Object.fromEntries(scenes.map((s) => [s.name, s.dur]));

  const cue = (c.cue ? c.cue({C, P: P_, E: E_, S, total}) : [])
    .filter((x) => x.at >= 0 && x.at < total - 0.05)
    .sort((a, b) => a.at - b.at);
  const hilang = [...new Set(cue.map((x) => x.nama))]
    .filter((n) => !existsSync(path.join(c.aset, 'sfx', `${n}.mp3`)));
  if (hilang.length) throw new Error(`SFX belum digenerate: ${hilang.join(', ')}`);

  for (const m of c.musik || []) {
    m.file = path.join(c.aset, `${m.nama}.mp3`);
    if (!existsSync(m.file)) throw new Error(`musik belum digenerate: ${m.nama}`);
    if (typeof m.mulai === 'function') m.mulai = m.mulai({C, total});
    if (typeof m.fadeOut === 'function') m.fadeOut = m.fadeOut({C, total});
  }
  return M.rakit({
    dir: c.aset, C, total, vo: c.vo, cue, musik: c.musik || [],
    gate: c.gate ? c.gate({C, P: P_, E: E_, S, total}) : null,
    matikan, ...(c.mixer || {}),
  });
}

/* ── render ────────────────────────────────────────────────────────────────── */
export async function render(c, opsi = {}) {
  return R.render({
    dirSrc: c.src, berkas: c.komposisi,
    audio: path.join(c.aset, 'master.wav'),
    keluaran: path.join(c.dir, c.keluaran || `${c.nama}.mp4`),
    sampul: c.sampul, dirProyek: c.dir,
    ...opsi,
  });
}

/* ── periksa ───────────────────────────────────────────────────────────────── */
export async function periksa(c, {lengkap = true} = {}) {
  // Posisi baris diturunkan dari durasi tiap berkas VO. Tanpa ini `--cepat` melewati mix,
  // `l.dur` tetap undefined, dan jendela hening dilaporkan "minta NaN-NaN -> TIDAK ADA
  // senyap ✖" pada mix yang sebenarnya benar. Berkasnya sudah ada, jadi ini cuma ffprobe.
  await vo(c);
  const mp4 = path.join(c.dir, c.keluaran || `${c.nama}.mp4`);
  const hasil = {mp4: existsSync(mp4) ? P.ringkas(mp4) : null, masking: P.masking(c.stem),
    lubang: P.lubang(path.join(c.stem, 'mus.wav')),
    // Frame 0 adalah sampul bawaan di Instagram, TikTok, dan LinkedIn. Diukur di MP4 yang
    // dikirim, karena hanya di situ frame yang benar-benar diunggah itu ada.
    sampul: existsSync(mp4) ? P.sampul(mp4) : null};

  // A/B: buktikan bus SFX benar-benar masuk ke master, bukan sekadar "pelan"
  const titik = (c.periksa?.busTitik) || [];
  if (lengkap && titik.length) {
    const master = path.join(c.aset, 'master.wav');
    const salinan = path.join(c.dir, '.master-ada.wav');
    copyFileSync(master, salinan);
    await mix(c, {matikan: 'sfx'});
    const tanpa = path.join(c.dir, '.master-tanpa.wav');
    copyFileSync(master, tanpa);
    hasil.bus = P.busHidup(salinan, tanpa, titik);
    await mix(c);                                   // pulihkan master yang benar
    unlinkSync(salinan); unlinkSync(tanpa);
  }
  if (existsSync(mp4)) {
    const scenes = bacaTimeline(c);
    const {C, total} = K.jadwal(scenes);
    T.tempatkan(c.vo, C, c.tata || {});
    const P_ = Object.fromEntries(c.vo.map((l) => [l.no, l.pos]));
    const E_ = Object.fromEntries(c.vo.map((l) => [l.no, l.pos + l.dur]));
    const S = Object.fromEntries(scenes.map((s) => [s.name, s.dur]));
    const j = c.gate ? c.gate({C, P: P_, E: E_, S, total}) : null;
    if (j?.length) hasil.hening = j.map((w) => P.hening(mp4, w));
  }
  // Tidak ada gunanya menranskrip stem yang memang senyap, dan itu tetap satu panggilan berbayar.
  if (lengkap && c.vo.length) hasil.transkrip = await P.transkripStem(path.join(c.stem, 'vo.wav'), c.vo.map((l) => l.text), c.suara?.bahasa || 'id');
  return hasil;
}

/* ── biaya ─────────────────────────────────────────────────────────────────── */
export async function biaya(sejakMs) {
  const j = await EL.pemakaian(sejakMs, Date.now());
  const per = {}; let total = 0;
  for (const [k, v] of Object.entries(j.usage || {})) { const s = v.reduce((a, b) => a + b, 0); per[k] = s; total += s; }
  const usd = total / 30000 * 5;
  return {per, total, usd, rupiah: Math.round(usd * 16500), kuota: await EL.kuota()};
}
