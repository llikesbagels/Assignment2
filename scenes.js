// ─────────────────────────────────────────────────────────
//  DRAW TITLE SCREEN
// ─────────────────────────────────────────────────────────
function drawTitle() {
  background(15, 28, 15);
  drawSky();
  drawBackgroundTrees(0);
  drawGround();

  fill(0, 0, 0, 170);
  noStroke();
  rectMode(CENTER);
  rect(CANVAS_W / 2, CANVAS_H / 2, 520, 220, 4);

  fill(180, 220, 140);
  textAlign(CENTER, CENTER);
  textSize(42);
  textStyle(BOLD);
  text('THROUGH THE TREES', CANVAS_W / 2, CANVAS_H / 2 - 60);

  fill(140, 180, 100);
  textSize(13);
  textStyle(NORMAL);
  text('A girl needs to get home before dark.', CANVAS_W / 2, CANVAS_H / 2 - 20);
  text('The forest has other ideas.', CANVAS_W / 2, CANVAS_H / 2 + 5);

  if (floor(frameCount / 35) % 2 === 0) {
    fill(220, 240, 180);
    textSize(14);
    text('PRESS SPACE TO START', CANVAS_W / 2, CANVAS_H / 2 + 55);
  }

  fill(100, 140, 80);
  textSize(11);
  text('A / D — move     SPACE or W — jump', CANVAS_W / 2, CANVAS_H / 2 + 85);

  rectMode(CORNER);
}

// ─────────────────────────────────────────────────────────
//  DRAW GAMEPLAY
// ─────────────────────────────────────────────────────────
function drawGame() {
  drawSky();
  drawBackgroundTrees(scrollX * 0.35);
  drawGround();
  drawSigns();
  drawCollectibles();
  drawTrees();
  drawBears();
  drawCharacter();
  drawHUD();
  drawFlipWarning();
  drawFrost();
}

// ─────────────────────────────────────────────────────────
//  SKY — dusk gradient, shifts warmer as you progress
// ─────────────────────────────────────────────────────────
function drawSky() {
  let progress = constrain(-scrollX / (levelLength - CANVAS_W), 0, 1);

  // top colour → bottom colour, lerped by progress
  let topR = lerp(30,  120, progress);
  let topG = lerp(50,  60,  progress);
  let topB = lerp(100, 40,  progress);
  let botR = lerp(80,  200, progress);
  let botG = lerp(120, 100, progress);
  let botB = lerp(160, 60,  progress);

  noStroke();
  let skyH = GROUND_Y + 50; // fill right down to ground
  for (let i = 0; i <= skyH; i++) {
    let t = i / skyH;
    fill(lerp(topR, botR, t), lerp(topG, botG, t), lerp(topB, botB, t));
    rect(0, i, CANVAS_W, 1);
  }
}

// ─────────────────────────────────────────────────────────
//  BACKGROUND TREES — properly tiling parallax
// ─────────────────────────────────────────────────────────
function drawBackgroundTrees(rawOffset) {
  // Spacing between bg trees
  let spacing = 90;
  let tileW   = spacing;
  // How many trees to fill the canvas + buffer
  let count   = ceil(CANVAS_W / tileW) + 3;

  // Offset within one tile cycle (always positive)
  let offset = ((rawOffset * 0.4) % tileW + tileW) % tileW;

  noStroke();
  for (let i = -1; i < count; i++) {
    let sx = i * tileW - offset;

    // Vary height by position so they're not uniform
    let seed = ((i * 137) % 7 + 7) % 7;
    let treeH = 110 + seed * 14;
    let trunkW = 10;

    // trunk
    fill(45, 28, 14);
    rect(sx + tileW * 0.5 - trunkW / 2, GROUND_Y - treeH * 0.38, trunkW, treeH * 0.42);

    // canopy — darkened for background depth
    fill(22, 52, 22);
    triangle(
      sx + tileW * 0.5,      GROUND_Y - treeH,
      sx + tileW * 0.5 - 28, GROUND_Y - treeH * 0.52,
      sx + tileW * 0.5 + 28, GROUND_Y - treeH * 0.52
    );
    fill(18, 44, 18);
    triangle(
      sx + tileW * 0.5,      GROUND_Y - treeH * 0.72,
      sx + tileW * 0.5 - 35, GROUND_Y - treeH * 0.3,
      sx + tileW * 0.5 + 35, GROUND_Y - treeH * 0.3
    );
    fill(14, 36, 14);
    triangle(
      sx + tileW * 0.5,      GROUND_Y - treeH * 0.45,
      sx + tileW * 0.5 - 42, GROUND_Y - treeH * 0.1,
      sx + tileW * 0.5 + 42, GROUND_Y - treeH * 0.1
    );
  }
}

