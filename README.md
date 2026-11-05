# motion-engine

Zip komposisi Claude Design → MP4 dengan voice-over, efek suara, dan musik.

Dipisahkan dari `rama-animation` setelah ±50 video. Sebelumnya tiap video menyalin `gen-audio.mjs` dan `render-video.mjs` lalu mengeditnya — 17 salinan yang berbeda-beda, dan bug yang diperbaiki di satu salinan tidak pernah sampai ke enam belas lainnya. Library ini adalah perbaikan itu.

```sh
motion init ~/Downloads/Video.zip proyek/video-baru   # bongkar + deteksi + kerangka config
motion speed Senandika Cahaya Yoga                    # pilih suara DULU, naskah menyusul
$EDITOR proyek/video-baru/motion.config.mjs           # isi naskah, SFX, cue, musik
motion all proyek/video-baru                          # sampai MP4 + verifikasi
```

## Peta dokumen

| Dokumen | Isi |
|---|---|
| `IKLAN.md` | aturan iklan: musik, SFX, VO, cerita, gerak (wajib sebelum menulis config) |
| `docs/arsitektur.md` | peta modul, siapa memanggil siapa, gejala → penyebab → berkas |
| `docs/kontrak-komposisi-v2.md` | komposisi yang membaca `timing.js` dan tidak pernah ditambal |
| `mcp/README.md`, `mcp/PANDUAN.md` | server MCP: deploy, pemantauan, kontrak untuk klien |
| `docs/operasional.md` | deploy, cadangan, pemulihan, rotasi rahasia |
| `CONTRIBUTING.md` | cara menjalankan tes dan konvensi kode |
| `CHANGELOG.md` | perubahan per versi |

## Perintah

| **Perintah** | **Isi** |
|---|---|
| `motion doctor` | periksa prasyarat mesin: Node, ffmpeg (filter + encoder), Playwright + peluncuran Chromium, `.env`, disk dan `/tmp` tmpfs, akses ElevenLabs; kode keluar 1 bila ada ✖ (`--luring`, `--cepat`) |
| `motion init --templat[=<nama>] <folder>` | daftar templat, atau mulai proyek dari templat (iklan, testimoni, trailer, tutorial) tanpa zip |
| `motion init <zip> <folder>` | bongkar, cari komposisi ber-`OM_SCENES`, cek scene-relatif, tulis kerangka config |
| `motion plan` | generate VO, hitung posisi baris dan durasi scene |
| `motion plan --kering` · `motion all --kering` | hitung durasi baris (VO yang belum ada diperkirakan), durasi scene, cue, musik, dan biaya tanpa ElevenLabs dan tanpa menulis ke proyek; laporan di `kerja/kering.json` |
| `motion apply` | tulis durasi + jangkar animasi + kapsi balik ke komposisi |
| `motion sfx` / `motion music` | generate aset yang belum ada (yang sudah ada dilewati); `music` lalu mencetak peta level bed dan lubangnya |
| `motion mix` | rakit `aset/master.wav` + `stem/`; dipakai ulang bila masukannya sama (`--paksa` untuk mix ulang) |
| `motion render` | MP4 + `<keluaran>-sampul.jpg` + subtitle `<keluaran>.<bahasa>.srt`/`.vtt` + `<keluaran>-naskah.txt` (`--frames=60` untuk uji cepat) |
| `motion render --scene=<nama\|no>` · `--dari=<dtk> --sampai=<dtk>` | render satu scene/rentang saja, audio ikut dipotong, ke `<keluaran>-potong-<dari>-<sampai>.mp4` (tanpa sampul; MP4 penuh tidak tertimpa) |
| `motion render --draf` | review cepat: 540p, 15 fps, x264 `veryfast` ke `<keluaran>-draf.mp4`, tanpa sampul dan subtitle; bisa digabung dengan `--scene`/`--dari`/`--sampai` dan `--semua-varian` (MP4 penuh tidak pernah tertimpa) |
| `motion render --komposisi=<html>` | orientasi lain, audio yang sama, tanpa menyunting config |
| `motion check` | verifikasi hasil, termasuk frame 0 sebagai sampul dan tata letak di komposisi hidup (`--cepat` melewati STT + A/B) |
| `motion shot <detik...>` | cuplik frame dari komposisi hidup, tanpa render penuh |
| `motion all` | seluruh rantai sampai `check`; perkiraan biaya di awal, laporan biaya di akhir |
| `motion speed <suara...>` | ukur kar/dtk tiap suara **sebelum** menulis naskah |
| `motion kirim --merek=<Merek> --angle=<Angle>` | salin MP4 tiap rasio + sampul + subtitle ke `~/Videos/Ads/<Merek>/<Angle>/` (`MOTION_KIRIM`) sebagai `<merek>-<angle>-<rasio>.mp4` dan tulis `naskah.md` (VO per detik, musik, SFX, teks layar, angka mutu). Gerbang mutu = ambang `check` (`--paksa` dicatat di naskah); berkas yang sudah ada dan beda tidak ditimpa tanpa `--timpa`; draf/potongan tidak ikut. `kirim: {merek, angle}` di config menggantikan bendera |
| `motion cost [jam]` · `motion voices [cari]` | biaya ElevenLabs · katalog suara |

Folder proyek boleh di mana saja; default direktori sekarang.

**Biaya dijaga sebelum generate.** `plan`, `apply`, `sfx`, `music`, `mix`, `check`, dan `all` bisa
memanggil ElevenLabs (VO ikut dibuat ulang oleh semua perintah yang memanggil `vo()`, bukan cuma
`plan`). Masing-masing mencetak perkiraan kredit untuk aset yang **akan** dibuat (kunci tidak
segar; stok dan unggahan gratis) dan berhenti bila di atas `BIAYA_MAKS_USD` (`.env`, bawaan
$0,50) sampai disetujui di terminal atau diulang dengan `--ya`. Tanpa terminal (agent, CI) tidak
ada yang bisa ditanya, jadi perintahnya gagal. Sebabnya: satu perubahan yang menyentuh semua
baris (`suara.speed`, `lafal`, model) membuat ulang seluruh VO tanpa bertanya, dan laporan biaya
dulu baru muncul sesudah kreditnya terbakar. Realisasi tiap perintah (selisih kredit terpakai
akun) dicatat ke `<proyek>/biaya.json`; tarif SFX dan musik di `lib/konstanta.mjs` (`HARGA`)
dikalibrasi dari catatan itu.

**Subtitle ikut tiap render penuh.** `.srt` dan `.vtt` (akhiran bahasa dari `suara.bahasa`, bawaan `id`, dikenali YouTube sebagai label trek) dan naskah akhir `-naskah.txt`. Posisi baris diambil dari penempatan yang sama dengan mixer dan `timing.js`; `bin/srt.mjs` lama memakai awal scene + `off`, sehingga di mode `alir` atau saat `jangkar` mendorong baris mundur, subtitle muncul sebelum suaranya. Baris panjang dipecah di akhir kalimat lalu di koma (≤ 84 karakter, dua baris 42). `node bin/srt.mjs proyek/<nama>` menulis ulang untuk proyek lama.

