// Templat "tutorial" (Tutorial fitur): Tutorial 9:16 ±36 dtk: nilai inti dulu, tiga langkah dengan kartu UI dan klik, hasil, rujukan panduan.
// Dibuat `motion init --templat=tutorial <folder>`. Ganti naskah `vo` dan teks layar di src/isi.js
// (kapsi, judul scene, warna, merek), lalu: motion plan --kering (durasi + biaya tanpa kredit),
// motion all. Pola dari proyek lama yang berhasil (riwayat git 590b8ee^) dan IKLAN.md:
// tata jangkar, CTA (bila ada) baris terakhir sendiri, SFX dari stok, musik `rencana` + [tail] tak terdengar.
export default {
  nama: '__NAMA__',
  komposisi: 'Video.html',
  keluaran: '__NAMA__-9x16.mp4',
  // suara 17 tutorial lama, dikunci: tulis ulang kalimat, jangan ubah parameter per baris
  suara: {"id": "Se50W0zoqlDUbFxvcN9h", "seed": 20260930, "speed": 0.98, "stability": 0.25, "similarity": 0.8, "style": 0.85},
  lafal: {"WhatsApp": "wasap"},
  vo: [
    {no: 1, sc: "Intro", off: 0.4, text: "Cara menyambungkan toko Anda ke WhatsApp, dalam tiga langkah."},
    {no: 2, sc: "Inti", off: 0.4, text: "Intinya, setiap orang yang klik iklan langsung masuk ke chat Anda, lengkap dengan asal iklannya."},
    {no: 3, sc: "Langkah1", off: 0.4, text: "Pertama, buka menu Integrasi, lalu pilih WhatsApp."},
    {no: 4, sc: "Langkah2", off: 0.4, text: "Kedua, pindai kode QR dengan aplikasi WhatsApp di ponsel Anda."},
    {no: 5, sc: "Langkah3", off: 0.4, text: "Ketiga, klik Simpan. Nomor Anda langsung aktif."},
    {no: 6, sc: "Hasil", off: 0.4, text: "Coba kirim pesan uji. Chatnya muncul di kotak masuk, beserta nama iklannya."},
    {no: 7, sc: "Outro", off: 0.4, text: "Panduan lengkapnya ada di lapakita.id."},
  ],
  tata: {"mode": "jangkar", "jeda": 0.2, "ekorBiasa": 0.4},
  sfx: [["sapu", "@stok/sapu"], ["klik", "@stok/click-soft"], ["centang", "@stok/janji-ceklis"], ["ding", "@stok/copy-chime"], ["sukses", "@stok/success-chime"]],
  cue: ({C, P, E, S, total}) => [
    {at: C.Inti + 0.1, nama: "sapu", gain: 0.14},
    {at: C.Langkah1 + 0.1, nama: "sapu", gain: 0.14},
    {at: C.Langkah2 + 0.1, nama: "sapu", gain: 0.14},
    {at: C.Langkah3 + 0.1, nama: "sapu", gain: 0.14},
    {at: C.Hasil + 0.1, nama: "sapu", gain: 0.14},
    {at: C.Outro + 0.1, nama: "sapu", gain: 0.14},
    {at: C.Inti + S.Inti * 0.0 + 0.03, nama: "centang", gain: 0.2, nada: 0, pan: -0.3},
    {at: C.Inti + S.Inti * 0.233 + 0.03, nama: "centang", gain: 0.2, nada: 2, pan: 0},
    {at: C.Inti + S.Inti * 0.467 + 0.03, nama: "centang", gain: 0.2, nada: 4, pan: 0.3},
    {at: C.Langkah1 + S.Langkah1 * 0.55, nama: "klik", gain: 0.3},
    {at: C.Langkah1 + S.Langkah1 * 0.55 + 0.35, nama: "centang", gain: 0.18},
    {at: C.Langkah2 + S.Langkah2 * 0.55, nama: "klik", gain: 0.3},
    {at: C.Langkah2 + S.Langkah2 * 0.55 + 0.35, nama: "centang", gain: 0.18},
    {at: C.Langkah3 + S.Langkah3 * 0.55, nama: "klik", gain: 0.3},
    {at: C.Langkah3 + S.Langkah3 * 0.55 + 0.35, nama: "centang", gain: 0.18},
    {at: C.Hasil + 0.3, nama: "sukses", gain: 0.24},
    {at: C.Outro + 0.6, nama: "ding", gain: 0.2},
  ],
  musik: [{
    nama: 'bgm',
    // Satu `prompt` = musik datar ("monoton"); bagian dipatok ke perubahan suasana. Jangan pernah minta
    // bagian "sparse/quiet/patient": generator menerjemahkannya sebagai senyap (IKLAN.md §1).
    rencana: ({C, total}) => {
      const HINDARI = ["vocals", "lyrics", "heavy four-on-the-floor kick", "booming sub bass", "trap 808", "breakdown", "silence", "quiet intro", "fade in", "sparse"];
      const dasar = ["clean modern product-demo instrumental", "112 BPM", "steady and continuous", "always present"];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya: [...dasar, ...gaya], hindari: HINDARI});
      return [
        b(0, C.Langkah1, "[focus]", ["focused groove from the very first beat", "warm and clear"]),
        b(C.Langkah1, C.Hasil, "[flow]", ["a little fuller", "soft arpeggio", "forward motion"]),
        b(C.Hasil, total, "[lift]", ["brighter", "open", "same groove"]),
        b(total, total + 8, "[tail]", ["brighter groove continues"]),
      ];
    },
    titik: [["Intro", 0, -23]],
    fadeOut: ({total}) => [total - 0.6, 0.6],
  }],
  mixer: {"gainVO": 1.6, "gainSFX": 0.9, "duckMusik": {"th": 0.03, "ratio": 8, "attack": 20, "release": 280}},
  sampul: {detik: 0},
  periksa: {kapsi: '#kapsi'},
};
