/* Mixer. Setiap keputusan di sini lahir dari satu kesalahan yang benar-benar terjadi:

   - Semua sumber diratakan ke -6 dBFS dulu; sebelum itu angka gain tidak berarti apa-apa.
   - Musik DAN SFX di-duck lewat sidechaincompress (ratio maksimum 20), bukan step volume.
   - Lubang 2,8 kHz di musik dan SFX supaya suara punya slotnya sendiri.
   - `asetpts` sesudah setiap amix — tanpa itu timestamp hilang, `volume` dengan eval=frame
     membaca t sebagai NaN, dan ffmpeg mematikan bus itu ke 0 tanpa peringatan apa pun.
   - -14 LUFS dicapai dengan ukur -> gain statis -> limiter, bukan loudnorm satu lintasan
     (loudnorm satu lintasan meratakan hierarki VO/musik/SFX).
   - Ambang limiter dicari otomatis terhadap puncak sejati hasil ENCODE AAC, bukan WAV:
     AAC bisa melonjak jauh di atas limiter. */
import {mkdirSync, writeFileSync, unlinkSync} from 'node:fs';
import path from 'node:path';
import {ff, durasi, lufs, puncakSejati, ratakan} from './ff.mjs';

const dB = (v) => Math.pow(10, v / 20);
const nada = (n) => Math.pow(2, n / 12);

