import { describe, expect, it } from 'vitest';
import { ENEMY_TIER, HERO_CLASS, SANDBOX_STAGE_ID, UNLOCK_TYPE } from '../config/constants';
import { ENEMIES, getStage, HEROES, STAGES } from '../data';
import { assertCollection, validate } from '../data/schema';
import { buildLineup } from '../game/lineup';

describe('game data', () => {
  it('ships five heroes, one per class', () => {
    expect(HEROES).toHaveLength(5);
    expect(HEROES.map((hero) => hero.class).sort()).toEqual(Object.values(HERO_CLASS).sort());
  });

  it('starts with Red only', () => {
    const starters = HEROES.filter((hero) => hero.unlock.type === UNLOCK_TYPE.START);
    expect(starters.map((hero) => hero.id)).toEqual(['red']);
  });

  it('covers every enemy tier with the starter roster', () => {
    expect(new Set(ENEMIES.map((enemy) => enemy.tier))).toEqual(new Set(Object.values(ENEMY_TIER)));
  });

  it('has the sandbox stage', () => {
    expect(STAGES.map((stage) => stage.id)).toContain(SANDBOX_STAGE_ID);
  });
});

describe('schema checker', () => {
  const shape = { id: 'string', hp: 'number', 'note?': 'string', tags: { arrayOf: 'string' } };

  it('accepts a valid record and a missing optional field', () => {
    expect(validate({ id: 'a', hp: 1, tags: [] }, { shape })).toEqual([]);
  });

  it('reports missing, mistyped and non-finite fields', () => {
    const errors = validate({ hp: Number.NaN, note: 3, tags: ['x', 2] }, { shape });
    expect(errors).toEqual(['$.id: missing', '$.hp: expected number', '$.note: expected string', '$.tags[1]: expected string']);
  });

  it('checks enums', () => {
    expect(validate('mage', { enum: ['vanguard'] })).toEqual(['$: expected one of vanguard']);
  });

  it('rejects duplicate ids', () => {
    expect(() => assertCollection([{ id: 'a' }, { id: 'a' }], { id: 'string' }, 'test.json')).toThrow(/duplicate id "a"/);
  });
});

describe('buildLineup', () => {
  const sandbox = getStage(SANDBOX_STAGE_ID);

  it('uses the stage fixed party and the first wave by default', () => {
    const lineup = buildLineup(sandbox);
    expect(lineup.heroes.map((hero) => hero.key)).toEqual(sandbox.fixedParty.map(({ hero }) => `hero:${hero}`));
    expect(lineup.enemies).toHaveLength(sandbox.waves[0].enemies.length);
    expect(lineup.waveIndex).toBe(0);
    expect(lineup.waveCount).toBe(sandbox.waves.length);
  });

  it('maps heroes to their class and enemies to their tier', () => {
    const lineup = buildLineup(sandbox, { partyIds: ['blues'], waveIndex: 1 });
    expect(lineup.heroes).toEqual([{ key: 'hero:blues', sprite: 'hero_blues', variant: HERO_CLASS.SKIRMISHER }]);
    expect(lineup.enemies.map((enemy) => enemy.variant)).toContain(ENEMY_TIER.BOSS);
  });

  it('drops unknown and duplicate heroes and caps the party at four', () => {
    const lineup = buildLineup(sandbox, { partyIds: ['red', 'nobody', 'red', 'chuck', 'matilda', 'bomb', 'blues'] });
    expect(lineup.heroes.map((hero) => hero.key)).toEqual(['hero:red', 'hero:chuck', 'hero:matilda', 'hero:bomb']);
  });

  it('clamps the wave index', () => {
    expect(buildLineup(sandbox, { waveIndex: 99 }).waveIndex).toBe(sandbox.waves.length - 1);
    expect(buildLineup(sandbox, { waveIndex: -3 }).waveIndex).toBe(0);
    expect(buildLineup(sandbox, { waveIndex: Number.NaN }).waveIndex).toBe(0);
  });
});
