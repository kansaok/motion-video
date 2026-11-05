# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/) dan versi mengikuti
[SemVer](https://semver.org/lang/id/). Versi ini juga yang diumumkan server MCP ke klien.

Aturan versi:
- **Mayor**: perubahan skema `Config` yang tidak kompatibel. Wajib menaikkan `VERSI_SKEMA` di
  `mcp/skema.mjs` dan menambah langkah migrasi untuk config lama.
- **Minor**: alat, field, atau perilaku baru yang tidak merusak klien/config lama.
- **Patch**: perbaikan tanpa perubahan kontrak.

## [Belum dirilis]

Hampir semua perubahan di bawah ada di CLI (`motion`). Di server MCP: perbaikan mixer (dipakai
keduanya), parameter render parsial yang aditif (`scene`, `dari`, `sampai` di alat `render`),
tautan subtitle di hasil `status_render`, pencarian `cari_sfx` yang terurut (parameter `mirip`), dan
`webhook` di alat `render`, `batalkan_render`, dasbor `/admin`, dan `daftar_templat`/`pakai_templat`. Semuanya aditif; status
render bisa bernilai `dibatalkan`.

### Ditambahkan

- `motion kirim` (P8-12): MP4 tiap rasio, sampul, dan subtitle ke `~/Videos/Ads/<Merek>/<Angle>/` dengan
  nama `<merek>-<angle>-<rasio>.mp4`, plus `naskah.md` (VO per detik dari penempatan yang sama dengan
  mixer, musik, SFX, teks layar, angka mutu). Gerbang mutu memakai ambang `check`; berkas tujuan yang
  sudah ada dan isinya beda tidak ditimpa tanpa `--timpa`.
- `status_render` memuat `kemajuan` selama render: frame, persen, perkiraan sisa detik, dan rasio
  ke-berapa untuk `semua_rasio` (P8-12). Pesan frame dari pekerja dulu hanya dibaca watchdog.
- Alat MCP `render` menerima `semua_rasio` (P8-11): komposisi utama + tiap komposisi di `jugaTulis`
  dari satu master audio, hasil `varian` dengan tautan dan nilai tiap rasio; batas waktu render
  dikalikan jumlah rasio. Alat baru `unggah_vo`: banyak baris VO dalam satu panggilan, hasil per baris.
- Mode draf (P8-07): `motion render --draf` dan `draf: true` di alat MCP `render`. 540p, 15 fps, x264
  `veryfast` ke `-draf.mp4` terpisah, tanpa sampul, subtitle, dan pemeriksaan; separuh frame yang
  difoto dengan seperempat pikselnya. Nama draf dipasang di satu pintu (`Pipa.opsiRender`), jadi
  draf tidak pernah menimpa MP4 penuh, termasuk lewat `--semua-varian`.
- `motion init --design=<tautan|projectId>` dan `bin/impor-design.mjs` (P6-10): impor proyek Claude Design tanpa zip, hanya CLI.
- Templat komposisi `templat/` (iklan, testimoni, trailer, tutorial): `motion init --templat=<nama>` dan alat
  MCP `daftar_templat`/`pakai_templat`. Kontrak v2, teks layar di `src/isi.js`, config CLI dan MCP setara.
- Alat MCP `batalkan_render` dan dasbor admin `/admin` (aktif bila `ADMIN_TOKEN` >= 32 karakter):
  antrean, render jalan, riwayat, disk per akun, tombol batalkan (CSRF per render). Status render baru
  `dibatalkan`; pembatalan mematikan seluruh grup proses pekerja tanpa restart container.
- Alat MCP `render` menerima `webhook`: POST bertanda tangan HMAC (`X-Motion-Waktu`, `X-Motion-Tanda`)
  saat render selesai/gagal; hanya https ke alamat publik, IP dipatok saat kirim (anti DNS rebinding),
  tanpa redirect, maksimal 3 percobaan; keadaannya di `status_render.webhook`.
- Cache VO lintas proyek (`~/.motion/cache-vo`, `MOTION_CACHE_VO`): baris dengan permintaan identik
  (termasuk kalimat tetangga) tidak dibayar ulang; perkiraan biaya dan `biaya.json` mencatat hematnya.
- Pencarian stok SFX terurut (nama > cocok-untuk > prompt > kategori), sinonim Indonesia–Inggris,
  negasi di prompt diabaikan, saran kata untuk kueri kosong, `motion stok --mirip=<id>`; alat MCP
  `cari_sfx` menerima `mirip` (aditif).
- Subtitle `.srt`/`.vtt` + naskah akhir `-naskah.txt` di tiap render penuh (CLI dan MCP); MCP
  `status_render` memuat tautan unduhnya dan `/unduh` melayani `.srt`, `.vtt`, `.txt`.
- `varian` di config + `motion render --semua-varian`: semua rasio dari satu master audio, OM_SCENES
  tiap varian dicek terhadap timeline sebelum render, satu laporan gabungan dengan ambang `check`.
- Render parsial: `motion render --scene=<nama|no>` atau `--dari`/`--sampai`, dan parameter
  `scene`/`dari`/`sampai` di alat MCP `render`. Hanya frame rentang itu yang dirender, audio ikut
  dipotong, ke berkas `-potong-<dari>-<sampai>.mp4`; MP4 penuh dan sampulnya tidak tertimpa.
- `motion plan --kering` / `motion all --kering`: durasi, posisi, cue, musik, dan biaya tanpa
  ElevenLabs dan tanpa menulis ke proyek (laporan `kerja/kering.json`). `suara.kps` opsional untuk
  perkiraan durasi suara yang belum punya VO di proyek.
- `motion doctor`: prasyarat mesin dalam satu daftar centang dengan saran perbaikan; kode keluar 1
  bila ada yang gagal.
- Perkiraan biaya ElevenLabs sebelum `plan`, `apply`, `sfx`, `music`, `mix`, `check`, dan `all`;
  berhenti bila di atas `BIAYA_MAKS_USD` (bawaan $0,50) kecuali disetujui atau `--ya`.
  Realisasinya dicatat ke `<proyek>/biaya.json`.
- `motion music` mencetak peta level bed per trek (sparkline) dan lubangnya dalam detik video,
  scene, dan bagian `rencana`, sebelum mix dan render. Trek `luar` ikut diperiksa.
- `motion check` memeriksa tata letak di komposisi hidup: teks keluar stage atau terpotong
  wadah, kapsi kosong (`periksa: {kapsi: '<selektor>'}`), dan frame hitam.

### Diubah
- Perataan -6 dBFS tiap sumber kini di filtergraph mixer, bukan di MP3 baru (P8-09): VO, SFX, dan
  musik tidak lagi di-encode MP3 dua kali sebelum mix, dan `vo/norm/`, `sfx/norm/`, `*-norm.mp3`
  dibuang. Loop loudness mengukur LUFS tanpa true peak, `check`/laporan MCP mengukur LUFS + dBTP
  dalam satu lintasan, dan `hening` mendekode rentangnya sekali. Terukur pada video sintetis 60 dtk
  (20 VO, 45 cue): mix 17,7 → 13,2 dtk, `hening` 7,7 → 0,15 dtk, ringkasan MP4 1,9 → 0,7 dtk.
- `mix` memakai ulang `master.wav` bila seluruh masukannya sama (P8-08): opsi mixer, posisi VO,
  cue, amplop, gate, isi tiap berkas sumber, dan kode mixer. Render MCP sesudah revisi visual saja,
  `scene`, atau `frames` tidak lagi menjalankan mix penuh. `motion mix --paksa` untuk mix ulang.
- VO dan SFX dibuat bersamaan (P8-04): paling banyak 3 permintaan ElevenLabs sekaligus
  (`MOTION_EL_PARALEL`), dibatasi bersama di `el.kirim` sehingga `motion all` membuat SFX dan VO
  serentak. Permintaan pertama tetap berjalan sendirian, jadi kunci salah atau kuota habis
  berhenti di baris pertama seperti dulu. Terukur dengan server tiruan berlatensi 1,2 dtk:
  23 VO + 17 SFX dari 62,5 dtk menjadi 22,3 dtk.
- Galat ElevenLabs digolongkan: 429/5xx/timeout diulang dengan menghormati `Retry-After`; 4xx
  lain tidak; kuota/kredit habis menghentikan rantai. Pesan galat menyebut baris VO, SFX, atau
  trek musiknya.

### Diperbaiki
- `check` meloloskan jendela hening pada MP4 yang tidak terbaca: tiap jendela 20 ms terbaca tanpa
  audio, yaitu "senyap ✓". Kini gagal dengan sebabnya (P8-09).
- `bin/srt.mjs` memposisikan subtitle di awal scene + `off`, tidak mengikuti `tata`: di mode `alir` dan
  saat jangkar mendorong baris, subtitle muncul sebelum suaranya.
- Mix video tanpa satu pun cue SFX gagal dengan `amix=inputs=0`.
- Stage yang lebih besar dari viewport render (contoh minimal `mcp/PANDUAN.md`: stage 1080x1920 tanpa
  skala, di viewport 1400x1600 bawaan Docker) keluar terpotong lalu gepeng tanpa galat, karena
  Playwright memangkas `clip` screenshot ke viewport. Viewport kini diperbesar sampai stage muat;
  stage yang tetap di luar halaman ditolak, dan frame yang aspeknya beda dengan keluaran
  menggagalkan render sebelum encode (P8-01).
- `motion check` menimpa `master.wav` dan `stem/` dengan mix tanpa SFX untuk A/B lalu memulihkannya
  tanpa `finally`; check yang dihentikan di tengah meninggalkan master tanpa SFX. A/B kini ditulis
  ke berkas sendiri, sekaligus hemat satu mix penuh (P8-02).
- Warna MP4 bergeser di pemutar: frame dikonversi BT.601 tanpa tanda, sementara pemutar membaca
  video HD tak bertanda sebagai BT.709 (#25D366 tampil 22,186,99). MP4 kini BT.709 bertanda,
  termasuk gambar sampul yang ditempel dan `-sampul.jpg` (P8-03).

## [1.1.0] - 2026-11-04

### Ditambahkan
- Kontrak komposisi v2 (`data-om-kontrak="2"`): mesin menulis `timing.js` berisi `VO_TIMING`
  dan `OM_CUES`, dan tidak pernah menambal kode komposisi. Lihat `docs/kontrak-komposisi-v2.md`.
- `impor_zip` melaporkan `kontrak` dan `keselarasan` (berapa jangkar/kapsi JSX yang bisa ditulis
  balik) per komposisi.
- `info_proyek` melaporkan `dihapusDalamHari`.
- Endpoint `/hidup`, `/siap`, dan `/metrik` (Prometheus, hanya jaringan internal).
- Field `versiSkema` di config; config lama tanpa field ini dimigrasikan otomatis.

### Diubah
- Render dan cuplik berjalan dalam sandbox bubblewrap yang hanya memasang proyek aktif.
- Render baru ditolak saat disk server hampir penuh (`MIN_DISK_MB`), bukan gagal di tengah jalan.
- `stem/`, `cuplikan/`, dan `aset/master.wav` dibuang dari proyek yang 24 jam tidak disentuh.
- Log server berupa JSON satu baris, tanpa token, naskah, atau URL.

### Diperbaiki
- Nama scene berisi `]`, `;`, kutip, atau unicode tidak lagi merusak pembacaan `OM_SCENES`.
- Pemeriksaan musik berlubang tidak lagi melaporkan "rata" ketika berkasnya gagal dibaca.
- Server statis renderer menolak symlink, berkas tersembunyi, dan direktori sibling.

## [1.0.0]

Rilis awal motion-mcp.
