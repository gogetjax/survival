# Changelog

## Build 003 — Mutant Melee Combat & Docs Structure

- Mutants now perform discrete melee swings on a configurable cooldown (default 1.5s).
- Mutant chase speed rebalanced from 2.0 → 6.5 m/s. Walking can no longer outrun them; sprinting can, but only while stamina lasts.
- Damage per swing: 25 armor. Removed the legacy continuous per-frame damage.
- Daytime aggro converted from broken per-frame probability to a per-second rate.
- Bootstrap of `docs/`: index, changelog, and the first two mechanics docs (combat, movement).
- New hard rule in `CLAUDE.md`: gameplay changes update `docs/mechanics/`.

## Build 002 — Image-Based Mutants & Player

- Replaced procedural humanoid geometry with image billboards.
- 4 mutant PNG variants assigned randomly per spawn.
- Player sprite atlas (3×3 grid) with directional cell selection based on camera angle.
- Texture preloader with loading progress on the start screen.

## Build 001 — Project Foundation

- Migrated v0 HTML prototype into Vite + TypeScript + Three.js modular structure.
- Established `CLAUDE.md` design bible, `prompts/` build-prompt directory, `src/config/balance.ts` as the single tunables file.
- `getHeight` formula enforced as single source of truth across terrain mesh and minimap.
- Vitest coverage on heightmap, survival stats, day/night cycle, and (legacy) mutant factory.
