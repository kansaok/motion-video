#!/usr/bin/env node
// CLI motion-engine. Jalankan `motion` tanpa argumen untuk daftar perintah.
import path from 'node:path';
import os from 'node:os';
import {existsSync, writeFileSync, mkdirSync, readdirSync, statSync} from 'node:fs';
import * as Pipa from '../lib/pipa.mjs';
import * as K from '../lib/komposisi.mjs';
import * as T from '../lib/tata.mjs';
import * as Stok from '../lib/stok.mjs';
import * as Biaya from '../lib/biaya.mjs';
import {cuplik} from '../lib/render.mjs';
import {AKAR} from '../lib/env.mjs';

const [perintah, ...arg] = process.argv.slice(2);
const bendera = Object.fromEntries(arg.filter((a) => a.startsWith('--'))
  .map((a) => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
const posisi = arg.filter((a) => !a.startsWith('--'));
// `shot` menyelipkan detik di antara argumen posisi, dan folder tidak pernah berupa angka.
const dirProyek = path.resolve(posisi.find((a) => !/^[\d.]+$/.test(a)) || process.cwd());

const BANTUAN = `
motion — zip komposisi Claude Design -> MP4 dengan VO, SFX, dan musik

  motion init <file.zip> <folder>   bongkar zip, deteksi komposisi, tulis kerangka config
  motion plan   [folder]            generate VO lalu hitung posisi baris + durasi scene
  motion apply  [folder]            tulis durasi & jangkar hasil plan balik ke komposisi
  motion sfx    [folder]            generate berkas SFX yang belum ada
  motion stok   <kata...>           cari SFX di stok (sfx-stok/) SEBELUM generate; --bangun kumpulkan ulang
  motion music  [folder]            generate trek musik yang belum ada
  motion mix    [folder]            rakit master.wav + stem
  motion render [folder]            render MP4        (--frames=60 untuk uji cepat)
  motion check  [folder]            verifikasi hasil  (--cepat untuk lewati STT + A/B)
  motion shot   [folder] <detik...> cuplik frame dari komposisi hidup
  motion all    [folder]            plan -> apply -> sfx -> music -> mix -> render -> check
  motion cost   [jam]               biaya ElevenLabs beberapa jam terakhir
  motion voices [cari]              daftar suara
  motion speed  <suara...>          ukur kecepatan baca tiap suara SEBELUM menulis naskah

  motion render --komposisi=<html>  render orientasi lain dengan audio yang sama

  Perintah yang bisa memanggil ElevenLabs (plan, apply, sfx, music, mix, check, all) mencetak
  perkiraan biaya dulu dan berhenti bila di atas BIAYA_MAKS_USD (bawaan $0,50) kecuali --ya.
  Realisasinya dicatat ke <folder>/biaya.json.

Folder default = direktori sekarang. Kunci dibaca dari ${path.join(AKAR, '.env')}.
`;

const rp = (n) => n.toLocaleString('id-ID');
/* VO ikut dibuat ulang oleh `apply`, `mix`, dan `check` (semuanya memanggil `vo()`), bukan
   hanya oleh `plan`. Gerbang biaya dipasang di semua pintu itu, bukan cuma yang namanya
   terdengar mahal. */
const berbiaya = (c, langkah, kerja, o = {}) => Biaya.berbiaya(c, perintah, langkah, kerja, {ya: Boolean(bendera.ya), ...o});
// 'Iklan CTWA Konektor 4x5.dc.html' -> 'iklan-ctwa-konektor-4x5'
const namaPendek = (f) => path.basename(f).replace(/\.(dc\.)?html?$/i, '').replace(/\W+/g, '-').toLowerCase();

async function jalankan() {
  switch (perintah) {
    case 'init': {
      const zip = path.resolve(posisi[0]);
      const tujuan = path.resolve(posisi[1] || path.join(process.cwd(), path.basename(zip, '.zip')));
      if (!existsSync(zip)) throw new Error(`zip tidak ada: ${zip}`);
      mkdirSync(tujuan, {recursive: true});
      const {src, html, jsx} = Pipa.bongkar(zip, tujuan);
      console.log(`  dibongkar ke ${src}`);
      console.log(`  komposisi ber-OM_SCENES: ${html.join(' · ')}`);
      /* Satu zip sering memuat lebih dari satu VIDEO, bukan cuma orientasi lain dari video
         yang sama. Yang membedakan keduanya adalah .jsx utamanya, BUKAN namanya: dua angle
         berbeda dalam satu zip sama-sama bernama "... 9x16.dc.html", dan aturan lama
         (pilih yang cocok /portrait|9x16/) diam-diam mengambil yang salah.
         Salah di sini mahal dua kali: seluruh retiming jatuh ke video yang keliru, DAN
         komposisi angle lain masuk ke `jugaTulis` sehingga durasi scene-nya ikut ditimpa. */
      const info = html.map((f) => ({f, ...K.jsxUtama(path.join(src, f), src)}));
      const grup = new Map();
      for (const h of info) {
        const k = h.utama || h.f;
        grup.set(k, [...(grup.get(k) || []), h.f]);
      }
      let utama = bendera.komposisi && String(bendera.komposisi);
      if (utama && !html.includes(utama)) throw new Error(`komposisi tidak ada di zip: ${utama}`);
      if (!utama && grup.size > 1) {
        console.log(`\n  zip memuat ${grup.size} video berbeda:`);
        for (const [j, fs] of grup) console.log(`    ${fs.join(' · ')}  →  ${j}`);
        throw new Error('pilih salah satu: motion init <zip> <folder> --komposisi="<berkas.dc.html>"');
      }
      if (!utama) utama = html.find((f) => /portrait|9x16/i.test(f)) || html[0];
      const versi = K.kontrak(path.join(src, utama), src);
      // Kontrak v2 membaca timing.js; JSX-nya tidak pernah ditambal, jadi tidak masuk config.
      const namaJsx = versi === 2 ? null : info.find((h) => h.f === utama).utama;
      if (versi === 2) console.log('  kontrak v2: kapsi/beat dibaca dari timing.js, JSX tidak ditambal');
      // Hanya komposisi yang berbagi .jsx utama yang sama yang boleh ikut `jugaTulis` —
      // itu definisi "orientasi lain dari video yang sama".
      const lain = (grup.get(info.find((h) => h.f === utama).utama || utama) || []).filter((f) => f !== utama);
      const scenes = K.bacaScenes(path.join(src, utama));
      const {total} = K.jadwal(scenes);
      console.log(`  dipakai komposisi: ${info.find((h) => h.f === utama).dipakai.join(' · ') || '(tidak ada x-import jsx)'}`);
      // "Tidak dipakai" dihitung terhadap SELURUH komposisi di zip. Dihitung terhadap satu
      // komposisi saja, .jsx milik angle lain dituduh berkas mati — persis peringatan yang
      // dipakai orang untuk memutuskan berkas mana yang aman diabaikan.
      const semuaDipakai = new Set(info.flatMap((h) => h.dipakai));
      const nganggur = jsx.filter((f) => !semuaDipakai.has(f));
      if (nganggur.length) console.log(`  jsx sisa versi lama, TIDAK dipakai: ${nganggur.join(' · ')}`);
      if (namaJsx) {
        const r = K.relatif(path.join(src, namaJsx));
        const cocok = K.laporanKeselarasan(path.join(src, namaJsx));
        console.log(`  jsx: ${namaJsx} — ${r.rel} rujukan scene-relatif, ${r.abs} array absolut`);
        console.log(r.aman
          ? '  ✓ 100% scene-relatif: durasi scene aman diubah'
          : '  ! ada array detik absolut — angkanya harus dipetakan ulang manual kalau scene diubah');
        console.log(`  keselarasan JSX: ${cocok.jangkar.length} jangkar · ${cocok.deret.length} deret · ${cocok.kapsi.jumlah} kapsi${cocok.kapsi.tidakCocok.length ? ` · ! kapsi tak cocok: ${cocok.kapsi.tidakCocok.join(', ')}` : ''}`);
        for (const x of cocok.tidakCocok) console.log(`    ! tidak dapat ditulis balik: ${x}`);
      }
      console.log(`\n  ${scenes.length} scene, ${total}s:`);
      let a = 0;
      for (const s of scenes) { console.log(`    ${s.name.padEnd(14)} ${String(s.dur).padStart(5)}s  mulai ${a.toFixed(1)}`); a += s.dur; }

      const cfg = path.join(tujuan, 'motion.config.mjs');
      if (!existsSync(cfg)) {
        writeFileSync(cfg, kerangka({nama: path.basename(tujuan), utama, lain, namaJsx, scenes}));
        console.log(`\n  kerangka config ditulis: ${cfg}`);
        console.log('  isi naskah VO, daftar SFX, cue, dan musik — lalu: motion all');
      } else console.log(`\n  config sudah ada, tidak ditimpa: ${cfg}`);
      break;
    }
    case 'plan': {
      const c = await Pipa.muat(dirProyek);
      const {scenes, asli, total} = await berbiaya(c, ['vo'], () => Pipa.rencana(c));
      console.log(T.laporan(scenes, asli, c.vo, total));
      break;
    }
    case 'apply': {
      const c = await Pipa.muat(dirProyek);
      const r = await berbiaya(c, ['vo'], () => Pipa.terap(c));
      console.log(`  ${r.html} berkas html · ${r.kapsi} kapsi · ${r.jangkar} jangkar animasi ditulis ulang`);
      break;
    }
    case 'sfx':   { const c = await Pipa.muat(dirProyek); console.log(`  ${await berbiaya(c, ['sfx'], () => Pipa.sfx(c))} bunyi baru (${(c.sfx || []).length} total)`); break; }
    case 'stok': {
      if (bendera.bangun) { const r = await Stok.bangun(); console.log(`  stok ✓ ${r.unik} bunyi unik dari ${r.kandidat} berkas → ${Stok.DIR}`); break; }
      for (const d of Stok.cari(posisi.join(' '))) console.log(`${d.id}  ${d.detik}s  [${d.kategori.join(',')}]\n    cocok: ${d.cocok[0]}\n    ${d.prompt || ''}`);
      break;
    }
    case 'music': {
      const c = await Pipa.muat(dirProyek);
      console.log(`  ${await berbiaya(c, ['musik'], () => Pipa.musik(c))} trek baru`);
      // Lubang dilaporkan sekarang, dalam detik, bukan sesudah render beberapa menit di `check`.
      const bed = Pipa.laporBed(Pipa.periksaBed(c));
      if (bed) console.log(bed);
      break;
    }
    case 'mix': {
      const c = await Pipa.muat(dirProyek);
      const r = await berbiaya(c, ['vo'], () => Pipa.mix(c));
      console.log(`  master ✓ ${r.durasi.toFixed(2)}s · ${r.cue} cue · ${r.vo} VO · ${r.lufs} LUFS · ${r.dbtp} dBTP`);
      break;
    }
    case 'render': {
      const c = await Pipa.muat(dirProyek);
      // Satu proyek biasanya punya dua orientasi dengan audio yang sama persis. `jugaTulis`
      // sudah menyamakan durasi scene-nya, jadi sisanya cukup satu bendera — bukan menyunting
      // config bolak-balik dan berisiko meninggalkannya menunjuk orientasi yang salah.
      if (bendera.komposisi) {
        c.komposisi = String(bendera.komposisi);
        c.keluaran = String(bendera.keluaran || `${namaPendek(c.komposisi)}.mp4`);
      } else if (bendera.keluaran) c.keluaran = String(bendera.keluaran);
      const r = await Pipa.render(c, {batasFrame: bendera.frames ? Number(bendera.frames) : undefined, tab: bendera.tab && Number(bendera.tab)});
      console.log(`  ✓ ${r.keluaran} — ${r.lebar}x${r.tinggi}, ${r.detik}s`);
      if (r.sampul) console.log(`  ✓ ${r.sampul} — sampul dari detik ${r.sampulDetik.toFixed(2)}`);
      break;
    }
    case 'shot': {
      const c = await Pipa.muat(dirProyek);
      const detik = posisi.filter((p) => /^[\d.]+$/.test(p)).map(Number);
      // `--komposisi` berlaku di sini juga, bukan cuma di `render`. Tanpa itu memeriksa
      // rasio kedua mustahil: tiga rasio dicuplik berturut-turut menghasilkan tiga berkas
      // dengan nama yang sama, dari komposisi yang sama, dan terlihat seperti berhasil.
      const komp = bendera.komposisi ? String(bendera.komposisi) : c.komposisi;
      const awalan = komp === c.komposisi ? '' : `${namaPendek(komp)}-`;
      const f = await cuplik(c.src, komp, detik, path.join(dirProyek, 'cuplikan'), awalan);
      f.forEach((x) => console.log(`  ${x}`));
      break;
    }
    case 'check': {
      const c = await Pipa.muat(dirProyek);
      await berbiaya(c, ['vo'], () => periksaDanLapor(c, {lengkap: !bendera.cepat, visual: true}));
      break;
    }
    case 'all': {
      const c = await Pipa.muat(dirProyek);
      const t0 = Date.now();
      /* Perkiraan dicetak di AWAL, bukan hanya laporan biaya di akhir. Durasi musik di sini
         masih dari komposisi asli (timeline belum ada); sesudah `plan` musiknya diperkirakan
         ulang dan ditanyakan lagi kalau ternyata lebih mahal dari yang sudah disetujui. */
      const awal = Biaya.perkiraan(c, ['vo', 'sfx', 'musik']);
      const musikAwal = awal.rincian.filter((b) => b.jenis === 'musik').reduce((a, b) => a + b.kredit, 0);
      await berbiaya(c, ['vo', 'sfx', 'musik'], async () => {
        console.log('sfx…');    await Pipa.sfx(c);
        console.log('plan…');   const {scenes, asli, total} = await Pipa.rencana(c);
        console.log(T.laporan(scenes, asli, c.vo, total));
        console.log('apply…');  const a = await Pipa.terap(c);
        console.log(`  ${a.html} html · ${a.kapsi} kapsi · ${a.jangkar} jangkar`);
        const pm = Biaya.perkiraan(c, ['musik']);
        if (pm.kredit > musikAwal + 1) {
          console.log(`  musik sesudah plan: ${rp(pm.kredit)} kredit (perkiraan awal ${rp(Math.round(musikAwal))})`);
          await Biaya.jaga(pm, {ya: Boolean(bendera.ya)});
        }
        console.log('musik…');  await Pipa.musik(c);
        const bed = Pipa.laporBed(Pipa.periksaBed(c));
        if (bed) console.log(bed);
        console.log('mix…');    const r = await Pipa.mix(c);
        console.log(`  master ✓ ${r.durasi.toFixed(2)}s · ${r.cue} cue · ${r.vo} VO · ${r.lufs} LUFS · ${r.dbtp} dBTP`);
        console.log('render…'); const v = await Pipa.render(c, {batasFrame: bendera.frames ? Number(bendera.frames) : undefined});
        console.log(`  ✓ ${v.keluaran} — ${v.lebar}x${v.tinggi}`);
        if (v.sampul) console.log(`  ✓ ${v.sampul} — sampul dari detik ${v.sampulDetik.toFixed(2)}`);
        console.log('check…'); await periksaDanLapor(c, {lengkap: !bendera.cepat, visual: true});
      }, {cetak: true});
      const b = await Pipa.biaya(t0 - 5 * 60 * 1000);
      console.log(`biaya   ${rp(b.total)} kredit ≈ Rp${rp(b.rupiah)} · sisa kuota ${rp(b.kuota.sisa)}`);
      break;
    }
    case 'cost': {
      const jam = Number(posisi[0] || 3);
      const b = await Pipa.biaya(Date.now() - jam * 3600 * 1000);
      for (const [k, v] of Object.entries(b.per).sort((x, y) => y[1] - x[1])) console.log(`  ${k.padEnd(16)} ${String(rp(v)).padStart(8)} kredit`);
      console.log(`  ${'TOTAL'.padEnd(16)} ${String(rp(b.total)).padStart(8)} kredit = $${b.usd.toFixed(2)} = Rp${rp(b.rupiah)}`);
      console.log(`  sisa kuota ${rp(b.kuota.sisa)} / ${rp(b.kuota.batas)}`);
      break;
    }
    /* Sebaran kecepatan baca antar suara Indonesia lebih dari 2x (9,6-21,5 kar/dtk).
       Salah pilih baru ketahuan sesudah satu lintasan TTS penuh terbuang dan seluruh
       durasi scene meleset. Ukur dulu, dengarkan berkasnya, baru tulis naskahnya. */
    case 'speed': {
      const {suara, daftarSuara} = await import('../lib/el.mjs');
      const {durasi} = await import('../lib/ff.mjs');
      const teks = String(bendera.teks || 'Kontainer nyala di Jakarta, domain langsung jadi. '
        + 'Lima belas detik, dan tagihannya enam puluh ribu Rupiah.');
      const speed = Number(bendera.speed || 1.0);
      const target = Number(bendera.detik || 45);
      const katalog = (await daftarSuara()).voices;
      console.log(`  contoh ${teks.length} karakter · speed ${speed}\n`);
      for (const a of posisi) {
        // Suara Voice Library tidak muncul di katalog akun, tetapi TTS tetap menerimanya.
        const v = katalog.find((x) => x.voice_id === a)
          || katalog.find((x) => (x.name || '').toLowerCase().includes(a.toLowerCase()))
          || (/^[A-Za-z0-9]{20}$/.test(a) ? {voice_id: a, name: a} : null);
        if (!v) { console.log(`  ${a.padEnd(20)} tidak ada di katalog`); continue; }
        const f = path.join(os.tmpdir(), `motion-speed-${v.voice_id}.mp3`);
        writeFileSync(f, await suara(teks, {voice: v.voice_id, seed: 1, speed}));
        const d = durasi(f), kps = teks.length / d;
        console.log(`  ${(v.name || '').slice(0, 22).padEnd(22)} ${d.toFixed(2)}s · ${kps.toFixed(1)} kar/dtk`
          + ` · naskah ${target}s muat ±${Math.round(kps * target)} karakter`);
        console.log(`  ${' '.repeat(22)} ${v.voice_id}  ${f}`);
      }
      break;
    }
    case 'voices': {
      const {daftarSuara} = await import('../lib/el.mjs');
      const cari = (posisi[0] || '').toLowerCase();
      const v = (await daftarSuara()).voices
        .filter((x) => !cari || `${x.name} ${x.labels?.description || ''}`.toLowerCase().includes(cari));
      for (const x of v.slice(0, 40)) {
        console.log(`  ${(x.name || '').padEnd(18)} ${x.voice_id}  ${x.labels?.age || ''} ${x.labels?.use_case || ''} — ${x.labels?.description || ''}`);
      }
      console.log(`  ${v.length} suara`);
      break;
    }
    default: console.log(BANTUAN);
  }
}

// Dipakai `check` dan ekor `all` — satu tempat, supaya keduanya tidak pernah berbeda isi.
async function periksaDanLapor(c, opsi) {
  /* MP4 yang lebih tua daripada master.wav berarti render terakhir gagal. Sekali render
     mati di tengah (screenshot timeout), `| tail` menelan kode keluarnya, dan `check`
     memberi angka lulus untuk MP4 dari putaran sebelumnya. Diukur SEBELUM periksa, karena
     A/B bus SFX menulis ulang master.wav. */
  const mp4 = path.join(c.dir, c.keluaran || `${c.nama}.mp4`), master = path.join(c.aset, 'master.wav');
  const basi = existsSync(mp4) && existsSync(master) && statSync(mp4).mtimeMs < statSync(master).mtimeMs;
  const h = await Pipa.periksa(c, opsi);
  if (basi) console.log('  MP4      ✖ lebih tua daripada master.wav — render terakhir gagal, angka di bawah milik MP4 lama');
  /* Angka MP4 diberi PUTUSAN, bukan cuma dicetak. Mixer memvalidasi puncaknya terhadap
     encode AAC percobaannya sendiri — dan encode itu dibuat oleh ffmpeg di mesin INI,
     sementara berkas yang dikirim dibuat oleh ffmpeg di mesin render. Terukur pada satu
     master.wav yang sama persis (md5 identik):

       ffmpeg 6.1.1 (mesin ini)   -> -1,3 dBTP
       ffmpeg 8.1.1 (rama-tuf)    -> +0,7 dBTP

     Dua dB selisih, dan mixer lolos sementara berkas yang dikirim melanggar spesifikasi.
     Satu-satunya tempat yang bisa menangkapnya adalah di sini, karena cuma di sini MP4
     yang benar-benar dikirim itu diukur. */
  if (h.mp4) {
    const lufsOk = Math.abs(h.mp4.lufs - (-14)) <= 1.0;
    const pkOk = h.mp4.dbtp <= -1.0;
    console.log(`  MP4      ${lufsOk && pkOk ? '✓' : '✖'} ${h.mp4.lufs} LUFS · ${h.mp4.dbtp} dBTP`
      + `${lufsOk ? '' : ' — di luar -14 ±1 LUFS'}`
      + `${pkOk ? '' : ' — MELANGGAR batas -1,0 dBTP, jangan dikirim'}`);
  }
  /* Frame 0 adalah SAMPUL, bukan sekadar frame pertama. Instagram Reels, TikTok, dan
     LinkedIn memakainya kalau pengunggah tidak memilih sendiri, dan TikTok tidak
     mengizinkannya diganti sesudah unggah — jadi video yang isinya benar tetap muncul di
     feed sebagai kotak kosong. Ambangnya rasio, bukan angka mutlak: trailer gelap memang
     berkontras rendah di scene pembukanya dan akan dituduh setiap kali. */
  if (h.sampul) {
    const {sd0, med, rasio} = h.sampul;
    const ok = rasio >= 0.75;
    console.log(`  sampul   ${ok ? '✓' : '✖'} frame 0 kontras ${sd0.toFixed(1)} `
      + `= ${(rasio * 100).toFixed(0)}% dari scene pembukanya (${med.toFixed(1)})`
      + `${ok ? '' : ' — dibuka dengan fade, dan frame itulah sampulnya di Reels/TikTok'}`);
    if (ok && sd0 < 8) {
      console.log(`  ${' '.repeat(8)} kontrasnya rendah — unggah berkas -sampul.jpg sebagai sampul kustom`);
    }
  }
  const m = h.masking;
  /* Dua cek di bawah ini MENGUKUR VO. Video tanpa VO — logo opener, bumper — membuat
     keduanya tidak punya pembanding: stem VO-nya senyap, jadi "musik +39,3 dB terhadap
     VO" selalu ✖ dan "VO di atas SFX -59,4 dB" tidak berarti apa-apa. Dilaporkan ✖,
     cek ini jadi merah selamanya di kelas video itu — dan cek yang selalu merah persis
     sama gunanya dengan cek yang tidak ada. */
  const adaVO = (c.vo || []).length > 0;
  if (!adaVO) {
    console.log('  masking  — tanpa VO: cek pita bicara dan sub bed tidak berlaku');
  } else {
    console.log(`  masking  VO ${m.vo} dB · di atas SFX +${m.voDiAtasSfx.toFixed(1)} dB · di atas musik +${m.voDiAtasMus.toFixed(1)} dB`);
    /* Ambang 0 dB: kick bed tidak boleh lebih keras daripada pita bicara VO. Angkanya dari
       satu mix yang ditolak pendengarnya di +3,5 dB, jadi ini batas kasar dari satu titik
       ukur — bukan angka yang sudah dikalibrasi lintas video. */
    const subOk = m.subDiAtasVo <= 0;
    console.log(`  sub bed  ${subOk ? '✓' : '✖'} musik <120 Hz ${m.musSub.toFixed(1)} dB `
      + `= ${m.subDiAtasVo >= 0 ? '+' : ''}${m.subDiAtasVo.toFixed(1)} dB terhadap VO`
      + `${subOk ? '' : ' — kick memakan jatah headroom VO, potong sub bed-nya'}`);
  }
  if (h.bus) {
    const mati = h.bus.every((b) => Math.abs(b.selisih) < 0.05);
    console.log(`  bus SFX  ${mati ? '✖ TIDAK masuk ke master (selisih 0 dB di semua titik)'
      : '✓ masuk — selisih ' + h.bus.map((b) => `${b.t}s:${b.selisih.toFixed(1)}`).join(' ')}`);
  }
  if (h.lubang) {
    const L = h.lubang.lubang;
    console.log(`  bed musik ${h.lubang.galat ? `✖ tidak dapat diperiksa — ${h.lubang.galat}` : L.length ? '✖ bolong ' + L.map((x) => `${x.dari.toFixed(2)}-${x.sampai.toFixed(2)}s (${x.min.toFixed(0)} dB)`).join(' · ')
      : 'rata, tanpa lubang ✓'}`);
  }
  for (const w of h.hening || []) {
    const d = w.dapat ? `senyap ${w.dapat[0].toFixed(2)}-${w.dapat[1].toFixed(2)}s (${w.lama.toFixed(2)}s)` : 'TIDAK ADA senyap';
    console.log(`  hening   minta ${w.minta[0].toFixed(2)}-${w.minta[1].toFixed(2)}s -> ${d} ${w.lolos ? '✓' : '✖'}`);
  }
  /* Visual: tata letak di komposisi hidup. Peringatan, bukan putusan: transisi yang sengaja
     menggelapkan layar di awal scene bisa terbaca sebagai frame hitam. */
  if (h.visual) {
    const v = h.visual;
    if (v.galat) console.log(`  visual   ✖ tidak dapat diperiksa — ${v.galat}`);
    else if (!v.masalah.length) console.log(`  visual   ✓ ${v.titik} titik: teks di dalam stage, kapsi terisi, tanpa frame hitam`);
    else {
      console.log(`  visual   ! ${v.masalah.length} dari ${v.titik} titik bermasalah:`);
      for (const m of v.masalah) for (const x of m.masalah) console.log(`           ${m.t.toFixed(2)}s ${m.alasan}: ${x}`);
    }
  }
  if (h.transkrip) {
    const t = h.transkrip;
    console.log(`  transkrip ${t.kata} kata · dobel: ${t.dobel.length ? '✖ ' + t.dobel.join(' | ') : 'tidak ada ✓'}`);
    if (t.tidakKetemu.length) console.log(`            kata tak terlacak (biasanya normalisasi STT): ${t.tidakKetemu.slice(0, 10).join(', ')}`);
  }
  return h;
}

function kerangka({nama, utama, lain, namaJsx, scenes}) {
  return `// ${nama} — config motion-engine. Jalankan: motion all
export default {
  nama: '${nama}',
  komposisi: ${JSON.stringify(utama)},${lain.length ? `\n  jugaTulis: ${JSON.stringify(lain)},   // timing identik, satu jsx` : ''}${namaJsx ? `\n  jsx: ${JSON.stringify(namaJsx)},\n  kapsi: true,` : ''}
  keluaran: '${nama}.mp4',

  // Ukur dulu: \`motion speed <suara...>\`. Sebaran antar suara Indonesia lebih dari 2x
  // (9,6-21,5 kar/dtk) — cukup untuk membuat naskah yang sama tidak muat sama sekali.
  suara: {id: 'GANTI_VOICE_ID', seed: 1, speed: 1.0, stability: 0.40, similarity: 0.80, style: 0.05},

  // Kata serapan yang dibaca model secara Inggris ditulis ulang dengan ejaan Indonesia.
  // Teks di layar TIDAK disentuh — hanya teks yang dikirim ke TTS.
  lafal: {},

  // sc = nama scene, off = detik dari awal scene itu
  vo: [
    // {no: 1, sc: ${JSON.stringify(scenes[0]?.name || 'Scene')}, off: 0.3, text: '...'},
  ],

  // 'jangkar' kalau detik di brief cocok dengan komposisi; 'alir' kalau ditulis untuk
  // pembaca manusia (dipakai mentah, suaranya menunggu batas scene dan video penuh diam).
  tata: {mode: 'jangkar', jeda: 0.15, ekorBiasa: 0.5},

  sfx: [
    // ['nama', 1.2, 'deskripsi bunyi dalam bahasa Inggris, dry, one shot'],
  ],

  // C = mulai tiap scene · P = awal tiap baris VO · E = akhirnya · S = durasi scene
  cue: ({C, P, E}) => [
    // {at: C.${scenes[0]?.name || 'Scene'} + 0.2, nama: 'nama', gain: 0.3},
    // {at: P[5] - 0.1, nama: 'nama', gain: 0.3, nada: 2, pan: -0.4},
  ],

  musik: [
    // {nama: 'musik', detik: ({total}) => total + 1, mulai: 0,
    //  prompt: '...', titik: [['${scenes[0]?.name || 'Scene'}', 0, -20]]},
  ],

  // Detik yang dicuplik jadi berkas <keluaran>-sampul.jpg, untuk diunggah sebagai sampul
  // kustom. Frame 0 tetap wajib layak: itu sampul bawaan di Reels, TikTok, dan LinkedIn.
  sampul: {detik: 0},

  // Jendela yang harus benar-benar senyap. Ikat ke E baris sebelumnya DAN P baris
  // sesudahnya — diikat ke satu sisi saja, ekor baris yang memanjang masuk ke dalamnya.
  // gate: ({P, E}) => [[E[22] + 0.10, P[23] - 0.25]],

  periksa: {busTitik: [1, 10, 20]},
};
`;
}

jalankan().catch((e) => { console.error(`\n✖ ${e.message}`); process.exit(1); });
