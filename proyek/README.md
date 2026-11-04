# proyek/

Satu folder per video yang dibuat dengan motion-engine. Folder ini tinggal di repo yang sama
dengan mesinnya karena config video adalah tes regresi paling jujur: perubahan di `lib/` yang
merusak satu config lama ketahuan dari sini, bukan dari pelanggan.

## Yang masuk git dan yang tidak

| Ikut git | Tidak ikut git (`.gitignore`) |
|---|---|
| `motion.config.mjs` | `src/` (isi zip Claude Design) |
| skrip pendukung (`basis.mjs`, `gambar.mjs`, `bgm.sh`, `kata.mjs`, ...) | `aset/`, `stem/`, `cuplikan/`, `sfx/` |
| `naskah.md` / `naskah.md.docx`, `prompt-claude-design.md` | `timeline.json` |
| komponen JSX buatan sendiri di `bagian/` | `*.mp4`, `*.wav`, `*.mp3`, `*-sampul.jpg`, `lembar*.jpg` |

Proyek bertingkat (satu basis, beberapa video) memakai `proyek/<nama>/<varian>/` dengan aturan
abaikan yang sama.

## Konvensi

- Nama folder: huruf kecil berpisah tanda minus, `<merek>-<angle>` (mis. `konektor-hari-3`).
- Keluaran: `<merek>-<angle>-<rasio>.mp4`; salinan akhir ke `~/Videos/Ads/<Merek>/<Angle>/`
  (lihat `CLAUDE.md` "Tempat berkas").
- Rahasia tidak pernah ditulis di sini. Skrip yang memanggil API membaca `.env` lewat
  `lib/env.mjs`.
- Sunting `.jsx` **dan** `.jsx.asli`: `motion apply` selalu menerapkan ulang dari `.asli`.

## Catatan pemeliharaan

- Sebagian naskah masih tersimpan sebagai `naskah.md.docx` (ekspor Google Docs). Dokumen repo
  utama sudah dikonversi ke Markdown (`docs/arsip/` menyimpan `.docx` aslinya); naskah per video
  belum, karena tiap berkas perlu diperiksa manual sesudah konversi.
- Bila jumlah proyek terus tumbuh, pertimbangkan repo data terpisah yang memakai motion-engine
  sebagai dependensi. Sampai itu terjadi, aturan di atas menjaga repo ini tetap kecil.
