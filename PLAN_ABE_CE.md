# Angry Birds Epic: Chopped Edition — Build Plan

Executor: Claude Opus in Claude Code, working in the repo folder (`tech-itern`, branch `Bazalright`).
Read this whole file first. Then build ONE phase at a time. After each phase: run it, check the acceptance list, commit, push, stop and report.

\---

## 0\. Ground rules

### 0.1 Goal

A browser-based, turn-based fantasy RPG battler in the style of Angry Birds Epic: a party of up to 4 heroes fights waves of enemies on a world-map-driven series of stages, earns loot, crafts and upgrades gear, and levels up. Account and save data live on the backend.

### 0.2 Assets and IP (important, everything should be exactly as in Angry Birds Epic)

* Use, trace, rip and recreate Rovio's sprites, screenshots, logos, sounds, character designs or names (Red, Chuck, Bomb, Matilda, King Pig, etc.). Screenshots of the original are reference for *layout, pacing and feel* only.
* Mechanics (turn-based party combat, classes, crafting, gear, wave battles, hero unlock order) are fine to follow as closely as possible. Character designs, names and art are the part that stays the same as in Angry Birds Epic.
* Hero unlock progression to implement (see 1.3.1): one starter hero, a second hero unlocked in the cave zone, three more heroes unlocked much later.
* Use Angry Birds Epic characters and art with the same archetypes: round, chunky, expressive heroes vs. enemy minions on a tropical-beach theme. Placeholder art first, final art later.
* ALL character, enemy, item and level definitions must live in JSON data files (see 4), so names and sprites can be swapped without touching code.
* Art sources allowed: Angry Birds Epic, self-made SVG(only if there is no other way), CC0 packs (only if there is no otheer way) (kenney.nl, opengameart.org CC0), Angry Birds Epic original art. Sound: Angry Birds Epic and ONLY if needed: CC0 (freesound.org CC0, kenney.nl). Record the source of every asset in `ASSETS.md`.
* Game title shown in UI: "Angry Birds Epic: Chopped Edition" is the personal project working title. Keep it in one constant (`src/config/gameInfo.js`).

### 0.3 Existing stack (do not change without reason)

* Frontend: React + Vite + Tailwind CSS, JavaScript (JSX), React Router. Dev: `cd frontend \\\&\\\& npm install \\\&\\\& npm run dev` -> http://localhost:5173
* Backend: Python + FastAPI, entry `backend/app/main.py`, run from `backend/` with venv active: `uvicorn app.main:app --reload` -> http://127.0.0.1:8000 (docs at /docs). Note: the README says `main:app`; the correct one is `app.main:app`.
* Existing: `frontend/src/App.jsx` (routes), `frontend/src/components/MainMenu.jsx`, `sql.txt` (table definitions: READ IT FIRST and extend it, do not discard it).
* OS of developer: Windows 11, PowerShell. Node v24, Python 3.13. Give Windows-friendly commands.
* Language of UI text: English (default) with an i18n-ready structure (`src/i18n/pl.js`, `en.js`). Code, comments and commit messages: English or Polish, be consistent (Polish commit messages are already used in the repo).
* Git: work only on branch `Bazalright`. Never commit `node\\\_modules`, `.venv`, `.env`, `\\\_\\\_pycache\\\_\\\_`. Run `git rm --cached -r backend/app/\\\_\\\_pycache\\\_\\\_` once and make sure `.gitignore` covers it.

### 0.4 Technical decisions

* Rendering: **PixiJS v8** (`pixi.js`) for the battle scene (sprites, tweens, particles, camera shake). React renders all menus/HUD overlays. Game logic is plain JS with NO Pixi/React imports, so it can be unit-tested.
* Animation tweens: `gsap` (or Pixi ticker + custom easing if gsap is unwanted).
* State: `zustand` for UI/global state (profile, inventory, settings). Battle state lives in a pure reducer-like engine object.
* Audio: `howler`.
* Tests: `vitest` for the logic layer (combat, loot, crafting, XP). `pytest` for backend.
* Backend: FastAPI + SQLAlchemy 2.x + SQLite in dev (file `backend/data/game.db`, git-ignored). Check `sql.txt`; if it targets MySQL/PostgreSQL, keep the same schema but keep the DB URL in `.env` (`DATABASE\\\_URL`) and provide `.env.example`.
* Auth: email/username + password, bcrypt hashing (`passlib\\\[bcrypt]` or `bcrypt`), JWT access token (`python-jose` or `PyJWT`), stored in memory + `localStorage` fallback. Never store plaintext passwords. Validate with Pydantic.
* Offline-friendly: the game must be playable as "Guest" (save in `localStorage`); logged-in players sync the same save JSON to the server.
* Pin new dependencies and update `backend/requirements.txt` / `frontend/package.json`.

