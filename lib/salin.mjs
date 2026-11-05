/* Salin proyek untuk BAHASA lain atau angle lain dari video yang sama (P8-12). Yang tidak bergantung
   bahasa ikut: komposisi, SFX, dan musik (beserta `.kunci`-nya, supaya tidak dibayar ulang). VO tidak:
   naskah baru butuh suara baru, dan durasi scene menyesuaikan VO baru sendiri lewat `tata`.

   Komposisi disalin dari `.asli` (versi sebelum `apply` menyesuaikan durasi): menyalin versi kerja
   membawa durasi bahasa asal, dan `apply` berikutnya akan memperlakukan durasi itu sebagai brief.
   `timing.js` lama (posisi VO bahasa asal) dan jejak kerja mesin (`.asli/.terap/.kunci`) tidak ikut. */
import {copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const JEJAK = /\.(asli|terap|kunci)$/i;

/** Salin pohon src; kembalikan jumlah byte. @param {string} dari @param {string} ke */
export function salinSrc(dari, ke) {
  let byte = 0;
  mkdirSync(ke, {recursive: true});
  for (const e of readdirSync(dari, {withFileTypes: true})) {
    if (e.name.startsWith('.') || JEJAK.test(e.name) || e.name === 'timing.js') continue;
    const a = path.join(dari, e.name), b = path.join(ke, e.name);
    if (e.isDirectory()) { byte += salinSrc(a, b); continue; }
    if (!e.isFile()) continue;                         // symlink tidak diikuti
    const asli = existsSync(`${a}.asli`) ? `${a}.asli` : a;
    copyFileSync(asli, b);
    byte += statSync(b).size;
  }
  return byte;
}

/* SFX (`aset/sfx/*.mp3`) dan musik (`aset/*.mp3`), dengan `.kunci` bila ada. Berkas antara (norm,
   tersembunyi) tidak ikut. @param {string} dari @param {string} ke */
export function salinAsetNonVo(dari, ke) {
  let byte = 0;
  for (const sub of ['sfx', '']) {
    const d = path.join(dari, sub);
    if (!existsSync(d)) continue;
    mkdirSync(path.join(ke, sub), {recursive: true});
    for (const f of readdirSync(d)) {
      if (f.startsWith('.') || !/\.mp3$/i.test(f) || /-norm\.mp3$/i.test(f) || !statSync(path.join(d, f)).isFile()) continue;
      for (const x of [f, `${f}.kunci`]) {
        if (!existsSync(path.join(d, x))) continue;
        copyFileSync(path.join(d, x), path.join(ke, sub, x));
        byte += statSync(path.join(ke, sub, x)).size;
      }
    }
  }
  return byte;
}

/**
 * CLI `motion salin`: proyek baru yang config-nya meng-import config asal (musik, SFX, cue tetap satu
 * sumber) dan hanya mengganti naskah, suara, dan bahasa.
 * @param {string} asal  folder proyek asal (punya motion.config.mjs)
 * @param {string} ke  folder proyek baru (belum ada)
 * @param {{bahasa?: string, suara?: string, vo: Array<{no: number, text: string}>, nama?: string}} o
 */
export function salinCli(asal, ke, o) {
  const cfgAsal = ['motion.config.mjs', 'config.mjs'].map((n) => path.join(asal, n)).find(existsSync);
  if (!cfgAsal) throw new Error(`config tidak ada di ${asal}`);
  if (existsSync(ke) && readdirSync(ke).length) throw new Error(`${ke} sudah ada dan tidak kosong`);
  const nama = o.nama || path.basename(ke);
  salinSrc(path.join(asal, 'src'), path.join(ke, 'src'));
  salinAsetNonVo(path.join(asal, 'aset'), path.join(ke, 'aset'));
  const rel = path.relative(ke, cfgAsal).split(path.sep).join('/');
  const naskah = o.vo.map((l) => `  ${JSON.stringify(l.text)}, // VO-${l.no}`).join('\n');
  writeFileSync(path.join(ke, 'motion.config.mjs'), `// Salinan ${path.basename(asal)}${o.bahasa ? ` untuk bahasa "${o.bahasa}"` : ''} (motion salin, P8-12).
// Terjemahkan NASKAH (urutan = baris vo config asal). Teks layar ada di src/ dan diganti terpisah.
// Musik, SFX, dan cue diambil dari config asal: mengubahnya di sana ikut mengubah salinan ini.
// Lafal, \`dengar\`, dan \`maks\` milik bahasa asal sengaja dibuang; tulis ulang bila perlu.
import dasar from '${rel.startsWith('.') ? rel : `./${rel}`}';

const NASKAH = [
${naskah}
];

export default {
  ...dasar,
  nama: ${JSON.stringify(nama)},
  keluaran: ${JSON.stringify(`${nama}.mp4`)},
  suara: {...dasar.suara${o.suara ? `, id: ${JSON.stringify(o.suara)}` : ''}${o.bahasa ? `, bahasa: ${JSON.stringify(o.bahasa)}` : ''}},
  lafal: {},
  vo: dasar.vo.map(({dengar, maks, coba, ...l}, i) => ({...l, text: NASKAH[i]})),
};
`);
  return {ke, nama};
}
