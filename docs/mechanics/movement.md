# Movement — Walk, Sprint, Jump

> Implementation: [`src/player/PlayerController.ts`](../../src/player/PlayerController.ts), [`src/player/SurvivalStats.ts`](../../src/player/SurvivalStats.ts).
> Tunables: [`src/config/balance.ts`](../../src/config/balance.ts) — `PLAYER.*`, `STATS.*`.

## What the player experiences

Walking is your default — steady, sustainable, but slower than the things hunting you. Sprinting is your escape valve, faster than mutants but burning stamina the whole time. When stamina runs out, you fall back to walking — which means whatever you were running from is now closing the gap.

Jumping is a small vertical hop, mostly useful for terrain and traversal. It does not grant invulnerability or break melee cooldowns.

## Rules

- **Walk speed** — `PLAYER.WALK_SPEED`. Slower than mutant chase. Standing-and-walking is being-caught.
- **Sprint speed** — `PLAYER.SPRINT_SPEED`. Faster than mutant chase, but only by a thin margin. Held with `Shift`.
- **Sprint stamina drain** — `STATS.STAMINA_SPRINT_DRAIN_PER_SEC`. Sprinting drains stamina each real second. Sprint is gated by `canSprint(stamina)` (stamina > 1) — falling under that boots you back to walk.
- **Stamina regen** — `STATS.STAMINA_REGEN_PER_SEC`, applied any tick you are not sprinting (idle and walking regen at the same rate today).
- **Jump** — `PLAYER.JUMP_VELOCITY` and `PLAYER.GRAVITY` define a fixed hop. Jumping costs no stamina today.

## Speed comparison

(Values mirror `src/config/balance.ts`; if you change them there, update this table in the same commit.)

| Actor                            | Source                       |
|----------------------------------|------------------------------|
| Player walking                   | `PLAYER.WALK_SPEED`          |
| Player sprinting                 | `PLAYER.SPRINT_SPEED`        |
| Mutant patrolling                | `MUTANT.PATROL_SPEED`        |
| Mutant chasing (night, in range) | `MUTANT.CHASE_SPEED`         |

Speed ordering is the design contract: `MUTANT.PATROL_SPEED < PLAYER.WALK_SPEED < MUTANT.CHASE_SPEED < PLAYER.SPRINT_SPEED`. Walking can never escape a chase; sprinting can, until stamina runs out. Tune values, but do not invert this ordering without an explicit balance discussion.

## Out of scope

- Crouching / sneaking (would interact with mutant detection radius — flagged for future build).
- Climbing, swimming, vaulting.
- Encumbrance from inventory weight (deferred until inventory exists).
- Stamina-modulated walk speed. Today, walk speed is constant; stamina only gates whether sprint is allowed.
