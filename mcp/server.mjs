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

try {
  periksaLingkungan();
} catch (e) {
  console.error(`motion-mcp tidak dimulai: ${e.message}`);
  process.exit(1);
}

const PORT = Number(process.env.PORT || 8420);
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(express.json({limit: `${Pr.BATAS.unduhMb * 1.4 + 2}mb`}));

app.get('/sehat', (_req, res) => res.json({ok: true}));

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
    console.error(`mcp: galat transport ${e?.name || 'Error'}`);
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
  if (!/\.(mp4|jpg)$/i.test(berkas) || !Pr.cekTautan(uid, proyek, berkas, req.query.exp, req.query.sig)) return res.status(403).end();
  let f;
  // Proyek tidak ada atau jalur keluar dari proyek: jawab 404 agar keberadaan proyek tidak bocor.
  try { f = Pr.jalurAman(Pr.buka(uid, proyek).dir, berkas); } catch { return res.status(404).end(); }
  if (!existsSync(f)) return res.status(404).end();
  res.set({
    'Content-Type': berkas.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg',
    'Content-Length': statSync(f).size,
    'Content-Disposition': `inline; filename="${path.basename(f)}"`,
    'Cache-Control': 'private, max-age=3600',
  });
  createReadStream(f).pipe(res);
});

app.listen(PORT, () => {
  console.log(`motion-mcp di :${PORT} · data ${Pr.DATA}`);
  const bersih = () => { try { const n = Pr.bersihkan(); if (n) console.log(`retensi: ${n} proyek lama dihapus`); } catch (e) { console.error('retensi:', e.message); } };
  bersih();
  setInterval(bersih, 6 * 3600e3).unref();
});