### 0.5 Code quality rules

* Small files, one responsibility. No file over \~400 lines.
* All balance numbers in `src/data/\\\*.json` or `src/config/balance.js`, never hard-coded in logic.
* Deterministic RNG: use a seeded RNG (`mulberry32`) so battles can be replayed and tested.
* No magic strings: enums in `src/game/constants.js`.
* Every phase ends with: it runs with zero console errors, `npm run build` passes, tests pass, README section updated.

\---

## 1\. Game design (the "bible")

### 1.1 Core loop

Main menu -> World map -> choose stage -> pre-battle (select party, items) -> battle (waves) -> results (XP, coins, loot) -> back to map. Between battles: Inventory/Equipment, Crafting, Shop, Hero upgrade.

### 1.2 Screens (React routes)

|Route|Screen|
|-|-|
|`/`|Main menu (Play, Continue, Settings, Login/Register, Credits)|
|`/login`, `/register`|Auth|
|`/map`|World map with stage nodes|
|`/prebattle/:stageId`|Party select + consumables|
|`/battle/:stageId`|Battle (Pixi canvas + React HUD)|
|`/results`|Victory/defeat summary|
|`/party`|Heroes, level, skills, equipment|
|`/inventory`|Items, equipment slots, sell|
|`/craft`|Crafting bench|
|`/shop`|Buy with coins/gems|
|`/settings`|Volume, language, reset save|
|`\\\*`|404|

### 1.3 Heroes (data-driven; 4 starting classes)

Each hero: `id, name, class, baseStats, growthPerLevel, skills\\\[], spriteKey, rarity`.
Classes (original ab epic names, same archetypes):

* **Red (Vanguard**: tank/melee): high HP and defense, taunt, shield bash.
* **Chuck (Arcanist**:mage): ranged AoE magic, fragile, mana-less (uses Focus, see 1.5).
* **Blues: (Skirmisher**: rogue/dps): high speed, crits, single-target burst.
* **Matilda: (Mender**: support): heals, buffs, cleanse.
Stats: `hp, atk, mag, def, res, spd, critChance, critMult`. Level cap 30 for the MVP.

### 1.3.1 Hero roster and unlock order (5 heroes; archetypes, all original)

|Slot|Archetype|Available|Unlock rule|
|-|-|-|-|
|H1|Red (Vanguard: tank/melee)|From the start|Default; the only hero in the first stages (solo party, tutorial)|
|H2|Chuck<br />(Arcanist: ranged magic, fast)|Cave zone|Reach the Cave zone, then clear at least 3 Cave stages (`{type:"stageClearCount", zone:"cave", count:3}`)|
|H3|Matilda<br />(Mender: heal/support)|Late game|Clear the last stage of zone 3 (`{type:"stageClear", stageId:"z3\\\_s5"}`)|
|H4|Bomb<br />(Demolisher: AoE, self-damage risk)|Late game|Reach player level 15 and clear zone 3|
|H5|Blues (Jay, Jake and Jim)<br />(Skirmisher: speed/crit)|Late game|Clear zone 3 with 2+ stars on every stage or complete a quest (`{type:"quest", id:"q\\\_final"}`)|

Rules:

* Party size grows with unlocks: 1 hero at the start, 2 after H2, up to 4 active heroes with 5 owned (swap in pre-battle).
* Zone order for the MVP: Beach (1-5 stages, H1 only), Cave (unlocks H2), Jungle, Ruins; the later unlocks happen in Jungle/Ruins. Adjust stage ids in `stages.json` accordingly.
* Every hero has `unlock` in `heroes.json`; the engine reads it, never hard-codes who unlocks when. Locked heroes show as silhouettes with the unlock hint in `/party`.
* Show an unlock cutscene/banner (simple dialog + fanfare) when a hero joins.
* Stage design must account for it: Beach stages are balanced for one hero; Cave stages for 1-2; later zones for 3-4.

Stat growth: `stat(level) = base + growth \\\* (level - 1)`; XP to next level: `xpNeeded(L) = round(50 \\\* L^1.5)`.

### 1.4 Enemies

