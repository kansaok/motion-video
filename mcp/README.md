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
| `cari_sfx` | cari di stok SFX (`sfx-stok/`, ±700 bunyi) |
| `simpan_config` | config JSON (naskah, cue, musik, mixer), divalidasi saat disimpan |
| `cuplik` | gambar frame pada detik tertentu |
| `render` · `status_render` | antrean render → tautan MP4 + sampul + laporan |

Config proyek lokal (`motion.config.mjs`) berisi fungsi JS. Di server bersama itu berarti
menjalankan kode pelanggan, jadi config di MCP berupa JSON dan detik cue ditulis sebagai ekspresi
aman (`"C.Hasil + 0.5"`, `"P[7] - 0.35"`) yang dievaluasi `ekspresi.mjs` tanpa `eval`.

## Deploy di VPS

1. Salin repo ke VPS, lalu:
   ```sh
   cp .env.mcp.example .env.mcp      # isi PUBLIC_URL, BIMP_API_URL, BIMP_SERVICE_KEY, UNDUH_RAHASIA
   docker compose up -d --build
   curl -s localhost:8420/sehat       # {"ok":true}
   ```
2. Reverse proxy HTTPS di depan port 8420, misalnya nginx:
   ```nginx
   server {
     server_name motion.bi1mp.id;
     client_max_body_size 80m;          # unggah base64
     location / {
       proxy_pass http://127.0.0.1:8420;
       proxy_set_header Host $host;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_read_timeout 300s;         # cuplik menunggu Chromium
       proxy_buffering off;
     }
     # listen 443 ssl; ... (certbot)
   }
   ```
   Jangan catat URL lengkap `/mcp/<token>` di access log publik — token ada di path.
3. Di API bimp (`.env`): `MOTION_MCP_SERVICE_KEY` = nilai `BIMP_SERVICE_KEY`,
   `MOTION_MCP_URL` = `PUBLIC_URL`, `ORDERMM_PREFIX=MCPM`. Lalu `php artisan migrate` dan
   `php artisan config:cache`.

Kebutuhan mesin: render 30 detik 1080×1920 memakan ±1–2 menit di 4 vCPU. RAM 4 GB cukup
untuk `WORKERS=4`; turunkan `WORKERS` atau `MOTION_VIEWPORT` kalau log berisi "Target crashed".

## Uji lokal tanpa bimp

```sh
MCP_DEV_TOKEN=dev-token-0123456789abcdef DATA_DIR=./data npm run mcp
claude mcp add --transport http motion-dev http://localhost:8420/mcp/dev-token-0123456789abcdef
```
