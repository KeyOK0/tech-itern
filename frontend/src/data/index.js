// Loads the JSON data files, validates them once at startup and exposes lookups by id.
import { MAX_PARTY_SIZE, MAX_WAVE_ENEMIES } from '../config/balance';
import { AI_PROFILE, ENEMY_TIER, HERO_CLASS, RARITY, UNLOCK_TYPE, ZONE } from '../config/constants';
import enemiesJson from './enemies.json';
import heroesJson from './heroes.json';
import stagesJson from './stages.json';
import { assertCollection } from './schema';

const STATS = {
  hp: 'number',
  atk: 'number',
  mag: 'number',
  def: 'number',
  res: 'number',
  spd: 'number',
  'critChance?': 'number',
  'critMult?': 'number',
};

// Unlock rules nest through `of` (all/any), so the spec refers to itself.
const UNLOCK = { shape: { type: { enum: Object.values(UNLOCK_TYPE) } } };
UNLOCK.shape['of?'] = { arrayOf: UNLOCK };

const HERO = {
  id: 'string',
  name: 'string',
  class: { enum: Object.values(HERO_CLASS) },
  rarity: { enum: Object.values(RARITY) },
  unlock: UNLOCK,
  base: { shape: STATS },
  growth: 'object',
  skills: { arrayOf: 'string' },
  sprite: 'string',
};

const ENEMY = {
  id: 'string',
  name: 'string',
  tier: { enum: Object.values(ENEMY_TIER) },
  stats: { shape: STATS },
  skills: { arrayOf: 'string' },
  ai: { enum: Object.values(AI_PROFILE) },
  sprite: 'string',
  loot: 'array',
  xp: 'number',
  coins: 'number',
};

const STAGE = {
  id: 'string',
  zone: { enum: Object.values(ZONE) },
  name: 'string',
  recommendedLevel: 'number',
  roundLimit: 'number',
  'fixedParty?': { arrayOf: { shape: { hero: 'string', level: 'number' } } },
  waves: { arrayOf: { shape: { enemies: { arrayOf: 'string' } } } },
  rewards: 'object',
  bg: 'string',
  music: 'string',
};

export const HEROES = assertCollection(heroesJson, HERO, 'heroes.json');
export const ENEMIES = assertCollection(enemiesJson, ENEMY, 'enemies.json');
export const STAGES = assertCollection(stagesJson, STAGE, 'stages.json');

const indexById = (records) => new Map(records.map((record) => [record.id, record]));
const heroesById = indexById(HEROES);
const enemiesById = indexById(ENEMIES);
const stagesById = indexById(STAGES);

export const getHero = (id) => heroesById.get(id);
export const getEnemy = (id) => enemiesById.get(id);
export const getStage = (id) => stagesById.get(id);

// References between files (stage -> enemies/heroes) and battlefield capacity.
function checkReferences() {
  const errors = [];
  for (const stage of STAGES) {
    const where = `stages.json "${stage.id}"`;
    if (stage.waves.length === 0) errors.push(`${where}: needs at least one wave`);
    stage.waves.forEach((wave, i) => {
      const count = wave.enemies.length;
      if (count === 0 || count > MAX_WAVE_ENEMIES) {
        errors.push(`${where} wave ${i + 1}: needs 1-${MAX_WAVE_ENEMIES} enemies`);
      }
      for (const id of wave.enemies) {
        if (!enemiesById.has(id)) errors.push(`${where} wave ${i + 1}: unknown enemy "${id}"`);
      }
    });
    const party = stage.fixedParty ?? [];
    if (party.length > MAX_PARTY_SIZE) errors.push(`${where}: fixedParty over ${MAX_PARTY_SIZE} heroes`);
    for (const { hero } of party) {
      if (!heroesById.has(hero)) errors.push(`${where}: unknown hero "${hero}"`);
    }
  }
  if (errors.length) throw new Error(`Invalid game data:\n${errors.join('\n')}`);
}

checkReferences();
