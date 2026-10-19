// Bagian baru video panduan: pembuka, kartu judul bab, catatan bab, ringkasan, tips, penutup.
// Semua waktu scene-relatif (CUES.<Scene> + n). Offset catatan dibaca dari PLAN (jadwal.mjs).
const { useMemo: bUseMemo } = React;

const K = {
  navy: '#0B1120', navy2: '#0E1628', card: 'rgba(255,255,255,.06)', line: 'rgba(255,255,255,.12)',
  lime: '#B1FF00', cyan: '#00FFFF', white: '#FFFFFF', text: '#C7CFDC', muted: '#8B95A6',
  amber: '#FFB020', red: '#FF6B6B', blue: '#3B82F6', ink: '#0C1424', green: '#61D100',
};
const BFONT = "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif";
const bcl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const blerp = (a, b, p) => a + (b - a) * p;
const EZ = {
  enter: (T, a, d = 0.45) => Easing.easeOutCubic(bcl((T - a) / d)),
  move: (T, a, d = 0.8) => Easing.easeInOutCubic(bcl((T - a) / d)),
  pop: (T, a, d = 0.5) => Easing.easeOutBack(bcl((T - a) / d)),
};

function BIcon({ n, s = 24, c, style }) {
  const ic = (window.KICONS || {})[n];
  if (!ic) return <span style={{ width: s, height: s, display: 'inline-block', flexShrink: 0 }} />;
  return <svg width={s} height={s} viewBox={`0 0 ${ic.w} ${ic.h}`} style={Object.assign({ flexShrink: 0, display: 'block', color: c || 'currentColor' }, style)} dangerouslySetInnerHTML={{ __html: ic.b }} />;
}

function BLogo({ h = 48, color = '#fff', gap }) {
  // ikon di atas kotak putih supaya logo gradien tetap terbaca di latar navy
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: gap ?? h * 0.26 }}>
      <span style={{ width: h * 1.15, height: h * 1.15, borderRadius: h * 0.3, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 28px -10px rgba(0,0,0,.5)' }}>
        <img src="assets/icon_gradient.svg" style={{ width: h * 0.72, height: h * 0.72 }} />
      </span>
      <span style={{ fontSize: h * 0.86, fontWeight: 800, letterSpacing: '-0.03em', color, fontFamily: BFONT }}>Konektor</span>
    </div>
  );
}

function Dots({ T, bg = K.navy }) {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: bg }} />
      <div style={{ position: 'absolute', inset: -40, backgroundImage: 'radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px)', backgroundSize: '28px 28px', backgroundPosition: `${(T * 6) % 28}px 0px` }} />
    </>
  );
}

// scene visible window [from, to)
function Win({ from, to, children }) {
  const { T } = window.useComposition();
  const on = isFinite(from) && T >= from && T < to;
  return <div style={{ position: 'absolute', inset: 0, visibility: on ? 'visible' : 'hidden', fontFamily: BFONT }}>{children}</div>;
}

const flowDash = (T) => (T * 90) % 28;

