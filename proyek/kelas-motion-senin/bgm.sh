#!/usr/bin/env bash
# Susun aset/bgm.mp3 tiap varian dari bgm-gen.mp3 (trek V07, ElevenLabs Music, 120 BPM).
#
# Trek mentah: build mulai 8,0 dtk, drop 15,49 dtk, ketukan di x,48 / x,98 (lihat kelas-motion-v07/bgm.sh).
# Daftar mulai 22,50 dtk di keenam video (BEAT.ekorChat di basis.mjs), jadi build dipanjangkan 14 ketukan
# (7,0 dtk): [0, 13,95) + [10,95, 13,95) + [9,95, ...). Drop pindah ke 16,95 + (15,49 - 9,95) = 22,49 dtk.
# Pakai: bash bgm.sh   (sesudah bgm-gen.mp3 ada di jam-wa/aset/)
set -euo pipefail
cd "$(dirname "$0")"
ffmpeg -v error -y -i jam-wa/aset/bgm-gen.mp3 -filter_complex \
  "[0]atrim=0:13.95,asetpts=N/SR/TB[a];[0]atrim=10.95:13.95,asetpts=N/SR/TB[b];[0]atrim=9.95,asetpts=N/SR/TB[c];\
[a][b]acrossfade=d=0.02:c1=tri:c2=tri[ab];[ab][c]acrossfade=d=0.02:c1=tri:c2=tri" \
  -c:a libmp3lame -q:a 2 jam-wa/aset/bgm.mp3
for d in jam-web ekspektasi-wa ekspektasi-web fomo-wa fomo-web; do mkdir -p $d/aset; ln -sf ../../jam-wa/aset/bgm.mp3 $d/aset/bgm.mp3; done
echo "bgm ✓ $(ffprobe -v error -show_entries format=duration -of csv=p=0 jam-wa/aset/bgm.mp3)s"
