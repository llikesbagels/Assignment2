const SPRITE = {
  frameWidth:  65.5,
  frameHeight: 50,
  numFrames:   9,
  animSpeed:   15,
  scale:       0.7,

  rows: {
    up:  0,
    left:    1,
    right: 2,
    down:  3,
  },

  offsets: {
    down:  { x: 0, y: -9.5 },
    right: { x: 0, y: 105 },
    left:  { x: 0, y: 27 },
    up:    { x: 0, y: 9.5 },
  },
};

const COIN = {
  frameWidth:  50,
  frameHeight: 50,
  numFrames:   5,
  animSpeed:   6,
  scale:       1.5,
};

const TILE_SIZE = 50;

const MAZE = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4],
  [1, 2, 0, 0, 1, 0, 3, 0, 0, 3, 1, 0, 0, 0, 0, 4],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 4],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 4],
  [1, 0, 1, 1, 1, 1, 1, 3, 1, 1, 1, 0, 1, 1, 1, 4],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 3, 1, 4],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 4],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 4],
  [1, 0, 1, 3, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 4, 4],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4],
];

const TILE_COLORS = {
  0: [128, 115, 24],
  1: [128, 180, 16],
  2: [140, 115, 24],
  3: [140, 115, 24],
  4: [0, 215, 180],
  5: [255, 255, 255], //think of a way to make it grow
};

const PLAYER_SPEED = 2;
const BULLET_SPEED = 8;
const SHOOT_COOLDOWN = 20;
const ENEMY_SPEED = 1.2;
const ENEMY_SPAWN_RATE = 120;
const MAX_ENEMIES = 4;
const INVINCIBLE_FRAMES = 60;

let player = {
  x: 0,
  y: 0,
  speed: PLAYER_SPEED,
  currentFrame: 0,
  frameTimer: 0,
  direction: 'down',
  facing: { x: 0, y: 1 },
  isMoving: false,
  hw: 12,
  hh: 12,
  r: 12,
  shootTimer: 0,
  health: 3,
  invincible: false,
  invincibleTimer: 0,
};

let bullets = [];
let enemies = [];
let spawnTimer = 0;
let score = 0;
let coins = [];
let coinsCollected = 0;
let gameWon = false;
let gameOver = false;

let characterSheet;
let coinSheet;
let winScreen;

function preload() {
  characterSheet = loadImage('assets/images/banf.png');
  coinSheet = loadImage('assets/images/skull.png');
  winScreen = loadImage('assets/images/winscreen.jpg');
  bear = loadImage('assets/images/bear.jpg');
}

function setup() {
  createCanvas(TILE_SIZE * MAZE[0].length, TILE_SIZE * MAZE.length);
  imageMode(CENTER);
  textFont('monospace');

  for (let row = 0; row < MAZE.length; row++) {
    for (let col = 0; col < MAZE[row].length; col++) {
      let tile = MAZE[row][col];
      if (tile === 2) {
        player.x = col * TILE_SIZE + TILE_SIZE / 2;
        player.y = row * TILE_SIZE + TILE_SIZE / 2;
      }
      if (tile === 3) {
        coins.push({
          x: col * TILE_SIZE + TILE_SIZE / 2,
          y: row * TILE_SIZE + TILE_SIZE / 2,
          frame: floor(random(COIN.numFrames)),
          frameTimer: 0,
          collected: false,
        });
      }
    }
  }
}

function draw() {
  background(20);
  drawMaze();
  updateCoins();
  drawCoins();

  if (!gameWon && !gameOver) {
    handleInput();
    checkCoinCollection();
    checkExit();
    animateSprite();
    drawCharacter();
    drawHUD();
    spawnEnemies();
    updateEnemies();
    updateBullets();
    checkBulletEnemyCollisions();
    checkEnemyPlayerCollision();
    updateInvincibility();
    drawEnemies();
    drawBullets();

  } else if (gameWon) {
    drawCharacter();
    drawHUD();
    drawWinScreen();

  } else {
    drawCharacter();
    drawHUD();
    drawGameOver();
  }
}

