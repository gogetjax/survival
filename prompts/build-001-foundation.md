# Survival Game · Build 001 · Foundation

> **For Claude Code.** Run this from inside the `gogetjax/survival` repo on `main`.
> This prompt does the entire Build 001 in a dedicated git worktree on a new branch, ending with an opened PR.

---

## Pre-flight (do these checks first, fail fast if anything is wrong)

1. Confirm CWD is the root of `gogetjax/survival` (look for `.git/`).
2. Confirm `git status` is clean on `main`. If dirty, stop and tell me.
3. Confirm Node ≥ 20 and `npm` are available (`node -v`, `npm -v`).
4. Confirm `gh` CLI is installed and authenticated (`gh auth status`). If not, do all the work but stop before PR creation and tell me to run `gh pr create` manually.
5. Confirm `prototype/v0-survivor-island.html` exists at the repo root. If it doesn't exist yet, **stop and tell me** — I need to commit it on `main` first. (It's the working HTML/Three.js prototype. The file is the design source of truth for everything in this build.)

---

## Worktree setup

Use a sibling-directory git worktree so my main checkout stays untouched. From the repo root:

```bash
BRANCH="build-001-foundation"
WORKTREE="../survival-${BRANCH}"

# Make sure the branch is fresh
git fetch origin
git worktree add "$WORKTREE" -b "$BRANCH" origin/main
cd "$WORKTREE"
```

**All subsequent work happens inside `$WORKTREE`.** Confirm with `pwd` before continuing.

When the build is finished, the cleanup happens back in the main checkout:
```bash
# (I'll run this myself after merging the PR)
git worktree remove ../survival-build-001-foundation
git branch -d build-001-foundation
```

---

## Goal

Convert the working v0 HTML prototype at `prototype/v0-survivor-island.html` into a clean Vite + TypeScript + Three.js modular project, update the README, and establish `CLAUDE.md` as the persistent design context for all future builds.

**Behavioral identity is the bar.** When I run `npm run dev` after this build, the game must look and play **exactly** like the prototype. This build is structural, not feature work.

---

## Game context (for your situational awareness)

A 3D single-player survival game on an island. Player manages four energy bars (Stamina, Armor, Food, Drink), faces mutated humanoid cannibals more active at night, and must survive 1,000 in-game days by harvesting trees and building shelter. Day/night cycle: 1 game day = 15 game hours = 75 real minutes at spec speed (1 game hour = 5 real minutes). Two camera modes: first-person and third-person over-the-shoulder.

The full design bible goes in `CLAUDE.md` — content provided below.

---

## Tasks

Execute in this order. Commit after each major task with the indicated message so we get a readable history.

### Task 1 — Update `README.md`

Replace the existing README with the project overview content (see PR for final text).

Commit:
```bash
git add README.md
git commit -m "docs: replace README with Survivor project overview"
```

### Task 2 — Create `CLAUDE.md`

Create `CLAUDE.md` at the repo root with the design bible content (see committed file for final text).

Commit:
```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md design bible"
```

### Task 3 — Save this prompt under `prompts/`

Save **this entire prompt** to `prompts/build-001-foundation.md` so the prompt itself is committed alongside the work it produced.

Commit:
```bash
git add prompts/build-001-foundation.md
git commit -m "docs(prompts): add build-001 prompt"
```

### Task 4 — Project scaffolding

Create at the repo root:

- `package.json` with dependencies and scripts:
  ```json
  {
    "name": "survival",
    "private": true,
    "version": "0.1.0",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview",
      "test": "vitest",
      "typecheck": "tsc --noEmit",
      "lint": "eslint src --ext .ts",
      "format": "prettier --write \"src/**/*.{ts,css,html}\""
    },
    "dependencies": {
      "three": "^0.160.0"
    },
    "devDependencies": {
      "@types/three": "^0.160.0",
      "@types/node": "^20.0.0",
      "@typescript-eslint/eslint-plugin": "^7.0.0",
      "@typescript-eslint/parser": "^7.0.0",
      "eslint": "^8.57.0",
      "prettier": "^3.2.0",
      "typescript": "^5.3.0",
      "vite": "^5.1.0",
      "vitest": "^1.3.0"
    }
  }
  ```
