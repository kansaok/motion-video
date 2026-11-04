// Alat MCP. Satu McpServer per permintaan HTTP, terikat ke satu pelanggan (uid).
import {readFileSync, writeFileSync, existsSync, mkdirSync, rmSync} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {z} from 'zod';
import * as Pipa from '../lib/pipa.mjs';
import * as K from '../lib/komposisi.mjs';
import * as Stok from '../lib/stok.mjs';
import * as Pr from './proyek.mjs';
import * as A from './antrean.mjs';
import {hitung} from './ekspresi.mjs';

const PANDUAN = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'PANDUAN.md'), 'utf8');

const INSTRUKSI = `Motion MCP merender komposisi HTML menjadi video MP4 dengan voice-over, SFX, musik, dan kapsi.
Panggil \`panduan\` sekali sebelum membuat video pertama: isinya kontrak komposisi dan skema config.
Server ini tidak membuat suara. Buat VO per baris naskah dengan connector ElevenLabs (creative_generate_speech, bahasa id),
lalu kirim URL audionya ke \`unggah\` jenis "vo". Render berjalan di antrean: panggil \`render\`, lalu poll \`status_render\`.`;

const teks = (x) => ({content: [{type: 'text', text: typeof x === 'string' ? x : JSON.stringify(x, null, 1)}]});
const gagal = (e) => ({isError: true, content: [{type: 'text', text: `✖ ${e.message || e}`}]});
const aman = (fn) => async (a) => { try { return await fn(a); } catch (e) { return gagal(e); } };

/* Token bucket cukup di memori: tujuan utamanya menahan satu akun yang membanjiri alat mahal,
   bukan menjadi catatan kuota permanen. Entri lama dibuang saat bucket berikutnya dibuat. */
const bucket = new Map();
const LAJU = {unggah: [12, 60_000], impor_zip: [2, 60_000], render: [2, 10 * 60_000], cuplik: [6, 60_000]};
export function batasiLaju(uid, alat, sekarang = Date.now()) {
  const [kapasitas, jendela] = LAJU[alat] || [];
  if (!kapasitas) return;
  const kunci = `${uid}:${alat}`, lama = bucket.get(kunci) || {isi: kapasitas, pada: sekarang};
  const isi = Math.min(kapasitas, lama.isi + (sekarang - lama.pada) * kapasitas / jendela);
  if (isi < 1) throw new Error(`batas laju ${alat} tercapai — coba lagi dalam ${Math.ceil((1 - isi) * jendela / kapasitas)} dtk`);
  bucket.set(kunci, {isi: isi - 1, pada: sekarang});
  if (bucket.size > 10_000) bucket.delete(bucket.keys().next().value);
}

/* Skema config. Semua yang sampai ke string filter ffmpeg harus angka, dan objek `mixer`
   disebarkan Pipa.mix ke opsi mixer — kunci di luar daftar ini (dir, vo, cue…) bisa
   membelokkan tempat tulis. Karena itu strict di semua tingkat. */