/* ── Hook 1: hasil lebih dulu ── */
function HookHasil({ T }) {
  const card = EZ.pop(T, 0.8, 0.55), hi = EZ.enter(T, 2.0, 0.4), wa = EZ.pop(T, 4.5, 0.5), ln = EZ.enter(T, 4.9, 0.6), kt = EZ.pop(T, 5.3, 0.5);
  const fl = flowDash(T);
  return (
    <>
      <Dots T={T} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
        <BLogo h={100} />
        <div style={{ fontSize: 80, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', textAlign: 'center' }}>Panduan lengkap <span style={{ color: K.lime }}>Feedback CAPI</span></div>
        <div style={{ fontSize: 36, color: K.text, textAlign: 'center' }}>Dari chat WhatsApp sampai closing tercatat di Meta</div>
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: 'absolute', left: 0, top: 0 }}>
        {ln > 0.02 && <line x1="725" y1="700" x2={725 + 105 * ln} y2="700" stroke={K.lime} strokeWidth="6" strokeLinecap="round" strokeDasharray="4 14" strokeDashoffset={-fl} />}
        {ln > 0.02 && <line x1="1030" y1="700" x2={1030 + 105 * ln} y2="700" stroke={K.lime} strokeWidth="6" strokeLinecap="round" strokeDasharray="4 14" strokeDashoffset={-fl} />}
      </svg>
      <div style={{ position: 'absolute', left: 170, top: 700, transform: `translate(0,-50%) scale(${blerp(0.8, 1, wa)})`, opacity: wa, transformOrigin: 'left center', display: 'inline-flex', alignItems: 'center', gap: 16, background: '#fff', color: K.ink, borderRadius: 9999, padding: '20px 34px 20px 24px', fontSize: 34, fontWeight: 700, boxShadow: '0 16px 36px -10px rgba(0,0,0,.5)' }}>
        <BIcon n="simple-icons:whatsapp" s={44} c="#25D366" />Sudah transfer Rp 750.000
      </div>
      <div style={{ position: 'absolute', left: 880, top: 700, width: 150, height: 150, transform: `translate(-50%,-50%) scale(${blerp(0.7, 1, kt)})`, opacity: kt, borderRadius: 36, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px -12px rgba(0,0,0,.5)' }}>
        <img src="assets/icon_gradient.svg" style={{ width: 92, height: 92 }} />
      </div>
      <div style={{ position: 'absolute', left: 1175, top: 700, width: 600, transform: `translate(0,-50%) scale(${blerp(0.85, 1, card)})`, opacity: card, transformOrigin: 'left center', display: 'flex', alignItems: 'center', gap: 22, background: '#fff', color: K.ink, borderRadius: 28, padding: '26px 30px', boxShadow: `0 24px 50px -14px rgba(0,0,0,.55), 0 0 ${40 * hi}px ${6 * hi}px rgba(177,255,0,${0.35 * hi})` }}>
        <span style={{ width: 84, height: 84, borderRadius: 22, background: '#F0F2F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BIcon n="logos:meta-icon" s={52} /></span>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: 28, fontWeight: 700, color: '#5A6579' }}>Purchase · Meta</span>
          <span style={{ display: 'block', fontSize: 52, fontWeight: 800, letterSpacing: '-0.02em' }}>Rp 750.000</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: K.green, color: K.ink, borderRadius: 9999, padding: '10px 18px', fontSize: 24, fontWeight: 800 }}><BIcon n="lucide:circle-check" s={26} />Terkirim</span>
      </div>
    </>
  );
}

/* ── Hook 2: masalah ── */
function HookMasalah({ T }) {
  const meta = EZ.pop(T, 0.5, 0.5);
  const bk = EZ.move(T, 1.3, 0.9), bc = EZ.move(T, 2.4, 0.9), bz = EZ.pop(T, 3.7, 0.45);
  const a1 = EZ.enter(T, 1.2, 0.5);
  const c1 = EZ.pop(T, 5.4, 0.5), c2 = EZ.pop(T, 7.9, 0.5), strike = EZ.enter(T, 8.7, 0.4);
  const fl = flowDash(T);
  const base = 760;
  const Bar = ({ x, h, color, label, op = 1, dashed }) => (
    <>
      <div style={{ position: 'absolute', left: x, bottom: 1080 - base, width: 190, height: h, borderRadius: '14px 14px 0 0', background: dashed ? 'transparent' : color, border: dashed ? `4px dashed ${color}` : 'none', boxSizing: 'border-box', opacity: op }} />
      <div style={{ position: 'absolute', left: x - 20, top: base + 18, width: 230, textAlign: 'center', fontSize: 34, fontWeight: 700, color: '#fff', opacity: op }}>{label}</div>
    </>
  );
  return (
    <>
      <Dots T={T} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center', fontSize: 58, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', opacity: EZ.enter(T, 0.2, 0.5) }}>Iklan Meta belajar dari <span style={{ color: K.cyan }}>sinyal</span></div>
      <div style={{ position: 'absolute', left: 150, top: 330, width: 270, height: 270, transform: `scale(${blerp(0.8, 1, meta)})`, opacity: meta, borderRadius: 56, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, boxShadow: '0 20px 40px -12px rgba(0,0,0,.5)' }}>
        <BIcon n="logos:meta-icon" s={120} /><span style={{ fontSize: 34, fontWeight: 800, color: K.ink }}>Iklan Meta</span>
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: 'absolute', left: 0, top: 0 }}>
        <line x1="440" y1="465" x2={440 + 255 * a1} y2="465" stroke={K.lime} strokeWidth="6" strokeLinecap="round" strokeDasharray="4 14" strokeDashoffset={-fl} opacity={a1 > 0.02 ? 1 : 0} />
        <polygon points="695,449 725,465 695,481" fill={K.lime} opacity={a1 > 0.95 ? 1 : 0} />
        <rect x="745" y="250" width="610" height="595" rx="36" fill="none" stroke={K.lime} strokeWidth="4" strokeDasharray="16 12" strokeDashoffset={-fl / 2} opacity={a1} />
      </svg>
      <div style={{ position: 'absolute', left: 745 + 305, top: 215, transform: 'translateX(-50%)', opacity: a1, fontSize: 30, fontWeight: 800, color: K.lime, background: K.navy, padding: '0 16px', whiteSpace: 'nowrap' }}>belajar dari sini</div>
      <Bar x={780} h={400 * bk} color={K.blue} label="Klik" op={Math.max(0.0, bk)} />
      <Bar x={1080} h={270 * bc} color={K.cyan} label="Chat" op={Math.max(0.0, bc)} />
      <Bar x={1380} h={60 * bz} color={K.lime} label="Closing" op={bz} dashed />
      <div style={{ position: 'absolute', left: 1380 + 95, top: 560, transform: 'translateX(-50%)', opacity: bz, fontSize: 28, fontWeight: 700, color: K.red, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}><BIcon n="lucide:eye-off" s={30} />tidak terlihat</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 880, display: 'flex', justifyContent: 'center', gap: 36 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: K.blue, color: '#fff', borderRadius: 9999, padding: '16px 32px 16px 22px', fontSize: 36, fontWeight: 800, opacity: c1, transform: `scale(${blerp(0.85, 1, c1)})` }}><BIcon n="lucide:mouse-pointer-2" s={38} />Orang yang suka klik</span>
        <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 14, background: 'rgba(177,255,0,.14)', color: K.lime, border: `3px solid ${K.lime}`, borderRadius: 9999, padding: '13px 32px 13px 22px', fontSize: 36, fontWeight: 800, opacity: c2 * (1 - 0.45 * strike), transform: `scale(${blerp(0.85, 1, c2)})` }}><BIcon n="lucide:shopping-bag" s={38} />Orang yang beli</span>
      </div>
    </>
  );
}

