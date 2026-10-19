// Satu sumber untuk urutan scene, naskah VO baru, dan teks layar bagian baru.
// Dipakai oleh motion.config.mjs (VO, cue, musik) dan bangun.mjs (komposisi).
// Satu bab = kartu judul J<k> + satu atau lebih segmen sumber + catatan N<k>.
// Satu segmen = scene komposisi yang memuat scene sumber berurutan dari SATU tutorial 1 menit
// (batas runtime komposisi: maks 50 scene). Offset VO = offset di scene sumber + awal scene itu di dalam segmen (sumber/peta.json).

// Proyek sumber. `kunci` = nama berkas jsx hasil bangun dan nama global CHAP_<kunci>.
export const PROYEK = {
  banyak: {kunci: 'pb', proj: 'tutorial-banyak-cs', jsx: 'banyakcs-tutorial.jsx', cfg: 'banyak-cs'},
  rotator: {kunci: 'pr', proj: 'tutorial-rotator', jsx: 'rotator-tutorial.jsx', cfg: 'rotator'},
  ctwa: {kunci: 'pc', proj: 'tutorial-ctwa', jsx: 'ctwa-tutorial.jsx', cfg: 'ctwa'},
  event: {kunci: 'pe', proj: 'tutorial-event', jsx: 'event-tutorial.jsx', cfg: 'event'},
  spam: {kunci: 'ps', proj: 'tutorial-spam', jsx: 'spam-tutorial.jsx', cfg: 'spam'},
};

