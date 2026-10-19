// Konektor — Angka Hari Ini · Episode 3 (TANPA VO): autentikasi internasional Rp1.940,13.
// Sumber: rate card IDR Meta 1 Okt 2026. Pengirim dari luar negeri ke nomor Indonesia.
// Autentikasi lokal Rp356,65. Contoh 1.000 × Rp1.940,13 = Rp1.940.130. Tanpa pajak.
// Struktur dari ahi1-video.jsx lewat ahi2-video.jsx. Kartu ≤7 kata. Tanpa coretan.
// Safe zone 9x16: atas 269, bawah 672, sisi 65.

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
const K = { bg: '#0B1120', g: '#B1FF00', c: '#00FFFF', hi: '#FFFFFF', ink: '#EEF3FA', muted: '#98A2B3', surf: '#0E1628', red: '#ef4444', redSoft: '#F87171', plate: '#0B1120' };
const ORDER = ['Hook', 'Lewat', 'Isotype', 'Arti', 'CTA'];
const c01 = v => Math.max(0, Math.min(1, v));
const lerp = (a, b, p) => a + (b - a) * p;
const MOTION = {
  enter: (t, s, d = 0.4) => Easing.easeOutCubic(c01((t - s) / d)),
  draw: (t, s, d = 0.5) => Easing.easeInOutCubic(c01((t - s) / d)),
  pop: (t, s, d = 0.35) => Easing.easeOutBack(c01((t - s) / d)),
  slam: (t, s, from = 1.6, d = 0.18) => lerp(from, 1, Easing.easeOutCubic(c01((t - s) / d))),
};
const centerAt = (x, y, s = 1, extra) => ({ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, ...extra });

const LAY = {
  '9x16': { W: 1080, H: 1920, art: { y: 269 } },
  '4x5': { W: 1080, H: 1350, art: { y: 186 } },
};

const HITS = [
  ['Hook', 0, 'p', 0.05], ['Hook', 0.55, 'p', 0.03], ['Hook', 1.7, 'p', 0.03],
  ['Lewat', 0.15, 'p', 0.04], ['Lewat', 1.75, 'r', 0.5], ['Lewat', 1.75, 's', 12], ['Lewat', 1.75, 'p', 0.06],
  ['Isotype', 0.15, 'p', 0.03], ['Isotype', 3.2, 'p', 0.04], ['Isotype', 3.2, 's', 8], ['Isotype', 4.4, 'p', 0.03],
  ['Arti', 0, 'f', 0.85], ['Arti', 0, 's', 26], ['Arti', 0, 'p', 0.12], ['Arti', 1.45, 'p', 0.06], ['Arti', 3.1, 'p', 0.03],
  ['CTA', 0, 'p', 0.04], ['CTA', 1.55, 'p', 0.03],
];

function KLogo({ icon = 52, text = 38, glow = 0 }) {
  const sc = icon / 370;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: icon * 0.26, whiteSpace: 'nowrap' }}>
      <div style={{ width: icon, height: icon, position: 'relative', flexShrink: 0, filter: glow ? `drop-shadow(0 0 ${glow}px rgba(177,255,0,.5))` : 'none' }}>
        <img src="brand/icon_gradient.svg" alt="Konektor" style={{ position: 'absolute', width: 800 * sc, height: 800 * sc, left: icon / 2 - 400 * sc, top: icon / 2 - 358 * sc, maxWidth: 'none' }} />
      </div>
      {text > 0 && <span style={{ fontSize: text, fontWeight: 700, letterSpacing: '-0.01em', color: K.hi, lineHeight: 1 }}>Konektor</span>}
    </div>
  );
}

