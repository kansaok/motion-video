/* P6-01: `motion doctor`. Putusan tiap cek diuji dengan mesin palsu (`alat`), supaya ffmpeg
   yang hilang, tmpfs yang sesak, atau Chromium yang gagal diluncurkan bisa diuji tanpa merusak
   mesin uji. Akses ElevenLabs diuji terhadap server tiruan lokal. */
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import http from 'node:http';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import * as D from '../lib/doktor.mjs';
import * as EL from '../lib/el.mjs';
import {DOKTER} from '../lib/konstanta.mjs';

const AKAR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GB = 1024 ** 3;

const daftarFfmpeg = (kode, nama) => `Legenda:\n ${kode[0]} = keterangan\n${nama.map((n) => ` ${kode} ${n.padEnd(18)} A->A  x`).join('\n')}\n`;

/** Mesin sehat; tiap tes menimpa satu bagian. */
function mesin(timpa = {}) {
  const filter = timpa.filter ?? DOKTER.filter;
  const encoder = timpa.encoder ?? DOKTER.encoder;
  const tidakAda = new Set(timpa.tidakAda || []);
  return {
    env: {ELEVENLABS_API_KEY: 'kunci-uji'},
    versiNode: '22.3.0',
    akar: AKAR,
    berkasEnv: '/x/.env',
    tmp: '/tmp',
    ada: (p) => !(timpa.hilang || []).some((h) => p.includes(h)),
    jalankan: (cmd, args) => {
      if (tidakAda.has(cmd)) return {status: null, stdout: '', stderr: '', galat: Object.assign(new Error('spawn ENOENT'), {code: 'ENOENT'})};
      if (args.includes('-filters')) return {status: 0, stdout: daftarFfmpeg('..C', filter), stderr: ''};
      if (args.includes('-encoders')) return {status: 0, stdout: daftarFfmpeg('V....D', encoder), stderr: ''};
      return {status: 0, stdout: `${cmd} version 7.0-uji Copyright`, stderr: ''};
    },
    statfs: () => timpa.statfs ?? {bsize: 4096, bavail: (50 * GB) / 4096, blocks: (100 * GB) / 4096, bfree: (50 * GB) / 4096},
    tipeMount: () => timpa.mount ?? {titik: '/', tipe: 'ext4'},
    playwright: async () => {
      if (timpa.playwrightGalat) throw new Error(timpa.playwrightGalat);
      return {versi: timpa.versiPw ?? '1.64.1', dari: `${AKAR}/lib/`, pw: {chromium: {executablePath: () => '/cache/chrome'}}};
    },
    luncurChromium: async () => { if (timpa.luncurGalat) throw new Error(timpa.luncurGalat); },
    encoder: async () => ({nama: 'libx264', alasan: 'GPU NVIDIA tidak ada'}),
    aksesEL: async () => timpa.el ?? {tier: 'creator', character_limit: 100000, character_count: 2500},
    ...timpa.alat,
  };
}
const per = (h) => Object.fromEntries(h.map((x) => [x.nama, x]));

test('mesin sehat: tidak ada gagal, laporan "siap"', async () => {
  const h = await D.periksa({}, mesin());
  assert.deepEqual(h.filter((x) => x.status !== 'ok').map((x) => x.nama), []);
  assert.match(per(h).ElevenLabs.detail, /sisa 97\.500 kredit/);
  assert.match(D.lapor(h), /siap: semua prasyarat terpenuhi/);
});

test('Node di bawah engines package.json gagal', async () => {
  const h = per(await D.periksa({}, mesin({alat: {versiNode: '18.19.0'}})));
  assert.equal(h.Node.status, 'gagal');
  assert.match(h.Node.detail, /butuh ≥ 20/);
});

test('ffmpeg tidak ada: gagal dengan cara pasang, encoder tidak dicoba', async () => {
  const h = per(await D.periksa({}, mesin({tidakAda: ['ffmpeg', 'ffprobe']})));
  assert.equal(h.ffmpeg.status, 'gagal');
  assert.match(h.ffmpeg.saran, /apt install ffmpeg/);
  assert.equal(h.ffprobe.status, 'gagal');
  assert.equal(h['encoder video'].status, 'lewat');
});

