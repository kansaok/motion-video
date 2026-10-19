/* Generate delapan gambar aset untuk Reels PKRT lewat 9Router (/v1/responses + tool
   image_generation). Jalur /v1/images/edits mati di gateway; jalur responses terbukti
   membawa reference image, dan reference itu yang menjaga pemilik UMKM tetap orang yang
   sama di scene Momentum dan Penutup.

   Cache dikunci ke PROMPT-nya lewat `.kunci`, sama seperti aset audio: prompt yang diubah
   meregenerate gambarnya sendiri. Tanpa itu satu putaran revisi hilang tanpa jejak.

   Pakai: node gambar.mjs [kode...]   (tanpa argumen = semua yang belum segar) */
import {writeFileSync, readFileSync, existsSync, mkdirSync, unlinkSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import '../../lib/env.mjs';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'src/assets/video');
const BASE = process.env.AI_BASE_URL, KEY = process.env.AI_API_KEY;
const DRIVER = process.env.MOTION_IMAGE_DRIVER || 'cx/gpt-5.6-sol';
if (!KEY) throw new Error('AI_API_KEY belum ada di .env');

/* Satu klausa gaya untuk SELURUH set. Delapan gambar yang masing-masing punya suhu warna
   sendiri terbaca sebagai delapan stok foto, bukan sebagai satu iklan. */
const GAYA = 'Warm natural daylight photography, soft diffused light from the left, '
  + 'cream and warm-neutral palette matching a friendly Indonesian small-business brand, '
  + 'shallow depth of field, clean and uncluttered, photorealistic, no text overlay, '
  + 'no watermark, no logo of any real brand.';

/* Merek fiktif dipakai konsisten di semua produk: label yang berganti-ganti nama antar
   frame terbaca sebagai produk yang berbeda-beda, bukan sebagai satu lini produk. */
const MEREK = 'The product label reads "LEMONA" in a simple modern sans-serif with a small '
  + 'lemon icon. It is a fictional brand; do not use any real-world brand identity.';

const PRODUK_SET = 'Studio product shot on a pure white seamless background, straight-on '
  + 'eye-level angle, object centered and fully inside the frame with even margins, '
  + 'soft shadow directly under the object, e-commerce catalog style. '
  + 'The object height fills about 80% of the frame.';

const ORANG = 'The same Indonesian woman in her early 30s, warm brown skin, shoulder-length '
  + 'black hair tied back, wearing a mustard-yellow short-sleeve shirt over a white tee. '
  + 'Friendly, genuine, unposed expression.';

const TUGAS = [
  {kode: 'prod-01', maks: 1000, size: '1536x1024', prompt:
    `A single 800 ml dish-washing liquid bottle, translucent yellow-green soap visible inside, `
    + `pump cap. ${MEREK} ${PRODUK_SET} ${GAYA}`},

  {kode: 'owner-01', maks: 820, size: '1024x1536', ref: null, prompt:
    `${ORANG} She stands at a wooden table in a small home warehouse, smiling while taping shut `
    + `a brown cardboard parcel. Stacked boxes and rolls of tape behind her, slightly out of focus. `
    + `Vertical portrait, waist-up, she is in the upper two thirds of the frame. ${GAYA}`},

  {kode: 'pack-01', maks: 620, size: '1024x1024', prompt:
    `A neat stack of six brown cardboard parcels wrapped and sealed, white shipping labels `
    + `clearly visible on the top two boxes, standing on a pale wooden floor of a small home `
    + `warehouse. Slight three-quarter angle. ${GAYA}`},

  {kode: 'prod-02', maks: 460, size: '1024x1536', prompt:
    `A single 800 ml dish-washing liquid bottle, translucent yellow-green soap inside, pump cap, `
    + `standing upright, straight-on eye-level angle. ${MEREK} `
    + `${PRODUK_SET} ${GAYA}`},

  {kode: 'prod-03', maks: 460, size: '1024x1536', ref: 'prod-02', prompt:
    `A single stand-up laundry detergent refill pouch with a spout cap, matte plastic, `
    + `pale blue-and-white packaging, standing upright, straight-on eye-level angle. ${MEREK} `
    + `${PRODUK_SET} `
    + `Same lighting direction, same camera height and same object height as the reference `
    + `image, so the three products can stand side by side. ${GAYA}`},

  {kode: 'prod-04', maks: 460, size: '1024x1536', ref: 'prod-02', prompt:
    `A single 500 ml disinfectant spray bottle with a white trigger sprayer, clear liquid inside, `
    + `standing upright, straight-on eye-level angle. ${MEREK} `
    + `${PRODUK_SET} `
    + `Same lighting direction, same camera height and same object height as the reference `
    + `image, so the three products can stand side by side. ${GAYA}`},

  {kode: 'shop-01', maks: 1120, size: '1536x1024', prompt:
    `A tidy minimarket shelf seen straight on, three rows of household cleaning products — `
    + `dish soap bottles, detergent pouches and spray bottles — neatly faced and evenly spaced. `
    + `Bright clean store lighting, price rails on the shelf edges but no readable text. `
    + `Wide horizontal composition. ${GAYA}`},

  {kode: 'owner-02', maks: 460, size: '1024x1024', ref: 'owner-01', prompt:
    `${ORANG} Head-and-shoulders portrait, she holds a dish-washing liquid bottle in one hand `
    + `near her chest and gives a thumbs up with the other, smiling straight at the camera. `
    + `Her face is centered in the frame with even margins on all sides, because the image will `
    + `be cropped into a circle. Same person, same clothing and same lighting as the reference `
    + `image. Softly blurred warm home-warehouse background. ${GAYA}`},
];

