# Egress motion-mcp

Penjaga aplikasi menolak alamat privat saat mengunduh aset dan ketika Chromium merender
komposisi. Ini bukan pengganti firewall: operator VPS wajib memblokir egress container menuju
jaringan privat, metadata cloud (`169.254.169.254`), dan network Docker tetangga pada rantai
`DOCKER-USER`. Izinkan hanya DNS yang dipakai serta HTTP/HTTPS publik yang diperlukan.

Aturan spesifik bergantung pada interface dan network VPS. Uji dari dalam container bahwa
`curl` ke alamat metadata dan API internal gagal, sedangkan CDN aset publik tetap dapat diakses.
