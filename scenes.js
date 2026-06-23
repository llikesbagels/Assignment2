// ─────────────────────────────────────────────────────────
// TITLE SCREEN
// ─────────────────────────────────────────────────────────
function drawTitle() {
  background(12, 22, 12);
  drawSky(0);
  drawBgTrees(0);
  drawGround();

  noStroke();
  fill(0, 0, 0, 160);
  rectMode(CENTER);
  rect(CANVAS_W / 2, CANVAS_H / 2, 500, 215, 6);

  fill(190, 225, 150);
  textAlign(CENTER, CENTER);
  textSize(38); textStyle(BOLD);
  text('THROUGH THE TREES', CANVAS_W / 2, CANVAS_H / 2 - 65);

  fill(140, 180, 105);
  textSize(12); textStyle(NORMAL);
  text('She just needs to get home.', CANVAS_W / 2, CANVAS_H / 2 - 28);
  text('The forest has other ideas.',  CANVAS_W / 2, CANVAS_H / 2 - 10);

  if (floor(frameCount / 32) % 2 === 0) {
    fill(230, 245, 190); textSize(13);
    text('PRESS SPACE TO START', CANVAS_W / 2, CANVAS_H / 2 + 42);
  }
  fill(100, 135, 75); textSize(10);
  text('A / D  move          SPACE or W  jump', CANVAS_W / 2, CANVAS_H / 2 + 72);
  rectMode(CORNER);
}

// ─────────────────────────────────────────────────────────
// GAMEPLAY
// ─────────────────────────────────────────────────────────
function drawGame() {
  let progress = constrain(-scrollX / (LEVEL_LENGTH - CANVAS_W), 0, 1);
  drawSky(progress);
  drawBgTrees(scrollX * 0.3);
  drawGround();
  drawSigns();
  drawTrees();
  drawPlatforms();
  drawBear();
  drawCharacter();
  drawRiver(progress);
  drawHUD();
  drawFlipWarning();
  drawFrost();
}

// ─────────────────────────────────────────────────────────
// SKY
// ─────────────────────────────────────────────────────────
function drawSky(progress) {
  let topR = lerp(28, 110, progress), topG = lerp(48, 58, progress), topB = lerp(95, 38, progress);
  let botR = lerp(72, 190, progress), botG = lerp(112, 95, progress), botB = lerp(150, 55, progress);
  noStroke();
  for (let i = 0; i <= GROUND_Y + 50; i++) {
    let t = i / (GROUND_Y + 50);
    fill(lerp(topR, botR, t), lerp(topG, botG, t), lerp(topB, botB, t));
    rect(0, i, CANVAS_W, 1);
  }
}

// ─────────────────────────────────────────────────────────
// BACKGROUND TREES — parallax silhouettes
// ─────────────────────────────────────────────────────────
function drawBgTrees(rawOffset) {
  let spacing = 100;
  let count   = ceil(CANVAS_W / spacing) + 3;
  let offset  = ((rawOffset * 0.35) % spacing + spacing) % spacing;
  noStroke();
  for (let i = -1; i < count; i++) {
    let sx   = i * spacing - offset;
    let seed = ((i * 137) % 7 + 7) % 7;
    let h    = 100 + seed * 12;
    fill(38, 24, 10);
    rect(sx + spacing*0.5 - 4, GROUND_Y - h*0.38, 8, h*0.42);
    fill(18, 44, 18);
    triangle(sx+spacing*0.5, GROUND_Y-h,       sx+spacing*0.5-24, GROUND_Y-h*0.52, sx+spacing*0.5+24, GROUND_Y-h*0.52);
    fill(15, 36, 15);
    triangle(sx+spacing*0.5, GROUND_Y-h*0.70,  sx+spacing*0.5-30, GROUND_Y-h*0.30, sx+spacing*0.5+30, GROUND_Y-h*0.30);
    fill(12, 30, 12);
    triangle(sx+spacing*0.5, GROUND_Y-h*0.44,  sx+spacing*0.5-36, GROUND_Y-h*0.08, sx+spacing*0.5+36, GROUND_Y-h*0.08);
  }
}

