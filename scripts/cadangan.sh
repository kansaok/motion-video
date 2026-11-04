#!/usr/bin/env bash
# Cadangan dan pemulihan volume DATA motion-mcp. Prosedur lengkap: docs/operasional.md.
#
#   scripts/cadangan.sh buat   [berkas.tar.gz]   # default: motion-data-<tanggal>.tar.gz
#   scripts/cadangan.sh pulih  <berkas.tar.gz>   # menimpa berkas yang sama di DATA
#   scripts/cadangan.sh daftar <berkas.tar.gz>
#
# Default bekerja lewat `docker exec` ke container motion-mcp (CONTAINER=...). Set DATA_DIR
# untuk bekerja langsung pada direktori lokal (uji pemulihan, mesin tanpa Docker).
#
# Yang disimpan: meta.json, config.json, render.json, src/, dan aset/ unggahan (VO berbayar,
# SFX/musik/gambar milik pelanggan tidak dapat dibuat ulang server). Yang dibuang: hasil antara
# yang dibuat ulang tiap render (stem/, cuplikan/, master.wav, norm/) dan MP4/sampul hasil render.
set -euo pipefail

CONTAINER="${CONTAINER:-motion-mcp}"
KECUALI=(
  --exclude='./u/*/*/stem' --exclude='./u/*/*/cuplikan'
  --exclude='./u/*/*/aset/master.wav' --exclude='./u/*/*/aset/*-norm.mp3'
  --exclude='./u/*/*/aset/vo/norm' --exclude='./u/*/*/aset/sfx/norm'
  --exclude='./u/*/*/*.mp4' --exclude='./u/*/*/*-sampul.jpg'
  --exclude='*.tmp' --exclude='*.mentah' --exclude='*.take.mp3'
)

jalankan() { # perintah tar di tempat DATA berada
  if [[ -n "${DATA_DIR:-}" ]]; then (cd "$DATA_DIR" && "$@"); else docker exec -i "$CONTAINER" sh -c 'cd /data && exec "$@"' sh "$@"; fi
}

case "${1:-}" in
  buat)
    keluar="${2:-motion-data-$(date +%Y%m%d-%H%M%S).tar.gz}"
    jalankan tar -czf - "${KECUALI[@]}" ./u > "$keluar"
    # Arsip yang tidak bisa dibaca sama dengan tidak punya cadangan; periksa sebelum dilaporkan.
    jumlah=$(tar -tzf "$keluar" | grep -c '/meta.json$' || true)
    echo "cadangan: $keluar ($(du -h "$keluar" | cut -f1), $jumlah proyek)"
    ;;
  pulih)
    [[ -f "${2:-}" ]] || { echo "pakai: $0 pulih <berkas.tar.gz>" >&2; exit 2; }
    tar -tzf "$2" >/dev/null
    # -m: waktu ubah = sekarang. Retensi menghitung umur proyek dari mtime meta.json; tanpa -m,
    # proyek dari cadangan lama langsung terhapus pada putaran retensi berikutnya.
    jalankan tar -xzmf - < "$2"
    echo "dipulihkan dari $2"
    ;;
  daftar)
    tar -tzf "${2:?pakai: $0 daftar <berkas.tar.gz>}" | grep '/meta.json$' | sed 's#^\./u/##; s#/meta.json$##'
    ;;
  *)
    sed -n '2,15p' "$0"; exit 2 ;;
esac
