// Enums shared across the app. Use these instead of raw strings.

export const HERO_CLASS = Object.freeze({
  VANGUARD: 'vanguard',
  ARCANIST: 'arcanist',
  MENDER: 'mender',
  DEMOLISHER: 'demolisher',
  SKIRMISHER: 'skirmisher',
});

export const ENEMY_TIER = Object.freeze({
  MINION: 'minion',
  ELITE: 'elite',
  BOSS: 'boss',
});

export const AI_PROFILE = Object.freeze({
  AGGRESSIVE: 'aggressive',
  RANDOM: 'random',
  FOCUS_HEALER: 'focusHealer',
  BOSS_SCRIPT: 'bossScript',
});

export const RARITY = Object.freeze({
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
});

export const UNLOCK_TYPE = Object.freeze({
  START: 'start',
  STAGE_CLEAR: 'stageClear',
  STAGE_CLEAR_COUNT: 'stageClearCount',
  ZONE_CLEAR: 'zoneClear',
  LEVEL: 'level',
  QUEST: 'quest',
  ALL: 'all',
  ANY: 'any',
});

export const ZONE = Object.freeze({
  BEACH: 'beach',
  CAVE: 'cave',
  JUNGLE: 'jungle',
  RUINS: 'ruins',
});

export const SIDE = Object.freeze({
  HERO: 'hero',
  ENEMY: 'enemy',
});

export const LANGUAGE = Object.freeze({
  EN: 'en',
  PL: 'pl',
});

export const DEFAULT_LANGUAGE = LANGUAGE.EN;

export const SANDBOX_STAGE_ID = 'test';

export const ROUTES = Object.freeze({
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  BATTLE: '/battle/:stageId',
});

export const battlePath = (stageId) => `/battle/${stageId}`;

export const STORAGE_KEYS = Object.freeze({
  SETTINGS: 'abece.settings',
});
