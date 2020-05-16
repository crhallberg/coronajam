import kontra from "../_shared/js/vendor/kontra.min.js";
import { _setup, comma, spread } from "../_shared/js/utils.js";

import PALETTE from "./primer-colors.js";

const { GameLoop } = kontra;
let { a, c } = _setup("a");

const { initPointer, onPointerDown, onPointerUp, pointer } = kontra;
initPointer();

let regionWidth = 300;
let regionHeight = 100;
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
    width: regionWidth,
    height: regionHeight,
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

function drawPlayer(player, i) {
  c.fillStyle = PALETTE[player.color][400];
  c.save();
  c.translate(
    regions[player.visiting].x + regionWidth + 80 * (i + 1),
    regions[player.visiting].y + regionHeight / 2
  );
  c.rotate(Math.PI / 4);
  c.fillRect(-40, -40, 80, 80);
  c.restore();

  if (turn === i) {
    c.fillStyle = PALETTE[player.color][700];
    c.fillRect(a.width - 220, i * 40 + 10, 300, 40);
    c.fillStyle = "#fff";
  } else {
    c.fillStyle = PALETTE[player.color][700];
  }
  c.fillText(
    `${player.name}: $${player.money.toFixed(2)}`,
    a.width - 200,
    i * 40 + 20
  );
}

function income() {
  let c = PLAYERS[turn].color;
  PLAYERS[turn].money += regions.reduce((s, r) => s + r[c] * 5, 0);
}

onPointerDown(function mouseDown() {
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].active && !buttons[i].disabled) {
      let bx = pointer.x - buttons[i].x;
      let by = pointer.y - buttons[i].y;
      if (bx > 0 && by > 0 && bx < buttons[i].width && by < buttons[i].height) {
        buttons[i].action();
        buttons[i].pressed = true;
        break;
      }
    }
  }
});
onPointerUp(function mouseUp() {
  buttons.forEach((btn) => (btn.pressed = false));
});

function drawButton(btn) {
  if (!btn.active) {
    return;
  }
  c.save();
  if (btn.pressed) {
    c.translate(0, 8);
    c.fillStyle = PALETTE.gray[700];
    c.strokeStyle = PALETTE.gray[700];
    c.fillRect(btn.x, btn.y, btn.width, btn.height);
    c.strokeRect(btn.x, btn.y, btn.width, btn.height);
    c.fillStyle = "#fff";
  } else {
    if (btn.disabled) {
      c.fillStyle = PALETTE.gray[300];
      c.fillRect(btn.x, btn.y, btn.width, btn.height);
    } else {
      c.fillStyle = "rgba(0,0,0,.5)";
      c.fillRect(btn.x, btn.y + 8, btn.width, btn.height);
      c.fillStyle = "#fff";
      c.fillRect(btn.x, btn.y, btn.width, btn.height);
      c.strokeRect(btn.x, btn.y, btn.width, btn.height);
    }
    c.fillStyle = "#000";
  }

  c.textAlign = "center";
  c.textBaseline = "middle";
  if (typeof btn.text == "string") {
    c.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2);
  } else {
    let offset = (btn.text.length - 1) / 2;
    for (let i = 0; i < btn.text.length; i++) {
      c.fillText(
        btn.text[i],
        btn.x + btn.width / 2,
        btn.y + btn.height / 2 + 24 * (i - offset)
      );
    }
  }
  c.restore();
}

function makeButton(btn) {
  return Object.assign({}, btn, {
    active: btn.active ?? true,
    width: btn.width ?? c.measureText(text) + 32,
    height: btn.height ?? 50,
    disabled: btn.disabled ?? false,
  });
}

