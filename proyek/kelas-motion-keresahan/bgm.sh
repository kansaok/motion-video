#!/usr/bin/env bash
# Susun aset/bgm.mp3 dari bgm-gen.mp3 (trek V07, ElevenLabs Music, 120 BPM).
#
# Trek mentah: build mulai 8,0 dtk, drop 15,49 dtk, ketukan di x,48 / x,98 (lihat kelas-motion-v07/bgm.sh).
# Build dipanjangkan 20 ketukan (10,0 dtk): [0, 13,95) + [9,95, 13,95) + [11,95, 13,95) + [9,95, ...).
# Drop pindah ke 13,95 + 4 + 2 + (15,49 - 9,95) = 25,49 dtk (DROP di basis.mjs). Tiap video melewati
# kepala trek (`lewati`) supaya drop jatuh di awal Daftar.
# Pakai: bash bgm.sh   (sesudah bgm-gen.mp3 ada di claude-wa/aset/)
set -euo pipefail
cd "$(dirname "$0")"
ffmpeg -v error -y -i claude-wa/aset/bgm-gen.mp3 -filter_complex \
  "[0]atrim=0:13.95,asetpts=N/SR/TB[a];[0]atrim=9.95:13.95,asetpts=N/SR/TB[b];[0]atrim=11.95:13.95,asetpts=N/SR/TB[c];\
[0]atrim=9.95,asetpts=N/SR/TB[d];[a][b]acrossfade=d=0.02:c1=tri:c2=tri[ab];[ab][c]acrossfade=d=0.02:c1=tri:c2=tri[abc];\
[abc][d]acrossfade=d=0.02:c1=tri:c2=tri" \
  -c:a libmp3lame -q:a 2 claude-wa/aset/bgm.mp3
for d in */; do d=${d%/}; [ -f $d/motion.config.mjs ] && [ $d != claude-wa ] && mkdir -p $d/aset && ln -sf ../../claude-wa/aset/bgm.mp3 $d/aset/bgm.mp3; done
echo "bgm ✓ $(ffprobe -v error -show_entries format=duration -of csv=p=0 claude-wa/aset/bgm.mp3)s"
