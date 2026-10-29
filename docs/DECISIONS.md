# Decisions

Choices made where `PLAN_ABE_CE_.md` was ambiguous or did not match the repo. Newest phase last.

## Phase 1

### Repo adaptations

- `.gitignore`: section headers were plain lines (they acted as ignore patterns) and `__pycache__/` was missing. Headers are now `#` comments; added `__pycache__/` and `backend/data/*.db`. The tracked `backend/app/__pycache__/*.pyc` was removed from git.
- README: backend path and command fixed to `backend/app/main.py` / `uvicorn app.main:app --reload`.
- `MainMenu.jsx`: kept the existing look. Title now comes from `config/gameInfo.js`, strings go through i18n, unused `onLogin`/`onRegister` props removed (they failed lint). Added a "Battle sandbox" button and an EN/PL toggle.
- `index.html`: `lang="en"` (English is the default UI language; the app updates `lang` at runtime) and the game title.
- `sql.txt` (MySQL, Polish table names) is untouched until Phase 5.

### Dependencies

- New dependencies are pinned to exact versions (`pixi.js` 8.22.0, `zustand` 5.0.15, `howler` 2.2.4, `gsap` 3.15.0, `vitest` 5.0.5). Existing `^` ranges were left as they were.
- `howler` and `gsap` are installed but not used yet (audio: Phase 6, event tweens: Phase 3).

### Data

- Each data file is a JSON array of records. `src/data/index.js` loads them, validates them with a tiny schema checker (`src/data/schema.js`) and cross-checks references (stage enemies/heroes, max 4 per side). Invalid data throws at startup.
- Hero `skills` and enemy `skills`/`loot` are empty arrays until `skills.json` (Phase 2) and `items.json` (Phase 4) exist, so no id points at nothing.
- Only Red's stats come from the plan. Stats for the other heroes and all enemies are first-pass placeholders, to be tuned in Phase 2.
- The Blues are one hero (one party slot), drawn as three small birds.
- Stages may have an optional `fixedParty: [{ hero, level }]`. Only the sandbox stage `test` uses it for now.
- Data names (`"Red"`, `"Grunt"`) are not translated. If Polish names are wanted later, `name` can become `{ en, pl }`.

### Rendering

- The canvas itself is sized to the largest 16:9 box that fits the viewport (black CSS letterbox around it). The scene draws in 1280x720 design pixels inside a `world` container scaled to that box. Device pixel ratio is capped at 2.
- `PixiCanvas` is StrictMode-safe: if the component unmounts while `app.init()` is pending, the app is destroyed when init resolves and never attached.
- Teardown: the scene destroys its display tree with `{ children: true, context: true }`. Without `context: true`, Pixi 8 keeps the GraphicsContext each Graphics created. `FillGradient`s are destroyed explicitly because they own textures.
- HP bars live in an overlay layer above all units, so a nearer unit never hides a bar.
- Enemy placeholders differ by tier (minion / elite / boss). Grunt, Slinger and Shaman look the same until real art arrives.
- The idle bob uses the Pixi ticker rather than gsap, so there are no tweens to kill on unmount.
- The battle route is lazy-loaded (`React.lazy`) so Pixi is not in the menu bundle. This also removes Vite's >500 kB chunk warning.
- `/battle/:stageId` is the route. The sandbox `/battle/test` also accepts `?party=` and `?wave=` for previewing; other stages ignore them.

### Code layout

- Folders are created when their first module lands (git does not track empty folders). `audio/`, `services/` and the other stores arrive in their phases.
- `i18n/translate.js` (pure) sits next to `useT.js` so translation is unit-testable without React.
- `game/lineup.js` turns stage + party into what the renderer draws. It is not engine code, and Phase 2's battle state will feed it.
- `game/engine/rng.js` keeps the full generator state in one uint32 (`rng.state()`), so a pure battle state can store it and resume the exact sequence.
