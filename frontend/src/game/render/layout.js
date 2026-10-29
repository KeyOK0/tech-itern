// Battlefield geometry in design pixels (1280x720, scaled to fit the screen).
// Pure: no Pixi imports, so it can be unit-tested.
import { SIDE } from '../../config/constants';

export const DESIGN_WIDTH = 1280;
export const DESIGN_HEIGHT = 720;

// Feet positions as fractions of the design size, front-most slot first.
// Heroes stand at x 22-38%, staggered in two rows; enemies mirror them (x 62-78%).
const FORMATIONS = {
  1: [{ x: 0.32, y: 0.76 }],
  2: [
    { x: 0.36, y: 0.7 },
    { x: 0.27, y: 0.82 },
  ],
  3: [
    { x: 0.37, y: 0.68 },
    { x: 0.31, y: 0.82 },
    { x: 0.24, y: 0.69 },
  ],
  4: [
    { x: 0.38, y: 0.68 },
    { x: 0.33, y: 0.82 },
    { x: 0.27, y: 0.68 },
    { x: 0.22, y: 0.82 },
  ],
};

export const MAX_SLOTS = Object.keys(FORMATIONS).length;

export function getSlotPositions(side, count) {
  if (count <= 0) return [];
  const formation = FORMATIONS[Math.min(count, MAX_SLOTS)];
  return formation.map(({ x, y }) => ({
    x: (side === SIDE.ENEMY ? 1 - x : x) * DESIGN_WIDTH,
    y: y * DESIGN_HEIGHT,
  }));
}

// Largest 16:9 (design aspect) box that fits the viewport; the rest is letterbox.
export function computeLetterbox(viewWidth, viewHeight, designWidth = DESIGN_WIDTH, designHeight = DESIGN_HEIGHT) {
  const fit = Math.min(viewWidth / designWidth, viewHeight / designHeight);
  const width = Math.max(1, Math.floor(designWidth * fit));
  const height = Math.max(1, Math.floor(designHeight * fit));
  return { width, height, scale: width / designWidth };
}
