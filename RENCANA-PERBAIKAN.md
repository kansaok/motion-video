# Rencana Perbaikan & Pengembangan motion-engine

Dokumen kerja untuk agent (dan manusia). Sumbernya adalah audit kode pada 4 Nov 2026 atas `lib/render.mjs`, `lib/pipa.mjs`, `lib/tata.mjs`, `lib/komposisi.mjs`, `lib/jaring.mjs`, `lib/ff.mjs`, `lib/env.mjs`, dan seluruh `mcp/`, ditambah README/IKLAN.

## Cara memakai dokumen ini

- Kerjakan **satu tugas per commit/PR**. Tiap tugas punya ID (mis. `P1-01`), berkas yang disentuh, langkah, dan **kriteria selesai** yang bisa diperiksa.
- Urutan fase = urutan prioritas. Tugas dalam satu fase boleh paralel kecuali ada baris `Bergantung pada`.
- Tanda keyakinan:
  - **[TERBUKTI]** sudah dibaca di kode, tinggal diperbaiki.
  - **[DUGAAN]** masuk akal tapi belum diverifikasi. Langkah 1 tugasnya adalah membuktikan atau membantahnya. Kalau terbantah, catat di bagian "Catatan hasil" di akhir dokumen dan lewati tugasnya.
- File yang **belum diaudit**: `lib/mix.mjs`, `lib/periksa.mjs`, `lib/el.mjs`, `lib/stok.mjs`, `lib/lafal.mjs`, `bin/*.mjs`. Tugas yang menyentuhnya (Fase 5) wajib diawali membaca berkasnya.
- Aturan produksi di `README.md.docx` dan `IKLAN.md.docx` lahir dari kesalahan nyata. **Jangan melemahkan satu pun cek atau galat yang ada** demi membuat tes lulus.
- Bahasa kode, komentar, dan pesan galat: Indonesia, mengikuti konvensi repo. Komentar menjelaskan *sebab*, bukan *apa*.

## Konteks singkat

- Dua pintu masuk ke satu inti: CLI (`bin/motion.mjs`, config `motion.config.mjs` berupa modul JS) dan server MCP (`mcp/`, config JSON + ekspresi detik buatan sendiri di `mcp/ekspresi.mjs`).
- Rantai: bongkar zip → baca `OM_SCENES` → tempatkan VO → hitung durasi scene → tulis balik jangkar/kapsi ke JSX → mix → screenshot Chromium per frame → ffmpeg mux → periksa.
- Server MCP dipakai bersama banyak pelanggan, jadi isi kiriman pelanggan (HTML/JS komposisi, zip, URL) harus diperlakukan tidak tepercaya.
- Tidak ada tes, tidak ada CI. Node ≥ 20, ESM, tanpa TypeScript.

## Daftar isi

- Fase 0: Fondasi (tes, CI, build reproduktif)
- Fase 1: Ketahanan server MCP (kritis)
- Fase 2: Keamanan
- Fase 3: Kebenaran & keterpeliharaan kode
- Fase 4: Operasional & observabilitas
- Fase 5: Audio, musik, dan pemeriksaan
- Fase 6: Fitur baru
- Fase 7: Dokumentasi & kebersihan repo
- Lampiran: urutan eksekusi, definisi selesai, catatan hasil

---

## Fase 0: Fondasi

Tujuan: sebelum mengubah perilaku apa pun, pasang jaring pengaman supaya perubahan berikutnya bisa dibuktikan aman.

### P0-01 Runner tes dan tes untuk fungsi murni
- **Berkas**: baru `test/*.test.mjs`, ubah `package.json`.
- **Langkah**
  1. Pakai `node:test` bawaan Node 20 (tanpa dependensi baru). Tambah skrip `"test": "node --test test/"`.
  2. `test/ekspresi.test.mjs`: untuk `hitung()` di `mcp/ekspresi.mjs`: aritmetika dan prioritas operator, `min`/`max`, `C.Nama`, `C['Nama Scene']`, `P[7]`, `total`; galat untuk nama tak dikenal, kurung tak seimbang, ekspresi terpotong, pembagian nol (`Infinity` harus ditolak), peta tanpa kunci.
  3. `test/tata.test.mjs`: untuk `tempatkan` dan `rencana` di `lib/tata.mjs`: mode `jangkar` (scene hanya memanjang), mode `alir` (scene bisa memendek), konvergensi, dan `periksaBatas` yang melempar galat saat batas scene memotong VO.
  4. `test/komposisi.test.mjs`: untuk `bacaScenes`/`tulisScenes` (kutip tunggal dan ganda, nama scene berspasi), `relatif`, `jsxUtama`, `geserJangkar`, `geserDeret`, `geserKapsi` memakai fixture kecil di `test/fixtures/`. Wajib ada kasus yang pernah gagal di produksi: alias peta cue (`const C = {dp: CUES[...]}`), kapsi tak berpola harus melempar galat (bukan mengembalikan 0), `at` tidak boleh jadi NaN.
  5. `test/jaring.test.mjs`: `privat()` untuk 10/8, 172.16/12, 192.168/16, 127/8, 169.254/16, 100.64/10, `::1`, `fc00::`, `fe80::`, `::ffff:127.0.0.1`; IP publik harus lolos.
  6. `test/jalur.test.mjs`: `jalurAman` di `mcp/proyek.mjs` menolak `..`, path absolut, berkas diawali titik, ekstensi `.asli/.terap/.kunci`; menerima subfolder biasa.
- **Selesai bila**: `npm test` hijau dan tiap aturan di komentar kode yang disebut di atas punya setidaknya satu tes yang gagal jika aturannya dihapus.

### P0-02 CI
- **Berkas**: baru `.github/workflows/ci.yml`.
- **Langkah**: Node 20 dan 22; `npm ci`; `npm test`; `node --check` untuk semua `*.mjs`; `docker build` tanpa push. Tambah job opsional `npm audit --omit=dev --audit-level=high`.
- **Bergantung pada**: P0-03 (butuh lockfile untuk `npm ci`).
- **Selesai bila**: PR yang merusak tes atau sintaks ditolak otomatis.

