# Rama Digital Signal Room Implementation Plan

**For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deliver one 30-second, 1080×1920 Reels video that sells Rama Digital's Digital Marketing Setup through the Signal Room concept.

**Architecture:** Create a self-contained project under `proyek/rama-digital-signal/`. Use one native vertical HTML composition, one JSX scene component, one motion config, and one master audio mix. Generate and render on `rama-tuf`, then copy the verified MP4 and cover image to the local Ads delivery folder.

**Tech Stack:** Existing motion-engine CLI, JSX rendered by the `.dc.html` composition, ElevenLabs voice generation through the CLI, generated SFX and music, ffmpeg mix and render, Chromium frame capture.

**Spec:** `docs/superpowers/specs/2026-09-10-rama-digital-signal-room-design.md`

## Global Constraints

- Build one native 1080×1920 Reels composition for 30 seconds.
- Use Cahaya voice `iWydkXKoiVtvdn4vLKp9` with speed 1,20, stability 0,14, and style 0,72.
- Use `rencana` for music and keep the bed active from the first frame through the CTA.
- Do not use `sparse`, `quiet`, or `patient` in music instructions.
- Layer the single major impact four times and place it at the signal merge only once.
- Use original SVG product icons.
- Edit each active `.jsx` file and its `.jsx.asli` copy.
- Keep the root component as `React.Fragment`.
- Run build, render, and production checks on `rama-tuf` under `~/render/motion-engine`.
- Run `motion check` and report every verification result.
- End each git commit with the exact trailer `Co-Authored-By: CADIS <agent@cadis.digital>` after one blank line.

### Task 1: Scaffold the Signal Room project

**Files:**

- Create: `proyek/rama-digital-signal/motion.config.mjs`
- Create: `proyek/rama-digital-signal/naskah.md`
- Create: `proyek/rama-digital-signal/src/Iklan Signal Room 9x16.dc.html`
- Create: `proyek/rama-digital-signal/src/Iklan Signal Room 9x16.dc.html.asli`
- Create: `proyek/rama-digital-signal/src/signal-room.jsx`
- Create: `proyek/rama-digital-signal/src/signal-room.jsx.asli`
- Copy: `proyek/rama-digital-ads/src/support.js` to `proyek/rama-digital-signal/src/support.js`
- Copy: `proyek/rama-digital-ads/src/animations-v3.jsx` to `proyek/rama-digital-signal/src/animations-v3.jsx`
- Copy: `proyek/rama-digital-ads/src/tweaks-panel.jsx` to `proyek/rama-digital-signal/src/tweaks-panel.jsx`

**Interfaces:**

- The HTML composition exposes `window.OM_SCENES` with the scenes `Hook`, `Break`, `Setup`, `Signal`, `Proof`, and `CTA`.
- The composition exposes `window.OM_SIZE` as `{w:1080,h:1920}` and imports `IklanAd` from `signal-room.jsx`.
- `signal-room.jsx` exports `window.IklanAd` and receives timing through `useComposition()` as `{T, CUES, authoredTotal}`.
- `motion.config.mjs` points `komposisi` to `Iklan Signal Room 9x16.dc.html` and `jsx` to `signal-room.jsx`.
- **Step 1: Create the directory and copy the shared runtime files.**

mkdir -p proyek/rama-digital-signal/src

```sh
cp proyek/rama-digital-ads/src/support.js proyek/rama-digital-signal/src/support.js
cp proyek/rama-digital-ads/src/animations-v3.jsx proyek/rama-digital-signal/src/animations-v3.jsx
cp proyek/rama-digital-ads/src/tweaks-panel.jsx proyek/rama-digital-signal/src/tweaks-panel.jsx
```

- **Step 2: Write the six-scene 1080×1920 composition shell.**