let buttons = [];
let network = {
  0: new Set([1, 2]),
  1: new Set([0, 2, 3, 5]),
  2: new Set([0, 1, 4, 6]),
  3: new Set([1, 4]),
  4: new Set([2, 3, 5]),
  5: new Set([1, 4, 6]),
  6: new Set([2, 5]),
};
let moveBtns = [];
function movePlayerTo(index) {
  PLAYERS[turn].visiting = index;
  PLAYERS[turn].money -= 10;
  regions[index][PLAYERS[turn].color] += 1;
  nextTurn();
}
for (let i = 0; i < regions.length; i++) {
  let r = regions[i];
  let btn = makeButton({
    text: ["Visit", "Here"],
    x: r.x + regionWidth - 100,
    y: r.y + regionHeight / 2 - 30,
    width: 80,
    height: 60,
    action: () => movePlayerTo(i),
    active: false,
  });
  moveBtns.push(btn);
  buttons.push(btn);
}
function showMoveButtons() {
  resetButtons();
  let start = PLAYERS[turn].visiting;
  moveBtns.forEach((btn, i) => {
    btn.active = network[start].has(i);
  });
}
function hideMoveButtons() {
  moveBtns.forEach((btn) => (btn.active = false));
}

let spaceBtns = spread(200, 500, 5);
let actionBtns = [];
let moveAction = makeButton({
  text: "MOVE ($10)",
  cost: 10,
  x: a.width / 2 - 100,
  y: spaceBtns(0),
  width: 350,
  action: showMoveButtons,
});
actionBtns.push(moveAction);
buttons.push(moveAction);

let rallyAction = makeButton({
  text: "HOLD RALLY ($50)",
  cost: 50,
  x: a.width / 2 - 100,
  y: spaceBtns(1),
  width: 350,
  action: function () {
    regions[PLAYERS[turn].visiting][PLAYERS[turn].color] += 2;
    nextTurn();
  },
});
actionBtns.push(rallyAction);
buttons.push(rallyAction);

let flyAction = makeButton({
  text: "FLY ($100)",
  cost: 100,
  x: a.width / 2 - 100,
  y: spaceBtns(2),
  width: 350,
  action: function () {
    moveBtns.forEach((btn) => (btn.active = true));
  },
});
actionBtns.push(flyAction);
buttons.push(flyAction);

let attackAction = makeButton({
  text: "RUN ATTACK AD ($1000)",
  cost: 1000,
  x: a.width / 2 - 100,
  y: spaceBtns(3),
  width: 350,
  action: function () {
    // TODO:
  },
});
actionBtns.push(attackAction);
buttons.push(attackAction);

let tvAction = makeButton({
  text: "BUY TV AD ($2000)",
  cost: 2000,
  x: a.width / 2 - 100,
  y: spaceBtns(4),
  width: 350,
  action: function () {
    // TODO:
  },
});
actionBtns.push(tvAction);
buttons.push(tvAction);

function resetButtons() {
  hideMoveButtons();
  actionBtns.forEach((btn) => (btn.disabled = btn.cost > PLAYERS[turn].money));
}

/**
 * GameLoop
 */
let turn = -1;
let PLAYERS = [
  { color: "red", name: "Chris", visiting: 0, money: 0 },
  { color: "blue", name: "Nicole", visiting: 0, money: 0 },
];

function nextTurn() {
  turn = (turn + 1) % PLAYERS.length;
  requestAnimationFrame(calculateOdds);
  income();
  resetButtons();
}

function update(dt) {}

let action = "move";
let drawMove = {
  move: showMoveButtons,
};
function render() {
  let color = PLAYERS[turn].color;
  c.fillStyle = PALETTE[color]["000"];
  c.fillRect(0, 0, a.width, a.height);

  c.strokeStyle = PALETTE.gray[900];
  c.lineWidth = 4;

  regions.forEach(drawRegion);

  buttons.forEach(drawButton);

  drawPollHistory();

  PLAYERS.forEach(drawPlayer);

  c.fillStyle = PALETTE[color][600];
  c.fillRect(pointer.x - 15, pointer.y - 15, 30, 30);
}

let loop = new GameLoop({ update, render, clearFn: false });

nextTurn();
loop.start();
