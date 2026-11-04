Use case: infographic-diagram.

Create one polished Indonesian workflow infographic for the actual motion-engine repository. Landscape canvas approximately 2560 × 1600, crisp readable lettering and clean vector-style graphics.

```
Title: "ALUR KERJA MOTION-ENGINE".
Subtitle: "Dari komposisi Claude Design menjadi video dengan VO, SFX, dan musik".
```

Use a warm ivory background, near-black typography, teal primary arrows, muted amber for audio, indigo for rendering, green for successful delivery. Use clear flat illustrated icons of files, timeline, microphone, mixer, film frames and checklist. Modern editorial technical diagram. Generous margins. No photos, no fake UI, no watermark.

Three stacked horizontal bands, each flowing left to right. Every card has a large step number, bold title, monospace command and two short supporting lines. Explicit directional arrows connecting adjacent steps. Connect each band end to the next band start with an exterior routed arrow, never through a card. No ambiguous arrows.

Band heading "1 / PERSIAPAN", two wide cards:

01 "Impor desain"; command "motion init"; lines "ZIP Claude Design → src/" and "Deteksi HTML, JSX, dan OM_SCENES".

02 "Susun konfigurasi"; command "motion speed"; lines "Pilih suara, ukur kecepatan, tulis naskah" and "motion.config.mjs: VO, cue, SFX, musik".

Small reference badge above this band: "Panduan: README.md + IKLAN.md".

Band heading "2 / AUDIO & TIMING", five equal cards:

03 "Siapkan SFX"; command "motion sfx"; lines "Cari dulu: motion stok" and "Pakai @stok/id; generate jika perlu".

04 "VO & timeline"; command "motion plan"; lines "ElevenLabs: suara per baris" and "Durasi VO → timeline.json".

05 "Sinkronkan visual"; command "motion apply"; lines "Durasi scene, kapsi, jangkar animasi" and "HTML + JSX diperbarui dari .asli".

06 "Susun musik"; command "motion music"; lines "rencana: bagian mengikuti suasana" and "Periksa trek sebelum dipakai".

07 "Campur audio"; command "motion mix"; lines "VO + SFX + musik → master.wav" and "Ducking, limiter, stem terpisah".

Band heading "3 / RENDER & PEMERIKSAAN", three wide cards:

08 "Render video"; command "motion render"; lines "rama-tuf: ~/render/motion-engine" and "Chromium → frame → FFmpeg → MP4".

09 "Periksa hasil"; command "motion check"; lines "Ukur MP4, sampul, audio, dan transkrip" and "Baca angka; tinjau gambar dan suara".

10 "Kemas hasil"; use green accent and checkmark; lines "MP4 per rasio + sampul.jpg + naskah.md" and "~/Videos/Ads/<Merek>/<Angle>/".

Above arrow from 09 to 10 print "Lolos pemeriksaan".

Below card 09 draw a dashed amber arrow going out and looping to card 02 around exterior margin; label "Belum lolos → revisi tahap terkait → periksa lagi". This is a human review loop; do not imply check automatically exits with failure or automatically publishes.

Bottom strip with three compact readable notes:

"motion all: sfx → plan → apply → music → mix → render → check"

"Cache .kunci: aset dipakai ulang jika permintaan tetap sama"

"Rasio: 9:16 · 4:5 · 1:1 · 16:9 | Target audio: −14 ±1 LUFS · puncak ≤ −1 dBTP"

Accuracy constraints: generate no nonexistent features, CI services, databases, automatic posting, or deployment steps. SFX must precede plan in motion all. The source visual is HTML/JSX and renderer combines it with master.wav. Show rendering on rama-tuf. Keep all exact command spellings and paths correct. All text must be Indonesian except commands, file names and established project terms. Prioritize clear arrows and legibility over ornament.
