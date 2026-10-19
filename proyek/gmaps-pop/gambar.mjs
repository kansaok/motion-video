/* Generate 18 foto usaha (3 per usaha) lewat /responses + tool image_generation.
   Prompt dibaca langsung dari brief (src/prompts/V02-gmaps-pop/prompt.md, bagian "1. Gambar"),
   ditambah klausa gaya bersama dari brief yang sama. Pola dan jebakannya: IKLAN.md §5.
   Pakai: node gambar.mjs [usaha...] */
import {writeFileSync, readFileSync, existsSync, unlinkSync, mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import '../../lib/env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, 'src/media/v02-gmaps');
const BASE = process.env.AI_BASE_URL, KEY = process.env.AI_API_KEY;
const DRIVER = process.env.MOTION_IMAGE_DRIVER || 'cx/gpt-5.6-sol';
if (!KEY) throw new Error('AI_API_KEY belum ada di .env');

const brief = readFileSync(path.join(HERE, 'src/prompts/V02-gmaps-pop/prompt.md'), 'utf8');
const GAYA = ' Bright candid smartphone photo look, natural daylight, warm cream and amber tones with a touch of '
  + 'deep teal, clean composition, Indonesian small business, realistic, no people\'s faces in focus, '
  + 'no text, no signage lettering, no logos, no watermark.';
const JENIS = [['depan', '1024x1024'], ['layanan', '1536x1024'], ['interior', '1536x1024']];

function tugas(usaha) {
  const bagian = brief.split(`### ${usaha}\n`)[1].split(/\n### |\n---/)[0];
  const blok = [...bagian.matchAll(/```\n([\s\S]*?)\n\s*```/g)].map((m) => m[1].replace(/\s+/g, ' ').trim());
  if (blok.length !== 3) throw new Error(`${usaha}: ${blok.length} prompt, harus 3`);
  // Foto tampil paling besar 220 px di layar; 480 px cukup untuk zoom dan jauh dari batas crash.
  return JENIS.map(([k, size], i) => ({kode: `v02-img0${i + 1}-${usaha}-${k}`, size, maks: 480, prompt: blok[i] + GAYA}));
}

async function post(badan, coba = 3) {
  for (let i = 0; ; i++) {
    try {
      const r = await fetch(`${BASE}/responses`, {method: 'POST',
        headers: {Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json'}, body: JSON.stringify(badan)});
      const teks = await r.text();
      if (!r.ok) throw new Error(`${r.status} ${teks.slice(0, 300)}`);
      return JSON.parse(teks);
    } catch (e) {
      if (i >= coba) throw e;
      process.stderr.write(`    ulang ${i + 1}/${coba}: ${e.message.slice(0, 120)}\n`);
      await new Promise((s) => setTimeout(s, 2000 * 2 ** i));
    }
  }
}

async function buat(t) {
  const out = path.join(DIR, `${t.kode}.jpg`);
  const kunci = JSON.stringify({p: t.prompt, s: t.size, maks: t.maks});
  if (existsSync(out) && existsSync(`${out}.kunci`) && readFileSync(`${out}.kunci`, 'utf8') === kunci) return;
  const j = await post({model: DRIVER, input: [{role: 'user', content: [{type: 'input_text', text: t.prompt}]}],
    tools: [{type: 'image_generation', quality: 'high', size: t.size}]});
  const call = (j.output || []).find((o) => o.type === 'image_generation_call');
  if (!call?.result) throw new Error(`${t.kode}: respons tanpa image_generation_call.result`);
  const png = `${out}.png`;
  writeFileSync(png, Buffer.from(call.result, 'base64'));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-vf', `scale='min(${t.maks},iw)':-2:flags=lanczos`, '-q:v', '3', out]);
  unlinkSync(png);
  writeFileSync(`${out}.kunci`, kunci);
  process.stderr.write(`  ${t.kode} ✓\n`);
}

mkdirSync(DIR, {recursive: true});
const minta = process.argv.slice(2);
const usaha = minta.length ? minta : ['gigi', 'kecantikan', 'restoran', 'bengkel', 'barbershop', 'kopi'];
const semua = usaha.flatMap(tugas);
// Enam sekaligus: gateway sanggup, dan 18 berurutan memakan belasan menit.
for (let i = 0; i < semua.length; i += 6) await Promise.all(semua.slice(i, i + 6).map(buat));