const Ekspr = z.union([z.number(), z.string().max(200)]);
const Angka = z.number().finite();
const PetaAngka = z.record(z.string().max(60), Angka);
const Config = z.object({
  komposisi: z.string().max(200),
  jugaTulis: z.array(z.string().max(200)).max(4).optional(),
  jsx: z.string().max(200).optional(),
  kapsi: z.boolean().optional(),
  jangkar: z.record(z.string().regex(/^\w{1,40}$/), z.number().int()).optional(),
  deret: z.record(z.string().regex(/^\w{1,40}$/), z.array(z.number().int()).max(20)).optional(),
  vo: z.array(z.object({
    no: z.number().int().min(1).max(99), sc: z.string().max(60), off: Angka.optional(), text: z.string().max(600),
  }).strict()).max(60),
  tata: z.object({
    mode: z.enum(['jangkar', 'alir']).optional(), jeda: Angka.optional(), ekorBiasa: Angka.optional(),
    jedaKhusus: PetaAngka.optional(), ekor: PetaAngka.optional(), geserAwal: PetaAngka.optional(),
  }).strict().optional(),
  sfx: z.array(z.tuple([z.string().max(41), z.string().max(80)])).max(60),
  cue: z.array(z.object({
    at: Ekspr, nama: z.string().max(41), gain: z.number().min(0).max(2).optional(),
    nada: z.number().min(-24).max(24).optional(), pan: z.number().min(-1).max(1).optional(),
  }).strict()).min(1).max(400),
  musik: z.array(z.object({
    nama: z.string().max(41), mulai: Ekspr.optional(), lewati: z.number().min(0).max(600).optional(),
    fadeOut: z.tuple([Ekspr, z.number().min(0).max(10)]).optional(),
    titik: z.array(z.tuple([z.string().max(60), Angka, z.number().min(-60).max(6)])).max(60).optional(),
  }).strict()).max(3).optional(),
  gate: z.array(z.tuple([Ekspr, Ekspr])).max(20).optional(),
  sampul: z.object({
    detik: z.number().min(0).optional(), mulai: z.number().min(0).optional(), ms: z.number().min(0).max(2000).optional(),
    gambar: z.union([z.string().max(200), z.record(z.enum(['9x16', '16x9', '4x5', '1x1']), z.string().max(200))]).optional(),
  }).strict().optional(),
  mixer: z.object({
    gainVO: z.number().min(0).max(4).optional(), gainSFX: z.number().min(0).max(4).optional(),
    lufsTarget: z.number().min(-24).max(-8).optional(),
    duckMusik: z.object({th: z.number().min(0.001).max(1), ratio: z.number().min(1).max(20),
      attack: z.number().min(1).max(2000), release: z.number().min(1).max(9000)}).partial().strict().optional(),
    bedMusik: z.object({mati: z.boolean(), th: z.number().min(0.001).max(1), ratio: z.number().min(1).max(20),
      attack: z.number().min(1).max(2000), release: z.number().min(1).max(9000), makeup: z.number().min(1).max(64),
      hpf: z.number().min(20).max(400), subF: z.number().min(30).max(400), subG: z.number().min(-24).max(6)}).partial().strict().optional(),
  }).strict().optional(),
}).strict();