### P0-03 Build reproduktif **[TERBUKTI]**
- **Masalah**: `.gitignore` mengabaikan `package-lock.json`, `Dockerfile` hanya menyalin `package.json`, dan `package.json` memakai `"playwright": "^1.64.1"`. Komentar Dockerfile menegaskan versi Playwright HARUS persis sama dengan tag image `mcr.microsoft.com/playwright:v1.64.1-noble`. `npm install` yang kebetulan mengambil 1.65 membuat Chromium tidak ditemukan.
- **Langkah**
  1. Pin persis: `"playwright": "1.64.1"` (tanpa caret). Pertimbangkan pin persis untuk dependensi lain juga.
  2. Hapus `package-lock.json` dari `.gitignore`, commit lockfile.
  3. Dockerfile: `COPY package.json package-lock.json ./` dan `npm ci --omit=dev`.
  4. Tambah cek build: skrip kecil yang membandingkan versi `playwright` di `package.json` dengan tag `FROM` di Dockerfile dan gagal bila beda (jalankan di CI).
  5. README: catat bahwa mesin render lain (mis. `rama-tuf`) harus memakai lockfile yang sama.
- **Selesai bila**: dua `docker build` berturut-turut di hari berbeda menghasilkan versi paket identik, dan CI gagal jika tag image dan versi paket berbeda.

---

## Fase 1: Ketahanan server MCP (kritis)

Dua tugas pertama mencegah satu pelanggan melumpuhkan layanan untuk semua pelanggan.

### P1-01 Hentikan pemblokiran event loop **[TERBUKTI]**
- **Masalah**: `lib/ff.mjs` memakai `execFileSync` (`ff`, `durasi`) dan `spawnSync` (`analisa`, `volume`, `lufs`, `puncakSejati`). `lib/pipa.mjs` `akhirSuara` juga `execFileSync`. `lib/render.mjs` memanggil `ff()` untuk encode akhir libx264 di dalam fungsi `async`. Total 14 panggilan sinkron di `lib/`. Selama encode/mix, proses Node tidak melayani `/sehat`, `status_render` pelanggan lain, maupun `/unduh`. Healthcheck Docker (timeout 5 dtk × 3) bisa menandai container unhealthy.
- **Pendekatan yang disarankan** (pilih satu, urut dari paling murah):
  - **A (disarankan)**: pindahkan seluruh eksekusi render ke **proses anak** (`child_process.fork` ke skrip `mcp/pekerja.mjs` yang memanggil `Pipa.sfx/terap/mix/render/periksa`). Server utama hanya mengirim tugas dan menerima kabar progres lewat IPC. Ini sekaligus memudahkan P1-02 (kill proses) dan P2-03 (isolasi).
  - **B**: buat varian asinkron `ffAsync`, `durasiAsync`, dll. memakai `execFile`/`spawn` dan ubah semua pemanggil `await`. Lebih banyak sentuhan ke kode lama.
- **Langkah (A)**
  1. Tulis `mcp/pekerja.mjs`: terima `{uid, proyek, opsi}` lewat `process.on('message')`, jalankan rantai yang sekarang ada di `kerjakan()` pada `mcp/antrean.mjs`, kirim `{langkah}`, `{hasil}`, atau `{galat}` balik.
  2. `antrean.mjs`: `kerjakan()` jadi `fork` + tunggu pesan; teruskan `langkah` ke `simpanStatus`.
  3. Pertahankan CLI (`bin/motion.mjs`) memakai fungsi sinkron yang ada. Tidak perlu diubah.
- **Selesai bila**: selama render 3 menit berjalan, `curl /sehat` selalu menjawab < 200 ms (uji dengan loop `curl` paralel dan catat p99), dan `status_render` dari akun lain tetap responsif.

### P1-02 Batas waktu total per render **[TERBUKTI]**
- **Masalah**: `bukaStage` punya timeout, tetapi loop frame di `lib/render.mjs` (`page.evaluate`, `page.screenshot`) tidak. Komposisi dengan loop tak berujung di handler `data-om-seek-to-time-frame` menggantung tanpa batas. Dengan `RENDER_PARALEL=1`, antrean semua pelanggan ikut macet.
- **Langkah**
  1. Env baru `RENDER_BATAS_MENIT` (bawaan: `max(10, MAKS_DETIK / 6)` menit) di `mcp/proyek.mjs` `BATAS`.
  2. Dengan P1-01(A): induk memasang `setTimeout` yang `kill('SIGKILL')` proses anak, lalu menandai tugas `gagal` dengan galat "melebihi batas waktu render". Pastikan Chromium ikut mati (jalankan anak dalam process group, `detached: true`, kill `-pid`) dan direktori `frames-*` di `os.tmpdir()` dibersihkan.
  3. Tanpa P1-01: tambahkan timeout per frame di `render.mjs` (`Promise.race` dengan timer, lalu `browser.close()`).
  4. Tambah watchdog kemajuan: jika jumlah frame tidak bertambah selama N detik, hentikan.
- **Selesai bila**: komposisi uji `while(true){}` di handler seek berakhir `gagal` dalam batas waktu, Chromium tidak tersisa (`pgrep chrome` kosong), dan render berikutnya jalan normal.

### P1-03 Antrean yang tahan restart dan tidak bocor **[TERBUKTI]**
- **Masalah**: Map `tugas` di `mcp/antrean.mjs` tidak pernah dibersihkan. Antrean hanya di memori; restart menandai tugas gagal dan pelanggan harus mengulang manual.
- **Langkah**
  1. Hapus entri `tugas` yang selesai/gagal lebih dari 1 jam (timer yang sama dengan retensi, atau saat `kirim`). `status()` tetap bisa menjawab dari `render.json` lewat `statusProyek`.
  2. Opsional: saat start, tugas berstatus `antre` di `render.json` dimasukkan kembali ke antrean. Tugas `jalan` ditandai `gagal` seperti sekarang (kerja separuh jalan tidak aman dilanjutkan).
  3. Batas panjang antrean global (`ANTRE_MAKS`, bawaan 20). `render` menolak dengan pesan jelas ("antrean penuh, coba lagi beberapa menit").
  4. `status_render` mengembalikan estimasi tunggu kasar: `(urutan) × rata-rata durasi render 10 terakhir`.
- **Selesai bila**: tes unit untuk `kirim`/`putar` (dengan `kerjakan` ditiru) menunjukkan Map tidak tumbuh tanpa batas dan antrean penuh ditolak.