// Amplop volume dari titik [scene, offset, dB] -> ekspresi ffmpeg linear per segmen.
export function amplop(titik, C) {
  /* Titik disimpan dalam dB DAN dalam gain linear. Peringatan di bawah dulu membandingkan
     yang linear: gain -17 dB dan -25 dB berjarak 0,085 dalam satuan itu, tidak pernah
     lebih dari 6, jadi peringatan "amplop menukik" TIDAK PERNAH berbunyi — padahal
     README dan IKLAN.md sama-sama menyebutnya sebagai jaring pengamannya. Tukikan 7 dB
     yang dilaporkan penonton sebagai "transisi dipaksakan" lolos tanpa satu pun baris log. */
  const p = titik.map(([sc, o, v]) => [C[sc] + o, dB(v), v]).sort((a, b) => a[0] - b[0]);
  let e = `${p[0][1].toFixed(5)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const [a, v0, d0] = p[i], [b, v1, d1] = p[i + 1];
    if (b - a < 0.01) continue;
    // Amplop yang menukik di batas scene TERDENGAR seperti musiknya bolong, bukan seperti
    // dinamika. Satu video pernah jatuh 7 dB dalam 1 detik tepat di batas scene dan
    // penontonnya melaporkannya sebagai "transisi dipaksakan".
    if (Math.abs(d1 - d0) > 6 && b - a < 1.5) {
      process.stderr.write(`  ! amplop musik ${(d1 - d0).toFixed(0)} dB dalam ${(b - a).toFixed(2)}s `
        + `di detik ${a.toFixed(2)} — terdengar seperti musiknya bolong\n`);
    }
    e += `+clip((t-${a.toFixed(2)})/${(b - a).toFixed(2)},0,1)*${(v1 - v0).toFixed(5)}`;
  }
  return e;
}

/* Jendela hening. Diikat ke posisi BARIS, bukan ke batas scene — jeda paling penting di
   sebuah video selalu ada tepat sebelum satu kalimat tertentu, dan mengikatnya ke batas
   scene membuatnya bergeser tiap kali naskah berubah panjang.
   Tepinya diberi landai 30/20 ms (potongan keras berbunyi klik). `eval=frame` plus limiter
   menggeser gate ±0,08 detik, jadi ukur hasilnya di MP4 final, bukan di WAV. */
export function gerbang(jendela) {
  if (!jendela?.length) return null;
  const f = jendela.map(([a, b]) =>
    `clip((t-${a.toFixed(2)})/0.03,0,1)*clip((${b.toFixed(2)}-t)/0.02,0,1)`).join('+');
  return `volume=volume='1-clip(${f},0,1)':eval=frame`;
}

const LUBANG = 'equalizer=f=2800:t=q:w=1.3:g=-5';

/* Bed musik dipotong di bawah 62 Hz dan bodi kick-nya ditahan di 100 Hz.
   Bukan soal selera. Diukur pada satu iklan 30 detik, per pita, stem lawan stem:

     < 120 Hz         musik -31,6 dB · VO -49,5 dB   musik +17,9 dB DI ATAS VO
     120-300 Hz       musik -39,1 dB
     300 Hz - 4 kHz   musik -40,9 dB · VO -35,1 dB   VO +5,8 dB

   Pita bicara lulus dengan nyaman, dan videonya tetap dilaporkan "VO-nya tidak
   kedengeran jelas". Sebabnya bukan masking: sub 9 dB lebih keras daripada pita
   bicara musiknya sendiri, jadi dia yang mendominasi LUFS terintegrasi. Loudness
   dinormalkan ke -14 LUFS terhadap angka itu, gain statisnya turun, dan VO ikut
   turun bersamanya. Kick-nya mencuri jatah headroom VO tanpa pernah menutupinya.

   62 Hz aman dibuang seluruhnya: iklan feed ditonton lewat speaker HP yang tidak
   mereproduksinya sama sekali, jadi yang hilang cuma angka LUFS-nya. */
const SUB_MUSIK = (b) => `highpass=f=${b.hpf ?? 62},`
  + `equalizer=f=${b.subF ?? 100}:t=q:w=1.1:g=${b.subG ?? -5},`;
const RANTAI_VO = 'acompressor=threshold=0.08:ratio=3:attack=12:release=180:makeup=1.6,'
  + 'equalizer=f=3000:t=q:w=1.2:g=2.2,equalizer=f=220:t=q:w=1.0:g=-1.5,aecho=0.92:0.24:34:0.05';

const geser = (p) => {
  if (Math.abs(p) < 0.05) return '';
  const a = ((p + 1) / 2) * Math.PI / 2, L = Math.cos(a), R = Math.sin(a);
  return `,pan=stereo|c0=${(L * 0.62).toFixed(3)}*c0+${(L * 0.62).toFixed(3)}*c1`
       + `|c1=${(R * 0.62).toFixed(3)}*c0+${(R * 0.62).toFixed(3)}*c1`;
};

/* o = {dir, total, vo[], cue[], musik[], gate[], lufsTarget, gainVO, gainSFX, matikan, keluar, stem} */
export function rakit(o) {
  const A = o.dir, total = o.total;
  for (const d of [`${A}/sfx/norm`, `${A}/vo/norm`, `${A}/../stem`]) mkdirSync(d, {recursive: true});
  const stemDir = path.join(A, '..', 'stem');

  const nama = [...new Set(o.cue.map((c) => c.nama))];
  const inputs = [], chains = [], idx = {};
  nama.forEach((n) => { idx[n] = inputs.length; inputs.push(ratakan(`${A}/sfx/${n}.mp3`, `${A}/sfx/norm/${n}.mp3`)); });
  const iM = o.musik.map((m) => { const k = inputs.length; inputs.push(ratakan(m.file, m.file.replace(/\.mp3$/, '-norm.mp3'))); return k; });
  const iV = o.vo.map((l) => { const k = inputs.length; inputs.push(ratakan(l.file, `${A}/vo/norm/${path.basename(l.file)}`)); return k; });

  const G = gerbang(o.gate);
  const bilas = G ? `,${G}` : '';
  /* Video tanpa musik, tanpa VO, atau tanpa SFX itu sah. Satu explainer diputuskan tanpa
     bed, satu opener 5 detik dibawa penuh oleh SFX. Dulu bus kosong membuat ffmpeg gagal
     ("Invalid argument", atau `amix=inputs=0` untuk bus SFX) tanpa menyebut bus mana.
     Sumber senyap membuat sisa rantai (duck, stem, amix) tidak perlu tahu soal itu. Bus SFX
     yang kosong baru ketahuan di P5-01 (test/mix.test.mjs): video tanpa cue tidak bisa
     di-mix sama sekali. */
  const senyap = `aevalsrc=0:d=${total.toFixed(2)}:s=48000:c=stereo`;

  // ── SFX ──
  o.cue.forEach((c, i) => {
    const p = c.nada ? `,asetrate=44100*${nada(c.nada).toFixed(6)},aresample=44100` : '';
    chains.push(`[${idx[c.nama]}:a]atrim=0:8,volume=${c.gain}${p}${geser(c.pan || 0)},`
      + `adelay=${Math.round(c.at * 1000)}|${Math.round(c.at * 1000)}[c${i}]`);
  });
  chains.push(o.cue.length === 0
    ? `${senyap}[sfxsum]`
    : `${o.cue.map((_, i) => `[c${i}]`).join('')}amix=inputs=${o.cue.length}:normalize=0:dropout_transition=0[sfxsum]`);
  chains.push(`[sfxsum]asetpts=N/SR/TB,volume=${o.matikan === 'sfx' ? 0 : (o.gainSFX ?? 0.62)},${LUBANG}${bilas}[sfxq]`);

  /* ── musik ──────────────────────────────────────────────────────────────────
     Bed diratakan DULU. Generator musik mengembalikan trek yang tidak rata apa pun
     prompt-nya: satu trek 31 detik keluar dengan -33,5 dB di detik 8 dan -34,3 dB di
     detik 26, lawan -10,3 dB di detik 17 — dua lubang 20+ dB yang terdengar persis
     seperti musiknya mati di tengah iklan, dan dilaporkan sebagai "transisi dipaksakan".
     Meminta prompt yang "tanpa breakdown" tidak menolong: hasilnya tidak deterministik.
     Kompresor lambat di sini memotong ketidakrataan itu setengahnya pada trek APA PUN,
     sebelum amplop dan ducking menambah pengurangannya sendiri. */
  const bm = o.bedMusik || {};
  const rataBed = bm.mati ? '' : `acompressor=threshold=${bm.th ?? 0.03}:ratio=${bm.ratio ?? 5}`
    + `:attack=${bm.attack ?? 100}:release=${bm.release ?? 400}:makeup=${bm.makeup ?? 3.2},`;
  o.musik.forEach((m, i) => {
    const mulai = Math.round((m.mulai || 0) * 1000);
    const tunda = mulai ? `adelay=${mulai}|${mulai},` : '';
    /* `lewati`: mulai dari tengah trek. Satu BGM dipakai beberapa video yang scene pembukanya
       beda panjang; tiap video melewati selisihnya, jadi drop tetap jatuh di scene yang sama. */
    const lewat = m.lewati > 0 ? `atrim=start=${m.lewati.toFixed(3)},asetpts=PTS-STARTPTS,` : '';
    const fade = m.fadeOut ? `,afade=t=out:st=${(m.fadeOut[0]).toFixed(2)}:d=${m.fadeOut[1].toFixed(2)}` : '';
    chains.push(`[${iM[i]}:a]${lewat}${tunda}atrim=0:${total.toFixed(2)},asetpts=N/SR/TB,${SUB_MUSIK(bm)}${rataBed}`
      + `volume=volume='${amplop(m.titik, o.C)}':eval=frame,${LUBANG}${bilas}${fade}[m${i}]`);
  });
  // Bus musik kosong: cabang `[m0]` dulu merujuk label yang tidak pernah dibuat (lihat `senyap`).
  chains.push(o.musik.length === 0
    ? `${senyap},asetpts=N/SR/TB[musraw]`
    : o.musik.length > 1
      ? `${o.musik.map((_, i) => `[m${i}]`).join('')}amix=inputs=${o.musik.length}:normalize=0:dropout_transition=0,asetpts=N/SR/TB,atrim=0:${total.toFixed(2)}[musraw]`
      : `[m0]anull[musraw]`);

  // ── VO ──
  o.vo.forEach((l, i) => chains.push(`[${iV[i]}:a]${RANTAI_VO},volume=${o.gainVO ?? 1.45},`
    + `adelay=${Math.round(l.pos * 1000)}|${Math.round(l.pos * 1000)}[v${i}]`));
  chains.push(o.vo.length === 0
    ? `${senyap},asetpts=N/SR/TB,asplit=3[vomix][vostem][vokey]`
    : `${o.vo.map((_, i) => `[v${i}]`).join('')}amix=inputs=${o.vo.length}:normalize=0:dropout_transition=0,`
      + `asetpts=N/SR/TB,asplit=3[vomix][vostem][vokey]`);
  // kunci sidechain wajib di-apad: tanpa itu ducking berhenti begitu VO terakhir selesai
  chains.push(`[vokey]apad,atrim=0:${total.toFixed(2)},asplit=2[kM][kS]`);
  chains.push(`[musraw][kM]sidechaincompress=threshold=${o.duckMusik?.th ?? 0.02}:ratio=${o.duckMusik?.ratio ?? 8}`
    + `:attack=${o.duckMusik?.attack ?? 80}:release=${o.duckMusik?.release ?? 250}:makeup=1,asplit=2[mus][mus2]`);
  chains.push(`[sfxq][kS]sidechaincompress=threshold=0.02:ratio=10:attack=8:release=360:makeup=1,asplit=2[sfx][sfx2]`);
  chains.push(`[sfx][vomix][mus]amix=inputs=3:normalize=0:dropout_transition=0[out]`);
  chains.push(`[sfx2]anull[sfxstem]`, `[mus2]anull[musstem]`);
  /* `keluar` + `stem: false`: mix tambahan (A/B bus SFX di `check`) ditulis ke berkasnya sendiri
     dan tidak menyentuh master.wav maupun stem/. Dulu A/B menimpa keduanya lalu memulihkannya
     dengan mix ulang, tanpa `finally`: check yang dihentikan atau gagal di tengah meninggalkan
     master TANPA SFX, dan render berikutnya mengirim video itu. */
  const tulisStem = o.stem !== false;
  if (!tulisStem) chains.push('[vostem]anullsink', '[sfxstem]anullsink', '[musstem]anullsink');
  const master = o.keluar || path.join(A, 'master.wav');
  const mentah = o.keluar ? `${o.keluar}.mentah.wav` : path.join(A, '..', '.mix.wav');
  const t = total.toFixed(2);
  ff([...inputs.flatMap((f) => ['-i', f]), '-filter_complex', chains.join(';'),
    '-map', '[out]', '-t', t, '-ar', '48000', mentah,
    ...(tulisStem ? ['-map', '[vostem]', '-t', t, '-ar', '48000', `${stemDir}/vo.wav`,
      '-map', '[sfxstem]', '-t', t, '-ar', '48000', `${stemDir}/sfx.wav`,
      '-map', '[musstem]', '-t', t, '-ar', '48000', `${stemDir}/mus.wav`] : [])]);

  /* Cari gain statis + ambang limiter yang memenuhi -14 LUFS DAN puncak sejati AAC.
     Dua jebakan yang pernah benar-benar terjadi, keduanya di loop ini:

     1. `g` dulu dihitung ulang dari nol tiap putaran luar. Koreksi yang sudah didapat
        loop dalam dibuang, padahal ambang limiter yang makin ketat justru menuntut gain
        yang makin besar. Loop dalam lalu kehabisan iterasi dan LUFS berhenti di -15,1.
     2. `batas` dulu hanya bisa TURUN. Sekali satu mix melewati ambangnya, limiter
        mengunci diri makin dalam tiap putaran dan tidak pernah bisa kembali: master
        keluar di -7,7 dBTP, enam dB headroom terbuang dan limiter terdengar mencekik.
        Menggeser jendela gate 0,4 detik sudah cukup untuk memicunya.

     Sekarang `g` dibawa lintas putaran, dan `batas` bergerak DUA arah — naik kalau
     puncaknya kepelanan, turun kalau melewati. */
  const target = o.lufsTarget ?? -14;
  /* Diberi margin 0,3 dB terhadap spesifikasi -1,0 dBTP. Ambangnya diukur pada encode AAC
     PERCOBAAN, sementara angka yang dinilai orang adalah encode di dalam MP4 final — dan
     keduanya tidak pernah persis sama. Sekali master lolos di -1,0 dan MP4-nya keluar di
     -0,9: lolos di sini, melanggar spesifikasi di sana. */
  const PK_ATAS = -1.3, PK_BAWAH = -2.8;
  /* `plafon`: ambang terendah yang pernah menghasilkan puncak LEWAT batas. Puncak AAC tidak
     monoton terhadap ambang, jadi koreksi proporsional saja bisa berayun: satu iklan Jev
     bolak-balik di -1,0 dan -1,5 dBTP enam putaran lalu gagal. Ambang baru tidak pernah
     kembali ke plafon itu atau di atasnya. */
  let batas = 0.9, pk = 0, g = target - lufs(mentah), plafon = 1;
  for (let putaran = 0; putaran < 8; putaran++) {
    for (let i = 0; i < 5; i++) {
      ff(['-i', mentah, '-af', `highpass=f=28:poles=2,volume=${g.toFixed(2)}dB,alimiter=limit=${batas.toFixed(3)}:level=disabled`,
        '-ar', '48000', master]);
      const selisih = target - lufs(master);
      if (Math.abs(selisih) <= 0.2) break;
      g += selisih;
    }
    const cek = o.keluar ? `${o.keluar}.cek.m4a` : path.join(A, '..', '.cek.m4a');
    ff(['-i', master, '-c:a', 'aac', '-b:a', '192k', cek]);
    pk = puncakSejati(cek); unlinkSync(cek);
    if (pk <= PK_ATAS && pk >= PK_BAWAH) break;
    if (pk > PK_ATAS) plafon = Math.min(plafon, batas);
    batas = Math.min(0.99, plafon * 0.97, batas * Math.pow(10, (-1.6 - pk) / 20));
  }
  if (Math.abs(target - lufs(master)) > 0.5 || pk > PK_ATAS) {
    throw new Error(`mix tidak konvergen: ${lufs(master)} LUFS · ${pk} dBTP `
      + `(target ${target} LUFS · <= ${PK_ATAS} dBTP)`);
  }
  unlinkSync(mentah);
  return {master, durasi: durasi(master), lufs: lufs(master), dbtp: pk, cue: o.cue.length, vo: o.vo.length};
}
