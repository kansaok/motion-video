/* P6-05: pustaka templat. Struktur dan kesetaraan config CLI/MCP diuji tanpa Chromium (jalan di CI);
   tiap templat juga melewati `motion plan --kering`, validasi `pakai_templat` MCP yang sama dengan
   `simpan_config`, pemeriksaan tata letak, dan render 60 frame bila Chromium terpasang. */
import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {pathToFileURL, fileURLToPath} from 'node:url';

process.env.MOTION_VIEWPORT ||= '800x1200';
process.env.DATA_DIR ||= mkdtempSync(path.join(os.tmpdir(), 'motion-templat-data-'));
const AKAR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const Tpl = await import('../lib/templat.mjs');
const K = await import('../lib/komposisi.mjs');
const {hitung} = await import('../mcp/ekspresi.mjs');
const Stok = await import('../lib/stok.mjs');

const SEMUA = Tpl.daftar();
const NAMA = SEMUA.map((t) => t.nama);
const sumberIsi = (nama) => {
  const kode = readFileSync(path.join(Tpl.DIR, nama, 'src', 'isi.js'), 'utf8');
  const w = {};
  new Function('window', kode)(w);
  return w.ISI;
};
const cli = async (nama) => (await import(`${pathToFileURL(path.join(Tpl.DIR, nama, 'motion.config.mjs')).href}?t=${Date.now()}`)).default;

test('ada >= 3 templat (iklan, testimoni, trailer, tutorial) dengan metadata dan scene yang cocok dengan komposisinya', () => {
  assert.deepEqual(NAMA, ['iklan', 'testimoni', 'trailer', 'tutorial']);
  for (const t of SEMUA) {
    const sc = K.bacaScenes(path.join(Tpl.DIR, t.nama, 'src', 'Video.html'));
    assert.deepEqual(sc.map((s) => s.name), t.scene, t.nama);
    assert.equal(+sc.reduce((a, s) => a + s.dur, 0).toFixed(2), t.detik, t.nama);
    assert.ok(t.judul && t.deskripsi && t.cocok, t.nama);
  }
  assert.throws(() => Tpl.buka('../lib'), /templat "..\/lib" tidak ada; pilihan: iklan, testimoni, trailer, tutorial/);
});

test('mesin komposisi sama persis di semua templat (selain OM_SCENES): satu perbaikan berlaku ke semua', () => {
  const tanpaScene = (n) => readFileSync(path.join(Tpl.DIR, n, 'src', 'Video.html'), 'utf8').replace(/window\.OM_SCENES = '[^']*';/, '');
  for (const n of NAMA.slice(1)) assert.equal(tanpaScene(n), tanpaScene(NAMA[0]), `${n}/src/Video.html berbeda dari ${NAMA[0]}`);
  const html = tanpaScene(NAMA[0]);
  assert.match(html, /data-om-kontrak="2"/);
  assert.match(html, /<script src="timing.js"><\/script>/);
  // Hanya kode dan CSS: komentar kepala berkas justru menyebut larangan ini.
  const kode = html.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\/[^\n]*/g, '');
  const terlarang = kode.match(/Date\.now|setTimeout|setInterval|requestAnimationFrame|transition:|animation:/);
  assert.equal(terlarang, null, `komposisi memakai ${terlarang?.[0]}: frame harus digambar sinkron dari e.detail.time`);
});

test('isi.js menyediakan teks untuk setiap scene dan kapsi untuk setiap baris VO', async () => {
  for (const n of NAMA) {
    const isi = sumberIsi(n), c = await cli(n), t = Tpl.buka(n).meta;
    assert.deepEqual(Object.keys(isi.scene).sort(), [...t.scene].sort(), n);
    assert.deepEqual(Object.keys(isi.kapsi).map(Number).sort((a, b) => a - b), c.vo.map((l) => l.no), n);
    assert.ok(Object.values(isi.kapsi).every((k) => k.length <= 60), `${n}: kapsi > 60 karakter sulit dibaca`);
  }
});

test('config CLI dan MCP sama: naskah, tata, SFX, mixer, amplop musik, dan detik setiap cue', async () => {
  for (const n of NAMA) {
    const c = await cli(n), j = Tpl.configMcp(n), t = Tpl.buka(n).meta;
    assert.deepEqual(c.vo.map(({no, sc, off, text}) => ({no, sc, off, text})), j.vo, `${n}: vo`);
    assert.deepEqual(c.tata, j.tata, `${n}: tata`);
    assert.deepEqual(c.sfx, j.sfx, `${n}: sfx`);
    assert.deepEqual(c.mixer, j.mixer, `${n}: mixer`);
    assert.deepEqual(c.musik[0].titik, j.musik[0].titik, `${n}: titik`);
    // Timeline sembarang yang memanjang (seperti sesudah plan): fungsi CLI dan ekspresi MCP harus memberi detik yang sama.
    const C = {}, S = {}; let a = 0;
    t.scene.forEach((s, i) => { S[s] = 3.3 + i * 0.7; C[s] = a; a += S[s]; });
    const P = {}, E = {};
    c.vo.forEach((l) => { P[l.no] = C[l.sc] + l.off; E[l.no] = P[l.no] + 2; });
    const L = {C, P, E, S, total: a};
    const viaCli = c.cue(L).map((x) => [x.nama, +x.at.toFixed(4), x.gain, x.nada ?? 0, x.pan ?? 0]);
    const viaMcp = j.cue.map((x) => [x.nama, +hitung(x.at, L).toFixed(4), x.gain, x.nada ?? 0, x.pan ?? 0]);
    assert.deepEqual(viaCli, viaMcp, `${n}: cue`);
    assert.equal(c.musik[0].fadeOut(L)[0], hitung(j.musik[0].fadeOut[0], L), `${n}: fadeOut`);
  }
});