```js
<script>window.OM_SCENES = '[{"name":"Hook","dur":4.2},{"name":"Break","dur":4.4},{"name":"Setup","dur":5.6},{"name":"Signal","dur":5.3},{"name":"Proof","dur":5.3},{"name":"CTA","dur":5.2}]';</script>
<script>window.OM_SIZE = '{"w":1080,"h":1920}';</script>
<script>window.OM_PLAYBACK = '{"mode":"times","count":1}';</script>
<x-import component-from-global-scope="IklanAd" from="./tweaks-panel.jsx ./animations-v3.jsx ./signal-room.jsx" hint-size="100%,100%"></x-import>
```

Include the Google font links already used by the project and set `body { margin: 0; background: #021a17; }`. Copy the same shell to the `.dc.html.asli` file.

- **Step 3: Add the config and naskah skeleton with the approved scene names.**

Set `nama` to `rama-digital-signal`, `keluaran` to `rama-digital-signal-room-9x16.mp4`, `kapsi` to `false`, and keep the scene durations in one source of truth. Write the six scene descriptions and the approved on-screen copy in `naskah.md`.

- **Step 4: Validate the scaffold before visual code.**

Run: `node --check proyek/rama-digital-signal/motion.config.mjs`

Expected: exit code 0.

Run: `rg -n 'OM_SCENES|OM_SIZE|IklanAd|React.Fragment' proyek/rama-digital-signal/src`

Expected: all four names appear in the new source files, with no `aspectRatio` wrapper.

- **Step 5: Commit the scaffold.**

```sh
git add proyek/rama-digital-signal
git commit -m "feat: scaffold Rama Digital Signal Room video" -m "Co-Authored-By: CADIS <agent@cadis.digital>"
```

### Task 2: Implement the native vertical Signal Room composition

**Files:**

- Modify: `proyek/rama-digital-signal/src/signal-room.jsx`
- Modify: `proyek/rama-digital-signal/src/signal-room.jsx.asli`

**Interfaces:**

- `IklanPiece` renders the background field and six scene components.
- Each scene receives `{T, CUES}` and uses `Shot from={CUES.Scene} to={CUES.Next}`.
- `IklanAd` renders `CompositionStage` with `width={1080}`, `height={1920}`, `scenes={window.OM_SCENES}`, and the `IklanPiece` child.
- **Step 1: Define the shared palette and motion helpers.**

Use dark teal `#042421` and `#021a17`, teal `#0f7268`, amber `#e6a93c`, red `#c84b42`, paper `#f8faf9`, and the existing Plus Jakarta Sans, JetBrains Mono, and Newsreader stacks. Implement `M.in`, `M.draw`, `M.wipe`, `M.beat`, `M.cam`, `M.out`, and `M.osc` with the existing motion-engine easing APIs.

- **Step 2: Implement the Hook and Break scenes.**

Show `RAMA DIGITAL · DATA-DRIVEN MARKETING`, the headline `IKLAN JALAN.` and `LEAD HILANG?`, plus a live signal dot. In `Break`, draw three SVG cards labelled `IKLAN`, `LANDING PAGE`, and `WHATSAPP`; animate the last connector into a red glitch state.

- **Step 3: Implement Setup and Signal scenes.**

In `Setup`, bring in the SVG modules `TRACKING`, `LANDING PAGE`, and `LEAD MANAGEMENT` from different axes, then lock each module to one amber route. In `Signal`, transform the route into a clean dashboard with the labels `KLIK`, `KUNJUNGAN`, and `CHAT`, and show `SATU JALUR. SATU SUMBER DATA.`.

- **Step 4: Implement Proof and CTA scenes.**

In `Proof`, animate three checklist rows: `EVENT TERCATAT`, `LEAD TERBACA`, and `TIM SIAP BERTINDAK`. In `CTA`, show the Rama Digital SVG mark, `DIGITAL MARKETING SETUP`, `Mulai dari datamu.`, and the button `CHAT DI RAMADIGITAL.ID`; keep the button breathing with `M.osc` through the final frame.

- **Step 5: Add the four-layer merge impact once.**