### P1-04 Batas sumber daya Docker
- **Berkas**: `docker-compose.yml`.
- **Langkah**: tambah `mem_limit`, `cpus`, `pids_limit` (mis. 512), `ulimits`, dan `tmpfs: /tmp` dengan `size` eksplisit (README mencatat `/tmp` yang penuh mematikan render pada frame ±250; di Docker, arahkan `TMPDIR` ke volume dengan kuota, bukan tmpfs kecil). Set `stop_grace_period` cukup untuk render yang sedang jalan.
- **Selesai bila**: render yang bocor memori hanya mematikan container-nya sendiri, bukan VPS bersama (VPS menampung banyak project lain, lihat skill `vps2`).

---

## Fase 2: Keamanan

Model ancaman: pelanggan berlangganan yang jahat atau akunnya dibajak. Ia bisa mengirim HTML/JS komposisi, zip, URL, dan config.

### P2-01 Tolak start tanpa rahasia **[TERBUKTI]**
- **Masalah**: `mcp/proyek.mjs` memakai `process.env.UNDUH_RAHASIA || 'ganti-rahasia-ini'`. `.env.mcp.example` mengosongkannya. Jika lupa diisi, tautan unduh bisa dipalsukan (butuh `uid` yang mudah ditebak dan id proyek).
- **Langkah**: di awal `mcp/server.mjs`, jika `NODE_ENV=production` dan salah satu dari `UNDUH_RAHASIA` (min. 32 karakter), `BIMP_API_URL`, `BIMP_SERVICE_KEY` kosong, cetak galat jelas dan `process.exit(1)`. Tolak juga `MCP_DEV_TOKEN` terisi di produksi. Hapus fallback di `proyek.mjs`.
- **Selesai bila**: container tanpa env wajib gagal start (terlihat di `docker logs`), dan tes mencakup fungsi validasi env.

### P2-02 Batas zip dan kuota disk **[TERBUKTI]**
- **Masalah**: `unduh()` membatasi ukuran zip (50 MB) tetapi `Pipa.bongkar` memakai `unzip -oq` tanpa batas ukuran hasil ekstrak (zip bomb). Tidak ada kuota disk per akun: 20 proyek × unggahan 50 MB × retensi 14 hari.
- **Langkah**
  1. Sebelum ekstrak, jalankan `unzip -l` dan jumlahkan ukuran tak terkompres + jumlah entri. Tolak bila > `MAKS_EKSTRAK_MB` (bawaan 300) atau > 2000 entri, atau nisbah kompresi mencurigakan.
  2. Hitung ukuran `p.dir` per akun (`du` ringan atau pencatatan di `meta.json`). Tolak `unggah`, `tulis_berkas`, `impor_zip` bila akun melewati `KUOTA_MB` (bawaan 1500).
  3. Pastikan `unzip` memakai `-n`/tidak menimpa di luar `src` dan tidak mengekstrak path absolut (`unzip` biasanya menolak, tetapi tambahkan tes dengan zip berisi `../x`).
- **Selesai bila**: zip bomb uji (mis. 1 GB nol terkompres) ditolak sebelum menulis ke disk, dan akun yang melewati kuota mendapat galat jelas.

### P2-03 Isolasi Chromium **[DUGAAN, verifikasi dulu]**
- **Dugaan**: `chromium.launch({args: ['--mute-audio', '--disable-dev-shm-usage']})` tidak mengatur `chromiumSandbox`, dan Playwright secara bawaan meluncurkan Chromium dengan `--no-sandbox`. Komposisi pelanggan menjalankan JS bebas di sana. Env proses server memuat `BIMP_SERVICE_KEY` dan `UNDUH_RAHASIA`; volume `/data` memuat data semua pelanggan.
- **Langkah**
  1. Verifikasi: jalankan render uji dan periksa `ps aux | grep chrome` untuk flag `--no-sandbox`. Catat hasil di "Catatan hasil".
  2. Jika terbukti, kurangi dampak berlapis:
     - Dengan P1-01(A), luncurkan proses anak dengan **env bersih** (`env: {PATH, TMPDIR, MOTION_*}` saja, tanpa kunci servis).
     - Anak hanya perlu direktori proyeknya. Jalankan di container/sidecar terpisah, atau pakai `bubblewrap`/`unshare` bila tersedia, dengan mount hanya-baca untuk `lib/`.
     - Coba `chromiumSandbox: true` dengan profil seccomp yang direkomendasikan Playwright untuk Docker.
  3. Tambah `--disable-extensions`, `--disable-background-networking`, dan blokir `file:` di `jagaHalaman`.
- **Selesai bila**: proses Chromium tidak bisa membaca `/proc/<induk>/environ` yang berisi rahasia, dan keputusan sandbox terdokumentasi.

### P2-04 Perketat penjaga SSRF **[DUGAAN untuk poin 3, 4]**
- **Berkas**: `lib/jaring.mjs`, `mcp/proyek.mjs` (`unduh`).
- **Langkah**
  1. Beri TTL (mis. 60 dtk) dan batas ukuran (mis. 1000 entri) pada `cache` DNS di `hostPrivat`.
  2. Lengkapi daftar `PRIVAT`: `192.0.0.0/24`, `192.0.2.0/24`, `198.18.0.0/15`, `198.51.100.0/24`, `203.0.113.0/24`, `240.0.0.0/4`; IPv6: `64:ff9b::/96` (NAT64), `2001:db8::/32`, `ff00::/8`, IPv4-mapped yang sudah ada.
  3. **DNS rebinding (TOCTOU)**: `fetch` me-resolve ulang sesudah `hostPrivat`. Untuk `unduh`, resolve sekali lalu sambungkan ke IP itu (`undici` `Agent` dengan `connect.lookup` kustom yang memeriksa alamat akhir), bukan memeriksa lalu menyambung terpisah.
  4. Verifikasi apakah `page.route('**/*')` mencegat WebSocket (`new WebSocket('ws://10.x')` dari komposisi). Jika tidak, pakai `page.routeWebSocket` (Playwright ≥ 1.48) atau blokir `ws:`/`wss:` ke host privat. Catat hasil verifikasi.
  5. Pertahanan sungguhan ada di jaringan: tambahkan aturan egress container (firewall/`DOCKER-USER` iptables) yang memblokir rentang privat, termasuk network docker tetangga dan `169.254.169.254`. Dokumentasikan di `docs/`.
