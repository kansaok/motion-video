# Isolasi renderer MCP

Setiap render dan cuplik dijalankan melalui `bubblewrap`, bukan langsung dari proses MCP.
Namespace itu memiliki `/proc` baru, `/tmp` kosong, kode serta runtime read-only, dan hanya
bind-mount direktori proyek aktif di bawah `/data/u/<uid>/<proyek>`. Environment pekerja adalah
allowlist; kunci BIMP, rahasia tautan unduh, dan token development tidak diteruskan.

`bubblewrap` adalah dependensi wajib image Docker. Tidak ada jalur fallback: jika namespace tidak
dapat dibuat, render gagal. Chromium juga dijalankan dengan `chromiumSandbox: true`; konfigurasi
Docker tidak boleh menambah `--no-sandbox`.

Sesudah deploy image baru, jalankan satu render uji dan, ketika proses pekerja masih hidup,
verifikasi dari host Docker:

```sh
ps -eo pid,args | grep '[c]hromium'
# Tidak boleh ada --no-sandbox.

# PID di namespace renderer hanya melihat proc miliknya sendiri, bukan PID server MCP.
nsenter -t <pid-pekerja> -m -p -- sh -c 'tr "\\0" "\\n" </proc/1/environ'
```

Output terakhir tidak boleh memuat `BIMP_SERVICE_KEY`, `UNDUH_RAHASIA`, maupun token lain.
Uji juga satu proyek akun A yang mencoba memuat `file:///data/u/<akun-B>/...`; ia harus gagal,
karena direktori akun B tidak ada dalam mount namespace renderer.
