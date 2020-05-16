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

let DEBUG = true;
export function debug(msg) {
  if (DEBUG) {
    console.log(msg);
  }
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
