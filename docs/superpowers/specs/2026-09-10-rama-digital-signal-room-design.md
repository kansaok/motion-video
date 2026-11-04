# Rama Digital Signal Room — Desain Iklan Reels 30 Detik

## Tujuan

Buat satu iklan Reels vertikal 9:16 berdurasi 30 detik untuk layanan **Digital Marketing Setup** di ramadigital.id. Video harus menjelaskan masalah tracking yang terpisah, menunjukkan sistem yang dipasang, lalu meminta penonton membuka chat.

Target utama adalah pemilik bisnis dan lead marketing yang sudah menjalankan iklan tetapi belum dapat melihat jalur lead secara utuh.

## Konsep kreatif

**Signal Room** menampilkan perjalanan sinyal dari iklan ke lead sebagai jalur visual yang hidup. Warna dasar memakai teal gelap dan hitam kehijauan, dengan amber untuk hasil dan merah untuk titik putus. Tipografi memakai kombinasi sans tebal dan mono untuk label sistem.

Gerak memakai kamera yang terus bergerak, entrance dari sumbu yang berbeda, kata yang masuk bertahap, dan satu hentakan besar yang dilapis empat. Frame pertama sudah menampilkan masalah dan identitas Rama Digital agar tetap berfungsi sebagai sampul otomatis.

## Alur dan storyboard

| **Waktu** | **Scene** | **Isi visual** | **Pesan suara** |
|---|---|---|---|
| 0,00–4,20 | Hook | Jalur sinyal menyala dari kartu iklan, lalu satu titik lead berkedip dan hilang. Headline besar muncul. | “Iklan jalan. Lead menghilang?” |
| 4,20–8,60 | Break | Iklan, landing page, dan WhatsApp tersambung. Sambungan terakhir pecah dengan glitch merah. | “Biasanya, masalahnya ada di data yang putus.” |
| 8,60–14,20 | Setup | Tiga modul masuk: tracking, landing page, dan lead management. Masing-masing mengunci ke jalur yang sama. | “Kami pasang tracking, landing page, dan pengelolaan lead dalam satu sistem.” |
| 14,20–19,50 | Signal | Jalur berubah menjadi dashboard yang rapi. Event iklan, kunjungan, dan lead bergerak ke satu sumber data. | “Jadi kamu bisa lihat apa yang terjadi, dari klik sampai chat.” |
| 19,50–24,80 | Proof | Checklist sistem menyala. Baris pendek menegaskan proses dan keterbacaan data tanpa klaim omzet. | “Marketing yang terbaca membuat keputusanmu lebih cepat.” |
| 24,80–30,00 | CTA | Logo Rama Digital, nama layanan, tombol chat, dan domain tampil. Tombol tetap bernapas sampai frame terakhir. | “Mulai dari datamu. Chat di ramadigital dot id.” |

Teks layar harus pendek dan dapat dibaca tanpa suara:

- `IKLAN JALAN. LEAD HILANG.`
- `DATA PUTUS DI TENGAH.`
- `TRACKING` · `LANDING PAGE` · `LEAD MANAGEMENT`
- `SATU JALUR. SATU SUMBER DATA.`
- `DIGITAL MARKETING SETUP`
- `CHAT DI RAMADIGITAL.ID`

## Audio

Gunakan suara kampanye Rama Digital: Cahaya, ID `iWydkXKoiVtvdn4vLKp9`, speed 1,20, stability 0,14, style 0,72. Teks TTS mengeja domain melalui aturan `ucapkan()` dan tidak mengubah teks layar.

Musik memakai `rencana`, bukan satu prompt panjang. Rencana meminta bed corporate-tech yang sudah bergerak sejak detik pertama, menambah lapisan arpeggio dan hi-hat, lalu menjaga energi penuh sampai CTA. Jangan gunakan kata `sparse`, `quiet`, atau `patient` dalam rencana musik.

Efek suara memakai whoosh, click, glitch-cut, riser, dan impact. Hentakan pada saat jalur menjadi satu memakai empat lapisan dan hanya terjadi sekali. Semua sumber diratakan dan puncak akhir dikalibrasi di mesin render.

## Struktur teknis

- Buat proyek baru di `proyek/rama-digital-signal/`.
- Gunakan komposisi native 1080×1920 dengan akar `React.Fragment`.
- Simpan komponen aktif dan `.jsx.asli` dengan isi yang sama sebelum proses `apply`.
- Simpan caption sebagai array `const caps` bila caption diperlukan oleh komposisi.
- Gunakan satu master audio untuk video 9:16 ini.
- Gunakan ikon produk sebagai SVG asli.
- Simpan naskah produksi di `proyek/rama-digital-signal/naskah.md`.

Berkas inti yang akan dibuat:

- `proyek/rama-digital-signal/motion.config.mjs`
- `proyek/rama-digital-signal/naskah.md`
- `proyek/rama-digital-signal/src/Iklan Signal Room 9x16.dc.html`
- `proyek/rama-digital-signal/src/Iklan Signal Room 9x16.dc.html.asli`
- `proyek/rama-digital-signal/src/signal-room.jsx`
- `proyek/rama-digital-signal/src/signal-room.jsx.asli`

## Verifikasi dan kriteria selesai

1. `motion plan` menghasilkan durasi total 30 detik atau kurang dari 30,20 detik tanpa batas scene memotong baris VO.
2. `motion apply` mengubah durasi dan anchor tanpa menghilangkan kapsi.
3. `motion sfx`, `motion music`, dan `motion mix` menghasilkan aset yang valid.
4. Render dijalankan di `rama-tuf` dengan `TMPDIR=$HOME/render/tmp`.
5. `motion check` menjalankan enam verifikasi dan semua angka dilaporkan.
6. MP4 akhir berukuran 1080×1920, memiliki audio, mulai dengan frame yang terbaca, dan CTA terlihat sampai akhir.
7. Loudness berada di sekitar −14 LUFS dan true peak berada di bawah −1,0 dBTP setelah encode mesin render.
8. Uji sampul memakai cuplikan sekitar detik 1,60 dan uji visual memeriksa frame 0, titik putus, titik gabung, dan CTA.

## Risiko dan batasan

- Tidak ada klaim omzet atau angka hasil tanpa bukti kampanye yang disetujui.
- TTS dapat berubah durasi; setiap baris memakai `maks` dan harus diuji dengan `motion plan`.
- Musik dan SFX dibuat secara deterministik melalui cache kunci permintaan.
- Render dan pemeriksaan produksi hanya berjalan di `rama-tuf`, bukan pada mesin kerja ini.
