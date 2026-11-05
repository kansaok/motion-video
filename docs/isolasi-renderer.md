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
satu render uji.

Yang dipasang di vps2 (berkas di `scripts/vps2/`), diuji bertahap di container sementara:

| Lapisan | Pengaturan | Sebab |
|---|---|---|
| seccomp | `scripts/vps2/seccomp-motion.json` = bawaan Docker + `clone clone3 unshare setns mount umount2 pivot_root sethostname` tanpa syarat CAP_SYS_ADMIN | `unshare` dan `mount` bawaan hanya untuk CAP_SYS_ADMIN |
| AppArmor | `scripts/vps2/apparmor-motion-mcp` → `/etc/apparmor.d/motion-mcp` = docker-default + `userns`, `mount`, `umount`, `pivot_root`; larangan tulis `/proc/sys` dan `/sys` dipertahankan | izin `userns` per profil, jadi sysctl host tetap 1 |
| Container | `systempaths=unconfined` | `bwrap --proc /proc` memasang procfs baru; ditolak bila `/proc` ditutup Docker |
| Host | `kernel.apparmor_restrict_unprivileged_userns = 1` (bawaan Ubuntu) | tidak perlu dilonggarkan |

Galat yang muncul saat salah satu kurang (urutan diuji): `No permissions to create new namespace`
(seccomp/AppArmor), `Failed to make / slave` (systempaths), `Can't mount proc` (AppArmor),
`setting up uid map` (AppArmor unconfined + sysctl 1), `pivot_root: Permission denied` (aturan
`pivot_root` di profil). Mulanya kombinasi `seccomp=unconfined, apparmor=unconfined` + sysctl 0
berhasil, tetapi melonggarkan seluruh host; konfigurasi di atas menggantikannya.

Kembalikan ke tertutup penuh: hapus `security_opt` di override (render gagal lagi). Perbaikan
lanjutan yang lebih kuat: pisahkan renderer jadi container sendiri tanpa rahasia (tanpa `bwrap`).

## Saluran IPC melewati `--clearenv` (ditemukan 5 Nov 2026)

Setelah namespace berhasil, render tetap gagal: "pekerja render berhenti tanpa hasil (kode 0)" dalam
~140 ms. Sebabnya `--clearenv` membuang `NODE_CHANNEL_FD`, sehingga pekerja tidak punya
`process.send`, tidak pernah menerima tugas, dan keluar bersih. Sandbox P2-03 tak pernah merender sejak
ditulis; tesnya memakai proses tiruan. Kini `perintahPekerja` meneruskan `NODE_CHANNEL_FD=3` dan
`NODE_CHANNEL_SERIALIZATION_MODE=json`, dan `test/antrean.test.mjs` menjalankan proses sungguhan lewat
`test/fixtures/bwrap-tiruan.sh` (meniru `--clearenv`/`--setenv` dan fd warisan). Bukti dengan bwrap
asli di container produksi: tanpa perbaikan "TANPA IPC"; dengan perbaikan tugas diterima dan dibalas.
