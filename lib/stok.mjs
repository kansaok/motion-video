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

/* ── Pencarian (P6-06) ─────────────────────────────────────────────────────────
   Dulu: semua kata harus muncul sebagai substring di gabungan id + prompt + kategori + `cocok`
   + nama proyek, tanpa urutan. "kasir" tidak menemukan "cash register", "click" menemukan
   bunyi yang prompt-nya "no click", dan nama proyek pemakai ikut dicocokkan.
   Sekarang tiap kata diberi bobot menurut tempat cocoknya, sinonim Indonesia-Inggris dipakai,
   kata sesudah "no/without/tanpa" di prompt tidak dihitung, dan hasil diurutkan. */

// Bobot tempat cocok. Nama id ditulis manusia untuk bunyi itu; `cocok untuk` > prompt > kategori
// (kategori ditandai regex dari prompt, jadi paling berisik).
export const BOBOT = Object.freeze({nama: 5, cocok: 3, prompt: 2, kategori: 1, hindari: -3});

/* Kelompok sinonim, dua arah. Frasa (ada spasi) dicocokkan sebagai frasa utuh. */
export const SINONIM = [
  ['kasir', 'cash register', 'register', 'till', 'checkout'],
  ['klik', 'click', 'clicks', 'clicking'],
  ['uang', 'money', 'cash', 'coin', 'coins', 'koin'],
  ['pintu', 'door'],
  ['langkah', 'footstep', 'footsteps', 'step', 'steps'],
  ['ketik', 'mengetik', 'typing', 'keyboard', 'keystroke'],
  ['kertas', 'paper', 'sheet', 'page'],
  ['robek', 'sobek', 'tear', 'torn', 'rip'],
  ['jatuh', 'fall', 'drop'],
  ['hentak', 'hentakan', 'impact', 'hit', 'slam', 'boom'],
  ['dentum', 'boom', 'thud', 'thump'],
  ['lonceng', 'bell', 'chime'],
  ['sukses', 'berhasil', 'success', 'positive'],
  ['gagal', 'salah', 'error', 'fail', 'wrong'],
  ['notifikasi', 'notif', 'notification', 'ping', 'ding', 'alert'],
  ['pesan', 'chat', 'message'],
  ['jantung', 'heartbeat', 'pulse'],
  ['napas', 'nafas', 'breath', 'sigh'],
  ['hujan', 'rain'],
  ['air', 'water', 'ripple', 'splash'],
  ['angin', 'wind'],
  ['transisi', 'transition', 'whoosh', 'swoosh', 'swish', 'sweep'],
  ['geser', 'slide', 'swipe', 'sliding'],
  ['naik', 'rise', 'rising', 'riser', 'build', 'swell'],
  ['muncul', 'pop', 'appear', 'reveal'],
  ['tombol', 'button', 'tap', 'press'],
  ['centang', 'check', 'checkmark', 'tick'],
  ['hitung', 'count', 'counter', 'counting', 'odometer'],
  ['angka', 'number', 'digit', 'counter'],
  ['kamera', 'camera', 'shutter', 'foto', 'photo'],
  ['mesin', 'machine', 'mechanical', 'gear'],
  ['listrik', 'electric', 'spark'],
  ['tegang', 'ketegangan', 'tense', 'tension', 'suspense'],
  ['horor', 'seram', 'horror', 'ominous', 'dread'],
  ['tepuk', 'clap', 'applause'],
  ['sorak', 'cheer', 'crowd'],
  ['tawa', 'laugh', 'laughter'],
  ['ledakan', 'explosion', 'blast'],
  ['mundur', 'rewind', 'reverse'],
  ['gelembung', 'bubble'],
  ['cap', 'stempel', 'stamp'],
  ['tulis', 'menulis', 'pen', 'pencil', 'write', 'writing', 'scribble', 'marker'],
  // Bukan 'ring': di stok itu juga cincin (ring-chime) dan dengung rak logam.
  ['telepon', 'telpon', 'ponsel', 'hp', 'phone', 'smartphone', 'dering'],
  // Bukan 'buzz': di stok itu kebanyakan dengung error. 'vibrat' = vibrate/vibrating/vibration (awalan).
  ['getar', 'bergetar', 'vibrat'],
  ['kaca', 'glass'],
  ['logam', 'besi', 'metal', 'metallic'],
  ['kayu', 'wood', 'wooden'],
  ['kotak', 'kardus', 'box', 'cardboard'],
  ['dengung', 'hum', 'drone'],
  ['kilau', 'berkilau', 'sparkle', 'shimmer', 'twinkle'],
  ['data', 'digital', 'glitch'],
  ['kartu', 'card'],
  // Sifat bunyi: kueri sering berbentuk "<bunyi> <sifat>" ("whoosh cepat", "klik lembut").
  ['cepat', 'fast', 'quick', 'rapid'],
  ['pelan', 'lambat', 'slow'],
  ['lembut', 'halus', 'soft', 'gentle'],
  ['keras', 'hard', 'heavy', 'loud'],
  ['kecil', 'small', 'tiny'],
  ['besar', 'big', 'large', 'huge'],
  ['gelap', 'dark'],
  ['terang', 'cerah', 'bright'],
  ['hangat', 'warm'],
  ['dingin', 'cold'],
];

