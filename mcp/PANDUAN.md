# Motion MCP — panduan kerja

Server ini merender **komposisi HTML** menjadi MP4 (Chromium per frame + ffmpeg), lengkap dengan
voice-over, SFX, musik, kapsi yang mengikuti suara, dan mix -14 LUFS / -1 dBTP.
Server ini **tidak** membuat suara. VO dibuat dengan connector ElevenLabs milik pengguna di Claude,
lalu URL audionya diunggah ke sini.

## Alur

1. `buat_proyek` → dapat `proyek` (id).
2. Tulis komposisi dengan `tulis_berkas` (atau `impor_zip` untuk zip Claude Design).
3. `cuplik` beberapa detik untuk melihat tata letak. Perbaiki dan ulangi sampai rapi.
4. VO, satu berkas per baris naskah:
   - connector ElevenLabs: `creative_list_voices` → pilih suara → `creative_generate_speech`
     (bahasa `id`) → poll `creative_get_flow_run_status` sampai selesai → ambil URL audionya;
   - `unggah` `{jenis: "vo", no: <nomor baris>, url}`. Server memotong senyap kepala/ekor.
     `tempo` (0,5–2, bawaan 1) mempercepat tanpa mengubah nada; connector tidak punya `speed`.
5. SFX: `cari_sfx` di stok (±700 bunyi, gratis) → pakai id-nya sebagai `"@stok/<id>"`.
   Bunyi sendiri: `unggah` `{jenis: "sfx", nama, url}` lalu tulis `"@luar"`.
6. Musik (opsional): `unggah` `{jenis: "musik", nama, url}`. Connector ElevenLabs terbatas tidak
   bisa membuat musik; pakai trek milik pengguna atau connector ElevenLabs penuh.
7. `simpan_config` (skema di bawah). Validasi langsung jalan: scene, SFX, dan ekspresi dicek.
8. `render` dengan `frames: 60` untuk uji cepat, lalu `render` penuh. Poll `status_render`
   tiap ±20 detik. Hasilnya tautan MP4 + sampul JPG (berlaku 7 hari) dan laporan durasi/audio.

Yang perlu dicek di laporan: `mp4_lufs` di -14 ±1, `mp4_dbtp` ≤ -1,0, `sampul_kontras` ≥ 75%
(frame 0 = sampul Reels/TikTok, jadi scene pertama jangan dibuka dengan fade dari hitam).

## Kontrak komposisi

Satu berkas `.html` (nama bebas, misal `Video 9x16.dc.html`) di akar `src/`:

- `window.OM_SCENES = '[{"name":"Hook","dur":3},{"name":"Isi","dur":6}]';` — **teks JSON dalam
  kutip tunggal**, di `<script>` sendiri. Mesin menulis ulang `dur` supaya VO muat, jadi baca
  durasi dari sini saat halaman dimuat; jangan menulis detik scene di tempat lain.
- Satu elemen stage berukuran piksel tetap dengan atribut
  `data-om-exportable-video-with-duration-secs="<total>"`. Ukuran: 1080×1920 (9:16),
  1080×1350 (4:5), 1080×1080 (1:1), 1920×1080 (16:9). Set atributnya dari total OM_SCENES.
- Stage mendengarkan event `data-om-seek-to-time-frame` dan **menggambar frame untuk
  `e.detail.time` secara sinkron**. Semua gerak adalah fungsi dari `t`: tanpa CSS animation/
  transition, tanpa setTimeout, tanpa `Date.now()`. Frame dirender acak urutannya di beberapa tab.
- `<script src="timing.js"></script>` sebelum skrip utama. Mesin menulis
  `window.VO_TIMING = [{no, pos, dur}, …]` (detik absolut) sesudah VO ditempatkan. Pakai untuk
  kapsi dan beat yang harus jatuh tepat di kata. Sediakan perkiraan cadangan agar `cuplik`
  sebelum render tetap tampil.
- Font dari Google Fonts boleh. Gambar: `unggah` `{jenis: "gambar", nama: "img/logo.png", url}`
  lalu rujuk relatif (`img/logo.png`).

Contoh minimal yang benar:

