#!/usr/bin/env bash
# Susun aset/bgm.mp3 tiap varian dari bgm-gen.mp3 (ElevenLabs Music, `rencana`, 120 BPM).
#
# Generator tidak menepati batas bagian: drop yang diminta di 18,15 dtk keluar di 15,49 dtk
# (onset terkuat, tepat di ketukan; ketukan jatuh di x,48 / x,98). Sambung ulang 6 ketukan
# (3,0 dtk) bagian build: [0, 13,95) + [10,95, ...). Drop pindah ke 18,47 dtk, awal Daftar
# 18,50 di keempat video (tata.ekor Bukti di basis.mjs).
# Pakai: bash bgm.sh   (sesudah bgm-gen.mp3 ada di komentar-wa/aset/)
set -euo pipefail
cd "$(dirname "$0")"
ffmpeg -v error -y -i komentar-wa/aset/bgm-gen.mp3 -filter_complex \
  "[0]atrim=0:13.95,asetpts=N/SR/TB[a];[0]atrim=10.95,asetpts=N/SR/TB[b];[a][b]acrossfade=d=0.02:c1=tri:c2=tri" \
  -c:a libmp3lame -q:a 2 komentar-wa/aset/bgm.mp3
for d in nol-wa komentar-web nol-web; do ln -sf ../../komentar-wa/aset/bgm.mp3 $d/aset/bgm.mp3; done
echo "bgm ✓ $(ffprobe -v error -show_entries format=duration -of csv=p=0 komentar-wa/aset/bgm.mp3)s"
