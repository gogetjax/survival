# Survivor Documentation

This directory holds the long-form design and mechanics documentation for *Survivor: Of the Forgotten Isle*.

## What lives here vs. CLAUDE.md

- **`CLAUDE.md`** (repo root) — the *operational* design bible. Conventions, file layout, hard rules, frozen spec. Read by Claude Code on every session.
- **`docs/`** (this folder) — the *explanatory* docs. Mechanics deep-dives, design rationale, changelog. Read by humans (and Claude when planning future builds).

If a fact about how the game *works* lives in your head and not in `docs/mechanics/`, it's not real yet.

## Index

- [`changelog.md`](./changelog.md) — what shipped in each build
- `mechanics/` — gameplay system documentation
  - [`combat.md`](./mechanics/combat.md) — mutant melee, damage, attack rates
  - [`movement.md`](./mechanics/movement.md) — walk, sprint, jump, stamina interaction

## Conventions

- One mechanic per file. If a system grows past ~300 lines, split it.
- Lead with the **player-facing experience** (what the player sees/feels), then the **rules** (numbers, timings), then the **implementation pointer** (which `src/` files own this).
- When numbers appear in a doc, they reference `src/config/balance.ts` — link to it. Never duplicate the number; readers will trust the doc, the doc goes stale, and tuning becomes a lie.
- Every PR that touches gameplay updates the relevant doc in the same commit.
