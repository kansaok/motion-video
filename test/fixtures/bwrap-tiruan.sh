#!/bin/sh
# Meniru yang relevan dari bwrap bagi tes: --clearenv + --setenv, dan fd yang diwarisi (IPC = fd 3)
# diteruskan ke anak. Tidak membuat namespace; dipakai test/antrean.test.mjs agar IPC pekerja
# diuji dengan proses sungguhan. Sengaja bukan Node: proses Node akan membaca saluran IPC-nya
# sendiri dan mencuri pesan tugas.
E=""
while [ $# -gt 0 ]; do
  case "$1" in
    --die-with-parent|--new-session|--unshare-*|--clearenv) shift;;
    --cap-drop|--proc|--dev|--tmpfs|--dir|--chdir) shift 2;;
    --bind|--ro-bind) shift 3;;
    --setenv) v=$(printf '%s' "$3" | sed "s/'/'\\\\''/g"); E="$E '$2=$v'"; shift 3;;
    *) break;;
  esac
done
eval "exec env -i $E \"\$@\""