const kataDari = (t) => String(t || '').toLowerCase().match(/[a-z0-9]+/g) || [];
// "no impact at the end", "without music or vocals", "tanpa klik" -> kata sesudahnya dibuang.
const buangNegasi = (t) => String(t || '').toLowerCase()
  .replace(/\b(no|without|non|not|tanpa)\s+[a-z]+(\s+(or|and|nor|atau|dan)\s+[a-z]+)*/g, ' ');

/* `cocok` yang sama persis dengan deskripsi ATURAN hanyalah kategori tebakan regex (sama untuk
   ratusan bunyi): dihitung seperti kategori. Bobot `cocok` hanya untuk yang ditulis manusia
   (manifest `bestFor`). Tanpa ini "tegang" mengangkat bel sepeda, karena regex `emosi`-nya. */
const GENERIK = new Set(ATURAN.map((x) => x[2]));
const bidang = (t) => { const k = kataDari(t); return {kata: k, teks: ` ${k.join(' ')} `}; };
const SIAP = new WeakMap();
function siapkan(d) {
  let x = SIAP.get(d);
  if (x) return x;
  const nama = d.id.replace(/--.*/, '').replace(/[-_]/g, ' ');
  const manual = d.cocok.filter((c) => !GENERIK.has(c) && !/^belum (dikategorikan|ditandai)/.test(c));
  const generik = d.cocok.filter((c) => GENERIK.has(c));
  x = {
    nama: bidang(nama),
    cocok: bidang(manual.join(' ')),
    prompt: bidang(buangNegasi(d.prompt)),
    kategori: bidang([...d.kategori, ...generik].join(' ')),
    hindari: bidang(d.hindari),
  };
  SIAP.set(d, x);
  return x;
}

/* Satu kata kueri cocok dengan satu bidang: frasa sebagai frasa, kata >= 4 huruf boleh awalan
   ("click" ~ "clicking"), kata pendek harus sama persis ("cap" bukan "capture"). */
function cocokBidang(b, k) {
  if (k.includes(' ')) return b.teks.includes(` ${k} `);
  return b.kata.some((w) => w === k || (k.length >= 4 && w.startsWith(k)));
}

/** @param {string} k */
export function kelompok(k) {
  const g = SINONIM.filter((x) => x.includes(k)).flat();
  return [...new Set([k, ...g])];
}

/** Skor satu entri untuk kata-kata kueri: {cocok: jumlah kata yang ditemukan, skor}. */
export function nilai(d, kata) {
  const b = siapkan(d);
  let cocok = 0, skor = 0;
  for (const k of kata) {
    const per = [];
    for (const s of kelompok(k)) {
      // Kata asli sedikit di atas sinonimnya: "click" persis lebih kuat daripada "tap".
      const kali = s === k ? 1 : 0.8;
      let n = 0;
      for (const [bidang, w] of Object.entries(BOBOT)) if (cocokBidang(b[bidang], s)) n += w;
      if (n > 0) per.push(n * kali);
    }
    /* Sinonim terbaik penuh, sinonim lain yang juga cocok seperempat: "tombol" menaruh
       `button-tap` (button + tap) di atas `alarm-tap` (tap saja), bukan seri lalu urut abjad. */
    per.sort((x, y) => y - x);
    const terbaik = per.length ? per[0] + 0.25 * per.slice(1).reduce((a, x) => a + x, 0) : 0;
    if (terbaik > 0) { cocok++; skor += terbaik; }
  }
  return {cocok, skor};
}

