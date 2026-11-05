/* Dasbor admin (P6-09): antrean, render yang jalan, riwayat, disk per akun, dan tombol batalkan.
   Tujuannya satu: render yang macet bisa dihentikan tanpa `docker restart` (yang memutus semua
   render dan sesi MCP pelanggan lain).

   Akses: hanya bila ADMIN_TOKEN (>= 32 karakter) diisi; tanpa itu rute ini 404 seperti tidak ada.
   HTTP Basic (nama bebas, sandi = ADMIN_TOKEN) supaya bisa dibuka di browser lewat HTTPS proxy.
   Basic dikirim otomatis oleh browser, jadi tombol batalkan memakai token CSRF per render
   (HMAC ADMIN_TOKEN). Halaman tanpa JavaScript; nama proyek dan galat berasal dari pelanggan,
   jadi SEMUA teks di-escape dan CSP melarang skrip. */
import {createHash, createHmac, timingSafeEqual} from 'node:crypto';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import express from 'express';

const MIN_TOKEN = 32;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
const sama = (a, b) => timingSafeEqual(createHash('sha256').update(String(a)).digest(), createHash('sha256').update(String(b)).digest());
export const tokenBatal = (token, id) => createHmac('sha256', token).update(`batal:${id}`).digest('hex');
const mb = (b) => `${(b / 1048576).toFixed(b < 10 * 1048576 ? 1 : 0)} MB`;

/** @param {string | undefined} token */
export function adminAktif(token) { return typeof token === 'string' && token.length >= MIN_TOKEN; }

/* Riwayat dari render.json tiap proyek: tugas di memori hanya yang < 1 jam. */
export function riwayat(DATA, n = 30) {
  const u = path.join(DATA, 'u');
  if (!existsSync(u)) return [];
  const out = [];
  for (const uid of readdirSync(u)) {
    for (const id of readdirSync(path.join(u, uid))) {
      const f = path.join(u, uid, id, 'render.json');
      if (!existsSync(f)) continue;
      try { out.push(JSON.parse(readFileSync(f, 'utf8'))); } catch { /* render.json rusak: lewati baris ini saja */ }
    }
  }
  return out.sort((a, b) => String(b.selesai || b.dibuat).localeCompare(String(a.selesai || a.dibuat))).slice(0, n);
}

/** @param {string} DATA @param {(uid: string) => number} pakai */
export function diskAkun(DATA, pakai) {
  const u = path.join(DATA, 'u');
  if (!existsSync(u)) return [];
  return readdirSync(u).map((uid) => ({uid, proyek: readdirSync(path.join(u, uid)).length, byte: pakai(uid)}))
    .sort((a, b) => b.byte - a.byte);
}

function halaman({tugas, riwayatRender, akun, token, kuotaMb}) {
  const jalan = tugas.filter((t) => t.status === 'jalan'), antre = tugas.filter((t) => t.status === 'antre').sort((a, b) => a.urutan - b.urutan);
  const tombol = (t) => `<form method="post" action="/admin/batalkan/${esc(t.id)}"><input type="hidden" name="csrf" value="${tokenBatal(token, t.id)}">`
    + `<button>batalkan</button></form>`;
  const baris = (t, aksi) => `<tr><td><code>${esc(t.id)}</code></td><td>${esc(t.uid)}</td><td>${esc(t.proyek)}</td><td>${esc(t.status)}</td>`
    + `<td>${esc(t.langkah)}</td><td>${esc(t.mulai || t.dibuat)}</td><td>${esc(t.galat || '')}</td><td>${aksi ? tombol(t) : ''}</td></tr>`;
  const tabel = (judul, isi, kosong) => `<h2>${judul}</h2>${isi.length ? `<table><tr><th>render</th><th>akun</th><th>proyek</th><th>status</th>`
    + `<th>langkah</th><th>waktu</th><th>galat</th><th></th></tr>${isi.join('')}</table>` : `<p>${kosong}</p>`}`;
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta http-equiv="refresh" content="15">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>motion-mcp admin</title>
<style>body{font:14px system-ui,sans-serif;margin:16px;color:#222}table{border-collapse:collapse;width:100%;margin-bottom:8px}
td,th{border-bottom:1px solid #ddd;padding:4px 6px;text-align:left;vertical-align:top}code{font-size:12px}
button{background:#b00020;color:#fff;border:0;padding:3px 8px;border-radius:3px;cursor:pointer}</style></head><body>
<h1>motion-mcp</h1><p>${jalan.length} jalan · ${antre.length} antre · diperbarui ${esc(new Date().toISOString())} (otomatis tiap 15 dtk)</p>
${tabel('Sedang jalan', jalan.map((t) => baris(t, true)), 'tidak ada render yang jalan')}
${tabel('Antre', antre.map((t) => baris(t, true)), 'antrean kosong')}
${tabel('Riwayat terakhir', riwayatRender.map((t) => baris(t, false)), 'belum ada render')}
<h2>Disk per akun (kuota ${esc(kuotaMb)} MB)</h2><table><tr><th>akun</th><th>proyek</th><th>terpakai</th></tr>
${akun.map((a) => `<tr><td>${esc(a.uid)}</td><td>${a.proyek}</td><td>${mb(a.byte)}${a.byte > kuotaMb * 1048576 * 0.9 ? ' ⚠' : ''}</td></tr>`).join('')}</table>
</body></html>`;
}

/**
 * @param {import('express').Express} app
 * @param {{token?: string, daftarTugas: () => any[], batalkan: (uid: any, id: string, o: object) => any,
 *   DATA: string, pakai: (uid: string) => number, kuotaMb: number, log?: (pesan: string, data: object) => void}} o
 */
export function pasangAdmin(app, o) {
  const r = express.Router();
  r.use((req, res, next) => {
    if (!adminAktif(o.token)) return res.status(404).end();
    res.set({'Cache-Control': 'no-store', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'"});
    const m = /^Basic (.+)$/.exec(req.get('authorization') || '');
    const sandi = m ? Buffer.from(m[1], 'base64').toString('utf8').split(':').slice(1).join(':') : '';
    if (!m || !sama(sandi, o.token)) return res.status(401).set('WWW-Authenticate', 'Basic realm="motion-mcp admin", charset="UTF-8"').end();
    next();
  });
  r.get('/', (_req, res) => {
    res.type('html').send(halaman({tugas: o.daftarTugas(), riwayatRender: riwayat(o.DATA), akun: diskAkun(o.DATA, o.pakai),
      token: o.token, kuotaMb: o.kuotaMb}));
  });
  r.post('/batalkan/:id', express.urlencoded({extended: false, limit: '2kb'}), (req, res) => {
    const id = String(req.params.id);
    if (!sama(String(req.body?.csrf || ''), tokenBatal(o.token, id))) return res.status(403).type('text').send('token formulir tidak sah');
    try {
      const h = o.batalkan(null, id, {admin: true});
      o.log?.('admin batalkan render', {render: id, status: h.status});
      res.redirect(303, '/admin');
    } catch (e) {
      res.status(409).type('text').send(String(e.message));
    }
  });
  app.use('/admin', r);
}