// ─────────────────────────────────────────────────────────
// GROUND
// ─────────────────────────────────────────────────────────
function drawGround() {
  noStroke();
  fill(48, 30, 14);
  rect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
  fill(50, 100, 30);
  rect(0, GROUND_Y - 2, CANVAS_W, 16);
  fill(38, 78, 22);
  rect(0, GROUND_Y - 2, CANVAS_W, 5);

  fill(42, 88, 26);
  let tile = 55, count = ceil(CANVAS_W / tile) + 2;
  let off  = ((scrollX) % tile + tile) % tile;
  for (let i = -1; i < count; i++) {
    let gx   = i * tile + off;
    let seed = (i * 11 + 3) % 5;
    rect(gx + seed*7,    GROUND_Y - 6, 3, 6);
    rect(gx + seed*7+9,  GROUND_Y - 4, 3, 4);
    rect(gx + seed*7+20, GROUND_Y - 7, 3, 7);
    rect(gx + seed*7+32, GROUND_Y - 5, 3, 5);
  }
}

// ─────────────────────────────────────────────────────────
// FOREGROUND TREES
// ─────────────────────────────────────────────────────────
function drawTrees() {
  noStroke();
  for (let o of obstacles) {
    if (o.type !== 'tree') continue;
    let sx = o.x + scrollX;
    if (sx < -100 || sx > CANVAS_W + 100) continue;
    let cx = sx + o.w / 2;
    fill(58, 36, 14);
    rect(cx - o.w*0.2, GROUND_Y - o.h*0.5, o.w*0.4, o.h*0.55);
    fill(38, 95, 38);
    triangle(cx, GROUND_Y-o.h-20,    cx-28, GROUND_Y-o.h*0.52, cx+28, GROUND_Y-o.h*0.52);
    fill(30, 80, 30);
    triangle(cx, GROUND_Y-o.h,       cx-36, GROUND_Y-o.h*0.32, cx+36, GROUND_Y-o.h*0.32);
    fill(22, 62, 22);
    triangle(cx, GROUND_Y-o.h*0.62,  cx-44, GROUND_Y-o.h*0.08, cx+44, GROUND_Y-o.h*0.08);
  }
}

// ─────────────────────────────────────────────────────────
// BRANCH PLATFORMS
// ─────────────────────────────────────────────────────────
function drawPlatforms() {
  noStroke();
  for (let p of platforms) {
    let sx = p.x + scrollX;
    if (sx < -200 || sx > CANVAS_W + 200) continue;

    // Branch plank — dark wood colour
    fill(72, 44, 16);
    rect(sx, p.y, p.w, p.h, 3);

    // Bark texture lines
    stroke(55, 32, 10); strokeWeight(1);
    for (let i = 0; i < p.w; i += 18) {
      line(sx + i, p.y + 2, sx + i + 10, p.y + p.h - 2);
    }
    noStroke();

    // Tiny leaves on left/right tips
    fill(35, 85, 30);
    ellipse(sx + 8,        p.y - 6, 18, 12);
    ellipse(sx + p.w - 8,  p.y - 6, 18, 12);
  }
}

// ─────────────────────────────────────────────────────────
// SIGNS
// ─────────────────────────────────────────────────────────
function drawSigns() {
  for (let o of obstacles) {
    if (o.type !== 'sign') continue;
    let sx = o.x + scrollX;
    if (sx < -140 || sx > CANVAS_W + 140) continue;
    noStroke();
    fill(60, 40, 16);
    rect(sx, GROUND_Y - 62, 5, 66);
    fill(190, 158, 88);
    rect(sx - 34, GROUND_Y - 82, 72, 26, 3);
    stroke(105, 75, 30); strokeWeight(1); noFill();
    rect(sx - 34, GROUND_Y - 82, 72, 26, 3);
    noStroke();
    fill(50, 28, 6);
    textAlign(CENTER, CENTER); textSize(7); textStyle(BOLD);
    text(o.label, sx + 2, GROUND_Y - 69);
    textStyle(NORMAL);
  }
}

