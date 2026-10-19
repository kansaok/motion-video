/* Cara mengeja akronim dan domain untuk TTS. Angkanya hasil pengukuran, bukan dugaan:
   tiap bentuk di bawah digenerate lalu ditranskrip balik lewat speech-to-text pada suara
   yang sama.

   Menulis nama hurufnya sendiri ternyata SALAH. TTS menyatukannya jadi satu kata:

     'Ce Te We A'     -> "Chat WA"       ✖ terdengar sebagai satu kata
     'Ce-Te-We-A'     -> "chat WA"       ✖ sama saja
     'C.T.W.A.'       -> "CTW atau"      ✖ lebih parah
     'Ce, Te, We, A'  -> "C, T, W, a"    ✓ benar, tetapi +1,0 detik per akronim
     'C T W A'        -> "CTWA"          ✓ benar, dan TANPA tambahan waktu

   Huruf kapital berspasi sudah dibaca sebagai nama huruf secara bawaan, jadi itu yang
   dipakai. Deretan DUA huruf tidak pernah menyatu, jadi TLD boleh ditulis nama hurufnya
   langsung dan terdengar lebih luwes. */

// 'CTWA' -> 'C T W A' · 'ctwa_clid' -> 'C T W A C L I D'
export const eja = (kata) => String(kata).toUpperCase().replace(/[^A-Z0-9]+/g, ' ')
  .trim().split(/\s+/).map((w) => w.split('').join(' ')).join(' ');

/* Bagaimana tiap TLD diucapkan sesudah "dot". `.id` dieja hurufnya — orang Indonesia
   menyebutnya "dot ai-di", bukan membaca "id" sebagai kata. Yang tidak terdaftar dibaca
   apa adanya. */
export const TLD_UCAP = {
  id: 'Ai Di', io: 'Ai O', ai: 'Ei Ai', tv: 'Ti Vi', me: 'Em I',
  co: 'ko', com: 'kom', biz: 'bis',
};

export const TLD = Object.keys(TLD_UCAP)
  .concat(['net', 'org', 'dev', 'app', 'xyz', 'info', 'web', 'my', 'sg', 'store', 'shop', 'online', 'site'])
  .join('|');

/* Titik di dalam domain dibaca "dot", bukan "titik". Titiknya harus menempel di dua sisi
   dan TLD-nya harus ada di daftar, supaya `Rp 148.500.000` dan titik akhir kalimat aman. */
const RE_DOMAIN = new RegExp(String.raw`(?<=[a-z0-9])\.(${TLD})\b`, 'gi');

/* ID klik iklan dibaca per huruf dengan cara orang Indonesia di dunia iklan: "ef be ce el
   ai di" (Rama, 3 Okt 2026). Bukan "F B klid" — dan bukan huruf kapital berspasi, karena
   'F B C L I D' memakai nama huruf bawaan TTS ("i", "de"), sedangkan yang diminta "ai", "di".
   Koma wajib: tanpa koma nama huruf menyatu jadi satu kata (lihat catatan di atas). Teks
   VO dan kapsi tetap menulis `fbclid`; hanya yang dikirim ke TTS yang diubah. */
export const KLIK_ID_UCAP = {
  fbclid: 'ef, be, ce, el, ai, di',
  gclid: 'ji, ce, el, ai, di',
  ttclid: 'ti, ti, ce, el, ai, di',
};
const RE_KLIK_ID = new RegExp(String.raw`\b(${Object.keys(KLIK_ID_UCAP).join('|')})\b`, 'gi');
export const klikId = (teks) => teks.replace(RE_KLIK_ID, (k) => KLIK_ID_UCAP[k.toLowerCase()]);

export const domain = (teks) =>
  teks.replace(RE_DOMAIN, (_, t) => ` dot ${TLD_UCAP[t.toLowerCase()] ?? t}`);