function Card({ t, at, y, fs = 72, edge = 'rgba(255,255,255,.14)', shake = 0, children }) {
  const p = MOTION.enter(t, at, 0.2);
  return (
    <div style={centerAt(540 + shake, y, MOTION.slam(t, at, 1.12, 0.2), { opacity: t >= at ? 1 : 0, clipPath: `inset(0 ${100 - p * 100}% 0 0 round 26px)`, maxWidth: 950, boxSizing: 'border-box', padding: `${fs * 0.22}px ${fs * 0.46}px`, borderRadius: 26, background: K.plate, boxShadow: `inset 0 0 0 4px ${edge}`, fontSize: fs, fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.02em', color: K.hi, textAlign: 'center', textWrap: 'balance', width: 'max-content' })}>{children}</div>
  );
}

function MsgIco({ x, y, s = 1, o = 1 }) {
  return (
    <div style={centerAt(x, y, s, { opacity: o, width: 132, height: 86 })}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: K.red, boxShadow: `0 0 0 4px ${K.bg}, 0 0 14px ${K.red}66` }} />
      <div style={{ position: 'absolute', left: 20, bottom: -16, width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: `18px solid ${K.red}` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 800, color: K.hi }}>Rp</div>
    </div>
  );
}

function Piece({ format }) {
  const { T, CUES, authoredTotal, time } = useComposition();
  const L = LAY[format] || LAY['9x16'];
  const END = n => { const i = ORDER.indexOf(n); return i < ORDER.length - 1 ? CUES[ORDER[i + 1]] : authoredTotal; };
  const lt = n => T - CUES[n];
  const on = n => T >= CUES[n] && T < END(n);

  const LOOP_AT = authoredTotal - 0.4;
  const isLoop = T >= LOOP_AT;

  let flashW = 0, flashR = 0, punchA = 0, shakeA = 0;
  [...HITS.map(([n, t, k, a]) => [CUES[n] + t, k, a]), [LOOP_AT, 'f', 0.5]].forEach(([at, k, a]) => {
    const d = T - at; if (d < 0) return;
    if (k === 'f' && d < 0.18) flashW = Math.max(flashW, a * (1 - d / 0.18));
    if (k === 'r' && d < 0.4) flashR = Math.max(flashR, a * (1 - d / 0.4));
    if (k === 'p' && d < 0.35) punchA += a * (1 - Easing.easeOutCubic(d / 0.35));
    if (k === 's' && d < 0.4) shakeA = Math.max(shakeA, a * (1 - d / 0.4));
  });
  const shX = shakeA * Math.sin(T * 97), shY = shakeA * Math.cos(T * 83);
  const camT = `translate(${shX}px,${shY}px) scale(${1 + 0.006 * Math.sin(T * 0.7) + punchA})`;
  const beat = (T * 124 / 60) % 1;

  const tH = isLoop ? 1.2 : lt('Hook');
  const hookOn = on('Hook') || isLoop;
  const tL = lt('Lewat');
  const buzzL = tL >= 1.75 && tL < 2.4 ? 8 * (1 - (tL - 1.75) / 0.65) * Math.sin(T * 90) : 0;
  const tI = lt('Isotype');
  const icoAt = i => 0.7 + i * 0.12;
  const tA = lt('Arti');
  const tX = lt('CTA');
  const ctaO = on('CTA') && !isLoop ? 1 : 0;
  const pulse = 1 + 0.04 * Math.sin(Math.max(0, tX - 1.5) * Math.PI * 4);

  return (
    <div data-screen-label={`t=${Math.floor(time)}s`} style={{ position: 'absolute', inset: 0, background: K.bg, overflow: 'hidden', fontFamily: FONT, color: K.ink }}>
      <div style={{ position: 'absolute', inset: -60, backgroundImage: 'radial-gradient(rgba(152,162,179,0.14) 2px, transparent 2px)', backgroundSize: '44px 44px', transform: `translateY(${(T * 40) % 44}px)` }} />
      <div style={{ position: 'absolute', left: 540 - 700, top: L.art.y + 450 - 700, width: 1400, height: 1400, borderRadius: '50%', background: `radial-gradient(circle, ${on('Lewat') || on('Isotype') ? 'rgba(239,68,68,.16)' : 'rgba(177,255,0,.13)'} 0%, transparent 60%)`, opacity: 0.6 + 0.4 * (1 - beat) }} />

      <div style={{ position: 'absolute', left: 0, top: L.art.y, width: 1080, height: 979 }}>
        <div style={{ position: 'absolute', inset: 0, transformOrigin: '50% 50%', transform: camT }}>

          <div style={{ position: 'absolute', left: 65, top: 0, opacity: ctaO ? 0 : 1 }}><KLogo icon={60} text={42} /></div>
          <div style={{ position: 'absolute', right: 65, top: 4, opacity: ctaO ? 0 : 1, padding: '6px 18px', borderRadius: 12, background: K.g, color: K.bg, fontSize: 40, fontWeight: 800, letterSpacing: '0.02em' }}>ANGKA HARI INI</div>

          <div style={{ position: 'absolute', inset: 0, opacity: hookOn ? 1 : 0 }}>
            <div style={centerAt(540, 280, MOTION.slam(tH, 0, 1.25, 0.2), { fontSize: 108, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: K.g, textShadow: `0 0 70px ${K.g}66`, whiteSpace: 'nowrap' })}>Rp1.940,13</div>
            <Card t={tH} at={0.55} y={500} fs={64}>autentikasi <span style={{ color: K.g }}>internasional</span></Card>
            <div style={centerAt(540, 660, 1, { opacity: c01((tH - 1.7) / 0.1), padding: '10px 28px', borderRadius: 16, background: K.plate, boxShadow: 'inset 0 0 0 3px rgba(255,255,255,.16)', fontSize: 52, fontWeight: 800, color: K.hi, whiteSpace: 'nowrap' })}>ke nomor Indonesia</div>
            <div style={centerAt(540, 780, 1, { opacity: c01((tH - 1.7) / 0.1), fontSize: 34, fontWeight: 700, color: K.muted, whiteSpace: 'nowrap' })}>Tarif Meta, 1 Okt 2026</div>
          </div>

          <div style={{ position: 'absolute', inset: 0, opacity: on('Lewat') ? 1 : 0 }}>
            <Card t={tL} at={0.15} y={170} fs={64}>Pengirim dari <span style={{ color: K.c }}>luar negeri</span></Card>
            <div style={centerAt(540, 400, 1, { opacity: c01((tL - 0.2) / 0.1), fontSize: 40, fontWeight: 800, color: K.muted, whiteSpace: 'nowrap' })}>tarif lokal Rp356,65</div>
            <div style={centerAt(540 + buzzL, 640, MOTION.slam(tL, 1.75, 1.6, 0.18), { opacity: tL >= 1.75 ? 1 : 0, padding: '28px 48px', borderRadius: 32, background: K.plate, boxShadow: `inset 0 0 0 6px ${K.red}, 0 0 50px ${K.red}55`, textAlign: 'center' })}>
              <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, color: K.hi }}>Bukan tarif<br />lokal</div>
            </div>
          </div>

          <div style={{ position: 'absolute', inset: 0, opacity: on('Isotype') ? 1 : 0 }}>
            <Card t={tI} at={0.15} y={140} fs={64}>Contoh: <span style={{ color: K.c }}>1.000</span> pesan</Card>
            {Array.from({ length: 10 }).map((_, i) => {
              const cx = 190 + (i % 5) * 175;
              const cy = 360 + Math.floor(i / 5) * 160;
              return <MsgIco key={i} x={cx} y={cy} s={MOTION.pop(tI, icoAt(i), 0.28)} o={tI >= icoAt(i) ? 1 : 0} />;
            })}
            <div style={centerAt(540, 820, MOTION.pop(tI, 4.4, 0.3), { opacity: tI >= 4.4 ? 1 : 0, padding: '12px 28px', borderRadius: 16, background: K.plate, boxShadow: `inset 0 0 0 4px ${K.red}`, fontSize: 52, fontWeight: 800, color: K.redSoft, whiteSpace: 'nowrap' })}>semua kena tarif</div>
          </div>

          <div style={{ position: 'absolute', inset: 0, opacity: on('Arti') ? 1 : 0 }}>
            <div style={centerAt(540, 170, MOTION.slam(tA, 0, 1.5, 0.18), { fontSize: 64, fontWeight: 800, letterSpacing: '-0.03em', color: K.hi, whiteSpace: 'nowrap' })}>1.000 × Rp1.940,13</div>
            <div style={centerAt(540, 420, MOTION.slam(tA, 1.45, 1.8, 0.18), { opacity: tA >= 1.45 ? 1 : 0, rotate: '-3deg', padding: '18px 32px', borderRadius: 28, border: `8px solid ${K.bg}`, background: K.g, color: K.bg, fontSize: 80, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, whiteSpace: 'nowrap', boxShadow: `0 0 80px ${K.g}88` })}>Rp1.940.130</div>
            <Card t={tA} at={3.1} y={680} fs={60}>ke nomor <span style={{ color: K.g }}>Indonesia</span></Card>
          </div>

          <div style={{ position: 'absolute', inset: 0, opacity: ctaO }}>
            <div style={centerAt(540, 110, MOTION.slam(tX, 0, 1.45, 0.2))}><KLogo icon={130} text={96} glow={28} /></div>
            <Card t={tX} at={0.35} y={340} edge="rgba(177,255,0,.6)">Cek tarif dulu,<br /><span style={{ color: K.g }}>baru kirim</span></Card>
            <div style={centerAt(540, 620, pulse * MOTION.slam(tX, 1.55, 1.5, 0.16), { opacity: tX >= 1.55 ? 1 : 0, width: 560, height: 130, borderRadius: 26, background: K.g, color: K.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 800, whiteSpace: 'nowrap' })}>Coba gratis</div>
            <div style={centerAt(540, 800, MOTION.slam(tX, 2.05, 1.35), { opacity: tX >= 2.05 ? 1 : 0, fontSize: 72, fontWeight: 800, color: K.c })}>konektor.id</div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: K.red, opacity: flashR, pointerEvents: 'none', zIndex: 7 }} />
      <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', opacity: flashW, pointerEvents: 'none', zIndex: 7 }} />
    </div>
  );
}

function AHI3Video({ format }) {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS || { motionEditor: true });
  const fmt = LAY[format] ? format : '9x16';
  return (
    <React.Fragment>
      <CompositionStage width={LAY[fmt].W} height={LAY[fmt].H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={K.bg}>
        <Piece format={fmt} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Video" />
        <TweakToggle label="Motion editor" value={t.motionEditor} onChange={v => setTweak('motionEditor', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}
window.AHI3Video = AHI3Video;
