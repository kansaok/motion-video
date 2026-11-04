# Operasional motion-mcp

Prosedur untuk server MCP di VPS: deploy, cadangan, pemulihan, rotasi rahasia, dan pemantauan.
VPS dipakai bersama layanan lain, jadi setiap langkah di sini menyentuh container `motion-mcp`
saja. Deploy sehari-hari di VPS dikerjakan lewat skill `vps2` (di luar repo ini); dokumen ini
adalah urutan yang harus dijalankan skill itu atau operator.

## Deploy

1. Di mesin lokal: `npm ci && npm test && npm run periksa:tipe && npm run periksa:playwright`.
   Perubahan server MCP diuji lokal dengan `MCP_DEV_TOKEN` (lihat `mcp/README.md`).
2. Catat versi di `CHANGELOG.md`. Perubahan skema `Config` yang tidak kompatibel menaikkan versi
   mayor dan menambah migrasi di `mcp/skema.mjs`.
3. **Cadangkan dulu** (bagian berikut). Deploy yang merusak data tanpa cadangan tidak bisa
   dibatalkan.
4. Di VPS, di folder repo:
   ```sh
   git pull --ff-only
   docker compose config >/dev/null          # .env.mcp lengkap dan compose valid
   docker compose up -d --build
   docker compose ps                         # STATUS harus (healthy) dalam ±30 dtk
   curl -s localhost:8420/siap               # {"ok":true,...}; 503 menyebut alasannya
   ```
5. Smoke test: dari Claude, `buat_proyek` → `tulis_berkas` contoh minimal di `mcp/PANDUAN.md` →
   `cuplik` → `render` dengan `frames: 30`. Hapus proyek ujinya sesudahnya.
6. Sesudah deploy pertama versi dengan bubblewrap, jalankan bukti isolasi di
   `docs/isolasi-renderer.md`. Firewall egress dijelaskan di `docs/jaringan.md`.

Rollback: `git checkout <commit-sebelumnya> && docker compose up -d --build`. Config yang sudah
dimigrasikan ke `versiSkema` lebih baru akan ditolak versi lama; pulihkan dari cadangan bila perlu.

## Cadangan

`scripts/cadangan.sh` mengarsipkan volume DATA lewat `docker exec` ke container `motion-mcp`.

Yang disimpan: `meta.json`, `config.json`, `render.json`, `src/`, dan `aset/` unggahan. Di MCP
server tidak membuat audio sendiri; VO (berbayar di sisi pelanggan), SFX `@luar`, musik, dan gambar
semuanya unggahan yang tidak dapat dibuat ulang. Yang tidak disimpan karena dibuat ulang setiap
render: `stem/`, `cuplikan/`, `aset/master.wav`, `norm/`, `*-norm.mp3`, dan MP4/sampul hasil
render (tautan unduhnya hanya berlaku 7 hari).

Harian dari cron host, simpan 14 hari (sama dengan retensi proyek):

```cron
30 3 * * * cd /srv/motion-video && scripts/cadangan.sh buat /srv/cadangan/motion/motion-data-$(date +\%F).tar.gz >> /var/log/motion-cadangan.log 2>&1 && find /srv/cadangan/motion -name 'motion-data-*.tar.gz' -mtime +14 -delete
```

Sesuaikan `/srv/...` dengan lokasi di VPS. Salin arsip ke luar VPS (object storage atau mesin
lain); cadangan di disk yang sama tidak menolong saat disk rusak.

## Pemulihan

```sh
scripts/cadangan.sh daftar motion-data-2026-11-04.tar.gz     # <uid>/<proyek> di dalam arsip
scripts/cadangan.sh pulih  motion-data-2026-11-04.tar.gz
```

- Berkas di arsip menimpa berkas yang sama di DATA; proyek yang tidak ada di arsip tidak disentuh.
- Waktu ubah diset ke saat pemulihan (`tar -m`), sehingga proyek yang dipulihkan mendapat 14 hari
  retensi penuh. Tanpa itu, cadangan lama langsung terhapus pada putaran retensi berikutnya.
- Sesudah pulih, pelanggan perlu `render` ulang untuk mendapatkan MP4 dan tautan baru.

Uji pemulihan tanpa Docker (sudah dijalankan 4 Nov 2026, hasil identik):

```sh
DATA_DIR=/tmp/asal  scripts/cadangan.sh buat /tmp/c.tar.gz
DATA_DIR=/tmp/pulih scripts/cadangan.sh pulih /tmp/c.tar.gz
diff -r /tmp/asal/u /tmp/pulih/u      # hanya berbeda pada hasil antara yang memang dikecualikan
```

Ulangi uji ini di VPS terhadap container sungguhan minimal sekali sesudah deploy pertama, ke
direktori sementara (`DATA_DIR=/tmp/uji-pulih`), bukan ke volume produksi.

## Rotasi rahasia

Semua rahasia ada di `.env.mcp` (tidak di-commit). Sesudah mengubahnya: `docker compose up -d`.

| Rahasia | Akibat rotasi | Langkah |
|---|---|---|
| `UNDUH_RAHASIA` | semua tautan unduh MP4 yang sudah dibagikan langsung tidak berlaku | `openssl rand -hex 32`; tautan di `status_render` tersimpan saat render dan ikut tidak berlaku, jadi pelanggan perlu `render` ulang untuk tautan baru. Rotasi saat sepi |
| `BIMP_SERVICE_KEY` | verifikasi token gagal sampai kedua sisi sama | ganti bersamaan dengan `MOTION_MCP_SERVICE_KEY` di `.env` API bimp, lalu `php artisan config:cache` di sana |
| `MCP_DEV_TOKEN` | — | harus kosong di produksi; server menolak start bila terisi |

Server menolak start di produksi bila `UNDUH_RAHASIA` < 32 karakter atau rahasia wajib kosong
(`mcp/env.mjs`), jadi rotasi yang salah ketik terlihat sebagai container yang tidak mau naik,
bukan sebagai tautan yang bisa dipalsukan.

## Pemantauan

Endpoint, metrik, dan format log: `mcp/README.md` bagian Pemantauan. Yang perlu dialarmkan:

- `/sehat` 503 (container `unhealthy`): baca `alasan`; biasanya disk DATA < `MIN_DISK_MB`.
- `rate(motion_render_total{status="gagal"}[1h]) > 0.2 * rate(motion_render_total[1h])`.
- `motion_disk_bebas_byte` < 2 × `MIN_DISK_MB`.
- `motion_antrean_panjang` mendekati `ANTRE_MAKS` dalam waktu lama.

Log galat render: `docker logs motion-mcp 2>&1 | grep '"level":"error"'`.
