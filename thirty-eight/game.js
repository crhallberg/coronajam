import kontra from "../_shared/js/vendor/kontra.min.js";
import { _setup } from "../_shared/js/utils.js";

const { GameLoop, initPointer, onPointerDown, pointer } = kontra;
let { a, c } = _setup("a");
initPointer();

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
let pollHistory = [];
function calculateOdds() {
  let total = regions.reduce((t, r) => t * (r.red + r.blue), 1);
  console.log(`Total: ${total}`);
  let redWins = 0;
  let blueWins = 0;
  let ties = 0;
  let queue = [{ red: 0, blue: 0, depth: 0 }];
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
  pollHistory.push({ redWins, blueWins });
}

function drawPollHistory() {
  c.save();
  c.translate(a.width - 216, a.height - 16);

  c.fillStyle = "#fff";
  c.fillRect(0, -200, 200, 200);

  let step = 200 / pollHistory.length;
  let last = 100;
  let redRatio, redWins, blueWins;
  for (let i = 0; i < pollHistory.length; i++) {
    redWins = pollHistory[i].redWins;
    blueWins = pollHistory[i].blueWins;
    redRatio = (200 * redWins) / (redWins + blueWins);
    c.beginPath();
    c.moveTo(i * step, -last);
    c.lineTo((i + 1) * step, -redRatio);
    c.strokeStyle = "#e53e3e";
    c.stroke();
    c.closePath();

    c.beginPath();
    c.moveTo(i * step, last - 200);
    c.lineTo((i + 1) * step, redRatio - 200);
    c.strokeStyle = "#5a67d8";
    c.stroke();
    c.closePath();

    last = redRatio;
  }

  c.textAlign = "right";
  if (redRatio > 101) {
    c.fillStyle = "#9b2c2c";
    c.fillText(
      `RED WINS ${redWins} out of ${redWins + blueWins} elections`,
      200,
      -230
    );
  } else if (redRatio < 99) {
    c.fillStyle = "#434190";
    c.fillText(
      `BLUE WINS ${redWins} out of ${redWins + blueWins} elections`,
      200,
      -230
    );
  } else {
    c.fillStyle = "#2d3748";
    c.fillText("Too close to call.", 200, -230);
  }

  c.strokeStyle = "#000";
  c.strokeRect(0, -200, 200, 200);
  c.restore();
}

let turn = "red";
onPointerDown(function mouseDown() {
  console.log("mouseDown");
  for (let i = 0; i < regions.length; i++) {
    let rx = pointer.x - regions[i].x;
    let ry = pointer.y - regions[i].y;
    console.log(rx, ry);
    if (rx > 0 && ry > 0 && rx < regions[i].width && ry < regions[i].height) {
      regions[i][turn] += 1;
      calculateOdds();
      turn = turn == "red" ? "blue" : "red";
      break;
    }
  }
});

calculateOdds();

/**
 * GameLoop
 */
function update(dt) {}

let bgs = ["#f7fafc", "#fff5f5", "#ebf4ff"];
function render() {
  c.strokeStyle = "#000";
  c.lineWidth = 4;

  c.fillStyle = bgs[WINNING];
  c.fillRect(0, 0, a.width, a.height);
  regions.forEach(drawRegion);

  drawPollHistory();

  c.fillStyle = turn;
  c.fillRect(pointer.x - 15, pointer.y - 15, 30, 30);
}

let loop = new GameLoop({ update, render, clearFn: false });
loop.start();