```html
<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=block" rel="stylesheet">
<script>window.OM_SCENES = '[{"name":"Hook","dur":3},{"name":"CTA","dur":4}]';</script>
<script src="timing.js"></script>
<style>
  html,body{margin:0;background:#000}
  #stage{position:relative;width:1080px;height:1920px;overflow:hidden;background:#0b0b0d;color:#f4f1ea;
    font-family:'Plus Jakarta Sans',sans-serif}
  .judul{position:absolute;left:80px;right:80px;top:760px;font-size:96px;font-weight:800;line-height:1.1}
  .kapsi{position:absolute;left:80px;right:80px;bottom:260px;font-size:52px;font-weight:700;text-align:center}
</style></head><body>
<div id="stage" data-om-exportable-video-with-duration-secs="7">
  <div class="judul" id="judul"></div><div class="kapsi" id="kapsi"></div>
</div>
<script>
(() => {
  const SC = JSON.parse(window.OM_SCENES), C = {}; let total = 0;
  for (const s of SC) { C[s.name] = total; total += s.dur; }
  const stage = document.getElementById('stage');
  stage.setAttribute('data-om-exportable-video-with-duration-secs', total.toFixed(2));
  const VO = window.VO_TIMING || [{no: 1, pos: 0.2, dur: 2.4}, {no: 2, pos: C.CTA + 0.3, dur: 3}];
  const KAPSI = {1: 'Kalimat pertama', 2: 'Kalimat kedua'};
  const pr = (t, a, d) => Math.min(1, Math.max(0, (t - a) / d));
  function frame(t) {
    const j = document.getElementById('judul');
    j.textContent = t < C.CTA ? 'Hook besar' : 'Ajakan';
    const k = t < C.CTA ? 1 : pr(t, C.CTA, 0.3);      // scene pertama tanpa fade: frame 0 = sampul
    j.style.opacity = k; j.style.transform = `translateY(${(1 - k) * 40}px)`;
    const l = VO.find((v) => t >= v.pos - 0.15 && t < v.pos + v.dur + 0.2);
    document.getElementById('kapsi').textContent = l ? KAPSI[l.no] : '';
  }
  stage.addEventListener('data-om-seek-to-time-frame', (e) => frame(Number(e.detail.time) || 0));
  frame(0);
})();
</script></body></html>
```

## Skema config (`simpan_config`)

```json
{
  "komposisi": "Video 9x16.dc.html",
  "vo": [
    {"no": 1, "sc": "Hook", "off": 0.2, "text": "Kalimat pertama."},
    {"no": 2, "sc": "CTA",  "off": 0.3, "text": "Kalimat kedua."}
  ],
  "tata": {"mode": "jangkar", "jeda": 0.15, "ekorBiasa": 0.5, "ekor": {"CTA": 1.2}},
  "sfx": [["pop", "@stok/03-pop"], ["whoosh", "@stok/air-whoosh-fast"], ["logo", "@luar"]],
  "cue": [
    {"at": "C.CTA - 0.25", "nama": "whoosh", "gain": 0.22},
    {"at": "P[2] + 0.05", "nama": "pop", "gain": 0.3, "nada": 2, "pan": -0.3}
  ],
  "musik": [{"nama": "bgm", "mulai": 0, "fadeOut": ["total - 0.7", 0.7],
             "titik": [["Hook", 0, -20], ["CTA", 0.3, -21]]}],
  "gate": [["E[1] + 0.1", "P[2] - 0.2"]],
  "sampul": {"detik": 0},
  "mixer": {"gainVO": 1.45, "gainSFX": 0.62}
}
```

- `vo[].sc` + `off`: baris mulai paling cepat `off` detik sesudah scene `sc` mulai. Mode
  `jangkar`: scene hanya memanjang supaya VO muat. Mode `alir`: baris mengalir berurutan dan
  durasi scene diturunkan penuh dari VO (scene boleh memendek) — pakai kalau `off` cuma perkiraan.
- `vo[].no` = nomor berkas `unggah` jenis `vo`. Setiap baris wajib sudah diunggah sebelum render.
- Ekspresi detik (`cue.at`, `gate`, `musik.mulai`, `musik.fadeOut[0]`): angka, `+ - * /`,
  kurung, `min()`, `max()`, dan `C.<scene>` (mulai scene), `S.<scene>` (durasi scene),
  `P[n]`/`E[n]` (awal/akhir VO ke-n), `total`. Scene berspasi: `C['Nama Scene']`.
- `cue`: minimal satu. `gain` 0,1–0,45 lazim; `nada` dalam semiton; `pan` -1…1.
- `musik.titik`: `[scene, offset, dB]` amplop volume (bed lazim -20…-23 dB). Hindari lompatan
  lebih dari 6 dB dalam kurang dari 1,5 detik — terdengar seperti musiknya bolong.
- `gate`: jendela yang benar-benar senyap (jeda dramatis). Ikat ke `E[n]` DAN `P[n+1]`.
- Opsional untuk komposisi Claude Design (.jsx): `jsx`, `kapsi: true`, `jugaTulis`,
  `jangkar: {"namaVar": noVO}`, `deret: {"namaVar": [noVO,…]}` — sama dengan README motion-engine.

## Batas

Video maks 180 detik, 20 proyek per akun, unggahan maks 50 MB, proyek yang tidak disentuh
14 hari dihapus. Render berjalan bergiliran; `status_render` menyebut urutan antrean.