test('aturan IKLAN.md di config: SFX dari stok yang ada, musik `rencana` + [tail], tanpa kata "sparse/quiet", satu hentakan', async () => {
  const ada = new Set(Stok.muatKatalog().map((d) => d.id));
  for (const n of NAMA) {
    const c = await cli(n);
    for (const [nama, sumber] of c.sfx) assert.ok(ada.has(sumber.replace('@stok/', '')), `${n}: ${nama} ${sumber} tidak ada di stok`);
    const t = Tpl.buka(n).meta;
    const C = {}; let a = 0;
    for (const s of t.scene) { C[s] = a; a += 4; }
    const r = c.musik[0].rencana({C, total: a});
    assert.equal(r.at(-1).teks, '[tail]', `${n}: bagian terakhir harus [tail] yang tidak terdengar`);
    for (const b of r) {
      assert.ok(b.detik >= 3 && b.detik <= 120, `${n}: bagian ${b.teks} ${b.detik} dtk di luar batas API 3-120`);
      assert.ok(!b.gaya.some((g) => /sparse|quiet|patient|silence/i.test(g)), `${n}: gaya ${b.teks} meminta senyap`);
      assert.ok(b.hindari.includes('sparse') && b.hindari.includes('vocals'), n);
    }
    assert.ok(c.cue({C, P: {}, E: {}, S: {}, total: a}).filter((x) => x.nama === 'impact').length <= 1, `${n}: hentakan lebih dari sekali`);
    assert.ok(!('prompt' in c.musik[0]), `${n}: musik pakai rencana, bukan prompt`);
  }
});

function cliRun(...a) {
  return spawnSync(process.execPath, [path.join(AKAR, 'bin/motion.mjs'), ...a], {encoding: 'utf8',
    env: {...process.env, MOTION_ENV: '/nonexistent', MOTION_CACHE_VO: 'off', ELEVENLABS_API_KEY: 'kunci-uji-bukan-asli'}});
}

test('motion init --templat: daftar, pasang ke folder baru (nama diganti), tidak menimpa, lalu plan --kering lolos', () => {
  const r0 = cliRun('init', '--templat');
  assert.equal(r0.status, 0, r0.stderr);
  for (const n of NAMA) assert.match(r0.stdout, new RegExp(`^  ${n} `, 'm'));
  const akar = mkdtempSync(path.join(os.tmpdir(), 'motion-templat-'));
  try {
    for (const n of NAMA) {
      const dir = path.join(akar, `Promo ${n} Desember`);
      const r = cliRun('init', `--templat=${n}`, dir);
      assert.equal(r.status, 0, r.stderr);
      const cfg = readFileSync(path.join(dir, 'motion.config.mjs'), 'utf8');
      assert.match(cfg, new RegExp(`nama: 'promo-${n}-desember'`));
      assert.doesNotMatch(cfg, /__NAMA__/);
      assert.ok(existsSync(path.join(dir, 'src', 'Video.html')) && existsSync(path.join(dir, 'src', 'isi.js')));
      const k = cliRun('plan', dir, '--kering');
      assert.equal(k.status, 0, `${n}: ${k.stdout}${k.stderr}`);
      assert.match(k.stdout, /TOTAL/);
      assert.doesNotMatch(k.stdout, /✖|! cue/, `${n}: ${k.stdout}`);
      assert.match(cliRun('init', `--templat=${n}`, dir).stderr, /config sudah ada, tidak ditimpa/);
    }
  } finally { rmSync(akar, {recursive: true, force: true}); }
});

