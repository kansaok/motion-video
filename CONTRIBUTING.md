# Berkontribusi ke motion-engine

## Menyiapkan dan menjalankan tes

```sh
npm ci                          # wajib; lockfile dipakai juga oleh image Docker
npx playwright install chromium # hanya untuk tes render dan menjalankan render
npm test                        # semua test/*.test.mjs (node:test)
npm run periksa:tipe            # tsc --noEmit atas JSDoc; harus bersih
npm run periksa:playwright      # versi playwright = tag image Docker
```

- Tes yang butuh Chromium (`test/kontrak-v2.test.mjs`) dilewati otomatis bila Chromium tidak
  ada; CI menjalankannya tanpa Chromium. Jalankan lokal sebelum mengubah `lib/render.mjs`.
- Tes **tidak boleh** memanggil ElevenLabs atau jaringan. Audio dibuat sintetis dengan ffmpeg
  (`sine`, `anullsrc`); lihat `test/vo.test.mjs` dan `test/kontrak-v2.test.mjs`.
- Tes yang memakai `mcp/proyek.mjs` harus mengatur `DATA_DIR` ke direktori sementara **sebelum**
  impor dinamis (lihat `test/operasional.test.mjs`).
- Server MCP diuji lokal tanpa bimp: `MCP_DEV_TOKEN=dev-token-... DATA_DIR=./data npm run mcp`.

## Definisi selesai

1. Perubahan perilaku punya tes yang **gagal tanpa perubahan itu**.
2. `npm test` dan `npm run periksa:tipe` hijau.
3. Tidak ada cek atau validasi produksi yang dilemahkan. Kalau sebuah cek sengaja diubah,
   alasannya ada di komentar dan di pesan commit.
4. Dokumen terdampak ikut diperbarui. Perubahan skema `Config` di `mcp/alat.mjs` **wajib**
   disalin ke `mcp/PANDUAN.md` (kontrak untuk Claude sebagai klien MCP).
5. Perubahan yang terlihat pengguna dicatat di `CHANGELOG.md`.
6. Tidak ada rahasia di commit; `.env*` selain contoh selalu diabaikan.

## Penamaan: Indonesia untuk domain, Inggris untuk istilah teknis

- Nama fungsi, variabel, dan komentar memakai bahasa Indonesia untuk konsep domain:
  `bacaScenes`, `pangkasVo`, `geserKapsi`, `jendela`, `lubang`, `kunci`, `antrean`.
- Istilah teknis yang tidak punya padanan lazim tetap Inggris: `scene`, `cue`, `stem`, `mix`,
  `render`, `frame`, `token`, `bucket`, `sandbox`, `LUFS`, `dBTP`.
- API pihak ketiga dan format berkas tidak diterjemahkan (`OM_SCENES`, `data-om-*`,
  `xi-api-key`, field JSON ElevenLabs).
- Konstanta perilaku (ambang, batas) hanya di `lib/konstanta.mjs`, dengan sebabnya.

## Tulis sebab, bukan isi

Komentar menjelaskan **mengapa** kode berbentuk begitu, biasanya dengan insiden dan angkanya:

```js
// buruk: memangkas senyap di awal
// baik:  10 ms di atas -58 dB, bukan 30 ms di atas -50 dB: letusan /t/ /k/ /p/ cuma 10-20 ms,
//        dan syarat 30 ms membuat "Toh pakai LPWA" tertranskrip "Love pakai LPWA".
```

Aturan tanpa sebab akan dihapus orang berikutnya yang menganggapnya berlebihan, dan insidennya
terulang. Cek yang tidak mungkin gagal, atau yang selalu merah di satu kelas video, sama gunanya
dengan cek yang tidak ada; perbaiki atau hapus, jangan diamkan.

## Menambah aturan ke `IKLAN.md`

`IKLAN.md` menyimpan hal yang tidak bisa dibaca dari kode: musik, SFX, VO, cerita, gerak.

1. Taruh di bagian yang sesuai (§ musik, SFX, VO, ...). Judul aturan adalah perintahnya.
2. Tulis **sebabnya**: video mana, apa yang terjadi, apa keluhan penonton/pemilik.
3. Tulis **angka ukurnya**: dB, detik, hasil transkrip balik, sebelum dan sesudah. Bandingkan
   minimal dua varian pada bahan yang sama bila memungkinkan.
4. Bila aturannya bisa dicek mesin, tambahkan ceknya di `lib/periksa.mjs` atau tahap terkait,
   lalu rujuk dari `IKLAN.md`.
5. Bila aturan itu keputusan yang tidak boleh diulang, tambahkan satu baris ke bagian "Jangan
   diulang" di `CLAUDE.md` **dan** `AGENTS.md`.

## Menambah SFX ke stok

1. Selesaikan proyeknya seperti biasa (`motion sfx` menghasilkan `proyek/<nama>/aset/sfx/*.mp3`).
   Prompt aslinya dibaca dari tuple `['nama', detik, 'prompt']` di `motion.config.mjs`, jadi jangan
   hapus tuple itu sesudah bunyinya jadi.
2. `motion stok --bangun` mengumpulkan ulang semua bunyi, membuang duplikat, mengategorikan, dan
   menulis `sfx-stok/katalog.json` + `sfx-stok/KATALOG.md`.
3. Periksa baris baru di `KATALOG.md`; bunyi berkategori "lain" perlu kata kunci baru di
   `ATURAN` (`lib/stok.mjs`).
4. Commit `katalog.json` dan `KATALOG.md` saja (`*.mp3` diabaikan git). Sinkronkan berkas audio
   ke mesin render dan ke folder Drive yang disebut README.

## Commit dan PR

- Commit kecil; pesan menyebut ID tugas `RENCANA-PERBAIKAN.md` bila ada (`P3-04: ...`).
- Satu commit tidak mencampur pemformatan massal dengan perubahan perilaku.
- Deskripsi PR menyebut cara menguji, angka sebelum/sesudah untuk perubahan audio atau render,
  dan dokumen yang ikut diubah.
