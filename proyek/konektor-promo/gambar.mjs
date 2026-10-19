/* Generate gambar untuk "Apa itu Konektor?" lewat /responses + tool image_generation.
   Plate latar dari brief (src/prompt.md, "Prompt gambar"), ditambah foto per era untuk ubin
   dashboard. Satu klausa GAYA untuk seluruh set. Pola dan jebakannya: IKLAN.md §5.
   Pakai: node proyek/konektor-promo/gambar.mjs [kode...] */
import {writeFileSync, readFileSync, existsSync, unlinkSync, mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import '../../lib/env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, 'src/img');
const BASE = process.env.AI_BASE_URL, KEY = process.env.AI_API_KEY;
const DRIVER = process.env.MOTION_IMAGE_DRIVER || 'cx/gpt-5.6-sol';
if (!KEY) throw new Error('AI_API_KEY belum ada di .env');

const GAYA = ' Cinematic still, moody low-key lighting, deep near-black #07090C shadows with cool blue #007AFF '
  + 'and a touch of soft green #61D100, shallow depth of field, subtle 35mm film grain, premium technology '
  + 'documentary look, no text, no letters, no numbers, no logos, no brand marks, no watermark.';
const L = '1536x1024', K = '1024x1024';

// kode, ukuran, lebar maksimum di disk, prompt. Ubin tampil ±515 px, jadi 720 px cukup.
const TUGAS = [
  ['bg-plate', L, 1920, 'Abstract dark background plate with no objects, soft diffused blue glow at the upper center, a very faint green glow at the lower right, natural vignette, smooth gradients.'],
  ['dust-plate', L, 1920, 'Macro shot of fine dust particles floating in a pitch black room, three depth layers, soft round bokeh in front, sharp particles in the middle, cold rim light from the upper left, pure black background for screen blending.'],
  ['lock-hero', L, 1920, 'Photorealistic single closed padlock floating in darkness at the center, matte graphite metal, soft top key light, thin blue rim light on the right edge, slight low angle, lots of empty space around it.'],
  ['light-rays', L, 1920, 'Soft volumetric light rays radiating from one central point in pure black space, cyan and blue rays at the top, green and lime rays at the bottom, an empty dark circle in the exact center, subtle haze.'],
  ['endcard-glow', L, 1920, 'Minimal end card background, a thin soft horizontal band of light at 30 percent from the top, blue in the center fading to green at both ends, the bottom third completely dark and empty.'],
  ['pemilik-toko', L, 1536, 'An Indonesian small online shop owner seen from behind over the shoulder at a cluttered packing desk at night, lit only by a smartphone screen full of glowing unread chat bubbles, cardboard boxes around, tired mood, face not visible.'],
  ['era-2000', K, 720, 'A late 1990s beige desktop computer with a bulky CRT monitor glowing blue in a dark room, a glowing search box on the screen out of focus, nostalgic.'],
  ['era-2007', K, 720, 'A 2007 era silver laptop on a wooden desk at night, the screen glow lighting two hands on the keyboard, a social feed out of focus on the screen.'],
  ['era-2013', K, 720, 'A crowd of people on a city street at night seen from high above, a few figures softly glowing green and many others glowing blue, audience targeting concept.'],
  ['era-2015', K, 720, 'Close-up of a hand holding a payment card next to a laptop with a glowing online shopping cart screen out of focus, night.'],
  ['era-2016', K, 720, 'A dark marketing control room with several monitors showing abstract glowing bar charts and sliders, no people in focus.'],
  ['era-2021', K, 720, 'A smartphone lying on a dark table with a bright blank pop-up dialog glowing on its screen, cold light, tension.'],
  ['era-2022', K, 720, 'Abstract automation concept, glowing mechanical gears and circuit traces turning on their own, blue light.'],
  ['era-2024', K, 720, 'Macro shot of a glowing cable plug connecting into a socket on a computer chip, small blue and green sparks.'],
  ['era-2026', K, 720, 'A futuristic holographic analytics display with glowing bars and a green scanning line floating above a dark desk.'],
  ['chat-gelap', K, 720, 'A smartphone lying face up in darkness, its screen dim grey with many faint unread chat notification bubbles, lonely and cold, desaturated.'],
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

async function buat([kode, size, maks, isi]) {
  const out = path.join(DIR, `${kode}.jpg`), prompt = isi + GAYA;
  const kunci = JSON.stringify({prompt, size, maks});
  if (existsSync(out) && existsSync(`${out}.kunci`) && readFileSync(`${out}.kunci`, 'utf8') === kunci) return;
  const j = await post({model: DRIVER, input: [{role: 'user', content: [{type: 'input_text', text: prompt}]}],
    tools: [{type: 'image_generation', quality: 'high', size}]});
  const call = (j.output || []).find((o) => o.type === 'image_generation_call');
  if (!call?.result) throw new Error(`${kode}: respons tanpa image_generation_call.result`);
  const png = `${out}.png`;
  writeFileSync(png, Buffer.from(call.result, 'base64'));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-vf', `scale='min(${maks},iw)':-2:flags=lanczos`, '-q:v', '3', out]);
  unlinkSync(png);
  writeFileSync(`${out}.kunci`, kunci);
  process.stderr.write(`  ${kode} ✓\n`);
}

mkdirSync(DIR, {recursive: true});
const minta = process.argv.slice(2);
const semua = TUGAS.filter(([k]) => !minta.length || minta.includes(k));
for (let i = 0; i < semua.length; i += 6) await Promise.all(semua.slice(i, i + 6).map(buat));