test('alat MCP daftar_templat + pakai_templat: tiap templat lolos validasi simpan_config; templat salah tidak meninggalkan proyek', async () => {
  const {Client} = await import('@modelcontextprotocol/sdk/client/index.js');
  const {InMemoryTransport} = await import('@modelcontextprotocol/sdk/inMemory.js');
  const {buatServer} = await import('../mcp/alat.mjs');
  const Pr = await import('../mcp/proyek.mjs');
  const uid = 717171;
  const [a, b] = InMemoryTransport.createLinkedPair();
  const s = buatServer(uid);
  await s.connect(a);
  const k = new Client({name: 'uji', version: '0'});
  await k.connect(b);
  const panggil = async (name, args) => {
    const r = await k.callTool({name, arguments: args});
    return {galat: Boolean(r.isError), teks: r.content.map((x) => x.text).join(' ')};
  };
  try {
    assert.deepEqual(JSON.parse((await panggil('daftar_templat', {})).teks).map((t) => t.nama), NAMA);
    for (const n of NAMA) {
      const r = await panggil('pakai_templat', {templat: n, nama: `Uji ${n}`});
      assert.equal(r.galat, false, `${n}: ${r.teks}`);
      const h = JSON.parse(r.teks);
      assert.equal(h.ok, true);
      assert.deepEqual(h.belum_diunggah.vo, Tpl.configMcp(n).vo.map((l) => l.no));
      const p = Pr.buka(uid, h.proyek);
      assert.ok(existsSync(path.join(p.src, 'isi.js')));
    }
    const sebelum = Pr.daftar(uid).length;
    assert.match((await panggil('pakai_templat', {templat: 'tidak-ada', nama: 'x'})).teks, /templat "tidak-ada" tidak ada/);
    assert.equal(Pr.daftar(uid).length, sebelum);
  } finally { await k.close(); await s.close(); }
});

let chromiumAda = false;
try {
  const {chromium} = await import('playwright');
  chromiumAda = existsSync(chromium.executablePath());
} catch { /* tanpa Chromium: pemeriksaan tata letak dan render asap dilewati */ }

test('tiap templat: tata letak bersih (teks di dalam stage, kapsi ada, tidak ada frame hitam) dan render 60 frame',
  {skip: !chromiumAda && 'Chromium tidak terpasang', timeout: 600_000}, async () => {
    const R = await import('../lib/render.mjs');
    const {durasi} = await import('../lib/ff.mjs');
    const akar = mkdtempSync(path.join(os.tmpdir(), 'motion-templat-r-'));
    try {
      for (const n of NAMA) {
        const dir = path.join(akar, n);
        Tpl.pasang(n, dir);
        const t = Tpl.buka(n).meta, c = await cli(n);
        const sc = K.bacaScenes(path.join(dir, 'src', 'Video.html'));
        const {C} = K.jadwal(sc);
        const isi = sumberIsi(n);
        // Tanpa timing.js komposisi memakai cadangan: baris i di scene i (+0,2 dtk).
        // Frame 0 = sampul: kapsi pertama sudah harus tampil (IKLAN.md §5).
        const titik = [{t: 0, alasan: 'frame 0 (sampul)', kapsi: isi.kapsi[1]}, ...sc.flatMap((s, i) => [{t: C[s.name] + s.dur / 2, alasan: `tengah ${s.name}`, kapsi: isi.kapsi[i + 1]},
          ...(i ? [{t: C[s.name] + 0.25, alasan: `awal ${s.name}`, teks: false}] : [])])];
        const masalah = await R.periksaVisual(path.join(dir, 'src'), 'Video.html', titik, {kapsi: '#kapsi'});
        assert.deepEqual(masalah, [], `${n}: ${JSON.stringify(masalah)}`);
        assert.equal(c.vo.length >= 4, true);
        // Viewport lebih kecil dari stage (MOTION_VIEWPORT=1400x1600 di mesin render yang sesak):
        // stage harus diskalakan agar muat, bukan terpotong; dsf render mengembalikan 1080 px.
        const {pw} = R.muatPlaywright();
        const b = await pw.chromium.launch(R.OPSI_CHROMIUM);
        const srv = await R.layani(path.join(dir, 'src'));
        try {
          for (const vp of [{width: 800, height: 1200}, {width: 1400, height: 1600}]) {
            const pg = await b.newPage({viewport: vp});
            await pg.goto(`http://127.0.0.1:${srv.port}/Video.html`);
            const r = await pg.evaluate(() => { const x = document.getElementById('stage').getBoundingClientRect(); return {kanan: x.right, bawah: x.bottom}; });
            assert.ok(r.kanan <= vp.width + 0.5 && r.bawah <= vp.height + 0.5, `${n}: stage ${JSON.stringify(r)} terpotong di viewport ${vp.width}x${vp.height}`);
            await pg.close();
          }
        } finally { await b.close(); srv.tutup(); }
        mkdirSync(path.join(dir, 'aset'), {recursive: true});
        const audio = path.join(dir, 'aset', 'master.wav');
        execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', `anullsrc=r=48000:cl=stereo:d=${t.detik}`, audio]);
        const keluar = path.join(dir, `${n}.mp4`);
        const r = await R.render({dirSrc: path.join(dir, 'src'), berkas: 'Video.html', audio, keluaran: keluar, batasFrame: 60, tab: 2, dirProyek: dir});
        assert.deepEqual([r.lebar, r.tinggi, r.frame], [1080, 1920, 60], n);
        assert.ok(Math.abs(durasi(keluar) - 2) < 0.15, `${n}: durasi ${durasi(keluar)}`);
      }
    } finally { rmSync(akar, {recursive: true, force: true}); }
  });
