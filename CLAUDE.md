# CLAUDE.md — Survivor: Of the Forgotten Isle

> Persistent context for Claude Code. Read this **first** on every session.
> Build-specific instructions live in `prompts/build-NNN-*.md`.

## 1. The Game

A 3D single-player survival game set on an island. The player must survive 1,000 in-game days by managing four energy bars, building shelter, and avoiding (or fighting) mutated humanoid cannibals.

**Pillars**
- **Survival is multi-axis.** Four interacting needs (Stamina, Armor, Food, Drink) — letting any reach 0 kills you.
- **Time is a resource.** Day/night cycle drives mutant aggression, visibility, and resource availability.
- **Shelter is earned.** Crafting tools → harvesting logs → building walls is the core progression loop.
- **The island is finite but layered.** Forest, desert, mountains, grassy plains — each biome has different threats and resources.

## 2. Core spec (frozen unless explicitly changed in a build prompt)

### Player
- Two camera modes: first-person eye-level and third-person over-the-shoulder. Toggle with `V`.
- Four energy bars; any reaches 0 → death → respawn at a random beach point.
  | Bar     | Drains from                              | Replenished by                              |
  |---------|------------------------------------------|---------------------------------------------|
  | Stamina | Sprinting; running while low food/drink  | Resting, walking slowly, sleep              |
  | Armor   | Mutant attacks                           | Crafted gear, healing items                 |
  | Food    | Time (constant)                          | Berries, cooked meat, fish                  |
  | Drink   | Time (faster than food)                  | Fresh water (best), soda, alcohol (worst)   |
- Movement speed scales with stamina.

### World
- One island surrounded by ocean. Biomes: forest, desert, mountains, grassy plains.
- Day/night cycle: 1 in-game day = 15 in-game hours = 75 real minutes at spec speed (1 game hr = 5 real min).
- 8 hours daylight, 7 hours night, smooth sunrise/sunset, stars at night.
- HUD always shows: current day, in-game time, real-elapsed time and speed multiplier (dev).

### Mutants
- Cannibals & deformed humanoids: 3 arms, 3 legs, 2 heads — visual variation matters.
- Tiered strength → tiered armor damage on hit.
- More active at night; some patrol by day.
- Territorial — certain regions are mutant-controlled.
- Range-based vision: only see player within detection radius.

### Crafting & building
- Find or craft tools → harvest logs from trees → build walls/roof → assemble shelter.

### Win condition
- Survive 1,000 days.

### Save system
- Save at any time via key or menu. Save = full game state, resumable.

## 3. Tech stack & conventions

### Stack
- **Vite** — dev server, build, HMR
- **TypeScript** — strict mode, no `any` unless commented why
- **Three.js** (r150+) — 3D rendering
- **Vanilla HTML/CSS** for HUD overlay
- **Vitest** — unit tests for pure logic
- **ESLint + Prettier** — enforced

### File structure
```
src/
├── main.ts
├── config/
│   └── balance.ts                 # ALL tunable numbers
├── game/
│   ├── Game.ts
│   ├── GameLoop.ts
│   └── GameState.ts
├── world/
│   ├── heightmap.ts               # pure (x,z)→height — single source of truth
│   ├── Terrain.ts
│   ├── Ocean.ts
│   ├── Trees.ts
│   ├── Rocks.ts
│   ├── Stars.ts
│   └── Biomes.ts
├── player/
│   ├── Player.ts
│   ├── PlayerController.ts
│   ├── PlayerCamera.ts
│   └── SurvivalStats.ts
├── entities/
│   ├── Mutant.ts
│   ├── MutantFactory.ts
│   └── MutantManager.ts
├── time/
│   ├── DayNightCycle.ts
│   └── SkySystem.ts
├── hud/
│   ├── HUD.ts
│   ├── EnergyBars.ts
│   ├── TimePanel.ts
│   ├── Minimap.ts
│   ├── Hotbar.ts
│   ├── ViewMode.ts
│   ├── Banner.ts
│   ├── ThreatIndicator.ts
│   ├── Crosshair.ts
│   ├── ControlsHelp.ts
│   └── FxOverlay.ts
├── input/
│   └── InputManager.ts
├── persistence/
│   └── SaveManager.ts             # skeleton only in Build 001
├── styles/
│   └── hud.css
└── types/
    └── index.ts

docs/
├── README.md
├── changelog.md
└── mechanics/
    ├── combat.md
    ├── movement.md
    └── (one file per gameplay system)
```

