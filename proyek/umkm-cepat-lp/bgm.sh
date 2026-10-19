#!/bin/sh
# Geser trek ElevenLabs (aset/musik.mp3) supaya drop-nya jatuh tepat di scene Reveal.
# Drop di trek mentah terukur di 14,975 detik (kick pertama sesudah jeda 14,2-14,5);
# Reveal mulai di 9,90 (timeline.json). 14,975 - 9,90 = 5,075.
# Jalankan ulang kalau `plan` menggeser mulainya Reveal: ganti angka 9.90.
cd "$(dirname "$0")" && ffmpeg -v error -y -i aset/musik.mp3 -af "atrim=start=$(echo '14.975 - 9.90' | bc),asetpts=PTS-STARTPTS" -q:a 0 aset/bgm.mp3
