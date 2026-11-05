// Templat "trailer" (Trailer / teaser): Teaser gelap 9:16 ±20 dtk, letterbox, empat kalimat pendek ber-`maks`, satu hentakan di Puncak, kartu judul tanpa CTA.
// Dibuat `motion init --templat=trailer <folder>`. Ganti naskah `vo` dan teks layar di src/isi.js
// (kapsi, judul scene, warna, merek), lalu: motion plan --kering (durasi + biaya tanpa kredit),
// motion all. Pola dari proyek lama yang berhasil (riwayat git 590b8ee^) dan IKLAN.md:
// tata jangkar, CTA (bila ada) baris terakhir sendiri, SFX dari stok, musik `rencana` + [tail] tak terdengar.
export default {
  nama: '__NAMA__',
  komposisi: 'Video.html',
  keluaran: '__NAMA__-9x16.mp4',
  // Firman, suara trailer "Shift Malam"; pelan dan berat
  suara: {"id": "i8CJLmX03JoyL7Dl2LaT", "seed": 1, "stability": 0.35, "style": 0.25, "speed": 0.95},
  vo: [
    {no: 1, sc: "Sunyi", off: 0.6, text: "Semua orang bilang, ini cuma rutinitas.", maks: 2.8},
    {no: 2, sc: "Retak", off: 0.5, text: "Sampai satu hari, angkanya tidak masuk akal.", maks: 3.0},
    {no: 3, sc: "Bangun", off: 0.6, text: "Dan kami harus memilih.", maks: 2.2},
    {no: 4, sc: "Judul", off: 0.8, text: "Mulai satu Desember.", maks: 2.0},
  ],
  tata: {"mode": "jangkar", "jeda": 0.15, "ekorBiasa": 0.05},
  sfx: [["drone", "@stok/drone-gelap"], ["jantung", "@stok/heartbeat"], ["boom", "@stok/low-boom"], ["riser", "@stok/riser-long"], ["hisap", "@stok/whoosh-rev"], ["impact", "@stok/impact-hit"], ["sub", "@stok/sub-drop"], ["rev", "@stok/reverse-tail"]],
  cue: ({C, P, E, S, total}) => [
    {at: 0, nama: "drone", gain: 0.18},
    {at: C.Retak + 0.2, nama: "jantung", gain: 0.3},
    {at: C.Retak + 1.4, nama: "jantung", gain: 0.3},
    {at: C.Bangun, nama: "boom", gain: 0.3},
    {at: C.Puncak - 1.3, nama: "riser", gain: 0.22},
    {at: C.Puncak - 0.2, nama: "hisap", gain: 0.22},
    {at: C.Puncak, nama: "impact", gain: 0.42},
    {at: C.Puncak + 0.02, nama: "sub", gain: 0.34},
    {at: C.Judul - 0.6, nama: "rev", gain: 0.2},
  ],
  musik: [{
    nama: 'bgm',
    // Satu `prompt` = musik datar ("monoton"); bagian dipatok ke perubahan suasana. Jangan pernah minta
    // bagian "sparse/quiet/patient": generator menerjemahkannya sebagai senyap (IKLAN.md §1).
    rencana: ({C, total}) => {
      const HINDARI = ["vocals", "lyrics", "heavy four-on-the-floor kick", "booming sub bass", "trap 808", "breakdown", "silence", "quiet intro", "fade in", "sparse"];
      const dasar = ["dark cinematic hybrid score", "90 BPM", "steady and continuous", "always present"];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya: [...dasar, ...gaya], hindari: HINDARI});
      return [
        b(0, C.Retak, "[intro]", ["low warm pad from the very first beat", "mysterious"]),
        b(C.Retak, C.Bangun, "[unease]", ["same pad", "tense strings", "unsettling"]),
        b(C.Bangun, C.Puncak, "[build]", ["rising percussion", "building"]),
        b(C.Puncak, total, "[peak]", ["huge", "epic", "full orchestra"]),
        b(total, total + 8, "[tail]", ["epic score continues"]),
      ];
    },
    titik: [["Sunyi", 0, -16], ["Puncak", -0.45, -16], ["Puncak", -0.4, -38], ["Puncak", 0.0, -38], ["Puncak", 0.05, -16], ["Judul", 0.5, -18]],
    fadeOut: ({total}) => [total - 0.6, 0.6],
  }],
  mixer: {"gainVO": 1.8, "gainSFX": 0.75},
  sampul: {detik: 0},
  periksa: {kapsi: '#kapsi'},
};
