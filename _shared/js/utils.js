import { init, keyPressed } from "./vendor/kontra.min.js";

/**
 * CANVAS
 */

export function comma(number) {
  return Number(number).toLocaleString();
}

// Split the text into lines that will fit on the card
export function wrapText(text, width) {
  let words = text.split(" ");
  let lines = [];
  let prev = words[0];
  let curr = words[0];
  for (let i = 1; i < words.length; i++) {
    curr += " " + words[i];
    let tm = c.measureText(curr);
    if (tm.width > width - 5) {
      lines.push(prev);
      curr = words[i];
    }
    prev = curr;
  }
  lines.push(curr);
  return lines;
}
export function _setup(id) {
  document.getElementById(id);
  a.width = a.offsetWidth;
  a.height = a.offsetHeight;
  let { context: c } = init(a);
  c.textAlign = "left";
  c.textBaseline = "top";
  c.font = `500 24px Inter`;
  return { a, c };
}

/**
 * Get joystick angle and isButtonPressed
 */
const DEAD_MAG = 1 / 4;
let lastControllerButton = false;
export function getControllerState() {
  let gamepad = navigator.getGamepads()[0];
  if (!gamepad) {
    let button = keyPressed("space");
    let ret = { angle: null, button, down: button && !lastControllerButton };
    lastControllerButton = button;
    return ret;
  }
  let joyX = gamepad.axes[0];
  let joyY = gamepad.axes[1];
  let angle = null;
  if (Math.sqrt(joyX ** 2 + joyY ** 2) > DEAD_MAG) {
    angle = Math.atan2(joyY, joyX);
  }
  let button = false;
  for (let i = 0; i < gamepad.buttons.length; i++) {
    if (gamepad.buttons[i].pressed) {
      button = true;
      break;
    }
  }
  let ret = { angle, button, down: button && !lastControllerButton };
  lastControllerButton = button;
  return ret;
}

/**
 * DEBUG
 */

/**
 * Bind console to itself so it can be used as a callback
 */
export const log = console.log.bind(console);

export let DEBUG = true;
export function debug(msg) {
  if (DEBUG) {
    console.log(msg);
  }
}

/**
 * RANDOMNESS
 */

export function rand(min, max) {
  if (typeof max == "undefined") {
    max = min;
    min = 0;
  }
  return Math.random() * (max - min) + min;
}
export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
export function shuffle(arr) {
  arr.sort((a, b) => Math.random() * 2 - 1); // Random number instead of comparison
}

/**
 * MATH
 */

/**
 * Angle conversions
 */
export function rad(deg) {
  return (Math.PI / 180) * deg;
}
export function deg(rad) {
  return (180 / Math.PI) * rad;
}
/**
 * Given a start, end, and percentage
 * find the current value.
 */
export function lerp(start, end, perc) {
  return start + (end - start) * perc;
}
/**
 * Given a start, end, and current value
 * find the percentage.
 */
export function alerp(start, end, curr) {
  if (start === end) {
    throw Error("Can't alerp when start equals end");
  }
  return (curr - start) / (end - start);
}
