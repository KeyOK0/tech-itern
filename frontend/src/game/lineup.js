// Turns a stage + party into the static battlefield line-up the renderer draws.
// Pure: no Pixi/React imports.
import { MAX_PARTY_SIZE } from '../config/balance';
import { getEnemy, getHero } from '../data';

export function buildLineup(stage, { partyIds, waveIndex = 0 } = {}) {
  const ids = partyIds?.length ? partyIds : (stage.fixedParty ?? []).map((member) => member.hero);
  const party = [...new Set(ids)].filter((id) => getHero(id)).slice(0, MAX_PARTY_SIZE);
  const index = Math.min(Math.max(Math.trunc(waveIndex) || 0, 0), stage.waves.length - 1);

  return {
    stageId: stage.id,
    bg: stage.bg,
    waveIndex: index,
    waveCount: stage.waves.length,
    heroes: party.map((id) => {
      const hero = getHero(id);
      return { key: `hero:${id}`, sprite: hero.sprite, variant: hero.class };
    }),
    enemies: stage.waves[index].enemies.map((id, slot) => {
      const enemy = getEnemy(id);
      return { key: `enemy:${slot}:${id}`, sprite: enemy.sprite, variant: enemy.tier };
    }),
  };
}
