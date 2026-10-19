// Konektor — Hari 11: skor EMQ. Hash email dan nomor, bukan janji "dari 5 ke 8".
// Dua format (9x16 / 4x5). Ditulis tanpa Claude Design, struktur dari hari7-video.jsx / hari10-video.jsx.
// Framework HABIS mode SYARAT. Sumber: content/docs.id/platform-guides/meta-emq.md.
// Label UI: lead_form.label.email "Email", wa_sessions.table.phone "Nomor Telepon",
// contoh format wa_sessions.toast.invalid_phone "62812345678".
// Status dokumen: Poor (Buruk), Good/Great (Bagus). Kolom Meta: Event Match Quality.
// Semua koreografi relatif ke awal scene. Durasi scene hanya di OM_SCENES.

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";
const K = { bg: '#0B1120', g: '#B1FF00', c: '#00FFFF', hi: '#FFFFFF', ink: '#EEF3FA', text: '#C7CFDC', muted: '#98A2B3', surf: '#0E1628', elev: '#131C31', acc: '#172038', border: 'rgba(255,255,255,.08)', borderAcc: 'rgba(255,255,255,.12)', red: '#ef4444', redSoft: '#F87171', rib: 'rgba(11,17,32,.92)', r: 15 };
const ORDER = ['Hook', 'Celah', 'Bukti', 'Belokan', 'Inti', 'Langkah1', 'Langkah2', 'Langkah3', 'CTA'];
const c01 = v => Math.max(0, Math.min(1, v));
const lerp = (a, b, p) => a + (b - a) * p;
const MOTION = {
  enter: (t, s, d = 0.5) => Easing.easeOutCubic(c01((t - s) / d)),
  draw: (t, s, d = 0.6) => Easing.easeInOutCubic(c01((t - s) / d)),
  pop: (t, s, d = 0.45) => Easing.easeOutBack(c01((t - s) / d)),
  slam: (t, s, from = 1.8, d = 0.2) => lerp(from, 1, Easing.easeOutCubic(c01((t - s) / d))),
};
const abs = (x, y, w, h, extra) => ({ position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', ...extra });
const centerAt = (x, y, s = 1, extra) => ({ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, ...extra });

const LAY = {
  '9x16': { W: 1080, H: 1920, art: { x: 0, y: 290, s: 1 }, cap: { x: 60, y: 1400, w: 960, h: 380, fs: 52, align: 'center' }, logo: { x: 48, y: 290 } },
  '4x5': { W: 1080, H: 1350, art: { x: 118.8, y: 195, s: 0.78 }, cap: { x: 60, y: 1020, w: 960, h: 280, fs: 42, align: 'center' }, logo: { x: 30, y: 195 } },
};

const HITS = [
  ['Hook', 0.2, 'p', 0.06], ['Hook', 0.7, 'p', 0.05], ['Hook', 2.4, 'r', 0.55], ['Hook', 2.4, 's', 10],
  ['Celah', 0.12, 'p', 0.05], ['Celah', 0.9, 'p', 0.04],
  ['Bukti', 0.2, 'p', 0.04], ['Bukti', 2.55, 'p', 0.05],
  ['Belokan', 0.1, 'r', 0.7], ['Belokan', 0.1, 's', 16], ['Belokan', 1.4, 'p', 0.05],
  ['Inti', 0.1, 'p', 0.05], ['Inti', 1.7, 'p', 0.07], ['Inti', 1.7, 's', 6],
  ['Langkah1', 0.1, 'p', 0.04], ['Langkah1', 1.4, 'p', 0.04],
  ['Langkah2', 0.1, 'p', 0.04], ['Langkah2', 1.8, 'p', 0.05],
  ['Langkah3', 0.1, 'f', 0.85], ['Langkah3', 0.1, 's', 24], ['Langkah3', 0.1, 'p', 0.12], ['Langkah3', 1.9, 'p', 0.05],
  ['CTA', 0.1, 'p', 0.04], ['CTA', 0.55, 'p', 0.03],
];

function KLogo({ icon = 52, text = 38, glow = 0, color = K.hi }) {
  const sc = icon / 370;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: icon * 0.26, whiteSpace: 'nowrap' }}>
      <div style={{ width: icon, height: icon, position: 'relative', flexShrink: 0, filter: glow ? `drop-shadow(0 0 ${glow}px rgba(177,255,0,.5))` : 'none' }}>
        <img src="brand/icon_gradient.svg" alt="Konektor" style={{ position: 'absolute', width: 800 * sc, height: 800 * sc, left: icon / 2 - 400 * sc, top: icon / 2 - 358 * sc, maxWidth: 'none' }} />
      </div>
      {text > 0 && <span style={{ fontSize: text, fontWeight: 700, letterSpacing: '-0.01em', color, lineHeight: 1 }}>Konektor</span>}
    </div>
  );
}

