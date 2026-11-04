# CLAUDE.md — motion-engine

Panduan untuk Claude Code waktu bekerja di repo ini.

## Baca ini dulu, tiap kali

| **Berkas** | **Isi** |
|---|---|
| `README.md` | aturan MESIN: pipeline, cache, mixer, render, rasio |
| `IKLAN.md` | aturan IKLAN: musik, SFX, VO, cerita, gerak — **wajib dibaca sebelum menulis config** |

`IKLAN.md` menyimpan hal yang tidak bisa dibaca dari kode: kenapa satu naskah menjual, kenapa satu trek musik terdengar datar, dan setting mana yang sudah diuji balik. Semua aturannya lahir dari kesalahan yang benar-benar terjadi. Jangan menulis ulang naskah, musik, atau cue tanpa membacanya — kamu akan mengulang kesalahan yang sudah dibayar.

## Jangan diulang: yang sudah diputuskan

- **Video tutorial: tonjolkan nilai inti fitur** (Rama, 9 Okt 2026). Naskah dibuka dan dipuncaki oleh hal terpenting, bukan urutan klik saja. Link WhatsApp pertama dibuat ulang karena hanya menunjukkan pembagian chat, padahal intinya kode pengunjung `K-XXXXX` yang menyambungkan chat ke klik iklan.
- **Video tutorial: dashboard pihak ketiga WAJIB mirip aslinya** (Rama, 9 Okt 2026). Meta Events Manager, Kapso, Repliz, Google, TikTok, dan lain-lain tidak boleh digambar sebagai mock netral. Video Kapso pertama terlanjur tayang dengan Kapso terang, padahal aslinya gelap, lalu harus dibuat ulang. Urutannya: buka halaman asli di browser bawaan (cookies Rama sudah terimpor), screenshot, salin ke `proyek/<nama>/aset/ref-<vendor>/`, lalu recreate dari gambar itu dengan data palsu. Jangan klik tombol yang membuat kredensial (Generate access token, Create API key); ambil dialognya dari screenshot docs. Label tombol ikut UI asli, bukan teks docs yang bisa basi.
- **SFX: cek** `sfx-stok/` **dulu.** Jalankan `motion stok <kata>` sebelum menulis prompt baru, lalu pakai `['nama', '@stok/<id>']`. Generate ElevenLabs hanya kalau tidak ketemu atau tidak cocok. Lihat README "SFX: cek stok dulu".
- **Musik pakai** `rencana`**, bukan** `prompt`**.** Satu prompt untuk satu gumpalan menghasilkan musik datar; itu yang dilaporkan sebagai "monoton". Lihat `IKLAN.md` §1.
- **Jangan pernah minta bagian musik yang "sparse", "quiet", atau "patient".** Generator menerjemahkannya sebagai senyap. Dua kali menghasilkan lubang di scene pembuka.
- **Suara kampanye Rama Digital: Cahaya** `iWydkXKoiVtvdn4vLKp9`, `style` 0,72, `stability` 0,14, `speed` 1,20 (1,2 itu batas API).
- **Hentakan besar dilapis empat**, dan hanya sekali per video.
- **Ikon produk digambar sebagai SVG asli**, bukan teks saja.
- **Sunting** `.jsx` **DAN** `.jsx.asli`**.** `apply` memulihkan dari `.asli`.
- **Puncak audio dikalibrasi di mesin render**, karena ffmpeg di sana versinya beda dan encode AAC-nya melonjak lebih jauh. Jangan menambal dengan menurunkan `gainSFX` — itu tebakan yang mengecilkan pukulannya. Lihat `IKLAN.md` §7.
- **Akar komponen pakai** `React.Fragment`, bukan pembungkus ber-`aspectRatio`.
- **Rasio: padatkan JARAK, jangan perkecil kanvas.** 9:16, 4:5, dan 1:1 sama-sama selebar 1080, jadi metrik mendatarnya identik. Lihat `IKLAN.md` §8 untuk pola `f()` dan `V()`.
- **16:9 tidak dibuat untuk komposisi tegak** — selalu jadi rasio paling lemah.

## Mengerjakan kode mesin

```sh
npm ci                     # sekali; tanpa node_modules tes MCP gagal impor SDK
npm test                   # node:test, semua di test/*.test.mjs
npm run periksa:tipe       # tsc --noEmit (JSDoc + checkJs), wajib bersih
npm run periksa:playwright # versi playwright sama dengan tag image Docker
```

- **Jangan melemahkan cek atau validasi produksi demi membuat tes lulus.** Kalau cek memang harus
  berubah, tulis alasannya di komentar dan di pesan commit.
- Tiap perubahan perilaku punya tes yang gagal tanpa perubahan itu. Tes tidak boleh memanggil
  ElevenLabs sungguhan; pakai audio sintetis ffmpeg.
- Komentar menulis **sebab** (insiden, angka ukur), bukan mengulang apa yang dilakukan kode.
- Ambang audio dan batas bawaan hanya di `lib/konstanta.mjs`. Perubahan skema `Config` di
  `mcp/alat.mjs` wajib disalin ke `mcp/PANDUAN.md`; yang tidak kompatibel menaikkan `VERSI_SKEMA`
  (`mcp/skema.mjs`) dan versi mayor di `CHANGELOG.md`.
- Commit kecil, pesan menyebut ID tugas dari `RENCANA-PERBAIKAN.md` bila ada.

Peta berkas lengkap dan tabel "gejala → berkas": `docs/arsitektur.md`. Konvensi: `CONTRIBUTING.md`.

## Tempat berkas

- Sumber tiap video: `proyek/<nama>/`
- Hasil akhir untuk dikirim: `~/Videos/Ads/<Merek>/<Angle>/`
- Nama berkas: `<merek>-<angle>-<rasio>.mp4`, contoh `rama-digital-era-agi-9x16.mp4`
- Tiap folder angle memuat `naskah.md`: VO per detik, teks layar, musik, SFX, angka mutu

## Build, test, render: di `rama-tuf`

Jangan menjalankan render, build, atau dev server di mesin ini.

```sh
ssh rama-tuf 'bash -lc "cd ~/render/motion-engine && WORKERS=8 node bin/motion.mjs render proyek/<nama>"'
```

`~/Project/motion-engine` di `rama-tuf` berisi repo LAIN. Dipakai `~/render/motion-engine` sebagai gantinya; sinkronkan dengan `rsync`, jangan sentuh checkout yang satunya.

## Selalu tutup dengan `check`

`motion check` menjalankan serangkaian verifikasi (daftarnya di README "Verifikasi"), dan tiap satunya pernah menangkap kelas kesalahan yang tidak terlihat. Kalau salah satu gagal, sebutkan angkanya — jangan diamkan.

Perintah yang bisa membuat VO/SFX/musik berhenti bila perkiraan biayanya di atas `BIAYA_MAKS_USD`. Jangan langsung mengulang dengan `--ya`: baca dulu rinciannya. Perkiraan yang tiba-tiba memuat semua baris VO biasanya berarti perubahan config menyentuh kunci cache semua baris (`suara.*`, `lafal`, model).

## Kalau kamu menemukan aturan baru

Tulis ke `IKLAN.md` beserta **sebabnya** dan angkanya. Aturan tanpa sebab akan dilanggar orang berikutnya.
