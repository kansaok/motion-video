#!/usr/bin/env node
/* motion-mcp — server MCP (Streamable HTTP, stateless) di atas lib/ motion-engine.

   Token langganan dibaca dari dua tempat:
     Authorization: Bearer <token>       Claude Code, Claude Desktop (config), klien MCP lain
     /mcp/<token>                        custom connector claude.ai, yang hanya meminta URL
   Keduanya diverifikasi ke API bimp (auth.mjs). */
import express from 'express';
import path from 'node:path';
import {existsSync, createReadStream, statSync} from 'node:fs';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {buatServer} from './alat.mjs';
import {verifikasi} from './auth.mjs';
import * as Pr from './proyek.mjs';
import {periksaLingkungan} from './env.mjs';
import * as Log from './log.mjs';
import * as M from './metrik.mjs';
import * as A from './antrean.mjs';
import {kesiapan, diskBebasMb} from './sehat.mjs';

try {
  periksaLingkungan();
} catch (e) {
  Log.galat('motion-mcp tidak dimulai', {galat: e});
  process.exit(1);
}

const PORT = Number(process.env.PORT || 8420);
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(express.json({limit: `${Pr.BATAS.unduhMb * 1.4 + 2}mb`}));

/* /hidup: proses menjawab. /siap: alat render ada dan disk DATA cukup. /sehat dipakai
   HEALTHCHECK Docker dan berarti sama dengan /siap, supaya disk yang hampir penuh tampak
   sebagai container unhealthy sebelum render pelanggan gagal di tengah jalan. */
app.get('/hidup', (_req, res) => res.json({ok: true}));
const siap = (_req, res) => {
  const k = kesiapan({dir: Pr.DATA});
  res.status(k.siap ? 200 : 503).json({ok: k.siap, ...k});
};
app.get('/siap', siap);
app.get('/sehat', siap);

/* Ukuran DATA dihitung dengan menelusuri pohon berkas; di-cache 5 menit agar scrape tiap
   15 detik tidak menjadi beban I/O. */
let ukuranData = {t: 0, byte: 0};
const pakaiData = () => {
  if (Date.now() - ukuranData.t > 300_000) ukuranData = {t: Date.now(), byte: Pr.ukuranPohon(Pr.DATA)};
  return ukuranData.byte;
};
M.registri.gauge('motion_antrean_panjang', 'Render yang menunggu di antrean.', () => A.ringkasAntrean().antre);
M.registri.gauge('motion_render_jalan', 'Render yang sedang berjalan.', () => A.ringkasAntrean().jalan);
M.registri.gauge('motion_data_byte', 'Pemakaian disk volume DATA, byte (cache 5 menit).', pakaiData);
M.registri.gauge('motion_disk_bebas_byte', 'Ruang bebas filesystem DATA, byte.', () => diskBebasMb(Pr.DATA) * 1048576);
M.registri.gauge('motion_akun_aktif', 'Akun yang menyentuh proyek dalam 1 dan 7 hari terakhir.',
  () => [1, 7].map((hari) => [{hari: String(hari)}, Pr.akunAktif(hari)]));

app.get('/metrik', async (req, res) => {
  if (!M.bolehMetrik(req.socket.remoteAddress, req.headers)) return res.status(404).end();
  res.type('text/plain; version=0.0.4').send(await M.registri.teks());
});

const tolak = (res, kode, pesan) => res.status(kode).json({jsonrpc: '2.0', error: {code: -32001, message: pesan}, id: null});

async function mcp(req, res) {
  const token = req.params.token || (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  let u;
  try { u = await verifikasi(token); } catch (e) { return tolak(res, 503, e.message); }
  if (!u) {
    res.set('WWW-Authenticate', 'Bearer realm="motion-mcp"');
    return tolak(res, 401, 'token tidak sah atau langganan Motion MCP tidak aktif — kelola di menu Tools bi1mp');
  }
  // Stateless: satu server + transport per permintaan, tidak ada sesi yang harus diingat
  // di antara restart container.
  const server = buatServer(u.user_id);
  const transport = new StreamableHTTPServerTransport({sessionIdGenerator: undefined, enableJsonResponse: true});
  res.on('close', () => { transport.close(); server.close(); });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (e) {
    // Error transport bisa menyertakan URL request; jangan sampai token pada /mcp/:token
    // tercetak ke stdout container lalu tersimpan di agregator log.
    Log.galat('mcp: galat transport', {uid: u.user_id, jenis: e?.name || 'Error'});
    if (!res.headersSent) tolak(res, 500, 'galat internal');
  }
}

for (const jalur of ['/mcp', '/mcp/:token']) {
  app.post(jalur, mcp);
  // Mode stateless tidak punya aliran SSE GET maupun sesi untuk DELETE.
  app.get(jalur, (_req, res) => res.status(405).set('Allow', 'POST').end());
  app.delete(jalur, (_req, res) => res.status(405).set('Allow', 'POST').end());
}

/* Tautan unduh hasil render. Bertanda tangan HMAC + kedaluwarsa, jadi bisa dibuka di browser
   pengguna tanpa token MCP, dan tidak bisa ditebak untuk proyek orang lain. */
app.get('/unduh/:uid/:proyek/:berkas', (req, res) => {
  const {uid, proyek, berkas} = req.params;
  if (!/\.(mp4|jpg|srt|vtt|txt)$/i.test(berkas) || !Pr.cekTautan(uid, proyek, berkas, req.query.exp, req.query.sig)) return res.status(403).end();
  let f;
  // Proyek tidak ada atau jalur keluar dari proyek: jawab 404 agar keberadaan proyek tidak bocor.
  try { f = Pr.jalurAman(Pr.buka(uid, proyek).dir, berkas); } catch { return res.status(404).end(); }
  if (!existsSync(f)) return res.status(404).end();
  res.set({
    'Content-Type': {mp4: 'video/mp4', jpg: 'image/jpeg', srt: 'application/x-subrip; charset=utf-8',
      vtt: 'text/vtt; charset=utf-8', txt: 'text/plain; charset=utf-8'}[path.extname(berkas).slice(1).toLowerCase()],
    'Content-Length': statSync(f).size,
    'Content-Disposition': `inline; filename="${path.basename(f)}"`,
    'Cache-Control': 'private, max-age=3600',
  });
  createReadStream(f).pipe(res);
});

app.listen(PORT, () => {
  Log.info('motion-mcp mulai', {port: PORT, data: Pr.DATA});
  try {
    const n = A.bersihkanTmpYatim();
    if (n) Log.info('tmp yatim dibersihkan', {jumlah: n});
  } catch (e) { Log.galat('pembersihan tmp gagal', {galat: e}); }
  const bersih = () => {
    try {
      const h = Pr.bersihkan();
      if (h.proyek || h.ringan) Log.info('retensi', {proyekDihapus: h.proyek, hasilAntaraDihapus: h.ringan, mb: Math.round(h.byte / 1048576)});
    } catch (e) { Log.galat('retensi gagal', {galat: e}); }
  };
  bersih();
  // Tiap jam: hasil antara proyek yang sehari tak disentuh dibuang tidak lama sesudah batasnya.
  setInterval(bersih, 3600e3).unref();
});
