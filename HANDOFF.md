# Handoff pekerjaan motion-engine

Terakhir diperbarui: 5 November 2026 (Asia/Jakarta).

## Sudah dikerjakan

- **Fase 0**: runner `node:test`, fixture/regresi fungsi inti, CI Node 20/22, lockfile,
  `npm ci` di image Docker, dan cek keselarasan versi Playwright dengan tag image.
- **P1-01 s.d. P1-04**: render MCP dipindah ke pekerja proses anak; ada batas total,
  watchdog frame, pembersihan frame saat kill, antrean maksimum/retensi/estimasi, serta
  batas CPU/RAM/PID dan volume tmp Docker.
- **P2-01**: production gagal start bila rahasia wajib kosong/pendek atau token dev aktif.
- **P2-02**: ZIP diperiksa sebelum ekstrak (ukuran, jumlah entri, rasio kompresi, traversal),
  dan operasi tulis dibatasi kuota akun (`KUOTA_MB`).
- **P2-03**: render dan cuplik berjalan lewat `bubblewrap`: namespace PID/mount baru hanya
  memasang proyek aktif, environment pekerja adalah allowlist, dan Chromium memakai sandbox.
  Prosedur bukti pascadeploy ada di `docs/isolasi-renderer.md`.
- **P2-04**: SSRF memblokir rentang tambahan, cache DNS TTL 60 detik, unduhan HTTPS dipin
  ke alamat hasil resolve, dan WebSocket Chromium dijaga. Dokumentasi firewall ada di
  `docs/jaringan.md`.
- **P2-05**: contoh nginx menyamarkan token `/mcp/<token>` di access log; error transport
  server tidak mencetak objek yang berpotensi memuat URL bertoken.
- **P2-06**: token bucket per akun untuk `unggah`, `impor_zip`, `render`, dan `cuplik`;
  cuplikan maksimal dua global dan satu per akun.
- **P2-07**: server statis renderer menolak traversal/symlink, file tersembunyi, dan artefak
  `.asli/.terap/.kunci`; respons memakai `X-Content-Type-Options: nosniff`.
- **P3-01 (sebagian yang relevan)**: penggantian teks di komposisi memakai callback agar
  token `$` tidak ditafsirkan oleh `String.replace`.
- **P3-02**: trim VO sekarang satu fungsi `pangkasVo`; jalur TTS CLI dan unggahan MCP diuji
  menghasilkan durasi identik dari audio sintetis.
- **P3-03**: galat penambal JSX menyebut nomor baris; `motion init`/`impor_zip` mencetak laporan
  keselarasan; kontrak komposisi v2 (`data-om-kontrak="2"`, `timing.js` berisi `VO_TIMING` +
  `OM_CUES`, JSX tidak pernah ditambal) dispesifikasikan di `docs/kontrak-komposisi-v2.md`,
  dengan contoh `contoh/kontrak-v2/` yang dirender penuh (8,45 dtk, -14 LUFS). `timing.js` kini
  ditulis `Pipa.terap` untuk CLI dan MCP sekaligus.
- **P3-04**: `OM_SCENES` dibaca pemindai literal string JS (escape `\"`, `\'`, `\u`, `\x`),
  tahan `]`, `;`, kutip, dan unicode di nama scene; penulisan mempertahankan jenis kutip.
- **P3-05**: tidak ada `catch {}` tanpa log/alasan. `periksa.lubang` tidak lagi melaporkan
  "rata ✓" bila ffmpeg gagal membaca bed musik; galat `playwright()` menyebut jalur yang dicoba.
- **P3-06**: ambang audio, batas zip, dan batas bawaan MCP di `lib/konstanta.mjs`; `pipa.mjs`
  dipecah ke `vo.mjs`, `sfx.mjs`, `musik.mjs`, `kunci.mjs`, `timeline.mjs` (diekspor ulang dari
  `pipa.mjs`); typedef `Config`/`Scene`/`BarisVO` di `lib/tipe.mjs`; `npm run periksa:tipe`
  (`tsc --noEmit`, checkJs, tanpa pengecualian) masuk CI.

- **P4-01..P4-05**: log JSON (`mcp/log.mjs`), `/metrik` Prometheus, `/hidup` + `/siap`
  (render ditolak bila disk < `MIN_DISK_MB`), retensi bertahap (hasil antara dibuang sesudah 24
  jam), `scripts/cadangan.sh` + `docs/operasional.md`, versi 1.1.0 + `CHANGELOG.md` + `versiSkema`.
  Ikut diperbaiki: `/tmp` sandbox P2-03 kini direktori kerja di volume, bukan tmpfs (risiko OOM).
- **P5-01..P5-05**: tes mixer sintetis (menemukan dan memperbaiki mix tanpa cue SFX), batas
  biaya ElevenLabs (`lib/biaya.mjs`, `--ya`, `biaya.json`), golongan galat API + `Retry-After`,
  peta bed sesudah `motion music`, pemeriksaan visual di `motion check`.
