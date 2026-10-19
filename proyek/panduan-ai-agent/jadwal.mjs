// Satu sumber untuk urutan scene, naskah VO baru, dan jadwal bagian baru.
// Dipakai oleh motion.config.mjs (VO, cue, musik) dan bangun.mjs (komposisi).
// Tiga tutorial 1 menit dipakai ulang sebagai potongan (`SRC`). Satu potongan = satu scene `c<k>`
// (batas runtime komposisi: maks 50 scene). Tiap tutorial hidup sebagai SATU Piece di komposisi;
// potongannya hanya memutar rentang scene sumber (lihat bagian/kronik.jsx).
import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

// Panjang tiap baris VO baru, diukur dari berkas mp3 oleh `node ukur.mjs`. Sebelum diukur, dipakai perkiraan.
const BERKAS_DURASI = fileURLToPath(new URL('./sumber/durasi.json', import.meta.url));
const DURASI = existsSync(BERKAS_DURASI) ? JSON.parse(readFileSync(BERKAS_DURASI, 'utf8')) : {};
export const durasiVo = (t) => DURASI[t] ?? (t.length / 13.0 + 0.25);
const bulat = (x) => Math.round(x * 20) / 20;
const atas = (x) => Math.ceil(x * 20) / 20;

export const PIECE = {
  AG: {proj: 'tutorial-agentic', jsx: 'agentic-tutorial.jsx', cfg: 'agentic', judul: 'Tutorial Agentic'},
  OT: {proj: 'tutorial-otomasi', jsx: 'otomasi-tutorial.jsx', cfg: 'otomasi', judul: 'Tutorial Otomasi'},
  KL: {proj: 'tutorial-kalimat', jsx: 'otomasi-tutorial.jsx', cfg: 'kalimat', judul: 'Tutorial Kalimat'},
};

// Potongan tutorial sumber: scene sumber harus berurutan. Intro, Outro, dan Tips sumber dibuang kecuali tertulis.
export const SRC = [
  {id: 'c0', piece: 'AG', simpan: ['Intro', 'Gratis']},
  {id: 'c2', piece: 'AG', simpan: ['Saldo', 'Kunci', 'Salin']},
  {id: 'c3', piece: 'AG', simpan: ['Tempel', 'Model']},
  {id: 'c4', piece: 'AG', simpan: ['Pengetahuan']},
  {id: 'c5', piece: 'AG', simpan: ['Otomatis', 'Balas']},
  {id: 'c6', piece: 'OT', simpan: ['Buka', 'Syarat', 'Aksi', 'Simpan', 'Chat', 'Hasil', 'Kirim']},
  {id: 'c6b', piece: 'KL', simpan: ['Syarat', 'Aksi', 'Simpan', 'Chat', 'Hasil', 'Kirim', 'Tips']},
  {id: 'c7', piece: 'AG', simpan: ['Tips']},
];

// Kalimat sumber yang diganti. Alasannya: dua tutorial memakai kalimat yang sama (VO dobel),
// atau kalimat sumber tidak cocok di panduan panjang. Panjangnya dijaga mirip supaya jangkar animasi tetap pas.
export const GANTI = {
  'kalimat:Aksi': 'Aksinya: ambil angka setelah kata Total, dan status berganti ke Closing.',
  'kalimat:Simpan': 'Simpan juga aturan kedua ini. Aktif!',
  'kalimat:Hasil': 'Sekali lagi status jadi Closing, dan nilainya terisi. Tanpa klik!',
  'kalimat:Kirim': 'Purchase kedua ikut meluncur ke Meta.',
};
// Hentakan besar hanya tiga kali: pembuka, balasan pertama agent (c5), dan "Beres!" (c6). Sisanya dilunakkan.
export const BUANG_HENTAK = new Set(['kalimat']);

