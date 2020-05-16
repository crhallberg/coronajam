import kontra from "../_shared/js/vendor/kontra.min.js";
import { Rectangle, QuadTree } from "../_shared/js/vendor/QuadTree.js";
import { _setup, getControllerState } from "../_shared/js/utils.js";
import PALETTE from "../_shared/primer-colors.js";

const { GameLoop } = kontra;
let { a, c } = _setup("a");
kontra.initKeys();

/**
 * GameLoop
 */
let PLAYER = { x: a.width / 2, y: a.height / 2, dx: 0, dy: 0 };
let SCREEN = new Rectangle(PLAYER.x, PLAYER.y, PLAYER.x, PLAYER.y);
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
  SCREEN.x = PLAYER.x;
  SCREEN.y = PLAYER.y;
}

let gridSize = Math.min(44, Math.floor(a.width / 42) * 2);
let gridHalf = gridSize / 2;
let gridIso = gridSize / 3;
function render() {
  c.clearRect(0, 0, a.width, a.height);

  c.save();
  c.translate(PLAYER.x, PLAYER.y);
  c.fillStyle = PALETTE.red[800];
  c.fillRect(-PLAYER.dx, -PLAYER.dy, gridSize, gridSize);
  c.fillStyle = PALETTE.red[500];
  c.fillRect(PLAYER.dx * 2, PLAYER.dy * 2 - gridIso, gridSize, gridSize);
  c.restore();
}

let loop = new GameLoop({ update, render, clearFn: false });
loop.start();