Data-driven: `id, name, tier (minion/elite/boss), stats, skills\\\[], aiProfile, spriteKey, loot table`.
Starter roster (original names, pig-style archetypes allowed generically as "hogs"): Grunt (melee), Slinger (ranged), Shaman (heals/buffs), Brute (elite, stuns), Chieftain (boss, 2 phases).
AI profiles: `aggressive` (lowest HP target), `random`, `focusHealer`, `bossScript` (fixed skill rotation + phase change at 50% HP).

### 1.5 Combat rules (turn-based)

* Battle = N waves (1-4) of up to 4 enemies. Party up to 4 heroes.
* Round structure: **Player phase**: each living hero may act once, in any order the player chooses. **Enemy phase**: each living enemy acts once, ordered by `spd` descending.
* Actions: `Attack` (basic), `Skill` (1 of up to 3, costs Focus or has cooldown), `Item` (consumable), `Defend` (+50% def until next turn, +1 Focus), `Swap` (optional later).
* **Focus** resource per hero: starts at 1, max 5, +1 per round, +1 on Defend, +1 when hit. Skills cost 1-3 Focus. Ultimate ("Rage" skill) needs a full **Rage meter** (0-100): +10 on dealing damage, +15 on taking damage; ultimate empties it.
* Basic attack has a **timing bonus**: a short tap-timing bar (or drag-to-aim flick) giving `Miss 0.8x / Good 1.0x / Great 1.25x`. Make this optional in settings ("Auto" = Good).
* Damage:

  * Physical: `raw = atk \\\* skillMult`; `dmg = raw \\\* (100 / (100 + def))`
  * Magic: `raw = mag \\\* skillMult`; `dmg = raw \\\* (100 / (100 + res))`
  * Variance: x(0.92..1.08); crit: x`critMult` (default 1.5) with `critChance` (default 8%).
  * Round to integer, minimum 1.
  * Healing: `heal = mag \\\* skillMult`, no variance, can't exceed max HP.
* Status effects: `stun` (skip turn, 1 round), `bleed` (5% max HP/round, 3 rounds), `shield` (absorbs X), `taunt` (enemies must target this hero), `buffAtk/buffDef` (+25%, 2 rounds), `weak` (-25% atk, 2 rounds). Status data-driven with duration and stacking rule (refresh, not stack).
* Win: all waves cleared. Lose: all heroes at 0 HP (offer "Continue" for gems later).
* Rewards: XP split evenly among surviving heroes, coins, loot rolls from enemy loot tables, 1-3 star rating (stars: win; no hero down; finish within X rounds).

### 1.5.1 Battle state machine

`INIT -> WAVE\\\_INTRO -> PLAYER\\\_TURN(select actor -> select action -> select target -> RESOLVE) -> CHECK\\\_WAVE -> ENEMY\\\_TURN(for each enemy: choose -> RESOLVE) -> CHECK\\\_END -> (next round | WAVE\\\_CLEARED -> WAVE\\\_INTRO | VICTORY | DEFEAT)`.
Engine API (pure): `createBattle(config, seed)`, `getLegalActions(state, actorId)`, `applyAction(state, action) -> {state, events\\\[]}`, `runEnemyPhase(state) -> {state, events\\\[]}`. The renderer consumes `events\\\[]` (damage, heal, status, death, wave) and plays animations sequentially. Never let animation code mutate battle state.

### 1.6 Items and gear

* Equipment slots per hero: Weapon, Hat/Helm, Armor, Charm. Each item: `id, slot, rarity (common/rare/epic), stats, setId?, upgradeLevel`.
* Rarity multipliers: common 1.0, rare 1.35, epic 1.8. Upgrade +1..+10, cost `100 \\\* 1.4^lvl` coins plus materials.
* Consumables: Potion (heal 40% max HP), Focus Tonic (+2 Focus), Rage Chilli-like item (original name: "Fire Pepper", +50 Rage), Revive Feather.
* Crafting: recipes (materials -> item) in `recipes.json`; materials drop from enemies and chests.
* Shop: daily rotating stock (client-seeded by date), prices in coins; gems as premium currency (earnable only via stars/achievements; no real money).
* Inventory capacity 100 with stacking for materials/consumables.

### 1.7 World map

* 3 zones x 10 stages for the MVP (Beach, Jungle, Ruins). Stage node states: locked, available, cleared (1-3 stars). Unlock rule: previous stage cleared.
* Stage data: `id, zone, name, waves\\\[], recommendedLevel, rewards, background, music`.
* Map art: scrollable image with absolutely positioned nodes (CSS), path line drawn in SVG.

