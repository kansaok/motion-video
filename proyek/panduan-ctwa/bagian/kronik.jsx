// Kronik: menjalankan Piece milik tutorial 1 menit di dalam satu komposisi panjang.
// Tiap bab punya jam lokal: waktu sumber (T) = awal scene sumber pertama + waktu sejak scene bab dimulai.
// Kalau scene bab memanjang, gambarnya berhenti di bingkai akhir.
const { useMemo, useContext, createContext } = React;

const ChapCtx = createContext(null);

// Salinan <Captions> dari animations-v3, tetapi membaca jam bab.
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
    if (!c) throw new Error('useComposition() di bab harus di dalam <Chapter>');
    return c;
  },
  Captions: ChapCaptions,
};

// Peta waktu segmen: waktu komposisi (sejak awal segmen) -> waktu animasi sumber. Titik [t, s] dari sumber/warp.json.
// Sesudah titik terakhir laju 1. Tanpa titik, waktunya tidak diubah.
function warpWaktu(titik, t) {
  if (!titik || titik.length < 2 || t <= 0) return t;
  const n = titik.length;
  if (t >= titik[n - 1][0]) return titik[n - 1][1] + (t - titik[n - 1][0]);
  for (let i = 1; i < n; i++) {
    if (t < titik[i][0]) {
      const [t0, s0] = titik[i - 1], [t1, s1] = titik[i];
      return s0 + ((t - t0) / (t1 - t0)) * (s1 - s0);
    }
  }
  return t;
}

const TW = { motionEditor: false, captions: true, zoom: 1 };

const memoPiece = {};
function Chapter({ bab, Piece }) {
  const MP = memoPiece[bab.id] || (memoPiece[bab.id] = React.memo(Piece));
  const g = window.useComposition();
  const T = g.T, CUES = g.CUES;
  const first = bab.scenes[0], start = CUES[bab.id], stop = CUES[bab.end];
  const local = first.s + Math.max(0, Math.min(warpWaktu(bab.warp, T - start), bab.dur - 0.001));
  const on = T >= start && T < stop;
  const op = on ? Math.min(1, (T - start) / 0.3) : 0;
  const value = useMemo(() => ({
    T: local, CUES: bab.srcCues, time: on ? local : 0, duration: g.duration, authoredTotal: g.authoredTotal, playing: g.playing,
  }), [local, on]);
  return (
    <div style={{ position: 'absolute', inset: 0, visibility: on ? 'visible' : 'hidden', opacity: op }}>
      <ChapCtx.Provider value={value}><MP tw={TW} /></ChapCtx.Provider>
    </div>
  );
}
window.Chapter = Chapter;
