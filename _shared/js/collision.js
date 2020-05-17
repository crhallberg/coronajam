// LINE/LINE
export function lineLine(l1, l2) {
  // calculate the distance to intersection point
  var uA =
    ((l2.x2 - l2.x1) * (l1.y1 - l2.y1) - (l2.y2 - l2.y1) * (l1.x1 - l2.x1)) /
    ((l2.y2 - l2.y1) * (l1.x2 - l1.x1) - (l2.x2 - l2.x1) * (l1.y2 - l1.y1));
  var uB =
    ((l1.x2 - l1.x1) * (l1.y1 - l2.y1) - (l1.y2 - l1.y1) * (l1.x1 - l2.x1)) /
    ((l2.y2 - l2.y1) * (l1.x2 - l1.x1) - (l2.x2 - l2.x1) * (l1.y2 - l1.y1));

  // if uA and uB are between 0-1, lines are colliding
  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    // optionally, draw a circle where the lines meet
    var x = l1.x1 + uA * (l1.x2 - l1.x1);
    var y = l1.y1 + uA * (l1.y2 - l1.y1);

    return { x, y };
  }
  return false;
}

export function rectRect(r1, r2) {
  // are the sides of one rectangle touching the other?
  if (
    r1.x + r1.w >= r2.x && // r1 right edge past r2 left
    r1.x <= r2.x + r2.w && // r1 left edge past r2 right
    r1.y + r1.h >= r2.y && // r1 top edge past r2 bottom
    r1.y <= r2.y + r2.h // r1 bottom edge past r2 top
  ) {
    return true;
  }
  return false;
}
