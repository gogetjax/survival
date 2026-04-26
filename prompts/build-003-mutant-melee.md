# Survival Game · Build 003 · Mutant Melee Combat & Docs Structure

> **For Claude Code.** Run from inside `gogetjax/survival` after Build 002 has merged to `main`.

---

## Pre-flight

1. CWD is repo root, on `main`, clean working tree.
2. `git pull origin main` and confirm Build 002's commits are present (e.g. `git log --oneline -20 | grep -i "image"` should hit).
   - If Build 002 hasn't merged yet, **stop and tell me** — do not branch from `build-002-image-assets`. We want a clean linear history.
3. `node`, `npm`, `gh` all healthy as before.

---

## Worktree setup

```bash
BRANCH="build-003-mutant-melee"
WORKTREE="../survival-${BRANCH}"

git fetch origin
git worktree add "$WORKTREE" -b "$BRANCH" origin/main
cd "$WORKTREE"
pwd
```

---

## Goal

Two changes shipped together as one PR:

1. **Mutant melee combat.** When a mutant is within attack range, it auto-attacks the player on a cooldown, dealing armor damage per swing. Mutant chase speed is rebalanced so the player can only outrun them by sprinting.
2. **Documentation foundation.** Bootstrap `docs/` with a real structure, document the combat and movement systems, start a changelog, and add a hard rule in `CLAUDE.md` that all future builds touching gameplay mechanics must update the corresponding doc.

---

## Context

