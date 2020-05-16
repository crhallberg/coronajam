import kontra from "./vendor/kontra.min.js";
const { GameLoop, keyPressed } = kontra;

/**
 * SETUP
 */
let a = document.getElementById("a");
a.width = a.offsetWidth;
a.height = a.offsetHeight;

let { context: c } = kontra.init(a);

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
