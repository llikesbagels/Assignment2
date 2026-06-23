// ─── CANVAS ───────────────────────────────────────────────
const CANVAS_W = 800;
const CANVAS_H = 400;

// ─── WORLD ────────────────────────────────────────────────
const GROUND_Y   = CANVAS_H - 70;
const GRAVITY    = 0.55;
const JUMP_FORCE = -13;
const MOVE_SPEED = 3;

// ─── GAME STATES ──────────────────────────────────────────
const STATE_TITLE    = 'title';
const STATE_PLAY     = 'play';
const STATE_WIN      = 'win';
const STATE_GAMEOVER = 'gameover';

// ─── LEVEL LENGTH ─────────────────────────────────────────
const LEVEL_LENGTH = 5000;

// ─── ZONES (world-space X) ────────────────────────────────
// Zone 0: open path, learn movement              0 – 900
// Zone 1: first flip, open air                  900 – 1400
// Zone 2: two trees to weave through            1400 – 2000
// Zone 3: branch platforms + flip at platforms  2000 – 2900
// Zone 4: bear timing puzzle                    2900 – 3700
// Zone 5: flip fires when near bear             3700 – 4400
// Zone 6: river / win                           4400 – 5000

// ─── FLIP MECHANIC ────────────────────────────────────────
// Flip 1: open air ~1000px  (player learns with no punishment)
// Flip 2: platform zone ~2150px  (flip while jumping)
// Flip 3: bear proximity — triggered when player gets close (not position-based)
const FLIP_SCHEDULE  = [1000, 2150]; // world-X triggers for flips 1 & 2
const FLIP_DURATION  = 180;   // frames flipped
const FLIP_WARNING   = 60;    // warning frames before position-based flips

// ─── PLAYER SPRITE SHEET ──────────────────────────────────
const SPRITE = {
  frameWidth:  65.5,
  frameHeight: 50,
  numFrames:   9,
  animSpeed:   8,
  scale:       1.1,
  rows:    { up: 0, left: 1, right: 2, down: 3 },
  offsets: {
    down:  { x: 0, y: -9.5 },
    right: { x: 0, y: 105  },
    left:  { x: 0, y: 27   },
    up:    { x: 0, y: 9.5  },
  },
};

// ─── PLAYER ───────────────────────────────────────────────
let player = {
  x: 120, y: GROUND_Y,
  vy: 0,  w: 40, h: 55,
  onGround: false,
  currentFrame: 0, frameTimer: 0,
  direction: 'right', isMoving: false,
  health: 3, maxHealth: 3,
  invincible: false, invincibleTimer: 0,
  INVINCIBLE_FRAMES: 90,
};

// ─── WORLD STATE ──────────────────────────────────────────
let scrollX   = 0;
let gameState = STATE_TITLE;

// ─── FLIP STATE ───────────────────────────────────────────
let flipped         = false;
let flipTimer       = 0;
let flipIndex       = 0;      // index into FLIP_SCHEDULE
let bearFlipFired   = false;  // so bear-proximity flip only fires once
let warningActive   = false;

// ─── OBSTACLES & PLATFORMS ────────────────────────────────
let obstacles  = [];   // { x, y, w, h, type:'tree'|'sign'|'platform' }
let platforms  = [];   // branch platforms (subset, kept separate for physics)
let bear       = null;

// ─── CHECKPOINT ───────────────────────────────────────────
// When the player falls off a platform they respawn here, not at level start
const PLATFORM_CHECKPOINT_X      = 2000;  // world X of platform zone start
const PLATFORM_CHECKPOINT_SCROLL = -(PLATFORM_CHECKPOINT_X - 200); // scrollX at checkpoint

// ─── ASSETS ───────────────────────────────────────────────
let characterSheet;
let bearImg;

// ─── FROST / DAMAGE OVERLAY ───────────────────────────────
let frostLevel = 0;
const FROST_PER_HIT = 0.34;
const FROST_DECAY   = 0.0015;  // faster recovery — less punishing visually

