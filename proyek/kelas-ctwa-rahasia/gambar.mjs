/* Generate V1 (hook) dan V2 (Wulan berbisik) lewat /responses + tool image_generation.
   Pola dan jebakannya sama dengan proyek/perizindo-pkrt/gambar.mjs; lihat IKLAN.md §5.
   Pakai: node gambar.mjs [kode...] */
import {writeFileSync, readFileSync, existsSync, unlinkSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import '../../lib/env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, 'src/media');
const BASE = process.env.AI_BASE_URL, KEY = process.env.AI_API_KEY;
const DRIVER = process.env.MOTION_IMAGE_DRIVER || 'cx/gpt-5.6-sol';
if (!KEY) throw new Error('AI_API_KEY belum ada di .env');

const TUGAS = [
  {kode: 'v1-hook', maks: 1416, size: '1536x1024', prompt:
    'Editorial photo, top-down view of a glossy agency meeting table at night. In the center, a thick '
    + 'manila folder closed with a heavy brass padlock. The folder tab has a printed label that reads '
    + '"ctwa_clid" in monospace type. Around it: laptops turned away from camera, coffee cups, a pitch '
    + 'deck printout face down. Cinematic teal and warm amber lighting (#0b605a shadows, #e6a93c '
    + 'highlights), shallow depth of field, sharp focus on the padlock and label. Playful, curious mood, '
    + 'no people, no faces, no logos, no other text anywhere.'},
  // Referensi wajah dikirim sebagai input_image: deskripsi teks saja membuat wajahnya berubah.
  {kode: 'v2-wulan-bisik', maks: 1080, size: '1024x1536', ref: path.join(HERE, 'src/img/wulan.webp'), prompt:
    'Vertical portrait photo. The young Indonesian woman from the reference image, same face, same '
    + 'mustard yellow hijab, leans slightly toward the camera like she is about to share a secret. '
    + 'One hand raised beside her mouth as if whispering, playful knowing smile, eyes looking at the viewer. '
    + 'Background: smooth teal to amber gradient, soft studio light. Medium close-up, her face sits in '
    + 'the upper 45% of the frame, the lower 40% is calm background and shoulders only. '
    + 'Photorealistic, natural skin, no text, no logos, no watermark.'},
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
  const kunci = JSON.stringify({p: t.prompt, s: t.size, maks: t.maks, ref: !!t.ref});
  if (existsSync(out) && existsSync(`${out}.kunci`) && readFileSync(`${out}.kunci`, 'utf8') === kunci) return;
  const isi = [{type: 'input_text', text: t.prompt}];
  if (t.ref) {
    // Foto Wulan cuma 192 px dan berformat webp; diperbesar ke PNG 768 px sebelum dikirim.
    const refPng = `${out}.ref.png`;
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', t.ref, '-vf', 'scale=768:768:flags=lanczos', refPng]);
    isi.push({type: 'input_image', image_url: `data:image/png;base64,${readFileSync(refPng).toString('base64')}`});
    unlinkSync(refPng);
  }
  const j = await post({model: DRIVER, input: [{role: 'user', content: isi}],
    tools: [{type: 'image_generation', quality: 'high', size: t.size}]});
  const call = (j.output || []).find((o) => o.type === 'image_generation_call');
  if (!call?.result) throw new Error(`${t.kode}: respons tanpa image_generation_call.result`);
  const png = `${out}.png`;
  writeFileSync(png, Buffer.from(call.result, 'base64'));
  // Diperkecil ke kotaknya: gambar 2 MB membuat tab Chromium di mesin render crash (IKLAN.md §5).
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-vf', `scale='min(${t.maks},iw)':-2:flags=lanczos`, '-q:v', '3', out]);
  unlinkSync(png);
  writeFileSync(`${out}.kunci`, kunci);
  process.stderr.write(`  ${t.kode} ✓ ${(readFileSync(out).length / 1024).toFixed(0)} KB\n`);
}

const minta = process.argv.slice(2);
await Promise.all(TUGAS.filter((t) => !minta.length || minta.includes(t.kode)).map(buat));
