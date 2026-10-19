#!/usr/bin/env node
// Bangun src/ untuk video panduan panjang AI Agent dari 3 proyek tutorial 1 menit.
//   node bangun.mjs            (SUMBER_TUTORIAL = folder proyek/ yang memuat tutorial-agentic, -otomasi, -kalimat)
// Hasil: src/ (komposisi), sumber/*.config.mjs (salinan config untuk cue dan VO), sumber/peta.json.
// src/ dan aset/ tidak ikut git (aturan repo), jadi skrip ini yang menjamin komposisi bisa dibangun ulang.
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, existsSync, rmSync, statSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {PIECE, SRC, BAB, CATATAN, urutan, barisBaru, durBaru, DUR_JUDUL} from './jadwal.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const SUMBER = process.env.SUMBER_TUTORIAL || '/home/ramaaditya/Project/motion-engine/proyek';
const LOGO = process.env.LOGO_KONEKTOR || '/home/ramaaditya/Project/konektor/public/logo';
const SRCDIR = path.join(DIR, 'src');
const HTML = 'Panduan AI Agent.dc.html';

const RE_SCENES = /OM_SCENES\s*=\s*(["'])(\[[\s\S]*?\])\1\s*;/;
const bacaScenes = (f) => JSON.parse(readFileSync(f, 'utf8').match(RE_SCENES)[2].replace(/\\"/g, '"'));
const dcHtml = (p) => path.join(SUMBER, PIECE[p].proj, 'src', readdirSync(path.join(SUMBER, PIECE[p].proj, 'src')).find((f) => /\.dc\.html$/.test(f)));

rmSync(SRCDIR, {recursive: true, force: true});
mkdirSync(path.join(SRCDIR, 'assets'), {recursive: true});
mkdirSync(path.join(DIR, 'sumber'), {recursive: true});

// 1. berkas mesin (identik di semua tutorial)
const ag = path.join(SUMBER, PIECE.AG.proj, 'src');
for (const f of ['support.js', 'animations-v3.jsx']) copyFileSync(path.join(ag, f), path.join(SRCDIR, f));

// 2. ikon: gabungan semua sumber
const ikon = {};
for (const p of Object.values(PIECE)) {
  const w = {};
  vm.runInNewContext(readFileSync(path.join(SUMBER, p.proj, 'src', 'icons.js'), 'utf8'), {window: w});
  Object.assign(ikon, w.KICONS);
}
writeFileSync(path.join(SRCDIR, 'icons.js'), `window.KICONS = ${JSON.stringify(ikon)};\n`);

// 3. aset: gabungan, lalu logo asli Konektor menimpa
for (const p of Object.values(PIECE)) {
  const d = path.join(SUMBER, p.proj, 'src', 'assets');
  if (!existsSync(d)) continue;
  for (const f of readdirSync(d)) if (statSync(path.join(d, f)).isFile()) copyFileSync(path.join(d, f), path.join(SRCDIR, 'assets', f));
}
for (const f of ['icon_gradient.svg', 'logo200x50.png']) copyFileSync(path.join(LOGO, f), path.join(SRCDIR, 'assets', f));

// 4. tiap tutorial = satu Piece. srcCues = awal tiap scene sumber.
const piece = {}, sumberScenes = {};
for (const [pid, p] of Object.entries(PIECE)) {
  const sc = bacaScenes(dcHtml(pid));
  const srcCues = {}; let a = 0;
  for (const s of sc) { srcCues[s.name] = Math.round(a * 1000) / 1000; a += s.dur; }
  sumberScenes[pid] = sc;
  piece[pid] = {srcCues, segs: []};
}

// 5. potongan: scene sumber berurutan -> satu scene komposisi
const peta = {}, durSumber = {};
for (const sg of SRC) {
  const sc = sumberScenes[sg.piece];
  const idx = sg.simpan.map((n) => { const i = sc.findIndex((x) => x.name === n); if (i < 0) throw new Error(`scene ${n} tidak ada di ${sg.piece}`); return i; });
  idx.forEach((v, i) => { if (i && v !== idx[i - 1] + 1) throw new Error(`${sg.id}: scene ${sg.simpan[i]} tidak berurutan`); });
  const cues = piece[sg.piece].srcCues;
  const s0 = cues[sg.simpan[0]];
  peta[sg.id] = Object.fromEntries(sg.simpan.map((n) => [n, Math.round((cues[n] - s0) * 1000) / 1000]));
  const dur = Math.round(sg.simpan.reduce((x, n) => x + sc.find((y) => y.name === n).dur, 0) * 100) / 100;
  durSumber[sg.id] = dur;
  piece[sg.piece].segs.push({name: sg.id, s: s0, d: dur});
}
writeFileSync(path.join(DIR, 'sumber', 'peta.json'), JSON.stringify(peta, null, 1));

// 6. scene komposisi
const urut = urutan();
const baris = barisBaru();
const scenes = [], kind = {}, langsung = {};
urut.forEach((u, i) => {
  kind[u.name] = u.kind;
  if (u.kind === 'sumber' && i > 0 && urut[i - 1].kind === 'sumber') langsung[u.name] = true;
  let dur, desc;
  if (u.kind === 'sumber') { dur = durSumber[u.name]; desc = `Tutorial: ${SRC.find((s) => s.id === u.name).simpan.join(', ')}`; }
  else if (u.kind === 'judul') { dur = DUR_JUDUL; desc = `Kartu judul bab ${u.bab}`; }
  else if (u.kind === 'catatan') { dur = durBaru(u.name, baris[u.name]); desc = `Catatan bab ${u.bab}: kenapa, salah umum, cek`; }
  else { dur = durBaru(u.name, baris[u.name]); desc = u.name; }
  scenes.push({name: u.name, dur, desc});
});

const plan = {
  urut: scenes.map((s) => s.name), kind, langsung, piece,
  segNames: SRC.map((s) => s.id), bab: BAB, catatan: CATATAN, baru: baris,
};
writeFileSync(path.join(SRCDIR, 'rencana.js'), `window.PLAN = ${JSON.stringify(plan)};\n`);

// 7. Piece: transformasi jsx sumber (potong pembungkus, ganti useComposition/Captions)
const dipakai = new Set(SRC.map((s) => s.piece));
for (const [pid, p] of Object.entries(PIECE)) {
  if (!dipakai.has(pid)) continue;
  let t = readFileSync(path.join(SUMBER, p.proj, 'src', p.jsx), 'utf8');
  const cut = t.search(/\nfunction \w+Tutorial\(\) \{/);
  if (cut < 0) throw new Error(`pembungkus tidak ditemukan di ${p.jsx}`);
  t = t.slice(0, cut);
  if (/\bconst (useComposition|Captions)\b/.test(t)) throw new Error(`${p.jsx} mendefinisikan useComposition/Captions sendiri`);
  const pra = 'const useComposition = () => window.ChapterKit.useComposition();\nconst Captions = (p) => window.ChapterKit.Captions(p);\n';
  writeFileSync(path.join(SRCDIR, `${pid}.jsx`), `${pra}${t}\nwindow.PIECE_${pid} = Piece;\n`);
  // config sumber: untuk VO dan cue. Jalur import lafal bergeser satu tingkat.
  const cfg = readFileSync(path.join(SUMBER, p.proj, 'motion.config.mjs'), 'utf8').replace("'../../lib/lafal.mjs'", "'../../../lib/lafal.mjs'");
  writeFileSync(path.join(DIR, 'sumber', `${p.cfg}.config.mjs`), cfg);
}

// 8. bagian tulisan tangan
for (const f of ['kronik.jsx', 'bagian.jsx', 'panduan.jsx']) copyFileSync(path.join(DIR, 'bagian', f), path.join(SRCDIR, f));

// 9. html
const impor = ['animations-v3.jsx', 'kronik.jsx', ...[...dipakai].map((p) => `${p}.jsx`), 'bagian.jsx', 'panduan.jsx'].map((f) => `./${f}`).join(' ');
const json = JSON.stringify(scenes).replace(/'/g, '&#39;');
writeFileSync(path.join(SRCDIR, HTML), `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<title>Panduan lengkap AI Agent CRM di Konektor</title>
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
  <x-import component-from-global-scope="PanduanAiAgent" from="${impor}" hint-size="100%,100%" style="position:absolute; inset:0;"></x-import>
</div>
</x-dc>
</body>
</html>
`);
const total = scenes.reduce((a, s) => a + s.dur, 0);
console.log(`src/ siap: ${scenes.length} scene, awal ${total.toFixed(1)} dtk (mesin memanjangkan sesuai VO)`);