// ─── WIN FLASH ────────────────────────────────────────────
let winTimer = 0;  // counts up after win trigger for a brief "you made it" flash

// ─────────────────────────────────────────────────────────
function resetGame() {
  player.x = 120;
  player.y = GROUND_Y;
  player.vy = 0;
  player.health = player.maxHealth;
  player.invincible = false;
  player.invincibleTimer = 0;
  player.direction = 'right';
  player.isMoving  = false;

  scrollX         = 0;
  frostLevel      = 0;
  flipped         = false;
  flipTimer       = 0;
  flipIndex       = 0;
  bearFlipFired   = false;
  warningActive   = false;
  winTimer        = 0;

  buildLevel();
}

// ─────────────────────────────────────────────────────────
// BUILD LEVEL
// ─────────────────────────────────────────────────────────
function buildLevel() {
  obstacles = [];
  platforms = [];
  bear      = null;

  // ── Zone 2: just two spaced trees, generous gaps ──
  const treeXs = [1450, 1700];
  for (let tx of treeXs) {
    obstacles.push({ x: tx, y: GROUND_Y - 100, w: 36, h: 110, type: 'tree' });
  }

  // ── Zone 3: branch platforms ──
  // Three platforms at varying heights; player must jump between them.
  // Flip fires partway through (at FLIP_SCHEDULE[1] = 2150).
  // If player falls below GROUND_Y while scrollX puts them in the platform zone,
  // they take damage and respawn at the checkpoint.
  const platformData = [
    { x: 2050, y: GROUND_Y - 90,  w: 130, h: 14 },  // first — low, easy
    { x: 2260, y: GROUND_Y - 130, w: 110, h: 14 },  // second — higher (flip fires here)
    { x: 2460, y: GROUND_Y - 100, w: 130, h: 14 },  // third — back down
  ];
  for (let p of platformData) {
    platforms.push({ ...p, type: 'platform' });
    obstacles.push({ ...p, type: 'platform' });
  }

  // ── Zone 4 & 5: ONE bear pacing ──
  bear = {
    x: 3100, y: GROUND_Y - 40, w: 48, h: 48,
    startX: 3100, range: 110, dir: 1, speed: 1.0,
  };

  // ── Progress signs ──
  obstacles.push({ x: 800,  type: 'sign', label: 'PATH AHEAD'  });
  obstacles.push({ x: 1950, type: 'sign', label: 'WATCH YOUR STEP' });
  obstacles.push({ x: 2700, type: 'sign', label: 'ALMOST HOME' });
  obstacles.push({ x: 4300, type: 'sign', label: '→ RIVER'     });
}

// ─────────────────────────────────────────────────────────
// PHYSICS — gravity, ground, platform landing
// ─────────────────────────────────────────────────────────
function applyPhysics() {
  player.vy += GRAVITY;
  player.y  += player.vy;

  player.onGround = false;

  // Ground landing
  if (player.y >= GROUND_Y) {
    // Check: are we in the platform zone? Falling here = damage + checkpoint
    let worldX = -scrollX + player.x;
    if (worldX > 2000 && worldX < 2650 && player.vy > 0) {
      // Fell off platforms
      takeDamage();
      respawnAtCheckpoint();
      return;
    }
    player.y        = GROUND_Y;
    player.vy       = 0;
    player.onGround = true;
  }

  // Platform landing (top-only, only when falling)
  if (player.vy > 0) {
    let px = player.x - scrollX;
    for (let p of platforms) {
      let prevBottom = (player.y - player.vy) - player.h; // top of player last frame... actually use feet
      let feetY      = player.y;                           // feet = player.y (bottom)
      let feetPrev   = feetY - player.vy;
      if (px + player.w/2 > p.x && px - player.w/2 < p.x + p.w) {
        if (feetPrev <= p.y && feetY >= p.y) {
          player.y        = p.y;
          player.vy       = 0;
          player.onGround = true;
        }
      }
    }
  }

  if (player.x < 60) player.x = 60;
  if (player.x > CANVAS_W * 0.45) player.x = CANVAS_W * 0.45;
}

