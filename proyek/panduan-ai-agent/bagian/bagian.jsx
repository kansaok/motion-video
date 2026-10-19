// Bagian baru video panduan AI Agent: pembuka, penjelasan, kartu judul, catatan bab, biaya, ringkasan, penutup.
// Semua waktu scene-relatif. Waktu elemen mengikuti offset baris VO (PLAN.baru[scene][i].off), yang dihitung
// dari panjang audio di jadwal.mjs, jadi gambar dan suara tetap jatuh bersama.
// Data palsu saja: Toko Saya, Rina Wulandari, angka contoh.

const K = {
  navy: '#0B1120', navy2: '#0E1628', card: 'rgba(255,255,255,.06)', line: 'rgba(255,255,255,.12)',
  lime: '#B1FF00', cyan: '#00FFFF', white: '#FFFFFF', text: '#C7CFDC', muted: '#8B95A6',
  amber: '#FFB020', red: '#FF6B6B', blue: '#3B82F6', ink: '#0C1424', green: '#61D100', toned: '#5A6579', bg2: '#F0F2F6',
};
const BFONT = "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif";
const bcl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const blerp = (a, b, p) => a + (b - a) * p;
const EZ = {
  enter: (T, a, d = 0.45) => Easing.easeOutCubic(bcl((T - a) / d)),
  move: (T, a, d = 0.8) => Easing.easeInOutCubic(bcl((T - a) / d)),
  pop: (T, a, d = 0.5) => Easing.easeOutBack(bcl((T - a) / d)),
};
const typedB = (s, T, a, b) => s.slice(0, Math.round(bcl((T - a) / (b - a)) * s.length));

function BIcon({ n, s = 24, c, style }) {
  const ic = (window.KICONS || {})[n];
  if (!ic) return <span style={{ width: s, height: s, display: 'inline-block', flexShrink: 0 }} />;
  return <svg width={s} height={s} viewBox={`0 0 ${ic.w} ${ic.h}`} style={Object.assign({ flexShrink: 0, display: 'block', color: c || 'currentColor' }, style)} dangerouslySetInnerHTML={{ __html: ic.b }} />;
}

