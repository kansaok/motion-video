// Kronik: menjalankan Piece milik tutorial 1 menit di dalam satu komposisi panjang.
// Satu tutorial = SATU Piece (PieceHost). Potongan (`segs`) hanya memutar rentang scene sumber.
// Jam lokal Piece = awal scene sumber pertama di potongan + waktu sejak scene potongan dimulai.
// Di luar potongan, jam berhenti di bingkai akhir potongan terakhir yang sudah mulai.
const { useMemo, useContext, createContext } = React;

const ChapCtx = createContext(null);

// Salinan <Captions> dari animations-v3, tetapi membaca jam Piece.
function ChapCaptions(props) {
  const c = useContext(ChapCtx);
  const t = c.T;
  const items = (props.items || []).filter((it) => it && isFinite(+it.at)).sort((a, b) => a.at - b.at);
  let active = null, end = Infinity;
  for (let i = 0; i < items.length; i++) {
    if (t < items[i].at) break;
    active = items[i];
    end = typeof active.until === 'number' && isFinite(active.until) ? active.until : (i + 1 < items.length ? items[i + 1].at : Infinity);
  }
  if (!active || t >= end) return null;
  let o = Math.min(1, (t - active.at) / 0.18);
  if (isFinite(end)) o = Math.min(o, (end - t) / 0.18);
  o = Math.max(0, Math.min(1, o));
  return <div data-om-caption style={Object.assign({ position: 'absolute', left: '8%', right: '8%', bottom: '7%', textAlign: 'center', opacity: o, pointerEvents: 'none' }, props.style)}>{active.text}</div>;
}

window.ChapterKit = {
  useComposition() {
    const c = useContext(ChapCtx);
    if (!c) throw new Error('useComposition() di Piece harus di dalam <PieceHost>');
    return c;
  },
  Captions: ChapCaptions,
};

const TW = { motionEditor: false, captions: true, zoom: 1 };

// awal scene berikutnya di urutan komposisi
window.akhirScene = function (CUES, authoredTotal, name) {
  const urut = window.PLAN.urut;
  const i = urut.indexOf(name);
  return i >= 0 && i + 1 < urut.length ? CUES[urut[i + 1]] : authoredTotal + 1;
};

const memoPiece = {};
function PieceHost({ pid, Piece, info }) {
  const MP = memoPiece[pid] || (memoPiece[pid] = React.memo(Piece));
  const g = window.useComposition();
  const T = g.T, CUES = g.CUES;
  let cur = null, last = null;
  for (const sg of info.segs) {
    const a = CUES[sg.name];
    if (!isFinite(a)) continue;
    if (T >= a) last = sg;
    if (T >= a && T < window.akhirScene(CUES, g.authoredTotal, sg.name)) cur = sg;
  }
  const first = info.segs[0];
  const local = last ? last.s + Math.max(0, Math.min(T - CUES[last.name], last.d - 0.001)) : first.s;
  const on = cur !== null;
  const lembut = on && !window.PLAN.langsung[cur.name];
  const op = on ? (lembut ? Math.min(1, (T - CUES[cur.name]) / 0.2) : 1) : 0;
  const value = useMemo(() => ({
    T: local, CUES: info.srcCues, time: on ? local : 0, duration: g.duration, authoredTotal: g.authoredTotal, playing: g.playing,
  }), [local, on]);
  return (
    <div style={{ position: 'absolute', inset: 0, visibility: on ? 'visible' : 'hidden', opacity: op }}>
      <ChapCtx.Provider value={value}><MP tw={TW} /></ChapCtx.Provider>
    </div>
  );
}
window.PieceHost = PieceHost;