/* ── Hook 3: janji ── */
const LANGKAH = [
  ['lucide:code-xml', 'Tracking'], ['lucide:link', 'Link WhatsApp'], ['lucide:megaphone', 'Iklan CTWA'],
  ['logos:meta-icon', 'Meta CAPI'], ['lucide:circle-check', 'Closing ke Meta'], ['lucide:workflow', 'Otomatis'],
];
function HookJanji({ T }) {
  const t1 = EZ.pop(T, 0.5, 0.6), t2 = EZ.enter(T, 2.0, 0.5), ban = EZ.pop(T, 10.9, 0.5);
  return (
    <>
      <Dots T={T} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', fontSize: 150, fontWeight: 800, letterSpacing: '-0.04em', color: K.lime, transform: `scale(${blerp(0.8, 1, t1)})`, opacity: t1 }}>Feedback CAPI</div>
        <div style={{ fontSize: 46, color: '#fff', fontWeight: 700, marginTop: 6, opacity: t2, transform: `translateY(${(1 - t2) * 20}px)` }}>Closing dikirim balik ke Meta</div>
      </div>
      <div style={{ position: 'absolute', left: 120, right: 120, top: 500, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 22 }}>
        {LANGKAH.map(([ic, lb], i) => {
          const q = EZ.pop(T, 7.6 + i * 0.55, 0.45);
          return (
            <div key={lb} style={{ opacity: q, transform: `translateY(${(1 - q) * 30}px) scale(${blerp(0.9, 1, q)})`, background: K.card, border: `2px solid ${K.line}`, borderRadius: 26, padding: '26px 14px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
              <span style={{ width: 48, height: 48, borderRadius: 24, background: K.lime, color: K.ink, fontSize: 28, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
              <BIcon n={ic} s={64} c="#fff" />
              <span style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{lb}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 860, display: 'flex', justifyContent: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 16, background: K.lime, color: K.ink, borderRadius: 9999, padding: '20px 40px 20px 28px', fontSize: 44, fontWeight: 800, opacity: ban, transform: `scale(${blerp(0.85, 1, ban)})`, boxShadow: '0 18px 40px -12px rgba(177,255,0,.35)' }}><BIcon n="lucide:circle-check" s={50} />Iklan belajar dari pembeli asli</span>
      </div>
    </>
  );
}

/* ── Kartu judul bab ── */
function KartuJudul({ T, k, judul, sub, label }) {
  const n = EZ.pop(T, 0.05, 0.4), tt = EZ.enter(T, 0.12, 0.35);
  return (
    <>
      <Dots T={T} bg={K.navy2} />
      <div style={{ position: 'absolute', left: 170, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontSize: 380, fontWeight: 800, letterSpacing: '-0.05em', color: K.lime, transform: `scale(${blerp(0.8, 1, n)})`, transformOrigin: 'left center', opacity: n }}>{k}</div>
      <div style={{ position: 'absolute', left: 560, right: 140, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, opacity: tt, transform: `translateX(${(1 - tt) * 60}px)` }}>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '0.14em', color: K.cyan }}>{label}</div>
        <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.05 }}>{judul}</div>
        <div style={{ fontSize: 40, color: K.text }}>{sub}</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 110, display: 'flex', justifyContent: 'center', gap: 16 }}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => <span key={i} style={{ width: i === k ? 56 : 16, height: 16, borderRadius: 8, background: i === k ? K.lime : i < k ? 'rgba(177,255,0,.45)' : 'rgba(255,255,255,.2)' }} />)}
      </div>
    </>
  );
}