Place `Burst` behind the Signal merge at `CUES.Signal + 1.10` and attach four visual pulses to the same event. Do not add another major flash or impact event elsewhere in the JSX.

- **Step 6: Add the root Fragment and mirror the active source.**

Render the stage and tweak panel inside `React.Fragment`, assign `window.IklanPiece = IklanPiece`, assign `window.IklanAd = IklanAd`, then copy the exact file to `signal-room.jsx.asli`.

- **Step 7: Run static composition checks.**

Run: `rg -n 'aspectRatio|window\\.IklanAd|React\\.Fragment|<svg|CHAT DI RAMADIGITAL\\.ID' proyek/rama-digital-signal/src/signal-room.jsx`

Expected: no `aspectRatio`, one root Fragment, at least four SVG definitions, one global export, and the CTA copy.

- **Step 8: Commit the visual composition.**

```sh
git add proyek/rama-digital-signal/src/signal-room.jsx proyek/rama-digital-signal/src/signal-room.jsx.asli
git commit -m "feat: build Signal Room vertical composition" -m "Co-Authored-By: CADIS <agent@cadis.digital>"
```

### Task 3: Complete the script, cue map, and audio plan

**Files:**

- Modify: `proyek/rama-digital-signal/motion.config.mjs`
- Modify: `proyek/rama-digital-signal/naskah.md`

**Interfaces:**

- `vo` contains numbered rows with `sc`, `off`, `maks`, and `text`.
- `cue({C, S})` returns cue objects with `at`, `nama`, `gain`, `nada`, and optional `pan`.
- `musik` uses `detik: ({total}) => total + 10`, scene-linked `titik`, `fadeOut`, and `rencana`.
- `mixer` defines `gainVO`, `gainSFX`, `duckMusik`, and `bedMusik`.
- **Step 1: Add the approved 30-second VO rows.**

Use these TTS texts and scene anchors:

```js
{no: 1,  sc: 'Hook',  off: 0.20, maks: 1.90, text: 'Iklan jalan. Lead menghilang?'}
{no: 2,  sc: 'Break', off: 0.35, maks: 2.30, text: 'Biasanya, masalahnya ada di data yang putus.'}
{no: 3,  sc: 'Setup', off: 0.25, maks: 3.40, text: 'Kami pasang tracking, landing page, dan pengelolaan lead dalam satu sistem.'}
{no: 4,  sc: 'Signal', off: 0.25, maks: 2.90, text: 'Jadi kamu bisa lihat apa yang terjadi, dari klik sampai chat.'}
{no: 5,  sc: 'Proof', off: 0.30, maks: 2.70, text: 'Marketing yang terbaca membuat keputusanmu lebih cepat.'}
{no: 6,  sc: 'CTA', off: 0.20, maks: 1.80, text: 'Mulai dari datamu.'}
{no: 7,  sc: 'CTA', off: 2.15, maks: 2.15, text: 'Chat di ramadigital dot id.'}
```

Use `lafal` only for TTS pronunciation, with `landing: 'lending'`, `whatsapp: 'wasap'`, and `ramadigital.id: 'ramadigital dot id'` if the parser requires the explicit key.

- **Step 2: Map scene-linked SFX cues.**

Define these generated sources: `whoosh`, `click`, `glitch-cut`, `riser`, `merge-sub`, `merge-snap`, `merge-wide`, `merge-chime`, `check-pop`, `cta-click`, and `brand-tail`. Use `merge-sub`, `merge-snap`, `merge-wide`, and `merge-chime` together only at `C.Signal + 1.10`. Place transition whooshes at scene starts, one glitch at `C.Break + 2.20`, checklist pops at `C.Proof + 0.45`, `+0.90`, and `+1.35`, and the CTA click at `C.CTA + 2.15`.

- **Step 3: Write the music rencana and mixer settings.**

