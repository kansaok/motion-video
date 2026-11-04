"""BGM sintetis "dream future-pop" 120 BPM untuk Claude for Video (34 dtk, dipakai 0-30).

Connector ElevenLabs di sesi ini terbatas (tanpa musik) dan api.elevenlabs.io tidak terjangkau,
jadi trek disusun di sini, dipatok langsung ke batas scene (bar = 2 dtk):
  0-8    intro   pad + arp + kick ringan (hadir sejak ketukan pertama, tanpa fade in)
  8-14   groove  + clap, bass, hat lebih rapat
  14-17.55 build snare roll + riser + filter membuka
  17.55-18 hening (hanya ekor reverb) -> satu tukikan sebelum hentakan terbesar
  18-34  drop    supersaw ber-sidechain, 4-on-floor tertahan, lead pluck
Kick sengaja ditahan (IKLAN.md: kick tidak boleh memimpin). Pakai: python3 tools/bgm.py
"""
import subprocess, sys
from pathlib import Path
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
BPM = 120.0
BEAT = 60 / BPM
DUR = 34.0
N = int(DUR * SR)
rng = np.random.default_rng(11)
OUT = Path(__file__).resolve().parent.parent / 'aset' / 'bgm.mp3'

def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def lp(x, fc, o=2): return sosfilt(butter(o, fc, 'low', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return sosfilt(butter(o, fc, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)

def saw(freq, n, ph0=0.0):
    dt = freq / SR
    ph = (ph0 + np.cumsum(np.full(n, dt))) % 1.0
    y = 2 * ph - 1
    m1 = ph < dt; x = ph[m1] / dt; y[m1] -= x + x - x * x - 1
    m2 = ph > 1 - dt; x = (ph[m2] - 1) / dt; y[m2] -= x * x + x + x + 1
    return y

def env_adsr(n, a=0.01, d=0.1, s=0.8, r=0.2):
    t = np.arange(n) / SR; L = n / SR
    e = np.where(t < a, t / a, np.where(t < a + d, 1 - (1 - s) * (t - a) / d, s))
    rel = np.clip((L - t) / r, 0, 1)
    return e * rel

L = np.zeros((N, 2)); R_send = np.zeros((N, 2))   # dry, reverb send

def add(buf, x, start, pan=0.0, gain=1.0):
    i = int(start * SR)
    if i >= N: return
    x = x[: N - i]
    gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(x), 0] += x * gain * gl * 1.414
    buf[i:i + len(x), 1] += x * gain * gr * 1.414

# ---------- harmoni ----------
CH = [  # (pad voicing, bass root) per bar, siklus 4 bar: Fmaj7 - Cadd9 - Dm9 - Bbmaj7
    ([53, 57, 60, 64, 69], 41),
    ([52, 55, 60, 62, 67], 36),
    ([50, 53, 57, 60, 64], 38),
    ([50, 53, 57, 58, 65], 34),
]
BARS = int(np.ceil(DUR / (4 * BEAT)))
DROP, BUILD, HENING = 18.0, 14.0, 17.55

def seksi(t):
    if t < 8: return 'intro'
    if t < BUILD: return 'groove'
    if t < DROP: return 'build'
    return 'drop'

# ---------- pad supersaw ----------
DET = [-24, -14, -6, 0, 6, 14, 24]
for b in range(BARS):
    t0 = b * 4 * BEAT
    notes, root = CH[b % 4]
    n = int(4 * BEAT * SR) + int(0.4 * SR)
    sec = seksi(t0)
    for m in notes:
        for k, c in enumerate(DET):
            v = saw(mtof(m) * 2 ** (c / 1200), n, rng.random())
            pan = (k - 3) / 3 * 0.8
            fc = {'intro': 1500, 'groove': 2200, 'build': 2200, 'drop': 5200}[sec]
            v = lp(v, fc) * env_adsr(n, 0.04 if sec != 'drop' else 0.005, 0.3, 0.85, 0.35)
            g = (0.022 if sec != 'drop' else 0.03)
            add(L, v, t0, pan, g); add(R_send, v, t0, pan, g * 0.8)

# filter build: ganti sebagian pad build dengan sapuan noise+saw naik (riser)
nb = int((HENING - BUILD) * SR)
tt = np.arange(nb) / SR
riser_f = 200 * (2 ** (tt / (HENING - BUILD) * 3.2))
ph = np.cumsum(riser_f / SR) % 1
riser = (2 * ph - 1) * 0.5
noise = rng.standard_normal(nb)
sweep = np.zeros(nb)
seg = 2048
for i in range(0, nb, seg):
    fc = 400 + 7000 * (i / nb) ** 2
    sweep[i:i + seg] = bp(noise[i:i + seg] if i == 0 else noise[i:i + seg], fc * 0.6, min(fc * 1.6, 20000))
riser = lp(riser, 3000) * 0.10 + sweep * 0.12
riser *= (tt / tt[-1]) ** 1.6
add(L, riser, BUILD, 0, 1.0); add(R_send, riser, BUILD, 0, 0.6)

# ---------- arp pluck 1/16 ----------
for b in range(BARS):
    notes, _ = CH[b % 4]
    seq = [notes[i % len(notes)] + 12 for i in [0, 2, 4, 1, 3, 4, 2, 0]]
    for s16 in range(16):
        t = b * 4 * BEAT + s16 * BEAT / 4
        if t >= DUR or (HENING <= t < DROP): continue
        sec = seksi(t)
        if sec == 'build' and s16 % 2: continue
        m = seq[s16 % 8] + (12 if sec == 'drop' and s16 % 4 == 0 else 0)
        n = int(0.32 * SR)
        x = 0.6 * saw(mtof(m), n) + 0.4 * np.sign(np.sin(2 * np.pi * mtof(m) * np.arange(n) / SR))
        x = lp(x, 2600 if sec != 'drop' else 4200) * np.exp(-np.arange(n) / SR / 0.07)
        g = {'intro': .05, 'groove': .055, 'build': .05, 'drop': .045}[sec]
        pan = 0.35 * np.sin(s16 * 1.3)
        add(L, x, t, pan, g); add(R_send, x, t, pan, g * 1.2)
        # delay 3/16 ping-pong
        add(L, lp(x, 1800), t + 3 * BEAT / 4, -pan, g * .32)

# ---------- lead pluck di drop ----------
LEAD = [(0, 2), (0.75, 1), (1.5, 0), (2.5, 1), (3.0, 2), (3.5, 3)]
for b in range(int(DROP / (4 * BEAT)), BARS):
    notes, _ = CH[b % 4]
    top = sorted(notes)[-4:]
    for off, idx in LEAD:
        t = b * 4 * BEAT + off * BEAT
        if t >= DUR: continue
        m = top[idx % 4] + 12
        n = int(0.5 * SR)
        x = sum(saw(mtof(m) * 2 ** (c / 1200), n, rng.random()) for c in (-9, 0, 9)) / 3
        x = lp(x, 5000) * np.exp(-np.arange(n) / SR / 0.16)
        add(L, x, t, 0.0, 0.09); add(R_send, x, t, 0, 0.12)

# ---------- bass ----------
for b in range(BARS):
    _, root = CH[b % 4]
    for e8 in range(8):
        t = b * 4 * BEAT + e8 * BEAT / 2
        sec = seksi(t)
        if sec == 'intro' or HENING <= t < DROP or t >= DUR: continue
        if sec == 'build' and e8 % 2: continue
        n = int(BEAT / 2 * SR * 0.95)
        f = mtof(root)
        x = np.sin(2 * np.pi * f * np.arange(n) / SR) + 0.35 * lp(saw(f, n), 600)
        x *= env_adsr(n, 0.004, 0.08, 0.7, 0.04)
        add(L, hp(x, 40), t, 0, 0.10 if sec == 'drop' else 0.08)

# ---------- drum ----------
def kick():
    n = int(0.32 * SR); tt = np.arange(n) / SR
    f = 48 + 90 * np.exp(-tt / 0.03)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.11)
    x[:200] += rng.standard_normal(200) * 0.15
    return x
def clap():
    n = int(0.25 * SR); x = np.zeros(n)
    for k, o in enumerate([0, 0.011, 0.022]):
        i = int(o * SR); m = int(0.012 * SR)
        x[i:i + m] += rng.standard_normal(m) * (0.8 + 0.1 * k)
    tail = rng.standard_normal(n) * np.exp(-np.arange(n) / SR / 0.07) * 0.6
    return bp(x + tail, 900, 4200)
def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    return hp(rng.standard_normal(n), 7000, 4) * np.exp(-np.arange(n) / SR / (0.06 if open_ else 0.014))
def snare():
    n = int(0.12 * SR); tt = np.arange(n) / SR
    return (bp(rng.standard_normal(n), 1200, 7000) * 0.8 + np.sin(2 * np.pi * 190 * tt) * 0.5) * np.exp(-tt / 0.045)

K, CL, HC, HO, SN = kick(), clap(), hat(), hat(True), snare()
nbeats = int(DUR / BEAT)
for i in range(nbeats):
    t = i * BEAT; sec = seksi(t)
    if HENING <= t < DROP: continue
    if sec == 'intro':
        if i % 2 == 0: add(L, K, t, 0, 0.20)
        add(L, HC, t + BEAT / 2, 0.3, 0.06)
    elif sec == 'groove':
        add(L, K, t, 0, 0.22)
        if i % 2 == 1: add(L, CL, t, 0, 0.16); add(R_send, CL, t, 0, .12)
        add(L, HC, t + BEAT / 2, 0.3, 0.07); add(L, HC, t + BEAT / 4 * 3, -0.3, 0.035)
    elif sec == 'drop':
        add(L, K, t, 0, 0.26)
        if i % 2 == 1: add(L, CL, t, 0, 0.19); add(R_send, CL, t, 0, .15)
        add(L, HO, t + BEAT / 2, 0.25, 0.06)
        add(L, HC, t + BEAT / 4, -0.3, 0.03); add(L, HC, t + BEAT / 4 * 3, -0.3, 0.03)
# snare roll build: 8 -> 16 -> 32, crescendo
t = BUILD
while t < HENING - 0.01:
    k = (t - BUILD) / (HENING - BUILD)
    step = BEAT / 2 if k < 0.4 else (BEAT / 4 if k < 0.8 else BEAT / 8)
    add(L, SN, t, 0, 0.05 + 0.13 * k); add(R_send, SN, t, 0, 0.05)
    t += step

# ---------- sidechain di drop ----------
tt = np.arange(N) / SR
phase = (tt % BEAT)
duck = 1 - 0.55 * np.exp(-phase / 0.09)
duck = np.where(tt >= DROP, duck, 1 - 0.18 * np.exp(-phase / 0.08))
# hening sebelum drop: dry dimatikan (ekor reverb tetap)
gate = np.ones(N)
i0, i1 = int(HENING * SR), int(DROP * SR)
gate[i0:i1] = 0
fade_in_gate = int(0.012 * SR)
gate[i0 - fade_in_gate:i0] = np.linspace(1, 0, fade_in_gate)

# ---------- reverb ----------
irn = int(2.6 * SR)
ir_t = np.arange(irn) / SR
ir = np.stack([rng.standard_normal(irn), rng.standard_normal(irn)], 1) * np.exp(-ir_t / 0.75)[:, None]
ir[:, 0] = lp(ir[:, 0], 6000); ir[:, 1] = lp(ir[:, 1], 6000)
ir /= np.sqrt((ir ** 2).sum(0))
wet = np.stack([fftconvolve(R_send[:, c], ir[:, c])[:N] for c in range(2)], 1)
wet = hp(wet.T, 180).T if False else np.stack([hp(wet[:, c], 180) for c in range(2)], 1)

mix = L * (duck * gate)[:, None] + wet * 0.55 * duck[:, None]
mix = np.stack([hp(mix[:, c], 32) for c in range(2)], 1)
# glue ringan
peak = np.max(np.abs(mix))
mix = np.tanh(mix / peak * 1.6) / np.tanh(1.6) * 0.89
raw = mix.astype(np.float32).tobytes()
OUT.parent.mkdir(parents=True, exist_ok=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-',
                '-b:a', '256k', str(OUT)], input=raw, check=True)
print(f'bgm ✓ {OUT} {DUR}s')