export const BAB = [
  {
    k: 1, judul: 'Siapkan nomor WhatsApp', sub: 'Satu nomor untuk seluruh tim',
    segmen: [{id: 'c1', p: 'banyak', simpan: ['Nomor']}],
    off: [0.5, 6.9, 14.4],
    catatan: [
      {tag: 'Kenapa penting', vo: 'Konektor hanya membaca chat dari nomor yang terhubung. Nomor inilah pintu masuk data iklan.',
        tampil: 'Konektor membaca chat dari nomor yang terhubung.'},
      {tag: 'Salah umum', vo: 'Salah umum: nomor masih terpasang di aplikasi WhatsApp Business. Lepaskan dulu, baru hubungkan.',
        salah: 'Nomor masih terpasang di aplikasi', benar: 'Lepaskan nomor dari aplikasi dulu'},
      {tag: 'Cek cepat', vo: 'Cek: nomor berstatus terhubung. Untuk kerja harian, pilih WhatsApp Business Resmi.',
        tampil: 'Nomor berstatus terhubung. Harian: WhatsApp Business Resmi.'},
    ],
  },
  {
    k: 2, judul: 'Link WhatsApp dengan kode pengunjung', sub: 'Untuk klik dari website, bio, dan tombol',
    segmen: [{id: 'c2', p: 'rotator', simpan: ['Buat', 'Form', 'Kode', 'Nomor', 'Salin', 'Uji', 'Cocok', 'Hasil']}],
    off: [0.5, 7.1, 14.25],
    catatan: [
      {tag: 'Kenapa penting', vo: 'Kode pengunjung mengikat satu klik ke satu chat. Jadi chat dari link ini bisa dilacak.',
        tampil: 'Kode pengunjung mengikat satu klik ke satu chat.'},
      {tag: 'Salah umum', vo: 'Salah umum: memasang link ini di iklan Click-to-WhatsApp. Iklan itu memakai Message destinations.',
        salah: 'Link ini dipasang di iklan Click-to-WhatsApp', benar: 'Iklan CTWA: pakai Message destinations'},
      {tag: 'Cek cepat', vo: 'Cek: buka link dari ponsel. Nomor tujuan benar, dan kode muncul di pesan pembukanya.',
        tampil: 'Buka link dari ponsel. Cek nomor tujuan dan kode di pesan.'},
    ],
  },
  {
    k: 3, judul: 'Buat iklan Click-to-WhatsApp', sub: 'Message destinations, nomor yang sama',
    segmen: [{id: 'c3a', p: 'ctwa', simpan: ['Iklan']}, {id: 'c3b', p: 'banyak', simpan: ['Iklan']}],
    off: [0.5, 7.7, 15.3],
    catatan: [
      {tag: 'Kenapa penting', vo: 'Pesan dari klik iklan membawa ID klik dari Meta. Konektor memakainya untuk mengenali iklannya.',
        tampil: 'Pesan dari klik iklan membawa ID klik Meta.'},
      {tag: 'Salah umum', vo: 'Salah umum: memilih jalur yang tidak meneruskan data iklan, seperti Kapso. Pilih jalur resmi.',
        salah: 'Jalur yang tidak meneruskan data iklan', benar: 'Pilih WhatsApp Business Resmi'},
      {tag: 'Cek cepat', vo: 'Cek: nomor tujuan di iklan sama dengan nomor yang terhubung di Konektor.',
        tampil: 'Nomor tujuan di iklan sama dengan nomor di Konektor.'},
    ],
  },
  {
    k: 4, judul: 'Chat masuk jadi lead', sub: 'Data iklan ikut, chat dibagi ke tim',
    segmen: [{id: 'c4a', p: 'ctwa', simpan: ['Chat', 'Lead']}, {id: 'c4b', p: 'banyak', simpan: ['Bagi', 'Leads']}],
    off: [0.5, 7.75, 14.75],
    catatan: [
      {tag: 'Kenapa penting', vo: 'Lead dari iklan menyimpan ID klik. Dari situ kamu tahu chat ini datang dari iklan mana.',
        tampil: 'Lead dari iklan menyimpan ID klik, jadi asal iklannya terbaca.'},
      {tag: 'Salah umum', vo: 'Salah umum: angka chat di Meta disamakan dengan lead. Lead lahir setelah pesan terkirim.',
        salah: 'Angka chat di Meta sama dengan jumlah lead', benar: 'Lead lahir setelah pesan masuk'},
      {tag: 'Cek cepat', vo: 'Cek: buka detail lead. Sumbernya ads, dan ID klik tampil di Parameter Atribusi.',
        tampil: 'Sumber ads, ID klik ada di Parameter Atribusi.'},
    ],
  },
  {
    k: 5, judul: 'Closing terkirim ke Meta', sub: 'Event muncul di Events Manager',
    segmen: [
      {id: 'c5a', p: 'event', simpan: ['Pixel', 'Uji']},
      {id: 'c5b', p: 'event', simpan: ['Kirim', 'Muncul']},
      {id: 'c5c', p: 'ctwa', simpan: ['Kirim', 'Hasil']},
    ],
    off: [0.5, 7.55, 14.6],
    catatan: [
      {tag: 'Kenapa penting', vo: 'Meta hanya belajar dari event yang diterimanya. Tanpa platform Meta aktif, tidak ada yang terkirim.',
        tampil: 'Tanpa platform Meta yang aktif, tidak ada event terkirim.'},
      {tag: 'Salah umum', vo: 'Salah umum: heran Purchase belum muncul. Purchase baru terkirim setelah status jadi Closing.',
        salah: 'Menunggu Purchase sebelum ada closing', benar: 'Purchase muncul setelah status Closing'},
      {tag: 'Cek cepat', vo: 'Cek: di Log Sinkronisasi, cari badge Meta CTWA berstatus diterima. Itu bukti Meta menerimanya.',
        tampil: 'Log Sinkronisasi: badge Meta CTWA, status diterima.'},
    ],
  },
  {
    k: 6, judul: 'Spam dari iklan', sub: 'Tandai, jangan balas, kecualikan di Meta',
    segmen: [{id: 'c6', p: 'spam', simpan: ['Masuk', 'Tandai', 'Leads', 'Audiens', 'Kecualikan', 'Hasil']}],
    off: [0.5, 6.75, 15.1],
    catatan: [
      {tag: 'Kenapa penting', vo: 'Spam dari iklan menghabiskan waktu CS, dan budget iklan ikut bocor ke orang yang salah.',
        tampil: 'Spam menghabiskan waktu CS dan membocorkan budget iklan.'},
      {tag: 'Salah umum', vo: 'Salah umum: membalas spam untuk memastikan. Jangan balas. Tandai Spam, lalu ubah tahap ke Loss.',
        salah: 'Membalas spam satu per satu', benar: 'Jangan balas, tandai Spam dan Loss'},
      {tag: 'Cek cepat', vo: 'Cek: buka ad set. Audiens spam harus ada di daftar pengecualian. Perbarui tiap minggu.',
        tampil: 'Audiens spam ada di pengecualian ad set. Perbarui tiap minggu.'},
    ],
  },
];