/** Urut: paling banyak kata kueri yang ditemukan, lalu skor, lalu id. @param {string} q */
export function cari(q, katalog = muatKatalog()) {
  const kata = kataDari(q);
  if (!kata.length) return [];
  return katalog.map((d) => ({d, ...nilai(d, kata)}))
    .filter((x) => x.cocok > 0 && x.skor > 0)
    .sort((a, b) => b.cocok - a.cocok || b.skor - a.skor || a.d.id.localeCompare(b.d.id))
    .map((x) => x.d);
}

/* Kata terdekat (Levenshtein <= 2) dari kosakata stok + sinonim, untuk kueri tanpa hasil. */
function jarak(a, b) {
  const m = Array.from({length: a.length + 1}, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return m[a.length][b.length];
}
/** @param {string} q */
export function saran(q, katalog = muatKatalog()) {
  const frek = new Map();
  for (const d of katalog) {
    const b = siapkan(d);
    for (const w of [...b.nama.kata, ...b.prompt.kata, ...b.kategori.kata]) frek.set(w, (frek.get(w) || 0) + 1);
  }
  for (const w of SINONIM.flat()) if (!w.includes(' ')) frek.set(w, (frek.get(w) || 0) + 1);
  const out = [];
  for (const k of kataDari(q)) {
    if (k.length < 3) continue;
    const dekat = [...frek.keys()].map((w) => ({w, j: jarak(k, w)}))
      .filter((x) => x.j > 0 && x.j <= (k.length >= 6 ? 2 : 1))
      .sort((a, b) => a.j - b.j || frek.get(b.w) - frek.get(a.w)).slice(0, 3).map((x) => x.w);
    out.push(...dekat);
  }
  return [...new Set(out)];
}

/* Bunyi yang mirip dengan satu id: cosine tf-idf atas kata nama + prompt (tanpa negasi) +
   kategori. idf membuat kata yang ada di hampir semua prompt ("dry", "one shot", "clean")
   tidak menentukan kemiripan. Salinan dengan nama dasar sama (`x--proyek`) tetap ikut, karena
   prompt-nya bisa berbeda.
   @param {string} id */
export function mirip(id, katalog = muatKatalog(), n = 10) {
  const asal = katalog.find((d) => d.id === id);
  if (!asal) throw new Error(`stok SFX "${id}" tidak ada — cari dengan: motion stok <kata>`);
  const kumpulan = (d) => { const b = siapkan(d); return new Set([...b.nama.kata, ...b.prompt.kata, ...b.kategori.kata]); };
  const set = new Map(katalog.map((d) => [d, kumpulan(d)]));
  const df = new Map();
  for (const s of set.values()) for (const w of s) df.set(w, (df.get(w) || 0) + 1);
  const idf = (w) => Math.log(katalog.length / (df.get(w) || 1));
  const vektor = (s) => { const v = new Map(); let n2 = 0; for (const w of s) { const x = idf(w); v.set(w, x); n2 += x * x; } return {v, n: Math.sqrt(n2) || 1}; };
  const a = vektor(set.get(asal));
  return katalog.filter((d) => d !== asal && d.hash !== asal.hash).map((d) => {
    const b = vektor(set.get(d));
    let dot = 0; for (const [w, x] of a.v) if (b.v.has(w)) dot += x * b.v.get(w);
    return {d, s: dot / (a.n * b.n)};
  }).filter((x) => x.s > 0).sort((x, y) => y.s - x.s || x.d.id.localeCompare(y.d.id)).slice(0, n).map((x) => x.d);
}

/* Salin satu bunyi dari stok ke aset proyek sebagai <nama>.mp3. Dipakai config: ['nama', '@stok/<id>']. */
export function salin(id, tujuan) {
  const d = muatKatalog().find((x) => x.id === id);
  if (!d) throw new Error(`stok SFX "${id}" tidak ada — cari dengan: motion stok <kata>`);
  copyFileSync(path.join(DIR, d.file), tujuan);
  return d;
}
