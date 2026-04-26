# Combat — Mutant Melee

> Implementation: [`src/entities/Mutant.ts`](../../src/entities/Mutant.ts), [`src/entities/MutantManager.ts`](../../src/entities/MutantManager.ts), [`src/player/Player.ts`](../../src/player/Player.ts).
> Tunables: [`src/config/balance.ts`](../../src/config/balance.ts) — `MUTANT.*`.

## What the player experiences

You hear (eventually) and see a mutant approach. Once they close to roughly arm's length, they start swinging — a slow, telegraphed blow lands every cooldown cycle, and each one chips a meaningful chunk off your armor. Standing still in melee range is a death sentence; you have a few hits worth of time to decide whether to flee or fight.

At night every mutant in range will swing on cooldown without hesitation. During the day, only some will commit to an attack on any given approach.

## Rules

- **Detection radius** — `MUTANT.DETECTION_RADIUS`. Within this distance and at night, a mutant chases.
- **Attack radius** — `MUTANT.ATTACK_RADIUS`. Within this distance, a mutant attempts to attack on cooldown and stops moving forward.
- **Attack cooldown** — `MUTANT.ATTACK_COOLDOWN_SEC`. Per-mutant timer; resets on every successful swing.
- **Attack damage** — `MUTANT.ATTACK_DAMAGE`. Subtracted from player armor (clamped to 0).
- **Daytime aggro** — `MUTANT.DAYTIME_AGGRO_CHANCE`. Per-second probability that a daytime mutant in attack range commits to its swing this second. Implemented as `random() < CHANCE * dt` inside the per-frame combat tick.
- **Night aggro** — `MUTANT.AGGRO_AT_NIGHT`. When true (default), nighttime mutants swing on every available cooldown if the player is in attack range.

The combat decision is a single pure function, [`tickCombat`](../../src/entities/Mutant.ts), so the rules above are testable without rendering.

## Failure modes / things to playtest

- **All mutants on a single player.** With `MUTANT.COUNT` mutants and unlucky positioning, several can be in range simultaneously. Each has its own cooldown, so being clustered means stacked swings. This is by design.
- **Cooldown desync.** Mutants spawn at different times, so their cooldowns are naturally desynced; a "bullet hell" of simultaneous swings shouldn't happen by chance.
- **Sprint-to-safety.** Sprint pulls away from chase by a thin margin (see [`movement.md`](./movement.md)). Detection radius is wide enough that breaking pursuit costs more stamina than the player typically has. Stamina exhaustion mid-flight is intended risk.

## Out of scope (for this system, current build)

- Player attacking back — no weapon swing system yet.
- Mutant variants having different damage / cooldown / speed (the 4 image variants are cosmetic only as of Build 003).
- Knockback, stagger, hit reactions, hit sparks/particles.
- Line-of-sight checks. Mutants attack through thin walls and trees today. Will need fixing once buildings are placeable.
- Audio cues for swings.
