import kontra from "../_shared/js/vendor/kontra.min.js";
import { Rectangle, QuadTree } from "../_shared/js/vendor/QuadTree.js";
import { _setup, getControllerState } from "../_shared/js/utils.js";
import PALETTE from "../_shared/primer-colors.js";

const { GameLoop } = kontra;
let { a, c } = _setup("a");
const { keyPressed, bindKeys, keyMap } = kontra;
keyMap["ShiftLeft"] = "shift";
keyMap["ShiftRight"] = "shift";
keyMap[16] = "shift";
kontra.initKeys();

/**
 * GameLoop
 */
let PLAYER = { x: a.width / 2, y: a.height / 2, dx: 0, dy: 0 };
let SCREEN = new Rectangle(PLAYER.x, PLAYER.y, PLAYER.x, PLAYER.y);
SCREEN.dx = 0;
SCREEN.dy = 0;
SCREEN.ddx = 0;
SCREEN.ddy = 0;
const SPEED = 400; // px per sec
const stiffness = 1 / 64;
const damp = 1 / 2;
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

  if (HELD && !keyPressed("shift")) {
    PLAYER.x = HELD.x;
    PLAYER.y = HELD.y;
    HELD = null;
  }
}

let HELD = null;
bindKeys("shift", function () {
  HELD = {
    x: PLAYER.x,
    y: PLAYER.y,
  };
});

let gridSize = Math.min(44, Math.floor(a.width / 42) * 2);
let gridHalf = gridSize / 2;
let gridIso = gridSize / 3;
function render() {
  c.clearRect(0, 0, a.width, a.height);

  c.save();
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

  c.save();
  c.translate(PLAYER.x, PLAYER.y);
  c.fillStyle = PALETTE.red[800];
  c.fillRect(-PLAYER.dx, -PLAYER.dy, gridSize, gridSize);
  c.fillStyle = PALETTE.red[500];
  c.fillRect(PLAYER.dx * 2, PLAYER.dy * 2 - gridIso, gridSize, gridSize);
  c.restore();
  c.restore();
}

let loop = new GameLoop({ update, render, clearFn: false });
loop.start();