The current behavior (from Build 001's prototype migration) was a placeholder: any mutant within ~2.5m of the player drained armor continuously per frame. That's not how melee works in any survival game worth playing. This build replaces it with discrete swings on a rate-of-attack timer, and tunes the chase speed so movement choices actually matter.

---

## Tasks

### Task 1 — Save this prompt

```bash
mkdir -p prompts
# Save this entire prompt to prompts/build-003-mutant-melee.md
git add prompts/build-003-mutant-melee.md
git commit -m "docs(prompts): add build-003 prompt"
```

### Task 2 — Combat & movement balance

Update `src/config/balance.ts`. Add or modify:

```ts
export const PLAYER = {
  // ... existing ...
  walkSpeed: 4,      // unchanged — mutants are FASTER than walking
  sprintSpeed: 7.5,  // unchanged — only ~15% faster than mutant chase
  // ... rest unchanged
};

export const MUTANT = {
  // ... existing ...
  detectionRadius: 15,           // unchanged
  chaseSpeed: 6.5,               // CHANGED from 2.0 — closes ground on a walking player
  patrolSpeed: 0.5,              // existing patrol speed unchanged (slow saunter)
  attackRadius: 2.0,             // CHANGED from 2.5 — tighter melee range
  attackCooldownSec: 1.5,        // NEW — time between swings
  attackDamage: 25,              // NEW — armor damage per swing
  aggroAtNight: true,            // NEW — formalize the "more aggressive at night" rule
  daytimeAggroChance: 0.3,       // NEW — extracted from the prototype's Math.random() < 0.3
};
```

**Speed sanity check:** with these numbers, a walking player (4 m/s) cannot escape a chasing mutant (6.5 m/s). A sprinting player (7.5 m/s) is 15% faster, so they pull away gradually — but the moment stamina hits zero and they fall back to walk speed, the mutant catches up. This is the intended tension.

```bash
git add src/config/balance.ts
git commit -m "balance: rebalance mutant chase speed and add melee combat tunables"
```

### Task 3 — Mutant attack state

Update `src/entities/Mutant.ts`:

- Add a private field `private attackCooldown: number = 0` (seconds remaining until next swing is available).
- Refactor the per-frame `update(dt, player, isNight)` method:
  - Decrement `attackCooldown` by `dt` each frame, clamped to ≥0.
  - Compute XZ distance to player (ignore Y for melee — sprite billboards don't have a real "height" for combat purposes).
  - If `distance < MUTANT.attackRadius`:
    - If `attackCooldown <= 0` AND (`isNight` OR `Math.random() < MUTANT.daytimeAggroChance * dt * 60` — frame-rate-normalized chance), call `player.takeMeleeHit(MUTANT.attackDamage, this)` and set `attackCooldown = MUTANT.attackCooldownSec`.
    - Stop chase movement (don't keep walking through the player).
  - Else if `distance < MUTANT.detectionRadius` AND `isNight`:
    - Move toward player at `MUTANT.chaseSpeed * dt`.
  - Else:
    - Continue patrol behavior (unchanged from current implementation).

**Important:** the per-frame "daytime aggro" calculation in the existing code is `Math.random() < 0.3`, which fires ~18 times per second at 60 FPS. That's not what was intended — it should be a per-second probability. Convert it to: `Math.random() < MUTANT.daytimeAggroChance * dt` so it averages 0.3 attacks per second of being in range during the day. (Bonus: comment this in the code so future-us doesn't make the same mistake.)

### Task 4 — Player damage hook

Update `src/player/Player.ts`:

- Add public method `takeMeleeHit(damage: number, source: Mutant): void` that:
  - Subtracts `damage` from `armor` (clamped to ≥0).
  - Triggers the hurt FX overlay (we have this from Build 001).
  - If you want to fire an event for HUD reactions later, expose it via an `EventTarget` on the player. Don't go further than that this build.

Remove the old continuous-damage logic from wherever it lived (likely `MutantManager` or `Mutant.update`'s old form).

```bash
git add src/entities/Mutant.ts src/player/Player.ts
git commit -m "feat(combat): mutants perform discrete melee swings on cooldown"
```

### Task 5 — Tests

Add `tests/mutant-combat.test.ts`:

- **Cooldown gates attacks.** Set up a mutant with `attackCooldown = 0`, run one update with player in range at night → `takeMeleeHit` called once, cooldown set to 1.5. Run another update 0.5s later in range → no second hit (cooldown still 1.0). Run another 1.0s later → second hit fires.
- **Out of range doesn't attack.** Player 5m away, night, cooldown 0 → no hit.
- **Daytime aggro is probabilistic.** Run 1000 update ticks at dt=1/60 with player in range during day, with `Math.random` mocked to always return 0.5 (above default chance) → no hits. Mock `Math.random` to always return 0.0 → hits on every cooldown cycle.
- **Damage applies correctly.** `player.armor = 100`, take a 25-damage hit → `player.armor = 75`. Take three more → 0 (clamped).

If `Mutant.update` references global `Math.random` directly, refactor to accept an optional `random: () => number` parameter for testability (defaulting to `Math.random`).

```bash
git add tests/mutant-combat.test.ts
git commit -m "test(combat): cover mutant attack cooldown and damage"
```

### Task 6 — Bootstrap `docs/`

This is the one-time investment. Create:

```
docs/
├── README.md
├── changelog.md
└── mechanics/
    ├── combat.md
    └── movement.md
```

#### `docs/README.md`

```markdown
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
```

#### `docs/changelog.md`

```markdown
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
```

#### `docs/mechanics/combat.md`

```markdown
# Combat — Mutant Melee

> Implementation: [`src/entities/Mutant.ts`](../../src/entities/Mutant.ts), [`src/player/Player.ts`](../../src/player/Player.ts).
> Tunables: [`src/config/balance.ts`](../../src/config/balance.ts) — `MUTANT.*`.

## What the player experiences

You hear (eventually) and see a mutant approach. Once they close to roughly arm's length, they start swinging — a slow, telegraphed blow lands every ~1.5 seconds, and each one chips a meaningful chunk off your armor. Standing still in melee range is a death sentence; you have a few hits worth of time to decide whether to flee or fight.

At night every mutant in range will swing on cooldown without hesitation. During the day, only some will commit to an attack on any given approach (default ~30% chance per second of being in range).

## Rules

- **Detection radius** — `MUTANT.detectionRadius` (15 m). Within this distance and at night, a mutant chases.
- **Attack radius** — `MUTANT.attackRadius` (2 m). Within this distance, attempts to attack on cooldown.
- **Attack cooldown** — `MUTANT.attackCooldownSec` (1.5 s). Per-mutant timer; resets on every successful swing.
- **Attack damage** — `MUTANT.attackDamage` (25). Subtracted from player armor (clamped to 0).
- **Daytime aggro** — `MUTANT.daytimeAggroChance` (0.3 / sec). Probability per second in range that a daytime mutant commits to its swing.
- **Night aggro** — always 100%; if cooldown is ready and player is in range, the mutant swings.

## Failure modes / things to playtest

- **All mutants on a single player.** With 7 mutants and unlucky positioning, multiple can be in range simultaneously. Each has its own cooldown — the player can take 4 simultaneous hits per 1.5 s window. This is by design; clustering is dangerous.
- **Cooldown desync.** Mutants spawn at different times so their cooldowns are naturally desynced; a "bullet hell" of 7 simultaneous swings shouldn't happen by chance.
- **Sprint-to-safety.** Player sprint (7.5 m/s) vs mutant chase (6.5 m/s) gives ~1 m/s separation. With `MUTANT.detectionRadius = 15`, leaving the chase takes ~15 s of sprinting — comfortably longer than your stamina lasts. Stamina exhaustion mid-flight is intended risk.

## Out of scope (for this system, current build)

- Player attacking back — no weapon swing system yet.
- Mutant variants having different damage / cooldown / speed (the 4 image variants are cosmetic only as of Build 003).
- Knockback, stagger, hit reactions, hit sparks/particles.
- Line-of-sight checks. Mutants attack through thin walls and trees today. Will need fixing once buildings are placeable.
- Audio cues for swings.
```

#### `docs/mechanics/movement.md`

```markdown
# Movement — Walk, Sprint, Jump

> Implementation: [`src/player/PlayerController.ts`](../../src/player/PlayerController.ts).
> Tunables: [`src/config/balance.ts`](../../src/config/balance.ts) — `PLAYER.*`, `STATS.*`.

## What the player experiences

Walking is your default — steady, sustainable, but slower than the things hunting you. Sprinting is your escape valve, faster than mutants but burning stamina the whole time. When stamina runs out, you fall back to walking — which means whatever you were running from is now closing the gap.

Jumping is a small vertical hop, mostly useful for terrain and traversal. It does not grant invulnerability or break melee cooldowns.

## Rules

- **Walk speed** — `PLAYER.walkSpeed` (4 m/s). Slower than mutant chase. Standing-and-walking is being-caught.
- **Sprint speed** — `PLAYER.sprintSpeed` (7.5 m/s). ~15% faster than mutant chase. Held with `Shift`. Drains stamina at `STATS.staminaSprintDrainPerSec`.
- **Stamina-modulated walking** — when not sprinting, walk speed scales with stamina (down to 50% at 0 stamina). Starvation is mobility loss.
- **Stamina regen** — non-zero only when not sprinting. Faster when idle than when walking.
- **Jump** — `PLAYER.jumpVel` (7), `PLAYER.gravity` (18). Hopping up a step costs nothing else.

## Speed comparison table

| Actor                            | Speed (m/s) |
|----------------------------------|-------------|
| Player walking, full stamina     | 4.0         |
| Player walking, 0 stamina        | 2.0         |
| Player sprinting                 | 7.5         |
| Mutant patrolling                | 0.5         |
| Mutant chasing (night, in range) | 6.5         |

The player's only durable speed advantage is sprint, which is gated by stamina. Every encounter is a stamina-vs-distance calculation.

## Out of scope

- Crouching / sneaking (would interact with mutant detection radius — flagged for future build).
- Climbing, swimming, vaulting.
- Encumbrance from inventory weight (deferred until inventory exists).
```

```bash
git add docs/
git commit -m "docs: bootstrap docs/ with mechanics and changelog"
```

### Task 7 — Update `CLAUDE.md`

Two additions:

**(A)** In the "File structure" section, add the `docs/` folder:
```
docs/
├── README.md
├── changelog.md
└── mechanics/
    ├── combat.md
    ├── movement.md
    └── (one file per gameplay system)
```

**(B)** Add to the "Hard rules" section (Section 5):
```markdown
- **Always** update `docs/` when a build changes gameplay. Specifically:
  - New mechanic → new file in `docs/mechanics/`.
  - Changed tunable, behavior, or rule → update the relevant existing mechanics file.
  - Every build → append an entry to `docs/changelog.md`.
- **Never** duplicate balance numbers between `src/config/balance.ts` and the docs. Docs explain *what* and *why*; the config is the *truth*. Link, don't copy.
```

```bash
git add CLAUDE.md
git commit -m "docs: add docs/ to file structure and require doc updates per build"
```

### Task 8 — Verify

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Sanity check the in-game behavior (mentally — by re-reading the diff):
- Walking toward a night mutant: it closes the gap and starts swinging.
- Sprinting away: you slowly pull ahead until stamina runs out.
- Daytime in-range: occasional swings, not constant.

### Task 9 — Push and PR

```bash
git push -u origin build-003-mutant-melee

gh pr create \
  --title "Build 003: Mutant Melee Combat & Docs Structure" \
  --body "$(cat <<'EOF'
Two changes in one PR — they're small enough to ship together.

## Combat
- Replaces the legacy continuous-damage placeholder with discrete melee swings on a 1.5s cooldown.
- Bumps mutant chase speed from 2.0 → 6.5 m/s. Walking no longer outruns them; sprinting (7.5 m/s) does — at 15% margin, so stamina exhaustion is real.
- Each swing does 25 armor damage. ~4 hits to strip you.
- Fixes a latent bug: daytime aggro was \`Math.random() < 0.3\` per frame (~18 chances/sec at 60fps). Now it's a proper per-second rate.
- All 4 mutant image variants share these stats today; per-variant tiers deferred to a later build.

## Docs
- Bootstrapped \`docs/\` with index, changelog, and two mechanics files (combat, movement).
- Added a hard rule to \`CLAUDE.md\`: gameplay-changing builds must update \`docs/mechanics/\` and append to the changelog. No exceptions.

## Reviewer checklist
- [ ] In-game: walk straight at a mutant at night → it closes and starts swinging on a clear rhythm
- [ ] Run from a mutant on full stamina → you pull ahead slowly
- [ ] Let stamina drain mid-flight → mutant catches up
- [ ] In-game during day: mutants in range attack occasionally, not every frame
- [ ] \`docs/mechanics/combat.md\` and \`docs/mechanics/movement.md\` accurately describe the shipped behavior
- [ ] \`docs/changelog.md\` has Builds 001–003 entries
EOF
)"
```

---

## Acceptance criteria

- [ ] Mutant chase speed rebalanced; player walk < mutant chase < player sprint.
- [ ] Discrete attack cooldown system, no continuous-damage code remaining.
- [ ] Daytime aggro is a per-second rate, not per-frame.
- [ ] `docs/` exists with `README.md`, `changelog.md`, and `mechanics/{combat,movement}.md`.
- [ ] `CLAUDE.md` has the new docs-update hard rule.
- [ ] All four numbers (chase speed, attack radius, cooldown, damage) live in `src/config/balance.ts`, nowhere else.
- [ ] `npm run typecheck`, `lint`, `test`, `build` all pass.
- [ ] PR open with the body above.

## Out of scope

- ❌ Player combat (attacking mutants) — separate build
- ❌ Mutant HP / killable mutants
- ❌ Per-variant mutant stats (tier system)
- ❌ Knockback, stagger, hit-flash on mutants, particle effects
- ❌ Line-of-sight / wall-blocking for mutant attacks
- ❌ Swing animations on the sprites
- ❌ Audio cues
- ❌ Free-look third-person camera (still queued — separate build)

## References

- `CLAUDE.md` — design bible
- `prompts/build-001-foundation.md`, `prompts/build-002-image-assets.md`
- Three.js sprite docs unchanged from last build

## When done, reply with

1. PR URL.
2. Confirmation that you re-read the in-game logic against the new docs and they match.
3. Anything you noticed about combat balance that feels off on paper (we can tune in a follow-up).