// ─────────────────────────────────────────────────────────
// RIVER — pinned to right edge once scroll maxes out
// ─────────────────────────────────────────────────────────
function drawRiver(progress) {
  if (progress < 0.70) return;

  // Once progress hits 1.0 (scroll clamped), river stays fixed on screen
  let alpha  = map(progress, 0.70, 0.95, 0, 255);
  alpha = constrain(alpha, 0, 255);

  // River X: slides in from right, fully visible at progress 1.0
  let riverX = map(progress, 0.70, 1.0, CANVAS_W + 60, CANVAS_W - 200);
  riverX = constrain(riverX, CANVAS_W - 200, CANVAS_W + 60);

  noStroke();
  fill(50, 105, 170, alpha);
  rect(riverX, GROUND_Y - 4, CANVAS_W - riverX + 10, CANVAS_H - GROUND_Y + 4);

  stroke(75, 140, 205, alpha * 0.55); strokeWeight(1.5); noFill();
  for (let i = 0; i < 4; i++) {
    let ry = GROUND_Y + 14 + i * 20;
    let rx = riverX + 18 + sin(frameCount * 0.04 + i) * 6;
    line(rx, ry, rx + 38, ry);
  }
  noStroke();
}

// ─────────────────────────────────────────────────────────
// BEAR
// ─────────────────────────────────────────────────────────
function drawBear() {
  if (!bear) return;
  let sx = bear.x + scrollX;
  if (sx < -100 || sx > CANVAS_W + 100) return;

  if (bearImg) {
    imageMode(CORNER);
    image(bearImg, sx, bear.y, bear.w, bear.h);
    imageMode(CENTER);
  } else {
    noStroke();
    fill(88, 56, 26);
    ellipse(sx+bear.w/2, bear.y+bear.h*0.58, bear.w,      bear.h*0.70);
    ellipse(sx+bear.w/2, bear.y+bear.h*0.22, bear.w*0.58, bear.h*0.45);
    fill(72, 45, 18);
    ellipse(sx+bear.w*0.28, bear.y+bear.h*0.04, 11, 11);
    ellipse(sx+bear.w*0.72, bear.y+bear.h*0.04, 11, 11);
    fill(20, 12, 4);
    ellipse(sx+bear.w*0.38, bear.y+bear.h*0.18, 4, 4);
    ellipse(sx+bear.w*0.62, bear.y+bear.h*0.18, 4, 4);
    fill(115, 75, 38);
    ellipse(sx+bear.w/2, bear.y+bear.h*0.28, 12, 8);
  }
}

// ─────────────────────────────────────────────────────────
// PLAYER CHARACTER
// ─────────────────────────────────────────────────────────
function drawCharacter() {
  if (player.invincible && floor(player.invincibleTimer / 6) % 2 === 0) return;
  let dx = player.x, dy = player.y;

  if (characterSheet) {
    let dir    = player.direction || 'right';
    let row    = SPRITE.rows[dir];
    let offset = SPRITE.offsets[dir];
    let sx     = player.currentFrame * SPRITE.frameWidth + offset.x;
    let sy     = row * SPRITE.frameHeight + offset.y;
    let dw     = SPRITE.frameWidth  * SPRITE.scale;
    let dh     = SPRITE.frameHeight * SPRITE.scale;
    imageMode(CENTER);
    image(characterSheet, dx, dy - player.h/2, dw, dh, sx, sy, SPRITE.frameWidth, SPRITE.frameHeight);
  } else {
    noStroke();
    fill(200, 150, 100);
    ellipse(dx, dy - player.h*0.87, 18, 18);
    fill(120, 75, 140);
    rect(dx - 8, dy - player.h*0.74, 16, 24, 2);
    fill(60, 42, 28);
    rect(dx - 8, dy - player.h*0.50, 6, 22, 2);
    rect(dx + 2, dy - player.h*0.50, 6, 22, 2);
  }
}

