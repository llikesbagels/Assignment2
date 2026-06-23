// ─── p5.js ENTRY POINT ────────────────────────────────────

function preload() {
  characterSheet = loadImage('assets/images/banf.png',
    () => {}, () => { characterSheet = null; });
  bearImg = loadImage('assets/images/bear.jpg',
    () => {}, () => { bearImg = null; });
}

function setup() {
  let canvas = createCanvas(CANVAS_W, CANVAS_H);
  canvas.parent('game-wrapper');
  imageMode(CENTER);
  textFont('monospace');
  resetGame();
  gameState = STATE_TITLE;
}

function draw() {
  switch (gameState) {
    case STATE_TITLE:    drawTitle();              break;
    case STATE_PLAY:     updateGame(); drawGame(); break;
    case STATE_WIN:      drawWin();                break;
    case STATE_GAMEOVER: drawGameOver();           break;
  }
}

// ─── GAME UPDATE ──────────────────────────────────────────
function updateGame() {
  handleInput();
  applyPhysics();
  updateFlip();
  updateBear();
  checkCollisions();
  updateInvincibility();
  checkWin();

  // Sprite animation
  if (player.isMoving) {
    player.frameTimer++;
    if (player.frameTimer >= SPRITE.animSpeed) {
      player.frameTimer   = 0;
      player.currentFrame = (player.currentFrame + 1) % SPRITE.numFrames;
    }
  } else {
    player.currentFrame = 0;
    player.frameTimer   = 0;
  }
}

// ─── INPUT ────────────────────────────────────────────────
function handleInput() {
  player.isMoving = false;

  // Core ABI mechanic: A/D silently swap when flipped
  let goLeft  = flipped ? 68 : 65;   // D when flipped, A normally
  let goRight = flipped ? 65 : 68;   // A when flipped, D normally

  const PLAYER_LOCK_X = CANVAS_W * 0.40;

  if (keyIsDown(goLeft)) {
    if (scrollX < 0) {
      scrollX += MOVE_SPEED;
      if (scrollX > 0) scrollX = 0;
    } else if (player.x > 80) {
      player.x -= MOVE_SPEED;
    }
    player.direction = 'left';
    player.isMoving  = true;
  }

  if (keyIsDown(goRight)) {
    let minScroll = -(LEVEL_LENGTH - CANVAS_W);
    if (player.x < PLAYER_LOCK_X) {
      player.x += MOVE_SPEED;
    } else if (scrollX > minScroll) {
      // Scroll the world
      scrollX -= MOVE_SPEED;
      if (scrollX < minScroll) scrollX = minScroll;
    } else {
      // World fully scrolled — let player walk right freely into the river
      player.x += MOVE_SPEED;
    }
    player.direction = 'right';
    player.isMoving  = true;
  }

  // Jump — SPACE or W
  if ((keyIsDown(32) || keyIsDown(87)) && player.onGround) {
    player.vy       = JUMP_FORCE;
    player.onGround = false;
  }

  player.x = constrain(player.x, 60, CANVAS_W - 60);
}

// ─── KEY PRESSED ──────────────────────────────────────────
function keyPressed() {
  if (key === ' ') {
    if (gameState === STATE_TITLE) {
      resetGame();
      gameState = STATE_PLAY;
    } else if (gameState === STATE_WIN || gameState === STATE_GAMEOVER) {
      resetGame();
      gameState = STATE_PLAY;
    }
  }
}