Set one track to request 40 seconds, with an active 112 BPM corporate-tech bed, bright arpeggio, ticking hi-hat, restrained kick, no vocals, no breakdown, and full energy in the last third. Set scene points from −21 dB at Hook to −14 dB at CTA, fade at the final 0,75 seconds, and use `duckMusik: {th: 0.14, ratio: 3, attack: 30, release: 240}`.

- **Step 4: Write the production naskah.**

Document the seven VO rows, exact screen copy, six scene timings, SFX table, music rencana, and target audio numbers.

- **Step 5: Validate the config syntax and references.**

Run: `node --check proyek/rama-digital-signal/motion.config.mjs`

Expected: exit code 0.

Run: `rg -n "rencana|prompt:|sparse|quiet|patient|iWydkXKoiVtvdn4vLKp9|style: 0\\.72|stability: 0\\.14|speed: 1\\.20" proyek/rama-digital-signal/motion.config.mjs`

Expected: `rencana` and the approved voice values appear; `prompt:`, `sparse`, `quiet`, and `patient` do not appear.

- **Step 6: Commit the script and audio plan.**

```sh
git add proyek/rama-digital-signal/motion.config.mjs proyek/rama-digital-signal/naskah.md
git commit -m "feat: add Signal Room script and audio cues" -m "Co-Authored-By: CADIS <agent@cadis.digital>"
```

### Task 4: Generate audio and apply timing on `rama-tuf`

**Files:**

- Read: `proyek/rama-digital-signal/motion.config.mjs`
- Generate: `proyek/rama-digital-signal/aset/`
- Generate: `proyek/rama-digital-signal/stem/`
- Modify: `proyek/rama-digital-signal/src/Iklan Signal Room 9x16.dc.html`
- Modify: `proyek/rama-digital-signal/src/signal-room.jsx`

**Interfaces:**

- `motion plan` creates the VO timing map and rejects scene boundaries that cut a VO row.
- `motion apply` writes timing anchors and restores active files from `.asli`.
- `motion sfx`, `motion music`, and `motion mix` create the cached source and bus files.
- **Step 1: Sync the committed project to the render checkout.**

```sh
rsync -a --delete proyek/rama-digital-signal/ rama-tuf:~/render/motion-engine/proyek/rama-digital-signal/
```

Expected: the remote project contains the same config, source, and support files.

- **Step 2: Run the plan command with a render-side temp directory.**

```sh
ssh rama-tuf 'bash -lc "cd ~/render/motion-engine && TMPDIR=$HOME/render/tmp node bin/motion.mjs plan proyek/rama-digital-signal"'
```

Expected: all seven VO rows fit their `maks` values and total timing stays within 30,20 seconds.

- **Step 3: Apply the verified timing.**

```sh
ssh rama-tuf 'bash -lc "cd ~/render/motion-engine && TMPDIR=$HOME/render/tmp node bin/motion.mjs apply proyek/rama-digital-signal"'
```

Expected: the command reports the six scene anchors and keeps the active `.jsx` equal to `.jsx.asli` after the applied anchor update.

- **Step 4: Generate SFX, music, and the mix.**

```sh
ssh rama-tuf 'bash -lc "cd ~/render/motion-engine && TMPDIR=$HOME/render/tmp node bin/motion.mjs sfx proyek/rama-digital-signal"'
ssh rama-tuf 'bash -lc "cd ~/render/motion-engine && TMPDIR=$HOME/render/tmp node bin/motion.mjs music proyek/rama-digital-signal"'
ssh rama-tuf 'bash -lc "cd ~/render/motion-engine && TMPDIR=$HOME/render/tmp node bin/motion.mjs mix proyek/rama-digital-signal"'
```

Expected: every generated file is larger than the minimum valid audio size, the mix reports loudness near −14 LUFS, and the encoded trial peak stays below −1,0 dBTP.

- **Step 5: Run the render-side audio spot checks.**