- **Selesai bila**: tes untuk tiap rentang baru lulus; skenario rebinding (resolver uji yang menjawab IP publik lalu privat) ditolak; egress firewall terdokumentasi dan diuji dengan `curl` dari dalam container.

### P2-05 Token di path URL
- **Masalah**: connector claude.ai memaksa `/mcp/<token>`, sehingga token masuk ke access log nginx dan proxy lain.
- **Langkah**: dokumentasikan konfigurasi nginx yang menyamarkan `/mcp/…` di `access_log` (`map` + `log_format`). Pertimbangkan token berumur pendek yang bisa dirotasi dari panel bimp. Pastikan `console.log`/`console.error` di server tidak pernah mencetak token (cek `mcp/server.mjs` dan `mcp/auth.mjs`; sekarang hanya hash yang dipakai sebagai kunci cache, pertahankan).
- **Selesai bila**: grep log contoh tidak menemukan token mentah.

### P2-06 Pembatasan laju
- **Langkah**: batasi laju per `uid` untuk alat berat (`render`, `cuplik`, `impor_zip`, `unggah`) di `mcp/alat.mjs` (token bucket di memori cukup). `cuplik` memakai Chromium langsung dan dibatasi 2 sekaligus global; tambahkan batas per akun. Pasang `limit_req` di nginx untuk `/mcp` dan `/unduh`.
- **Selesai bila**: satu akun yang membanjiri `cuplik` tidak membuat akun lain menunggu lebih dari beberapa detik.

### P2-07 Kekerasan kecil pada server statis render
- **Berkas**: `lib/render.mjs` `layani`.
- **Langkah**: bandingkan dengan `path.resolve(dirAkar) + path.sep` (seperti `jalurAman`), tolak berkas tersembunyi dan `.asli/.terap/.kunci`, tambahkan header `X-Content-Type-Options: nosniff`.
- **Selesai bila**: tes `layani` menolak `/../src-sibling/x` dan `/.hidden`.

---

## Fase 3: Kebenaran & keterpeliharaan kode

### P3-01 Pengganti string yang aman **[TERBUKTI]**
- **Masalah**: `String.prototype.replace(pola, stringPengganti)` menafsirkan `$&`, `` $` ``, `$'`, `$$`. Terjadi di `tulisScenes` (`isi.replace(m[0], ...)`), `geserJangkar`, `geserDeret`, `geserKapsi` (`isi.replace(blok[0], ...)`). Kapsi atau nama scene yang memuat `$$` atau `$&` rusak diam-diam.
- **Langkah**: ganti ke fungsi pengganti (`replace(pola, () => teks)`) di semua titik; tes dengan kapsi `"Hemat Rp$$ 5.000"` dan `"$& test"`.
- **Selesai bila**: tes tersebut lulus dan gagal bila perbaikan dicabut.

### P3-02 Satu fungsi untuk memangkas VO **[TERBUKTI]**
- **Masalah**: `simpanVo` di `mcp/proyek.mjs` mengklaim "SAMA PERSIS" dengan `Pipa.vo`, tetapi ambang (-58 dB, -45 dB, 0,25 dtk, fade 15 ms/80 ms) ditulis di dua tempat.
- **Langkah**: baca `Pipa.vo` (sisa `lib/pipa.mjs`), ekstrak `pangkasVo(mentah, keluar, {tempo})` ke `lib/pipa.mjs` atau berkas baru `lib/vo.mjs`; panggil dari kedua jalur. Tes dengan WAV sintetis (ffmpeg `sine` + hening) yang memastikan hasil identik dari kedua jalur.
- **Selesai bila**: ambang hanya didefinisikan satu kali (`grep -n "\-58dB" -r lib mcp` hanya satu hasil bermakna).

### P3-03 Hindari penambalan JSX dengan regex (jangka menengah)
- **Masalah**: `geserJangkar`/`geserDeret`/`geserKapsi` mengandalkan bentuk teks kode sumber. README mencatat sedikitnya tiga insiden (kapsi 0, `at` NaN, jangkar mengikuti berkas mati).
- **Langkah (bertahap)**
  1. Perkuat dulu: untuk tiap fungsi, galat yang menyebut nomor baris dan potongan teks yang diharapkan; tes regresi untuk tiap insiden di README.
  2. `motion init` dan `impor_zip` mencetak **laporan keselarasan**: berapa jangkar/kapsi yang akan bisa ditulis balik dan mana yang tidak, sebelum pengguna menulis naskah.
  3. Rancang kontrak komposisi v2: komposisi membaca `window.VO_TIMING` dan `window.OM_CUES` (yang sudah ditulis `timing.js` di `mcp/antrean.mjs`) untuk menempatkan kapsi dan beat, sehingga tidak ada kode sumber yang ditambal. Tulis spesifikasi di `docs/kontrak-komposisi-v2.md`, buat satu komposisi contoh, dan dukung v1 dan v2 berdampingan (deteksi lewat atribut di stage).
- **Selesai bila**: langkah 1 dan 2 selesai; langkah 3 punya spesifikasi dan satu komposisi contoh yang dirender tanpa menyentuh JSX.

### P3-04 Parser `OM_SCENES` yang lebih tahan
- **Berkas**: `lib/komposisi.mjs` `RE_SCENES`.
- **Masalah**: pola lazy `[\s\S]*?` dan hack `replace(/\\"/g, '"')` rapuh terhadap `]` atau `;` di dalam string nama scene.
- **Langkah**: tulis pemindai karakter kecil yang mencari `OM_SCENES =`, membaca literal string berkutip dengan menangani escape, lalu `JSON.parse`; tes dengan nama scene berisi `]`, `;`, `\"`, dan unicode.
- **Selesai bila**: tes lulus untuk semua kasus tepi tanpa mengubah hasil pada semua komposisi di `proyek/` (tambahkan tes yang memuat setiap `proyek/*/src/*.html` yang tersedia dan membandingkan hasil parser lama vs baru).