// Kartu judul bab 1-7.
export const BAB = [
  {k: 1, judul: 'Apa yang dikerjakan AI Agent', sub: 'Agent menjawab. Tim memutuskan.'},
  {k: 2, judul: 'Siapkan OpenRouter', sub: 'Isi saldo, buat kunci, pasang Credit limit'},
  {k: 3, judul: 'Hubungkan ke Konektor', sub: 'Tempel kunci, Uji kunci, Simpan'},
  {k: 4, judul: 'Isi Pengetahuan', sub: 'Produk, harga, FAQ, lalu uji jawabannya'},
  {k: 5, judul: 'Nyalakan Balas otomatis', sub: 'Draf dulu atau langsung membalas, plus Serah ke tim'},
  {k: 6, judul: 'Closing tercatat sendiri', sub: 'Aturan Otomatisasi dari chat pelanggan dan kalimat CS'},
  {k: 7, judul: 'Biaya nyata dan ringkasan', sub: 'Berapa yang kamu bayar, dan tiga tips'},
];

// Catatan bab: kenapa penting, salah umum, cek cepat.
export const CATATAN = {
  1: [
    {tag: 'Kenapa penting', vo: 'Agent paling berguna untuk pertanyaan yang berulang: harga, stok, jam buka.',
      tampil: 'Cocok untuk pertanyaan berulang: harga, stok, jam buka.'},
    {tag: 'Salah umum', vo: 'Salah umum: menganggap agent menggantikan tim. Agent menjawab, tim tetap memegang chat yang sulit.',
      salah: 'Agent menggantikan tim', benar: 'Agent menjawab, tim memegang chat sulit'},
    {tag: 'Cek cepat', vo: 'Cek: buka tab Serah ke tim, lalu pastikan pemicunya sudah menyala.',
      tampil: 'Buka tab Serah ke tim, lalu cek pemicunya sudah menyala.'},
  ],
  2: [
    {tag: 'Kenapa penting', vo: 'OpenRouter itu dompet AI-mu. Biaya model dipotong dari saldo di sana.',
      tampil: 'Biaya model dipotong dari saldo OpenRouter-mu.'},
    {tag: 'Salah umum', vo: 'Salah umum: kunci tanpa Credit limit. Pasang batas biaya yang kamu tentukan.',
      salah: 'Kunci tanpa Credit limit', benar: 'Pasang Credit limit di kunci'},
    {tag: 'Cek cepat', vo: 'Cek: jangan bagikan kunci ke siapa pun. Kunci yang bocor bisa menghabiskan saldomu.',
      tampil: 'Jangan bagikan kunci. Kunci bocor bisa menghabiskan saldo.'},
  ],
  3: [
    {tag: 'Kenapa penting', vo: 'Kunci disimpan terenkripsi. Layar hanya menampilkan empat karakter terakhir.',
      tampil: 'Kunci disimpan terenkripsi. Layar hanya menampilkan 4 karakter terakhir.'},
    {tag: 'Salah umum', vo: 'Salah umum: pesan Format tidak dikenali. Artinya kunci terpotong. Salin ulang kunci lengkap.',
      salah: 'Kunci terpotong waktu disalin', benar: 'Salin ulang kunci lengkap'},
    {tag: 'Cek cepat', vo: 'Cek: tunggu pesan Koneksi berhasil. Baru klik Simpan.',
      tampil: 'Tunggu pesan "Koneksi berhasil", baru klik Simpan.'},
  ],
  4: [
    {tag: 'Kenapa penting', vo: 'Pengetahuan itu bahan jawabannya. Makin lengkap isinya, makin tepat balasannya.',
      tampil: 'Makin lengkap isinya, makin tepat balasannya.'},
    {tag: 'Salah umum', vo: 'Salah umum: sumber masih Memproses, tapi sudah diuji. Tunggu sampai statusnya Siap.',
      salah: 'Menguji saat sumber masih Memproses', benar: 'Tunggu status Siap'},
    {tag: 'Cek cepat', vo: 'Cek: model Balasan berlabel Mendukung alat. Tanpa itu, Pengetahuan tidak dipakai.',
      tampil: 'Model Balasan berlabel Mendukung alat. Tanpa itu, Pengetahuan tidak dipakai.'},
  ],
  5: [
    {tag: 'Kenapa penting', vo: 'Isi Profil bisnis lebih dulu. Jawaban agent hanya setepat profil itu.',
      tampil: 'Isi Profil bisnis dulu. Jawaban agent hanya setepat profilnya.'},
    {tag: 'Salah umum', vo: 'Salah umum: saklar menyala, tapi lupa klik Simpan. Balas otomatis baru aktif setelah disimpan.',
      salah: 'Saklar menyala, tapi belum disimpan', benar: 'Klik Simpan setelah menyalakan'},
    {tag: 'Cek cepat', vo: 'Cek: kirim satu pesan uji. Chat yang dibalas agent mendapat tanda AI di Kotak Masuk.',
      tampil: 'Kirim satu pesan uji. Cari tanda AI di Kotak Masuk.'},
  ],
  6: [
    {tag: 'Kenapa penting', vo: 'Aturan hanya mengubah status dan nilai. Pengaturan Konversi yang mengirim Purchase ke Meta.',
      tampil: 'Aturan mengubah status dan nilai. Pengaturan Konversi yang mengirim Purchase.'},
    {tag: 'Salah umum', vo: 'Salah umum: kata kunci terlalu pendek. Kata pendek ikut cocok di dalam kata lain.',
      salah: 'Kata kunci pendek, seperti ok', benar: 'Kalimat khas, seperti sudah transfer'},
    {tag: 'Cek cepat', vo: 'Cek: aturan hanya jalan untuk lead yang ada. Lalu buka Log pengiriman: Purchase Terkirim.',
      tampil: 'Aturan jalan untuk lead yang sudah ada. Di Log pengiriman, Purchase berstatus Terkirim.'},
  ],
};

