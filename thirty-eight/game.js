import kontra from "../_shared/js/vendor/kontra.min.js";
import { _setup } from "../_shared/js/utils.js";

const { GameLoop } = kontra;
let { a, c } = _setup("a");

function makeRegion({ x, y, type }) {
  let startingSides = 1;
  if (type == "suburban") {
    startingSides = 2;
  } else if (type == "urban") {
    startingSides = 3;
  }
  let r = {
    x,
    y,
    type,
    red: startingSides,
    blue: startingSides,
    width: 300,
    height: 100,
  };
  // console.log( r);
  return r;
}

let typeFills = {
  rural: "#c6f6d5",
  suburban: "#feebc8",
  urban: "#e9d8fd",
};
function drawRegion(region) {
  c.save();
  c.translate(region.x, region.y);

  c.fillStyle = typeFills[region.type];
  c.strokeStyle = "#000";
  c.lineWidth = 3;
  c.fillRect(0, 0, region.width, region.height);
  c.strokeRect(0, 0, region.width, region.height);

  c.fillStyle = "#e53e3e";
  for (let i = 0; i < region.red; i++) {
    c.fillRect(i * 40 + 10, 10, 30, 30);
  }
  c.fillStyle = "#5a67d8";
  for (let i = 0; i < region.blue; i++) {
    c.fillRect(i * 40 + 10, 60, 30, 30);
  }
  c.restore();
}

let regions = [];
for (let i = 0; i < 7; i++) {
  let type = "urban";
  if (i >= 3) {
    type = "rural";
  } else if (i >= 1) {
    type = "suburban";
  }
  regions.push(
    makeRegion({
      x: 16,
      y: i * 110 + 16,
      type,
    })
  );
}

let WINNING = 0;
function calculateOdds() {
  let total = regions.reduce((t, r) => t * (r.red + r.blue), 1);
  console.log(  `Total: ${total}`);
  let redWins = 0;
  let blueWins = 0;
  let ties = 0;
  let queue = [{red: 0, blue: 0, depth: 0}];
  while (queue.length > 0) {
    let { red, blue, depth } = queue.pop();
    if (depth === regions.length) {
      if (red > blue) {
        redWins += 1;
      } else if (blue > red) {
        blueWins += 1;
      } else {
        ties += 1;
      }
      continue;
    }
    let nRegion = regions[depth];
    for (let i = 0; i < nRegion.red; i++) {
      queue.push({ red: red + 1, blue, depth: depth + 1 });
    }
    for (let i = 0; i < nRegion.blue; i++) {
      queue.push({ red, blue: blue + 1, depth: depth + 1 });
    }
  }
  if (redWins > blueWins) {
    WINNING = 1;
  } else if (blueWins > redWins) {
    WINNING = 2;
  } else {
    WINNING = 0;
  }
  console.log(`Red: ${redWins} vs. Blue: ${blueWins} (ties: ${ties})`);
}
console.log(  calculateOdds());

/**
 * GameLoop
 */
function update(dt) {
}

let bgs = ["#f7fafc", "#fff5f5", "#ebf4ff"];
function render() {
  c.fillStyle = bg[WINNING];
  c.fillRect(0, 0, a.width, a.height);
  regions.forEach(drawRegion);
}

let loop = new GameLoop({ update, render, clearFn: false });
loop.start();