### Conventions
- **Heightmap is the single source of truth for terrain elevation.** Terrain mesh, minimap, tree placement, rock placement, mutant placement, and player ground-follow all import from `world/heightmap.ts`. The formula appears in **exactly one file**.
- **Game time is in game-hours (float, 0–15).** Real-time is computed for display only.
- **Decay rates are per game-hour.** Multiply by `gameHoursPerSec * dt`.
- **HUD components own their DOM.** Constructor takes a parent element, mounts itself, exposes `update()` and `dispose()`. No global selectors.
- **Pure functions in `/world` and `/time`.** Fully testable.
- **Three.js objects in classes** with explicit `update(dt)` and `dispose()`.
- **No magic numbers in game logic.** All tunables live in `src/config/balance.ts`.

### HUD aesthetic
Rugged survivor field-journal: amber `#e8b557` on near-black, diagonal-cut panels, fonts Cinzel + Special Elite + JetBrains Mono. No purple gradients. No glassmorphism. Reference: `prototype/v0-survivor-island.html`.

### 3D aesthetic
Currently low-poly stylized. Locked in for now; revisited when the user signals.

## 4. Build workflow

Each build is one self-contained PR.

1. User and Claude (the design assistant on Claude.ai) iterate on a feature.
2. A `prompts/build-NNN-<slug>.md` file is committed to `main`.
3. From the main checkout, the user creates a worktree:
   ```bash
   git worktree add ../survival-build-NNN-<slug> -b build-NNN-<slug> origin/main
   cd ../survival-build-NNN-<slug>
   ```
4. User runs Claude Code, pastes the prompt.
5. Claude Code commits, pushes, opens a PR.
6. User reviews, merges, removes the worktree.

### Build prompt template
```
# Survival Game · Build NNN · <Title>

## Pre-flight
## Worktree setup
## Goal
## Context
## Tasks (numbered, with commit messages)
## Acceptance criteria
## Out of scope
## References
```

## 5. Hard rules

- **Never** introduce new top-level dependencies without listing them in the build prompt.
- **Never** modify the `getHeight` formula without an explicit task to do so — the minimap, terrain mesh, and entity placement depend on it being deterministic across releases.
- **Never** put game-logic numbers (decay rates, mutant speeds, time scales) inline. They go in `src/config/balance.ts`.
- **Always** add at least one Vitest test for any new pure function in `/world`, `/time`, or `/persistence`.
- **Always** keep the HUD performant — only mutate `textContent` when the displayed value actually changed (cache last-displayed values).
- **Don't** prematurely optimize 3D rendering. ~100 trees and ~10 mutants is fine without instancing.
- **Always** update `docs/` when a build changes gameplay. Specifically:
  - New mechanic → new file in `docs/mechanics/`.
  - Changed tunable, behavior, or rule → update the relevant existing mechanics file.
  - Every build → append an entry to `docs/changelog.md`.
- **Never** duplicate balance numbers between `src/config/balance.ts` and the docs. Docs explain *what* and *why*; the config is the *truth*. Link, don't copy.

## 6. Glossary

- **Build** — one numbered iteration, one PR.
- **Game hour** — 1/15th of a game day. 1 game hr = 5 real min at spec speed.
- **Decay rate** — units lost per game-hour for a survival stat.
- **Detection radius** — distance at which a mutant becomes aware of the player.
- **Spawn point** — beach location the player materializes at on start or respawn.