// Scene baru dengan VO. Tiap entri: nama -> kalimat. `Hasil` dan `Judul` punya aturan sendiri.
export const BARU = {
  Hasil: ['Jam dua pagi, pelanggan masih chat. AI yang membalas. Dan closing-nya tercatat sendiri!'],
  Janji: [
    'Di video ini, kamu pasang semuanya. Dari nol sampai AI membalas.',
    'Tujuh bab, satu per satu.',
  ],
  Agent: [
    'AI Agent itu asisten CS yang tidak pernah tidur.',
    'Ia mencari jawaban di Pengetahuanmu, lalu menulis balasan. Bisa sebagai draf, bisa langsung terkirim.',
    'Foto produk, pesan suara, dan PDF dari pelanggan juga ia baca.',
    'Batasnya 30 balasan per chat dalam 24 jam.',
  ],
  Tim: [
    'Tapi ada hal yang tetap dikerjakan manusia. Itulah fungsi Serah ke tim.',
    'Pelanggan minta bicara dengan orang? Agent berhenti, dan tim mengambil alih.',
    'Komplain, refund, dan pembatalan juga bisa kamu serahkan ke tim. Agent tidak menebak.',
    'Kalau urusannya beres, tim menekan Serahkan ke Wulan. Agent bekerja lagi.',
  ],
  Sumber: [
    'Pengetahuan punya tiga jenis sumber.',
    'Tanya-jawab, untuk pertanyaan yang sering muncul.',
    'Katalog produk dan harga, dari file CSV atau tautan Google Sheets.',
    'Teks bebas, untuk kebijakan retur dan jam buka.',
  ],
  Uji: [
    'Sebelum menyalakan apa pun, uji dulu. Ketik satu pertanyaan di Uji pertanyaan, lalu klik Tanya.',
    'Muncul Agent akan menjawab dari bagian ini? Datamu cukup. Pertanyaan uji tidak dikirim ke siapa pun.',
    'Kalau Agent tidak yakin, tambahkan jawabannya ke sumber, lalu uji lagi.',
  ],
  Pilih: [
    'Kamu punya dua cara. Pertama, biarkan AI menulis draf. Kamu periksa, lalu kirim sendiri.',
    'Kedua, Balas otomatis. Agent mengirim balasannya langsung ke pelanggan.',
    'Belum yakin? Mulai dari draf. Balas otomatis mati sampai kamu sendiri menyalakannya.',
  ],
  Jembatan: [
    'Agent sudah membalas chat. Sekarang, catat closing-nya tanpa klik manual.',
    'Aturan Otomatisasi yang mengerjakannya. Ada dua cara: dari chat pelanggan, atau dari kalimat CS.',
  ],
  Biaya: [
    'Jadi, berapa biayanya? Fitur AI Agent di Konektor tidak ada biaya tambahan.',
    'Yang kamu bayar cuma pemakaian AI, langsung ke akun OpenRouter-mu.',
    'Biaya memproses Pengetahuan ditanggung Konektor.',
    'Pembandingnya, satu CRM populer: paket AI Agent-nya 159 dolar sebulan kalau ditagih tahunan, 199 dolar kalau bulanan.',
  ],
  Ringkas: ['Itulah panduan AI Agent kita. Siapkan OpenRouter, hubungkan kunci, isi Pengetahuan, uji jawabannya, nyalakan Balas otomatis, lalu catat closing otomatis.'],
  TipsAkhir: [
    'Tips satu: mulai dari draf. Nyalakan Balas otomatis setelah jawabannya kamu uji.',
    'Tips dua: isi Profil bisnis dan Pengetahuan selengkap mungkin. Uji lagi tiap harga berubah.',
    'Tips tiga: nyalakan Serah ke tim, supaya komplain dan refund ditangani manusia.',
  ],
  Cta: ['Panduan lengkapnya ada di konektor.id.'],
};

