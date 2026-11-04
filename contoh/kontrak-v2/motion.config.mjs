// Contoh kontrak komposisi v2. VO diunggah/ditaruh tangan (`suara.luar`), jadi tidak ada
// panggilan ElevenLabs. Tidak ada `jsx`, `kapsi`, `jangkar`, atau `deret`: komposisi membaca
// timing.js yang ditulis `motion apply`.
export default {
  nama: 'kontrak-v2',
  komposisi: 'Video.html',
  keluaran: 'kontrak-v2.mp4',
  suara: {luar: true},
  vo: [
    {no: 1, sc: 'Hook', off: 0.2, text: 'Video dari satu berkas HTML.'},
    {no: 2, sc: 'Isi', off: 0.3, text: 'Kapsi ikut suara, tanpa tambalan.'},
    {no: 3, sc: 'CTA', off: 0.2, text: 'Coba sekarang.'},
  ],
  tata: {mode: 'jangkar', jeda: 0.15, ekorBiasa: 0.5},
  // Taruh bunyi sendiri di aset/sfx/pop.mp3, atau ganti '@luar' dengan '@stok/03-pop'.
  sfx: [['pop', '@luar']],
  // Cue yang sama menggerakkan SFX di mixer dan lencana di layar (lewat window.OM_CUES).
  cue: ({P}) => [{nama: 'pop', at: P[2] + 0.05, gain: 0.3}],
};
