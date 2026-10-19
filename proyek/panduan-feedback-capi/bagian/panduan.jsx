// Akar komposisi: bab-bab sumber (Chapter) + bagian baru (BagianBaru) dalam satu CompositionStage.
function IsiPanduan() {
  const P = window.PLAN;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#0B1120' }}>
      {P.bab.map((b) => {
        const Piece = window['CHAP_' + b.id];
        return Piece ? <window.Chapter key={b.id} bab={b} Piece={Piece} /> : null;
      })}
      <window.BagianBaru />
    </div>
  );
}

function PanduanFeedbackCapi() {
  return (
    <CompositionStage width={1920} height={1080} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg="#0B1120">
      <IsiPanduan />
    </CompositionStage>
  );
}
window.PanduanFeedbackCapi = PanduanFeedbackCapi;