// ─────────────────────────────────────────────────────────
//  GROUND
// ─────────────────────────────────────────────────────────
function drawGround() {
  noStroke();

  // Main dirt fill — from GROUND_Y down to bottom of canvas
  fill(55, 35, 18);
  rect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);

  // Grass strip on top
  fill(55, 110, 35);
  rect(0, GROUND_Y - 2, CANVAS_W, 18);

  // Darker grass top edge
  fill(40, 85, 25);
  rect(0, GROUND_Y - 2, CANVAS_W, 5);

  // Scrolling grass tufts
  fill(45, 95, 28);
  let tileW = 60;
  let count = ceil(CANVAS_W / tileW) + 2;
  let offset = ((scrollX) % tileW + tileW) % tileW;
  for (let i = -1; i < count; i++) {
    let gx = i * tileW + offset;
    let seed = (i * 13 + 5) % 5;
    rect(gx + seed * 8, GROUND_Y - 6, 3, 6);
    rect(gx + seed * 8 + 10, GROUND_Y - 4, 3, 4);
    rect(gx + seed * 8 + 22, GROUND_Y - 7, 3, 7);
    rect(gx + seed * 8 + 34, GROUND_Y - 5, 3, 5);
  }
}

// ─────────────────────────────────────────────────────────
//  STATIC TREES (foreground obstacles)
// ─────────────────────────────────────────────────────────
function drawTrees() {
  noStroke();
  for (let o of obstacles) {
    let sx = o.x + scrollX;
    if (sx < -80 || sx > CANVAS_W + 80) continue;

    let cx = sx + o.w / 2;

    // trunk
    fill(65, 42, 18);
    rect(cx - o.w * 0.22, GROUND_Y - o.h * 0.55, o.w * 0.44, o.h * 0.58);

    // canopy layers — brighter than bg trees
    fill(38, 100, 38);
    triangle(cx, GROUND_Y - o.h - 25, cx - 32, GROUND_Y - o.h * 0.52, cx + 32, GROUND_Y - o.h * 0.52);
    fill(30, 84, 30);
    triangle(cx, GROUND_Y - o.h, cx - 40, GROUND_Y - o.h * 0.35, cx + 40, GROUND_Y - o.h * 0.35);
    fill(24, 68, 24);
    triangle(cx, GROUND_Y - o.h * 0.65, cx - 46, GROUND_Y - o.h * 0.1, cx + 46, GROUND_Y - o.h * 0.1);
  }
}

// ─────────────────────────────────────────────────────────
//  BEARS
// ─────────────────────────────────────────────────────────
function drawBears() {
  for (let b of bears) {
    let sx = b.x + scrollX;
    if (sx < -80 || sx > CANVAS_W + 80) continue;

    if (bearImg) {
      imageMode(CORNER);
      image(bearImg, sx, b.y, b.w, b.h);
    } else {
      // placeholder
      noStroke();
      fill(90, 60, 30);
      ellipse(sx + b.w / 2, b.y + b.h * 0.55, b.w, b.h * 0.7);
      ellipse(sx + b.w / 2, b.y + b.h * 0.22, b.w * 0.58, b.h * 0.42);
      ellipse(sx + b.w * 0.28, b.y + b.h * 0.06, 9, 9);
      ellipse(sx + b.w * 0.72, b.y + b.h * 0.06, 9, 9);
    }
    imageMode(CENTER);
  }
}

