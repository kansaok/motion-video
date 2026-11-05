// Templat "testimoni" (Testimoni pelanggan): Cerita satu pelanggan 9:16 ±20 dtk: hook kutipan, cerita, yang berubah, angka hasil dengan satu hentakan, CTA.
// Dibuat `motion init --templat=testimoni <folder>`. Ganti naskah `vo` dan teks layar di src/isi.js
// (kapsi, judul scene, warna, merek), lalu: motion plan --kering (durasi + biaya tanpa kredit),
// motion all. Pola dari proyek lama yang berhasil (riwayat git 590b8ee^) dan IKLAN.md:
// tata jangkar, CTA (bila ada) baris terakhir sendiri, SFX dari stok, musik `rencana` + [tail] tak terdengar.
export default {
  nama: '__NAMA__',
  komposisi: 'Video.html',
  keluaran: '__NAMA__-9x16.mp4',
  // Cahaya; satu kalimat utuh per scene (kartu-per-kartu terdengar "keputus-putus")
  suara: {"id": "iWydkXKoiVtvdn4vLKp9", "seed": 1, "style": 0.72, "stability": 0.14, "speed": 1.2},
  vo: [
    {no: 1, sc: "Hook", off: 0.0, text: "Tiga bulan lalu, toko saya hampir tutup."},
    {no: 2, sc: "Cerita", off: 0.3, text: "Pesanan cuma datang dari teman sendiri, iklan terasa buang uang."},
    {no: 3, sc: "Bukti", off: 0.3, text: "Lalu saya coba Lapakita, dan chat pertama masuk di hari yang sama."},
    {no: 4, sc: "Hasil", off: 0.3, text: "Sekarang omzet naik dua kali lipat, tanpa tambah karyawan."},
    {no: 5, sc: "Daftar", off: 0.2, text: "Mau hasil yang sama? Klik Mulai Sekarang."},
  ],
  tata: {"mode": "jangkar", "jeda": 0.1, "ekorBiasa": 0.25, "ekor": {"Daftar": 1.0}},
  sfx: [["sapu", "@stok/sapu"], ["chat", "@stok/chat-pop"], ["centang", "@stok/janji-ceklis"], ["riser", "@stok/riser-long"], ["hisap", "@stok/whoosh-rev"], ["impact", "@stok/impact-hit"], ["sub", "@stok/sub-drop"], ["tombol", "@stok/btn-click"], ["ding", "@stok/success-chime"]],
  cue: ({C, P, E, S, total}) => [
    {at: C.Cerita + 0.1, nama: "sapu", gain: 0.16},
    {at: C.Bukti + 0.1, nama: "sapu", gain: 0.16},
    {at: C.Daftar + 0.1, nama: "sapu", gain: 0.16},
    {at: C.Cerita + 0.35, nama: "chat", gain: 0.22},
    {at: C.Bukti + S.Bukti * 0.0 + 0.03, nama: "centang", gain: 0.22, nada: 0, pan: -0.3},
    {at: C.Bukti + S.Bukti * 0.233 + 0.03, nama: "centang", gain: 0.22, nada: 2, pan: 0},
    {at: C.Bukti + S.Bukti * 0.467 + 0.03, nama: "centang", gain: 0.22, nada: 4, pan: 0.3},
    {at: C.Hasil - 1.3, nama: "riser", gain: 0.22},
    {at: C.Hasil - 0.2, nama: "hisap", gain: 0.22},
    {at: C.Hasil, nama: "impact", gain: 0.42},
    {at: C.Hasil + 0.02, nama: "sub", gain: 0.34},
    {at: C.Daftar + 0.6, nama: "tombol", gain: 0.3},
    {at: C.Daftar + 0.65, nama: "ding", gain: 0.22},
  ],
  musik: [{
    nama: 'bgm',
    // Satu `prompt` = musik datar ("monoton"); bagian dipatok ke perubahan suasana. Jangan pernah minta
    // bagian "sparse/quiet/patient": generator menerjemahkannya sebagai senyap (IKLAN.md §1).
    rencana: ({C, total}) => {
      const HINDARI = ["vocals", "lyrics", "heavy four-on-the-floor kick", "booming sub bass", "trap 808", "breakdown", "silence", "quiet intro", "fade in", "sparse"];
      const dasar = ["warm acoustic-pop instrumental", "100 BPM", "steady and continuous", "always present"];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya: [...dasar, ...gaya], hindari: HINDARI});
      return [
        b(0, C.Bukti, "[hook]", ["gentle groove from the very first beat", "warm guitar"]),
        b(C.Bukti, C.Hasil, "[build]", ["fuller", "hopeful", "rising"]),
        b(C.Hasil, total, "[drop]", ["full band", "joyful", "confident"]),
        b(total, total + 8, "[tail]", ["groove continues"]),
      ];
    },
    titik: [["Hook", 0, -15], ["Hasil", -0.45, -15], ["Hasil", -0.4, -38], ["Hasil", 0.0, -38], ["Hasil", 0.05, -15], ["Daftar", 0, -16]],
    fadeOut: ({total}) => [total - 0.6, 0.6],
  }],
  mixer: {"gainVO": 1.55, "gainSFX": 0.8},
  sampul: {detik: 0},
  periksa: {kapsi: '#kapsi'},
};
