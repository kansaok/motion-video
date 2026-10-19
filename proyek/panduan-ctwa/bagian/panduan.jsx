// Akar komposisi: segmen sumber (Chapter) + bagian baru (BagianBaru) dalam satu CompositionStage.
// Beberapa segmen boleh memakai Piece yang sama (satu tutorial dipakai di beberapa bab).
function IsiPanduan() {
  const P = window.PLAN;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#0B1120' }}>
      {P.seg.map((g) => {
        const Piece = window['CHAP_' + g.piece];
        return Piece ? <window.Chapter key={g.id} bab={g} Piece={Piece} /> : null;
      })}
      <window.BagianBaru />
    </div>
  );
}

function PanduanClickToWhatsapp() {
  return (
    <CompositionStage width={1920} height={1080} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg="#0B1120">
      <IsiPanduan />
    </CompositionStage>
  );
}
window.PanduanClickToWhatsapp = PanduanClickToWhatsapp;
