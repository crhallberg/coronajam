import kontra from "../shared/js/vendor/kontra.min.js";
import { _setup, log } from "../shared/js/utils.js";

const { GameLoop } = kontra;
let { a, c } = _setup("a");

/**
 * GameLoop
 */
let angle = 0;
function update(dt) {
  angle += Math.PI * 2 * dt / 10;
}

function render() {
  c.clearRect(0, 0, a.width, a.height);

  c.save();
  c.fillStyle = "red";
  c.translate(100, 100);
  c.rotate(angle);
  c.fillRect(-50, -50, 100, 100);
  c.restore();
}

let loop = new GameLoop({ update, render, clearFn: false });
loop.start();
