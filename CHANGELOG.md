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
keduanya) dan parameter render parsial yang aditif (`scene`, `dari`, `sampai` di alat `render`).

### Ditambahkan
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
- Galat ElevenLabs digolongkan: 429/5xx/timeout diulang dengan menghormati `Retry-After`; 4xx
  lain tidak; kuota/kredit habis menghentikan rantai. Pesan galat menyebut baris VO, SFX, atau
  trek musiknya.

### Diperbaiki
- Mix video tanpa satu pun cue SFX gagal dengan `amix=inputs=0`.

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