// ─────────────────────────────────────────────────────────
// CHECKPOINT RESPAWN
// ─────────────────────────────────────────────────────────
function respawnAtCheckpoint() {
  // Land player at ground just before the platform section
  scrollX    = PLATFORM_CHECKPOINT_SCROLL;
  player.x   = 200;
  player.y   = GROUND_Y;
  player.vy  = 0;
  player.onGround = true;
  // Reset flip state so they get the platform flip again
  flipped       = false;
  flipTimer     = 0;
  // Only reset flip index back to platform flip if it already fired
  if (flipIndex > 1) flipIndex = 1;
}

// ─────────────────────────────────────────────────────────
// FLIP MECHANIC
// ─────────────────────────────────────────────────────────
function updateFlip() {
  let worldX = -scrollX + player.x;

  if (!flipped) {
    // Position-based flips 1 & 2
    if (flipIndex < FLIP_SCHEDULE.length) {
      let triggerX = FLIP_SCHEDULE[flipIndex];
      let warnX    = triggerX - MOVE_SPEED * FLIP_WARNING;
      warningActive = (worldX >= warnX && worldX < triggerX);
      if (worldX >= triggerX) {
        startFlip();
        flipIndex++;
      }
    } else {
      warningActive = false;
    }

    // Bear-proximity flip (flip 3) — fires once when player gets close
    if (!bearFlipFired && bear) {
      let bearScreenX = bear.x + scrollX;
      // Trigger when bear is about 250px ahead on screen
      if (bearScreenX < CANVAS_W * 0.75 && bearScreenX > 0) {
        startFlip();
        bearFlipFired = true;
        warningActive = false;
      }
    }
  } else {
    flipTimer++;
    if (flipTimer >= FLIP_DURATION) {
      flipped       = false;
      flipTimer     = 0;
    }
  }
}

function startFlip() {
  flipped       = true;
  flipTimer     = 0;
  warningActive = false;
}

// ─────────────────────────────────────────────────────────
// BEAR UPDATE
// ─────────────────────────────────────────────────────────
function updateBear() {
  if (!bear) return;
  bear.x += bear.dir * bear.speed;
  if (bear.x > bear.startX + bear.range || bear.x < bear.startX - bear.range) {
    bear.dir *= -1;
  }
}

// ─────────────────────────────────────────────────────────
// COLLISION
// ─────────────────────────────────────────────────────────
function checkCollisions() {
  if (player.invincible) return;
  let px = player.x - scrollX;

  // Trees only (not platforms — platforms are landed on, not collided with)
  for (let o of obstacles) {
    if (o.type !== 'tree') continue;
    if (rectsOverlap(px, player.y, player.w, player.h, o.x, o.y, o.w, o.h)) {
      takeDamage(); return;
    }
  }

  // Bear (world-space)
  if (bear) {
    if (rectsOverlap(px, player.y, player.w, player.h, bear.x, bear.y, bear.w, bear.h)) {
      takeDamage();
    }
  }
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  const m = 8;
  return ax+m < bx+bw-m && ax+aw-m > bx+m &&
         ay+m < by+bh-m && ay+ah-m > by+m;
}

function takeDamage() {
  frostLevel = min(1.0, frostLevel + FROST_PER_HIT);
  player.health--;
  player.invincible      = true;
  player.invincibleTimer = player.INVINCIBLE_FRAMES;
  if (player.health <= 0) {
    player.health = 0;
    gameState = STATE_GAMEOVER;
  }
}

function updateInvincibility() {
  if (player.invincible) {
    player.invincibleTimer--;
    if (player.invincibleTimer <= 0) player.invincible = false;
  }
  if (frostLevel > 0) frostLevel = max(0, frostLevel - FROST_DECAY);
}

// ─────────────────────────────────────────────────────────
// WIN CHECK — fires when player reaches the → RIVER sign (world X 4300)
// ─────────────────────────────────────────────────────────
function checkWin() {
  let worldX = player.x - scrollX;
  if (worldX >= 4300) {
    gameState = STATE_WIN;
  }
}