function BLogo({ h = 48, color = '#fff', gap }) {
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

function Win({ from, to, children }) {
  const { T } = window.useComposition();
  const on = isFinite(from) && T >= from && T < to;
  return <div style={{ position: 'absolute', inset: 0, visibility: on ? 'visible' : 'hidden', fontFamily: BFONT }}>{children}</div>;
}

const flowDash = (T) => (T * 90) % 28;
// waktu muncul elemen untuk baris i (sedikit sebelum kata pertama)
const at = (L, i) => L[i].off - 0.1;

function Judulan({ T, chip, judul, aksen }) {
  const a = EZ.enter(T, 0.1, 0.5);
  return (
    <div style={{ position: 'absolute', left: 120, top: 64, opacity: a, transform: `translateY(${(1 - a) * 16}px)` }}>
      <div style={{ display: 'inline-block', fontSize: 26, fontWeight: 800, letterSpacing: '0.14em', color: K.navy, background: aksen, borderRadius: 9999, padding: '8px 20px' }}>{chip}</div>
      <div style={{ marginTop: 14, fontSize: 70, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>{judul}</div>
    </div>
  );
}

/* ── Baris daftar yang muncul mengikuti VO ── */
function Baris({ T, t, y, h = 150, ikon, judul, sub, warna }) {
  const q = EZ.pop(T, t, 0.5);
  return (
    <>
      <div style={{ position: 'absolute', left: 120, width: 1000, top: y, height: h, boxSizing: 'border-box', border: `3px dashed ${K.line}`, borderRadius: 28, opacity: 1 - q }} />
      <div style={{ position: 'absolute', left: 120, width: 1000, top: y, height: h, boxSizing: 'border-box', opacity: q, transform: `translateX(${(1 - q) * -50}px)`, background: K.card, border: `3px solid ${warna}`, borderRadius: 28, display: 'flex', alignItems: 'center', gap: 28, padding: '0 34px', boxShadow: `0 0 40px -14px ${warna}88` }}>
        <span style={{ width: 84, height: 84, borderRadius: 42, background: `${warna}24`, border: `3px solid ${warna}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><BIcon n={ikon} s={44} c={warna} /></span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <span style={{ fontSize: 42, fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>{judul}</span>
          <span style={{ fontSize: 30, color: K.text, lineHeight: 1.25 }}>{sub}</span>
        </span>
      </div>
    </>
  );
}

/* ── Hook: hasil lebih dulu ── */
function HookHasil({ T, L }) {
  const l = L[0], d = l.dur, o = l.off;
  const t1 = o + 0.5, tTyp = o + 0.30 * d, tAi = o + 0.41 * d, t3 = o + 0.55 * d, tCard = o + 0.62 * d + 0.15;
  const c1 = EZ.pop(T, t1, 0.5), ai = EZ.pop(T, tAi, 0.5), c3 = EZ.pop(T, t3, 0.5), card = EZ.pop(T, tCard, 0.55), hi = EZ.enter(T, tCard + 0.2, 0.4);
  const typing = T >= tTyp && T < tAi;
  const ar = EZ.enter(T, tCard - 0.4, 0.5), fl = flowDash(T);
  const bub = (kiri, bg, fg) => ({ alignSelf: kiri ? 'flex-start' : 'flex-end', maxWidth: 520, background: bg, color: fg, borderRadius: kiri ? '22px 22px 22px 6px' : '22px 22px 6px 22px', padding: '16px 22px', fontSize: 32, fontWeight: 600, lineHeight: 1.25 });
  return (
    <>
      <Dots T={T} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        <BLogo h={84} />
        <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', textAlign: 'center' }}>Panduan lengkap <span style={{ color: K.lime }}>AI Agent CRM</span></div>
        <div style={{ fontSize: 36, color: K.text, textAlign: 'center' }}>WhatsApp dibalas AI 24 jam, closing tercatat sendiri</div>
      </div>
      <div style={{ position: 'absolute', left: 150, top: 410, width: 760, background: '#fff', borderRadius: 32, padding: '26px 30px 30px', boxShadow: '0 30px 60px -20px rgba(0,0,0,.6)', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 540, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: '2px solid #E6E9EF' }}>
          <span style={{ width: 62, height: 62, borderRadius: 31, background: '#EAF3FF', color: '#0062CC', fontWeight: 800, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>R</span>
          <span style={{ flex: 1 }}><span style={{ display: 'block', fontSize: 30, fontWeight: 800, color: K.ink }}>Rina Wulandari</span><span style={{ display: 'block', fontSize: 24, color: K.toned }}>WhatsApp · 02.14</span></span>
          <BIcon n="simple-icons:whatsapp" s={40} c="#25D366" />
        </div>
        <div style={{ ...bub(true, '#F0F2F6', K.ink), opacity: c1, transform: `translateY(${(1 - c1) * 24}px)` }}>Kak, kacamata anti radiasi masih ada?</div>
        {typing && <div style={{ alignSelf: 'flex-end', background: '#E3F7D6', borderRadius: 20, padding: '14px 22px', display: 'flex', gap: 8 }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 12, height: 12, borderRadius: 6, background: '#3A7D00', opacity: 0.35 + 0.65 * (Math.floor(T * 4 + i) % 3 === 0 ? 1 : 0.3) }} />)}</div>}
        {T >= tAi && (
          <div style={{ alignSelf: 'flex-end', opacity: ai, transform: `scale(${blerp(0.9, 1, ai)})`, transformOrigin: 'right bottom', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <div style={bub(false, '#DDF5CC', '#1C3A00')}>Ada kak! Harganya Rp 750.000. Mau dikirim hari ini?</div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 22, fontWeight: 700, color: '#3A7D00' }}><BIcon n="lucide:sparkles" s={22} c="#3A7D00" />Oleh AI</span>
          </div>
        )}
        <div style={{ ...bub(true, '#F0F2F6', K.ink), opacity: c3, transform: `translateY(${(1 - c3) * 24}px)` }}>Sudah transfer Rp 750.000 ya kak</div>
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: 'absolute', left: 0, top: 0 }}>
        {ar > 0.02 && <line x1="930" y1="680" x2={930 + 120 * ar} y2="680" stroke={K.lime} strokeWidth="7" strokeLinecap="round" strokeDasharray="4 14" strokeDashoffset={-fl} />}
        {ar > 0.95 && <polygon points="1040,662 1072,680 1040,698" fill={K.lime} />}
      </svg>
      <div style={{ position: 'absolute', left: 1100, top: 520, width: 680, opacity: card, transform: `scale(${blerp(0.85, 1, card)})`, transformOrigin: 'left center', background: '#fff', borderRadius: 32, padding: '34px 38px', boxShadow: `0 30px 60px -18px rgba(0,0,0,.6), 0 0 ${60 * hi}px ${8 * hi}px rgba(177,255,0,${0.4 * hi})` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 28, fontWeight: 700, color: K.toned }}><BIcon n="lucide:user-check" s={34} c="#007AFF" />Lead · Rina Wulandari</div>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: K.green, color: K.ink, borderRadius: 9999, padding: '10px 24px', fontSize: 34, fontWeight: 800 }}><BIcon n="lucide:circle-check" s={34} />Closing</span>
          <span style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-0.02em', color: K.ink }}>Rp 750.000</span>
        </div>
        <div style={{ marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 10, background: '#EDF7E9', color: '#3A7D00', borderRadius: 9999, padding: '8px 20px', fontSize: 26, fontWeight: 700 }}><BIcon n="lucide:workflow" s={28} />Tercatat sendiri</div>
      </div>
    </>
  );
}

/* ── Janji ── */
const LANGKAH = [
  ['lucide:wallet', 'Siapkan OpenRouter'], ['lucide:plug', 'Hubungkan kunci'], ['lucide:book-open', 'Isi Pengetahuan'],
  ['lucide:zap', 'Balas otomatis'], ['lucide:users', 'Serah ke tim'], ['lucide:circle-check', 'Closing otomatis'],
];
function Janji({ T, L }) {
  const t1 = EZ.pop(T, 0.4, 0.6), t2 = EZ.enter(T, 1.6, 0.5), t0 = L[1].off - 0.1;
  return (
    <>
      <Dots T={T} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', fontSize: 130, fontWeight: 800, letterSpacing: '-0.04em', color: K.lime, transform: `scale(${blerp(0.8, 1, t1)})`, opacity: t1 }}>AI Agent CRM</div>
        <div style={{ fontSize: 46, color: '#fff', fontWeight: 700, marginTop: 6, opacity: t2, transform: `translateY(${(1 - t2) * 20}px)` }}>Dari nol sampai chat dibalas AI</div>
      </div>
      <div style={{ position: 'absolute', left: 120, right: 120, top: 480, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 22 }}>
        {LANGKAH.map(([ic, lb], i) => {
          const q = EZ.pop(T, t0 + 0.2 + i * 0.4, 0.45);
          return (
            <div key={lb} style={{ opacity: q, transform: `translateY(${(1 - q) * 30}px) scale(${blerp(0.9, 1, q)})`, background: K.card, border: `2px solid ${K.line}`, borderRadius: 26, padding: '26px 14px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
              <span style={{ width: 48, height: 48, borderRadius: 24, background: K.lime, color: K.ink, fontSize: 28, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
              <BIcon n={ic} s={64} c="#fff" />
              <span style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{lb}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 850, display: 'flex', justifyContent: 'center' }}>
        {(() => { const ban = EZ.pop(T, t0 + 2.9, 0.5); return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 16, background: K.lime, color: K.ink, borderRadius: 9999, padding: '20px 40px 20px 28px', fontSize: 44, fontWeight: 800, opacity: ban, transform: `scale(${blerp(0.85, 1, ban)})`, boxShadow: '0 18px 40px -12px rgba(177,255,0,.35)' }}><BIcon n="lucide:moon" s={50} />CS AI yang jaga chat 24 jam</span>
        ); })()}
      </div>
    </>
  );
}

/* ── Bab 1: Agent ── */
function PeranAgent({ T, L }) {
  const R = [
    ['lucide:message-circle', 'Asisten CS yang tidak tidur', 'Menjaga chat kapan pun pelanggan menulis'],
    ['lucide:book-open', 'Menjawab dari Pengetahuanmu', 'Menulis draf, atau membalas langsung'],
    ['lucide:image', 'Membaca foto, suara, dan PDF', 'Dari pelanggan, lalu menjawabnya'],
    ['lucide:gauge', 'Paling banyak 30 balasan', 'Per chat, dalam 24 jam'],
  ];
  const cu = EZ.pop(T, at(L, 1) + 0.6, 0.5), ai = EZ.pop(T, at(L, 1) + 0.45 * L[1].dur + 0.6, 0.5);
  return (
    <>
      <Dots T={T} />
      <Judulan T={T} chip="DIKERJAKAN AGENT" judul="AI Agent bekerja untukmu" aksen={K.cyan} />
      {R.map((r, i) => <Baris key={i} T={T} t={at(L, i)} y={250 + i * 190} ikon={r[0]} judul={r[1]} sub={r[2]} warna={K.cyan} />)}
      <div style={{ position: 'absolute', left: 1220, top: 270, width: 580, background: '#fff', borderRadius: 32, padding: '26px 28px 30px', boxShadow: '0 30px 60px -20px rgba(0,0,0,.6)', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 540, boxSizing: 'border-box', opacity: EZ.enter(T, 0.5, 0.5) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 14, borderBottom: '2px solid #E6E9EF' }}>
          <span style={{ width: 54, height: 54, borderRadius: 27, background: '#EAF3FF', color: '#0062CC', fontWeight: 800, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>R</span>
          <span style={{ fontSize: 28, fontWeight: 800, color: K.ink }}>Rina Wulandari</span>
        </div>
        <div style={{ alignSelf: 'flex-start', maxWidth: 440, background: '#F0F2F6', color: K.ink, borderRadius: '20px 20px 20px 6px', padding: '14px 20px', fontSize: 28, fontWeight: 600, opacity: cu, transform: `translateY(${(1 - cu) * 20}px)` }}>Bisa tukar ukuran, kak?</div>
        {T >= at(L, 1) + 0.45 * L[1].dur + 0.6 && (
          <div style={{ alignSelf: 'flex-end', maxWidth: 460, opacity: ai, transform: `scale(${blerp(0.9, 1, ai)})`, transformOrigin: 'right bottom', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ background: '#DDF5CC', color: '#1C3A00', borderRadius: '20px 20px 6px 20px', padding: '14px 20px', fontSize: 28, fontWeight: 600 }}>Bisa kak, maksimal 7 hari setelah diterima.</div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 22, fontWeight: 700, color: '#3A7D00' }}><BIcon n="lucide:sparkles" s={22} c="#3A7D00" />Oleh AI</span>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Bab 1: Tim ── */
function PeranTim({ T, L }) {
  const R = [
    ['lucide:users', 'Serah ke tim', 'Aturan kapan agent berhenti dan tim mengambil alih'],
    ['lucide:user-check', 'Pelanggan minta orang', 'Agent berhenti, tim yang membalas'],
    ['lucide:triangle-alert', 'Komplain, refund, pembatalan', 'Bisa kamu serahkan ke tim'],
    ['lucide:refresh-cw', 'Serahkan ke Wulan', 'Agent bekerja lagi setelah urusan beres'],
  ];
  const ban = EZ.pop(T, at(L, 1) + 0.3, 0.5), chips = ['Komplain', 'Refund', 'Pembatalan'];
  const btn = EZ.pop(T, at(L, 3) + 0.5, 0.5), back = T >= at(L, 3) + 2.4;
  return (
    <>
      <Dots T={T} />
      <Judulan T={T} chip="TETAP MANUSIA" judul="Tim memegang yang sulit" aksen={K.amber} />
      {R.map((r, i) => <Baris key={i} T={T} t={at(L, i)} y={250 + i * 190} ikon={r[0]} judul={r[1]} sub={r[2]} warna={K.amber} />)}
      <div style={{ position: 'absolute', left: 1220, top: 270, width: 580, background: '#fff', borderRadius: 32, padding: '26px 28px 30px', boxShadow: '0 30px 60px -20px rgba(0,0,0,.6)', display: 'flex', flexDirection: 'column', gap: 18, minHeight: 540, boxSizing: 'border-box', opacity: EZ.enter(T, 0.5, 0.5) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 14, borderBottom: '2px solid #E6E9EF' }}>
          <span style={{ width: 54, height: 54, borderRadius: 27, background: '#EAF3FF', color: '#0062CC', fontWeight: 800, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>R</span>
          <span style={{ fontSize: 28, fontWeight: 800, color: K.ink, flex: 1 }}>Rina Wulandari</span>
          <span style={{ fontSize: 22, fontWeight: 700, borderRadius: 9999, padding: '6px 14px', background: back ? '#EDF7E9' : '#F0F2F6', color: back ? '#3A7D00' : K.toned }}>{back ? 'Wulan: Balas otomatis' : 'Ditangani tim'}</span>
        </div>
        <div style={{ opacity: ban, transform: `translateY(${(1 - ban) * 20}px)`, background: '#FEF6E7', border: '2px solid #F4D59A', borderRadius: 20, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 28, fontWeight: 800, color: '#8A5300' }}><BIcon n="lucide:users" s={28} c="#8A5300" />Ditangani tim</div>
          <div style={{ marginTop: 6, fontSize: 24, color: '#8A5300' }}>Pelanggan minta bicara dengan tim</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {chips.map((c, i) => { const q = EZ.pop(T, at(L, 2) + 0.4 + i * 0.5, 0.4); return <span key={c} style={{ opacity: q, transform: `scale(${blerp(0.8, 1, q)})`, background: '#FDECEC', color: '#B4272B', borderRadius: 9999, padding: '8px 18px', fontSize: 26, fontWeight: 700 }}>{c}</span>; })}
        </div>
        <div style={{ marginTop: 'auto', opacity: btn, transform: `scale(${blerp(0.85, 1, btn)})`, alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 12, background: back ? K.green : '#007AFF', color: back ? K.ink : '#fff', borderRadius: 16, padding: '16px 28px', fontSize: 30, fontWeight: 800 }}>
          <BIcon n={back ? 'lucide:circle-check' : 'lucide:refresh-cw'} s={32} />{back ? 'Wulan membalas lagi' : 'Serahkan ke Wulan'}
        </div>
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
      <div style={{ position: 'absolute', left: 560, right: 120, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, opacity: tt, transform: `translateX(${(1 - tt) * 60}px)` }}>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '0.14em', color: K.cyan }}>{label}</div>
        <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.05 }}>{judul}</div>
        <div style={{ fontSize: 38, color: K.text }}>{sub}</div>
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
function Catatan({ T, k, judul, catatan, L }) {
  const t = L.map((l) => l.off - 0.1);
  const q = t.map((x) => EZ.pop(T, x, 0.5));
  const aktif = T < t[1] ? 0 : T < t[2] ? 1 : 2;
  const pos = [200, 450, 700];
  return (
    <>
      <Dots T={T} />
      <div style={{ position: 'absolute', left: 120, top: 60, display: 'flex', alignItems: 'center', gap: 22, opacity: EZ.enter(T, 0, 0.4) }}>
        <span style={{ width: 70, height: 70, borderRadius: 35, background: K.lime, color: K.ink, fontSize: 40, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k}</span>
        <span style={{ fontSize: 40, fontWeight: 800, color: '#fff' }}>{judul}</span>
      </div>
      {catatan.map((c, i) => (
        <div key={'g' + i} style={{ position: 'absolute', left: 120, right: 120, top: pos[i], height: 220, boxSizing: 'border-box', border: `3px dashed ${K.line}`, borderRadius: 32, opacity: 1 - q[i], display: 'flex', alignItems: 'center', padding: '0 44px' }}>
          <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '0.14em', color: 'rgba(255,255,255,.22)', textTransform: 'uppercase' }}>{c.tag}</span>
        </div>
      ))}
      {catatan.map((c, i) => (
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
              <span style={{ fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{c.tampil}</span>
            )}
          </span>
        </div>
      ))}
    </>
  );
}

/* ── Bab 4: tiga jenis sumber ── */
function SumberPeng({ T, L }) {
  const S = [
    ['lucide:message-square-text', 'Tanya-jawab', 'Pertanyaan dan jawaban yang sering muncul', K.cyan],
    ['lucide:file-bar-chart', 'Katalog produk & harga', 'File CSV atau tautan Google Sheets', K.lime],
    ['lucide:file-text', 'Teks bebas', 'Kebijakan retur, jam buka, cara pesan', K.amber],
  ];
  const h = EZ.enter(T, at(L, 0) + 0.1, 0.5);
  return (
    <>
      <Dots T={T} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', fontSize: 74, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', opacity: h, transform: `translateY(${(1 - h) * 20}px)` }}>Tiga jenis <span style={{ color: K.lime }}>sumber</span> Pengetahuan</div>
      <div style={{ position: 'absolute', left: 120, right: 120, top: 330, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 36 }}>
        {S.map((s, i) => {
          const q = EZ.pop(T, at(L, i + 1) + 0.05, 0.5);
          return (
            <div key={s[1]} style={{ position: 'relative', height: 520 }}>
              <div style={{ position: 'absolute', inset: 0, border: `3px dashed ${K.line}`, borderRadius: 36, opacity: 1 - q, boxSizing: 'border-box' }} />
              <div style={{ position: 'absolute', inset: 0, opacity: q, transform: `translateY(${(1 - q) * 40}px) scale(${blerp(0.94, 1, q)})`, background: K.card, border: `3px solid ${s[3]}`, borderRadius: 36, boxSizing: 'border-box', padding: '46px 38px', display: 'flex', flexDirection: 'column', gap: 24, boxShadow: `0 0 50px -14px ${s[3]}77` }}>
                <span style={{ width: 120, height: 120, borderRadius: 60, background: `${s[3]}22`, border: `3px solid ${s[3]}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BIcon n={s[0]} s={64} c={s[3]} /></span>
                <span style={{ fontSize: 50, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>{s[1]}</span>
                <span style={{ fontSize: 34, color: K.text, lineHeight: 1.3 }}>{s[2]}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ── Bab 4: Uji pertanyaan ── */
function UjiPertanyaan({ T, L }) {
  const t0 = L[0].off, d0 = L[0].dur;
  const tq = t0 + 1.0, tTanya = t0 + d0 - 0.9;
  const hasil = EZ.pop(T, at(L, 1) + 0.3, 0.5);
  const t2 = at(L, 2), p2 = EZ.pop(T, t2 - 0.2, 0.5), q2 = t2 + 0.1;
  const hasil2 = EZ.pop(T, q2 + 1.9, 0.5), saran = EZ.pop(T, q2 + 3.4, 0.5);
  const panel = { position: 'absolute', top: 250, width: 800, background: '#fff', borderRadius: 32, padding: '34px 38px 38px', boxShadow: '0 30px 60px -20px rgba(0,0,0,.6)', boxSizing: 'border-box', minHeight: 640 };
  const field = (txt, caret, hot) => (
    <div style={{ marginTop: 10, height: 68, boxSizing: 'border-box', borderRadius: 14, border: `2px solid ${hot ? '#007AFF' : '#E1E5EC'}`, boxShadow: hot ? '0 0 0 6px rgba(0,122,255,.15)' : 'none', display: 'flex', alignItems: 'center', padding: '0 22px', fontSize: 32, color: K.ink }}>{txt}{caret && <span style={{ width: 3, height: 34, background: K.ink, marginLeft: 3, opacity: Math.floor(T * 2.4) % 2 ? 0 : 1 }} />}</div>
  );
  const btn = (p) => <span style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 10, background: '#007AFF', color: '#fff', borderRadius: 14, padding: '14px 32px', fontSize: 30, fontWeight: 800, transform: `scale(${1 - p * 0.06})` }}><BIcon n="lucide:search" s={30} />Tanya</span>;
  const press1 = bcl(1 - Math.abs(T - tTanya) / 0.15), press2 = bcl(1 - Math.abs(T - (q2 + 1.3)) / 0.15);
  return (
    <>
      <Dots T={T} />
      <Judulan T={T} chip="UJI DULU" judul="Uji pertanyaan sebelum dipakai" aksen={K.lime} />
      <div style={{ ...panel, left: 110 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 36, fontWeight: 800, color: K.ink }}><BIcon n="lucide:search" s={36} c="#007AFF" />Uji pertanyaan</div>
        <div style={{ marginTop: 22, fontSize: 26, fontWeight: 700, color: K.toned }}>Pertanyaan uji</div>
        {field(typedB('Bisa tukar ukuran?', T, tq, tq + 1.2), T >= tq && T < tTanya, T >= tq && T < tTanya)}
        {btn(press1)}
        <div style={{ marginTop: 26, opacity: hasil, transform: `translateY(${(1 - hasil) * 24}px)`, background: '#EDF7E9', border: '2px solid #BDE5A0', borderRadius: 22, padding: '22px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 30, fontWeight: 800, color: '#3A7D00' }}><BIcon n="lucide:circle-check" s={32} c="#3A7D00" />Agent akan menjawab dari bagian ini</div>
          <div style={{ marginTop: 14, display: 'inline-flex', background: '#fff', borderRadius: 9999, padding: '6px 18px', fontSize: 24, fontWeight: 700, color: K.toned }}>FAQ toko</div>
          <div style={{ marginTop: 10, fontSize: 28, color: K.ink, lineHeight: 1.3 }}>Bisa, maksimal 7 hari setelah diterima.</div>
        </div>
      </div>
      <div style={{ ...panel, right: 110, opacity: p2, transform: `translateY(${(1 - p2) * 40}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 36, fontWeight: 800, color: K.ink }}><BIcon n="lucide:search" s={36} c="#007AFF" />Uji pertanyaan</div>
        <div style={{ marginTop: 22, fontSize: 26, fontWeight: 700, color: K.toned }}>Pertanyaan uji</div>
        {field(typedB('Ada diskon grosir?', T, q2, q2 + 1.1), T >= q2 && T < q2 + 1.3, T >= q2 && T < q2 + 1.3)}
        {btn(press2)}
        <div style={{ marginTop: 26, opacity: hasil2, transform: `translateY(${(1 - hasil2) * 24}px)`, background: '#FEF6E7', border: '2px solid #F4D59A', borderRadius: 22, padding: '22px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 30, fontWeight: 800, color: '#8A5300' }}><BIcon n="lucide:circle-help" s={32} c="#8A5300" />Agent tidak yakin</div>
          <div style={{ marginTop: 10, fontSize: 26, color: '#8A5300' }}>Bagian yang paling mirip</div>
          <div style={{ marginTop: 8, fontSize: 28, color: K.ink, lineHeight: 1.3 }}>FAQ toko: Bisa tukar ukuran?</div>
        </div>
        <div style={{ marginTop: 18, opacity: saran, transform: `scale(${blerp(0.9, 1, saran)})`, transformOrigin: 'left center', display: 'inline-flex', alignItems: 'center', gap: 10, background: K.ink, color: '#fff', borderRadius: 9999, padding: '12px 24px', fontSize: 28, fontWeight: 700 }}><BIcon n="lucide:plus" s={28} c={K.lime} />Tambah jawabannya, lalu uji lagi</div>
      </div>
    </>
  );
}

/* ── Bab 5: draf dulu atau Balas otomatis ── */
function PilihCara({ T, L }) {
  const a = EZ.pop(T, at(L, 0) + 0.1, 0.5), b = EZ.pop(T, at(L, 1) + 0.1, 0.5), r = EZ.pop(T, at(L, 2) + 0.1, 0.5);
  const sw = (on) => <span style={{ width: 84, height: 48, borderRadius: 24, background: on ? K.green : '#C9D0DB', position: 'relative', display: 'inline-block', flexShrink: 0 }}><span style={{ position: 'absolute', top: 5, left: on ? 41 : 5, width: 38, height: 38, borderRadius: 19, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.3)' }} /></span>;
  const kartu = (p, ikon, judul, sub, chip, on, warna) => (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 50}px) scale(${blerp(0.94, 1, p)})`, width: 780, background: '#fff', borderRadius: 36, padding: '40px 44px', boxShadow: `0 30px 60px -20px rgba(0,0,0,.6), 0 0 0 4px ${warna}55`, boxSizing: 'border-box', minHeight: 470 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span style={{ width: 96, height: 96, borderRadius: 28, background: `${warna}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BIcon n={ikon} s={54} c={K.ink} /></span>
        <span style={{ fontSize: 56, fontWeight: 800, color: K.ink, letterSpacing: '-0.02em', flex: 1 }}>{judul}</span>
        {sw(on)}
      </div>
      <div style={{ marginTop: 28, fontSize: 36, color: K.toned, lineHeight: 1.35 }}>{sub}</div>
      <div style={{ marginTop: 28, display: 'inline-flex', alignItems: 'center', gap: 10, background: on ? '#EDF7E9' : '#F0F2F6', color: on ? '#3A7D00' : K.toned, borderRadius: 9999, padding: '10px 24px', fontSize: 28, fontWeight: 700 }}>{chip}</div>
    </div>
  );
  return (
    <>
      <Dots T={T} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center', fontSize: 70, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', opacity: EZ.enter(T, 0.1, 0.5) }}>Dua cara memakai <span style={{ color: K.lime }}>agent</span></div>
      <div style={{ position: 'absolute', left: 120, right: 120, top: 250, display: 'flex', justifyContent: 'space-between' }}>
        {kartu(a, 'lucide:pencil', 'Draf dulu', 'Agent menulis draf di Kotak Masuk. Kamu periksa, lalu kirim sendiri.', 'Balas otomatis mati', false, K.cyan)}
        {kartu(b, 'lucide:zap', 'Balas otomatis', 'Agent mengirim balasannya langsung ke pelanggan.', 'Aktif setelah kamu klik Simpan', true, K.lime)}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 800, display: 'flex', justifyContent: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 16, background: K.lime, color: K.ink, borderRadius: 9999, padding: '20px 42px 20px 28px', fontSize: 42, fontWeight: 800, opacity: r, transform: `scale(${blerp(0.85, 1, r)})` }}><BIcon n="lucide:circle-check" s={48} />Belum yakin? Mulai dari draf</span>
      </div>
    </>
  );
}

/* ── Bab 6: jembatan ke Aturan Otomatisasi ── */
function Jembatan({ T, L }) {
  const t0 = at(L, 0);
  const N = [
    ['simple-icons:whatsapp', 'Chat pelanggan', 'sudah transfer Rp 750.000', '#25D366'],
    ['lucide:workflow', 'Aturan Otomatisasi', 'Kalau chat memuat kata itu, maka...', K.cyan],
    ['lucide:circle-check', 'Lead: Closing', 'Nilai Rp 750.000 terisi', K.green],
    ['logos:meta-icon', 'Purchase ke Meta', 'Dikirim oleh Pengaturan Konversi', '#3B82F6'],
  ];
  const fl = flowDash(T);
  const c1 = EZ.pop(T, at(L, 1) + 0.4, 0.5), c2 = EZ.pop(T, at(L, 1) + 0.45 * L[1].dur + 0.5, 0.5);
  const h = EZ.enter(T, 0.1, 0.5);
  return (
    <>
      <Dots T={T} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', fontSize: 70, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', opacity: h }}>Dari chat sampai <span style={{ color: K.lime }}>Purchase</span></div>
      <div style={{ position: 'absolute', left: 100, right: 100, top: 330, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {N.map((n, i) => {
          const q = EZ.pop(T, t0 + 0.2 + i * 1.0, 0.5);
          return (
            <React.Fragment key={n[1]}>
              <div style={{ width: 340, opacity: q, transform: `translateY(${(1 - q) * 40}px) scale(${blerp(0.92, 1, q)})`, background: '#fff', borderRadius: 30, padding: '30px 28px', boxShadow: `0 24px 50px -16px rgba(0,0,0,.6), 0 0 0 4px ${n[3]}44`, boxSizing: 'border-box', minHeight: 300 }}>
                <span style={{ width: 80, height: 80, borderRadius: 24, background: `${n[3]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BIcon n={n[0]} s={48} c={n[3]} /></span>
                <div style={{ marginTop: 20, fontSize: 36, fontWeight: 800, color: K.ink, lineHeight: 1.15 }}>{n[1]}</div>
                <div style={{ marginTop: 10, fontSize: 26, color: K.toned, lineHeight: 1.3 }}>{n[2]}</div>
              </div>
              {i < N.length - 1 && <svg width="52" height="30" viewBox="0 0 52 30" style={{ flexShrink: 0, opacity: EZ.enter(T, t0 + 0.7 + i * 1.0, 0.4) }}><line x1="2" y1="15" x2="34" y2="15" stroke={K.lime} strokeWidth="6" strokeLinecap="round" strokeDasharray="4 12" strokeDashoffset={-fl} /><polygon points="32,3 50,15 32,27" fill={K.lime} /></svg>}
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 750, display: 'flex', justifyContent: 'center', gap: 36 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: 'rgba(0,255,255,.12)', color: K.cyan, border: `3px solid ${K.cyan}`, borderRadius: 9999, padding: '16px 34px 16px 24px', fontSize: 38, fontWeight: 800, opacity: c1, transform: `scale(${blerp(0.85, 1, c1)})` }}><BIcon n="lucide:message-circle" s={40} />Cara 1: chat pelanggan</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: 'rgba(177,255,0,.12)', color: K.lime, border: `3px solid ${K.lime}`, borderRadius: 9999, padding: '16px 34px 16px 24px', fontSize: 38, fontWeight: 800, opacity: c2, transform: `scale(${blerp(0.85, 1, c2)})` }}><BIcon n="lucide:users" s={40} />Cara 2: kalimat CS</span>
      </div>
    </>
  );
}

/* ── Bab 7: biaya nyata ── */
function BiayaNyata({ T, L }) {
  const a = EZ.pop(T, at(L, 0) + 0.1, 0.55), b = EZ.pop(T, at(L, 1) + 0.1, 0.55), n3 = EZ.pop(T, at(L, 2), 0.5), c = EZ.pop(T, at(L, 3) + 0.1, 0.55), strike = EZ.enter(T, at(L, 3) + 3.6, 0.5);
  const h = EZ.enter(T, 0.1, 0.5);
  const plus = EZ.enter(T, at(L, 1), 0.4);
  return (
    <>
      <Dots T={T} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 100, textAlign: 'center', fontSize: 74, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', opacity: h }}>Biaya <span style={{ color: K.lime }}>nyata</span></div>
      <div style={{ position: 'absolute', left: 90, top: 260, width: 520, height: 560, opacity: a, transform: `translateY(${(1 - a) * 50}px) scale(${blerp(0.93, 1, a)})`, background: '#fff', borderRadius: 34, padding: '36px 34px', boxSizing: 'border-box', boxShadow: '0 0 0 4px rgba(97,209,0,.5), 0 30px 60px -20px rgba(0,0,0,.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><img src="assets/icon_gradient.svg" style={{ width: 52, height: 52 }} /><span style={{ fontSize: 40, fontWeight: 800, color: K.ink }}>Konektor</span></div>
        <div style={{ marginTop: 18, fontSize: 32, fontWeight: 700, color: K.toned }}>AI Agent</div>
        <div style={{ marginTop: 8, fontSize: 70, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.0, color: '#3A7D00' }}>Tanpa biaya tambahan</div>
        <div style={{ marginTop: 26, opacity: n3, transform: `scale(${blerp(0.9, 1, n3)})`, transformOrigin: 'left center', background: '#EDF7E9', color: '#3A7D00', borderRadius: 18, padding: '12px 20px', fontSize: 26, fontWeight: 700, lineHeight: 1.3 }}>Memproses Pengetahuan ditanggung Konektor</div>
      </div>
      <div style={{ position: 'absolute', left: 610, top: 500, width: 80, textAlign: 'center', fontSize: 70, fontWeight: 800, color: K.lime, opacity: plus }}>+</div>
      <div style={{ position: 'absolute', left: 690, top: 260, width: 520, height: 560, opacity: b, transform: `translateY(${(1 - b) * 50}px) scale(${blerp(0.93, 1, b)})`, background: '#080C10', borderRadius: 34, padding: '36px 34px', boxSizing: 'border-box', boxShadow: '0 0 0 4px rgba(200,255,0,.45), 0 30px 60px -20px rgba(0,0,0,.6)', color: '#EDEFF0' }}>
        <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em' }}>openrouter</div>
        <div style={{ marginTop: 18, fontSize: 32, fontWeight: 700, color: '#C6CCD0' }}>Akun milikmu</div>
        <div style={{ marginTop: 8, fontSize: 60, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#C8FF00' }}>Bayar sesuai pemakaian</div>
        <div style={{ marginTop: 26, display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(200,255,0,.12)', color: '#C8FF00', borderRadius: 9999, padding: '10px 22px', fontSize: 28, fontWeight: 700 }}><BIcon n="lucide:gauge" s={30} />Credit limit menjaga biaya</div>
      </div>
      <div style={{ position: 'absolute', left: 1290, top: 260, width: 540, height: 560, opacity: c, transform: `translateY(${(1 - c) * 50}px) scale(${blerp(0.93, 1, c)})`, border: '3px dashed rgba(255,107,107,.6)', borderRadius: 34, padding: '36px 34px', boxSizing: 'border-box', color: '#fff' }}>
        <div style={{ fontSize: 34, fontWeight: 800, color: K.text }}>CRM dengan AI Agent</div>
        <div style={{ position: 'relative', marginTop: 24, display: 'inline-block', fontSize: 92, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>$159–199
          <svg width="400" height="30" viewBox="0 0 400 30" style={{ position: 'absolute', left: -10, top: 36, overflow: 'visible' }}>{strike > 0.01 && <line x1="0" y1="15" x2={420 * strike} y2="15" stroke="#FF4D4F" strokeWidth="12" strokeLinecap="round" />}</svg>
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, color: K.text }}>per bulan</div>
        <div style={{ marginTop: 26, fontSize: 24, color: K.muted, lineHeight: 1.35 }}>Contoh: paket Growth respond.io, ditagih tahunan atau bulanan. Dicek 10 Okt 2026.</div>
      </div>
    </>
  );
}

/* ── Ringkasan, tips, penutup ── */
const RINGKAS = [
  ['lucide:wallet', 'Siapkan OpenRouter'], ['lucide:key-round', 'Hubungkan kunci'], ['lucide:book-open', 'Isi Pengetahuan'],
  ['lucide:search', 'Uji jawabannya'], ['lucide:zap', 'Nyalakan Balas otomatis'], ['lucide:circle-check', 'Catat closing otomatis'],
];
function Ringkas({ T, L }) {
  const o = L[0].off, d = L[0].dur, step = (d - 3.2) / 6;
  return (
    <>
      <Dots T={T} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center', fontSize: 70, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', opacity: EZ.enter(T, 0.1, 0.5) }}><span style={{ color: K.lime }}>AI Agent</span>, ringkasnya</div>
      <div style={{ position: 'absolute', left: 150, right: 150, top: 270, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {RINGKAS.map(([ic, lb], i) => {
          const t = o + 2.4 + i * step;
          const q = EZ.pop(T, t, 0.45), tick = EZ.pop(T, t + 0.35, 0.4);
          return (
            <div key={lb} style={{ position: 'relative', height: 150 }}>
              <div style={{ position: 'absolute', inset: 0, border: `3px dashed ${K.line}`, borderRadius: 28, boxSizing: 'border-box', opacity: 1 - q, display: 'flex', alignItems: 'center', padding: '0 30px' }}>
                <span style={{ width: 56, height: 56, borderRadius: 28, border: `3px solid ${K.line}`, boxSizing: 'border-box', color: 'rgba(255,255,255,.22)', fontSize: 30, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
              </div>
              <div style={{ opacity: q, transform: `translateY(${(1 - q) * 30}px)`, background: K.card, border: `2px solid ${K.line}`, borderRadius: 28, height: 150, display: 'flex', alignItems: 'center', gap: 24, padding: '0 30px' }}>
                <span style={{ width: 56, height: 56, borderRadius: 28, background: K.lime, color: K.ink, fontSize: 32, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                <BIcon n={ic} s={58} c="#fff" />
                <span style={{ flex: 1, fontSize: 38, fontWeight: 700, color: '#fff' }}>{lb}</span>
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
  ['Mulai dari draf', 'Nyalakan Balas otomatis setelah jawabannya kamu uji.'],
  ['Lengkapi Profil bisnis dan Pengetahuan', 'Uji lagi tiap harga berubah.'],
  ['Nyalakan Serah ke tim', 'Komplain dan refund ditangani manusia.'],
];
function TipsScene({ T, L }) {
  const pos = [250, 480, 710];
  return (
    <>
      <Dots T={T} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center', fontSize: 70, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', opacity: EZ.enter(T, 0.1, 0.5) }}>Tiga tips <span style={{ color: K.lime }}>penting</span></div>
      {TIPS.map(([a, b], i) => {
        const q = EZ.pop(T, at(L, i), 0.5);
        return (
          <React.Fragment key={a}>
            <div style={{ position: 'absolute', left: 150, right: 150, top: pos[i], height: 190, boxSizing: 'border-box', border: `3px dashed ${K.line}`, borderRadius: 32, opacity: 1 - q, display: 'flex', alignItems: 'center', padding: '0 44px' }}>
              <span style={{ width: 96, height: 96, borderRadius: 48, border: `3px solid ${K.line}`, boxSizing: 'border-box', color: 'rgba(255,255,255,.22)', fontSize: 56, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
            </div>
            <div style={{ position: 'absolute', left: 150, right: 150, top: pos[i], height: 190, opacity: q, transform: `translateY(${(1 - q) * 40}px)`, background: K.card, border: `3px solid ${K.line}`, borderRadius: 32, display: 'flex', alignItems: 'center', gap: 36, padding: '0 44px' }}>
              <span style={{ width: 96, height: 96, borderRadius: 48, background: K.lime, color: K.ink, fontSize: 60, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 50, fontWeight: 800, color: '#fff' }}>{a}</span>
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
        <div style={{ fontSize: 44, color: K.text, opacity: t1, textAlign: 'center' }}>AI Agent di Konektor: tanpa biaya tambahan. Kamu bayar pemakaian AI ke OpenRouter-mu.</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 18, background: '#fff', color: K.ink, borderRadius: 9999, padding: '24px 46px', fontSize: 46, fontWeight: 800, opacity: pill, transform: `scale(${blerp(0.85, 1, pill)})` }}><BIcon n="lucide:book-open" s={50} c="#007AFF" />Panduan lengkap: konektor.id/docs/whatsapp/agentic</div>
      </div>
    </>
  );
}

/* ── Overlay: bilah progres + logo sudut (logo disembunyikan di scene tutorial, yang punya lencana sendiri) ── */
function Overlay() {
  const { T, CUES, authoredTotal } = window.useComposition();
  const P = window.PLAN;
  const dalamSumber = P.segNames.some((n) => T >= CUES[n] && T < window.akhirScene(CUES, authoredTotal, n));
  const besar = (T >= CUES.Hasil && T < CUES.c0) || T >= CUES.Cta;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, height: 6, width: `${bcl(T / authoredTotal) * 100}%`, background: K.lime, zIndex: 50 }} />
      <div style={{ position: 'absolute', left: 32, bottom: 36, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px 8px 10px', borderRadius: 16, background: 'rgba(12,20,36,.96)', boxShadow: '0 0 0 1px rgba(255,255,255,.08)', opacity: dalamSumber || besar ? 0 : 1, pointerEvents: 'none', zIndex: 40, fontFamily: BFONT }}>
        <img src="assets/icon_gradient.svg" style={{ width: 36, height: 36 }} />
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>Konektor</span>
      </div>
    </>
  );
}

window.BagianBaru = function BagianBaru() {
  const { T, CUES, authoredTotal } = window.useComposition();
  const P = window.PLAN;
  const rel = (n) => T - CUES[n];
  const W = (n, children) => <Win key={n} from={CUES[n]} to={window.akhirScene(CUES, authoredTotal, n)}>{children}</Win>;
  const B = P.baru;
  const out = [
    W('Hasil', <HookHasil T={rel('Hasil')} L={B.Hasil} />),
    W('Janji', <Janji T={rel('Janji')} L={B.Janji} />),
  ];
  for (const b of P.bab) {
    out.push(W(`J${b.k}`, <KartuJudul T={rel(`J${b.k}`)} k={b.k} judul={b.judul} sub={b.sub} label={`BAB ${b.k} DARI 7`} />));
    if (P.catatan[b.k]) out.push(W(`N${b.k}`, <Catatan T={rel(`N${b.k}`)} k={b.k} judul={b.judul} catatan={P.catatan[b.k]} L={B[`N${b.k}`]} />));
  }
  out.push(
    W('Agent', <PeranAgent T={rel('Agent')} L={B.Agent} />),
    W('Tim', <PeranTim T={rel('Tim')} L={B.Tim} />),
    W('Sumber', <SumberPeng T={rel('Sumber')} L={B.Sumber} />),
    W('Uji', <UjiPertanyaan T={rel('Uji')} L={B.Uji} />),
    W('Pilih', <PilihCara T={rel('Pilih')} L={B.Pilih} />),
    W('Jembatan', <Jembatan T={rel('Jembatan')} L={B.Jembatan} />),
    W('Biaya', <BiayaNyata T={rel('Biaya')} L={B.Biaya} />),
    W('Ringkas', <Ringkas T={rel('Ringkas')} L={B.Ringkas} />),
    W('TipsAkhir', <TipsScene T={rel('TipsAkhir')} L={B.TipsAkhir} />),
    W('Cta', <Penutup T={rel('Cta')} />),
  );
  return <>{out}<Overlay /></>;
};
