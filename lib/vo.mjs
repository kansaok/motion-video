// VO: lafal, generate TTS dengan kontrak durasi/transkrip, dan satu aturan pemangkasan.
import {readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync, copyFileSync, statSync, rmSync} from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {ff, durasi} from './ff.mjs';
import * as EL from './el.mjs';
import * as L from './lafal.mjs';
import {VO} from './konstanta.mjs';
import {segar, tandai} from './kunci.mjs';
import * as CV from './cachevo.mjs';
import {kolam} from './kolam.mjs';
import {petaKata, tulisKata, bacaKata, berkasKata} from './kata.mjs';

/* Detik akhir suara: ujung jendela 10 ms terakhir yang puncaknya >= VO.ambangEkorDb. Letupan
   terpisah (< 80 ms, sesudah >= 0,4 dtk di bawah VO.ambangSenyapDb) dilewati: itu derau ujung
   take, bukan kata. Angka dan sebabnya ada di konstanta.mjs. */
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
    while (k >= 0 && db.at(k) < VO.ambangEkorDb) k--;
    if (k < 0) return 0;
    let a = k; while (a >= 0 && db.at(a) >= VO.ambangEkorDb) a--;
    let s = a; while (s >= 0 && db.at(s) < VO.ambangSenyapDb) s--;
    if (k - a < VO.letupanMaksJendela && a - s >= VO.senyapMinJendela) { k = s; continue; }
    return (k + 1) * 0.01;
  }
}

/* Satu-satunya aturan pemangkasan VO, dipakai TTS CLI dan unggahan connector MCP. Ambang
   awal yang longgar menjaga letupan konsonan tak bersuara; ekor mempertahankan peluruhan kata
   lalu fade singkat menghindari klik. Jangan salin filter ini ke pintu masuk lain. */
export function pangkasVo(mentah, keluar, {tempo = 1, label = path.basename(keluar)} = {}) {
  const t = Math.min(VO.tempoMaks, Math.max(VO.tempoMin, Number(tempo) || 1));
  const awal = `${keluar}.awal.wav`;
  try {
    const filterAwal = `${t !== 1 ? `atempo=${t},` : ''}silenceremove=start_periods=1:`
      + `start_duration=${VO.durasiAwal}:start_threshold=${VO.ambangAwal}:detection=peak`;
    ff(['-i', mentah, '-af', filterAwal, awal]);
    const panjang = Math.min(durasi(awal), akhirSuara(awal) + VO.sisaEkor);
    if (panjang < 0.1) throw new Error(`${label} senyap sesudah trim — periksa berkasnya`);
    ff(['-i', awal, '-af', `atrim=0:${panjang.toFixed(3)},afade=t=in:st=0:d=${VO.fadeMasuk},`
      + `afade=t=out:st=${Math.max(0, panjang - VO.fadeKeluar).toFixed(3)}:d=${VO.fadeKeluar}`, keluar]);
    // `kepala`: detik senyap awal yang dibuang, dalam waktu take mentah (waktu kata P8-10 digeser
    // sebanyak ini). Diukur sebagai selisih durasi, karena silenceremove hanya memotong kepala.
    return {detik: durasi(keluar), panjang, kepala: Math.max(0, durasi(mentah) - durasi(awal) * t)};
  } finally {
    if (existsSync(awal)) unlinkSync(awal);
  }
}

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
/* Model TTS dan kunci cache tiap baris. Dipakai `vo` DAN perkiraan biaya (lib/biaya.mjs):
   kalau keduanya menghitung kunci sendiri-sendiri, perkiraan bisa bilang "0 baris baru"
   sementara `vo` membuat ulang semuanya.
   @param {import('./tipe.mjs').Config} c */
