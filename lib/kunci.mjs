// Cache aset generator yang dikunci ke permintaannya (`<berkas>.kunci`).
import {readFileSync, writeFileSync, existsSync} from 'node:fs';

/* Cache generator dikunci ke PERMINTAANNYA, bukan ke "berkasnya ada". Kuncinya ditulis
   berdampingan sebagai `.kunci`; begitu naskah, prompt, atau parameter suara berubah,
   asetnya diregenerate.

   Tanpa ini satu putaran revisi hilang tanpa jejak: naskah diperbaiki, `style` suara
   dinaikkan, `plan` dijalankan ulang — dan yang dipakai tetap rekaman lama, karena
   berkasnya kebetulan sudah ada. Hasilnya identik dengan putaran sebelumnya sampai ke
   durasi scene-nya, dan itu terbaca seperti perbaikannya yang tidak berhasil. Berlaku
   untuk VO, SFX, dan musik sekaligus — ketiganya dulu memakai syarat yang sama. */
export function segar(berkas, kunci) {
  try {
    return existsSync(berkas) && readFileSync(`${berkas}.kunci`, 'utf8') === JSON.stringify(kunci);
  } catch { return false; } // .kunci belum ada/tak terbaca = basi; akibat terburuknya dibuat ulang
}
export const tandai = (berkas, kunci) => writeFileSync(`${berkas}.kunci`, JSON.stringify(kunci));