### P3-05 Jangan menelan galat kecil
- **Langkah**: audit `catch {}` kosong di `lib/` dan `mcp/` (contoh: `playwright()` di `render.mjs`, `simpanStatus`, `segar`). Untuk tiap kasus putuskan: dilog dengan konteks, atau komentar yang menjelaskan mengapa aman diabaikan. Khusus `playwright()`: jika tidak ketemu, galat harus menyertakan jalur yang dicoba.
- **Selesai bila**: tidak ada `catch {}` tanpa komentar alasan.

### P3-06 Nama dan struktur
- **Langkah**: ekspor `BATAS` dan konstanta ambang audio ke satu berkas konfigurasi (`lib/konstanta.mjs`) dengan komentar sebab. Pecah `lib/pipa.mjs` (453 baris) per tahap (`vo.mjs`, `sfx.mjs`, `musik.mjs`) setelah tes P0-01 ada. Tambahkan JSDoc `@typedef` untuk bentuk config (`Config`, `Scene`, `BarisVO`) agar editor dan agent bisa memeriksa tipe (`// @ts-check` + `tsc --noEmit` di CI tanpa migrasi ke TypeScript).
- **Selesai bila**: `tsc --noEmit --allowJs --checkJs` lulus atau daftar pengecualian eksplisit terdokumentasi.

---

## Fase 4: Operasional & observabilitas

### P4-01 Log terstruktur dan metrik
- **Langkah**: ganti `console.log` di server dengan log JSON satu baris (`{t, level, uid, render, langkah, ms}`). Tambah endpoint `/metrik` (hanya dari localhost/jaringan internal) berformat Prometheus: durasi render per langkah, jumlah render selesai/gagal, panjang antrean, pemakaian disk `DATA`, jumlah akun aktif. Jangan mencatat teks naskah atau token.
- **Selesai bila**: grafik dasar (render sukses vs gagal, p95 durasi) bisa dibuat dari `/metrik`. Hubungkan ke stack monitoring yang sudah ada di VPS bila sesuai.

### P4-02 Healthcheck yang bermakna
- **Langkah**: `/sehat` juga memeriksa `ffmpeg -version`, keberadaan Chromium (`chromium.executablePath()`), dan ruang disk `DATA` > ambang (kembalikan 503 jika kurang). Pisahkan `/hidup` (proses jalan) dan `/siap` (siap menerima render).
- **Selesai bila**: disk hampir penuh membuat `/siap` 503 sebelum render gagal di tengah jalan.

### P4-03 Pembersihan disk yang lebih pintar
- **Berkas**: `mcp/proyek.mjs` `bersihkan`.
- **Langkah**: hapus dulu aset berat yang bisa dibuat ulang (folder `stem/`, `cuplikan/`, frame sisa di `os.tmpdir()` berpola `frames-*` yang yatim) setelah 24 jam, sebelum menghapus seluruh proyek di hari ke-14. Beri tahu lewat `info_proyek` berapa hari lagi proyek akan dihapus. Saat start, bersihkan `frames-*` dan `pk-*.m4a` yatim di `os.tmpdir()`.
- **Selesai bila**: pemakaian disk per proyek turun setelah render selesai dan folder tmp tidak menumpuk setelah crash.

### P4-04 Cadangan dan pemulihan
- **Langkah**: dokumentasikan dan skrip-kan cadangan volume `motion-data` (hanya `config.json`, `src/`, `meta.json`; aset audio bisa dibuat ulang tetapi VO berbayar, jadi sertakan `aset/vo`). Tes pemulihan sekali.
- **Selesai bila**: ada `docs/operasional.md` dengan prosedur cadangan, pemulihan, rotasi rahasia, dan deploy (rujuk skill `vps2`).

### P4-05 Versi API dan changelog
- **Langkah**: `buatServer` mengirim `version: '1.0.0'` statis. Ambil dari `package.json`, naikkan versi saat skema `Config` berubah, dan buat `CHANGELOG.md`. Tambahkan field `versiSkema` di `config.json` agar migrasi config lama bisa dilakukan.
- **Selesai bila**: perubahan skema yang tidak kompatibel menaikkan versi mayor dan ada migrasi untuk config lama.

---

## Fase 5: Audio, musik, dan pemeriksaan

> **Wajib**: baca `lib/mix.mjs`, `lib/periksa.mjs`, `lib/el.mjs`, `lib/stok.mjs`, `lib/lafal.mjs` sebelum mengerjakan tugas di fase ini. Audit awal belum menyentuhnya.

### P5-01 Tes audio sintetis
- **Langkah**: bangkitkan sumber uji dengan ffmpeg (`sine`, `anoisesrc`, hening) dan jalankan `Pipa.mix` pada config mini. Assert: LUFS akhir dalam ±0,5 dari -14, true peak ≤ -1,2 dBTP, tidak ada bus yang mati (cek `asetpts` sesudah `amix`, kasus bus SFX yang dulu mati dari detik lima), mix yang tak konvergen melempar galat.
- **Selesai bila**: tes berjalan < 60 detik di CI dan menangkap regresi tiap aturan di bagian mixer README.

### P5-02 Pembatasan biaya ElevenLabs
- **Langkah**: tambah `BIAYA_MAKS_USD` per perintah di CLI; sebelum `motion plan`/`sfx`/`music`, hitung perkiraan (kredit = karakter, durasi SFX/musik) dan minta konfirmasi bila di atas ambang, kecuali `--ya`. `motion all` mencetak estimasi di awal, bukan hanya laporan biaya di akhir. Catat realisasi biaya per proyek ke `proyek/<nama>/biaya.json` agar tren terlihat.
- **Selesai bila**: percobaan generasi ulang tak sengaja (mis. 85 baris VO) tidak berjalan tanpa konfirmasi.

### P5-03 Cadangan model dan ketahanan API
- **Berkas**: `lib/el.mjs` (cek retry saat ini: ada backoff `2500 * i`).
- **Langkah**: bedakan galat yang boleh diulang (429, 5xx, timeout) dari yang tidak (401, 422, kuota habis); jangan mengulang yang kedua. Hormati `Retry-After`. Pesan galat harus menyebut baris VO mana yang gagal. Ketika kuota habis, hentikan seluruh rantai dengan pesan sebab, bukan kegagalan beruntun.
- **Selesai bila**: tes dengan server tiruan menunjukkan perilaku di atas.

