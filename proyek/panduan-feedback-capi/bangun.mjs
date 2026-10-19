#!/usr/bin/env node
// Bangun src/ untuk video panduan panjang dari 6 proyek tutorial 1 menit.
//   node bangun.mjs            (SUMBER_TUTORIAL = folder proyek/ yang memuat 6 tutorial)
// Hasil: src/ (komposisi), sumber/*.config.mjs (salinan config untuk cue dan VO).
// src/ dan aset/ tidak ikut git (aturan repo), jadi skrip ini yang menjamin komposisi bisa dibangun ulang.
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, existsSync, rmSync, statSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {BAB, AKHIR, DUR, urutan, NAMA_JUDUL, NAMA_CATATAN} from './jadwal.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const SUMBER = process.env.SUMBER_TUTORIAL || '/home/ramaaditya/Project/motion-engine/proyek';
const LOGO = process.env.LOGO_KONEKTOR || '/home/ramaaditya/Project/konektor/public/logo';
const SRC = path.join(DIR, 'src');
const HTML = 'Panduan Feedback CAPI.dc.html';

const RE_SCENES = /OM_SCENES\s*=\s*(["'])(\[[\s\S]*?\])\1\s*;/;
const bacaScenes = (f) => JSON.parse(readFileSync(f, 'utf8').match(RE_SCENES)[2].replace(/\\"/g, '"'));

rmSync(SRC, {recursive: true, force: true});
mkdirSync(path.join(SRC, 'assets'), {recursive: true});
mkdirSync(path.join(DIR, 'sumber'), {recursive: true});

// 1. berkas mesin (identik di semua tutorial)
const tr = path.join(SUMBER, 'tutorial-tracking', 'src');
for (const f of ['support.js', 'animations-v3.jsx']) copyFileSync(path.join(tr, f), path.join(SRC, f));

// 2. ikon: gabungan dari semua sumber
const ikon = {};
for (const b of BAB) {
  const w = {};
  vm.runInNewContext(readFileSync(path.join(SUMBER, b.proj, 'src', 'icons.js'), 'utf8'), {window: w});
  Object.assign(ikon, w.KICONS);
}
writeFileSync(path.join(SRC, 'icons.js'), `window.KICONS = ${JSON.stringify(ikon)};\n`);

// 3. aset: gabungan, lalu logo asli Konektor menimpa
for (const b of BAB) {
  const d = path.join(SUMBER, b.proj, 'src', 'assets');
  if (!existsSync(d)) continue;
  for (const f of readdirSync(d)) if (statSync(path.join(d, f)).isFile()) copyFileSync(path.join(d, f), path.join(SRC, 'assets', f));
}
for (const f of ['icon_gradient.svg', 'logo200x50.png']) copyFileSync(path.join(LOGO, f), path.join(SRC, 'assets', f));

// 4. scene + jadwal
const urut = urutan();
const scenes = [], rencana = {bab: [], bagian: {}}, peta = {};
for (const b of BAB) {
  const sumber = bacaScenes(path.join(SUMBER, b.proj, 'src', readdirSync(path.join(SUMBER, b.proj, 'src')).find((f) => /\.dc\.html$/.test(f))));
  const srcCues = {}; let a = 0;
  for (const s of sumber) { srcCues[s.name] = Math.round(a * 1000) / 1000; a += s.dur; }
  const bs = b.simpan.map((n) => {
    const s = sumber.find((x) => x.name === n);
    if (!s) throw new Error(`scene ${n} tidak ada di ${b.proj}`);
    return {n, s: srcCues[n], d: s.dur, desc: s.desc, rel: Math.round((srcCues[n] - srcCues[b.simpan[0]]) * 1000) / 1000};
  });
  // contiguous?
  const idx = b.simpan.map((n) => sumber.findIndex((x) => x.name === n));
  idx.forEach((v, i) => { if (i && v !== idx[i - 1] + 1) throw new Error(`${b.proj}: scene ${b.simpan[i]} tidak berurutan`); });
  const dur = Math.round(bs.reduce((x, y) => x + y.d, 0) * 100) / 100;
  peta[b.id] = Object.fromEntries(bs.map((x) => [x.n, x.rel]));
  rencana.bab.push({k: b.k, id: b.id, scenes: bs, dur, end: NAMA_CATATAN(b.k), srcCues, judul: b.judul, sub: b.sub, off: b.off, catatan: b.catatan});
}
for (const u of urut) {
  if (u.kind === 'sumber') {
    const b = rencana.bab[u.bab - 1];
    scenes.push({name: u.name, dur: b.dur, desc: `Bab ${b.k}: ${b.judul}`});
  } else if (u.kind === 'judul') scenes.push({name: u.name, dur: DUR.Judul, desc: `Kartu judul bab ${u.bab}`});
  else if (u.kind === 'catatan') scenes.push({name: u.name, dur: DUR.Catatan, desc: `Catatan bab ${u.bab}: kenapa, salah umum, cek`});
  else scenes.push({name: u.name, dur: DUR[u.name], desc: u.name});
}
rencana.urut = scenes.map((s) => s.name);
writeFileSync(path.join(DIR, 'sumber', 'peta.json'), JSON.stringify(peta, null, 1));
rencana.akhirOff = AKHIR.filter((l) => l.sc === 'Tips').map((l) => l.off);
writeFileSync(path.join(SRC, 'rencana.js'), `window.PLAN = ${JSON.stringify(rencana)};\n`);

// 5. bab: transformasi jsx sumber
for (const b of BAB) {
  let t = readFileSync(path.join(SUMBER, b.proj, 'src', b.jsx), 'utf8');
  const cut = t.search(/\nfunction \w+Tutorial\(\) \{/);
  if (cut < 0) throw new Error(`pembungkus tidak ditemukan di ${b.jsx}`);
  t = t.slice(0, cut);
  if (/\bconst (useComposition|Captions)\b/.test(t)) throw new Error(`${b.jsx} mendefinisikan useComposition/Captions sendiri`);
  const pra = 'const useComposition = () => window.ChapterKit.useComposition();\nconst Captions = (p) => window.ChapterKit.Captions(p);\n';
  writeFileSync(path.join(SRC, `${b.id}.jsx`), `${pra}${t}\nwindow.CHAP_${b.id} = Piece;\n`);
  copyFileSync(path.join(SUMBER, b.proj, 'motion.config.mjs'), path.join(DIR, 'sumber', `${b.cfg}.config.mjs`));
}

// 6. bagian tulisan tangan
for (const f of ['kronik.jsx', 'bagian.jsx', 'panduan.jsx']) copyFileSync(path.join(DIR, 'bagian', f), path.join(SRC, f));

// 7. html
const impor = ['animations-v3.jsx', 'kronik.jsx', ...BAB.map((b) => `${b.id}.jsx`), 'bagian.jsx', 'panduan.jsx'].map((f) => `./${f}`).join(' ');
const json = JSON.stringify(scenes).replace(/'/g, '&#39;');
writeFileSync(path.join(SRC, HTML), `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<title>Panduan lengkap Feedback CAPI di Konektor</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=JetBrains+Mono:wght@400;500;600&amp;display=swap">
<style>html,body{margin:0;height:100%;background:#0B1120;overflow:hidden}a{color:#007AFF}a:hover{color:#0062CC}</style>
<script>window.OM_SCENES = '${json}';</script>
<script>window.OM_PLAYBACK = '{"mode":"loop"}';</script>
<script src="icons.js"></script>
<script src="rencana.js"></script>
</helmet>
<div style="position:fixed; inset:0; background:#0B1120;">
  <x-import component-from-global-scope="PanduanFeedbackCapi" from="${impor}" hint-size="100%,100%" style="position:absolute; inset:0;"></x-import>
</div>
</x-dc>
</body>
</html>
`);
const total = scenes.reduce((a, s) => a + s.dur, 0);
console.log(`src/ siap: ${scenes.length} scene, awal ${total.toFixed(1)} dtk (mesin memanjangkan sesuai VO)`);