- **P7-01..P7-04**: README/CLAUDE/AGENTS/IKLAN/katalog/docs dalam Markdown (`.docx` di
  `.docx` asli dihapus sesudah verifikasi; masih ada di riwayat git), `docs/arsitektur.md`, `proyek/README.md`, `CONTRIBUTING.md`.

## Belum dikerjakan / prioritas berikutnya

1. **Operasional VPS** (butuh izin; skill `vps2`): firewall `DOCKER-USER` + `limit_req` nginx
   (P2-04/P2-06), bukti isolasi `docs/isolasi-renderer.md`, uji pulih cadangan di container,
   smoke test render lewat MCP, sambungkan `/metrik` ke monitoring. Isi baris P2-04.3/P2-04.4
   di tabel catatan rencana. **Deploy 1.1.0 selesai 5 Nov 2026** (`55f43ac`): `/siap` 200 di
   dalam dan publik, `/metrik` 404 dari publik; cadangan pra-deploy di
   `vps2:/root/backup-motionmcp/`, image lama `motion-mcp:prev`. Server bukan checkout git:
   kirim dengan rsync dan **jangan hapus `sfx-stok/*.mp3`** (tidak ada di git).
2. **Fase 6**: P6-01 `motion doctor`, P6-11 `--kering`, P6-02 render parsial, P6-03 varian rasio, P6-04
   subtitle, P6-06 pencarian SFX, P6-07 cache VO lintas proyek, P6-08 webhook
   render, P6-09 batalkan render + dasbor admin, P6-05 templat selesai. Server MCP di vps2
   menjalankan `035ab32` sejak 5 Nov 2026 (render parsial, subtitle, `cari_sfx` terurut; `/siap` 200). Berikutnya
   sesuai kebutuhan produk (P6-10 impor Claude Design: butuh profil login Chrome; perlu keputusan).
3. **P6-10 menunggu uji dengan proyek Design nyata** (`830c778`): `motion init --design=<tautan>`.
   Nama kunci respons (`files[].path`, `content`) dan format tautan masih asumsi dari README.
   Login sekali: `node bin/impor-design.mjs --masuk` (sudah dijalankan 5 Nov di mesin ini, belum
   terbukti sesinya login) atau `--cdp` ke Chrome berport debug.
4. **vps2 menjalankan `5d71b62` sejak 5 Nov 2026** (P6-05 templat, P6-07 cache VO, P6-08 webhook,
   P6-09 batalkan render; P6-10 hanya CLI). Cadangan pra-deploy `/root/backup-motionmcp/*-20261105045103.tgz`,
   image lama `motion-mcp:prev`. Terverifikasi: `/hidup` dan `/siap` 200 (dalam dan publik), `/metrik` dan
   `/admin` 404 dari publik, 694 MP3 stok utuh, `cari_sfx` dan `templat/` ada di container. **Render sungguhan gagal** sampai
   `bwrap` diperbaiki; 5 Nov 2026 dipasang seccomp + AppArmor khusus (`scripts/vps2/`, sysctl host tetap 1,
   detail di `docs/isolasi-renderer.md`). `bwrap` dan Chromium bersandbox lulus di container, healthy.
   **Belum diuji**: render penuh sesudah perbaikan (Chromium DI DALAM bwrap), webhook ke URL nyata,
   `batalkan_render`. Tugas baru yang disarankan: renderer sebagai container terpisah tanpa rahasia.
   `/admin` nonaktif karena `ADMIN_TOKEN`
   belum diisi di `.env.mcp` (keputusan pemilik).
5. Kalibrasi `HARGA.sfxKreditPerDetik` (belum terukur) dari `biaya.json` beberapa proyek nyata.

## Verifikasi terakhir

```sh
npm ci                       # node_modules wajib ada; tanpa ini test/laju gagal impor SDK MCP
npm test                     # 169 tes: 168 lulus, 1 dilewati (tidak ada proyek/*/src lokal)
npm run periksa:tipe         # tsc --noEmit bersih
npm run periksa:playwright   # versi 1.64.1 selaras dengan Dockerfile
git diff --check
```

`docker compose config` lokal memerlukan `.env.mcp`, yang sengaja tidak ada karena berisi
rahasia. Sebelum deploy, salin `.env.mcp.example`, isi nilai produksi, lalu jalankan validasi
Compose dan satu render smoke-test di container.

## Catatan kerja

- Semua perubahan pada commit ini berasal dari working tree yang sebelumnya belum di-commit.
- Aset audio/video dan hasil proyek diabaikan oleh `.gitignore`; konfigurasi/contoh proyek
  yang tidak diabaikan tetap dapat masuk commit.
- Jangan melemahkan validasi produksi atau pemeriksaan mixer hanya demi membuat tes lulus.