### P5-04 Deteksi musik berlubang otomatis
- **Konteks**: IKLAN.md mencatat banyak kasus bed berlubang (intro "sparse", breakdown di batas bagian). `motion check` sudah mendeteksi lubang setelah render.
- **Langkah**: jalankan pemeriksaan yang sama **segera setelah `motion music`** (sebelum mix dan render), bandingkan level per jendela 1 detik terhadap median, dan laporkan jendela < median − 12 dB dengan saran ("regenerate bagian itu", "pakai `bgm-d`"). Cetak peta level singkat (sparkline teks).
- **Selesai bila**: lubang terdeteksi dalam detik, bukan setelah render beberapa menit.

### P5-05 Pemeriksaan visual otomatis
- **Langkah**: di `periksa`, ambil frame di tengah tiap baris VO dan di tiap batas scene, lalu cek teks terpotong/keluar stage (`getBoundingClientRect` vs stage) lewat Playwright, kapsi kosong, dan frame hitam. Laporkan sebagai peringatan dengan detiknya.
- **Selesai bila**: komposisi dengan kapsi yang melewati tepi stage dilaporkan oleh `motion check`.

---

## Fase 6: Fitur baru

Urut dari nilai/biaya terbaik. Tiap fitur harus ada tesnya dan satu paragraf di dokumentasi.

### P6-01 `motion doctor`
- Periksa prasyarat dalam satu perintah: versi Node, `ffmpeg`/`ffprobe` (versi dan encoder), Playwright + Chromium, variabel `.env` wajib, ruang disk, `TMPDIR`, `/tmp` tmpfs hampir penuh (kegagalan frame ±250 di README), akses ElevenLabs (panggilan ringan). Keluarkan daftar centang dengan saran perbaikan.
- **Selesai bila**: mesin baru bisa diperiksa tanpa membaca README.

### P6-02 Pratinjau cepat dan render parsial
- `motion render --dari=<detik> --sampai=<detik>` untuk memeriksa satu scene saja, termasuk audio terkait. Sekarang hanya ada `--frames=N` dari awal. Di MCP, parameter yang setara pada alat `render`.
- **Selesai bila**: scene ke-5 dari video 90 detik bisa dirender sendiri dalam sepersekian waktu penuh.

### P6-03 Render varian rasio dari satu config
- README sudah punya `--komposisi=<html>` untuk orientasi lain. Tambahkan `varian: [{komposisi, sampul, keluaran}]` di config dan `motion render --semua-varian` yang memakai audio yang sama, merender bergiliran, dan memverifikasi tiap varian (9:16, 16:9, 4:5, 1:1 yang dipakai Meta).
- **Selesai bila**: satu perintah menghasilkan empat MP4 + sampul dengan laporan gabungan.

### P6-04 Subtitle dan transkrip keluaran
- Tulis `.srt`/`.vtt` dari `VO_TIMING` + teks naskah (`bin/srt.mjs` sudah ada: baca dulu dan satukan), plus berkas teks naskah akhir. Tautan unduhnya ditambahkan ke hasil `status_render` di MCP (tambah `.srt` ke regex ekstensi di rute `/unduh`).
- **Selesai bila**: pelanggan mendapat MP4, sampul, dan SRT dari satu render.

### P6-05 Pustaka templat komposisi
- Kumpulkan pola yang berulang dari ±85 proyek di `proyek/` menjadi templat bertema (hook–masalah–solusi–CTA, testimoni, trailer, tutorial) dengan config contoh lengkap, SFX dari stok, dan kerangka musik berencana. `motion init --templat=<nama>` dan alat MCP `daftar_templat`/`pakai_templat`.
- **Selesai bila**: ada ≥ 3 templat yang dirender sukses di CI (versi pendek, `--frames=60`) sebagai tes asap.

### P6-06 Pencarian SFX yang lebih baik
- Saat ini pencarian mensyaratkan semua kata cocok. Tambahkan peringkat (kecocokan di `cocok untuk` > prompt > kategori), sinonim Indonesia–Inggris (`kasir`↔`cash register`, `klik`↔`click`), dan "mirip dengan <id>". Bila hasil kosong, sarankan kata terdekat. Baca `lib/stok.mjs` dulu.
- **Selesai bila**: 20 kueri uji yang ditulis tangan mengembalikan hasil relevan di tiga teratas.

### P6-07 Cache VO lintas proyek
- Kalimat standar (CTA, penutup domain, sapaan) sering diucapkan ulang oleh suara yang sama. Cache berkunci `{teks terlafal, voice, model, seed, parameter}` di direktori bersama (mis. `~/.motion/cache-vo/`) dan salin bila kuncinya sama. Hati-hati dengan konteks `sebelum`/`sesudah` di kunci yang sudah ada: kunci cache bersama harus memasukkannya juga, atau fitur ini hanya untuk baris tanpa konteks.
- **Selesai bila**: regenerasi kalimat yang sama di proyek lain tidak memanggil ElevenLabs, dan laporan biaya menampilkan penghematan.

### P6-08 Webhook dan notifikasi render
- Alat `render` menerima `webhook` (https, divalidasi dengan `hostPrivat`, ditandatangani HMAC) yang dipanggil saat `selesai`/`gagal`, supaya klien tidak perlu polling tiap 20 detik. Pertimbangkan juga notifikasi push di sisi bimp.
- **Selesai bila**: webhook uji menerima payload bertanda tangan dan URL privat ditolak.

### P6-09 Dasbor admin sederhana
- Halaman internal (dilindungi) yang menampilkan antrean, riwayat render, pemakaian disk per akun, dan tombol batalkan render. Alat MCP `batalkan_render` untuk pelanggan (kill proses anak dari P1-01).
- **Bergantung pada**: P1-01, P4-01.
- **Selesai bila**: render yang macet bisa dibatalkan tanpa restart container.

