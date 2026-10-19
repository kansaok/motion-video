#!/usr/bin/env node
// Build a YouTube subtitle file (SRT) from a project's VO script and timeline.
// Start of a VO line = start of its scene + its `off`; end = start + length of aset/vo/vo-NN.mp3.
// Long lines are split at sentence or comma boundaries; time is shared by character count.
// Usage: node bin/srt.mjs proyek/<name>   ->  proyek/<name>/<keluaran>.id.srt
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {pathToFileURL} from 'node:url';

const dir = resolve(process.argv[2]);
const cfg = (await import(pathToFileURL(join(dir, 'motion.config.mjs')).href)).default;
const timeline = JSON.parse(readFileSync(join(dir, 'timeline.json'), 'utf8'));
const start = {}; let t = 0;
for (const s of timeline) { start[s.name] = t; t += s.dur; }

const dur = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const ts = (x) => { const ms = Math.round(x * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };

// Split text into chunks of at most ~84 characters (two lines of 42).
const chunks = (text) => {
  const parts = text.split(/(?<=[.!?])\s+/).map((p) => p.trim()).filter(Boolean); // keep konektor.id whole
  const out = [];
  for (const p of parts) {
    if (p.length <= 84) { out.push(p); continue; }
    let cur = '';
    for (const w of p.split(/(?<=,)\s+/)) { if ((cur + ' ' + w).trim().length > 84 && cur) { out.push(cur.trim()); cur = w; } else cur = (cur + ' ' + w).trim(); }
    if (cur) out.push(cur);
  }
  return out;
};
const wrap = (s) => { if (s.length <= 42) return s; const mid = s.lastIndexOf(' ', Math.ceil(s.length / 2) + 6); return mid > 0 ? s.slice(0, mid) + '\n' + s.slice(mid + 1) : s; };

const cues = [];
for (const v of cfg.vo) {
  if (!(v.sc in start)) throw new Error(`scene ${v.sc} not in timeline.json`);
  const f = join(dir, 'aset', 'vo', `vo-${String(v.no).padStart(2, '0')}.mp3`);
  if (!existsSync(f)) throw new Error(`missing ${f}`);
  const a = start[v.sc] + (v.off ?? 0), len = dur(f);
  const cs = chunks(v.text), total = cs.reduce((n, c) => n + c.length, 0);
  let s = a;
  for (const c of cs) { const d = len * c.length / total; cues.push([s, s + d, c]); s += d; }
}
const srt = cues.map(([a, b, c], i) => `${i + 1}\n${ts(a)} --> ${ts(b)}\n${wrap(c)}\n`).join('\n');
const out = join(dir, cfg.keluaran.replace(/\.mp4$/, '') + '.id.srt');
writeFileSync(out, srt);
console.log(out, cues.length, 'cues, last ends', ts(cues.at(-1)[1]), 'timeline', t.toFixed(2), 's');