function Rib({ x, y, s = 1, fs = 84, color = K.hi, o = 1, rot = 0, edge, children }) {
  return <div style={centerAt(x, y, s, { opacity: o, rotate: `${rot}deg`, padding: `${fs * 0.14}px ${fs * 0.36}px`, borderRadius: 22, background: K.rib, boxShadow: `inset 0 0 0 3px ${edge || 'rgba(255,255,255,.1)'}, 0 20px 40px rgba(0,0,0,.45)`, fontSize: fs, fontWeight: 800, color, letterSpacing: '-0.02em', whiteSpace: 'nowrap', lineHeight: 1.05, textAlign: 'center' })}>{children}</div>;
}
function NumCard({ n, x, y, t, s = 120 }) {
  return <div style={centerAt(x, y, MOTION.slam(t, 0.05, 2, 0.2), { opacity: c01(t / 0.05), width: s, height: s, borderRadius: s * 0.2, background: K.g, color: K.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: s * 0.7, fontWeight: 800, lineHeight: 1, boxShadow: `0 0 40px ${K.g}66, 0 16px 30px rgba(0,0,0,.4)` })}>{n}</div>;
}

function Piece({ format, showCaps }) {
  const { T, CUES, authoredTotal, time } = useComposition();
  const L = LAY[format] || LAY['9x16'];
  const END = n => { const i = ORDER.indexOf(n); return i < ORDER.length - 1 ? CUES[ORDER[i + 1]] : authoredTotal; };
  const lt = n => T - CUES[n];
  const on = n => T >= CUES[n] && T < END(n);
  const grp = n => ({ position: 'absolute', inset: 0, opacity: on(n) ? 1 : 0, transform: `scale(${lerp(1.05, 1, MOTION.enter(lt(n), 0, 0.3))})`, transformOrigin: '50% 45%' });

  const caps = [
    { at: CUES.Hook + 0.05, text: 'Skor EMQ *naik ke 7!*' },
    { at: CUES.Hook + 2.35, text: 'Kecuali email dan nomor *kosong.*' },
    { at: CUES.Celah + 0.05, text: 'Meta cocokkan *hash.*' },
    { at: CUES.Bukti + 0.08, text: 'Kolomnya, *Event Match Quality.*' },
    { at: CUES.Bukti + 2.55, text: 'Skor *7 sampai 10* itu Good.' },
    { at: CUES.Belokan + 0.08, text: '*Tapi* tanpa Email dan Nomor Telepon, skornya *Poor!*' },
    { at: CUES.Inti + 0.08, text: 'Jadi, *kirim email dan nomor,* skornya naik.' },
    { at: CUES.Langkah1 + 0.08, text: 'Satu, minta *Email* dan *Nomor Telepon.*' },
    { at: CUES.Langkah2 + 0.08, text: 'Dua, nomor pakai *kode negara,* 628.' },
    { at: CUES.Langkah3 + 0.15, text: 'Tiga, cek kolom *Event Match Quality!*' },
    { at: CUES.CTA + 0.08, text: 'Coba gratis di *konektor.id*' },
    { at: CUES.CTA + 2.30, text: 'Soalnya skor EMQ naik' },
  ];
  let ci = 0; caps.forEach((c, i) => { if (T >= c.at) ci = i; });
  const capP = ci === 0 ? 1 : MOTION.enter(T, caps[ci].at, 0.2);

  const LOOP_AT = authoredTotal - 0.4;
  const isLoop = T >= LOOP_AT;

  let flashW = 0, flashR = 0, punchA = 0, shakeA = 0;
  const hitList = [...HITS.map(([n, t, k, a]) => [CUES[n] + t, k, a]), [LOOP_AT, 'f', 0.5], [LOOP_AT, 'p', 0.05]];
  hitList.forEach(([at, k, a]) => {
    const d = T - at; if (d < 0) return;
    if (k === 'f' && d < 0.18) flashW = Math.max(flashW, a * (1 - d / 0.18));
    if (k === 'r' && d < 0.4) flashR = Math.max(flashR, a * (1 - d / 0.4));
    if (k === 'p' && d < 0.35) punchA += a * (1 - Easing.easeOutCubic(d / 0.35));
    if (k === 's' && d < 0.4) shakeA = Math.max(shakeA, a * (1 - d / 0.4));
  });
  const shX = shakeA * Math.sin(T * 97), shY = shakeA * Math.cos(T * 83), shR = shakeA * 0.05 * Math.sin(T * 71);
  const beat = (T * 126 / 60) % 1;
  const cam = 1 + 0.008 * Math.sin(T * 0.7) + punchA;
  const camT = `translate(${shX}px,${shY}px) rotate(${shR}deg) scale(${cam})`;

  const tH = isLoop ? 0 : lt('Hook');
  const hookA = (on('Hook') && tH < 2.35) || isLoop;
  const hookB = on('Hook') && !isLoop && tH >= 2.35;
  const tC = lt('Celah');
  const tP = lt('Bukti');
  const tB = lt('Belokan');
  const jitB = on('Belokan') ? 3 * Math.sin(T * 55) : 0;
  const ulB = MOTION.draw(tB, 1.2, 0.35);
  const tI = lt('Inti');
  const t1 = lt('Langkah1');
  const t2 = lt('Langkah2');
  const filled = t2 >= 1.7;
  const t3 = lt('Langkah3');
  const done3 = t3 >= 1.7;
  const tX = lt('CTA');
  const ctaO = on('CTA') && !isLoop ? 1 : 0;
  const pulse = 1 + 0.04 * Math.sin(Math.max(0, tX) * Math.PI * 4);
  const rp = (Math.max(0, tX) % 0.476) / 0.476;

  const hiC = on('Belokan') ? K.redSoft : K.g;
  const capText = caps[ci].text.split('*').map((s, i) => <span key={i} style={{ color: i % 2 ? hiC : K.ink }}>{s}</span>);
  const stamp = (at, t) => MOTION.slam(t, at, 1.7, 0.16);

  return (
    <div data-screen-label={`t=${Math.floor(time)}s`} style={{ position: 'absolute', inset: 0, background: K.bg, overflow: 'hidden', fontFamily: FONT, color: K.ink }}>
      <div style={{ position: 'absolute', inset: -60, backgroundImage: 'radial-gradient(rgba(152,162,179,0.14) 2px, transparent 2px)', backgroundSize: '44px 44px', transform: `translateY(${(T * 40) % 44}px)` }} />
      <div style={{ position: 'absolute', left: L.art.x + 540 * L.art.s - 700, top: L.art.y + 420 * L.art.s - 700, width: 1400, height: 1400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(177,255,0,.12) 0%, transparent 60%)', opacity: 0.55 + 0.35 * (1 - beat) }} />

      <div style={{ position: 'absolute', left: L.logo.x, top: L.logo.y, zIndex: 5, padding: '10px 18px', borderRadius: 16, background: 'rgba(11,17,32,.85)', opacity: on('CTA') && !isLoop ? 0 : 1 }}><KLogo icon={46} text={32} /></div>

      <div style={{ position: 'absolute', left: L.art.x, top: L.art.y, width: 1080, height: 1080, transformOrigin: '0 0', transform: `scale(${L.art.s})` }}>
        <div style={{ position: 'absolute', inset: 0, transformOrigin: '50% 42%', transform: camT }}>

          <div style={{ position: 'absolute', inset: 0, opacity: hookA ? 1 : 0 }}>
            <div style={centerAt(540, 180, MOTION.slam(tH, 0.05, 1.5, 0.18), { textAlign: 'center', fontSize: 78, fontWeight: 800, color: K.hi, letterSpacing: '-0.03em', lineHeight: 1.02 })}>
              Skor EMQ<br /><span style={{ color: K.g }}>naik ke 7!</span>
            </div>
            <div style={centerAt(540, 560, stamp(0.55, tH), { opacity: c01((tH - 0.4) / 0.05), rotate: '-6deg', padding: '22px 36px', borderRadius: 24, background: K.g, color: K.bg, fontSize: 46, fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'center', lineHeight: 1.1 })}>Good/Great<br />(Bagus)</div>
          </div>

          <div style={{ position: 'absolute', inset: 0, opacity: hookB ? 1 : 0 }}>
            <Rib x={540} y={140} s={MOTION.slam(tH, 2.35, 1.7)} o={c01((tH - 2.35) / 0.04)} fs={46} edge={K.red}>KECUALI <span style={{ color: K.redSoft }}>KOSONG</span></Rib>
            <div style={abs(120, 280, 840, 320, { borderRadius: 28, background: K.surf, boxShadow: `inset 0 0 0 4px ${K.red}`, padding: '28px 36px', opacity: c01((tH - 2.5) / 0.08) })}>
              <div style={{ fontSize: 28, fontWeight: 700, color: K.muted }}>Email</div>
              <div style={{ marginTop: 8, height: 8, borderRadius: 4, background: K.red, width: '38%' }} />
              <div style={{ marginTop: 22, fontSize: 28, fontWeight: 700, color: K.muted }}>Nomor Telepon</div>
              <div style={{ marginTop: 8, height: 8, borderRadius: 4, background: K.red, width: '38%' }} />
              <div style={{ marginTop: 22, fontSize: 40, fontWeight: 800, color: K.redSoft }}>Poor (Buruk)</div>
            </div>
          </div>

          <div style={grp('Celah')}>
            <Rib x={540} y={150} s={MOTION.pop(tC, 0.05, 0.28)} fs={52}>HASH COCOK</Rib>
            <div style={abs(90, 300, 900, 230, { borderRadius: 28, background: K.surf, boxShadow: `inset 0 0 0 3px ${K.g}, 0 0 ${36 * c01(tC)}px ${K.g}55`, padding: '28px 36px', opacity: c01(tC / 0.08) })}>
              <div style={{ fontSize: 28, fontWeight: 700, color: K.muted }}>Event Match Quality</div>
              <div style={{ marginTop: 14, fontSize: 64, fontWeight: 800, color: K.g, letterSpacing: '-0.03em', lineHeight: 1, transform: `scale(${MOTION.slam(tC, 0.25, 1.2)})`, transformOrigin: '0 50%' }}>7–10</div>
            </div>
          </div>

          <div style={grp('Bukti')}>
            <div style={abs(80, 70, 920, 250, { borderRadius: 28, background: K.surf, boxShadow: `inset 0 0 0 3px ${K.g}`, padding: '24px 32px', opacity: c01(tP / 0.08) })}>
              <div style={{ fontSize: 28, fontWeight: 700, color: K.muted }}>Meta Events Manager</div>
              <div style={{ marginTop: 14, fontSize: 44, fontWeight: 800, lineHeight: 1.1 }}>Event Match Quality</div>
            </div>
            <div style={centerAt(540, 500, MOTION.pop(tP, 2.55, 0.35), { opacity: c01((tP - 2.45) / 0.08), width: 860, padding: '22px 28px', borderRadius: 24, background: K.elev, boxShadow: `inset 0 0 0 3px ${K.g}`, textAlign: 'center', fontSize: 42, fontWeight: 800 })}>
              <span style={{ color: K.g }}>7 sampai 10</span> · Good
            </div>
          </div>

          <div style={{ position: 'absolute', inset: 0, opacity: on('Belokan') ? 1 : 0 }}>
            <Rib x={540 + jitB} y={150} s={MOTION.slam(tB, 0.08, 2.1, 0.16)} o={c01((tB - 0.08) / 0.03)} fs={58} color={K.red} edge={K.red} rot={-2}>SKORNYA POOR</Rib>
            <div style={centerAt(540, 340, 1, { fontSize: 42, fontWeight: 800, color: K.hi, textAlign: 'center', lineHeight: 1.15 })}>
              Email dan Nomor Telepon<br />
              <span style={{ position: 'relative', color: K.redSoft }}>kosong
                <span style={{ position: 'absolute', left: 0, top: '112%', height: 8, borderRadius: 4, background: K.red, width: `${ulB * 100}%` }} />
              </span>
            </div>
            <div style={abs(140, 480, 800, 170, { borderRadius: 28, background: K.surf, boxShadow: `inset 0 0 0 4px ${K.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: c01((tB - 0.25) / 0.08) })}>
              <span style={{ fontSize: 48, fontWeight: 800, color: K.redSoft }}>Poor (Buruk)</span>
            </div>
          </div>

          <div style={grp('Inti')}>
            <div style={centerAt(540, 200, MOTION.slam(tI, 0.08, 1.35), { fontSize: 60, fontWeight: 800, color: K.hi, textAlign: 'center', letterSpacing: '-0.03em', lineHeight: 1.1 })}>Jadi, kirim email<br />dan nomor</div>
            <div style={centerAt(540, 500, MOTION.slam(tI, 1.6, 2, 0.18), { opacity: c01((tI - 1.55) / 0.04), rotate: '-4deg', padding: '22px 36px', borderRadius: 28, background: K.g, color: K.bg, fontSize: 56, fontWeight: 800, boxShadow: `0 0 70px ${K.g}88` })}>skornya naik</div>
          </div>

          <div style={grp('Langkah1')}>
            <NumCard n={1} x={110} y={120} t={t1} />
            <Rib x={660} y={120} s={MOTION.slam(t1, 0.12, 1.4)} o={c01((t1 - 0.08) / 0.05)} fs={36}>minta data</Rib>
            <div style={abs(80, 250, 920, 'auto', { borderRadius: 28, background: K.surf, boxShadow: `inset 0 0 0 3px ${t1 >= 1.3 ? K.g : K.borderAcc}`, padding: '28px 32px', opacity: c01((t1 - 0.12) / 0.1) })}>
              <div style={{ fontSize: 36, fontWeight: 800 }}>Email</div>
              <div style={{ marginTop: 18, fontSize: 36, fontWeight: 800 }}>Nomor Telepon</div>
            </div>
          </div>

          <div style={grp('Langkah2')}>
            <NumCard n={2} x={110} y={110} t={t2} />
            <Rib x={650} y={110} s={MOTION.slam(t2, 0.12, 1.4)} fs={36} o={c01((t2 - 0.08) / 0.05)}>kode negara</Rib>
            <div style={abs(80, 240, 920, 'auto', { borderRadius: 28, background: K.surf, boxShadow: `inset 0 0 0 3px ${filled ? K.g : K.borderAcc}`, padding: '26px 32px', opacity: c01((t2 - 0.12) / 0.1) })}>
              <div style={{ fontSize: 28, fontWeight: 700, color: K.muted }}>Nomor Telepon</div>
              <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 48, fontWeight: 800, color: filled ? K.c : K.muted }}>{filled ? '62812345678' : '628…'}</div>
            </div>
          </div>

          <div style={grp('Langkah3')}>
            <NumCard n={3} x={110} y={100} t={Math.max(0, t3)} />
            <div style={centerAt(680, 100, MOTION.slam(t3, 0.1, 1.7), { fontSize: 40, fontWeight: 800, color: K.g, whiteSpace: 'nowrap' })}>CEK KOLOM</div>
            <div style={abs(80, 210, 920, 'auto', { borderRadius: 28, background: K.surf, boxShadow: `inset 0 0 0 ${done3 ? 4 : 2}px ${done3 ? K.g : K.borderAcc}`, padding: '28px 32px', opacity: c01((t3 - 0.08) / 0.08) })}>
              <div style={{ fontSize: 28, fontWeight: 700, color: K.muted }}>Meta Events Manager</div>
              <div style={{ marginTop: 12, fontSize: 40, fontWeight: 800, lineHeight: 1.1 }}>Event Match Quality</div>
              <div style={{ marginTop: 18, display: 'inline-flex', padding: '12px 22px', borderRadius: 16, background: done3 ? K.g : K.acc, color: done3 ? K.bg : K.ink, fontSize: 36, fontWeight: 800, transform: `scale(${MOTION.pop(t3, 1.65, 0.3)})`, opacity: c01((t3 - 1.55) / 0.08) }}>Good/Great (Bagus)</div>
            </div>
          </div>

          <div style={{ position: 'absolute', inset: 0, opacity: ctaO, transform: `scale(${lerp(1.04, 1, MOTION.enter(tX, 0, 0.3))})` }}>
            <div style={centerAt(540, 200, MOTION.slam(tX, 0.05, 1.5, 0.2))}><KLogo icon={140} text={100} glow={28} /></div>
            <div style={centerAt(540, 460, 1 + 0.25 * rp, { width: 600, height: 130, borderRadius: 26, border: `5px solid ${K.g}`, opacity: 0.65 * (1 - rp) * c01((tX - 0.35) / 0.08) })} />
            <div style={centerAt(540, 460, pulse * MOTION.slam(tX, 0.4, 1.5, 0.16), { opacity: c01((tX - 0.35) / 0.04), width: 600, height: 130, borderRadius: 26, background: K.g, color: K.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, fontWeight: 800 })}>Coba gratis</div>
            <div style={centerAt(540, 660, MOTION.slam(tX, 0.9, 1.4), { opacity: c01((tX - 0.85) / 0.05), fontSize: 72, fontWeight: 800, color: K.c })}>konektor.id</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', inset: 0, background: K.red, opacity: flashR, pointerEvents: 'none', zIndex: 7 }} />
      <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', opacity: flashW, pointerEvents: 'none', zIndex: 7 }} />

      {showCaps && (
        <div style={{ position: 'absolute', zIndex: 6, left: L.cap.x, width: L.cap.w, top: L.cap.y, height: L.cap.h, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: capP, transform: `scale(${lerp(1.06, 1, capP)})`, transformOrigin: '50% 50%' }}>
          <div style={{ fontSize: L.cap.fs, fontWeight: 800, lineHeight: 1.18, textAlign: L.cap.align, textWrap: 'balance', letterSpacing: '-0.015em', padding: '16px 28px', borderRadius: 24, background: K.rib, boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.08)' }}>{capText}</div>
        </div>
      )}
    </div>
  );
}

function Hari11Video({ format }) {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS || { motionEditor: true, captions: true });
  const fmt = LAY[format] ? format : '9x16';
  return (
    <React.Fragment>
      <CompositionStage width={LAY[fmt].W} height={LAY[fmt].H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={K.bg}>
        <Piece format={fmt} showCaps={t.captions} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Video" />
        <TweakToggle label="Motion editor" value={t.motionEditor} onChange={v => setTweak('motionEditor', v)} />
        <TweakToggle label="Kapsi VO" value={t.captions} onChange={v => setTweak('captions', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}
window.Hari11Video = Hari11Video;
