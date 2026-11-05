/* `motion kirim` (P8-12): salin hasil akhir ke `~/Videos/Ads/<Merek>/<Angle>/` dengan nama
   `<merek>-<angle>-<rasio>.mp4` dan tulis `naskah.md` (CLAUDE.md "Tempat berkas"). Dulu tangan:
   nama berkas, rasio, dan angka mutu disalin satu per satu, dan naskah.md ditulis ulang dari
   ingatan sesudah VO bergeser.

   Tidak ada panggilan API. Yang dijaga:
   - Gerbang mutu dengan ambang yang sama dengan `check` / `--semua-varian` (`Pipa.nilaiVarian`).
     MP4 yang melanggar -1 dBTP tidak sampai ke folder kirim kecuali `paksa`, dan itu dicatat.
   - Berkas tujuan yang sudah ada dan isinya beda TIDAK ditimpa tanpa `timpa`: mungkin itu video
     yang sudah dikirim ke klien atau naskah.md yang disunting tangan.
   - Draf (`-draf.mp4`) dan potongan (`-potong-`) tidak pernah ikut: yang dikirim hanya keluaran
     komposisi utama dan `varian`. */
import {copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {durasi, ukuranGambar} from './ff.mjs';
import * as K from './komposisi.mjs';
import * as T from './tata.mjs';
import * as P from './periksa.mjs';
import {labelRasio} from './render.mjs';
import {daftarVarian, nilaiVarian} from './pipa.mjs';
import {bacaTimeline} from './timeline.mjs';

/** @param {string} s */
export const slug = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const akarKirim = () => process.env.MOTION_KIRIM || path.join(os.homedir(), 'Videos', 'Ads');

/**
 * Daftar salinan, tanpa menyalin apa pun.
 * @param {import('./tipe.mjs').Config} c
 * @param {{merek: string, angle: string, akar?: string}} o
 */
export function rencanaKirim(c, {merek, angle, akar = akarKirim()}) {
  if (!merek || !angle) throw new Error('butuh merek dan angle (--merek=… --angle=…, atau `kirim: {merek, angle}` di config)');
  const tujuan = path.join(akar, merek, angle);
  const awal = `${slug(merek)}-${slug(angle)}`;
  const mp4 = daftarVarian(c).map((v) => path.join(c.dir, v.keluaran)).filter(existsSync).map((f) => {
    const {lebar, tinggi} = ukuranGambar(f);
    const rasio = labelRasio(lebar, tinggi);
    const sampul = f.replace(/\.mp4$/i, '-sampul.jpg');
    return {dari: f, ke: path.join(tujuan, `${awal}-${rasio}.mp4`), rasio, lebar, tinggi,
      sampul: existsSync(sampul) ? {dari: sampul, ke: path.join(tujuan, `${awal}-${rasio}-sampul.jpg`)} : null};
  });
  if (!mp4.length) throw new Error(`belum ada MP4 di ${c.dir} — jalankan motion render dulu`);
  const ganda = mp4.map((x) => x.rasio).filter((r, i, a) => a.indexOf(r) !== i);
  if (ganda.length) throw new Error(`dua MP4 berasio sama (${[...new Set(ganda)].join(', ')}): nama kirim akan bertabrakan`);
  // Subtitle milik MP4 utama melayani semua rasio (timeline sama).
  const bahasa = c.suara?.bahasa || 'id';
  const dasar = path.join(c.dir, (c.keluaran || `${c.nama}.mp4`).replace(/\.mp4$/i, ''));
  const sub = ['srt', 'vtt'].map((x) => ({dari: `${dasar}.${bahasa}.${x}`, ke: path.join(tujuan, `${awal}.${bahasa}.${x}`)}))
    .filter((x) => existsSync(x.dari));
  return {tujuan, awal, mp4, sub};
}

/* Posisi tiap baris VO dari berkas yang ADA (tanpa generate), penempatan `tata` yang sama dengan
   mixer dan subtitle. @param {import('./tipe.mjs').Config} c */
function posisiVo(c) {
  const vo = c.vo.map((l) => ({...l}));
  for (const l of vo) {
    const f = path.join(c.aset, 'vo', `vo-${String(l.no).padStart(2, '0')}.mp3`);
    l.dur = existsSync(f) ? durasi(f) : 0;
  }
  const scenes = bacaTimeline(c);
  const {C, total} = K.jadwal(scenes);
  T.tempatkan(vo, C, c.tata || {});
  return {vo, total};
}

const dtk = (/** @type {number} */ x) => x.toFixed(2).replace('.', ',');
const koma = (/** @type {number} */ x) => String(x).replace('.', ',');
const sel = (/** @type {string} */ s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

/**
 * @param {import('./tipe.mjs').Config} c
 * @param {{merek: string, angle: string, berkas: Array<Record<string, any>>, paksa?: boolean, tanggal?: string}} o
 */
export function naskahMd(c, {merek, angle, berkas, paksa = false, tanggal = new Date().toISOString().slice(0, 10)}) {
  const {vo} = posisiVo(c);
  const s = c.suara || {};
  const baris = [`# ${merek} — ${angle}`, '',
    `Diekspor ${tanggal} oleh \`motion kirim\` dari \`${c.dir}\`.`, ''];
  if (paksa) baris.push('> **Gerbang mutu dilewati (`--paksa`).** Lihat kolom masalah sebelum mengirim.', '');
  baris.push('## Berkas', '', '| rasio | berkas | piksel | detik | LUFS | dBTP | sampul | masalah |', '|---|---|---|---|---|---|---|---|');
  for (const b of berkas) {
    baris.push(`| ${b.rasio} | \`${path.basename(b.ke)}\` | ${b.lebar}x${b.tinggi} | ${dtk(b.detik)} | ${koma(b.lufs)} | ${koma(b.dbtp)} | `
      + `${b.kontras === null ? '-' : `${Math.round(b.kontras * 100)}%`} | ${b.masalah.length ? sel(b.masalah.join('; ')) : '✓'} |`);
  }
  baris.push('', '## Voice-over', '',
    `Suara \`${s.luar ? 'unggahan' : s.id}\`${s.model ? ` (${s.model})` : ''} · speed ${s.speed ?? '-'} · stability ${s.stability ?? '-'} · style ${s.style ?? '-'}`,
    '', '| detik | scene | naskah |', '|---|---|---|');
  for (const l of vo) baris.push(`| ${dtk(l.pos)}–${dtk(l.pos + l.dur)} | ${sel(l.sc)} | ${sel(l.text)} |`);
  baris.push('', '## Musik', '');
  if (!c.musik?.length) baris.push('Tanpa bed musik.');
  for (const m of c.musik || []) {
    const rencana = typeof m.rencana === 'function' ? null : m.rencana;
    baris.push(`- **${m.nama}**: ${m.luar ? 'trek luar' : rencana?.length
      ? `rencana ${rencana.length} bagian (${rencana.map((x) => `${x.detik} dtk ${x.teks || ''}`.trim()).join(' · ')})`
      : sel(m.prompt || '-')}`);
  }
  baris.push('', '## SFX', '');
  if (!c.sfx?.length) baris.push('Tanpa SFX.');
  for (const [nama, detik, prompt] of c.sfx || []) {
    const sumber = typeof detik === 'string' ? detik : `generate ${detik} dtk: ${prompt}`;
    baris.push(`- **${nama}**: ${sel(sumber)}`);
  }
  // Teks layar: templat kontrak v2 menyimpannya di src/isi.js (README "Templat").
  const isi = path.join(c.src, 'isi.js');
  baris.push('', '## Teks layar', '');
  if (existsSync(isi) && readFileSync(isi).length < 20_000) baris.push('```js', readFileSync(isi, 'utf8').trimEnd(), '```');
  else baris.push(`Lihat komposisi \`${c.komposisi}\`.`);
  return `${baris.join('\n')}\n`;
}

const sama = (/** @type {string} */ a, /** @type {string} */ b) => existsSync(b) && readFileSync(a).equals(readFileSync(b));

/**
 * @param {import('./tipe.mjs').Config} c
 * @param {{merek: string, angle: string, akar?: string, timpa?: boolean, paksa?: boolean, tanggal?: string}} o
 */
export function kirim(c, o) {
  const r = rencanaKirim(c, o);
  const {total} = K.jadwal(bacaTimeline(c));
  const berkas = r.mp4.map((x) => {
    const mp4 = P.ringkas(x.dari), sp = P.sampul(x.dari), detik = durasi(x.dari);
    return {...x, detik, lufs: mp4.lufs, dbtp: mp4.dbtp, kontras: sp?.rasio ?? null, masalah: nilaiVarian(mp4, sp, detik, total)};
  });
  const buruk = berkas.filter((b) => b.masalah.length);
  if (buruk.length && !o.paksa) {
    throw new Error(`gerbang mutu: ${buruk.map((b) => `${b.rasio} (${b.masalah.join('; ')})`).join(' · ')} — `
      + 'perbaiki lalu render ulang, atau --paksa (dicatat di naskah.md)');
  }
  const naskah = naskahMd(c, {...o, berkas, paksa: Boolean(buruk.length && o.paksa)});
  const fNaskah = path.join(r.tujuan, 'naskah.md');
  const salinan = [...berkas.flatMap((b) => [b, ...(b.sampul ? [b.sampul] : [])]), ...r.sub];
  const bentrok = [...salinan.filter((x) => existsSync(x.ke) && !sama(x.dari, x.ke)).map((x) => x.ke),
    ...(existsSync(fNaskah) && readFileSync(fNaskah, 'utf8') !== naskah ? [fNaskah] : [])];
  if (bentrok.length && !o.timpa) {
    throw new Error(`sudah ada dan isinya beda (tidak ditimpa tanpa --timpa): ${bentrok.map((f) => path.basename(f)).join(', ')}`);
  }
  mkdirSync(r.tujuan, {recursive: true});
  for (const x of salinan) copyFileSync(x.dari, x.ke);
  writeFileSync(fNaskah, naskah);
  return {tujuan: r.tujuan, berkas, sub: r.sub.length, naskah: fNaskah};
}
