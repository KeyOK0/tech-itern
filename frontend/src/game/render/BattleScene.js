// Pixi battle scene. Phase 1: background + idle units with HP bars, built from a line-up
// (see game/lineup.js). Rendering never mutates game state.
import { Container } from 'pixi.js';
import { SIDE } from '../../config/constants';
import { createBackground } from './backgrounds';
import { getSlotPositions } from './layout';
import { createUnitView } from './unitView';

const PHASE_STEP = 1.9; // de-syncs the idle bob between neighbours
const ENEMY_PHASE_OFFSET = 0.8;

function placeSide(side, members) {
  const slots = getSlotPositions(side, members.length);
  const offset = side === SIDE.ENEMY ? ENEMY_PHASE_OFFSET : 0;
  return members.map((unit, i) => createUnitView({ unit, side, ...slots[i], phase: i * PHASE_STEP + offset }));
}

export function createBattleScene({ app, world, lineup }) {
  const root = new Container();
  const background = createBackground(lineup.bg);
  const unitLayer = new Container();
  unitLayer.sortableChildren = true;
  const overlayLayer = new Container();
  root.addChild(background.view, unitLayer, overlayLayer);
  world.addChild(root);

  const units = [...placeSide(SIDE.HERO, lineup.heroes), ...placeSide(SIDE.ENEMY, lineup.enemies)];
  for (const unit of units) {
    unitLayer.addChild(unit.view);
    overlayLayer.addChild(unit.overlay);
  }

  let seconds = 0;
  const tick = (ticker) => {
    seconds += ticker.deltaMS / 1000;
    background.update(seconds);
    for (const unit of units) unit.update(seconds);
  };
  app.ticker.add(tick);

  return {
    destroy() {
      app.ticker.remove(tick);
      // `context: true` also frees the GraphicsContexts each Graphics created for itself.
      root.destroy({ children: true, context: true });
      background.destroy();
    },
  };
}