### 1.8 Progression and economy targets (tune later, keep in balance.js)

* A stage takes 2-4 minutes. 5-8 stages to reach level 10 for the whole party.
* Enemy stats scale by stage: `statMult = 1 + 0.12 \\\* (stageIndex)`.
* Coin drop per stage \~ `20 + 8\\\*stageIndex`.

\---

## 2\. Project structure to create

```
frontend/src/
  main.jsx
  App.jsx
  config/        gameInfo.js, balance.js, constants.js
  data/          heroes.json, enemies.json, skills.json, items.json, recipes.json, stages.json, statuses.json
  game/
    engine/      battle.js, actions.js, damage.js, statuses.js, ai.js, rng.js, loot.js, xp.js, rating.js
    render/      BattleScene.js (Pixi), spriteFactory.js, effects.js (particles, shake, floating numbers), layout.js
    audio/       audioManager.js
  store/         useProfileStore.js, useSettingsStore.js, useBattleUiStore.js
  services/      api.js (fetch wrapper + JWT), saveService.js (local/remote sync)
  components/    MainMenu.jsx, auth/\\\*, map/\\\*, battle/\\\* (HUD, ActionMenu, TargetReticle, TurnBanner, Results), party/\\\*, inventory/\\\*, craft/\\\*, shop/\\\*, ui/\\\* (Button, Modal, Bar, Tooltip)
  i18n/          pl.js, en.js, useT.js
  assets/        sprites/, backgrounds/, ui/, audio/
  tests/         damage.test.js, battle.test.js, loot.test.js, xp.test.js
backend/app/
  main.py        (app, CORS, router includes, startup create tables)
  core/          config.py, security.py (hash, JWT)
  db/            session.py, models.py, base.py
  schemas/       user.py, save.py, leaderboard.py
  routers/       auth.py, save.py, leaderboard.py, health.py
  tests/         test\\\_auth.py, test\\\_save.py
```

\---

## 3\. Phased build (execute in order; each phase is a commit/PR)

### Phase 1: Foundation and the battle sandbox (no backend yet)

1. Install deps: `pixi.js`, `zustand`, `howler`, `gsap`, `vitest`.
2. Create folder structure, constants, RNG, i18n skeleton.
3. Build `PixiCanvas.jsx`: mounts a Pixi `Application`, responsive 16:9 stage (design resolution 1280x720, scaled to fit, letterboxed), destroys on unmount (React 18/19 StrictMode safe: guard double init).
4. Draw placeholder battle scene: layered beach background (sky, sea, sand, palms as simple SVG/graphics), 4 hero slots on the left (x \~ 22-38% of width, staggered), 4 enemy slots on the right (x \~ 62-78%), ground shadows, idle bobbing animation (sine tween).
5. Placeholder sprites: generated colored rounded shapes with eyes (original), one distinct color per class. Load through `spriteFactory.js` so real art can replace them.
6. Route `/battle/test` showing the scene with static units and HP bars.
**Acceptance:** scene renders at 60 fps, resizes correctly, no memory leak after navigating away and back 10 times.

### Phase 2: Combat engine (pure logic + tests)

1. Implement `damage.js`, `statuses.js`, `rng.js`, `battle.js`, `actions.js`, `ai.js` exactly per section 1.5.
2. Skills data for the 4 classes (3 skills each + 1 Rage ultimate) and 5 enemies.
3. Write vitest tests: damage formula edge cases, crit/variance bounds with seeded RNG, status duration, taunt override, death handling, wave progression, win/lose detection, deterministic replay (same seed + same actions => same events).
**Acceptance:** `npm test` green; a headless script simulates 1000 random battles without exceptions.

### Phase 3: Battle UI and animations

1. React HUD over the canvas: hero portraits with HP/Focus/Rage bars, action menu (Attack / Skills / Item / Defend), target selection with reticle, turn banner ("Twoja tura!" / "Tura wrogów"), wave counter, pause menu, speed toggle (1x/2x).
2. Event playback queue: for each event -> animation: move-to-target lunge, hit flash, floating damage numbers (crit bigger + color), heal sparkles, status icons above units, death fade + coin burst, screen shake on crit/boss hit, Rage ultimate cutscene (zoom + dim).
3. Attack timing mini-game (bar with moving cursor, tap to stop) + "Auto" option.
4. Enemy AI turn playback with short delays so the player can follow.
5. Results overlay (stars, XP, coins, loot list) and defeat overlay.
**Acceptance:** one complete 3-wave stage is playable start to finish with mouse and touch; no state desync between engine and visuals.