// Bagian pembuka (hook)
export const HOOK = [
  {no: 'h1', sc: 'Hasil', off: 0.4, text: 'Ini hasil akhirnya: closing Rp 750.000 dari iklan, tercatat di Meta langsung dari chat WhatsApp!'},
  {no: 'h2', sc: 'Masalah', off: 0.4, text: 'Iklan Click-to-WhatsApp mendatangkan banyak chat. Tapi Meta cuma tahu siapa yang klik.'},
  {no: 'h3', sc: 'Masalah', off: 6.3, text: 'Jadi iklanmu terus mencari orang yang suka klik. Siapa yang beli, Meta tidak tahu.'},
  {no: 'h4', sc: 'Janji', off: 0.4, text: 'Di video ini, kamu pasang semuanya, satu per satu. Dari nomor WhatsApp sampai closing kembali ke Meta.'},
  {no: 'h5', sc: 'Janji', off: 8.3, text: 'Inilah Feedback CAPI. Enam langkah, dengan cara cek di tiap langkah.'},
  {no: 'h6', sc: 'Janji', off: 14.0, text: 'Hasilnya: iklanmu berhenti menebak, dan mulai belajar dari pembeli.'},
];

// Bab 7
export const AKHIR = [
  {no: 'r1', sc: 'Ringkas', off: 0.5, text: 'Itulah alurnya. Siapkan nomor, pasang link, jalankan iklan, baca lead, kirim closing, lalu singkirkan spam.'},
  {no: 'r2', sc: 'Tips', off: 0.4, text: 'Tips satu: cek Parameter Atribusi di lead pertama. ID klik terisi artinya data iklan terbaca.'},
  {no: 'r3', sc: 'Tips', off: 9.0, text: 'Tips dua: ubah status lead tepat waktu. Closing mengirim Purchase, dan hanya sekali per lead.'},
  {no: 'r4', sc: 'Tips', off: 16.5, text: 'Tips tiga: balas chat iklan dalam 24 jam. Di jalur resmi, pesan dari iklan bisa gratis hingga 7 hari.'},
  {no: 'r5', sc: 'Cta', off: 0.8, text: 'Panduannya ada di konektor.id.'},
];

// Durasi awal scene bagian baru (detik). Mesin memanjangkan kalau VO tidak muat.
export const DUR = {Hasil: 8.5, Masalah: 10.0, Janji: 15.3, Judul: 2.0, Catatan: 17.0, Ringkas: 12.0, Tips: 18.0, Cta: 7.0};

export const NAMA_JUDUL = (k) => `J${k}`;
export const NAMA_CATATAN = (k) => `N${k}`;

// Daftar scene berurutan: [{name, kind, bab?, seg?}]
export function urutan() {
  const s = [{name: 'Hasil', kind: 'hook'}, {name: 'Masalah', kind: 'hook'}, {name: 'Janji', kind: 'hook'}];
  for (const b of BAB) {
    s.push({name: NAMA_JUDUL(b.k), kind: 'judul', bab: b.k});
    for (const g of b.segmen) s.push({name: g.id, kind: 'sumber', bab: b.k});
    s.push({name: NAMA_CATATAN(b.k), kind: 'catatan', bab: b.k});
  }
  s.push({name: 'J7', kind: 'judul', bab: 7}, {name: 'Ringkas', kind: 'akhir'}, {name: 'Tips', kind: 'akhir'}, {name: 'Cta', kind: 'akhir'});
  return s;
}
