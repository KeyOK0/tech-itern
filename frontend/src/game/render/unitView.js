// One unit on the battlefield: ground shadow, idle-bobbing body and HP bar.
import { Container, Graphics } from 'pixi.js';
import { createHpBar } from './hpBar';
import { createUnitSprite } from './spriteFactory';

const BOB_HEIGHT = 4;
const BOB_SPEED = 2.4; // radians per second
const SQUASH = 0.025;
const HP_BAR_GAP = 14;
const MIN_HP_BAR_WIDTH = 64;

export function createUnitView({ unit, side, x, y, phase }) {
  const view = new Container();
  view.position.set(x, y);
  view.zIndex = y; // lower on screen = closer = drawn on top

  const sprite = createUnitSprite(unit, side);
  const shadow = new Graphics()
    .ellipse(0, 0, sprite.width * 0.5, sprite.width * 0.13)
    .fill({ color: 0x000000, alpha: 0.22 });
  const body = new Container();
  body.addChild(sprite.view);
  const hpBar = createHpBar({ width: Math.max(MIN_HP_BAR_WIDTH, sprite.width * 0.9), side });
  hpBar.view.y = HP_BAR_GAP;
  view.addChild(shadow, body, hpBar.view);

  // Sine idle: the body rises and stretches slightly while the shadow shrinks.
  function update(seconds) {
    const wave = Math.sin(seconds * BOB_SPEED + phase);
    const lift = (wave + 1) / 2;
    body.y = -lift * BOB_HEIGHT;
    body.scale.set(1 - SQUASH * wave, 1 + SQUASH * wave);
    shadow.scale.set(1 - lift * 0.08);
  }

  return { key: unit.key, view, hpBar, update };
}
