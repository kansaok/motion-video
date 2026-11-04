# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/) dan versi mengikuti
[SemVer](https://semver.org/lang/id/). Versi ini juga yang diumumkan server MCP ke klien.

Aturan versi:
- **Mayor**: perubahan skema `Config` yang tidak kompatibel. Wajib menaikkan `VERSI_SKEMA` di
  `mcp/skema.mjs` dan menambah langkah migrasi untuk config lama.
- **Minor**: alat, field, atau perilaku baru yang tidak merusak klien/config lama.
- **Patch**: perbaikan tanpa perubahan kontrak.

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
