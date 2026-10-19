// Akar komposisi: Piece tutorial sumber (PieceHost) + bagian baru (BagianBaru) dalam satu CompositionStage.
function IsiPanduan() {
  const P = window.PLAN;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#0B1120' }}>
      {Object.keys(P.piece).map((pid) => {
        const Piece = window['PIECE_' + pid];
        return Piece ? <window.PieceHost key={pid} pid={pid} Piece={Piece} info={P.piece[pid]} /> : null;
      })}
      <window.BagianBaru />
    </div>
  );
}

function PanduanAiAgent() {
  return (
    <CompositionStage width={1920} height={1080} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg="#0B1120">
      <IsiPanduan />
    </CompositionStage>
  );
}
window.PanduanAiAgent = PanduanAiAgent;
