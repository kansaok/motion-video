// Satu sumber untuk urutan scene, naskah VO baru, dan teks layar bagian baru.
// Dipakai oleh motion.config.mjs (VO, cue, musik) dan bangun.mjs (komposisi).
// Satu bab = satu scene `c<k>` yang memuat scene sumber berurutan (batas komposisi: maks 50 scene). Offset VO = offset di scene sumber + awal scene itu di dalam bab (sumber/peta.json).

export const BAB = [
  {
    k: 1, id: 'c1', proj: 'tutorial-tracking', jsx: 'tracking-tutorial.jsx', cfg: 'tracking',
    judul: 'Pasang tracking di website', sub: 'Satu kode, semua halaman terlacak',
    simpan: ['Kode', 'Pasang', 'Developer', 'Uji', 'Hasil'],
    off: [0.5, 5.7, 10.15],
    catatan: [
      {tag: 'Kenapa penting', vo: 'Kode ini dasar semuanya. Tanpa kode, kunjungan website tidak tercatat.',
        tampil: 'Tanpa kode, kunjungan website tidak tercatat.'},
      {tag: 'Salah umum', vo: 'Salah umum: kode hanya di satu halaman. Tempel di header semua halaman.',
        salah: 'Kode hanya di satu halaman', benar: 'Tempel di header semua halaman'},
      {tag: 'Cek cepat', vo: 'Cek: buka website yang sudah terbit. Tunggu status Terverifikasi di Konektor.',
        tampil: 'Buka website yang sudah terbit, lalu tunggu status Terverifikasi.'},
    ],
  },
  {
    k: 2, id: 'c2', proj: 'tutorial-rotator', jsx: 'rotator-tutorial.jsx', cfg: 'rotator',
    judul: 'Link WhatsApp dengan kode pengunjung', sub: 'Setiap klik iklan membawa kode',
    simpan: ['Buat', 'Form', 'Kode', 'Nomor', 'Salin', 'Uji', 'Cocok', 'Hasil'],
    off: [0.5, 4.3, 9.25],
    catatan: [
      {tag: 'Kenapa penting', vo: 'Kode pengunjung adalah jembatan dari klik iklan ke chat WhatsApp.',
        tampil: 'Kode pengunjung menyambung klik iklan ke chat WhatsApp.'},
      {tag: 'Salah umum', vo: 'Salah umum: ganti link setiap tim berganti. Pakai link yang sama, iklan tetap jalan.',
        salah: 'Ganti link setiap tim berganti', benar: 'Pakai link yang sama, iklan tetap jalan'},
      {tag: 'Cek cepat', vo: 'Cek: buka link seperti pengunjung biasa. Pastikan nomor dan pesan pembukanya benar.',
        tampil: 'Buka link seperti pengunjung, lalu cek nomor dan pesan pembuka.'},
    ],
  },
  {
    k: 3, id: 'c3', proj: 'tutorial-ctwa', jsx: 'ctwa-tutorial.jsx', cfg: 'ctwa',
    judul: 'Iklan Click-to-WhatsApp', sub: 'Chat dari iklan, dilacak sampai closing',
    simpan: ['Nomor', 'Iklan', 'Chat', 'Lead', 'Kirim', 'Hasil'],
    off: [0.5, 5.4, 10.6],
    catatan: [
      {tag: 'Kenapa penting', vo: 'Chat dari iklan membawa data klik, jadi Konektor tahu chat itu datang dari iklan mana.',
        tampil: 'Data klik ikut di chat, jadi asal iklannya terbaca.'},
      {tag: 'Salah umum', vo: 'Salah umum: nomor iklan dan nomor Konektor beda. Pakai nomor yang sama.',
        salah: 'Nomor di iklan beda dengan nomor di Konektor', benar: 'Pakai nomor yang sama'},
      {tag: 'Cek cepat', vo: 'Cek: buka Leads. Lead dari iklan bersumber ads, dan data iklannya ada di detail.',
        tampil: 'Di Leads, sumbernya ads dan data iklan ada di detail lead.'},
    ],
  },
  {
    k: 4, id: 'c4', proj: 'tutorial-meta-capi', jsx: 'meta-capi-tutorial.jsx', cfg: 'meta-capi',
    judul: 'Hubungkan Meta Pixel dan Conversions API', sub: 'Closing dikirim dari server, bukan browser',
    simpan: ['Pixel', 'Token', 'Konektor', 'Form', 'Uji', 'Hasil'],
    off: [0.5, 5.05, 10.9],
    catatan: [
      {tag: 'Kenapa penting', vo: 'Event dikirim dari server Konektor langsung ke Meta, tanpa lewat browser.',
        tampil: 'Event lewat server Konektor ke Meta, bukan lewat browser.'},
      {tag: 'Salah umum', vo: 'Salah umum: Test Event Code tertukar dengan Pixel ID. Pixel ID itu angka saja.',
        salah: 'Test Event Code dipakai sebagai Pixel ID', benar: 'Pixel ID: angka saja'},
      {tag: 'Cek cepat', vo: 'Cek: Uji kirim dengan Test Event Code, lalu lihat di Test Events Meta.',
        tampil: 'Uji kirim dengan Test Event Code, lalu lihat di Test Events Meta.'},
    ],
  },
  {
    k: 5, id: 'c5', proj: 'tutorial-konversi', jsx: 'konversi-tutorial.jsx', cfg: 'konversi',
    judul: 'Kirim closing balik ke Meta', sub: 'Inilah Feedback CAPI',
    simpan: ['Atur', 'Lead', 'Ubah', 'Kirim', 'Hasil'],
    off: [0.5, 6.4, 12.0],
    catatan: [
      {tag: 'Kenapa penting', vo: 'Meta belajar dari event yang diterimanya. Kirim Purchase, dan Meta tahu siapa yang beli.',
        tampil: 'Kirim Purchase, dan Meta tahu siapa yang beli.'},
      {tag: 'Salah umum', vo: 'Salah umum: closing tanpa nilai. Isi nilainya, supaya hasil iklan bisa dihitung.',
        salah: 'Closing tanpa nilai', benar: 'Isi nilai tiap closing'},
      {tag: 'Cek cepat', vo: 'Cek: di Log pengiriman, Purchase berstatus Terkirim. Artinya Meta sudah menerima.',
        tampil: 'Di Log pengiriman, Purchase berstatus Terkirim.'},
    ],
  },
  {
    k: 6, id: 'c6', proj: 'tutorial-otomasi', jsx: 'otomasi-tutorial.jsx', cfg: 'otomasi',
    judul: 'Otomatis: closing tercatat dari chat', sub: 'Tim cukup chat seperti biasa',
    simpan: ['Buka', 'Syarat', 'Aksi', 'Simpan', 'Chat', 'Hasil', 'Kirim'],
    off: [0.5, 5.5, 10.4],
    catatan: [
      {tag: 'Kenapa penting', vo: 'Aturan mencatat closing dari chat, lalu Pengaturan Konversi mengirimnya.',
        tampil: 'Aturan mencatat closing dari chat. Pengaturan Konversi yang mengirimnya ke Meta.'},
      {tag: 'Salah umum', vo: 'Salah umum: kata kunci terlalu pendek. Kata pendek ikut cocok di dalam kata lain.',
        salah: 'Kata kunci terlalu pendek', benar: 'Pakai kalimat yang khas'},
      {tag: 'Cek cepat', vo: 'Cek: aturan hanya jalan untuk lead yang sudah ada. Uji dengan satu chat nyata.',
        tampil: 'Aturan jalan untuk lead yang sudah ada. Uji dengan satu chat.'},
    ],
  },
];

