# motion-mcp

Server MCP (Streamable HTTP) di atas `lib/` motion-engine. Claude menulis komposisi HTML,
membuat VO dengan connector ElevenLabs miliknya sendiri, mengunggah URL audionya ke sini, lalu
meminta render. Server ini tidak memegang kunci ElevenLabs dan tidak pernah memanggil API-nya.

```
Claude ──(MCP, token)──► motion-mcp ──(verify token)──► API bimp  /internal/motion-mcp/verify
   │                        │
   └─► connector ElevenLabs │  render: Chromium per frame + ffmpeg (antrean, 1 render sekaligus)
       (VO, URL audio) ─────┘  hasil: tautan MP4 bertanda tangan, berlaku 7 hari
```

Akses berbayar dikelola di bimp: menu **Tools → Motion MCP** (langganan, token, URL connector).

## Alat MCP

| alat | fungsi |
|---|---|
| `panduan` | kontrak komposisi, alur kerja, skema config (`PANDUAN.md`) |
| `buat_proyek` · `daftar_proyek` · `info_proyek` · `hapus_proyek` | kelola proyek |
| `tulis_berkas` · `baca_berkas` · `impor_zip` | isi `src/` (komposisi HTML/JSX) |
| `unggah` | audio VO/SFX/musik atau gambar dari URL https / base64 |
| `unggah_vo` | banyak baris VO (maks 60) dalam satu panggilan; hasil per baris |
| `daftar_templat` · `pakai_templat` | templat komposisi siap pakai (iklan, testimoni, trailer, tutorial) → proyek baru dengan config tervalidasi |
| `cari_sfx` | cari di stok SFX (`sfx-stok/`, ±700 bunyi): terurut, sinonim Indonesia–Inggris, `mirip` |
| `simpan_config` | config JSON (naskah, cue, musik, mixer), divalidasi saat disimpan |
| `cuplik` | gambar frame pada detik tertentu |
| `batalkan_render` | hentikan render milik sendiri yang antre/jalan; status `dibatalkan` |
| `render` · `status_render` | antrean render → tautan MP4 + sampul + subtitle `.srt`/`.vtt` + naskah + laporan; `webhook` (https publik, ditandatangani HMAC) pengganti polling; `scene` atau `dari`/`sampai` untuk potongan saja; `draf` (540p 15 fps, review); `semua_rasio` (utama + `jugaTulis`, satu master) |

Config proyek lokal (`motion.config.mjs`) berisi fungsi JS. Di server bersama itu berarti
menjalankan kode pelanggan, jadi config di MCP berupa JSON dan detik cue ditulis sebagai ekspresi
aman (`"C.Hasil + 0.5"`, `"P[7] - 0.35"`) yang dievaluasi `ekspresi.mjs` tanpa `eval`.

## Deploy di VPS

1. Salin repo ke VPS, lalu:
   ```sh
   # package-lock.json wajib ikut tersalin; jangan menjalankan npm install di mesin render.
   # Mesin render lain, termasuk rama-tuf, wajib memakai lockfile yang sama.
   cp .env.mcp.example .env.mcp      # isi PUBLIC_URL, BIMP_API_URL, BIMP_SERVICE_KEY, UNDUH_RAHASIA
   docker compose up -d --build
   curl -s localhost:8420/siap        # {"ok":true, ...} — 503 + alasan bila belum siap
   ```