function drawMaze() {
  rectMode(CORNER);
  noStroke();
  for (let row = 0; row < MAZE.length; row++) {
    for (let col = 0; col < MAZE[row].length; col++) {
      let tile = MAZE[row][col];
      if (tile === 4) {
        if (coinsCollected === coins.length) {
          fill(30, 200, 120);
        } else {
          fill(60, 100, 80);
        }
      } else {
        let c = TILE_COLORS[tile];
        fill(c[0], c[1], c[2]);
      }
      rect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }
}

function updateCoins() {
  for (let i = 0; i < coins.length; i++) {
    if (coins[i].collected) continue;
    coins[i].frameTimer++;
    if (coins[i].frameTimer >= COIN.animSpeed) {
      coins[i].frameTimer = 0;
      coins[i].frame = (coins[i].frame + 1) % COIN.numFrames;
    }
  }
}

function drawCoins() {
  for (let i = 0; i < coins.length; i++) {
    if (coins[i].collected) continue;
    let coin = coins[i];
    let sx = coin.frame * COIN.frameWidth;
    let dw = COIN.frameWidth * COIN.scale;
    let dh = COIN.frameHeight * COIN.scale;
    image(coinSheet, coin.x, coin.y, dw, dh, sx, 0, COIN.frameWidth, COIN.frameHeight);
  }
}

function handleInput() {
  player.isMoving = false;
  if (keyIsDown(87)) {
    player.y -= player.speed;
    player.direction = 'up';
    player.facing = { x: 0, y: -1 };
    player.isMoving = true;
  }
  if (keyIsDown(83)) {
    player.y += player.speed;
    player.direction = 'down';
    player.facing = { x: 0, y: 1 };
    player.isMoving = true;
  }
  if (keyIsDown(65)) {
    player.x -= player.speed;
    player.direction = 'left';
    player.facing = { x: -1, y: 0 };
    player.isMoving = true;
  }
  if (keyIsDown(68)) {
    player.x += player.speed;
    player.direction = 'right';
    player.facing = { x: 1, y: 0 };
    player.isMoving = true;
  }

  player.x = constrain(player.x, player.r, width - player.r);
  player.y = constrain(player.y, player.r, height - player.r);

  if (player.shootTimer > 0) player.shootTimer--;
  if (keyIsDown(32) && player.shootTimer === 0) {
    bullets.push({
      x: player.x + player.facing.x * (player.r + 4),
      y: player.y + player.facing.y * (player.r + 4),
      vx: player.facing.x * BULLET_SPEED,
      vy: player.facing.y * BULLET_SPEED,
    });
    player.shootTimer = SHOOT_COOLDOWN;
  }
}



function checkCoinCollection() {
  for (let i = 0; i < coins.length; i++) {
    if (coins[i].collected) continue;
    let d = dist(player.x, player.y, coins[i].x, coins[i].y);
    if (d < TILE_SIZE * 0.6) {
      coins[i].collected = true;
      coinsCollected++;
    }
  }
}

function checkExit() {
  if (coinsCollected < coins.length) return;
  for (let row = 0; row < MAZE.length; row++) {
    for (let col = 0; col < MAZE[row].length; col++) {
      if (MAZE[row][col] === 4) {
        let exitX = col * TILE_SIZE + TILE_SIZE / 2;
        let exitY = row * TILE_SIZE + TILE_SIZE / 2;
        if (dist(player.x, player.y, exitX, exitY) < TILE_SIZE * 0.6) {
          gameWon = true;
        }
      }
    }
  }
}

function animateSprite() {
  if (player.isMoving) {
    player.frameTimer++;
    if (player.frameTimer >= SPRITE.animSpeed) {
      player.frameTimer = 0;
      player.currentFrame = (player.currentFrame + 1) % SPRITE.numFrames;
    }
  } else {
    player.currentFrame = 0;
    player.frameTimer = 0;
  }
}

function drawCharacter() {
  let row = SPRITE.rows[player.direction];
  let offset = SPRITE.offsets[player.direction];
  let sx = player.currentFrame * SPRITE.frameWidth + offset.x;
  let sy = row * SPRITE.frameHeight + offset.y;
  let dw = SPRITE.frameWidth * SPRITE.scale;
  let dh = SPRITE.frameHeight * SPRITE.scale;
  imageMode(CENTER);
  if (player.invincible && floor(player.invincibleTimer / 6) % 2 === 0) return;
  image(characterSheet, player.x, player.y, dw, dh, sx, sy, SPRITE.frameWidth, SPRITE.frameHeight);
}

function drawHUD() {
  noStroke();
  fill(255);
  textSize(14);
  textAlign(LEFT);
  text('Coins: ' + coinsCollected + ' / ' + coins.length, 10, 20);
  text('Health: ' + player.health, 10, 40);
  text('Score: ' + score, 10, 60);
  if (coinsCollected === coins.length) {
    fill(30, 200, 120);
    text('Exit is open! Find the green tile.', 10, 80);
  }
}

function spawnEnemies() {
  if (enemies.length >= MAX_ENEMIES) return;
  spawnTimer++;
  if (spawnTimer < ENEMY_SPAWN_RATE) return;
  spawnTimer = 0;
  let openTiles = [];
  for (let row = 0; row < MAZE.length; row++) {
    for (let col = 0; col < MAZE[row].length; col++) {
      if (MAZE[row][col] === 0) openTiles.push({ row, col });
    }
  }
  if (openTiles.length === 0) return;
  let tile = random(openTiles);
  enemies.push({
    x: tile.col * TILE_SIZE + TILE_SIZE / 2,
    y: tile.row * TILE_SIZE + TILE_SIZE / 2,
    r: 12,
    speed: ENEMY_SPEED + random(0.4),
  });
}

function updateEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    let dx = player.x - e.x;
    let dy = player.y - e.y;
    let d = dist(e.x, e.y, player.x, player.y);
    if (d > 0) {
      e.x += (dx / d) * e.speed;
      e.y += (dy / d) * e.speed;
    }
    if (e.x < -20 || e.x > width + 20 || e.y < -20 || e.y > height + 20) {
      enemies.splice(i, 1);
    }
  }
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].x += bullets[i].vx;
    bullets[i].y += bullets[i].vy;
    if (bullets[i].x < 0 || bullets[i].x > width || bullets[i].y < 0 || bullets[i].y > height) {
      bullets.splice(i, 1);
    }
  }
}