export function buatServer(uid) {
  const s = new McpServer({name: 'motion-mcp', version: '1.0.0'}, {instructions: INSTRUKSI});
  const alat = (nama, deskripsi, skema, fn, anotasi = {}) =>
    s.registerTool(nama, {description: deskripsi, inputSchema: skema, annotations: anotasi}, aman(fn));
  const Proyek = z.string().describe('id proyek dari buat_proyek / daftar_proyek');

  alat('panduan', 'Kontrak komposisi HTML, alur kerja dengan connector ElevenLabs, dan skema config. Baca sebelum membuat video pertama.',
    {}, async () => teks(PANDUAN), {readOnlyHint: true});

  alat('buat_proyek', 'Buat proyek video baru. Mengembalikan id proyek.',
    {nama: z.string().min(1).max(80).describe('nama video, misal "Iklan Promo Ramadan 9x16"')},
    async ({nama}) => teks(Pr.buat(uid, nama)));

  alat('daftar_proyek', 'Daftar proyek milik akun ini, terbaru dulu.', {}, async () => teks(Pr.daftar(uid).map((m) => ({
    ...m, render: A.statusProyek(Pr.buka(uid, m.id))?.status ?? null,
  }))), {readOnlyHint: true});

  alat('info_proyek', 'Isi proyek: berkas src, aset audio yang sudah diunggah, scene di komposisi, config, dan status render terakhir.',
    {proyek: Proyek}, async ({proyek}) => {
      const p = Pr.buka(uid, proyek);
      const cfgF = path.join(p.dir, 'config.json');
      const cfg = existsSync(cfgF) ? JSON.parse(readFileSync(cfgF, 'utf8')) : null;
      let scenes = null;
      if (cfg) { try { scenes = K.bacaScenes(Pr.jalurAman(p.src, cfg.komposisi)); } catch (e) { scenes = e.message; } }
      return teks({meta: p.meta, src: Pr.berkasSrc(p), aset: Pr.asetAda(p), scenes, config: cfg, render: A.statusProyek(p)});
    }, {readOnlyHint: true});

  alat('hapus_proyek', 'Hapus proyek beserta semua berkas dan videonya. Tidak bisa dibatalkan.',
    {proyek: Proyek}, async ({proyek}) => { Pr.hapus(uid, proyek); return teks(`proyek ${proyek} dihapus`); },
    {destructiveHint: true});

  alat('tulis_berkas', 'Tulis atau timpa satu berkas teks di src/ proyek (komposisi .html, .jsx, .js, .css, .svg). '
    + 'Menulis ulang komposisi mengatur ulang durasi scene ke nilai di berkas baru.',
  {proyek: Proyek, berkas: z.string().max(200).describe('jalur relatif di src/, misal "Video 9x16.dc.html"'),
    isi: z.string().max(2_000_000)},
  async ({proyek, berkas, isi}) => {
    if (!/\.(html?|jsx?|mjs|css|svg|json|txt|md)$/i.test(berkas)) throw new Error('hanya berkas teks: html, js, jsx, css, svg, json');
    const p = Pr.buka(uid, proyek);
    Pr.periksaKuota(p, Buffer.byteLength(isi));
    Pr.tulisSrc(p, berkas, isi);
    Pr.sentuh(p);
    let catatan = '';
    if (/\.html?$/i.test(berkas)) {
      try {
        const sc = K.bacaScenes(Pr.jalurAman(p.src, berkas));
        catatan = ` · ${sc.length} scene, ${sc.reduce((a, x) => a + x.dur, 0).toFixed(1)} dtk: ${sc.map((x) => `${x.name} ${x.dur}`).join(' · ')}`;
      } catch (e) { catatan = ` · ! ${e.message}`; }
      if (!/data-om-exportable-video-with-duration-secs/.test(isi)) catatan += ' · ! stage tanpa atribut data-om-exportable-video-with-duration-secs';
      if (!/data-om-seek-to-time-frame/.test(isi)) catatan += ' · ! tidak mendengarkan event data-om-seek-to-time-frame';
    }
    return teks(`✓ ${berkas} (${Buffer.byteLength(isi)} byte)${catatan}`);
  });

  alat('baca_berkas', 'Baca satu berkas teks dari src/ proyek.',
    {proyek: Proyek, berkas: z.string().max(200)},
    async ({proyek, berkas}) => {
      const f = Pr.jalurAman(Pr.buka(uid, proyek).src, berkas);
      if (!existsSync(f)) throw new Error(`${berkas} tidak ada`);
      return teks(readFileSync(f, 'utf8'));
    }, {readOnlyHint: true});

  alat('impor_zip', 'Impor zip ekspor Claude Design (komposisi .dc.html + .jsx) dari URL https ke src/.',
    {proyek: Proyek, url: z.string().url()},
    async ({proyek, url}) => {
      batasiLaju(uid, 'impor_zip');
      const p = Pr.buka(uid, proyek);
      const buf = await Pr.unduh(url);
      const zip = path.join(os.tmpdir(), `impor-${proyek}-${Date.now()}.zip`);
      writeFileSync(zip, buf);
      try {
        const batasZip = {maksBytes: Pr.BATAS.ekstrakMb * 1048576};
        const infoZip = Pipa.periksaZip(zip, batasZip);
        Pr.periksaKuota(p, infoZip.ukuran);
        Pipa.bongkar(zip, p.dir, batasZip);
        const symlink = Pr.buangSymlink(p.src);
        // Dihitung ulang sesudah symlink dibuang: komposisi yang ternyata symlink tidak boleh terdaftar.
        const {html, jsx} = K.temukan(p.src);
        if (!html.length) throw new Error('tidak ada berkas .html yang memuat OM_SCENES di dalam zip');
        if (symlink) console.warn(`impor_zip ${proyek}: ${symlink} symlink dibuang`);
        for (const f of html) for (const x of ['.asli', '.terap']) rmSync(path.join(p.src, f + x), {force: true});
        Pr.sentuh(p);
        const info = html.map((f) => ({komposisi: f, ...K.jsxUtama(path.join(p.src, f), p.src),
          scenes: K.bacaScenes(path.join(p.src, f))}));
        return teks({html, jsx, info});
      } finally { rmSync(zip, {force: true}); }
    });

  alat('unggah', 'Unggah berkas dari URL https (misalnya audio hasil connector ElevenLabs) atau base64. '
    + 'jenis "vo": satu baris naskah, wajib `no` — senyap kepala/ekor dipotong otomatis, `tempo` opsional. '
    + 'jenis "sfx"/"musik": wajib `nama` (huruf kecil-angka-minus). jenis "gambar": `nama` = jalur di src/, misal "img/logo.png".',
  {
    proyek: Proyek, jenis: z.enum(['vo', 'sfx', 'musik', 'gambar']),
    url: z.string().url().optional(), base64: z.string().optional(),
    no: z.number().int().min(1).max(99).optional(), nama: z.string().max(120).optional(),
    tempo: z.number().min(0.5).max(2).optional().describe('khusus vo: 1.1 = 10% lebih cepat, nada tetap'),
  },
  async ({proyek, jenis, url, base64, no, nama, tempo}) => {
    batasiLaju(uid, 'unggah');
    const p = Pr.buka(uid, proyek);
    const buf = await Pr.ambilIsi({url, base64});
    Pr.periksaKuota(p, buf.length);
    let r;
    if (jenis === 'vo') {
      if (!no) throw new Error('jenis vo butuh `no`');
      r = Pr.simpanVo(p, no, buf, tempo);
    } else if (jenis === 'gambar') {
      if (!nama || !/\.(png|jpe?g|webp|gif|svg|mp4|woff2?)$/i.test(nama)) throw new Error('nama gambar harus berakhiran png/jpg/webp/gif/svg/mp4/woff2');
      const f = Pr.jalurAman(p.src, nama);
      mkdirSync(path.dirname(f), {recursive: true});
      writeFileSync(f, buf);
      r = {berkas: nama, kb: Math.ceil(buf.length / 1024)};
    } else {
      if (!nama) throw new Error(`jenis ${jenis} butuh \`nama\``);
      r = Pr.simpanAudio(p, jenis, nama, buf);
    }
    Pr.sentuh(p);
    return teks({jenis, ...r});
  });

  alat('cari_sfx', 'Cari bunyi di stok SFX (±700 bunyi, gratis). Semua kata harus cocok. Contoh: "whoosh", "pop", "impact", "ketik", "chime", "riser". '
    + 'Pakai hasilnya di config sebagai ["nama", "@stok/<id>"].',
  {kata: z.string().max(100), maks: z.number().int().min(1).max(60).optional()},
  async ({kata, maks = 25}) => {
    const h = Stok.cari(kata).slice(0, maks).map((d) => ({id: d.id, detik: d.detik, kategori: d.kategori, cocok: d.cocok[0], prompt: d.prompt}));
    return teks(h.length ? h : `tidak ada yang cocok dengan "${kata}" — coba satu kata (whoosh, pop, impact, chime, riser, ketik, klik)`);
  }, {readOnlyHint: true});

  alat('simpan_config', 'Simpan config proyek (naskah VO + posisi, SFX, cue, musik, mixer). Skema lengkap ada di `panduan`. '
    + 'Divalidasi terhadap komposisi saat disimpan.',
  {proyek: Proyek, config: z.record(z.any()).describe('objek config, lihat panduan')},
  async ({proyek, config}) => {
    const p = Pr.buka(uid, proyek);
    const cek = Config.safeParse(config);
    if (!cek.success) throw new Error(cek.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
    const j = cek.data;
    const {scenes, total} = Pr.periksaConfig(p, j);
    // Ekspresi diuji dengan peta tiruan: nama yang salah ketik ketahuan sekarang, bukan setelah antre render.
    const C = {}, S = {}; let a = 0;
    for (const x of scenes) { C[x.name] = a; S[x.name] = x.dur; a += x.dur; }
    const P = {}, E = {};
    for (const l of j.vo) { P[l.no] = C[l.sc] + (l.off || 0); E[l.no] = P[l.no] + 1; }
    const L = {C, S, P, E, total};
    j.cue.forEach((c, i) => { try { hitung(c.at, L); } catch (e) { throw new Error(`cue ke-${i + 1}: ${e.message}`); } });
    for (const [x, y] of j.gate || []) { hitung(x, L); hitung(y, L); }
    for (const m of j.musik || []) { if (m.mulai !== undefined) hitung(m.mulai, L); if (m.fadeOut) hitung(m.fadeOut[0], L); }
    if (j.sampul?.gambar) {
      const g = typeof j.sampul.gambar === 'string' ? [j.sampul.gambar] : Object.values(j.sampul.gambar);
      for (const f of g) if (!existsSync(Pr.jalurAman(p.src, f))) throw new Error(`gambar sampul "${f}" tidak ada di src`);
    }
    Pr.tulisAtomik(path.join(p.dir, 'config.json'), JSON.stringify(j, null, 1));
    Pr.sentuh(p);
    const ada = new Set(Pr.asetAda(p).vo);
    const belumVo = j.vo.filter((l) => !ada.has(`vo-${String(l.no).padStart(2, '0')}.mp3`)).map((l) => l.no);
    const sfxAda = new Set(Pr.asetAda(p).sfx);
    const belumSfx = j.sfx.filter(([n, s]) => s === '@luar' && !sfxAda.has(n)).map(([n]) => n);
    const musAda = new Set(Pr.asetAda(p).musik);
    const belumMus = (j.musik || []).filter((m) => !musAda.has(m.nama)).map((m) => m.nama);
    return teks({
      ok: true, scene: scenes.length, durasi_komposisi: +total.toFixed(2),
      belum_diunggah: {vo: belumVo, sfx: belumSfx, musik: belumMus},
    });
  });

  alat('cuplik', 'Ambil gambar frame komposisi pada detik tertentu untuk memeriksa tata letak (tanpa audio). Maks 6 detik per panggilan.',
    {proyek: Proyek, detik: z.array(z.number().min(0)).min(1).max(6), komposisi: z.string().max(200).optional()},
    async ({proyek, detik, komposisi}) => {
      batasiLaju(uid, 'cuplik');
      const p = Pr.buka(uid, proyek);
      let komp = komposisi;
      if (!komp) {
        const cfg = existsSync(path.join(p.dir, 'config.json')) ? JSON.parse(readFileSync(path.join(p.dir, 'config.json'), 'utf8')) : null;
        komp = cfg?.komposisi || K.temukan(p.src).html[0];
      }
      if (!komp) throw new Error('belum ada komposisi .html ber-OM_SCENES di src');
      Pr.jalurAman(p.src, komp);
      const f = await A.cuplikGiliran(uid, () => A.cuplikPekerja(uid, p, komp, detik));
      return {content: f.flatMap((x, i) => [
        {type: 'text', text: `t = ${detik[i]} dtk`},
        {type: 'image', data: readFileSync(x).toString('base64'), mimeType: 'image/jpeg'},
      ])};
    }, {readOnlyHint: true});

  alat('render', 'Masukkan proyek ke antrean render: tempatkan VO, sesuaikan durasi scene, mix audio, render MP4, periksa. '
    + 'Kembali segera dengan id render; poll status_render. `frames` (misal 60) untuk uji cepat beberapa detik pertama.',
  {proyek: Proyek, frames: z.number().int().min(1).max(600).optional()},
  async ({proyek, frames}) => {
    batasiLaju(uid, 'render');
    const p = Pr.buka(uid, proyek);
    const j = Pr.bacaConfig(p);
    Pr.periksaConfig(p, j);
    const t = A.kirim(uid, p, {frames});
    return teks({render: t.id, status: t.status, catatan: 'poll status_render tiap ±20 detik'});
  });

  alat('status_render', 'Status render: antre (dengan urutan), jalan (dengan langkah), selesai (tautan MP4 + sampul + laporan), atau gagal (galat).',
    {render: z.string().optional(), proyek: Proyek.optional()},
    async ({render, proyek}) => {
      const t = render ? A.status(uid, render) : proyek ? A.statusProyek(Pr.buka(uid, proyek)) : null;
      if (!t) throw new Error('render tidak ditemukan — sebutkan `render` atau `proyek`');
      return teks(t);
    }, {readOnlyHint: true});

  return s;
}
