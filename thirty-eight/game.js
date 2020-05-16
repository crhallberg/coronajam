import kontra from "../_shared/js/vendor/kontra.min.js";
import { _setup, comma } from "../_shared/js/utils.js";

import PALETTE from "./primer-colors.js";

const { GameLoop } = kontra;
let { a, c } = _setup("a");

const { initPointer, onPointerDown, pointer } = kontra;
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
  rural: PALETTE.green[100],
  suburban: PALETTE.orange[100],
  urban: PALETTE.purple[100],
};
function drawRegion(region) {
  c.save();
  c.translate(region.x, region.y);

  c.fillStyle = typeFills[region.type];
  c.fillRect(0, 0, region.width, region.height);
  c.strokeRect(0, 0, region.width, region.height);

  c.fillStyle = PALETTE.red[500];
  for (let i = 0; i < region.red; i++) {
    c.fillRect(i * 40 + 10, 10, 30, 30);
  }
  c.fillStyle = PALETTE.blue[500];
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

  let { redWins: rW, blueWins: bW } = pollHistory[pollHistory.length - 1];
  let ratio = rW / (rW + bW);
  if (ratio > 0.51) {
    c.fillStyle = PALETTE.red[100];
  } else if (ratio < 0.49) {
    c.fillStyle = PALETTE.blue[100];
  } else {
    c.fillStyle = PALETTE.gray[100];
  }
  c.fillRect(0, -200, 200, 200);

  let step = 200 / pollHistory.length;
  let redRatio, redWins, blueWins;
  let blueRatios = [];

  c.strokeStyle = PALETTE.red[500];
  c.beginPath();
  c.moveTo(0, -100);
  for (let i = 0; i < pollHistory.length; i++) {
    redWins = pollHistory[i].redWins;
    blueWins = pollHistory[i].blueWins;
    redRatio = (200 * redWins) / (redWins + blueWins);
    blueRatios.push(redRatio - 200);
    c.lineTo((i + 1) * step, -redRatio);
  }
  c.stroke();
  c.closePath();

  c.strokeStyle = PALETTE.blue[500];
  c.beginPath();
  c.moveTo(0, -100);
  for (let i = 1; i < blueRatios.length; i++) {
    c.lineTo((i + 1) * step, blueRatios[i]);
  }
  c.stroke();
  c.closePath();

  c.textAlign = "right";
  if (redRatio > 102) {
    c.fillStyle = PALETTE.red[800];
    c.fillText(
      `RED wins ${comma(redWins)} out of ${comma(
        redWins + blueWins
      )} elections`,
      200,
      -230
    );
  } else if (redRatio < 98) {
    c.fillStyle = PALETTE.blue[800];
    c.fillText(
      `BLUE wins ${comma(blueWins)} out of ${comma(
        redWins + blueWins
      )} elections`,
      200,
      -230
    );
  } else {
    c.fillStyle = PALETTE.gray[800];
    c.fillText("Too close to call.", 200, -230);
  }

  c.strokeStyle = PALETTE.gray[900];
  c.strokeRect(0, -200, 200, 200);
  c.restore();
}

let turn = "red";
onPointerDown(function mouseDown() {
  for (let i = 0; i < regions.length; i++) {
    let rx = pointer.x - regions[i].x;
    let ry = pointer.y - regions[i].y;
    if (rx > 0 && ry > 0 && rx < regions[i].width && ry < regions[i].height) {
      regions[i][turn] += 1;
      requestAnimationFrame(calculateOdds);
      turn = turn == "red" ? "blue" : "red";
      break;
    }
  }
});

calculateOdds();

/**
 * GameLoop
 */
let PLAYERS = {
  red: { visiting: 0, money: 0 },
  blue: { visiting: 0, money: 0 },
};
function update(dt) {}

function render() {
  c.fillStyle = PALETTE[turn]["000"];
  c.fillRect(0, 0, a.width, a.height);

  c.strokeStyle = "#000";
  c.lineWidth = 4;

  regions.forEach(drawRegion);

  drawPollHistory();

  c.fillStyle = PALETTE[turn][600];
  c.fillRect(pointer.x - 15, pointer.y - 15, 30, 30);
}

let loop = new GameLoop({ update, render, clearFn: false });
loop.start();
