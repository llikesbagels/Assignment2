// ─── CANVAS ───────────────────────────────────────────────
const CANVAS_W = 800;
const CANVAS_H = 400;

// ─── WORLD ────────────────────────────────────────────────
const GROUND_Y    = CANVAS_H - 70;   // where the ground surface sits
const GRAVITY     = 0.55;
const JUMP_FORCE  = -13;
const SCROLL_SPEED = 2.5;

// ─── PLAYER SPRITE ────────────────────────────────────────
const SPRITE = {
  frameWidth:  65.5,
  frameHeight: 50,
  numFrames:   9,
  animSpeed:   8,
  scale:       1.1,
  rows: { up: 0, left: 1, right: 2, down: 3 },
  offsets: {
    down:  { x: 0, y: -9.5 },
    right: { x: 0, y: 105  },
    left:  { x: 0, y: 27   },
    up:    { x: 0, y: 9.5  },
  },
};

// ─── GAME STATES ──────────────────────────────────────────
const STATE_TITLE    = 'title';
const STATE_PLAY     = 'play';
const STATE_WIN      = 'win';
const STATE_GAMEOVER = 'gameover';

// ─── FLIP MECHANIC ────────────────────────────────────────
// Controls flip: left<->right swap to simulate ABI spatial disorientation
const FLIP_INTERVAL_MIN = 300;  // frames between flips (min)
const FLIP_INTERVAL_MAX = 500;  // frames between flips (max)
const FLIP_DURATION     = 180;  // how long the flip lasts (frames)
const FLIP_WARNING      = 60;   // warning flash before flip

// ─── PLAYER ───────────────────────────────────────────────
let player = {
  x: 120,
  y: GROUND_Y,
  vy: 0,
  w: 40,
  h: 55,
  onGround: false,
  currentFrame: 0,
  frameTimer: 0,
  direction: 'right',
  isMoving: false,
  health: 5,
  maxHealth: 5,
  invincible: false,
  invincibleTimer: 0,
  INVINCIBLE_FRAMES: 60,
};

// ─── WORLD STATE ──────────────────────────────────────────
let scrollX      = 0;        // how far we've scrolled
let gameState    = STATE_TITLE;
let levelLength  = 5000;     // total level width in px

// ─── FLIP STATE ───────────────────────────────────────────
let flipped       = false;
let flipTimer     = 0;       // counts up; when > FLIP_DURATION, unflips
let nextFlipIn    = 400;     // frames until next flip triggers
let flipCountdown = 400;     // counts down to next flip
let warningActive = false;

// ─── OBSTACLES ────────────────────────────────────────────
// Each: { x, y, w, h, type }
// type: 'tree' = static blocker, 'bear' = moves back/forth
let obstacles = [];
let bears     = [];

// ─── COLLECTIBLES (skulls / coins) ────────────────────────
let collectibles = [];
let collected    = 0;

// ─── PROGRESS SIGNS ───────────────────────────────────────
// Posted on trees — "show don't tell" progression markers
let signs = [];

// ─── ASSETS ───────────────────────────────────────────────
let characterSheet;
let bearImg;
let winScreenImg;

// ─── VIGNETTE / FROST LOSE CONDITION ──────────────────────
// Fills when player hits obstacles; full = game over
let frostLevel = 0;          // 0.0 → 1.0
const FROST_PER_HIT  = 0.15;
const FROST_DECAY    = 0.0005; // slowly recovers

// ─────────────────────────────────────────────────────────
//  HELPER: reset everything for a new game
// ─────────────────────────────────────────────────────────
function resetGame() {
  player.x       = 120;
  player.y       = GROUND_Y;
  player.vy      = 0;
  player.health  = player.maxHealth;
  player.invincible      = false;
  player.invincibleTimer = 0;
  player.direction       = 'right';
  player.isMoving        = false;

  scrollX      = 0;
  frostLevel   = 0;
  flipped      = false;
  flipTimer    = 0;
  flipCountdown = nextFlipIn = floor(random(FLIP_INTERVAL_MIN, FLIP_INTERVAL_MAX));
  warningActive = false;
  collected    = 0;

  buildLevel();
}