test('build ffmpeg minimal: filter dan encoder yang hilang disebut namanya', async () => {
  const h = per(await D.periksa({}, mesin({
    filter: DOKTER.filter.filter((f) => f !== 'sidechaincompress'),
    encoder: ['aac', 'mjpeg'],
  })));
  assert.equal(h.ffmpeg.status, 'gagal');
  assert.match(h.ffmpeg.detail, /filter hilang: sidechaincompress; encoder hilang: libx264/);
});

test('/tmp tmpfs ≥ 70% gagal dengan saran TMPDIR; disk biasa yang sama penuhnya lolos', async () => {
  const penuh = {bsize: 4096, bavail: (4.8 * GB) / 4096, blocks: (16 * GB) / 4096, bfree: (4.8 * GB) / 4096};
  const t = per(await D.periksa({}, mesin({statfs: penuh, mount: {titik: '/tmp', tipe: 'tmpfs'}})));
  assert.equal(t['disk TMPDIR'].status, 'gagal');
  assert.match(t['disk TMPDIR'].detail, /70% terpakai \(tmpfs\)/);
  assert.match(t['disk TMPDIR'].saran, /frame 250.*TMPDIR=\$HOME\/render\/tmp/);
  const e = per(await D.periksa({}, mesin({statfs: penuh})));
  assert.equal(e['disk TMPDIR'].status, 'ok');
});

test('ruang bebas: < 1 GB gagal, < 4 GB peringatan', async () => {
  const bebas = (gb) => ({bsize: 4096, bavail: (gb * GB) / 4096, blocks: (100 * GB) / 4096, bfree: (gb * GB) / 4096});
  assert.equal(per(await D.periksa({}, mesin({statfs: bebas(0.5)})))['disk repo'].status, 'gagal');
  assert.equal(per(await D.periksa({}, mesin({statfs: bebas(2)})))['disk repo'].status, 'awas');
});

test('kunci kosong: gagal dengan langkah salin .env, ElevenLabs tidak dicoba', async () => {
  let dipanggil = false;
  const h = per(await D.periksa({}, mesin({hilang: ['/x/.env'], alat: {env: {}, aksesEL: async () => { dipanggil = true; }}})));
  assert.equal(h.ELEVENLABS_API_KEY.status, 'gagal');
  assert.match(h.ELEVENLABS_API_KEY.saran, /cp .*\.env\.example \/x\/\.env/);
  assert.equal(h.ElevenLabs.status, 'lewat');
  assert.equal(dipanggil, false);
});

test('penyetel yang salah: BIAYA_MAKS_USD gagal, WORKERS/VIEWPORT/ENCODER peringatan', async () => {
  const h = per(await D.periksa({}, mesin({alat: {env: {ELEVENLABS_API_KEY: 'k', BIAYA_MAKS_USD: 'murah',
    WORKERS: '0', MOTION_VIEWPORT: '1400*1600', MOTION_ENCODER: 'gpu'}}})));
  assert.equal(h.BIAYA_MAKS_USD.status, 'gagal');
  assert.equal(h.penyetel.status, 'awas');
  assert.match(h.penyetel.detail, /WORKERS=0.*MOTION_VIEWPORT=1400\*1600.*MOTION_ENCODER=gpu/);
});

test('Playwright: node_modules hilang, versi beda, Chromium belum diunduh, gagal diluncurkan', async () => {
  let h = per(await D.periksa({}, mesin({hilang: ['node_modules']})));
  assert.match(h.node_modules.saran, /npm ci/);

  h = per(await D.periksa({}, mesin({versiPw: '1.50.0'})));
  assert.equal(h.Playwright.status, 'awas');
  assert.match(h.Playwright.detail, /package\.json mengunci 1\.64\.1/);

  h = per(await D.periksa({}, mesin({hilang: ['/cache/chrome']})));
  assert.equal(h.Chromium.status, 'gagal');
  assert.match(h.Chromium.saran, /npx playwright install chromium/);

  h = per(await D.periksa({}, mesin({luncurGalat: 'browserType.launch: Host system is missing dependencies to run browsers.\n libnss3'})));
  assert.equal(h.Chromium.status, 'gagal');
  assert.match(h.Chromium.saran, /install-deps chromium/);

  h = per(await D.periksa({}, mesin({luncurGalat: 'No usable sandbox! user namespaces'})));
  assert.match(h.Chromium.saran, /user namespaces.*Jangan mematikan sandbox/);

  let diluncurkan = false;
  h = per(await D.periksa({cepat: true}, mesin({alat: {luncurChromium: async () => { diluncurkan = true; }}})));
  assert.equal(diluncurkan, false);
  assert.match(h.Chromium.detail, /--cepat/);
});