```sh
ssh rama-tuf 'bash -lc "cd ~/render/motion-engine && ffprobe -v error -show_entries format=duration -of default=nw=1 proyek/rama-digital-signal/stem/vo.wav proyek/rama-digital-signal/aset/master.wav"'
```

Expected: both durations cover the 30-second composition and no input reports an invalid stream.

### Task 5: Render, check, and deliver the Reels artifact

**Files:**

- Generate: `proyek/rama-digital-signal/rama-digital-signal-room-9x16.mp4`
- Generate: `proyek/rama-digital-signal/rama-digital-signal-room-9x16-sampul.jpg`
- Deliver: `~/Videos/Ads/Rama Digital/Digital Marketing Setup/rama-digital-signal-room-9x16.mp4`
- Deliver: `~/Videos/Ads/Rama Digital/Digital Marketing Setup/rama-digital-signal-room-9x16-sampul.jpg`
- Modify: `proyek/rama-digital-signal/naskah.md`

**Interfaces:**

- The render command consumes the applied composition and `aset/master.wav`.
- `motion check` validates the MP4, audio, timing, frame 0, and A/B audio checks.
- The delivery folder contains only the verified final MP4 and its cover image.
- **Step 1: Render the 9:16 MP4 on** `rama-tuf`**.**

```sh
ssh rama-tuf 'bash -lc "cd ~/render/motion-engine && TMPDIR=$HOME/render/tmp WORKERS=4 node bin/motion.mjs render proyek/rama-digital-signal"'
```

Expected: the MP4 and cover image exist, the MP4 reports 1080×1920, and the duration is within 30,20 seconds.

- **Step 2: Run the mandatory check.**

```sh
ssh rama-tuf 'bash -lc "cd ~/render/motion-engine && TMPDIR=$HOME/render/tmp node bin/motion.mjs check proyek/rama-digital-signal"'
```

Expected: all six checks pass. Record every reported number in `naskah.md`.

- **Step 3: Capture visual checkpoints.**

```sh
ssh rama-tuf 'bash -lc "cd ~/render/motion-engine && TMPDIR=$HOME/render/tmp node bin/motion.mjs shot proyek/rama-digital-signal 0 4.8 10.5 16.0 22.0 28.8"'
```

Inspect frame 0, the broken connector, the merge impact, the proof checklist, and the final CTA. Expected: frame 0 is readable, the merge impact occurs once, and the CTA remains visible at 28,8 seconds.

- **Step 4: Copy the verified artifacts to the delivery folder.**

mkdir -p "$HOME/Videos/Ads/Rama Digital/Digital Marketing Setup"

```sh
rsync -av rama-tuf:~/render/motion-engine/proyek/rama-digital-signal/rama-digital-signal-room-9x16.mp4 "$HOME/Videos/Ads/Rama Digital/Digital Marketing Setup/"
rsync -av rama-tuf:~/render/motion-engine/proyek/rama-digital-signal/rama-digital-signal-room-9x16-sampul.jpg "$HOME/Videos/Ads/Rama Digital/Digital Marketing Setup/"
```

Expected: both local files have non-zero size and match the remote checksummed artifacts.

- **Step 5: Verify the delivered file locally.**

```
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$HOME/Videos/Ads/Rama Digital/Digital Marketing Setup/rama-digital-signal-room-9x16.mp4"
ffprobe -v error -show_entries format=duration -of default=nw=1 "$HOME/Videos/Ads/Rama Digital/Digital Marketing Setup/rama-digital-signal-room-9x16.mp4"
```

Expected: `1080,1920` and a duration between 29,00 and 30,20 seconds.

- **Step 6: Commit the final source and measured naskah.**

```sh
git add proyek/rama-digital-signal
git commit -m "feat: deliver Rama Digital Signal Room Reels source" -m "Co-Authored-By: CADIS <agent@cadis.digital>"
```

- **Step 7: Push the verified source branch.**

```sh
git push origin main
```

Expected: remote `main` contains the source commit and the local delivery folder contains the verified MP4 and cover image.
