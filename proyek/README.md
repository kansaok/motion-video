# proyek/

Tempat kerja video: satu folder per video yang dibuat dengan motion-engine
(`motion init <zip> proyek/<nama>`). Proyek-proyek lama dihapus dari repo pada 4 Nov 2026 karena
yang tersimpan hanya config tanpa komposisi, aset, maupun videonya; config lama masih bisa diambil
dari riwayat git (`git show 7dc8b85:proyek/<nama>/motion.config.mjs`). Contoh yang bisa langsung
dirender ada di `contoh/kontrak-v2/`.

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

## Catatan

- Video jadi dan bahan proyek lama ada di mesin pembuatnya (`~/Videos/Ads/`, `rama-tuf`) dan di
  folder Google Drive yang disebut README, bukan di repo ini.
- Beberapa aturan di `IKLAN.md` dan `README.md` menyebut berkas proyek lama sebagai bukti
  (mis. `proyek/kelas-motion-v07/bgm.sh`); berkas itu kini hanya ada di riwayat git.
