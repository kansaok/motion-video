#!/usr/bin/env node
/* Impor proyek Claude Design dari tautan, tanpa zip dan tanpa tab Chrome manual (P6-10).
     node bin/impor-design.mjs <tautan|projectId> <folder-proyek> [--profil=<dir>] [--cdp=<url>] [--masuk]
   Satu kali: `--masuk` membuka jendela Chromium untuk login ke claude.ai; sesinya disimpan di
   profil (bawaan ~/.motion/profil-claude). Sesudahnya impor berjalan headless.
   `--cdp=http://127.0.0.1:9222` memakai Chrome yang sudah berjalan dan login. Logika dan validasi
   ada di lib/imporDesain.mjs; berkas ini hanya mengirim POST dari dalam halaman claude.ai. */
import os from 'node:os';
import path from 'node:path';
import {mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {muatPlaywright, OPSI_CHROMIUM} from '../lib/render.mjs';
import * as D from '../lib/imporDesain.mjs';

/* Halaman Design yang berat membuat JavaScript di tab macet; robots.txt adalah halaman
   claude.ai paling ringan yang tetap satu origin (README "Impor dari tautan Claude Design"). */
const HALAMAN = 'https://claude.ai/robots.txt';

/** @param {{projectId: string, profil: string, cdp?: any, masuk?: boolean}} o */
export async function bukaSumber({projectId, profil, cdp, masuk}) {
  const {pw} = muatPlaywright();
  let konteks, tutup;
  if (cdp) {
    const b = await pw.chromium.connectOverCDP(cdp);
    konteks = b.contexts()[0] || await b.newContext();
    tutup = () => b.close();
  } else {
    mkdirSync(profil, {recursive: true});
    konteks = await pw.chromium.launchPersistentContext(profil, {
      ...OPSI_CHROMIUM, headless: !masuk,
    });
    tutup = () => konteks.close();
  }
  const halaman = await konteks.newPage();
  await halaman.goto(HALAMAN, {waitUntil: 'domcontentloaded', timeout: 30000});
  if (masuk) {
    await halaman.goto('https://claude.ai/login');
    console.log('  login ke claude.ai di jendela yang terbuka, lalu tutup jendelanya...');
    await halaman.waitForEvent('close', {timeout: 600000}).catch(() => {});
    await tutup();
    return null;
  }
  const panggil = async (metode, badan) => {
    const r = await halaman.evaluate(async ({url, badan}) => {
      const res = await fetch(url, {method: 'POST', credentials: 'include',
        headers: {'content-type': 'application/json'}, body: JSON.stringify(badan)});
      return {status: res.status, teks: await res.text()};
    }, {url: `${D.LAYANAN}/${metode}`, badan});
    if (r.status === 401 || r.status === 403) throw new Error(`${metode}: ${r.status} — sesi claude.ai tidak login atau tidak berhak atas proyek ini; jalankan sekali dengan --masuk`);
    if (r.status === 404) throw new Error(`${metode}: 404 — endpoint berubah atau projectId salah (${projectId.slice(0, 8)}…)`);
    if (r.status < 200 || r.status >= 300) throw new Error(`${metode}: HTTP ${r.status}: ${r.teks.slice(0, 200)}`);
    try { return JSON.parse(r.teks); }
    catch { throw new Error(`${metode}: respons bukan JSON (${r.teks.slice(0, 80).replace(/\s+/g, ' ')}) — kemungkinan halaman login`); }
  };
  return {
    daftar: () => panggil('ListFiles', {projectId, path: ''}),
    ambil: (p) => panggil('GetFile', {projectId, path: p}),
    tutup,
  };
}

export async function jalankan(argv) {
  const bendera = Object.fromEntries(argv.filter((a) => a.startsWith('--')).map((a) => { const i = a.indexOf('='); const [k, v] = i < 0 ? [a.slice(2)] : [a.slice(2, i), a.slice(i + 1)]; return [k, v ?? true]; }));
  const posisi = argv.filter((a) => !a.startsWith('--'));
  const profil = path.resolve(String(bendera.profil || path.join(os.homedir(), '.motion', 'profil-claude')));
  if (bendera.masuk) { await bukaSumber({projectId: '-', profil, cdp: bendera.cdp, masuk: true}); console.log('  sesi tersimpan'); return null; }
  if (posisi.length < 2) throw new Error('pakai: impor-design.mjs <tautan|projectId> <folder-proyek> [--profil=<dir>] [--cdp=<url>] | --masuk');
  const projectId = D.idProyek(posisi[0]);
  const src = path.join(path.resolve(posisi[1]), 'src');
  const sumber = await bukaSumber({projectId, profil, cdp: bendera.cdp});
  try {
    const h = await D.impor(sumber, src, {log: (s) => console.log(s)});
    console.log(`  ${h.berkas.length} berkas, ${(h.bytes / 1024).toFixed(0)} KB ke ${src}; ${h.dibuang} B suntikan editor dibuang`);
    return {src, ...h};
  } finally { await sumber.tutup(); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  jalankan(process.argv.slice(2)).catch((e) => { console.error(`✖ ${e.message}`); process.exit(1); });
}