### P6-10 Impor Claude Design tanpa Chrome
- Prosedur sekarang bergantung pada tab Chrome yang login dan endpoint internal (`OmeletteService/ListFiles` & `GetFile`) yang bisa berubah tanpa pemberitahuan. Bungkus langkah-langkah di README jadi skrip tunggal `bin/impor-design.mjs` yang memakai Playwright dengan profil login, validasi hasil (hapus `data-omelette-injected`, cek `OM_SCENES`), dan galat jelas bila endpoint berubah. Pantau `DesignSync` agar bisa diganti bila `/design-login` sudah mendukung sesi non-interaktif.
- **Selesai bila**: impor dari tautan berjalan lewat satu perintah dan gagal dengan pesan bermakna saat respons endpoint tidak sesuai skema.

### P6-11 Mode kering (`--kering`)
- `motion plan --kering` dan `motion all --kering`: lakukan semua perhitungan (durasi, posisi, estimasi biaya, peringatan jangkar) tanpa memanggil ElevenLabs atau menulis ke komposisi. Cocok untuk agent yang ingin memeriksa dampak sebelum membakar kredit.
- **Selesai bila**: perintah ini tidak membuat berkas di luar `kerja/` dan tidak melakukan permintaan jaringan ke ElevenLabs (diuji dengan stub jaringan).

---

## Fase 7: Dokumentasi & kebersihan repo

### P7-01 Konversi `.docx` ke Markdown **[TERBUKTI]**
- **Masalah**: `README.md.docx`, `CLAUDE.md.docx`, `AGENTS.md.docx`, `IKLAN.md.docx`, dan dokumen di `docs/` tersimpan sebagai `.docx`; tidak bisa dibaca di diff/GitHub dan tidak otomatis dimuat oleh agent (`CLAUDE.md`/`AGENTS.md` hanya dikenali sebagai Markdown biasa).
- **Langkah**
  1. Konversi dengan `pandoc -f docx -t gfm --wrap=none` ke `README.md`, `CLAUDE.md`, `AGENTS.md`, `IKLAN.md`, `docs/**/*.md`. Periksa tabel dan blok kode secara manual; teks di dokumen asli memuat `&lt;` dan `&amp;` (sisa penyandian XML) yang harus dipulihkan ke `<` dan `&`.
  2. Simpan `.docx` asli di `docs/arsip/` (atau hapus setelah verifikasi), dan hapus `*.docx` dari `.dockerignore` bila sudah tidak relevan.
  3. Tambahkan `CLAUDE.md` yang ringkas (perintah, aturan "jangan melemahkan cek", peta berkas) agar agent langsung produktif.
- **Selesai bila**: `git diff` pada dokumen berbentuk teks dan semua tautan/tabel di README terbaca benar.

### P7-02 Dokumen arsitektur
- Tulis `docs/arsitektur.md` dengan diagram alur (ada `docs/diagrams/*.png` sebagai bahan), peta modul (`lib/*` per tahap), siapa memanggil siapa, dan di mana setiap cek berada. Sertakan tabel "gejala → penyebab → berkas" dari README (mis. "kapsi 0" → `geserKapsi`).
- **Selesai bila**: agent baru bisa menemukan berkas yang tepat untuk sebuah gejala tanpa membaca seluruh kode.

### P7-03 Kebersihan repo
- `proyek/claude-for-video/` masih untracked: putuskan commit konfigurasi (tanpa aset) atau abaikan. Tinjau apakah 284 berkas di `proyek/` perlu di repo yang sama dengan mesin (pertimbangkan repo/folder data terpisah, atau minimal `proyek/README.md` yang menjelaskan konvensi). Pastikan `.DS_Store` tidak ter-track (`git ls-files | grep DS_Store`). Konfirmasi `.env` tidak pernah masuk riwayat git (`git log --all -- .env`); bila pernah, rotasi kunci.
- **Selesai bila**: `git status` bersih setelah build lokal, dan hasil `git log --all -- .env` kosong atau kunci sudah dirotasi.

### P7-04 Pedoman kontribusi
- `CONTRIBUTING.md`: cara menjalankan tes, konvensi penamaan Indonesia vs istilah teknis Inggris, aturan "tulis sebab di komentar", cara menambah aturan IKLAN (sertakan sebab dan angka ukur), cara menambah SFX ke stok (`motion stok --bangun`).
- **Selesai bila**: kontributor baru dapat membuka PR pertama tanpa bertanya.

---

## Lampiran A: Urutan eksekusi yang disarankan

1. P0-03 → P0-01 → P0-02 (fondasi; perubahan kecil, risiko rendah)
2. P2-01, P3-01 (tambalan cepat, dampak langsung)
3. P1-01 → P1-02 → P1-03 (ketahanan; P1-01 adalah perubahan struktural terbesar, kerjakan dengan tes P0 sebagai jaring pengaman)
4. P1-04, P2-02, P2-03 (verifikasi dugaan sandbox dulu), P2-04
5. P2-05..P2-07, P3-02..P3-06
6. P4-*, P7-01 (dokumentasi bisa dikerjakan paralel sejak awal)
7. P5-* (setelah membaca berkas audio)
8. P6-* sesuai kebutuhan produk; mulai dari P6-01, P6-02, P6-11

## Lampiran B: Definisi selesai (berlaku untuk semua tugas)

- Perubahan perilaku punya tes yang gagal tanpa perubahan itu.
- `npm test` hijau; CI hijau setelah P0-02.
- Tidak ada cek/galat produksi yang dilemahkan; bila sebuah cek sengaja diubah, alasannya tertulis di komentar dan di PR.
- Dokumentasi yang terdampak (README, IKLAN, `mcp/PANDUAN.md`, `mcp/README.md`) diperbarui. `mcp/PANDUAN.md` adalah kontrak untuk Claude sebagai klien MCP, jadi perubahan skema `Config` di `mcp/alat.mjs` **wajib** disalin ke sana.
- Tidak ada rahasia di commit (`.env*` tetap diabaikan).
- Perubahan yang menyentuh server MCP diuji lokal dengan `MCP_DEV_TOKEN` (tanpa bimp) sebelum deploy ke VPS lewat skill `vps2`.
- Commit kecil, pesan menyebut ID tugas (mis. `P1-01: render di proses anak`).

## Lampiran C: Risiko dan hal yang tidak boleh dilupakan