// ─────────────────────────────────────────────────────────
//  BUILD LEVEL — place trees, bears, signs, collectibles
// ─────────────────────────────────────────────────────────
function buildLevel() {
  obstacles    = [];
  bears        = [];
  collectibles = [];
  signs        = [];

  // ── Trees (static blockers) ──
  // Sparse at first, denser toward the end
  let treePositions = [
    380, 520, 700, 870,          // early — forgiving gaps
    1050, 1180,                  // pair
    1400, 1520, 1640,            // trio
    1900, 2050, 2150, 2280,
    2500, 2600, 2720, 2850, 2950,
    3200, 3350, 3480, 3600, 3750,
    4000, 4100, 4230, 4380, 4500, 4650, 4800,
  ];

  for (let tx of treePositions) {
    obstacles.push({
      x: tx,
      y: GROUND_Y - 90,
      w: 38,
      h: 100,
      type: 'tree',
    });
  }

  // ── Bears (pacing obstacles) ──
  // Introduced after first 600px
  let bearData = [
    { x: 650,  range: 80 },
    { x: 1100, range: 60 },
    { x: 1700, range: 100 },
    { x: 2400, range: 80 },
    { x: 3000, range: 120 },
    { x: 3900, range: 100 },
    { x: 4600, range: 80  },
  ];
  for (let b of bearData) {
    bears.push({
      x:      b.x,
      y:      GROUND_Y - 30,
      w:      40,
      h:      40,
      startX: b.x,
      range:  b.range,
      dir:    1,
      speed:  1.2,
    });
  }

  // ── Collectibles (skulls) — scattered across level ──
  let collectibleX = [300, 600, 950, 1300, 1800, 2300, 2800, 3300, 3800, 4400];
  for (let cx of collectibleX) {
    collectibles.push({
      x: cx,
      y: GROUND_Y - 80,
      w: 30,
      h: 30,
      collected: false,
    });
  }

  // ── Progress signs nailed to trees ──
  signs = [
    { x: 800,  label: 'ZONE 1'       },
    { x: 1800, label: 'ZONE 2'       },
    { x: 3000, label: 'HALFWAY'      },
    { x: 4200, label: 'ALMOST THERE' },
  ];
}

// ─────────────────────────────────────────────────────────
//  PHYSICS — gravity, jump, wall collision
// ─────────────────────────────────────────────────────────
function applyPhysics() {
  player.vy += GRAVITY;
  player.y  += player.vy;

  if (player.y >= GROUND_Y) {
    player.y       = GROUND_Y;
    player.vy      = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }

  // Keep player from going off screen left
  if (player.x < 60) player.x = 60;
  // Keep player from running too far right (they scroll the world instead)
  if (player.x > CANVAS_W * 0.45) player.x = CANVAS_W * 0.45;
}

// ─────────────────────────────────────────────────────────
//  FLIP MECHANIC UPDATE
// ─────────────────────────────────────────────────────────
function updateFlip() {
  if (!flipped) {
    flipCountdown--;
    warningActive = (flipCountdown <= FLIP_WARNING);

    if (flipCountdown <= 0) {
      flipped       = true;
      flipTimer     = 0;
      warningActive = false;
    }
  } else {
    flipTimer++;
    if (flipTimer >= FLIP_DURATION) {
      flipped       = false;
      flipCountdown = floor(random(FLIP_INTERVAL_MIN, FLIP_INTERVAL_MAX));
      warningActive = false;
    }
  }
}

// ─────────────────────────────────────────────────────────
//  OBSTACLE COLLISION CHECK
// ─────────────────────────────────────────────────────────
function checkObstacleCollisions() {
  if (player.invincible) return;

  let px = player.x - scrollX;  // player world X
  let allObstacles = [...obstacles, ...bears];

  for (let o of allObstacles) {
    if (rectsOverlap(px, player.y, player.w, player.h,
                     o.x, o.y, o.w, o.h)) {
      takeDamage();
      break;
    }
  }
}

function checkCollectibles() {
  let px = player.x - scrollX;
  for (let c of collectibles) {
    if (c.collected) continue;
    if (rectsOverlap(px, player.y, player.w, player.h,
                     c.x, c.y, c.w, c.h)) {
      c.collected = true;
      collected++;
    }
  }
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  // shrink hitboxes slightly for fairness
  let margin = 8;
  return ax + margin < bx + bw - margin &&
         ax + aw - margin > bx + margin &&
         ay + margin < by + bh - margin &&
         ay + ah - margin > by + margin;
}

function takeDamage() {
  frostLevel = min(1.0, frostLevel + FROST_PER_HIT);
  player.health--;
  player.invincible      = true;
  player.invincibleTimer = player.INVINCIBLE_FRAMES;

  if (player.health <= 0) {
    player.health = 0;
    gameState     = STATE_GAMEOVER;
  }
}

function updateInvincibility() {
  if (player.invincible) {
    player.invincibleTimer--;
    if (player.invincibleTimer <= 0) player.invincible = false;
  }
  // frost slowly heals
  if (frostLevel > 0) frostLevel = max(0, frostLevel - FROST_DECAY);
}

// ─────────────────────────────────────────────────────────
//  UPDATE BEARS (pacing)
// ─────────────────────────────────────────────────────────
function updateBears() {
  for (let b of bears) {
    b.x += b.dir * b.speed;
    if (b.x > b.startX + b.range || b.x < b.startX - b.range) {
      b.dir *= -1;
    }
  }
}

// ─────────────────────────────────────────────────────────
//  CHECK WIN
// ─────────────────────────────────────────────────────────
function checkWin() {
  if (scrollX + player.x >= levelLength - 100) {
    gameState = STATE_WIN;
  }
}