const post = async (badan, coba = 3) => {
  for (let i = 0; ; i++) {
    try {
      const r = await fetch(`${BASE}/responses`, {
        method: 'POST',
        headers: {Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json'},
        body: JSON.stringify(badan),
      });
      const teks = await r.text();
      if (!r.ok) throw new Error(`${r.status} ${teks.slice(0, 300)}`);
      return JSON.parse(teks);
    } catch (e) {
      if (i >= coba) throw e;
      process.stderr.write(`    ulang ${i + 1}/${coba}: ${e.message.slice(0, 120)}\n`);
      await new Promise((s) => setTimeout(s, 2000 * 2 ** i));
    }
  }
};

async function buat(t) {
  const out = path.join(DIR, `${t.kode}.png`);
  const kunci = JSON.stringify({p: t.prompt, s: t.size, maks: t.maks, ref: t.ref || null});
  if (existsSync(out) && existsSync(`${out}.kunci`) && readFileSync(`${out}.kunci`, 'utf8') === kunci) {
    process.stderr.write(`  ${t.kode} — sudah segar, dilewati\n`);
    return;
  }
  const isi = [{type: 'input_text', text: t.prompt}];
  if (t.ref) {
    const f = path.join(DIR, `${t.ref}.png`);
    if (!existsSync(f)) throw new Error(`${t.kode} butuh referensi ${t.ref} yang belum ada`);
    isi.push({type: 'input_image', image_url: `data:image/png;base64,${readFileSync(f).toString('base64')}`});
  }
  // Latar transparan DITOLAK gateway ("Transparent background is not supported for this
  // model"). Ketiga produk toh dipasang di dalam kartu putih membulat di komposisi, jadi
  // foto katalog berlatar putih terbaca sebagai listing marketplace — bukan sebagai potongan.
  const alat = {type: 'image_generation', quality: 'high', size: t.size};
  /* `model` di sini adalah DRIVER-nya, bukan model gambarnya: gambar dibuat oleh tool
     `image_generation`, dan gateway menolak model gambar dipasang di slot ini
     ("gpt-5.5-image is not supported"). Driver murah sudah cukup. */
  const j = await post({model: DRIVER, input: [{role: 'user', content: isi}], tools: [alat]});
  const call = (j.output || []).find((o) => o.type === 'image_generation_call');
  if (!call?.result) throw new Error(`${t.kode}: respons tanpa image_generation_call.result`);
  writeFileSync(out, Buffer.from(call.result, 'base64'));
  /* Diperkecil ke ukuran kotaknya di komposisi (2x, untuk zoom scene). Generator selalu
     mengembalikan 1024x1536 sekitar 2 MB, sementara tiga kartu produk cuma 300x300 di
     layar. Dibiarkan sebesar itu, tab Chromium di mesin render CRASH sebelum satu frame
     pun keluar — "Target crashed", tanpa satu pun galat JavaScript yang menjelaskannya. */
  const kecil = `${out}.kecil.png`;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', out,
    '-vf', `scale='min(${t.maks},iw)':-2:flags=lanczos`, kecil]);
  writeFileSync(out, readFileSync(kecil));
  unlinkSync(kecil);
  writeFileSync(`${out}.kunci`, kunci);
  process.stderr.write(`  ${t.kode} ✓ ${(readFileSync(out).length / 1024).toFixed(0)} KB\n`);
}

mkdirSync(DIR, {recursive: true});
const minta = process.argv.slice(2);
// Berurutan, bukan paralel: prod-03/04 dan owner-02 memakai berkas yang baru saja ditulis
// langkah sebelumnya sebagai referensi.
for (const t of TUGAS) {
  if (minta.length && !minta.includes(t.kode)) continue;
  await buat(t);
}
