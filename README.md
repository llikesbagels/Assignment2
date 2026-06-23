# Through the Trees — GBDA 302 Assignment 2

## Game Concept and Mechanics

*Through the Trees* is a side-scrolling platformer. A girl needs to reach home before dark after getting off a train deep in the forest. The player moves her right using **A / D**, jumps with **Space or W**, and must navigate through trees and past a bear.

### Core Mechanic — Control Flip (ABI Spatial Disorientation)

At specific world positions, the left and right controls silently swap. Pressing D suddenly moves the player left instead of right. The flip lasts a few seconds, then snaps back. A red border flashes as a warning just before each flip triggers.

This mechanic represents Acquired Brain Injury (ABI) — specifically the spatial disorientation and disrupted motor-direction mapping that can follow a brain injury. The disability is embedded in the control system itself: removing the flip mechanic would make the game mechanically different because the entire challenge is built around reacting to and recovering from misdirected movement.

---

## How Affordances Guide Interaction

- The path goes left-to-right with a visible open corridor — players naturally walk right.
- Trees are visually solid and block movement, teaching collision without explanation.
- The bear visibly paces back and forth — players pause and wait, learning the timing window through observation.
- Signs on posts ("STAY ALERT", "→ RIVER") use environmental language to signal progress without UI text.
- The frost vignette creeping in from the edges signals danger and health loss visually.
- The sky darkens toward dusk as the player progresses, reinforcing the urgency of reaching home without a literal timer.

---

## How GameFlow Supports Learning

The level is structured across seven storyboard zones:

| Zone | What Happens |
|------|-------------|
| 0 — Open path | No obstacles. Player gets used to basic movement. |
| 1 — First flip (open air) | Flip triggers in a completely clear space. Player discovers the mechanic with zero punishment. |
| 2 — Tree weaving | A few trees to dodge. No flip. Pure obstacle navigation. |
| 3 — Flip near trees | Flip fires mid-dodge. Stakes are now real — wrong direction means hitting a tree. |
| 4 — Bear timing | One bear pacing. Player learns to wait and time their movement. |
| 5 — Flip near bear | Flip fires while passing the bear. Most chaotic moment of the level. |
| 6 — Exit | Path clears. River visible. Sign points home. Win. |

Goals are always clear (reach the right side), feedback is immediate (frost vignette, invincibility flash, health hearts), and challenge increases step by step.

---

## How the Disability Shapes Gameplay

The flip mechanic:
- Changes **control** — the player's learned muscle memory is suddenly wrong.
- Changes **timing** — a flip mid-dodge requires the player to override instinct.
- Changes **decision-making** — during a flip, the player must consciously reverse their input.
- Affects **perception** — the mismatch between intention and outcome mirrors the disorientation ABI can cause.

Without the flip, the game is a straightforward side-scroller. With it, every section demands conscious re-evaluation of which key to press — which is the point.

---

## Iteration Changes from Playtesting

*(To be filled in after in-class playtesting session)*

- Observation notes will be added here.
- Any control timing, obstacle spacing, or flip duration adjustments will be documented.

---

## Controls

| Key | Action |
|-----|--------|
| A | Move left (or right when flipped) |
| D | Move right (or left when flipped) |
| Space / W | Jump |

---

## File Structure

```
ASSIGNMENT2/
├── index.html          ← entry point
├── style.css           ← page layout and canvas styling
├── game.js             ← game logic, physics, flip mechanic, collision
├── scenes.js           ← all drawing functions
├── sketch.js           ← p5.js setup, draw loop, input handling
├── jsconfig.json       ← VS Code p5 type support
├── libraries/
│   ├── p5.min.js
│   └── p5.sound.min.js
└── assets/
    └── images/
        ├── banf.png    ← character sprite sheet
        └── bear.jpg    ← bear image
```