2. Reverse proxy HTTPS di depan port 8420, misalnya nginx:
   ```nginx
   server {
     server_name motion.bi1mp.id;
     client_max_body_size 80m;          # unggah base64
     # Definisikan di blok `http`, lalu terapkan di server ini agar satu IP tidak
     # membanjiri endpoint MCP sebelum autentikasi per-akun di aplikasi berlaku.
     # limit_req_zone $binary_remote_addr zone=motion_mcp:10m rate=10r/m;
     location / {
       proxy_pass http://127.0.0.1:8420;
       proxy_set_header Host $host;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_read_timeout 300s;         # cuplik menunggu Chromium
       proxy_buffering off;
       limit_req zone=motion_mcp burst=20 nodelay;
     }
     # listen 443 ssl; ... (certbot)
   }
   ```
   Token custom connector berada di `/mcp/<token>`. Gunakan format access log yang menyamarkan
   path tersebut (jangan memakai `$request` atau `$request_uri` mentah):
   ```nginx
   map $uri $motion_path_log {
     ~^/mcp/[^/]+$  /mcp/[disamarkan];
     default         $uri;
   }
   log_format motion '$remote_addr - $remote_user [$time_local] '
                     '"$request_method $motion_path_log $server_protocol" $status $body_bytes_sent';
   access_log /var/log/nginx/motion-mcp.access.log motion;
   ```
3. Di API bimp (`.env`): `MOTION_MCP_SERVICE_KEY` = nilai `BIMP_SERVICE_KEY`,
   `MOTION_MCP_URL` = `PUBLIC_URL`, `ORDERMM_PREFIX=MCPM`. Lalu `php artisan migrate` dan
   `php artisan config:cache`.

Kebutuhan mesin: render 30 detik 1080×1920 memakan ±1–2 menit di 4 vCPU. RAM 4 GB cukup
untuk `WORKERS=4`; turunkan `WORKERS` atau `MOTION_VIEWPORT` kalau log berisi "Target crashed".

`docker-compose.yml` membatasi satu container ke 4 vCPU, 6 GB RAM, dan 512 PID agar render
yang bermasalah tidak mengambil alih VPS. Frame sementara disimpan di volume `motion-tmp`,
bukan tmpfs kecil; siapkan volume/filesystem itu dengan kuota dan kapasitas yang cukup untuk
render terpanjang, lalu pantau pemakaiannya bersama `motion-data`.

## Pemantauan

| Endpoint | Arti | Akses |
|---|---|---|
| `/hidup` | proses menjawab | bebas |
| `/siap` | ffmpeg dan Chromium ada, disk DATA ≥ `MIN_DISK_MB`; 503 + `alasan` bila tidak | bebas |
| `/sehat` | sama dengan `/siap`; dipakai `HEALTHCHECK` Docker | bebas |
| `/metrik` | Prometheus: `motion_render_total{status}`, `motion_render_detik`, `motion_render_langkah_detik{langkah}`, `motion_cuplik_total{status}`, `motion_antrean_panjang`, `motion_render_jalan`, `motion_data_byte`, `motion_disk_bebas_byte`, `motion_akun_aktif{hari}` | hanya alamat privat **tanpa** `X-Forwarded-For`; lewat nginx selalu 404 |

Scrape dari host: `curl -s localhost:8420/metrik`. Kueri dasar:
`rate(motion_render_total{status="gagal"}[1h])` dan
`histogram_quantile(0.95, rate(motion_render_detik_bucket[1h]))`.

Log server berupa JSON satu baris (`{t, level, pesan, uid, render, langkah, ms, ...}`). Token,
teks naskah, dan URL unggahan dibuang oleh `mcp/log.mjs`, bukan oleh tiap pemanggil.

Retensi berjalan tiap jam: `stem/`, `cuplikan/`, dan `aset/master.wav` dibuang dari proyek yang
24 jam tidak disentuh (kecuali sedang dirender); proyek utuh dihapus sesudah `RETENSI_HARI`.
`info_proyek` melaporkan `dihapusDalamHari`. Saat start, direktori kerja pekerja yatim
(`/tmp/motion-kerja-*`) dihapus.

## Uji lokal tanpa bimp

```sh
MCP_DEV_TOKEN=dev-token-0123456789abcdef DATA_DIR=./data npm run mcp
claude mcp add --transport http motion-dev http://localhost:8420/mcp/dev-token-0123456789abcdef
```