// Urutan scene komposisi. kind: hook | judul | sumber | catatan | baru
export function urutan() {
  const s = [];
  const baru = (name) => s.push({name, kind: 'baru'});
  const judul = (k) => s.push({name: `J${k}`, kind: 'judul', bab: k});
  const sumber = (id) => s.push({name: id, kind: 'sumber'});
  const cat = (k) => s.push({name: `N${k}`, kind: 'catatan', bab: k});
  baru('Hasil'); sumber('c0'); baru('Janji');
  judul(1); baru('Agent'); baru('Tim'); cat(1);
  judul(2); sumber('c2'); cat(2);
  judul(3); sumber('c3'); cat(3);
  judul(4); sumber('c4'); baru('Sumber'); baru('Uji'); cat(4);
  judul(5); baru('Pilih'); sumber('c5'); cat(5);
  judul(6); baru('Jembatan'); sumber('c6'); sumber('c6b'); cat(6);
  judul(7); sumber('c7'); baru('Biaya'); baru('Ringkas'); baru('TipsAkhir'); baru('Cta');
  return s;
}

// Baris VO baru per scene, dengan offset dihitung dari panjang audio (atau perkiraan).
// Awal 0,5 dtk; jeda antar baris 0,4 dtk. Offset dipakai oleh VO (batas bawah) dan oleh animasi, jadi keduanya sinkron.
const AWAL = 0.5, JEDA = 0.4;
export function barisBaru() {
  const out = {};
  for (const [nama, teks] of Object.entries(BARU)) {
    let o = AWAL;
    out[nama] = teks.map((text) => { const r = {text, off: bulat(o), dur: durasiVo(text)}; o += r.dur + JEDA; return r; });
  }
  for (const [k, cs] of Object.entries(CATATAN)) {
    let o = AWAL;
    out[`N${k}`] = cs.map((c) => { const r = {text: c.vo, off: bulat(o), dur: durasiVo(c.vo)}; o += r.dur + JEDA; return r; });
  }
  return out;
}

export const DUR_JUDUL = 2.0;
// Durasi awal scene baru (mesin memanjangkan bila VO tidak muat).
export function durBaru(nama, baris) {
  if (nama.startsWith('J') && /^J\d$/.test(nama)) return DUR_JUDUL;
  const l = baris.at(-1);
  const min = {Hasil: 7.5, Janji: 9.5, Agent: 12, Tim: 12, Sumber: 10, Uji: 12, Pilih: 10, Jembatan: 8, Biaya: 14, Ringkas: 12, TipsAkhir: 14, Cta: 6};
  return Math.max(min[nama] || 0, atas(l.off + l.dur + 0.5));
}
