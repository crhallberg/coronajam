import kontra from "../_shared/js/vendor/kontra.min.js";
import { _setup, getControllerState } from "../_shared/js/utils.js";
import PALETTE from "../_shared/primer-colors.js";
import { rectRect } from "../_shared/js/collision.js";

const { GameLoop } = kontra;
let { a, c } = _setup("a");
const { keyPressed, bindKeys, keyMap } = kontra;
keyMap["ShiftLeft"] = "shift";
keyMap["ShiftRight"] = "shift";
keyMap[16] = "shift";
kontra.initKeys();

let gridSize = Math.min(44, Math.floor(a.width / 42) * 2);
let gridHalf = gridSize / 2;
let gridIso = gridSize / 3;

// DON'T GET AHEAD OF YOURSELF
// let WALLS = new QuadTree(
//   new Rectangle(a.width / 2, a.height / 2, a.width, a.height),
//   4
// );
// WALLS.add(
// fetch("./walls.json")
//   .then((data) => data.json())
//   .then((json) => (WALLS = QuadTree.fromJSON(json)));

let WALLS = [];
WALLS.push({
  x: 510,
  y: 300 + gridSize,
  w: gridSize,
  h: gridSize * 10,
});
WALLS.push({
  x: 500,
  y: 300,
  w: gridSize * 10,
  h: gridSize,
});

function drawWallTop({ x, y, w, h }) {
  c.fillStyle = PALETTE.gray[500];
  c.fillRect(x, y - gridSize, w, h);
}
function drawWallBottom({ x, y, w, h }) {
  c.fillStyle = PALETTE.gray[800];
  c.fillRect(x, y, w, h);
}

let SCREEN = {
  x: 0,
  y: 0,
  w: a.width,
  h: a.height,
  dx: 0,
  dy: 0,
  ddx: 0,
  ddy: 0,
};
const stiffness = 1 / 32;
const damp = 1 / 2;
function updateCamera() {
  // Spring
  // F = - kx - bv
  let force =
    stiffness * (PLAYER.x - a.width / 2 - SCREEN.x) - damp * SCREEN.dx;
  SCREEN.ddx += force;
  SCREEN.dx += SCREEN.ddx;
  SCREEN.x += SCREEN.dx;
  SCREEN.ddx = 0;

  force = stiffness * (PLAYER.y - a.height / 2 - SCREEN.y) - damp * SCREEN.dy;
  SCREEN.ddy += force;
  SCREEN.dy += SCREEN.ddy;
  SCREEN.y += SCREEN.dy;
  SCREEN.ddy = 0;
}

function collide() {
  for (let i = 0; i < WALLS.length; i++) {
    let W = WALLS[i];
    if (rectRect(PLAYER, W)) {
      if (PLAYER.px + gridSize <= W.x) {
        PLAYER.x = W.x - gridSize;
      } else if (PLAYER.px >= W.x + W.w) {
        PLAYER.x = W.x + W.w;
      }
      if (PLAYER.py + gridSize <= W.y) {
        PLAYER.y = W.y - gridSize;
      } else if (PLAYER.py >= W.y + W.h) {
        PLAYER.y = W.y + W.h;
      }
    }
  }
}

/**
 * GameLoop
 */
let PLAYER = {
  x: a.width / 2,
  y: a.height / 2,
  dx: 0,
  dy: 0,
  w: gridSize,
  h: gridSize,
};
const SPEED = 400; // px per sec
function update(dt) {
  let state = getControllerState();
  if (state.angle === null) {
    PLAYER.dx = 0;
    PLAYER.dy = 0;
  } else {
    PLAYER.dx = Math.cos(state.angle);
    PLAYER.dy = Math.sin(state.angle);
  }
  PLAYER.x += PLAYER.dx * SPEED * dt;
  PLAYER.y += PLAYER.dy * SPEED * dt;

  if (HELD && !keyPressed("shift")) {
    PLAYER.x = HELD.x;
    PLAYER.y = HELD.y;
    HELD = null;
  }

  collide();

  updateCamera();

  PLAYER.px = PLAYER.x;
  PLAYER.py = PLAYER.y;
}

let HELD = null;
bindKeys("shift", function () {
  HELD = {
    x: PLAYER.x,
    y: PLAYER.y,
  };
  console.log(HELD);
});

function render() {
  c.clearRect(0, 0, a.width, a.height);

  c.save(); // camera
  c.translate(-SCREEN.x, -SCREEN.y);

  if (HELD) {
    c.fillStyle = PALETTE.pink[100];
    c.fillRect(
      HELD.x - gridHalf,
      HELD.y - gridHalf,
      gridSize * 2,
      gridSize * 2
    );
  }

  c.fillStyle = PALETTE.red[800];
  c.fillRect(PLAYER.x, PLAYER.y, gridSize, gridSize);

  WALLS.forEach(drawWallBottom);

  c.fillStyle = PALETTE.red[500];
  c.fillRect(
    PLAYER.x + PLAYER.dx * 2,
    PLAYER.y + PLAYER.dy * 2 - gridIso,
    gridSize,
    gridSize
  );

  WALLS.forEach(drawWallTop);

  c.restore(); // camera
}

let loop = new GameLoop({ update, render, clearFn: false });
loop.start();
