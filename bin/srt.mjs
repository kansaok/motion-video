#!/usr/bin/env node
// Subtitle untuk proyek yang sudah dirender: node bin/srt.mjs proyek/<nama>
// -> <keluaran>.<bahasa>.srt, .vtt, dan <keluaran>-naskah.txt di folder proyek.
// `motion render` sudah menulisnya sendiri; skrip ini untuk proyek lama atau menulis ulang.
// Logika ada di lib/subtitel.mjs (posisi baris dari `tata`, sama dengan mixer).
import path from 'node:path';
import * as Pipa from '../lib/pipa.mjs';

const c = await Pipa.muat(path.resolve(process.argv[2] || process.cwd()));
const s = Pipa.tulisSubtitel(c);
console.log(`${s.srt}\n${s.vtt}\n${s.naskah}\n${s.isyarat} isyarat`);