/* ── Catatan bab: kenapa, salah umum, cek ── */
const WARNA = [K.cyan, K.amber, K.lime];
const IKON = ['lucide:target', 'lucide:triangle-alert', 'lucide:circle-check'];
function Catatan({ T, bab }) {
  const off = bab.off;
  const t = off.map((o) => o - 0.1);
  const q = t.map((x) => EZ.pop(T, x, 0.5));
  const aktif = T < t[1] ? 0 : T < t[2] ? 1 : 2;
  const pos = [200, 450, 700];
  return (
    <>
      <Dots T={T} />
      <div style={{ position: 'absolute', left: 120, top: 60, display: 'flex', alignItems: 'center', gap: 22, opacity: EZ.enter(T, 0, 0.4) }}>
        <span style={{ width: 70, height: 70, borderRadius: 35, background: K.lime, color: K.ink, fontSize: 40, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{bab.k}</span>
        <span style={{ fontSize: 40, fontWeight: 800, color: '#fff' }}>{bab.judul}</span>
      </div>
      {bab.catatan.map((c, i) => (
        <div key={'g' + i} style={{ position: 'absolute', left: 120, right: 120, top: pos[i], height: 220, boxSizing: 'border-box', border: `3px dashed ${K.line}`, borderRadius: 32, opacity: 1 - q[i], display: 'flex', alignItems: 'center', padding: '0 44px' }}>
          <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '0.14em', color: 'rgba(255,255,255,.22)', textTransform: 'uppercase' }}>{c.tag}</span>
        </div>
      ))}
      {bab.catatan.map((c, i) => (
        <div key={i} style={{ position: 'absolute', left: 120, right: 120, top: pos[i], height: 220, boxSizing: 'border-box', opacity: q[i], transform: `translateY(${(1 - q[i]) * 40}px)`, background: K.card, border: `3px solid ${i === aktif ? WARNA[i] : K.line}`, borderRadius: 32, display: 'flex', alignItems: 'center', gap: 36, padding: '0 44px', boxShadow: i === aktif ? `0 0 50px -10px ${WARNA[i]}66` : 'none' }}>
          <span style={{ width: 112, height: 112, borderRadius: 56, background: `${WARNA[i]}22`, border: `3px solid ${WARNA[i]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><BIcon n={IKON[i]} s={58} c={WARNA[i]} /></span>
          <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '0.14em', color: WARNA[i], textTransform: 'uppercase' }}>{c.tag}</span>
            {c.salah ? (
              <>
                <span style={{ fontSize: 36, fontWeight: 600, color: K.red, textDecoration: 'line-through', textDecorationThickness: 3 }}>{c.salah}</span>
                <span style={{ fontSize: 46, fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>{c.benar}</span>
              </>
            ) : (
              <span style={{ fontSize: 46, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{c.tampil}</span>
            )}
          </span>
        </div>
      ))}
    </>
  );
}

/* ── Ringkasan, tips, penutup ── */
const RINGKAS = [
  ['lucide:code-xml', 'Pasang tracking'], ['lucide:link', 'Buat link WhatsApp'], ['lucide:megaphone', 'Jalankan iklan CTWA'],
  ['logos:meta-icon', 'Sambungkan Meta'], ['lucide:circle-check', 'Kirim closing ke Meta'], ['lucide:workflow', 'Otomatiskan'],
];
function Ringkas({ T }) {
  return (
    <>
      <Dots T={T} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center', fontSize: 70, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', opacity: EZ.enter(T, 0.1, 0.5) }}><span style={{ color: K.lime }}>Feedback CAPI</span>, ringkasnya</div>
      <div style={{ position: 'absolute', left: 150, right: 150, top: 270, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {RINGKAS.map(([ic, lb], i) => {
          const q = EZ.pop(T, 2.5 + i * 1.15, 0.45), tick = EZ.pop(T, 2.85 + i * 1.15, 0.4);
          return (
            <div key={lb} style={{ position: 'relative', height: 150 }}>
            <div style={{ position: 'absolute', inset: 0, border: `3px dashed ${K.line}`, borderRadius: 28, boxSizing: 'border-box', opacity: 1 - q, display: 'flex', alignItems: 'center', padding: '0 30px' }}>
              <span style={{ width: 56, height: 56, borderRadius: 28, border: `3px solid ${K.line}`, boxSizing: 'border-box', color: 'rgba(255,255,255,.22)', fontSize: 30, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
            </div>
            <div style={{ opacity: q, transform: `translateY(${(1 - q) * 30}px)`, background: K.card, border: `2px solid ${K.line}`, borderRadius: 28, height: 150, display: 'flex', alignItems: 'center', gap: 24, padding: '0 30px' }}>
              <span style={{ width: 56, height: 56, borderRadius: 28, background: K.lime, color: K.ink, fontSize: 32, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
              <BIcon n={ic} s={58} c="#fff" />
              <span style={{ flex: 1, fontSize: 40, fontWeight: 700, color: '#fff' }}>{lb}</span>
              <span style={{ transform: `scale(${tick})`, opacity: tick, display: 'flex' }}><BIcon n="lucide:circle-check" s={52} c={K.green} /></span>
            </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

const TIPS = [
  ['Buktikan event nyata dulu', 'Baru tambah platform iklan.'],
  ['Pakai nomor yang sama', 'Nomor di iklan sama dengan nomor yang terhubung.'],
  ['Isi nilai setiap closing', 'Iklanmu belajar dari angka asli.'],
];
function TipsScene({ T, off }) {
  const pos = [250, 480, 710];
  return (
    <>
      <Dots T={T} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center', fontSize: 70, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', opacity: EZ.enter(T, 0.1, 0.5) }}>Tiga tips <span style={{ color: K.lime }}>penting</span></div>
      {TIPS.map(([a, b], i) => {
        const q = EZ.pop(T, off[i] - 0.1, 0.5);
        return (
          <React.Fragment key={a}>
          <div style={{ position: 'absolute', left: 190, right: 190, top: pos[i], height: 190, boxSizing: 'border-box', border: `3px dashed ${K.line}`, borderRadius: 32, opacity: 1 - q, display: 'flex', alignItems: 'center', padding: '0 44px' }}>
            <span style={{ width: 96, height: 96, borderRadius: 48, border: `3px solid ${K.line}`, boxSizing: 'border-box', color: 'rgba(255,255,255,.22)', fontSize: 56, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
          </div>
          <div style={{ position: 'absolute', left: 190, right: 190, top: pos[i], height: 190, opacity: q, transform: `translateY(${(1 - q) * 40}px)`, background: K.card, border: `3px solid ${K.line}`, borderRadius: 32, display: 'flex', alignItems: 'center', gap: 36, padding: '0 44px' }}>
            <span style={{ width: 96, height: 96, borderRadius: 48, background: K.lime, color: K.ink, fontSize: 60, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 52, fontWeight: 800, color: '#fff' }}>{a}</span>
              <span style={{ fontSize: 34, color: K.text }}>{b}</span>
            </span>
          </div>
          </React.Fragment>
        );
      })}
    </>
  );
}

function Penutup({ T }) {
  const lg = EZ.pop(T, 0.15, 0.6), t1 = EZ.enter(T, 0.6, 0.5), pill = EZ.pop(T, 1.0, 0.5);
  return (
    <>
      <Dots T={T} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
        <div style={{ transform: `scale(${blerp(0.85, 1, lg)})`, opacity: lg }}><BLogo h={140} /></div>
        <div style={{ fontSize: 44, color: K.text, opacity: t1, textAlign: 'center' }}>Feedback CAPI: closing kembali ke Meta, iklan belajar dari pembeli asli.</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 18, background: '#fff', color: K.ink, borderRadius: 9999, padding: '24px 46px', fontSize: 48, fontWeight: 800, opacity: pill, transform: `scale(${blerp(0.85, 1, pill)})` }}><BIcon n="lucide:book-open" s={50} c="#007AFF" />Panduan lengkap: konektor.id/docs</div>
      </div>
    </>
  );
}

/* ── Overlay: bilah progres + logo sudut ── */
function Overlay({ names }) {
  const { T, CUES, authoredTotal } = window.useComposition();
  const big = (CUES.Hasil <= T && T < CUES.Masalah) || T >= CUES.Cta;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, height: 6, width: `${bcl(T / authoredTotal) * 100}%`, background: K.lime, zIndex: 50 }} />
      <div style={{ position: 'absolute', left: 32, bottom: 36, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px 8px 10px', borderRadius: 16, background: 'rgba(12,20,36,.96)', boxShadow: '0 0 0 1px rgba(255,255,255,.08)', opacity: big ? 0 : 1, pointerEvents: 'none', zIndex: 40, fontFamily: BFONT }}>
        <img src="assets/icon_gradient.svg" style={{ width: 36, height: 36 }} />
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>Konektor</span>
      </div>
    </>
  );
}

window.BagianBaru = function BagianBaru() {
  const { T, CUES, authoredTotal } = window.useComposition();
  const P = window.PLAN, urut = P.urut;
  const rel = (n) => T - CUES[n];
  const akhir = (n) => { const i = urut.indexOf(n); return i + 1 < urut.length ? CUES[urut[i + 1]] : authoredTotal + 1; };
  const W = (n, children) => <Win key={n} from={CUES[n]} to={akhir(n)}>{children}</Win>;
  const out = [
    W('Hasil', <HookHasil T={rel('Hasil')} />),
    W('Masalah', <HookMasalah T={rel('Masalah')} />),
    W('Janji', <HookJanji T={rel('Janji')} />),
  ];
  for (const b of P.bab) {
    out.push(W(`J${b.k}`, <KartuJudul T={rel(`J${b.k}`)} k={b.k} judul={b.judul} sub={b.sub} label={`LANGKAH ${b.k} DARI 6`} />));
    out.push(W(`N${b.k}`, <Catatan T={rel(`N${b.k}`)} bab={b} />));
  }
  out.push(W('J7', <KartuJudul T={rel('J7')} k={7} judul="Ringkasan dan tips" sub="Tiga hal yang perlu diingat" label="PENUTUP" />));
  out.push(W('Ringkas', <Ringkas T={rel('Ringkas')} />));
  out.push(W('Tips', <TipsScene T={rel('Tips')} off={P.akhirOff} />));
  out.push(W('Cta', <Penutup T={rel('Cta')} />));
  return <>{out}<Overlay /></>;
};