function checkBulletEnemyCollisions() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = enemies.length - 1; j >= 0; j--) {
      let d = dist(bullets[i].x, bullets[i].y, enemies[j].x, enemies[j].y);
      if (d < enemies[j].r + 6) {
        bullets.splice(i, 1);
        enemies.splice(j, 1);
        score++;
        break;
      }
    }
  }
}

function checkEnemyPlayerCollision() {
  if (player.invincible) return;
  for (let i = 0; i < enemies.length; i++) {
    let d = dist(player.x, player.y, enemies[i].x, enemies[i].y);
    if (d < player.r + enemies[i].r - 8) {
      player.health--;
      player.invincible = true;
      player.invincibleTimer = INVINCIBLE_FRAMES;
      if (player.health <= 0) {
        player.health = 0;
        gameOver = true;
      }
      break;
    }
  }
}

function updateInvincibility() {
  if (player.invincible) {
    player.invincibleTimer--;
    if (player.invincibleTimer <= 0) {
      player.invincible = false;
    }
  }
}

function drawBullets() {
  fill(255);
  noStroke();
  for (let i = 0; i < bullets.length; i++) {
    ellipse(bullets[i].x, bullets[i].y, 10);
  }
}

function drawEnemies() {
  fill(255, 80, 80);
  noStroke();
  for (let i = 0; i < enemies.length; i++) {
    let e = enemies[i];
imageMode(CENTER);
    image(bear, e.x, e.y, e.r * 2, e.r * 2);
  }
}

function drawWinScreen() {
  fill(0, 0, 0, 180);
  rectMode(CORNER);
  rect(0, 0, width, height);
  imageMode(CENTER);
  image(winScreen, width / 2, height / 2, width, height);
  fill(255);
  textAlign(CENTER);
  textSize(48);
  text('TP LEVEL 2!', width / 2, height / 2 - 20);
  textSize(16);
  text('All Skulls Taken', width / 2, height / 2 + 20);
}

function drawGameOver() {
  fill(0, 0, 0, 180);
  rectMode(CORNER);
  rect(0, 0, width, height);
  fill(255, 50, 50);
  textAlign(CENTER);
  textSize(48);
  text('Game Over', width / 2, height / 2 - 20);
  textSize(16);
  text('Press SPACE to restart.', width / 2, height / 2 + 20);
 
}


function keyPressed() {
  if ((key === " " || key === " ") && gameState !== STATE_PLAY) {
    gameState = STATE_PLAY;
    score = 0;
    scrollY = 0;
    spawnTimer = 0;
    bullets = [];
    enemies = [];

    player.x = 400;
    player.y = 370;
    player.direction = { x: 0, y: -1 };
    player.shootTimer = 0;
    player.health = player.maxHealth;
    player.invincible = false;
    player.invincibleTimer = 0;
    player.bounceVX = 0;
    player.bounceVY = 0;

    // music.loop();
  }
}