// ─────────────────────────────────────────────────────────
// HUD
// ─────────────────────────────────────────────────────────
function drawHUD() {
  noStroke();
  textAlign(LEFT, TOP); textSize(10); fill(210, 210, 210);
  text('HP', 12, 12);
  for (let i = 0; i < player.maxHealth; i++) {
    fill(i < player.health ? color(210, 60, 60) : color(55, 55, 55));
    ellipse(16 + i * 20, 36, 13, 13);
  }

  if (flipped) {
    fill(255, 55, 40, 240);
    textAlign(CENTER, TOP); textSize(14); textStyle(BOLD);
    text('! CONTROLS FLIPPED !', CANVAS_W / 2, 10);
    textStyle(NORMAL);
  }
}

// ─────────────────────────────────────────────────────────
// FLIP WARNING — red border flash before snap
// ─────────────────────────────────────────────────────────
function drawFlipWarning() {
  if (!warningActive) return;
  if (floor(frameCount / 8) % 2 === 0) {
    noFill(); stroke(210, 45, 45, 180); strokeWeight(8);
    rect(4, 4, CANVAS_W - 8, CANVAS_H - 8);
    noStroke();
  }
}

// ─────────────────────────────────────────────────────────
// FROST VIGNETTE
// ─────────────────────────────────────────────────────────
function drawFrost() {
  if (frostLevel <= 0.02) return;
  let alpha = frostLevel * 180;
  noStroke();
  let bands = 48;
  for (let i = 0; i < bands; i++) {
    let t = 1 - i / bands;
    fill(145, 190, 228, alpha * t * t);
    let th = 2;
    rect(0, i*th, CANVAS_W, th);
    rect(0, CANVAS_H - i*th - th, CANVAS_W, th);
    rect(i*th, 0, th, CANVAS_H);
    rect(CANVAS_W - i*th - th, 0, th, CANVAS_H);
  }
}

// ─────────────────────────────────────────────────────────
// WIN SCREEN
// ─────────────────────────────────────────────────────────
function drawWin() {
  // Draw the world one last time so it doesn't flash blank
  let progress = 1;
  drawSky(progress);
  drawBgTrees(scrollX * 0.3);
  drawGround();
  drawRiver(1);

  // Bright overlay fade-in
  noStroke();
  fill(0, 0, 0, 170);
  rectMode(CENTER);
  rect(CANVAS_W/2, CANVAS_H/2, 500, 215, 8);

  fill(175, 238, 145);
  textAlign(CENTER, CENTER); textSize(36); textStyle(BOLD);
  text('YOU MADE IT HOME', CANVAS_W/2, CANVAS_H/2 - 55);

  fill(135, 190, 108); textSize(12); textStyle(NORMAL);
  text('She found her way through the forest.', CANVAS_W/2, CANVAS_H/2 - 16);
  text('The lights of home flickered through the trees.', CANVAS_W/2, CANVAS_H/2 + 6);

  if (floor(frameCount / 32) % 2 === 0) {
    fill(222, 244, 180); textSize(12);
    text('PRESS SPACE to play again', CANVAS_W/2, CANVAS_H/2 + 54);
  }
  rectMode(CORNER);
}

// ─────────────────────────────────────────────────────────
// GAME OVER SCREEN
// ─────────────────────────────────────────────────────────
function drawGameOver() {
  background(6, 10, 6);
  drawBgTrees(0);
  drawGround();

  noStroke(); fill(0, 0, 0, 185); rectMode(CENTER);
  rect(CANVAS_W/2, CANVAS_H/2, 460, 210, 6);

  fill(195, 70, 55);
  textAlign(CENTER, CENTER); textSize(34); textStyle(BOLD);
  text('LOST IN THE FOREST', CANVAS_W/2, CANVAS_H/2 - 52);

  fill(165, 110, 95); textSize(12); textStyle(NORMAL);
  text('The cold crept in and the path disappeared.', CANVAS_W/2, CANVAS_H/2 - 14);
  text('She never made it home.',                     CANVAS_W/2, CANVAS_H/2 + 10);

  if (floor(frameCount / 32) % 2 === 0) {
    fill(218, 155, 135); textSize(12);
    text('PRESS SPACE to try again', CANVAS_W/2, CANVAS_H/2 + 55);
  }
  rectMode(CORNER);
}