// ─────────────────────────────────────────────────────────
//  COLLECTIBLES
// ─────────────────────────────────────────────────────────
function drawCollectibles() {
  for (let c of collectibles) {
    if (c.collected) continue;
    let sx = c.x + scrollX;
    if (sx < -50 || sx > CANVAS_W + 50) continue;

    let floatY = c.y + sin(frameCount * 0.05 + c.x * 0.01) * 4;
    let cx = sx + c.w / 2;

    noStroke();
    fill(215, 210, 195);
    ellipse(cx, floatY + c.h * 0.42, c.w * 0.82, c.h * 0.68);
    fill(40, 30, 25);
    ellipse(cx - 5, floatY + c.h * 0.36, 5, 5);
    ellipse(cx + 5, floatY + c.h * 0.36, 5, 5);
    stroke(40, 30, 25);
    strokeWeight(1);
    line(cx - 7, floatY + c.h * 0.58, cx + 7, floatY + c.h * 0.58);
    noStroke();
  }
}

// ─────────────────────────────────────────────────────────
//  PROGRESS SIGNS
// ─────────────────────────────────────────────────────────
function drawSigns() {
  for (let s of signs) {
    let sx = s.x + scrollX;
    if (sx < -120 || sx > CANVAS_W + 120) continue;

    noStroke();
    fill(70, 48, 20);
    rect(sx, GROUND_Y - 58, 5, 62);

    fill(195, 165, 95);
    rect(sx - 32, GROUND_Y - 78, 68, 26, 2);
    stroke(110, 80, 35);
    strokeWeight(1);
    noFill();
    rect(sx - 32, GROUND_Y - 78, 68, 26, 2);

    noStroke();
    fill(55, 30, 8);
    textAlign(CENTER, CENTER);
    textSize(8);
    textStyle(BOLD);
    text(s.label, sx + 2, GROUND_Y - 65);
    textStyle(NORMAL);
  }
}

// ─────────────────────────────────────────────────────────
//  PLAYER CHARACTER
// ─────────────────────────────────────────────────────────
function drawCharacter() {
  if (player.invincible && floor(player.invincibleTimer / 6) % 2 === 0) return;

  let drawX = player.x;
  let drawY = player.y;

  if (characterSheet) {
    let dir    = player.direction || 'right';
    let row    = SPRITE.rows[dir];
    let offset = SPRITE.offsets[dir];
    let sx = player.currentFrame * SPRITE.frameWidth + offset.x;
    let sy = row * SPRITE.frameHeight + offset.y;
    let dw = SPRITE.frameWidth  * SPRITE.scale;
    let dh = SPRITE.frameHeight * SPRITE.scale;
    imageMode(CENTER);
    image(characterSheet, drawX, drawY - player.h / 2, dw, dh, sx, sy, SPRITE.frameWidth, SPRITE.frameHeight);
  } else {
    // Placeholder
    noStroke();
    fill(200, 150, 100);
    ellipse(drawX, drawY - player.h * 0.85, 20, 20);
    fill(80, 110, 75);
    rect(drawX - 9, drawY - player.h * 0.72, 18, 26, 2);
    fill(60, 45, 30);
    rect(drawX - 9, drawY - player.h * 0.46, 7, 18, 2);
    rect(drawX + 2,  drawY - player.h * 0.46, 7, 18, 2);
  }
}

// ─────────────────────────────────────────────────────────
//  HUD
// ─────────────────────────────────────────────────────────
function drawHUD() {
  noStroke();
  textAlign(LEFT, TOP);
  textSize(11);
  fill(255);
  text('HEALTH', 12, 12);

  for (let i = 0; i < player.maxHealth; i++) {
    fill(i < player.health ? color(200, 70, 70) : color(55, 55, 55));
    ellipse(18 + i * 18, 38, 12, 12);
  }

  fill(255);
  textSize(11);
  text('SKULLS  ' + collected + ' / ' + collectibles.length, 12, 52);

  // Flipped label
  if (flipped) {
    fill(255, 70, 50, 230);
    textAlign(CENTER, TOP);
    textSize(13);
    textStyle(BOLD);
    text('! CONTROLS FLIPPED !', CANVAS_W / 2, 10);
    textStyle(NORMAL);
  }

  // Sun / time bar
  let progress = constrain(-scrollX / (levelLength - CANVAS_W), 0, 1);
  noStroke();
  fill(30, 30, 30, 180);
  rect(CANVAS_W - 155, 12, 135, 12, 4);
  fill(lerpColor(color(220, 170, 30), color(210, 55, 20), progress));
  rect(CANVAS_W - 155, 12, 135 * progress, 12, 4);
  fill(255);
  textAlign(RIGHT, TOP);
  textSize(9);
  text('TIME ▶', CANVAS_W - 12, 28);
}

