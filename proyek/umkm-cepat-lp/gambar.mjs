/* Generate foto seblak + avatar untuk landing page di dalam video, lewat /responses + tool
   image_generation. Pola dan jebakannya sama dengan proyek/kelas-ctwa-rahasia/gambar.mjs;
   lihat IKLAN.md §5. Pakai: node gambar.mjs [kode...] */
import {writeFileSync, readFileSync, existsSync, unlinkSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import '../../lib/env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, 'src/assets');
const BASE = process.env.AI_BASE_URL, KEY = process.env.AI_API_KEY;
const DRIVER = process.env.MOTION_IMAGE_DRIVER || 'cx/gpt-5.6-sol';
if (!KEY) throw new Error('AI_API_KEY belum ada di .env');

// Satu klausa gaya untuk seluruh set, supaya terbaca sebagai satu merek (IKLAN.md §5).
const GAYA = ' Professional food photography, Indonesian street food, warm moody lighting, shallow depth of field, '
  + 'rich saturated reds, appetizing, high detail, no text, no watermark, no logos.';
const TOPPING = (isi) => `Small white bowl of ${isi}, isolated on warm beige background, soft side light, 45 degree angle.${GAYA}`;

// maks = 2x kotaknya di komposisi. Gambar 2 MB membuat Chromium di mesin render crash.
const TUGAS = [
  {kode: 'seblak-hero', maks: 1400, size: '1536x1024', prompt:
    'Top-down close-up of a large bowl of Indonesian seblak prasmanan with bright red spicy broth, kerupuk, '
    + 'bakso, ceker, makaroni, sliced sosis, boiled egg, chili flakes and fresh green onion, steam rising, dark '
    + 'wooden table, dark red background. The bowl sits in the lower half; the upper center is calm dark space.' + GAYA},
  {kode: 'topping-ceker', maks: 600, size: '1536x1024', prompt: TOPPING('braised chicken feet (ceker) in red spicy sauce')},
  {kode: 'topping-bakso', maks: 600, size: '1536x1024', prompt: TOPPING('Indonesian beef meatballs (bakso), some halved, glossy')},
  {kode: 'topping-makaroni', maks: 600, size: '1536x1024', prompt: TOPPING('elbow macaroni cooked in red seblak sauce')},
  {kode: 'topping-sosis', maks: 600, size: '1536x1024', prompt: TOPPING('sliced sausages with crosshatch cuts, lightly fried')},
  {kode: 'topping-kerupuk', maks: 600, size: '1536x1024', prompt: TOPPING('soaked colorful Indonesian kerupuk crackers, soft and chewy')},
  {kode: 'topping-telur', maks: 600, size: '1536x1024', prompt: TOPPING('scrambled egg in spicy red broth')},
  {kode: 'avatar-bu-rina', maks: 256, size: '1024x1024', prompt:
    'Friendly Indonesian woman in her 40s wearing a hijab, small food stall owner, smiling, casual selfie '
    + 'portrait, soft daylight, plain background, photorealistic, no text, no watermark.'},
  {kode: 'avatar-kamu', maks: 256, size: '1024x1024', prompt:
    'Young Indonesian man in his mid 20s, freelance web designer, casual black t-shirt, playful knowing smile, '
    + 'casual selfie portrait, soft warm light, plain dark background, photorealistic, no text, no watermark.'},
];

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
  process.stderr.write(`  ${t.kode} ✓ ${(readFileSync(out).length / 1024).toFixed(0)} KB\n`);
}

const minta = process.argv.slice(2);
const hasil = await Promise.allSettled(TUGAS.filter((t) => !minta.length || minta.includes(t.kode)).map(buat));
for (const h of hasil) if (h.status === 'rejected') process.stderr.write(`  ✖ ${h.reason.message}\n`);
