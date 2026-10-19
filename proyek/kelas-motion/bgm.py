"""Susun <hook>/aset/bgm.mp3 dari trek Suno dangdut "Wulan Muncul, Rame Sekali" (suno-mentah.mp3).

Trek 134,3 BPM, 1 bar = 1,786 detik (lihat proyek/kelas-ctwa-rahasia/bgm.py). Dua potong,
sambungan di kelipatan bar supaya ketukan tidak bergeser:

  1. [116,08, +3 bar)  -> video 0 .. 5,36   frame 0 langsung di drop: hentakan kendang penuh
  2. [98,22 - m bar, ...) -> sisanya        chorus bar 54 (98,22) pecah tepat di awal Daftar

Syaratnya awal Daftar jatuh di kelipatan bar. Kalau belum, skrip berhenti dan menyebut berapa
detik scene Cara harus dipanjangkan (di OM_SCENES .dc.html dan .asli-nya), lalu `plan` lagi.

Pakai: python3 bgm.py chat   (atau tanya)
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np

HERE = Path(__file__).parent
hook = sys.argv[1]
SR, DROP, CHORUS, BAR, K = 48000, 116.08, 98.22, 1.786, 3

t, C = 0.0, {}
for s in json.loads((HERE / hook / 'timeline.json').read_text()):
    C[s['name']] = t
    t += s['dur']
total, daftar = t, C['Daftar']
n = round(daftar / BAR)
if abs(n * BAR - daftar) > 0.06:
    n = int(np.ceil(daftar / BAR))
    sys.exit(f'Daftar mulai {daftar:.2f}s, bukan kelipatan bar. Panjangkan Cara {n * BAR - daftar:+.2f}s -> Daftar {n * BAR:.2f}s')

raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(HERE / 'suno-mentah.mp3'), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32).reshape(-1, 2)
a = lambda d, s: x[int(round(d * SR)):int(round(s * SR))]
s2 = CHORUS - (n - K) * BAR
p1, p2 = a(DROP, DROP + K * BAR), a(s2, s2 + total - K * BAR + 0.1)
c = int(0.03 * SR)
r = np.linspace(0, 1, c)[:, None]
y = np.concatenate([p1[:-c], p1[-c:] * np.sqrt(1 - r) + p2[:c] * np.sqrt(r), p2[c:]])[:int(total * SR)]
out = HERE / hook / 'aset' / 'bgm.mp3'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-b:a', '256k', str(out)],
               input=y.astype(np.float32).tobytes(), check=True)
print(f'{hook}: drop di 0 · sambung {K * BAR:.2f}s -> sumber {s2:.2f} · chorus pecah di {daftar:.2f}s (bar {n}) · {total:.2f}s')
