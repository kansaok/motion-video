function VideoUtama() {}
const CUES = {Intro: 0, 'Nama Scene': 2};
const C = {dp: CUES['Nama Scene']};
const intro = MOTION.enter(CUES.Intro + 1.4)(T);
const deret = [0, 1].map(i => MOTION.enter(CUES.Intro + 4.4 + i * 1.5, 0.5)(T));
const caps = capsOn ? [
  { at: C.dp + 0.2, text: 'Hemat Rp$$ 5.000' },
] : [];