- **Jangan mengubah durasi scene pada komposisi dengan array detik absolut** tanpa membaca peringatan `motion init`.
- **Cache yang dikunci ke waktu ubah/permintaan** (`segar`, `basi`) adalah pertahanan terhadap kesalahan senyap. Jangan menggantinya dengan "berkas ada".
- **Perubahan P1-01 mengubah tempat kerja render.** Pastikan `TMPDIR`, `WORKERS`, dan `MOTION_VIEWPORT` diwariskan ke proses anak, dan jangan mewariskan rahasia (lihat P2-03).
- **VPS dipakai bersama banyak project.** Setiap perubahan Docker/compose harus memperhitungkan batas sumber daya dan jangan mengganggu container tetangga.
- **Biaya ElevenLabs nyata.** Tes otomatis tidak boleh memanggil API sungguhan; gunakan stub.

## Catatan hasil (diisi agent saat mengerjakan)

| Tugas | Tanggal | Hasil verifikasi / keputusan | Commit |
|---|---|---|---|
| P2-03 (flag `--no-sandbox`?) | 4 Nov 2026 | `bubblewrap` memisahkan mount/PID, worker hanya menerima proyek aktif dan env allowlist; Chrome render + cuplik memakai `chromiumSandbox`. Uji runtime pascadeploy: `docs/isolasi-renderer.md`. `/tmp` sandbox diganti direktori kerja di volume (tmpfs berisiko OOM) di 467874f. | 1dcc7e9 |
| P3-03 | 4 Nov 2026 | Langkah 1--2 sudah ada; langkah 3: `docs/kontrak-komposisi-v2.md`, `K.kontrak()`, `Pipa.tulisTiming` (VO_TIMING + OM_CUES), `contoh/kontrak-v2` dirender penuh tanpa tambalan JSX (`test/kontrak-v2.test.mjs`). | 9e0bff6 |
| P3-04 | 4 Nov 2026 | Pemindai literal; dibandingkan dengan `vm` (nilai JS sebenarnya). Tes banding parser lama dilewati otomatis bila `proyek/*/src` tidak ada di mesin. | 9e0bff6 |
| P3-05 | 4 Nov 2026 | Temuan nyata: `lubang()` lolos palsu saat ffmpeg gagal; kini membawa `galat`. | 9e0bff6 |
| P3-06 | 4 Nov 2026 | `tsc --noEmit --allowJs --checkJs` lulus tanpa daftar pengecualian. | 9e0bff6 |
| P4-01..P4-03 | 4 Nov 2026 | Log JSON tanpa token/naskah/URL; `/metrik` Prometheus hanya alamat privat tanpa XFF; `/hidup`, `/siap`; retensi bertahap. Belum disambungkan ke stack monitoring VPS. | 467874f |
| P4-04, P4-05 | 4 Nov 2026 | `scripts/cadangan.sh` diuji pulih lokal (identik); uji di container VPS belum. Versi 1.1.0, `versiSkema` + migrasi. | 69050c1 |
| P7-01..P7-04 | 4 Nov 2026 | `.docx` dokumen repo dikonversi (pandoc tidak ada; konverter heuristik, diperiksa per berkas), `.docx` asli dihapus sesudah verifikasi (tersedia di riwayat git, commit a7dda09). Proyek lama (config tanpa aset/video) dihapus dari repo; tersedia di riwayat git. `.env` tidak pernah masuk riwayat (hanya contoh, tanpa nilai). | a7dda09 |
| P5-01 | 4 Nov 2026 | `test/mix.test.mjs` (±25 dtk): -14 LUFS ±0,5, AAC ≤ -1,3 dBTP, A/B bus SFX sesudah detik 5, gate, duck, bus kosong, galat tak konvergen. Diuji mutasi: membuang `asetpts` (bus SFX) dan `apad` (mix terpotong di akhir VO terakhir, 2,13 dari 8 dtk, LUFS tetap -14) sama-sama tertangkap. **Temuan**: mix tanpa cue SFX gagal `amix=inputs=0`; diperbaiki. | 838d9a0 |
| P5-02 | 4 Nov 2026 | `lib/biaya.mjs`; pemilihan aset memakai `rencanaVo`/`rencanaSfx`/`rencanaMusik` yang sama dengan tahap generate. Gerbang dipasang juga di `apply`, `mix`, `check` (semuanya memanggil `vo()`). Diuji CLI: 85 baris tanpa terminal → kode 1, 0 VO, 0 permintaan jaringan. Tarif musik 13,3 kredit/dtk dari satu titik ukur; SFX 40/dtk belum terukur — kalibrasi dari `biaya.json`. | (commit ini) |
| P5-03 | 4 Nov 2026 | Server tiruan lokal (`test/el.test.mjs`): 503→200, Retry-After detik/tanggal (maks 60 dtk), 401/403/422 tidak diulang, `quota_exceeded` (400/401) dan `insufficient_credits` (402) menghentikan rantai di baris itu, timeout diulang. | (commit ini) |
| P5-04 | 4 Nov 2026 | `musik.periksaBed` atas potongan yang dipakai (`lewati`/`mulai`/`fadeOut`), jendela 1 dtk, median − 12 dB, sparkline; trek `luar` dan trek yang lebih pendek dari video ikut dilaporkan. Dua trek bergantian dengan jeda sengaja tidak dituduh bolong. | (commit ini) |
| P5-05 | 4 Nov 2026 | `render.periksaVisual`; diuji end-to-end pada salinan `contoh/kontrak-v2` dengan kapsi tak terpatahkan: `motion check` melaporkan "867 px di luar stage" di 3,47 dtk; contoh asli 8 titik bersih. Teks hanya dicek di tengah VO/scene, bukan di batas scene (transisi). | (commit ini) |
| P6-01 | 5 Nov 2026 | `lib/doktor.mjs` + `motion doctor`. Cek memakai jalur yang sama dengan render (`muatPlaywright`, `OPSI_CHROMIUM` bersandbox, `encoderVideo`). 13 tes dengan mesin palsu + server tiruan ElevenLabs (satu percobaan, tanpa ulang); mutasi cek tmpfs dan `--luring` tertangkap. Tes menemukan ffprobe tidak diperiksa saat ffmpeg hilang; diperbaiki. Di mesin kerja: semua ✓ kecuali `.env` yang memang tidak ada. | (commit ini) |
| P2-04.4 (WebSocket lolos `page.route`?) | | | |
| P2-04.3 (rebinding bisa direproduksi?) | | | |
| | | | |