**Mode kering untuk melihat dampak dulu.** `--kering` menjalankan seluruh perhitungan `plan` (dan untuk `all`: status SFX, musik, cue) tanpa satu pun permintaan ke ElevenLabs dan tanpa menyentuh komposisi, aset, atau `timeline.json`. Durasi VO yang belum ada atau kuncinya basi **diperkirakan** dari jumlah karakter terlafal: kar/dtk dikalibrasi dari VO suara yang sama yang sudah ada di proyek, lalu `suara.kps` (hasil `motion speed`), lalu 16,3 kar/dtk × `speed`. Laporannya menandai tiap baris perkiraan dengan `≈` dan sumbernya; durasi TTS tidak deterministik, jadi angka itu untuk memutuskan, bukan untuk dikunci. Batas scene yang memotong kalimat, cue di luar video atau tanpa entri `sfx`, dan baris yang diperkirakan lewat `maks` ikut dilaporkan. Kode keluar 1 bila rencananya gagal.

**Galat ElevenLabs digolongkan.** 429 dan 5xx diulang (menghormati `Retry-After`, maksimal 60
detik), timeout 5 menit per permintaan juga diulang; 4xx lain tidak. Kuota/kredit habis
(`quota_exceeded`, `insufficient_credits`) menghentikan rantai di baris itu dengan pesan sebab.
Setiap galat menyebut baris VO, SFX, atau trek musiknya.

## Config

Satu berkas `motion.config.mjs` per video. Yang berubah antar video cuma isi berkas ini — naskah, daftar SFX, peta cue, prompt musik. Sisanya library.

```js
export default {
  nama: 'video-baru',
  komposisi: 'Video Baru.dc.html',
  jsx: 'video-baru.jsx',          // opsional: untuk menggeser jangkar animasi & kapsi
  jugaTulis: ['Video Baru - Landscape.html'],
  suara: {id: 'VOICE_ID', seed: 1, speed: 1.1, stability: 0.4, similarity: 0.8, style: 0.05},
  // model bawaan eleven_v4 (lib/el.mjs); tulis suara.model untuk model lain. v4 mengabaikan `style`.
  lafal: {dashboard: 'desbord', ctwa: eja('CTWA')},   // teks layar tidak disentuh
  vo: [{no: 1, sc: 'Hook', off: 0.3, text: '...'}],
  tata: {mode: 'jangkar', jeda: 0.15},
  sfx:  [['nama', 1.2, 'deskripsi bunyi, dry, one shot']],
  cue:  ({C, P, E, S}) => [{at: C.Hook + 0.2, nama: 'nama', gain: 0.3, nada: 2, pan: -0.4}],
  musik: [{nama: 'musik', detik: ({total}) => total + 1, titik: [['Hook', 0, -20]], prompt: '...'}],
  sampul: {detik: 1.6},                              // dicuplik jadi <keluaran>-sampul.jpg
  // atau gambar sampul yang ditempel di atas video selama `ms` mulai `mulai` (jadi frame 0):
  // sampul: {gambar: {'9x16': 'aset/sampul-9x16.png', '16x9': '...', '4x5': '...'}, mulai: 0, ms: 100},
  gate: ({P, E}) => [[E[22] + 0.10, P[23] - 0.25]],   // ikat ke DUA sisi; boleh dihilangkan
};
```

`C` = detik mulai tiap scene · `P` = awal tiap baris VO · `E` = akhirnya · `S` = durasi scene. Cue yang menempel pada satu baris ditulis dengan `P[no]`, bukan `C[scene] + n` — dengan begitu bunyi, gambar, dan suara tetap jatuh bersama walau naskahnya berubah panjang.

## Templat: mulai dari pola yang sudah terbukti

`motion init --templat` mendaftar templat di `templat/`, dan `motion init --templat=<nama> <folder>` menyalin satu ke folder baru. Ada empat: `iklan` (hook, masalah, solusi, bukti, CTA), `testimoni`, `trailer`, `tutorial`. Isinya diturunkan dari 81 proyek lama di riwayat git (40 iklan, 22 tutorial, 8 testimoni/bukti sosial, 6 trailer) dan aturan `IKLAN.md`: tata `jangkar`, CTA sebagai baris terakhir tersendiri, SFX dari stok, `sapu` lembut di batas scene, hentakan empat lapis sekali, musik `rencana` dipatok ke scene plus `[tail]` yang tidak terdengar, dan amplop yang turun 0,4 detik sebelum hentakan.

- `src/Video.html` adalah komposisi kontrak v2. Mesinnya sama di keempat templat, dan tes menjaganya tetap sama. Frame 0 sudah utuh dengan kapsi pertama, kapsi berada di atas zona UI Reels (±380 px bawah), dan stage diskalakan agar muat di viewport mana pun.
- `src/isi.js` memuat teks layar per scene (judul, daftar, angka, kutipan, langkah dengan kartu UI, CTA), kapsi per baris VO, merek, dan warna. Yang diganti pengguna ada di sini dan di naskah `vo`.
- `motion.config.mjs` (CLI) dan `config.json` (MCP, `pakai_templat`) berisi naskah, cue, dan amplop yang sama. Tes menghitung setiap cue di keduanya dan membandingkan hasilnya.

Urutan pakai: ganti naskah dan `isi.js`, `motion plan --kering` (durasi dan biaya tanpa kredit), `motion shot` untuk melihat tata letak, lalu `motion all`. Merek contoh "Lapakita" fiktif.

## SFX: cek stok dulu, generate belakangan

`sfx-stok/` menyimpan semua bunyi yang pernah dibuat (motion-engine + rama-animation), tanpa duplikat, lengkap dengan `katalog.json` / `KATALOG.md`: prompt asli, kategori, **cocok untuk apa**, dan proyek yang memakainya. Urutan kerja tiap butuh SFX:

1. `motion stok <kata>` (contoh `motion stok whoosh gelap`, `motion stok kasir`, `motion stok klik lembut`). Hasilnya diurutkan, yang teratas paling cocok: kata yang muncul di nama bunyi bernilai paling tinggi, lalu "cocok untuk" yang ditulis manusia, lalu prompt, lalu kategori. Kata Indonesia dan Inggris saling menemukan (kasir ↔ cash register, pintu ↔ door, cepat ↔ fast). Prompt yang menyangkal ("no click", "without impact") tidak dihitung cocok. Kalau tidak ada hasil, keluar saran kata terdekat. `motion stok --mirip=<id>` mencari bunyi sejenis dengan satu bunyi yang sudah cocok. Baca kolom "cocok untuk".
2. Ketemu dan cocok → tulis di config `['nama', '@stok/<id>']`. `motion sfx` menyalinnya, tanpa biaya ElevenLabs.
3. Tidak ketemu, atau bunyinya tidak cocok dengan adegan → tulis `['nama', detik, 'prompt']` seperti biasa. Generate tetap boleh.
4. Sesudah proyek jadi, jalankan `motion stok --bangun` supaya bunyi baru masuk stok.

Berkas audio stok tidak ikut git (`*.mp3` diabaikan); `katalog.json` dan `KATALOG.md` ikut. Di `rama-tuf`, sinkronkan dengan `rsync -a sfx-stok/ rama-tuf:render/motion-engine/sfx-stok/`.

Salinan publik stok dan video jadi ada di Google Drive, supaya mesin ini bisa dipakai dari laptop lain tanpa mengirim `.env`:

