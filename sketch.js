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
    case STATE_TITLE:    drawTitle();    break;
    case STATE_PLAY:     updateGame(); drawGame(); break;
    case STATE_WIN:      drawWin();      break;
    case STATE_GAMEOVER: drawGameOver(); break;
  }
}

// ─── GAME UPDATE ──────────────────────────────────────────
function updateGame() {
  handleInput();
  applyPhysics();
  updateFlip();
  updateBears();
  checkObstacleCollisions();
  checkCollectibles();
  updateInvincibility();
  checkWin();

  // Sprite animation
  if (player.isMoving) {
    player.frameTimer++;
    if (player.frameTimer >= SPRITE.animSpeed) {
      player.frameTimer = 0;
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

  // Swap A/D when flipped — the ABI mechanic
  let moveLeft  = flipped ? 68 : 65; // D key when flipped, A normally
  let moveRight = flipped ? 65 : 68; // A key when flipped, D normally

  const MOVE_SPEED   = 3;
  const PLAYER_LOCK_X = CANVAS_W * 0.35; // player stays left of this, world scrolls

  if (keyIsDown(moveLeft)) {
    // Only scroll back if we've moved forward; player walks left on screen
    if (scrollX < 0) {
      scrollX += MOVE_SPEED;
      if (scrollX > 0) scrollX = 0;
    } else if (player.x > 80) {
      player.x -= MOVE_SPEED;
    }
    player.direction = 'left';
    player.isMoving  = true;
  }

  if (keyIsDown(moveRight)) {
    if (player.x < PLAYER_LOCK_X) {
      // Player walks right freely on screen
      player.x += MOVE_SPEED;
    } else {
      // Scroll the world leftward
      scrollX -= MOVE_SPEED;
      let minScroll = -(levelLength - CANVAS_W);
      if (scrollX < minScroll) scrollX = minScroll;
    }
    player.direction = 'right';
    player.isMoving  = true;
  }

  // Jump — SPACE or W
  if ((keyIsDown(32) || keyIsDown(87)) && player.onGround) {
    player.vy       = JUMP_FORCE;
    player.onGround = false;
  }

  // Keep player on screen horizontally
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