export function rencanaVo(c) {
  const s = c.suara || {};
  /* Sebelum 10 Okt 2026 model bawaan adalah eleven_multilingual_v2, dan kuncinya tidak
     mencatat model. Proyek yang sudah punya VO dengan kunci lama tetap memakai v2. Kalau
     tidak, `plan` berikutnya membuat ulang seluruh VO-nya dengan suara lain dan membakar
     kredit. Tulis `suara.model` untuk memindahkan proyek lama ke model baru. */
  const dirVo = path.join(c.aset, 'vo');
  const warisanV2 = !s.model && existsSync(dirVo) && readdirSync(dirVo)
    .filter((f) => f.endsWith('.mp3.kunci'))
    .some((f) => { try { return !('model' in JSON.parse(readFileSync(path.join(dirVo, f), 'utf8'))); } catch { return false; } }); // kunci rusak tidak dianggap bukti warisan v2
  const model = s.model || (warisanV2 ? 'eleven_multilingual_v2' : EL.MODEL_SUARA);
  const modelKunci = s.model || (warisanV2 ? undefined : EL.MODEL_SUARA);
  const baris = c.vo.map((l, i) => ({
    l, file: path.join(c.aset, 'vo', `vo-${String(l.no).padStart(2, '0')}.mp3`),
    kunci: {
      teks: ucapkan(l.text, c.lafal), maks: l.maks, dengar: l.dengar && String(l.dengar), coba: l.coba,
      voice: l.voice || s.id, model: modelKunci, bahasa: s.bahasa, seed: s.seed,
      // `style`/`stability` per baris: baris CTA butuh intonasi lebih naik daripada sisanya.
      stability: l.stability ?? s.stability, similarity: s.similarity, style: l.style ?? s.style,
      speed: typeof s.speed === 'function' ? s.speed(l) : s.speed,
      sebelum: c.vo[i - 1] && ucapkan(c.vo[i - 1].text, c.lafal),
      sesudah: c.vo[i + 1] && ucapkan(c.vo[i + 1].text, c.lafal),
      pangkas: VO.versiPangkas,
    },
  }));
  return {model, baris};
}

/* Kunci lama (tanpa `pangkas`) masih sah bila VO-nya tidak mungkin terkena regresi atempo ganda:
   speed 1, atau dibuat sebelum commit regresi (konstanta VO.regresiTempoMs).
   @param {Record<string, any>} kunci @param {number} dibuatMs */
function lamaSah(kunci, dibuatMs) {
  return Number(kunci.speed ?? 1) === 1 || dibuatMs < VO.regresiTempoMs;
}
const tanpaPangkas = (/** @type {Record<string, any>} */ k) => { const {pangkas, ...lama} = k; return lama; };

/* Satu-satunya aturan "VO proyek ini segar", dipakai `vo`, perkiraan biaya, dan `--kering`: kalau
   ketiganya menilai sendiri-sendiri, perkiraan bisa bilang "0 baris baru" sementara `vo` membuat
   ulang. `migrasi`: kunci lama yang sah ditulis ulang dengan penanda versi (hanya `vo`; perkiraan dan
   `--kering` tidak boleh menulis).
   @param {string} file @param {Record<string, any>} kunci @param {{migrasi?: boolean}} [o] */
export function segarVo(file, kunci, {migrasi = false} = {}) {
  if (segar(file, kunci)) return true;
  const lama = tanpaPangkas(kunci);
  if (!segar(file, lama) || !lamaSah(lama, statSync(`${file}.kunci`).mtimeMs)) return false;
  if (migrasi) tandai(file, kunci);
  return true;
}

/* Cache VO lintas proyek dengan aturan yang sama: entri lama tanpa penanda hanya dipakai bila sah
   (`dibuat` di asal entri). @param {Record<string, any>} kunci @returns {string | null} */
export function cariCacheVo(kunci) {
  const f = CV.cari(kunci);
  if (f) return f;
  const lama = tanpaPangkas(kunci), fl = CV.cari(lama);
  const dibuat = fl ? Date.parse(String(CV.asal(lama)?.dibuat)) : NaN;
  return fl && Number.isFinite(dibuat) && lamaSah(lama, dibuat) ? fl : null;
}

/**
 * @param {import('./tipe.mjs').Config} c
 * @param {{paksa?: boolean, coba?: number}} [opsi]
 * @returns {Promise<import('./tipe.mjs').BarisVO[]>}
 */