- `tsconfig.json` — strict mode, target ES2022, module preserve, moduleResolution bundler, paths alias `@/*` → `src/*`.
- `vite.config.ts` — basic config with the same `@` alias.
- `vitest.config.ts` — node environment, globals enabled.
- `.eslintrc.cjs` — typescript-eslint recommended, no-unused-vars on, no-explicit-any warn (not error — we'll allow with comment).
- `.prettierrc` — single quotes, semi true, trailing comma all, print width 100.
- `.gitignore` — `node_modules`, `dist`, `.DS_Store`, `*.log`, `.vite/`.
- `index.html` at repo root — the Vite entry. Mounts `<canvas id="game-canvas">`, `<div id="hud">…</div>` (the full HUD markup from the prototype, structurally identical), and the start-screen overlay. Imports `/src/main.ts` and `/src/styles/hud.css`. Loads Google Fonts: Cinzel (600,800), Special Elite, JetBrains Mono (400,700).

Commit:
```bash
git add package.json tsconfig.json vite.config.ts vitest.config.ts .eslintrc.cjs .prettierrc .gitignore index.html
git commit -m "build: scaffold Vite + TypeScript + Three.js + Vitest"
```

Then run `npm install`. Add `package-lock.json` to the next commit.

### Task 5 — Migrate the prototype to modules

The prototype is at `prototype/v0-survivor-island.html`. Read it and translate into the file structure laid out in CLAUDE.md.

**Implementation rules**
- Functionality must be **identical** to the prototype. No "improvements" this build.
- Every magic number from the prototype goes into `src/config/balance.ts`, organized by domain (`TIME`, `STATS`, `PLAYER`, `MUTANT`, `WORLD`, `HUD`).
- The `getHeight(x, z)` formula appears in **exactly one file**: `src/world/heightmap.ts`. Both `Terrain.ts` and `Minimap.ts` import it. After the build, run `grep -rn "Math.max(0, 26 - dist" src/` and confirm the formula appears in one place only.
- HUD CSS is ported verbatim into `src/styles/hud.css`.
- HUD HTML structure is in `index.html`; HUD components query their already-mounted children and only manage updates from then on.
- TypeScript strict mode passes with **zero `any`** (use `unknown` + narrowing, or proper types).
- Each file ≤ ~250 lines. If a file is bigger, the split is wrong.

**Module checklist**
- `src/types/index.ts`
- `src/config/balance.ts`
- `src/world/heightmap.ts`
- `src/world/Terrain.ts`
- `src/world/Ocean.ts`
- `src/world/Trees.ts`
- `src/world/Rocks.ts`
- `src/world/Stars.ts`
- `src/time/DayNightCycle.ts`
- `src/time/SkySystem.ts`
- `src/player/Player.ts`
- `src/player/PlayerController.ts`
- `src/player/PlayerCamera.ts`
- `src/player/SurvivalStats.ts`
- `src/entities/Mutant.ts`
- `src/entities/MutantFactory.ts`
- `src/entities/MutantManager.ts`
- `src/hud/HUD.ts`
- `src/hud/EnergyBars.ts`
- `src/hud/TimePanel.ts`
- `src/hud/Minimap.ts`
- `src/hud/Hotbar.ts`
- `src/hud/ViewMode.ts`
- `src/hud/Banner.ts`
- `src/hud/ThreatIndicator.ts`
- `src/hud/Crosshair.ts`
- `src/hud/ControlsHelp.ts`
- `src/hud/FxOverlay.ts`
- `src/input/InputManager.ts`
- `src/persistence/SaveManager.ts`
- `src/game/GameLoop.ts`
- `src/game/GameState.ts`
- `src/game/Game.ts`
- `src/main.ts`
- `src/styles/hud.css`

### Task 6 — Tests

Create under `tests/`:

- `tests/heightmap.test.ts`
- `tests/survival-stats.test.ts`
- `tests/day-night.test.ts`
- `tests/mutant-factory.test.ts`

Commit:
```bash
git add tests/
git commit -m "test: add coverage for heightmap, stats, time, and mutant factory"
```

### Task 7 — Verify everything

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

### Task 8 — Push and open PR

```bash
git push -u origin build-001-foundation
gh pr create --title "Build 001: Project Foundation" --body "..."
```

---

## Acceptance criteria

- Worktree at `../survival-build-001-foundation` exists on branch `build-001-foundation`.
- `npm install && npm run dev` opens a browser session **visually and behaviorally identical** to `prototype/v0-survivor-island.html`.
- `npm run build`, `typecheck`, `lint`, `test` all pass.
- Zero `any` in `src/`. Zero TODOs that should have been done in this build.
- No file in `src/` exceeds ~250 lines.
- Every magic number from the prototype lives in `src/config/balance.ts`.
- `getHeight` formula appears in exactly one file (verifiable with grep).
- `README.md`, `CLAUDE.md`, and `prompts/build-001-foundation.md` are committed.
- PR is open against `main` with the provided title and body.

## Out of scope

- Crafting / harvesting / building shelter — Build 002+
- Save/load to disk — skeleton only
- Combat (player attacking mutants)
- New biome regions
- Audio
- Multiplayer (explicitly out of project scope)
- Changing prototype HUD aesthetics
- Switching art style (locked low-poly until user signals otherwise)

## References

- `CLAUDE.md` — the design bible (created in this build)
- `prototype/v0-survivor-island.html` — the working prototype to migrate
- Three.js docs: https://threejs.org/docs/
- Vite docs: https://vitejs.dev/
