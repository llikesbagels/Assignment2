# Through the Trees
**GBDA 302 — Assignment 2 | Group [#]**

---

## Game Concept & Mechanics

*Through the Trees* is a pixel-style side-scrolling platformer. A girl steps off a train into a dense forest and must reach home before dark. The forest is full of obstacles — bears, trees, biting cold — and her ABI makes navigation unreliable.

**Core mechanic — the control flip:**
At random intervals, the left and right movement keys (A and D) silently swap. Press D expecting to go right, and you go left instead. The flip lasts a few seconds, then resets. A warning flash appears at the screen edges just before each flip, giving the player a beat to prepare — but not enough to fully avoid disorientation.

This mechanic simulates **Basal Ganglia ABI**, which affects spatial orientation, directional processing, and automatic motor responses. The key insight: things that feel automatic (walking left = press left) suddenly require conscious re-evaluation.

---

## How Affordances Guide Interaction

- **A / D keys** are the standard WASD movement scheme. No instruction needed — players try them immediately.
- **The first flip** happens in open space with no obstacles nearby. The player experiences disorientation safely, learns to correct, and understands the mechanic through play.
- **Red edge flash** before each flip signals something is about to change without explaining what. Players learn to treat it as a warning cue.
- **Progress signs** nailed to trees (e.g. "ZONE 1", "HALFWAY") show advancement without menus or cutscenes.
- **The sun timer bar** in the top right communicates urgency through colour shift (amber → red) without a countdown clock.
- **Frost vignette** builds at screen edges when the player takes damage — communicates danger visually without text.

---

## How GameFlow Supports Learning

| GameFlow Principle | How it appears in the game |
|---|---|
| Clear goal | Reach the end of the forest before the sun sets |
| Immediate feedback | Frost builds on hits; screen flashes on flip warning |
| Challenge progression | Sparse obstacles early → tighter gaps and more bears later |
| Player agency | Jump timing, path choice, and flip recovery are all player decisions |
| Win / lose clarity | Win: reach exit. Lose: health depletes from too many hits |

The tutorial section (first ~700px of the level) has wide paths and the first flip in open space. Obstacles are introduced one type at a time — static trees first, then moving bears — before both appear together.

---

## How the Disability Shapes Gameplay

The ABI mechanic (control flip) is **embedded in the control scheme itself**. It cannot be removed without fundamentally changing how the game works.

- It affects **timing** — the flip can hit mid-jump or mid-dodge
- It affects **control** — muscle memory works against the player
- It affects **decision-making** — players have to consciously think about which direction key to press, rather than moving automatically
- It is **present every run**, not a one-time event
- It **escalates in difficulty** as obstacle density increases, making the same disorientation more consequential later in the level

The game never tells the player "this character has ABI." The mechanic communicates it through play.

---

## Iteration Changes from Playtesting

*(Fill this in after playtesting sessions)*

- Change 1:
- Change 2:
- Change 3:

---

## Controls

| Key | Action |
|---|---|
| A | Move left (or right when flipped) |
| D | Move right (or left when flipped) |
| SPACE / W | Jump |
| SPACE | Start / restart (on title / game over screens) |

---

## File Structure

```
ASSIGNMENT2/
├── index.html       — entry point
├── sketch.js        — p5.js setup, draw loop, input
├── game.js          — constants, player state, physics, game logic
├── scenes.js        — all drawing functions per game state
├── style.css        — page styling
├── libraries/
│   └── p5.min.js
├── assets/
│   └── images/
│       ├── banf.png       — character sprite sheet
│       ├── bear.jpg       — bear obstacle
│       └── winscreen.jpg  — win screen background
└── README.md
```