[https://drive.google.com/drive/folders/1qSSt9VwiWPOnZ4xNjm3DjXzgRE3VNnaq](https://drive.google.com/drive/folders/1qSSt9VwiWPOnZ4xNjm3DjXzgRE3VNnaq)

Siapa pun yang punya tautan itu bisa melihat dan mengunduh (peran pembaca). Isinya `sfx-stok/` (mp3 + katalog) dan `video-jadi/` (`Ads/` untuk yang sudah disalin ke `~/Videos/Ads`, `proyek/` untuk MP4 jadi yang masih di folder proyek). Stok yang baru dibuat ditambahkan ke folder `sfx-stok` yang sama. Jangan pernah mengunggah `.env`, kunci API, atau berkas rahasia ke folder itu.

## Impor dari tautan Claude Design, tanpa zip

```sh
node bin/impor-design.mjs --masuk                       # sekali: login claude.ai di jendela Chromium, sesi disimpan di ~/.motion/profil-claude
motion init --design=<tautan|projectId> proyek/<nama>   # unduh ke src/, lalu deteksi + kerangka config seperti dari zip
```

`--cdp=http://127.0.0.1:9222` memakai Chrome yang sudah berjalan dan login (sesi Rama). `DesignSync` butuh `/design-login` yang tidak jalan di sesi non-interaktif; kalau itu berubah, ganti `bukaSumber` di `bin/impor-design.mjs` saja.

Yang dilakukan skrip (jalur terbukti Konektor Promo, 29 Sep 2026): buka `https://claude.ai/robots.txt` (halaman Design yang berat membuat JavaScript macet), lalu dari halaman itu `POST /design/anthropic.omelette.api.v1alpha.OmeletteService/ListFiles` dan `/GetFile` dengan `{projectId, path}`; isi kembali sebagai base64. Server lokal tidak bisa dipakai: `fetch` ke `127.0.0.1` dari claude.ai menggantung tanpa galat.

Validasi (`lib/imporDesain.mjs`): `<style|script data-omelette-injected>` dibuang dari tiap `.html` (`GetFile` mengembalikan versi editor 21 KB, bukan berkas 1,6 KB aslinya); jalur dari server ditolak bila traversal/tersembunyi/ganda; batas 2000 berkas dan 300 MB; hasil harus memuat `.html` ber-`OM_SCENES`. Kolom `size` di `ListFiles` bisa basi, jadi panjang isi `GetFile` yang dipercaya. Respons yang bentuknya berubah menggagalkan impor dengan menyebut kunci yang diterima. Bentuk respons yang diasumsikan ada di kepala `lib/imporDesain.mjs`.

## Render di `rama-tuf`: `TMPDIR` di disk

`/tmp` di `rama-tuf` adalah tmpfs 16 GB, dan agen lain mengisinya (79% pada 30 Sep 2026). Chromium memakai `/tmp` untuk shared memory karena `--disable-dev-shm-usage`. Begitu `/tmp` sesak, GPU process mati di sekitar frame 250 (`exit_code=9`, `CopyOutputResultSender`), dan render berhenti dengan `Unable to capture screenshot`. Satu `motion shot` tetap lolos, jadi gejalanya terlihat seperti frame yang rusak. Jangan turunkan `WORKERS` untuk menambalnya: 1 tab pun gagal di frame yang sama.

```sh
ssh rama-tuf 'bash -lc "mkdir -p ~/render/tmp && cd ~/render/motion-engine && systemd-run --user --scope -q -p MemoryMax=8G -p MemorySwapMax=0 env TMPDIR=\$HOME/render/tmp WORKERS=4 MOTION_VIEWPORT=1400x1600 node bin/motion.mjs render proyek/<nama>"'
```

## Yang sudah dipasang, dan kenapa

Tiap aturan di bawah ini lahir dari satu kesalahan yang benar-benar terjadi di produksi.

**Komposisi adalah sumber kebenaran, bukan dokumen produksi.** Brief hampir selalu meleset 0,3–1,4 detik dari ekspresi animasinya. `motion init` mencetak jumlah rujukan scene-relatif dan array detik absolut — kalau ada array absolut, durasi scene **tidak** aman diubah.

**Ukur kecepatan baca kandidat suara sebelum menulis naskah panjang.** Sebaran antar suara Indonesia lebih dari 2× — diukur pada satu kalimat yang sama: Yoga 21,5 · Firman 19,6 · Senandika 18,5 · Cahaya 16,3 · Jonathan 16,2 · Galih 15,7 · Satria 9,6 kar/dtk. Suara paling pas nadanya membuat komposisi 67 detik melar jadi 89 detik, dan seluruh lintasan TTS terbuang. `motion speed <suara...>` mengukur dan menyimpan contohnya untuk didengarkan; `motion voices` untuk katalognya.

**Berkas** `.jsx` **mana yang dipakai dibaca dari komposisinya, bukan ditebak dari nama.** Komposisi menyebutkannya sendiri di `<x-import from="./a.jsx ./b.jsx">`, dan yang utama adalah yang mendefinisikan komponen di `component-from-global-scope`. Menebak dari kemiripan nama pernah memilih `sumopod-film-v1.jsx` — sisa versi lama yang tidak dipakai komposisi mana pun. Seluruh retiming akan jatuh ke berkas mati dan tidak ada yang berubah di layar.

**Hitungan "array detik absolut" di** `init` **ikut menghitung koordinat piksel.** Polanya cuma "array angka >= 4 elemen", jadi `const LEV = [1080, 862, 644, 426, 208]` (tinggi rak) dilaporkan sama seriusnya dengan `const fast = [1.4, 3.6, 6.4, ...]` (detik kedip lampu). Trailer "Shift Malam" dilaporkan 3 array absolut; yang benar-benar detik cuma satu. Buka berkasnya dan lihat sendiri — angkanya menentukan boleh-tidaknya durasi scene diubah, dan tiga peringatan palsu membuat orang berhenti mempercayai peringatan itu.

**Kapsi berbentuk** `<Captions items={[...]}>` **inline TIDAK dikenali** `geserKapsi`**.** Dia mencari `const caps = [ ... ]`; kalau tidak ketemu dia mengembalikan 0 tanpa galat, dan `apply` mencetak "0 kapsi" seolah memang tidak ada kapsi. Komposisi yang menulis kapsinya sendiri dengan jendela `until` sendiri bisa dipakai apa adanya dengan `kapsi: false` — tetapi lihat catatan di bawah: mengubahnya jadi `const caps` sekali jauh lebih murah daripada menyetel belasan offset dengan tangan tiap putaran revisi.

**Nama peta cue dipertahankan apa adanya waktu kapsi ditulis balik.** Komposisi boleh memakai `CUES.Nama`, `CUES['Nama Scene']`, atau alias lokal `const C = {dp: CUES[...]}`. Menulisnya balik selalu sebagai `CUES` membuat `at` jadi NaN — dan `<Captions>` membuang item ber-`at` NaN **tanpa satu pun galat**. Seluruh kapsi hilang dan render tetap dilaporkan sukses. Cek yang murah: `motion shot` satu frame di tengah kalimat.

**Dua mode penempatan, dan memilih yang salah itu mahal.** `jangkar` memakai detik brief sebagai batas bawah, scene hanya boleh memanjang — pakai kalau brief ditulis bersama komposisinya. `alir` membuat baris mengalir berurutan dan menurunkan durasi scene penuh dari hasilnya, jadi scene boleh **memendek** — pakai kalau detik brief ditulis untuk pembaca manusia. Satu video keluar 133,8 detik dengan 31 detik hening sebelum mode ini ada; sesudahnya 115,1 detik tanpa lubang.

**Kalau scene dipanjangkan, jangkar animasinya ikut pindah** — bukan cuma kapsi. Scene yang melar sembilan detik akan diam sembilan detik kalau tidak.

**Batas scene tidak boleh jatuh di tengah baris VO.** Membulatkan tiap durasi ke 0,1 detik menumpuk selisih sampai batasnya memotong satu kata dan suara menembus jendela hening. Ada cek yang menggagalkan `plan` kalau ini terjadi.

**Ratakan semua sumber ke −6 dBFS** sebelum menyentuh gain; sebelum itu angka gain tidak berarti apa-apa. Musik **dan** SFX di-duck lewat `sidechaincompress` (ratio maksimum 20), dengan kunci yang wajib di-`apad`.

`asetpts` **sesudah setiap** `amix`**.** Tanpa itu timestamp hilang, `volume` dengan `eval=frame` membaca `t` sebagai NaN, dan ffmpeg mematikan bus itu ke 0 — **tanpa satu pun peringatan**. Seluruh bus SFX pernah mati sejak detik lima dan lolos tiga putaran pengukuran.

**−14 LUFS lewat ukur → gain statis → limiter**, bukan `loudnorm` satu lintasan (yang meratakan hierarki VO/musik/SFX). Ambang limiter dicari otomatis terhadap puncak sejati hasil **encode AAC**, bukan WAV — AAC bisa melonjak jauh di atas limiter.

**Nama peta cue dibaca dari komposisinya, bukan ditebak.** Alias lokal (`const A = {hook: CUES.Hook, ...}`) itu lazim, dan pola tetap `CUES|C` salah dua arah sekaligus: `C.bg` milik palet warna ikut terhitung sebagai rujukan scene — satu komposisi dilaporkan 127 rujukan padahal 92 — dan alias bernama lain tidak dikenali sama sekali, lalu `apply` menulis **nol** kapsi dan tetap melapor sukses. Kapsi yang tidak berpola sekarang **menggagalkan** `apply`.

**Titik di dalam domain dibaca "dot", bukan "titik".** `Konektor.id` -> "Konektor dot id". Aturannya di `ucapkan()`, bukan di `lafal` tiap config: tiap video menyebut domainnya sendiri, dan sekali terlewat salahnya terdengar di kalimat penutup. TLD dibatasi daftar dan titiknya harus menempel di dua sisi, jadi `Rp 148.500.000` dan titik akhir kalimat aman.

**Jendela hening diikat ke dua sisi:** `E` **baris sebelumnya DAN** `P` **baris sesudahnya.** Diikat ke satu sisi saja, satu baris yang memanjang menaruh ekornya di dalam jendela yang seharusnya senyap — dan itu baru ketahuan di `check`, sesudah render.

**Loop loudness membawa gain-nya lintas putaran, dan ambang limiter bergerak dua arah.** Dulu `g` dihitung ulang dari nol tiap putaran luar, jadi koreksi yang sudah didapat dibuang persis ketika ambang yang makin ketat menuntut gain yang makin besar. Dan `batas` hanya bisa turun: sekali satu mix melewatinya, limiter mengunci diri makin dalam dan tidak pernah kembali. Hasilnya -15,1 LUFS dan -7,7 dBTP — enam dB headroom terbuang, limiter mencekik. Menggeser jendela gate 0,4 detik sudah cukup untuk memicunya. Mix yang tidak konvergen sekarang melempar galat, bukan diam-diam lolos ke MP4.

**Akronim ditulis sebagai huruf kapital berspasi, bukan sebagai nama hurufnya.** Menulis `Ce Te We A` TERDENGAR SALAH — TTS menyatukannya jadi satu kata. Diuji balik lewat speech-to-text pada suara yang sama:

| **ditulis** | **terdengar** | **biaya** |
|---|---|---|
| `Ce Te We A` | "Chat WA" ✖ | — |
| `Ce-Te-We-A` | "chat WA" ✖ | — |
| `C.T.W.A.` | "CTW atau" ✖ | — |
| `Ce, Te, We, A` | "C, T, W, a" ✓ | +1,0 dtk per akronim |
| `C T W A` | "CTWA" ✓ | **tanpa tambahan** |

`eja()` di `lib/lafal.mjs` menulis bentuk terakhir. Deretan DUA huruf tidak pernah menyatu, jadi TLD boleh ditulis nama hurufnya langsung — `.id` jadi "dot Ai Di".

**Minta trek musik lebih panjang dari videonya, lalu pakai bagian depannya saja.** Generator menyusun arc penuh sepanjang durasi yang diminta, jadi trek 31 detik untuk video 30 detik menaruh **outro**-nya di detik 26-31 — persis di CTA. Terukur sebagai lubang 25 dB dan terdengar sebagai musik yang mati tepat di kalimat penutup. Minta 40 detik dan outro itu jatuh di luar bagian yang dipakai; fade penutup toh diurus mixer lewat `fadeOut`.

**Trek musik diperiksa sebelum diterima, dan diminta ulang kalau bolong.** Hasil generator tidak deterministik — tiga percobaan pada prompt yang sama memberi 3,5 · 2,0 · 7,5 detik lubang. Yang terata yang dipakai. Di atas itu ada kompresor lambat di bus musik yang memotong sisa ketidakrataan setengahnya pada trek apa pun.

**Yang menentukan kedalaman ducking itu THRESHOLD, bukan ratio.** `th: 0.05` setara -26 dBFS: hampir seluruh suara melewatinya dan tertekan penuh, jadi menurunkan ratio dari 10 ke 3 pun musiknya tetap hilang 2,3 detik di CTA. `th: 0.15` (-16,5 dB) dengan ratio 2 menahan duck di sekitar 6 dB, sesuai brief.

**Amplop musik tidak boleh menukik di batas scene.** Turun 7 dB dalam 1 detik terdengar seperti musiknya bolong, bukan seperti dinamika — dilaporkan sebagai "transisi dipaksakan". `amplop` sekarang memperingatkan gerakan lebih dari 6 dB dalam 1,5 detik.

`check` **mengukur lubang di bed musik terhadap median trek itu sendiri.** Ambang mutlak menuduh intro yang memang tipis; jendela 0,1 detik menuduh jarak antar-ketukan. Jendela 0,25 detik dengan minimum 0,35 detik menangkap lubang sungguhan dan mengabaikan celah musikal.

**Ambang puncak diberi margin 0,3 dB.** Yang diukur mixer adalah encode AAC percobaan; yang dinilai orang adalah encode di dalam MP4 final, dan keduanya tidak pernah persis sama. Sekali master lolos di -1,0 dBTP dan MP4-nya keluar di -0,9 — lolos di mixer, melanggar spesifikasi di berkas yang dikirim.

**Ukuran keluaran diturunkan dari ASPEK stage, bukan dipilih dari dua preset.** Pola lama hanya mengenal 9:16 dan 16:9, jadi stage 4:5 dan 1:1 — dua format feed Meta yang paling banyak dipakai — dipaksa jadi 1080x1920 dan gambarnya gepeng. Sisi pendek 1080, sisi panjang mengikuti aspek dan dibatasi 1920.

**Satu** `.jsx` **melayani semua rasio, ukurannya dibaca dari** `window.OM_SIZE`**.** Tiap rasio cukup satu berkas `.dc.html` yang menyatakan ukurannya; `jugaTulis` menjaga `OM_SCENES` keempatnya tetap sama. Kalau tiap rasio punya salinan `.jsx` sendiri, satu perbaikan timing harus ditulis empat kali dan tiga di antaranya pasti terlupa.

**HP/perangkat di dalam komposisi DISKALA utuh, bukan di-layout ulang per rasio.** Isi layarnya — ukuran font, padding, tinggi baris, posisi tiap beat — tetap persis sama di semua format, jadi tidak ada satu pun yang perlu diperiksa dua kali. Yang berubah cuma skalanya, posisinya, dan elemen yang menempel ke tepi bingkai (logo, kapsi, scrim).

`motion shot` **menerima** `--komposisi` **seperti** `render`**, dan menamai berkasnya per komposisi.** Tanpa itu memeriksa rasio kedua mustahil: tiga rasio dicuplik berturut-turut menghasilkan tiga berkas dengan nama yang sama, dari komposisi yang sama, dan terlihat seperti berhasil.

**Trim senyap memakan konsonan tak bersuara di awal kata.** Letusan /t/, /k/, /p/, /s/ cuma 10-20 ms dan pelan, jadi syarat lama (30 ms di atas -50 dB) tidak pernah terpenuhi dan seluruh awalannya terbuang sebagai "senyap". Diuji pada satu take yang sama, ditranskrip balik:

| **trim** | **durasi** | **transkrip** |
|---|---|---|
| tanpa trim | 1,280s | "**Toh** pakai LPWA" |
| 0,03 / -50 dB | 1,071s | "**Love** pakai LPWA" |
| 0,01 / -58 dB | 1,123s | "**Toh** pakai LPWA" |

Ini mengenai sebagian besar kata Indonesia dan tidak pernah terlihat kecuali barisnya ditranskrip balik.

`maks` **per baris VO: durasi TTS tidak deterministik.** Satu baris yang DIPENDEKKAN lima karakter pernah keluar 0,4 detik LEBIH panjang, karena konteks kalimat tetangganya ikut berubah. Di slot iklan yang ketat itu cukup memelarkan satu scene. `maks` mengubah batas jadi kontrak: generate ulang dengan seed berbeda sampai muat, dan kalau tidak pernah muat, pakai take terpendek lalu **katakan** — bukan diam-diam lewat.

**Cache VO lintas proyek.** Baris yang permintaannya sama persis dengan yang pernah dibuat di proyek mana pun di mesin ini (teks terlafal, suara, model, seed, parameter suara, `maks`/`dengar`, DAN kalimat sebelum/sesudahnya) disalin dari `~/.motion/cache-vo/` tanpa memanggil ElevenLabs. Ini menghemat proyek yang disalin untuk angle atau rasio lain dan kalimat penutup yang berulang. Konteks tetangga sengaja ikut kunci, karena alasan yang sama dengan `maks` di atas: tetangga yang berubah mengubah intonasi dan durasi. Perkiraan biaya menghitung baris dari cache sebagai gratis, mencetak "hemat N kredit", dan mencatatnya di `biaya.json`. `--kering` memakai durasi persisnya. VO lama yang segar ikut mengisi cache saat `plan`/`mix`/`check` dijalankan. Cache per mesin: `rama-tuf` punya cache sendiri. `MOTION_CACHE_VO=off` mematikannya. `plan` dengan VO yang dihapus tetap mengambil dari cache; untuk benar-benar meminta take baru, ubah `seed`.

`dengar` **per baris VO: take diterima hanya kalau transkripnya cocok.** Ejaan yang sama bisa benar di satu seed dan salah di seed lain ("Chat Wulan" -> "Jadwulan"). `dengar: /chat wulan/i` membuat `vo` mengulang dengan seed lain sampai cocok; `coba` per baris menaikkan batasnya (bawaan 4). Tiap take menambah satu panggilan STT (±Rp150).

**Hasil generator SFX diperiksa sebelum diterima.** Satu prompt yang sah pernah kembali nyaris senyap; trim menghabiskan sisanya dan berkas 253 byte tetap ditulis seolah berhasil. Kegagalannya baru muncul di `mix`, sebagai `Error opening input files: Invalid argument` — tanpa menyebut berkas mana atau kenapa.

**Senyap di kepala trek musik ikut dipangkas**, sama seperti VO dan SFX. Trek generator sering dibuka dengan 0,3-0,6 detik hening; dibiarkan, iklannya mulai dengan bed kosong.

**Satu zip bisa memuat lebih dari satu VIDEO, bukan cuma orientasi lain.** Yang membedakan adalah `.jsx` utamanya, BUKAN namanya — dua angle berbeda sama-sama bernama `... 9x16.dc.html`. `init` sekarang menolak menebak dan meminta `--komposisi=`. Salah di sini mahal dua kali: retiming jatuh ke video yang keliru, DAN komposisi angle lain masuk ke `jugaTulis` sehingga durasi scene-nya ikut ditimpa. Peringatan "jsx tidak dipakai" juga dihitung terhadap SELURUH komposisi di zip; dihitung terhadap satu saja, `.jsx` milik angle lain dituduh berkas mati.

**Cache dikunci ke waktu ubah, bukan ke "berkasnya ada".** Sumber yang diregenerate tanpa cache ikut diperbarui membuat mixer diam-diam memakai rekaman lama yang lebih panjang, dan itu terdengar sebagai suara dobel yang sangat sulit dilacak.

`/tmp` **di mesin render bisa berupa tmpfs, dan kalau penuh Chromium mati tanpa sebab yang kelihatan.** `--disable-dev-shm-usage` memindahkan shared memory Chromium dari `/dev/shm` ke direktori temp — dan di `rama-tuf` `/tmp` adalah tmpfs 16 GB yang dipakai worktree sesi lain sampai 80%. Gejalanya bukan "disk penuh": tab mati dengan `Target crashed` atau `Protocol error (Page.captureScreenshot): Unable to capture screenshot`, TANPA satu pun galat JavaScript, dan tetap mati walau `--disable-gpu` dipasang. Diukur pada komposisi 1080x1920 yang sama:

|  | **viewport 1200x1200** | **1400x1600** | **1600x1800** | **2200x2400** |
|---|---|---|---|---|
| `/tmp` tmpfs 80% penuh | ✓ | ✓ (1 tab) | ✖ | ✖ |
| `TMPDIR` di NVMe | ✓ | ✓ (4 tab) | ✓ | ✓ |

Dengan `TMPDIR=$HOME/render/tmp`, 1.200 frame selesai 35,9 fps dengan 4 tab. Sebelum itu satu tab pun gagal. Jangan menghapus isi `/tmp` milik sesi lain — pindahkan temp-nya.

```sh
ssh rama-tuf 'bash -lc "cd ~/render/motion-engine && TMPDIR=$HOME/render/tmp WORKERS=4 node bin/motion.mjs render proyek/<nama>"'
```

`MOTION_VIEWPORT` **menimpa ukuran viewport, dan itu TIDAK menurunkan resolusi keluaran.** `dsf` diturunkan dari `1080 / lebar-kotak`, jadi stage yang lebih kecil membuat `deviceScaleFactor` naik sendiri dan backing store-nya tetap 1080 piksel. Dipakai waktu mesin render sedang sesak dan viewport bawaan 2200x2400 tidak muat.

**Kapsi** `<Captions items={[...]}>` **inline lebih baik DIUBAH jadi** `const caps`**, bukan dimatikan.** Menyetel `kapsi: false` memang aman, tetapi lalu tiap putaran revisi menuntut 17 offset disetel tangan — dan durasi TTS tidak deterministik, jadi salah satunya pasti terlewat. Ubah bentuknya sekali:

- `useComposition()` didestrukturisasi sebagai `CUES`, bukan `CUES: C` — `namaCue` membaca `const X = {...CUES...}`, dan destrukturisasi tidak dikenalinya sama sekali.
- Tiap baris ditulis `{ at: CUES.Scene + 0.00, text: '...' }`, satu baris satu kapsi.
- `until` JANGAN ditulis: `<Captions>` sudah memakai `at` kapsi berikutnya. Kalau perlu batas atas, turunkan di `items={caps.map(...)}` — `geserKapsi` hanya menulis ulang `at`, dan `until` yang dibekukan akan meleset begitu VO berubah panjang.

**Bus VO, musik, dan SFX yang KOSONG itu sah, dan dulu mustahil di-mix.** Satu explainer diputuskan tanpa bed musik dan satu opener 5 detik dibawa penuh oleh SFX. Keduanya gagal di `mix` dengan `amix=inputs=0` dan `[m0]` yang merujuk label yang tidak pernah dibuat — ffmpeg berhenti dengan `Invalid argument` tanpa menyebut bus mana. Sekarang bus yang kosong diisi `aevalsrc=0`, jadi ducking, stem, dan amix di belakangnya tidak perlu tahu. Bus SFX yang kosong (video tanpa satu cue pun) masih gagal dengan `amix=inputs=0` sampai 4 Nov 2026; ketiganya kini dijaga `test/mix.test.mjs`.

**Cek yang MENGUKUR VO dilewati kalau tidak ada VO.** `masking` dan `sub bed` sama-sama dinilai terhadap stem VO. Pada video tanpa VO stem itu senyap, jadi "musik +39,3 dB terhadap VO" selalu ✖ dan "VO di atas SFX -59,4 dB" tidak berarti apa-apa. Cek yang selalu merah di satu kelas video persis sama gunanya dengan cek yang tidak ada. `check` sekarang mencetak "tanpa VO: cek pita bicara dan sub bed tidak berlaku", dan `periksa` melewati panggilan STT berbayar untuk stem yang memang senyap.

**Peringatan "amplop menukik" dulu TIDAK PERNAH berbunyi.** Dia membandingkan titik amplop dalam gain LINEAR, bukan dalam dB: -17 dB dan -25 dB berjarak 0,085 dalam satuan itu, jadi syarat "lebih dari 6" tidak pernah terpenuhi. Ambangnya baru tercapai di atas +15 dB — nilai yang tidak pernah ditulis siapa pun. Tukikan 7 dB yang dilaporkan penonton sebagai "transisi dipaksakan" lolos tanpa satu pun baris log, sementara README dan IKLAN.md sama-sama menyebut peringatan itu sebagai jaring pengamannya.

**Kapsi bertuple** `[cue, mulai, selesai, teks]` **diubah jadi** `const caps`**, bukan dimatikan.** Bentuk itu lolos dari `geserKapsi` tanpa galat — regex-nya mencari `const caps` huruf kecil — jadi `apply` mencetak "0 kapsi" dan jendela kapsinya tetap dibekukan di angka yang ditulis tangan. Terukur di explainer ROAS: baris terpanjang berbunyi 4,16 detik sementara jendela kapsinya 2,0 detik, dan 2,1 detik terakhir kalimat itu tampil TANPA teks. Yang diubah tiga hal sekaligus:

- larik dipindah ke DALAM komponen (dia butuh peta cue-nya),
- destrukturisasi ditulis `const {T, CUES} = useComposition()` lalu alias `const q = CUES` — `namaCue()` tidak mengenali `CUES: q`, dan kapsi ber-`q.` menggagalkan `apply`,
- batas atas kapsi diturunkan dari `at` kapsi BERIKUTNYA, tidak pernah ditulis.

**Hitungan "array detik absolut" di** `init` **dibaca dari SATU** `.jsx`**, dan sering yang salah.** Komposisi yang mengimpor beberapa berkas (`animations-v3.jsx app-ui.jsx demo-scenes.jsx`) membuat `init` memeriksa berkas mesin animasinya, bukan berkas scene-nya — lalu mencetak "✓ 100% scene-relatif: durasi scene aman diubah". Dua video Biro Jodoh Rumaysho dilaporkan begitu, padahal berkas scene-nya memuat `CAM` (jalur kamera 0-90 detik), `CUR` (jalur kursor), dan `PHONE` (jalur ponsel 8,6-45,0 detik) — semuanya detik ABSOLUT. Scene yang melar setengah detik membuat kursornya menekan tombol yang sudah tidak ada di layar. Buka sendiri berkas yang mendefinisikan komponen di `component-from-global-scope`, dan percayai isinya, bukan barisnya.

Kalau durasi memang tidak boleh berubah: beri `maks` pada TIAP baris VO, lalu baca laporan `plan` — kolom selisih harus kosong untuk semua scene, bukan cuma kecil.

`tata.ekor` **menurunkan ekor satu scene sendiri, dan scene TERAKHIR biasanya butuh itu.** `ekorBiasa` 0,20 detik membuat scene penutup membulat naik 0,05 detik dan video 45 detik keluar 45,05 detik. Batas scene terakhir bukan potongan gambar, melainkan kartu penutup yang memang menahan sampai frame terakhir — `ekor: {Ajakan: 0.05}` dan videonya pas.

**Satu baris VO boleh memakai suara lain lewat** `voice`**.** Dipakai waktu brief menandai sebagian baris untuk pembaca kedua. `voice` ikut masuk `.kunci` cache, jadi menggantinya meregenerate baris itu saja. Sisa setelan — speed, stability, style — tetap dari `suara`, supaya kedua pembaca terdengar berada di ruang yang sama.

**Direktori frame mengandung PID.** Dua rantai render yang tidak sengaja jalan bersamaan pernah melaporkan "900 frame ✓" padahal MP4-nya 2 detik.

**Stage yang tidak muat di viewport diperbesar viewport-nya, bukan dipotong.** Playwright memangkas `clip` screenshot ke viewport. Stage 1080x1920 yang tidak menskalakan dirinya (bentuk contoh minimal `mcp/PANDUAN.md`) di viewport 1400x1600 (bawaan Dockerfile) keluar sebagai frame 1080x1600, lalu `scale` menariknya ke 1920: zona kapsi hilang dan gambarnya gepeng, tanpa satu galat pun. Sekarang tiap tab memperbesar viewport sampai stage muat (tidak pernah mengecilkan, jadi komposisi yang menskalakan dirinya tidak berubah), stage yang tetap di luar halaman ditolak, dan frame yang aspeknya beda dengan keluaran menggagalkan render sebelum encode.

**MP4 ditulis BT.709 dan ditandai.** Frame JPEG Chromium adalah BT.601; dulu dikonversi dengan matriks BT.601 tanpa tanda, sementara Chrome, iOS, Android, dan aplikasi Meta membaca video HD tak bertanda sebagai BT.709. Didekode seperti pemutar (ffmpeg 6.1.1): hijau WhatsApp #25D366 (37,211,102) tampil 22,186,99, merah #E53935 (229,57,53) tampil 244,72,50. Konversi lewat RGB ke BT.709 rentang TV memberi selisih ≤ 3. `-sampul.jpg` yang dicuplik dari MP4 ikut dikonversi balik; tanpa itu #25D366 jadi 50,238,104.

**Master dipakai ulang hanya bila SELURUH masukannya sama.** Render MCP dulu menjalankan mix penuh (ratakan semua sumber, sampai 40 lintasan loudness) di tiap render, termasuk sesudah revisi visual saja. Kuncinya (`mix.kunciMix`) memuat seluruh opsi `rakit` apa adanya, bukan daftar field pilihan (field baru yang lupa ditambahkan akan memberi master basi tanpa peringatan), sidik ISI tiap sumber (rsync dan salinan mempertahankan waktu ubah), dan sidik kode mixer sendiri. Berlaku hanya bila master dan ketiga stem masih ada. Kunci lama dibuang sebelum mix ulang: mix yang gagal di tengah sudah menimpa master, dan kunci lama yang tertinggal akan terbaca segar begitu config dikembalikan.

**Perataan -6 dBFS dipasang di filtergraph, bukan ditulis ke MP3 baru.** Dulu tiap VO, SFX, dan musik ditulis ulang ke `vo/norm/`, `sfx/norm/`, `*-norm.mp3`: satu generasi encode MP3 lagi sebelum mix (TTS sudah MP3 128k), plus berkas antara yang memakan kuota MCP. Gainnya sama (puncak → -6 dBFS), kini `volume=<g>dB` di kepala rantai tiap masukan. Berkas norm lama dibuang saat mix.

**`hening` membaca rentangnya sekali, dan berkas tak terbaca tidak lagi lolos.** Satu proses ffmpeg per jendela 20 ms (±110 proses untuk dua gate, 7,7 dtk) diganti satu dekode (0,15 dtk) dengan jendela dan ambang yang sama. Versi lama menganggap jendela tanpa audio sebagai senyap, jadi MP4 yang gagal dibaca lolos sebagai "senyap ✓".

**Waktu per kata (opt-in `suara.waktuKata: true`).** TTS memakai endpoint `with-timestamps` dengan badan permintaan yang sama, dan waktu tiap kata naskah disimpan di `vo-NN.mp3.kata.json` bersama sidik isi MP3-nya (waktu yang tidak cocok dengan audionya tidak pernah dibaca). Waktu API berlaku untuk teks TERLAFAL (`C T W A`, `konektor dot Ai Di`); tiap kata naskah dilafalkan sendiri dan dicari berurutan di sana, lalu digeser sebanyak senyap kepala yang dipangkas. Dipakai `timing.js` (`VO_TIMING[].kata`, kontrak v2) dan batas potongan subtitle; ikut cache VO lintas proyek. Opt-in karena endpoint ini belum pernah dipanggil sungguhan dari mesin ini: respons yang berbeda bentuk akan menggagalkan semua VO. Kunci VO tidak berubah, jadi menyalakannya tidak membuat ulang VO lama (baris lama tetap memakai waktu per baris; ganti `seed` untuk meminta take baru bila perlu).

**`speed` hanya diterapkan API, tidak lagi ditambah `atempo`.** Penyatuan pemangkasan VO (P3-02, 4 Nov 2026 18:34 WIB) ikut mengirim `suara.speed` sebagai `atempo` di jalur TTS CLI; VO ber-speed 1,2 keluar ±1,44x tanpa satu peringatan, karena kuncinya sama persis dengan kunci versi benar. `tempo` hanya untuk unggahan MCP (connector tidak punya speed). Kunci VO kini membawa versi pangkas; VO lama yang tidak mungkin terkena (speed 1, atau dibuat sebelum commit itu) dipakai tanpa biaya, sisanya dibuat ulang. Aturan "VO ini segar" ada di satu tempat (`vo.segarVo`/`cariCacheVo`), dipakai `vo`, perkiraan biaya, dan `--kering`.

**A/B bus SFX di `check` tidak menyentuh `master.wav`.** Dulu master dan `stem/` ditimpa mix tanpa SFX lalu dipulihkan dengan mix ulang tanpa `finally`; `check` yang dihentikan di tengah meninggalkan master TANPA SFX untuk render berikutnya. Mix A/B kini ditulis ke `.master-tanpa-sfx.wav` dan dihapus sesudahnya.

## Berapa lama satu video

Diukur pada video 67,6 detik: 7 scene, 23 baris VO, 17 berkas SFX, 51 cue, 1 trek musik. Mesin 24 core, render 6 tab.

| **Langkah** | **Waktu** | **Catatan** |
|---|---|---|
| `init` | < 1 dtk | unzip + deteksi |
| `speed` | ± 7 dtk per suara | sekali per proyek, bukan per baris |
| `sfx` | 31 dtk | 17 panggilan, ± 1,8 dtk masing-masing |
| `plan` | 29 dtk | 23 baris VO, ± 1,2 dtk masing-masing; hitungannya sendiri < 1 dtk |
| `apply` | < 1 dtk | tulis durasi + kapsi |
| `music` | 20 dtk | 1 trek 68 dtk |
| `mix` | 9 dtk | ratakan semua sumber + 5 putaran loudness (sejak P8-09 ±25% lebih cepat: tanpa MP3 antara, LUFS tanpa true peak) |
| `render` | 1 mnt 50 dtk | 2.030 frame, ± 20 fps, plus encode |
| `check` | 34 dtk | 2 mix ulang untuk A/B + STT |
| **Total mesin** | **± 4,5 menit** | orientasi kedua: **+ 1,7 menit** (`render` saja) |

Sejak P8-05 `motion all` memotret frame selagi musik dibuat dan di-mix: musik sebagian besar menunggu jaringan, dan mix berjalan sebagai `motion mix` di proses anak. Mix tidak boleh di proses yang sama dengan render: `rakit` memakai `execFileSync` yang memblokir event loop, dan Playwright habis waktu di tengah screenshot (terjadi saat diukur). Terukur 43-45 → 30-32 dtk pada 300 frame + mix 60 dtk + 15 dtk tunggu jaringan. Encode selama capture (P8-06) diukur dan TIDAK lebih cepat di 8 core: capture sudah memakai semua CPU.

Sejak P8-04 (5 Nov 2026) `sfx` dan `plan` berjalan bersamaan dengan 3 permintaan sekaligus: 23 VO + 17 SFX terukur 22,3 dtk terhadap server tiruan berlatensi 1,2 dtk, dari 62,5 dtk berurutan. Lebih dari 3 tidak lebih cepat (5: 22,8 dtk): sisanya pemangkasan ffmpeg sinkron per berkas, yang menahan event loop.

Biaya ElevenLabs satu video: **± Rp11.500**.

Yang menghabiskan waktu bukan mesinnya. Sisanya adalah membaca komposisi untuk mencari beat animasi, menulis naskah, dan memetakan cue — dan itu **satu-satunya bagian yang benar-benar perlu dipikir**. Semua yang di bawah ini ada supaya bagian itu tidak dipakai untuk hal lain.

## Rasio untuk iklan Meta

Satu master audio, satu `.jsx`, empat render. Tulis rasio lain di config, lalu satu perintah:

```js
jugaTulis: ['Iklan 4x5.dc.html', 'Iklan 1x1.dc.html', 'Iklan 16x9.dc.html'],   // durasi scene ikut apply
varian: [{komposisi: 'Iklan 4x5.dc.html'}, {komposisi: 'Iklan 1x1.dc.html'},
  {komposisi: 'Iklan 16x9.dc.html', keluaran: 'iklan-16x9.mp4', sampul: {detik: 2}}],
```

`motion render --semua-varian` merender komposisi utama lalu tiap varian secara bergiliran dengan `master.wav` yang sama, lalu mencetak satu tabel: rasio, piksel, durasi, LUFS, dBTP, kontras frame 0, sampul. Ambangnya sama dengan `motion check`, dan kode keluar 1 bila ada ✖. Sebelum Chromium dibuka, `OM_SCENES` tiap varian dibandingkan dengan timeline hasil `plan`. Varian yang lupa dimasukkan ke `jugaTulis` ditolak dengan sebabnya, karena kalau tidak, videonya berjalan dengan durasi brief di atas audio baru. Satu varian yang gagal tidak menghentikan yang lain. Satu rasio saja tetap bisa lewat `motion render --komposisi=<html> --keluaran=<x>.mp4`.

| **Rasio** | **Piksel** | **Penempatan Meta** |
|---|---|---|
| 9:16 | 1080x1920 | Reels, Stories — penempatan terbesar untuk CTWA |
| 4:5 | 1080x1350 | Feed Facebook & Instagram — format feed yang disarankan Meta |
| 1:1 | 1080x1080 | Feed, Marketplace, Explore — cadangan paling universal |
| 16:9 | 1920x1080 | In-stream video, kolom kanan |

Komposisi yang isinya mockup perangkat tegak selalu paling lemah di 16:9: perangkatnya mengecil dan sisi kiri-kanan jadi ruang kosong. Kalau anggaran terbatas, jalankan 9:16, 4:5, dan 1:1 dulu.

## Verifikasi

`motion check` menjalankan pemeriksaan di bawah; masing-masing pernah menangkap kelas kesalahan yang tidak terlihat (ditambah LUFS/dBTP MP4 dan sub bed terhadap VO):

1. **Frame 0 sebagai sampul.** Instagram Reels, TikTok, dan LinkedIn memakainya sebagai sampul kalau pengunggah tidak memilih sendiri, dan TikTok tidak mengizinkannya diganti sesudah unggah. Diukur sebagai simpangan baku luma frame 0 dibagi median simpangan sepanjang detik pertamanya — rasio, bukan ambang mutlak, karena trailer gelap memang berkontras rendah di scene pembukanya. Di bawah 0,75 dinyatakan gagal. Waktu cek ini dipasang, **35 dari 41 berkas MP4 di repo ini** tidak lolos — yang lolos cuma dua video, dan keduanya kebetulan. Lihat `IKLAN.md` §5.
2. **Masking di pita bicara 300 Hz–4 kHz** lewat stem terpisah. Broadband menipu — angkanya didominasi sub-bass yang sama sekali tidak menutupi suara.
3. **A/B bus SFX**: render ulang dengan bus itu dimatikan lalu bandingkan. Selisih **0,0 dB di semua titik** berarti bus-nya tidak pernah masuk — bukan berarti SFX-nya pelan.
4. **Jendela hening diukur di MP4 final.** `eval=frame` plus limiter menggeser gerbang ±0,08 detik dari angka yang ditulis di mixer.
5. **Transkrip balik stem VO** lewat `speech-to-text` (±Rp150). Menangkap baris dobel, baris hilang, urutan tertukar, dan pelafalan salah sekaligus — kalau ejaan ulang seperti `desbord` kembali jadi "dashboard", bunyinya memang benar.
6. **Lubang bed musik** di stem musik, terhadap median trek itu sendiri. Peta yang sama sudah dicetak `motion music` atas potongan trek yang benar-benar dipakai (`lewati`, `mulai`, sampai akhir `fadeOut`), dalam detik video, scene, dan bagian `rencana` — jadi lubang ketahuan sebelum mix dan render, termasuk di trek `luar` yang dulu tidak pernah diperiksa.
7. **Tata letak di komposisi hidup** (Chromium, tanpa render): di tengah tiap baris VO, tengah tiap scene, dan 0,25 detik sesudah tiap batas scene. Melaporkan teks yang keluar stage atau terpotong wadah ber-overflow, kapsi yang kosong atau tidak memuat kata naskahnya (aktif bila `kapsi: true` atau `periksa: {kapsi: '<selektor>'}`), dan frame hitam rata. Peringatan, bukan putusan: transisi fade-ke-hitam yang disengaja juga terbaca sebagai frame hitam.

## Pasang

Yang harus ada di laptop sebelum `motion` dijalankan:

| **Yang** | **Wajib untuk** | **Catatan** |
|---|---|---|
| Node 20+ | semua perintah |  |
| `ffmpeg`, `ffprobe` | mix, render, check |  |
| `unzip` | `motion init` |  |
| Chromium lewat Playwright | `motion render`, `motion shot` | `playwright` terkunci di `package.json`; unduh Chromium-nya dengan `npx playwright install chromium` |
| `ELEVENLABS_API_KEY` | `plan`, `sfx`, `music`, `voices`, `speed`, `cost`, dan `check` (transkrip balik) | satu kunci untuk VO, efek suara, dan musik |

Gambar AI **tidak** dipakai rantai `motion all`. `AI_API_KEY` dan `AI_BASE_URL` hanya dibaca skrip `proyek/*/gambar.mjs` (endpoint yang kompatibel dengan OpenAI). Model gambar default skrip itu `cx/gpt-5.6-sol`, ditimpa dengan `MOTION_IMAGE_DRIVER`. `AI_TEXT_MODEL` dan `AI_IMAGE_MODEL` ada di contoh lama dan tidak dibaca kode mana pun.

Kunci Cloudflare R2 dan Repliz yang dulu tertulis di `.env.example` juga tidak dibaca repo ini. Jangan diisi di laptop orang lain.

```sh
cd motion-engine
npm ci                           # pakai package-lock.json; jangan `npm install` di mesin render
npx playwright install chromium
cp .env.example .env             # isi ELEVENLABS_API_KEY
npm link                         # opsional, supaya `motion` ada di PATH
node bin/motion.mjs doctor       # semua prasyarat di atas dalam satu daftar centang
```

`motion doctor` memeriksa tabel di atas plus hal yang dulu baru ketahuan di tengah render: filter ffmpeg yang dipakai mixer (build minimal tidak punya `sidechaincompress`), Chromium yang terunduh tapi tidak bisa diluncurkan dengan sandbox (pustaka sistem atau user namespace), `/tmp` tmpfs ≥ 70% penuh (Chromium mati di sekitar frame 250, lihat "Render di `rama-tuf`"), ruang bebas < 4 GB untuk frame, penyetel `.env` yang salah ketik, dan satu panggilan ringan ke ElevenLabs (sisa kredit). Tiap ✖ disertai perintah perbaikannya. `--luring` melewati ElevenLabs; `--cepat` tidak meluncurkan Chromium.

Kalau Playwright sudah terpasang di repo lain, tunjuk foldernya dan lewati unduhan Chromium kedua:

```sh
MOTION_PLAYWRIGHT=/path/ke/repo-yang-punya-playwright motion render proyek/video-baru
```

`.env` masuk `.gitignore`. Jangan di-commit dan jangan diunggah ke Drive. Berkas contoh hanya berisi nama variabel kosong.

Penyetel yang boleh dikosongkan: `MOTION_ENV` (jalur `.env` lain), `WORKERS` (tab render, default 6), `MOTION_VIEWPORT` (default `2200x2400`; turunkan kalau Chromium mati karena memori), `MOTION_ENCODER`, `FFLOG`, `MOTION_CACHE_VO` (jalur cache VO lintas proyek, bawaan `~/.motion/cache-vo`; `off` untuk mematikan), `MOTION_EL_PARALEL` (permintaan ElevenLabs bersamaan, bawaan 3; batas konkurensi akun: Starter 3, Creator 5, Pro 10), `MOTION_KIRIM` (akar `motion kirim`, bawaan `~/Videos/Ads`).
