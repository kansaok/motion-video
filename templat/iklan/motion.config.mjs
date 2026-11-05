// Templat "iklan" (Iklan hook-masalah-solusi-CTA): Iklan 9:16 ±21 dtk: hook 3 dtk, daftar masalah, solusi dengan satu hentakan, angka bukti, CTA tombol.
// Dibuat `motion init --templat=iklan <folder>`. Ganti naskah `vo` dan teks layar di src/isi.js
// (kapsi, judul scene, warna, merek), lalu: motion plan --kering (durasi + biaya tanpa kredit),
// motion all. Pola dari proyek lama yang berhasil (riwayat git 590b8ee^) dan IKLAN.md:
// tata jangkar, CTA (bila ada) baris terakhir sendiri, SFX dari stok, musik `rencana` + [tail] tak terdengar.
export default {
  nama: '__NAMA__',
  komposisi: 'Video.html',
  keluaran: '__NAMA__-9x16.mp4',
  // Cahaya, suara kampanye (CLAUDE.md); 1,20 batas API, jangan menambal durasi dengan speed
  suara: {"id": "iWydkXKoiVtvdn4vLKp9", "seed": 1, "style": 0.72, "stability": 0.14, "speed": 1.2},
  lafal: {"WhatsApp": "wasap"},
  vo: [
    {no: 1, sc: "Hook", off: 0.0, text: "Iklan jalan terus, tapi chat yang masuk sepi?"},
    {no: 2, sc: "Masalah", off: 0.3, text: "Calon pembeli klik iklan, lalu bingung harus tanya ke mana."},
    {no: 3, sc: "Solusi", off: 0.35, text: "Lapakita langsung mengantar setiap klik ke WhatsApp tim Anda."},
    {no: 4, sc: "Bukti", off: 0.3, text: "Seribu dua ratus toko sudah pakai, balasan pertama rata-rata di bawah satu menit."},
    {no: 5, sc: "CTA", off: 0.2, text: "Klik Coba Gratis, aktif hari ini juga."},
  ],
  tata: {"mode": "jangkar", "jeda": 0.12, "ekorBiasa": 0.25, "ekor": {"CTA": 1.0}},
  sfx: [["sapu", "@stok/sapu"], ["pop", "@stok/pop-thick"], ["riser", "@stok/riser-long"], ["hisap", "@stok/whoosh-rev"], ["impact", "@stok/impact-hit"], ["sub", "@stok/sub-drop"], ["tombol", "@stok/btn-click"], ["ding", "@stok/jadi-ding"]],
  cue: ({C, P, E, S, total}) => [
    {at: C.Hook + 0.05, nama: "pop", gain: 0.2},
    {at: C.Masalah + 0.1, nama: "sapu", gain: 0.16},
    {at: C.Bukti + 0.1, nama: "sapu", gain: 0.16},
    {at: C.CTA + 0.1, nama: "sapu", gain: 0.16},
    {at: C.Masalah + S.Masalah * 0.0 + 0.03, nama: "pop", gain: 0.22, nada: 0, pan: -0.3},
    {at: C.Masalah + S.Masalah * 0.233 + 0.03, nama: "pop", gain: 0.22, nada: 2, pan: 0},
    {at: C.Masalah + S.Masalah * 0.467 + 0.03, nama: "pop", gain: 0.22, nada: 4, pan: 0.3},
    {at: C.Solusi - 1.3, nama: "riser", gain: 0.22},
    {at: C.Solusi - 0.2, nama: "hisap", gain: 0.22},
    {at: C.Solusi, nama: "impact", gain: 0.42},
    {at: C.Solusi + 0.02, nama: "sub", gain: 0.34},
    {at: C.Bukti + 0.15, nama: "pop", gain: 0.22, nada: 4},
    {at: C.CTA + 0.6, nama: "tombol", gain: 0.3},
    {at: C.CTA + 0.65, nama: "ding", gain: 0.22},
  ],
  musik: [{
    nama: 'bgm',
    // Satu `prompt` = musik datar ("monoton"); bagian dipatok ke perubahan suasana. Jangan pernah minta
    // bagian "sparse/quiet/patient": generator menerjemahkannya sebagai senyap (IKLAN.md §1).
    rencana: ({C, total}) => {
      const HINDARI = ["vocals", "lyrics", "heavy four-on-the-floor kick", "booming sub bass", "trap 808", "breakdown", "silence", "quiet intro", "fade in", "sparse"];
      const dasar = ["upbeat modern pop-electronic instrumental", "118 BPM", "steady and continuous", "always present"];
      const b = (dari, sampai, teks, gaya) => ({detik: +(sampai - dari).toFixed(2), teks, gaya: [...dasar, ...gaya], hindari: HINDARI});
      return [
        b(0, C.Masalah, "[energy]", ["punchy groove from the very first beat", "bright"]),
        b(C.Masalah, C.Solusi, "[tension]", ["same groove", "darker chords", "rising tension"]),
        b(C.Solusi, C.CTA, "[peak]", ["full energy", "confident", "bright synth lead"]),
        b(C.CTA, total, "[lift]", ["open", "uplifting", "same groove"]),
        b(total, total + 8, "[tail]", ["groove continues"]),
      ];
    },
    titik: [["Hook", 0, -17], ["Solusi", -0.45, -17], ["Solusi", -0.4, -38], ["Solusi", 0.0, -38], ["Solusi", 0.05, -17], ["CTA", 0, -18]],
    fadeOut: ({total}) => [total - 0.6, 0.6],
  }],
  mixer: {"gainVO": 1.55, "gainSFX": 0.8},
  sampul: {detik: 0},
  periksa: {kapsi: '#kapsi'},
};
