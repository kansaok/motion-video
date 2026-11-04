# Handoff pekerjaan motion-engine

Terakhir diperbarui: 4 November 2026 (Asia/Jakarta).

## Sudah dikerjakan

- **Fase 0**: runner `node:test`, fixture/regresi fungsi inti, CI Node 20/22, lockfile,
  `npm ci` di image Docker, dan cek keselarasan versi Playwright dengan tag image.
- **P1-01 s.d. P1-04**: render MCP dipindah ke pekerja proses anak; ada batas total,
  watchdog frame, pembersihan frame saat kill, antrean maksimum/retensi/estimasi, serta
  batas CPU/RAM/PID dan volume tmp Docker.
- **P2-01**: production gagal start bila rahasia wajib kosong/pendek atau token dev aktif.
- **P2-02**: ZIP diperiksa sebelum ekstrak (ukuran, jumlah entri, rasio kompresi, traversal),
  dan operasi tulis dibatasi kuota akun (`KUOTA_MB`).
- **P2-03 (sebagian)**: lingkungan pekerja tidak mewariskan rahasia dan Chromium diminta
  memakai sandbox. Isolasi filesystem/PID yang benar-benar terpisah belum ada.
- **P2-04**: SSRF memblokir rentang tambahan, cache DNS TTL 60 detik, unduhan HTTPS dipin
  ke alamat hasil resolve, dan WebSocket Chromium dijaga. Dokumentasi firewall ada di
  `docs/jaringan.md`.
- **P2-05**: contoh nginx menyamarkan token `/mcp/<token>` di access log; error transport
  server tidak mencetak objek yang berpotensi memuat URL bertoken.
- **P2-06**: token bucket per akun untuk `unggah`, `impor_zip`, `render`, dan `cuplik`;
  cuplikan maksimal dua global dan satu per akun.
- **P3-01 (sebagian yang relevan)**: penggantian teks di komposisi memakai callback agar
  token `$` tidak ditafsirkan oleh `String.replace`.

## Belum dikerjakan / prioritas berikutnya

1. **Selesaikan P2-03** dengan renderer sidecar/container terpisah atau sandbox OS yang
   hanya memasang direktori proyek aktif. Buktikan Chromium tidak dapat membaca environ proses
   server atau data akun lain.
2. **Selesaikan operasional P2-04/P2-06** di VPS: aturan `DOCKER-USER` egress dan `limit_req`
   nginx harus dipasang lalu diuji dari dalam container.
3. **P2-07**: hardening server statis renderer (`path.resolve + path.sep`, berkas tersembunyi,
   `.asli/.terap/.kunci`, `X-Content-Type-Options`).
4. **P3-02 s.d. P3-06**, lalu fase 4--7, mengikuti urutan dalam `RENCANA-PERBAIKAN.md`.

## Verifikasi terakhir

```sh
npm test                     # 32 tes lulus
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