### Phase 4: Meta game (single-player, localStorage)

1. `useProfileStore` + `saveService`: profile JSON (version, heroes, levels, XP, equipment, inventory, currencies, stage progress, settings). Versioned save with migration function.
2. World map screen with stage nodes, star display, lock logic, zone tabs.
3. Pre-battle party select (drag/tap), recommended-level warning.
4. Party screen: hero stats, level-up, skill unlocks (skill unlocks at levels 1/5/10/15), equip/unequip with stat comparison.
5. Inventory (grid, filters, sell), crafting bench, shop, loot tables and drop animations.
6. Tutorial: first 3 stages teach attack, skills, items (non-blocking tooltips, skippable).
**Acceptance:** reload the page and all progress is intact; clearing stages unlocks the next; gear actually changes combat numbers.

### Phase 5: Backend (accounts, cloud save, leaderboard)

1. Read `sql.txt`, reconcile with SQLAlchemy models. Tables: `users(id, username unique, email unique, password\\\_hash, created\\\_at)`, `saves(id, user\\\_id FK unique, data JSON, version, updated\\\_at)`, `leaderboard(id, user\\\_id FK, stage\\\_id, best\\\_time\\\_s, stars, rounds, updated\\\_at)`.
2. Endpoints:

   * `POST /api/auth/register`, `POST /api/auth/login` (-> JWT), `GET /api/auth/me`
   * `GET /api/save`, `PUT /api/save` (body: save JSON + version; reject if version older than server unless `force=true`)
   * `POST /api/leaderboard/submit`, `GET /api/leaderboard?stage\\\_id=\\\&limit=`
   * `GET /api/health`
3. Security: bcrypt, JWT expiry 24h, rate-limit login (simple in-memory), validate payload size (<256 KB), server-side sanity checks on submitted scores (stars 0-3, plausible time/rounds). CORS allow `http://localhost:5173` only in dev; origins from env.
4. Frontend: login/register forms with validation and Polish error messages, token handling, "sync on login" conflict dialog (use cloud / use local), autosave debounce 3 s after changes.
5. Backend tests with pytest + FastAPI TestClient (register, duplicate user, login fail, save round trip, leaderboard ordering).
**Acceptance:** register on one browser, play, log in from another browser, progress appears; wrong password rejected; DB file not committed.

### Phase 6: Content, polish and juice

1. Expand to 3 zones x 10 stages, 8+ enemy types, 2 bosses with phases, 12 skills per class pool, 40+ items, 20 recipes.
2. Replace placeholder art with final Angry Birds Epic art; sprite sheets/animations (idle, attack, hit, death, cast). Parallax backgrounds, ambient particles (leaves, waves).
3. Audio: music per zone, SFX for hit/crit/heal/UI/victory; master/music/sfx sliders; (start on first click).
4. Settings, achievements (10), daily reward, credits page (list all asset sources).
5. Performance: texture atlases, lazy-load zones, `React.lazy` routes, cap particles, test on a low-end laptop and a phone.
6. Mobile: touch targets >= 44 px, landscape lock hint, safe areas.
7. Accessibility: colorblind-safe HP/status icons, keyboard shortcuts (1-4 actions, Tab target, Esc pause), reduced-motion setting.

### Phase 7: Release

1. Production build (`npm run build`), serve frontend static + FastAPI behind one origin or separate hosts (Vercel/Netlify for frontend, Render/Railway/Fly for backend), env vars documented.
2. README rewritten (Polish): setup, run, test, architecture diagram, balance guide, how to add a hero/enemy/stage via JSON.
3. Final QA checklist below. Merge `Bazalright` -> `main` through a pull request.

\---

## 4\. Data schemas (JSON, validate at load with a tiny schema checker)

