"""Susun aset/suno.mp3 dari trek Suno mentah, dipatok ke timeline video.

Trek mentah 124,3 detik, 134,3 BPM (autokorelasi onset: 1 bar = 1,786 detik). Energi
bass per bar, dengan grid dipatok ke drop:

  bar 40-45   73,2-83,9    bagian penuh sesudah fill
  bar 48-53   87,5-98,2    bagian lebih tipis
  bar 54-62   98,2-114,3   chorus penuh
  bar 63     114,3-116,1   BREAK: bass hilang (-25,7 dB), satu-satunya yang sebersih ini
  bar 64     116,1         drop, lalu trek masuk outro

Dua potong, satu sambungan tepat 24 bar (116,08 -> 73,22, fase ketukan sama):

  1. [116,08 - Wulan, 116,08) -> video 0 .. Wulan. Hook dan Boncos di chorus penuh,
     break jatuh di akhir Bisik (bisikan terdengar), drop tepat saat Wulan muncul.
  2. [73,22, ...) -> sisa video. Journey penuh, penjelasan Clid/Feedback di bagian tipis,
     chorus masuk lagi di sekitar scene Kelas.

Ujung video mendarat di chorus yang sama dengan detik 0, jadi loop-nya menyambung.
Pakai: python3 bgm.py   (baca timeline.json; jalankan ulang tiap `plan` mengubah durasi)
"""
import json, re, subprocess
from pathlib import Path
import numpy as np

HERE = Path(__file__).parent
MENTAH, OUT = HERE / 'aset/suno-mentah.mp3', HERE / 'aset/suno.mp3'
SR, DROP, BAR = 48000, 116.08, 1.786
LANJUT = DROP - 24 * BAR   # 73,22: awal bagian penuh sesudah fill bar 39
SILANG = 0.03              # crossfade sambungan, detik


def scenes():
    f = HERE / 'timeline.json'
    if f.exists():
        return json.loads(f.read_text())
    # Sebelum `plan`: durasi dari komposisi, cukup untuk pratinjau.
    html = (HERE / 'src/Promo Kelas CTWA v4.dc.html').read_text()
    return json.loads(re.search(r"OM_SCENES = '(.*?)';", html).group(1))


t, C = 0.0, {}
for s in scenes():
    C[s['name']] = t
    t += s['dur']
total, D = t, C['Wulan']

raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(MENTAH), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32).reshape(-1, 2)
a = lambda d, s: x[int(round(d * SR)):int(round(s * SR))]
p1, p2 = a(DROP - D, DROP), a(LANJUT, LANJUT + total - D + 0.1)
c = int(SILANG * SR)
r = np.linspace(0, 1, c)[:, None]
# Crossfade pendek sama daya: sambungan tanpa klik, ketukan tidak bergeser.
y = np.concatenate([p1[:-c], p1[-c:] * np.sqrt(1 - r) + p2[:c] * np.sqrt(r), p2[c:]])[:int(total * SR)]
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-',
                '-b:a', '256k', str(OUT)], input=y.astype(np.float32).tobytes(), check=True)
print(f'Wulan {D:.2f}s · total {total:.2f}s · sumber {DROP - D:.2f}-{DROP:.2f} + {LANJUT:.2f}-{LANJUT + total - D:.2f}'
      f' · chorus masuk di video {D + 98.22 - LANJUT:.2f}s (Kelas {C["Kelas"]:.2f}s)')
print(f'{OUT.name} ✓ {len(y) / SR:.2f}s')