test('--luring tidak menyentuh ElevenLabs', async () => {
  const h = per(await D.periksa({luring: true}, mesin({alat: {aksesEL: async () => { throw new Error('tidak boleh'); }}})));
  assert.equal(h.ElevenLabs.status, 'lewat');
});

/* aksesEL bawaan, terhadap server tiruan: satu percobaan saja, tanpa jeda ulang. */
async function tiruan(status, isi) {
  const masuk = [];
  const srv = http.createServer((req, res) => {
    masuk.push({url: req.url, kunci: req.headers['xi-api-key']});
    res.writeHead(status, {'Content-Type': 'application/json'}).end(isi);
  });
  await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
  const asal = EL.dasar.url;
  EL.dasar.url = `http://127.0.0.1:${/** @type {any} */ (srv.address()).port}`;
  return {masuk, tutup: () => { EL.dasar.url = asal; srv.closeAllConnections(); srv.close(); }};
}

test('ElevenLabs: sisa kredit, kunci ditolak, kuota habis, kredit tipis', async () => {
  const aksesEL = D.alatBawaan().aksesEL;
  const cek = async (status, isi) => {
    const s = await tiruan(status, isi);
    try { return {h: per(await D.periksa({}, mesin({alat: {aksesEL}}))).ElevenLabs, masuk: s.masuk}; } finally { s.tutup(); }
  };
  let r = await cek(200, JSON.stringify({tier: 'creator', character_limit: 100000, character_count: 40000}));
  assert.equal(r.h.status, 'ok');
  assert.match(r.h.detail, /paket creator · sisa 60\.000 kredit/);
  assert.deepEqual(r.masuk, [{url: '/v1/user/subscription', kunci: 'kunci-uji'}]);

  r = await cek(401, '{"detail":{"status":"invalid_api_key"}}');
  assert.equal(r.h.status, 'gagal');
  assert.match(r.h.detail, /kunci ditolak \(401\)/);
  assert.equal(r.masuk.length, 1);

  r = await cek(401, '{"detail":{"status":"quota_exceeded"}}');
  assert.match(r.h.detail, /kuota\/kredit habis/);

  r = await cek(200, JSON.stringify({character_limit: 30000, character_count: 29500}));
  assert.equal(r.h.status, 'awas');

  r = await cek(503, 'busy');
  assert.equal(r.h.status, 'gagal');
  assert.match(r.h.detail, /tidak terjangkau: 503/);
  assert.equal(r.masuk.length, 1, 'doctor tidak mengulang: satu percobaan saja');
});

test('tipeMount: titik mount terpanjang menang, spasi di-unescape', () => {
  const mounts = ['/dev/sda1 / ext4 rw 0 0', 'tmpfs /tmp tmpfs rw 0 0', '/dev/sdb1 /tmp/data\\040x ext4 rw 0 0', ''].join('\n');
  assert.deepEqual(D.tipeMount('/tmp/frames', mounts), {titik: '/tmp', tipe: 'tmpfs'});
  assert.deepEqual(D.tipeMount('/tmp/data x/a', mounts), {titik: '/tmp/data x', tipe: 'ext4'});
  assert.deepEqual(D.tipeMount('/tmpx', mounts), {titik: '/', tipe: 'ext4'});
});

test('CLI: `motion doctor --luring --cepat` di mesin ini; kode keluar mengikuti ✖', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-doktor-'));
  try {
    const env = path.join(dir, '.env');
    writeFileSync(env, 'ELEVENLABS_API_KEY=kunci-uji-bukan-asli\n');
    const r = spawnSync(process.execPath, [path.join(AKAR, 'bin/motion.mjs'), 'doctor', '--luring', '--cepat'],
      // Kunci dari lingkungan menang atas .env (lib/env.mjs), jadi dibuang dulu.
      {encoding: 'utf8', env: {...Object.fromEntries(Object.entries(process.env).filter(([k]) => k !== 'ELEVENLABS_API_KEY')), MOTION_ENV: env}});
    assert.match(r.stdout, /✓ Node/);
    assert.match(r.stdout, /ELEVENLABS_API_KEY\s+✓|✓ ELEVENLABS_API_KEY\s+terisi/);
    assert.match(r.stdout, /· ElevenLabs\s+dilewati \(--luring\)/);
    assert.equal(r.status, /✖/.test(r.stdout) ? 1 : 0, r.stdout + r.stderr);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});
