import kontra from "../_shared/js/vendor/kontra.min.js";
import { Rectangle, QuadTree } from "../_shared/js/vendor/QuadTree.js";
import { _setup, getControllerState } from "../_shared/js/utils.js";

const { GameLoop } = kontra;
let { a, c } = _setup("a");
kontra.initKeys();

/**
 * GameLoop
 */
let PLAYER = { x: a.width / 2, y: a.height / 2 };
let SCREEN = new Rectangle(PLAYER.x, PLAYER.y, PLAYER.x, PLAYER.y);
const SPEED = 400; // px per sec
function update(dt) {
  let state = getControllerState();
  if (state.angle != null) {
    PLAYER.x += Math.cos(state.angle) * SPEED * dt;
    PLAYER.y += Math.sin(state.angle) * SPEED * dt;

    SCREEN.x = PLAYER.x;
    SCREEN.y = PLAYER.y;
  }
}

let gridSize = Math.min(44, Math.floor(a.width / 42) * 2);
let gridHalf = gridSize / 2;
function render() {
  c.clearRect(0, 0, a.width, a.height);

  c.save();
  c.fillStyle = "red";
  c.translate(PLAYER.x, PLAYER.y);
  c.fillRect(-gridHalf, -gridHalf, gridSize, gridSize);
  c.restore();
}

let loop = new GameLoop({ update, render, clearFn: false });
loop.start();