// ─────────────────────────────────────────────────────────
//  FLIP WARNING — red edge flash before flip
// ─────────────────────────────────────────────────────────
function drawFlipWarning() {
  if (!warningActive) return;
  if (floor(frameCount / 8) % 2 === 0) {
    noFill();
    stroke(220, 50, 50, 170);
    strokeWeight(7);
    rect(3, 3, CANVAS_W - 6, CANVAS_H - 6);
    noStroke();
  }
}

// ─────────────────────────────────────────────────────────
//  FROST VIGNETTE
// ─────────────────────────────────────────────────────────
function drawFrost() {
  if (frostLevel <= 0.02) return;
  let alpha = frostLevel * 190;
  noStroke();
  let bands = 50;
  for (let i = 0; i < bands; i++) {
    let t = 1 - i / bands;
    fill(150, 195, 230, alpha * t * t);
    let thick = 2;
    rect(0,               i * thick,                    CANVAS_W, thick); // top
    rect(0,               CANVAS_H - i * thick - thick, CANVAS_W, thick); // bottom
    rect(i * thick,       0,                            thick, CANVAS_H); // left
    rect(CANVAS_W - i * thick - thick, 0,               thick, CANVAS_H); // right
  }
}

// ─────────────────────────────────────────────────────────
//  WIN SCREEN
// ─────────────────────────────────────────────────────────
function drawWin() {
  drawSky();
  drawBackgroundTrees(0);
  drawGround();

  fill(0, 0, 0, 170);
  noStroke();
  rectMode(CENTER);
  rect(CANVAS_W / 2, CANVAS_H / 2, 480, 200, 4);

  fill(180, 240, 150);
  textAlign(CENTER, CENTER);
  textSize(38);
  textStyle(BOLD);
  text('YOU MADE IT!', CANVAS_W / 2, CANVAS_H / 2 - 50);

  fill(140, 190, 110);
  textSize(13);
  textStyle(NORMAL);
  text('She found her way through the forest.', CANVAS_W / 2, CANVAS_H / 2 - 10);
  text('Skulls collected: ' + collected + ' / ' + collectibles.length, CANVAS_W / 2, CANVAS_H / 2 + 15);

  if (floor(frameCount / 35) % 2 === 0) {
    fill(220, 240, 180);
    textSize(13);
    text('PRESS SPACE to play again', CANVAS_W / 2, CANVAS_H / 2 + 55);
  }
  rectMode(CORNER);
}

// ─────────────────────────────────────────────────────────
//  GAME OVER SCREEN
// ─────────────────────────────────────────────────────────
function drawGameOver() {
  background(8, 12, 8);
  drawBackgroundTrees(0);
  drawGround();

  fill(0, 0, 0, 190);
  noStroke();
  rectMode(CENTER);
  rect(CANVAS_W / 2, CANVAS_H / 2, 460, 200, 4);

  fill(200, 80, 60);
  textAlign(CENTER, CENTER);
  textSize(36);
  textStyle(BOLD);
  text('LOST IN THE FOREST', CANVAS_W / 2, CANVAS_H / 2 - 50);

  fill(170, 120, 100);
  textSize(13);
  textStyle(NORMAL);
  text('The cold swallowed the path.', CANVAS_W / 2, CANVAS_H / 2 - 10);
  text('She never made it home.', CANVAS_W / 2, CANVAS_H / 2 + 15);

  if (floor(frameCount / 35) % 2 === 0) {
    fill(220, 160, 140);
    textSize(13);
    text('PRESS SPACE to try again', CANVAS_W / 2, CANVAS_H / 2 + 55);
  }
  rectMode(CORNER);
}