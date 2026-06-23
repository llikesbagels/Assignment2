# Through the Trees
**GBDA 302 — Assignment 2 | Group [#]**

---

## Game Concept

*Through the Trees* is a top-down pixel-style game where a girl tries to navigate through a forest and reach the river before she gets lost. The challenge comes from a control-flip mechanic rooted in Acquired Brain Injury (ABI) — specifically, the spatial disorientation caused by Basal Ganglia damage.

This is not a simulation or awareness game. The disability is embedded in the core mechanic itself: at random intervals, the player's left and right controls swap. The game cannot function the same without it.

---

## Core Mechanic — The Control Flip

At random intervals (every 5–8 seconds), the left/right WASD controls reverse without warning. A brief white screen flash signals the change. A red border and "DISORIENTED" indicator appear while the flip is active.

This forces the player to:
- Re-process their spatial orientation mid-movement
- Slow down and make deliberate decisions rather than reacting automatically
- Experience how normal navigation suddenly requires conscious effort

The flip is always present across the level. It is not a one-time effect.

**Controls:**
- `W A S D` — move (A/D flip during ABI episodes)
- Collect all 3 stumps, then reach the river exit

---

## Affordances

Players understand what to do without text instructions:

- **Stumps glow** with a warm light — they read as collectibles
- **The river tile** shimmers and is visually distinct from the forest floor
- **The river changes colour** (brightens) once all stumps are collected — it "unlocks"
- **The red border pulse** during flip tells the player something is wrong without explaining what
- **The white flash** gives a half-second warning before disorientation hits, teaching the player to anticipate it over time

---

## GameFlow

| Principle | Implementation |
|---|---|
| Clear goal | Collect 3 stumps → reach river |
| Immediate feedback | Stumps disappear on collect, HUD updates, exit colour changes |
| Challenge progression | Open paths early, tighter navigation near bears later |
| Player learning | First flip happens in open space — no punishment, just discovery |

---

## How the Disability Shapes Gameplay

Basal Ganglia damage in ABI affects spatial orientation and automatic motor control — things that used to feel automatic (like knowing which direction you're walking) suddenly require conscious thought.

In the game:
- Moving through the forest normally is easy
- The moment the flip activates, a familiar action (pressing A to go left) becomes wrong
- Players must pause, reorient, and re-execute — just as an ABI survivor must consciously rethink automatic actions
- This is repeated throughout the level, not just once

---

## Iteration Notes
*(To be filled in after playtesting)*

---

## File Structure

```
ASSIGNMENT2/
├── index.html       — entry point
├── style.css        — page layout and canvas styling
├── sketch.js        — p5 setup/draw/input
├── game.js          — constants, global state, asset refs
├── mechanics.js     — ABI flip mechanic logic
├── player.js        — player movement, collision, animation
├── enemies.js       — bear patrol, collectibles
├── scenes.js        — draw functions per game state
└── assets/
    └── images/      — banf.png, bear.jpg, grass.jpg, etc.
```