export async function vo(c, {paksa = false, coba = VO.coba} = {}) {
  const s = c.suara || {};
  const {model, baris} = rencanaVo(c);
  /* Baris saling bebas (konteks tetangga hanya teks), jadi dibuat bersamaan lewat kolam (P8-04).
     Perintis dan penghentian saat galat: lib/kolam.mjs. Tiap baris menulis berkasnya sendiri
     (`vo-NN.mp3`, `.take.mp3`, `.awal.wav`), tidak ada berkas bersama. */
  await kolam(baris, EL.paralel(), async ({l, file, kunci}) => {
    const no = String(l.no).padStart(2, '0');
    l.file = file;
    /* `suara.luar`: VO dibuat di luar mesin (connector ElevenLabs di Claude, lewat motion-mcp)
       dan sudah ditrim saat diunggah. Tidak ada kunci API di sini, jadi jangan pernah generate —
       baris yang belum diunggah harus gagal dengan menyebut nomornya. */
    if (s.luar) {
      if (!existsSync(l.file)) throw new Error(`VO-${l.no} belum diunggah ("${l.text.slice(0, 40)}")`);
      l.dur = durasi(l.file);
      l.kata = bacaKata(l.file) || undefined;
      return false;
    }
    const i = c.vo.indexOf(l);
    if (paksa && existsSync(l.file)) unlinkSync(l.file);
    /* Cache lintas proyek (P6-07): permintaan yang sama persis, termasuk kalimat tetangganya,
       sudah pernah dibayar di proyek lain. `paksa` tetap membuat ulang. */
    const dariCache = !paksa && !segarVo(l.file, kunci, {migrasi: true}) && cariCacheVo(kunci);
    if (dariCache) {
      copyFileSync(dariCache, l.file);
      salinKata(dariCache, l.file);
      tandai(l.file, kunci);
      process.stderr.write(`  vo-${no} ⇠ cache VO (${kunci.teks.length} kredit tidak dipakai)\n`);
    } else if (segarVo(l.file, kunci)) {
      // VO lama yang segar ikut mengisi cache: proyek lama langsung berguna untuk proyek baru.
      CV.simpan(kunci, l.file, {proyek: c.nama, baris: l.no});
      kataKeCache(l.file, kunci);
    }
    const perlu = !segarVo(l.file, kunci);
    if (perlu) {
      const mentah = `${l.file}.take.mp3`;
      let terbaik = null;
      const n = l.coba ?? coba;
      for (let putaran = 0; putaran < (l.maks || l.dengar ? n : 1); putaran++) {
        const label = `VO-${l.no} ("${l.text.slice(0, 40)}")`;
        /* `suara.waktuKata` (P8-10): endpoint with-timestamps, badan permintaan sama persis. Opt-in
           sampai terbukti di API sungguhan: respons yang berbeda bentuk akan menggagalkan SEMUA VO. */
        const tts = s.waktuKata ? EL.suaraWaktu : (/** @type {string} */ t, /** @type {any} */ o) => EL.suara(t, o).then((audio) => ({audio, alignment: null}));
        const jadi = await tts(ucapkan(l.text, c.lafal), {
          voice: l.voice || s.id, model, bahasa: s.bahasa,
          // Seed digeser tiap percobaan; seed yang sama mengembalikan take yang sama persis.
          seed: s.seed === undefined ? undefined : s.seed + putaran,
          stability: l.stability ?? s.stability, similarity: s.similarity, style: l.style ?? s.style,
          speed: typeof s.speed === 'function' ? s.speed(l) : s.speed,
          // konteks CUKUP satu kalimat tetangga — satu paragraf penuh membuat durasi melar
          sebelum: c.vo[i - 1] && ucapkan(c.vo[i - 1].text, c.lafal),
          sesudah: c.vo[i + 1] && ucapkan(c.vo[i + 1].text, c.lafal),
        }).catch((e) => { throw EL.beriLabel(label, e); });
        writeFileSync(mentah, jadi.audio);
        /* Ambang trim: 10 ms di atas -58 dB, BUKAN 30 ms di atas -50 dB. Letusan konsonan
           tak bersuara di awal kata (t, k, p, s, c, f) cuma 10-20 ms dan pelan, jadi syarat
           30 ms tidak pernah terpenuhi dan seluruh awalannya ikut terbuang sebagai "senyap".
           Diuji pada satu take yang sama, ditranskrip balik:
             tanpa trim          1,280s -> "Toh pakai LPWA"
             0,03 / -50 dB       1,071s -> "Love pakai LPWA"   awalannya hancur
             0,01 / -58 dB       1,123s -> "Toh pakai LPWA"    utuh
           Ini mengenai setiap baris yang diawali konsonan tak bersuara — sebagian besar
           kata Indonesia — dan tidak pernah terlihat kecuali baris itu ditranskrip balik. */
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
        /* TANPA tempo: speed sudah diterapkan API (voice_settings.speed). `tempo` hanya untuk unggahan
           MCP, yang connector-nya tidak punya speed. 9e0bff6 mengirim speed ke sini juga dan VO
           ber-speed 1,2 keluar ±1,44x (konstanta VO.regresiTempoMs). */
        const pk = pangkasVo(mentah, l.file, {label: `VO-${l.no}`});
        const d = durasi(l.file);
        const kata = jadi.alignment
          ? petaKata(l.text, (w) => ucapkan(w, c.lafal), jadi.alignment, {geser: pk.kepala, dur: d}) : null;
        /* `dengar`: take diterima hanya kalau transkrip baliknya cocok. Ejaan yang sama bisa
           benar di satu seed dan salah di seed lain ("Chat Wulan" -> "Jadwulan", "Klode" ->
           "Kalau dia"), jadi yang dikunci adalah hasil dengarnya, bukan ejaannya. */
        const ok = !l.dengar || l.dengar.test(await EL.transkrip(readFileSync(l.file))
          .catch((e) => { throw EL.beriLabel(`${label} transkrip`, e); }));
        const muat = !l.maks || d <= l.maks;
        const skor = (ok ? 0 : 2) + (muat ? 0 : 1);
        if (!terbaik || skor < terbaik.skor || (skor === terbaik.skor && d < terbaik.d)) terbaik = {d, skor, ok, kata, isi: readFileSync(l.file)};
        if (ok && muat) break;
        process.stderr.write(`  vo-${no} coba ${putaran + 1}/${n} — ${ok ? '' : 'transkrip tidak cocok '}${muat ? '' : `${d.toFixed(2)}s > maks ${l.maks}s`}\n`);
      }
      unlinkSync(mentah);
      writeFileSync(l.file, terbaik.isi);
      tulisKata(l.file, terbaik.kata);       // tanpa waktu kata: berkas lama dibuang
      tandai(l.file, kunci);
      CV.simpan(kunci, l.file, {proyek: c.nama, baris: l.no});
      kataKeCache(l.file, kunci);
      const lewat = l.maks && terbaik.d > l.maks;
      if (!terbaik.ok) process.stderr.write(`  vo-${no} ! transkrip MASIH tidak cocok ${l.dengar} sesudah ${n} take\n`);
      process.stderr.write(`  vo-${no} ${lewat ? '!' : '✓'} ${terbaik.d.toFixed(2)}s`
        + `${lewat ? ` — MASIH lewat maks ${l.maks}s, scene akan melar` : ''}\n`);
    }
    l.dur = durasi(l.file);
    l.kata = bacaKata(l.file) || undefined;
    return perlu;
  });
  return c.vo;
}

/* Waktu kata ikut cache VO lintas proyek (berkas `<cache>.mp3.kata.json`). Sidik isi MP3 di dalamnya
   tetap berlaku karena isinya identik; yang tidak cocok tidak pernah dibaca (`bacaKata`). */
const salinKata = (/** @type {string} */ dari, /** @type {string} */ ke) => (existsSync(berkasKata(dari))
  ? copyFileSync(berkasKata(dari), berkasKata(ke)) : rmSync(berkasKata(ke), {force: true}));
function kataKeCache(/** @type {string} */ file, /** @type {Record<string, any>} */ kunci) {
  const fc = CV.cari(kunci);
  if (fc && existsSync(berkasKata(file)) && !existsSync(berkasKata(fc))) copyFileSync(berkasKata(file), berkasKata(fc));
}

