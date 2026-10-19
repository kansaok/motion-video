/* Generate foto fashion abaya dari SATU foto produk (src/produk.jpg) lewat /responses +
   tool image_generation. Foto produk dikirim sebagai input_image di tiap permintaan, supaya
   abaya, hijab, dan wajah modelnya tetap sama. Pola dan jebakannya: IKLAN.md §5.
   Pakai: node proyek/abaya-iklan/gambar.mjs [kode...] */
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
const REF = 'data:image/jpeg;base64,' + readFileSync(path.join(HERE, 'src/produk.jpg')).toString('base64');

const BAJU = 'Use the attached photo as the exact product reference. Keep the SAME garment with every detail: '
  + 'black open-front abaya, two vertical lines of small silver crystal studs down both front edges, one diagonal '
  + 'crystal line from the left shoulder, two silver crystal butterfly brooches on the right chest, crystal butterfly '
  + 'appliques and a crystal band on both cuffs with a lilac chiffon inner cuff, matching black tie belt at the waist, '
  + 'and the same soft lilac chiffon hijab. Keep the same woman and face when she is visible. ';
const GAYA = ' Luxury modest fashion editorial photography, shot on medium format, natural skin, realistic fabric '
  + 'drape and crystal sparkle, refined warm color grade with deep blacks and soft lilac accents, '
  + 'no text, no letters, no logos, no watermark.';
const P = '1024x1536', L = '1536x1024';

// kode, ukuran, lebar maksimum di disk, prompt adegan.
const TUGAS = [
  ['gurun', P, 1080, 'Full-length shot of her standing on a golden sand dune at sunset, wind lifting the abaya hem and the hijab, long warm shadow, wide sky.'],
  ['lobi', P, 1080, 'She walks toward the camera through a grand white marble hotel lobby with tall arches and warm brass chandeliers, mid-stride, the front edges of the abaya swinging open.'],
  ['kupu', P, 1080, 'Extreme macro close-up of the two crystal butterfly brooches on the black fabric of the right chest, every crystal catching light, very shallow depth of field, dark background.'],
  ['lengan', P, 1080, 'Close-up of one cuff and her hand holding a small pearl beaded clutch, the crystal butterfly applique and the lilac chiffon inner cuff in sharp focus, soft window light.'],
  ['senja', P, 1080, 'Rooftop terrace at blue hour above a city skyline, she looks back over her shoulder, warm city lights as soft bokeh behind her, elegant evening mood.'],
  ['studio', P, 1080, 'Full-length studio portrait on a seamless soft lilac paper backdrop, confident pose with one hand on the belt, crisp hard key light and a clean shadow on the backdrop.'],
  ['putar', P, 1080, 'She spins in place in an empty sunlit courtyard with a cream stone floor, the abaya flaring out in a full circle, slight motion blur on the hem, joyful candid moment.'],
  ['flatlay', P, 1080, 'Top-down flat lay with no person: the abaya neatly laid on cream linen with the folded lilac hijab, the pearl clutch, nude heels with crystal buckles, and a small sprig of dried flowers.'],
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
  const out = path.join(DIR, `${kode}.jpg`), prompt = BAJU + isi + GAYA;
  const kunci = JSON.stringify({prompt, size, maks});
  if (existsSync(out) && existsSync(`${out}.kunci`) && readFileSync(`${out}.kunci`, 'utf8') === kunci) return;
  const j = await post({model: DRIVER, input: [{role: 'user', content: [
    {type: 'input_image', image_url: REF}, {type: 'input_text', text: prompt}]}],
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
const gagal = [];
for (let i = 0; i < semua.length; i += 4) {
  await Promise.all(semua.slice(i, i + 4).map((t) => buat(t).catch((e) => gagal.push(`${t[0]}: ${e.message.slice(0, 200)}`))));
}
if (gagal.length) { console.error('gagal:\n  ' + gagal.join('\n  ')); process.exit(1); }
