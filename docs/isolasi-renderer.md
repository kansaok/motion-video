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

## Prasyarat host Docker (ditemukan 5 Nov 2026)

`bwrap` di dalam container GAGAL pada konfigurasi bawaan Docker + Ubuntu 24.04: render mati 9 ms
dengan "pekerja render berhenti tanpa hasil (kode 1)" dan log `bwrap: No permissions to create new
namespace`. `/siap` tetap 200 karena tidak menjalankan render, jadi cek pasca-deploy WAJIB memuat
satu render uji. Diuji di vps2: `bwrap` hanya jalan bila keempatnya ada bersama.

| Lapisan | Pengaturan |
|---|---|
| Host | `kernel.apparmor_restrict_unprivileged_userns = 0` (`/etc/sysctl.d/60-motion-userns.conf`) |
| Container | `security_opt: [seccomp=unconfined, apparmor=unconfined, systempaths=unconfined]` |

Harganya: sysctl berlaku untuk seluruh host, dan container kehilangan filter syscall + profil
AppArmor Docker. Perbaikan lanjutan yang layak: profil seccomp khusus (bawaan Docker + syscall
namespace) menggantikan `seccomp=unconfined`. Kembalikan: sysctl ke 1, hapus `security_opt`.
