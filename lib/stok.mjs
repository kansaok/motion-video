// Stok SFX: semua bunyi yang pernah digenerate (motion-engine + rama-animation) dalam satu folder.
// `bangun()` mengumpulkan ulang; `cari()` dan `salin()` dipakai agent sebelum minta generate baru.
import {readFileSync, writeFileSync, existsSync, readdirSync, copyFileSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import {AKAR} from './env.mjs';
import {durasi} from './ff.mjs';

export const DIR = path.join(AKAR, 'sfx-stok');
const KATALOG = path.join(DIR, 'katalog.json');
const PROJECT = path.join(os.homedir(), 'Project');
const ANIM = path.join(PROJECT, 'rama-animation');

/* Kata kunci (nama + prompt) -> kategori + cocok untuk. Satu bunyi boleh masuk beberapa kategori. */
/** @type {Array<[string, RegExp, string]>} */
const ATURAN = [
  ['whoosh',   /\b(whoosh|swish|sweep|swoosh|air pass)/i,               'transisi antar scene, gerak kamera, kartu/panel meluncur; ikuti arah gerak visual'],
  ['riser',    /\b(riser|rising|charge|build[- ]?up|crescendo|swell|antisipasi)/i, 'antisipasi sebelum reveal, hitung mundur, menuju titik puncak; akhiri tepat di reveal'],
  ['impact',   /\b(impact|hit|boom|slam|thud|punch|stinger|drop|hentak)/i, 'penekanan fakta/angka besar, reveal, punchline, logo; pakai hemat'],
  ['pop-klik', /\b(pop|click|klik|tick|tik|blip|snap|tap|toggle|switch|bubble|ping)/i, 'UI kecil: tombol, chip, badge, ikon muncul, centang, kartu mendarat'],
  ['chime',    /\b(chime|bell|sparkle|shimmer|ding|success|glockenspiel|harp|twinkle)/i, 'sukses, logo, hadiah, hasil positif, CTA hangat'],
  ['digital',  /\b(glitch|digital|data|beep|error|static|electric|cyber|scan|hum|neon|buzz)/i, 'error, sistem/AI/data, gangguan, tema teknologi'],
  ['kertas',   /\b(paper|kertas|page|flip|tear|scribble|marker|pen|write|ketik|type|keyboard|stamp|stempel)/i, 'dokumen, catatan, coretan, tulisan, mengetik, cap'],
  ['angka',    /\b(counter|count|angka|digit|roll|coin|cash|kasir|register|uang|money)/i, 'angka naik/turun, penghitung, uang, hasil bisnis'],
  ['gerak',    /\b(step|foot|door|pintu|cloth|rustle|slide|scrape|drag|walk|jump|bounce|fall|drop)/i, 'aksi fisik karakter/objek: langkah, pintu, kain, benda jatuh atau memantul'],
  ['ambient',  /\b(ambient|room|air|wind|hiss|dust|pad|drone|tone|texture|dengung|tail|fade|rain|water|ripple)/i, 'latar/tekstur, penutup, adegan tenang, ekor akhir video'],
  ['mundur',   /\b(reverse|rewind|tape|flashback|burn|stop)/i,           'flashback, recap, memutus ekspektasi, koreksi'],
  ['emosi',    /\b(heartbeat|pulse|sigh|gasp|laugh|cheer|crowd|tense|horror|ominous|dread|jantung)/i, 'ketegangan, jantung berdebar, reaksi, horor/drama'],
];

const tandai = (teks) => {
  const k = ATURAN.filter(([, re]) => re.test(teks));
  return {kategori: k.map((x) => x[0]), cocok: k.map((x) => x[2])};
};

const md5 = (f) => createHash('md5').update(readFileSync(f)).digest('hex');
const walk = (d, out = []) => {
  if (!existsSync(d)) return out;
  for (const e of readdirSync(d, {withFileTypes: true})) {
    if (['node_modules', 'norm', '.git'].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(mp3|wav)$/i.test(e.name) && !e.name.startsWith('.') && !/^(preview|sfx\.)/i.test(e.name)) out.push(p);
  }
  return out;
};

/* Prompt dari skrip generate rama-animation: tuple ['nama', detik, 'prompt'] atau kunci `nama:`. */
function promptAnim() {
  const peta = new Map();   // "<folder proyek>/<nama>" -> {prompt, detik}
  const semua = new Map();  // nama -> {prompt, detik} (cadangan)
  const re = /\[\s*['"]([\w-]+)['"]\s*,\s*([\d.]+)\s*,\s*(['"`])((?:\\.|(?!\3).)*)\3/g;
  const skrip = [];
  const cari = (d) => { for (const e of readdirSync(d, {withFileTypes: true})) {
    if (['node_modules', 'assets', '.git'].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) cari(p); else if (/\.(mjs|js)$/.test(e.name)) skrip.push(p);
  } };
  cari(path.join(ANIM, 'outputs')); cari(path.join(ANIM, 'story-video', 'pipeline'));
  for (const f of skrip) {
    const proyek = path.relative(path.join(ANIM, 'outputs'), f).split(path.sep)[0];
    for (const m of readFileSync(f, 'utf8').matchAll(re)) {
      const v = {prompt: m[4].replace(/\\(.)/g, '$1'), detik: +m[2]};
      if (v.prompt.length < 12) continue;
      peta.set(`${proyek}/${m[1]}`, v); if (!semua.has(m[1])) semua.set(m[1], v);
    }
  }
  return {peta, semua};
}

export async function bangun() {
  mkdirSync(DIR, {recursive: true});
  const {peta, semua} = promptAnim();
  const manifest = new Map();
  const mf = path.join(ANIM, 'story-video/library/sound-effects/manifest.json');
  if (existsSync(mf)) for (const m of JSON.parse(readFileSync(mf, 'utf8'))) manifest.set(m.file.replace(/\.\w+$/, ''), m);

  const kandidat = [];   // {file, nama, proyek, sumber, prompt, detik}
  const proyek = path.join(PROJECT, 'motion-engine', 'proyek');
  for (const p of readdirSync(proyek)) {
    const dirs = [path.join(proyek, p)];
    for (const d of dirs) {
      const cfgF = ['motion.config.mjs', 'config.mjs'].map((n) => path.join(d, n)).find(existsSync);
      let sfx = [];
      if (cfgF) try { sfx = (await import(`${cfgF}?t=${Date.now()}`)).default.sfx || []; } catch { /* config rusak: lewati prompt */ }
      const pr = new Map(sfx.filter((s) => typeof s[2] === 'string').map(([n, dt, t]) => [n, {prompt: t, detik: dt}]));
      /* Salinan `@stok/` dilewati. Dibaca lebih dulu daripada sumber aslinya, salinan itu
         mengganti id stok dengan nama lokal proyek: sesudah konektor-promo, `hum-neon` jadi
         `neon` dan 21 id lain ikut hilang, jadi config yang merujuknya gagal di `motion sfx`. */
      const salinan = new Set(sfx.filter((s) => String(s[1]).startsWith('@stok/')).map((s) => s[0]));
      for (const f of walk(path.join(d, 'aset', 'sfx'))) {
        const nama = path.basename(f).replace(/\.\w+$/, '');
        if (salinan.has(nama)) continue;
        kandidat.push({file: f, nama, proyek: p, sumber: 'motion-engine', ...(pr.get(nama) || {})});
      }
    }
  }
  const animOut = path.join(ANIM, 'outputs');
  for (const f of [...walk(animOut), ...walk(path.join(ANIM, 'story-video', 'public'))]) {
    const rel = path.relative(ANIM, f).split(path.sep);
    if (!rel.some((s) => /^sfx/.test(s))) continue;
    const nama = path.basename(f).replace(/\.\w+$/, '');
    const p = rel[0] === 'outputs' ? rel[1] : rel.slice(0, 4).join('-');
    kandidat.push({file: f, nama, proyek: p, sumber: 'rama-animation', ...(peta.get(`${p}/${nama}`) || semua.get(nama) || {})});
  }
  for (const f of walk(path.join(ANIM, 'story-video/library/sound-effects'))) {
    const nama = path.basename(f).replace(/\.\w+$/, '');
    const m = manifest.get(nama);
    kandidat.push({file: f, nama, proyek: 'library', sumber: 'rama-animation', prompt: m?.prompt, detik: m?.durationSeconds, cocokManual: m?.bestFor, hindari: m?.avoidWhen});
  }

  const unik = new Map();   // md5 -> entri
  for (const k of kandidat) {
    const h = md5(k.file);
    const e = unik.get(h);
    if (e) { if (!e.dipakai.includes(k.proyek)) e.dipakai.push(k.proyek); e.prompt ??= k.prompt; e.cocokManual ??= k.cocokManual; e.hindari ??= k.hindari; continue; }
    unik.set(h, {...k, hash: h, dipakai: [k.proyek]});
  }
  const pakaiNama = new Map();
  const daftar = [];
  for (const e of [...unik.values()].sort((a, b) => a.nama.localeCompare(b.nama) || a.proyek.localeCompare(b.proyek))) {
    const n = pakaiNama.get(e.nama) || 0; pakaiNama.set(e.nama, n + 1);
    const ext = path.extname(e.file).toLowerCase();
    const id = n === 0 ? e.nama : `${e.nama}--${e.proyek}`;
    copyFileSync(e.file, path.join(DIR, id + ext));
    let dt = e.detik; try { dt = +durasi(e.file).toFixed(2); } catch { /* pakai detik dari skrip */ }
    const teks = `${e.nama.replace(/-/g, ' ')} ${e.prompt || ''}`;
    const t = tandai(teks);
    daftar.push({
      id, file: id + ext, detik: dt, prompt: e.prompt || null,
      kategori: t.kategori.length ? t.kategori : ['lain'],
      cocok: e.cocokManual ? [e.cocokManual] : (t.cocok.length ? t.cocok : [e.prompt ? `belum dikategorikan — baca prompt: ${e.prompt.slice(0, 90)}` : 'belum ditandai — dengarkan dulu']),
      hindari: e.hindari || null,
      dipakai: e.dipakai, sumber: e.sumber, hash: e.hash,
    });
  }
  writeFileSync(KATALOG, JSON.stringify(daftar, null, 1));
  const baris = daftar.map((d) => `| \`${d.id}\` | ${d.detik ?? '?'} | ${d.kategori.join(', ')} | ${d.cocok[0]} | ${(d.prompt || '—').replace(/\|/g, '/')} | ${d.dipakai.slice(0, 3).join(', ')}${d.dipakai.length > 3 ? ` +${d.dipakai.length - 3}` : ''} |`);
  writeFileSync(path.join(DIR, 'KATALOG.md'),
    `# Stok SFX (${daftar.length} bunyi unik)\n\nDibuat oleh \`motion stok --bangun\`. Cari dengan \`motion stok <kata>\`.\n\n`
    + '| id | detik | kategori | cocok untuk | prompt asli | dipakai di |\n|---|---|---|---|---|---|\n' + baris.join('\n') + '\n');
  return {kandidat: kandidat.length, unik: daftar.length};
}

export function muatKatalog() {
  if (!existsSync(KATALOG)) throw new Error('stok SFX belum dibangun — jalankan: motion stok --bangun');
  return JSON.parse(readFileSync(KATALOG, 'utf8'));
}

export function cari(q) {
  const kata = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
  return muatKatalog().filter((d) => {
    const isi = [d.id, d.prompt, ...d.kategori, ...d.cocok, ...d.dipakai].join(' ').toLowerCase();
    return kata.every((k) => isi.includes(k));
  });
}

/* Salin satu bunyi dari stok ke aset proyek sebagai <nama>.mp3. Dipakai config: ['nama', '@stok/<id>']. */
export function salin(id, tujuan) {
  const d = muatKatalog().find((x) => x.id === id);
  if (!d) throw new Error(`stok SFX "${id}" tidak ada — cari dengan: motion stok <kata>`);
  copyFileSync(path.join(DIR, d.file), tujuan);
  return d;
}