// Bagian pembuka (hook)
export const HOOK = [
  {no: 'h1', sc: 'Hasil', off: 0.4, text: 'Ini hasil akhirnya: closing Rp 750.000, tercatat di Meta langsung dari chat WhatsApp.'},
  {no: 'h2', sc: 'Masalah', off: 0.4, text: 'Masalahnya, iklan Meta belajar dari klik dan chat. Bukan dari closing.'},
  {no: 'h3', sc: 'Masalah', off: 5.25, text: 'Jadi iklanmu terus mencari orang yang suka klik, bukan orang yang beli.'},
  {no: 'h4', sc: 'Janji', off: 0.4, text: 'Di video ini, kamu pasang semuanya. Dari nol, sampai closing kembali ke Meta.'},
  {no: 'h5', sc: 'Janji', off: 5.6, text: 'Namanya Feedback CAPI. Enam langkah, satu per satu.'},
  {no: 'h6', sc: 'Janji', off: 11.0, text: 'Hasilnya: iklan yang belajar dari pembeli asli.'},
];

// Bab 7
export const AKHIR = [
  {no: 'r1', sc: 'Ringkas', off: 0.5, text: 'Itulah Feedback CAPI. Pasang tracking, buat link, jalankan iklan, sambungkan Meta, kirim closing, lalu otomatiskan.'},
  {no: 'r2', sc: 'Tips', off: 0.4, text: 'Tips satu: buktikan event nyata dulu, baru tambah platform iklan.'},
  {no: 'r3', sc: 'Tips', off: 5.1, text: 'Tips dua: nomor di iklan harus sama dengan nomor yang terhubung.'},
  {no: 'r4', sc: 'Tips', off: 10.35, text: 'Tips tiga: isi nilai setiap closing, supaya iklanmu belajar dari angka asli.'},
  {no: 'r5', sc: 'Cta', off: 0.8, text: 'Panduan lengkapnya ada di konektor.id.'},
];

// Durasi awal scene bagian baru (detik). Mesin memanjangkan kalau VO tidak muat.
export const DUR = {Hasil: 8.5, Masalah: 10.0, Janji: 15.3, Judul: 2.0, Catatan: 16.5, Ringkas: 12.0, Tips: 16.3, Cta: 7.0};

export const NAMA_JUDUL = (k) => `J${k}`;
export const NAMA_CATATAN = (k) => `N${k}`;

// Daftar scene berurutan: [{name, kind, bab?, src?}]
export function urutan() {
  const s = [{name: 'Hasil', kind: 'hook'}, {name: 'Masalah', kind: 'hook'}, {name: 'Janji', kind: 'hook'}];
  for (const b of BAB) {
    s.push({name: NAMA_JUDUL(b.k), kind: 'judul', bab: b.k});
    s.push({name: b.id, kind: 'sumber', bab: b.k});
    s.push({name: NAMA_CATATAN(b.k), kind: 'catatan', bab: b.k});
  }
  s.push({name: 'J7', kind: 'judul', bab: 7}, {name: 'Ringkas', kind: 'akhir'}, {name: 'Tips', kind: 'akhir'}, {name: 'Cta', kind: 'akhir'});
  return s;
}
