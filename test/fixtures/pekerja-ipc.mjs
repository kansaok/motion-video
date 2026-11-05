// Pekerja minimal: harus menerima tugas lewat IPC. Tanpa NODE_CHANNEL_FD, process.send tidak ada.
if (!process.send) { console.error('tanpa saluran IPC'); process.exit(0); }
process.once('message', (pesan) => { process.send({langkah: 'mix'}); process.send({hasil: {diterima: pesan.proyek}}); process.exit(0); });
