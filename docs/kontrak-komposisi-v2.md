# Kontrak komposisi v2

Status: berlaku sejak 4 November 2026. Contoh yang dirender: `contoh/kontrak-v2/`.
Tes: `test/kontrak-v2.test.mjs`.

## Mengapa ada v2

Pada v1 (komposisi Claude Design), mesin menyesuaikan animasi dengan VO dengan **menambal
kode sumber JSX** memakai regex: `geserJangkar`, `geserDeret`, dan `geserKapsi` menulis ulang
angka seperti `CUES.Hook + 1.4`. Cara ini bergantung pada bentuk teks kode dan sudah
menimbulkan sedikitnya tiga insiden: kapsi tidak tergeser sama sekali, `at` menjadi NaN, dan
jangkar ditulis ke berkas JSX yang tidak dipakai.

Pada v2, mesin **tidak menyentuh kode komposisi**. Mesin hanya menulis data, lalu komposisi
membacanya saat halaman dimuat.

## Yang ditulis mesin

| Tempat | Isi | Kapan |
|---|---|---|
| `OM_SCENES` di HTML | `dur` tiap scene sesudah VO ditempatkan | `motion apply` / `render` MCP |
| `src/timing.js` | `window.VO_TIMING` dan `window.OM_CUES` | sama, dari timeline yang juga dipakai mixer |

`timing.js`:

```js
window.VO_TIMING = [{"no":1,"pos":0.2,"dur":1.437},{"no":2,"pos":2.8,"dur":2.638}];
window.OM_CUES = [{"nama":"pop","at":2.85}];
```

- `VO_TIMING[i]`: `no` = nomor baris VO di config, `pos` = detik mulai (absolut, dari awal
  video), `dur` = durasi suara sesudah trim. Urutannya mengikuti urutan baris di config.
- `VO_TIMING[i].kata` (opsional, P8-10): `[{w, a, b}]` tiap kata naskah dengan detik ABSOLUT mulai/akhir,
  untuk kapsi kata-demi-kata. Ada hanya bila VO dibuat dengan `suara.waktuKata: true` (TTS
  with-timestamps, CLI). Baris tanpa `kata` (VO lama, unggahan MCP) wajib tetap tampil dengan waktu
  per baris; jangan menganggap `kata` selalu ada.
- `OM_CUES[i]`: cue SFX dari config (`cue`) yang sudah dievaluasi ke detik absolut, terurut
  menurut `at`. Pakai untuk beat visual yang harus jatuh bersama bunyi. Cue di luar durasi
  video dibuang, sama seperti di mixer.
- Angka dibulatkan ke milidetik. Berkas ini selalu ditulis ulang utuh; jangan menyuntingnya.

## Yang wajib dilakukan komposisi

1. Tandai stage dengan `data-om-kontrak="2"` (boleh di HTML atau di JSX yang merender stage).
   Tanpa penanda ini komposisi diperlakukan sebagai v1.
2. Muat `timing.js` **sebelum** skrip utama: `<script src="timing.js"></script>`.
3. Baca durasi scene dari `OM_SCENES` saat halaman dimuat, dan set
   `data-om-exportable-video-with-duration-secs` dari totalnya.
4. Turunkan semua posisi kapsi dan beat dari `VO_TIMING`/`OM_CUES` (atau dari awal scene yang
   dihitung dari `OM_SCENES`). Jangan menulis detik absolut yang bergantung pada panjang VO.
5. Sediakan nilai cadangan bila `window.VO_TIMING`/`window.OM_CUES` belum ada, supaya `cuplik`
   sebelum VO diunggah tetap menampilkan sesuatu. Saat render, mesin selalu menulis keduanya.
6. Aturan v1 lain tetap berlaku: frame digambar sinkron dari `e.detail.time` pada event
   `data-om-seek-to-time-frame`, tanpa CSS animation/transition, timer, atau `Date.now()`.

## Config

Komposisi v2 **tidak boleh** memakai `jsx`, `kapsi`, `jangkar`, atau `deret` di config.
`terap` menolak kombinasi itu dengan galat yang menyebut field-nya, alih-alih melewatinya
diam-diam. `motion init` dan `impor_zip` mengenali v2 dan tidak menuliskan field tersebut
(`impor_zip` melaporkan `kontrak: 2` dan `keselarasan: null`).

## v1 dan v2 berdampingan

| | v1 | v2 |
|---|---|---|
| Penanda | tidak ada / `data-om-kontrak="1"` | `data-om-kontrak="2"` |
| `OM_SCENES` ditulis ulang | ya | ya |
| `timing.js` ditulis | ya (boleh diabaikan) | ya (wajib dibaca) |
| JSX ditambal | ya, dari `.asli` | tidak pernah |
| Laporan keselarasan JSX | ya | tidak relevan |

Nilai penanda selain 1 atau 2 menghasilkan galat, supaya versi kontrak berikutnya tidak
diperlakukan sebagai v1 secara diam-diam.

## Memindahkan komposisi v1 ke v2

1. Tambahkan `data-om-kontrak="2"` ke stage dan `<script src="timing.js"></script>`.
2. Ganti array `caps` berisi `{ at: CUES.X + n, … }` dengan pencarian di `VO_TIMING`
   (lihat fungsi `frame` di `contoh/kontrak-v2/src/Video.html`).
3. Ganti tiap jangkar `CUES.X + n` yang dimaksudkan mengikuti kata dengan
   `VO_TIMING.find((v) => v.no === k).pos`, dan beat yang mengikuti bunyi dengan `OM_CUES`.
4. Hapus `jsx`, `kapsi`, `jangkar`, dan `deret` dari config, lalu jalankan `motion apply`.
