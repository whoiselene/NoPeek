# NoPeek
<div align="center">

```
███╗   ██╗ ██████╗ ██████╗ ███████╗███████╗██╗  ██╗
████╗  ██║██╔═══██╗██╔══██╗██╔════╝██╔════╝██║ ██╔╝
██╔██╗ ██║██║   ██║██████╔╝█████╗  █████╗  █████╔╝
██║╚██╗██║██║   ██║██╔═══╝ ██╔══╝  ██╔══╝  ██╔═██╗
██║ ╚████║╚██████╔╝██║     ███████╗███████╗██║  ██╗
╚═╝  ╚═══╝ ╚═════╝ ╚═╝     ╚══════╝╚══════╝╚═╝  ╚═╝
```

### Draw blind. Broadcast instantly. Guess before the ink dries.

*A real-time, screen-to-mobile party game built on visual deprivation and muscle memory.*

[![Made with Chaos](https://img.shields.io/badge/made%20with-chaos-000000?style=for-the-badge)](#)
[![60 FPS](https://img.shields.io/badge/vector%20stream-60%20FPS-white?style=for-the-badge&labelColor=000000)](#)
[![Screen](https://img.shields.io/badge/eyes-closed-black?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-lightgrey?style=for-the-badge&labelColor=000000)](#)

</div>

---

## What is this?

You're handed a phone. The screen is pitch black. Someone shouts a word.

You draw it anyway, blind, by feel, by muscle memory alone, while every stroke of your finger is captured, normalized, and fired across the network in real time to a shared TV screen, where it materializes stroke by stroke in front of everyone else.

They watch your blind scribble take shape. They guess. The clock runs. Chaos ensues.

There is no undo. There is no peeking. There is only NoPEEK.

---

## The Core Loop

```
    PHONE                                          TV STAGE
 (blacked out          60fps vectors           (spline-rendered
  touch surface)   x,y in [0.0, 1.0]              canvas)
      |    ------------------------------------------>   |
      |                                                   |
      |    <------------------------------------------    |
      |          game state / sync / scoring              |
```

1. Draw blind. The artist's screen goes fully opaque. No canvas, no cursor, no feedback. Just the phone's glass and their own sense of where their hand has been.
2. Stream the vector. Every touch event is normalized into a `0.0 to 1.0` floating point coordinate space and pushed over the wire at 60 FPS, decoupled from any specific screen resolution.
3. Render on the big screen. The TV stage reconstructs the stroke live using Catmull-Rom splines, turning raw jittery points into a smooth, hand-drawn line in real time.
4. Guess as it happens. Guesses flow in continuously and get scored against the answer using Levenshtein distance fuzzy matching, so close enough spelling still counts, but the algorithm won't be fooled by nonsense.
5. Everyone loses their mind, because nobody, least of all the artist, has any idea what they just drew until it's already on the TV.

---

## Under the Hood

NoPEEK looks like a stark black and white sketchbook. It is not a simple app.

| Layer | What's actually happening |
|---|---|
| Input capture | Raw touch events sampled and normalized to resolution independent `(x, y)` vectors in `[0.0, 1.0]`, same drawing, any screen size |
| Transport | Real time socket broadcast of vector streams at 60 FPS, phone to server to TV, sub frame latency |
| Rendering | Catmull-Rom spline interpolation smooths raw point clouds into continuous, natural feeling curves, no jagged polylines here |
| Texture | SVG turbulence noise (`feTurbulence`) layered into the render pipeline for that hand inked, slightly imperfect sketchbook grain |
| Audio | Web Audio API driven procedural sound synthesis. Every stroke, guess, and countdown tick is generated, not sampled |
| Guess scoring | Levenshtein edit distance fuzzy matching evaluated against the live guess stream, so typos don't kill the fun but wrong answers still don't count |

The whole aesthetic is a magic trick. Monochrome minimalism on the surface, a small orchestra of interpolation math, DSP, and string distance algorithms underneath.

---

## Why "Visual Deprivation"?

Most drawing games are about skill. NoPEEK is about disorientation.

Take away the eyes, and the hand stops trusting itself. Lines drift. Circles spiral. A "cat" becomes an abstract expressionist fever dream. The game isn't testing whether you can draw. It's testing whether you can draw without knowing you're failing, which turns out to be one of the funniest things you can do to a room full of friends.

---

## Quick Start

```bash
# clone it
git clone https://github.com/your-org/nopeek.git
cd nopeek

# install
npm install

# fire up the server and TV stage
npm run dev

# scan the QR code on the TV screen with your phone
# hand someone the controller
# turn off the lights
```

One device is the TV Stage, the shared display.
Every other device is a blind canvas waiting for its turn.

---

## Architecture at a Glance

```
nopeek/
  stage/              TV facing renderer: spline engine, noise layer, scoreboard
  controller/         Mobile blind draw surface: touch capture, vector normalizer
  server/             Real time relay: 60fps vector broadcast, room/session state
  engine/
    spline.ts         Catmull-Rom interpolation
    noise.ts          SVG turbulence texture generation
    audio.ts          Web Audio synthesis (strokes, ticks, reveals)
    match.ts          Levenshtein fuzzy guess scoring
  shared/             Vector types, protocol schema, constants
```

---

## The Rules (Roughly)

- One player draws, screen fully black, prompt whispered only to them.
- Everyone else watches the TV and shouts or types guesses.
- Correct enough guesses (fuzzy matched, typos forgiven) score points for guesser and artist.
- Round ends on correct guess or when the clock runs out, whichever is funnier.
- Rotate. Repeat. Regret nothing.

---

<div align="center">

### Turn off the lights. Hand someone a phone. Watch chaos render itself.

NoPEEK. Because seeing is for cowards.

</div>