```jsonc
// heroes.json
{ "id": "vanguard\\\_01", "name": "Hero name", "class": "vanguard", "rarity": "common",
  "unlock": { "type": "start" },   // or stageClearCount | stageClear | level | quest

  "base": { "hp": 120, "atk": 14, "mag": 4, "def": 12, "res": 6, "spd": 8, "critChance": 0.05, "critMult": 1.5 },
  "growth": { "hp": 14, "atk": 2.2, "mag": 0.6, "def": 1.8, "res": 0.8, "spd": 0.3 },
  "skills": \\\["shield\\\_bash", "taunt", "guard\\\_up", "rage\\\_slam"], "sprite": "hero\\\_vanguard" }

// skills.json
{ "id": "shield\\\_bash", "name": "...", "type": "physical", "target": "enemy\\\_single",
  "mult": 1.3, "focusCost": 1, "cooldown": 0, "effects": \\\[{ "status": "stun", "chance": 0.35, "duration": 1 }],
  "anim": "lunge", "vfx": "impact\\\_small", "sfx": "hit\\\_heavy", "unlockLevel": 1 }
// targets: enemy\\\_single | enemy\\\_all | ally\\\_single | ally\\\_all | self | enemy\\\_random\\\_x3

// enemies.json: stats like heroes + "ai": "aggressive", "loot": \\\[{ "item": "mat\\\_wood", "chance": 0.5, "min": 1, "max": 2 }], "xp": 20, "coins": 8
// stages.json: { "id": "z1\\\_s1", "zone": "beach", "name": "...", "recommendedLevel": 1,
//   "waves": \\\[ { "enemies": \\\["grunt", "grunt"] }, { "enemies": \\\["slinger", "grunt", "grunt"] } ],
//   "rewards": { "coins": 30, "xp": 40, "firstClearGems": 5 }, "bg": "beach\\\_day", "music": "zone1" }
```

## 5\. API contract (summary)

|Method|Path|Body|Response|
|-|-|-|-|
|POST|/api/auth/register|{username,email,password}|201 {id,username}|
|POST|/api/auth/login|{username,password}|{access\_token,token\_type}|
|GET|/api/auth/me|JWT|{id,username}|
|GET|/api/save|JWT|{data,version,updated\_at} or 404|
|PUT|/api/save|JWT {data,version}|{version,updated\_at} / 409 on conflict|
|POST|/api/leaderboard/submit|JWT {stage\_id,stars,rounds,time\_s}|200|
|GET|/api/leaderboard|?stage\_id\&limit|\[{username,stars,rounds,time\_s}]|

Errors: JSON `{ "detail": "..." }`, proper 400/401/403/404/409/422.

## 6\. Asset checklist (placeholder -> final)

* Heroes: 4 classes x (idle 4f, attack 6f, hit 3f, death 5f, cast 6f).
* Enemies: 8 types, same animation set; 2 bosses larger.
* Backgrounds: beach, jungle, ruins (3 layers each: far, mid, near) + map image.
* UI: buttons, bars, panels, icons (skills, statuses, items, currencies), banner text styles ("Twoja tura!").
* VFX sprites: hit sparks, heal sparkle, shield bubble, bleed drops, stun stars, coin burst.
* Audio: 3 music loops, \~25 SFX.
* Fonts: one display font (OFL licensed, e.g. from Google Fonts) + one UI font. Self-host.

## 7\. QA checklist (before merge)

* \[ ] New player flow: register -> tutorial -> clear stage 1 -> level up -> equip item -> craft -> shop -> logout -> login -> progress intact.
* \[ ] Guest flow works fully offline (backend stopped).
* \[ ] 1000-battle headless simulation passes, no NaN/negative HP.
* \[ ] No console errors/warnings in a 10-minute session.
* \[ ] Resize/rotate/zoom: layout holds; touch works.
* \[ ] Memory stable after 20 battles (no growth > 20%).
* \[ ] No secrets in git history (`.env`, DB file, tokens).
* \[ ] `ASSETS.md` lists every asset with license.
* \[ ] All tests green (`npm test`, `pytest`), `npm run build` OK.

## 8\. Instructions to the executor (Opus)

1. Start with Phase 1 only. Do not start the next phase until the user says so.
2. Before writing code, inspect the existing repo (`App.jsx`, `MainMenu.jsx`, `package.json`, `backend/app/main.py`, `requirements.txt`, `sql.txt`, `.gitignore`) and adapt this plan to what exists; say what you changed.
3. Make small commits with clear Polish messages, e.g. `Dodano silnik walki: obliczanie obrażeń`.
4. When something in this plan is ambiguous, choose the simplest option that keeps the data-driven design, and note the choice in `docs/DECISIONS.md`.
5. After each phase: summarize what was built, how to run it, what to test manually, and what is next. Keep it short.
6. Do not copy any Rovio/Angry Birds assets or names (see 0.2). Use original placeholders.

