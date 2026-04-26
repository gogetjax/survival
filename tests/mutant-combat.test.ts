import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { MUTANT } from '@/config/balance';
import { tickCombat, type Mutant } from '@/entities/Mutant';
import { Player } from '@/player/Player';

function makeAtlas(width = 768, height = 1376): THREE.Texture {
  const tex = new THREE.Texture();
  (tex as unknown as { image: { width: number; height: number } }).image = { width, height };
  return tex;
}

function makeMutantStub(): Mutant {
  return {
    id: 0,
    sprite: null as unknown as THREE.Sprite,
    home: new THREE.Vector2(),
    target: new THREE.Vector2(),
    repick: 0,
    aware: false,
    attackCooldown: 0,
    variantUrl: '',
  };
}

describe('tickCombat — cooldown gates attacks', () => {
  it('attacks once when in range at night with zero cooldown, sets cooldown to ATTACK_COOLDOWN_SEC', () => {
    const r = tickCombat(0, 1.0, true, 1 / 60);
    expect(r.attacked).toBe(true);
    expect(r.attackCooldown).toBe(MUTANT.ATTACK_COOLDOWN_SEC);
  });

  it('does not attack 0.5s after a swing — cooldown drained to 1.0, still > 0', () => {
    const r = tickCombat(MUTANT.ATTACK_COOLDOWN_SEC, 1.0, true, 0.5);
    expect(r.attacked).toBe(false);
    expect(r.attackCooldown).toBeCloseTo(1.0, 6);
  });

  it('attacks again once cooldown elapses', () => {
    const r = tickCombat(1.0, 1.0, true, 1.0);
    expect(r.attacked).toBe(true);
    expect(r.attackCooldown).toBe(MUTANT.ATTACK_COOLDOWN_SEC);
  });
});

describe('tickCombat — out of range', () => {
  it('does not attack when player is beyond ATTACK_RADIUS at night', () => {
    const r = tickCombat(0, 5, true, 1 / 60);
    expect(r.attacked).toBe(false);
  });

  it('signals chase when in detection but outside attack range, at night', () => {
    const r = tickCombat(0, MUTANT.ATTACK_RADIUS + 1, true, 1 / 60);
    expect(r.shouldChase).toBe(true);
  });

  it('does not chase during the day', () => {
    const r = tickCombat(0, MUTANT.ATTACK_RADIUS + 1, false, 1 / 60);
    expect(r.shouldChase).toBe(false);
  });

  it('does not chase if outside detection radius', () => {
    const r = tickCombat(0, MUTANT.DETECTION_RADIUS + 1, true, 1 / 60);
    expect(r.shouldChase).toBe(false);
  });
});

describe('tickCombat — daytime aggro is a per-second probability', () => {
  function runDaytime(random: () => number, ticks = 1000, dt = 1 / 60): number {
    let cooldown = 0;
    let hits = 0;
    for (let i = 0; i < ticks; i++) {
      const r = tickCombat(cooldown, 1.0, false, dt, random);
      cooldown = r.attackCooldown;
      if (r.attacked) hits++;
    }
    return hits;
  }

  it('fires zero hits when random() always returns 0.5 (above DAYTIME_AGGRO_CHANCE)', () => {
    expect(runDaytime(() => 0.5)).toBe(0);
  });

  it('fires once per cooldown when random() always returns 0.0', () => {
    // 1000 ticks at dt=1/60 = ~16.67s. Cooldown is 1.5s, so attacks happen
    // every ~90 frames → ~11–12 hits in the window.
    const hits = runDaytime(() => 0.0);
    expect(hits).toBeGreaterThanOrEqual(10);
    expect(hits).toBeLessThanOrEqual(12);
  });
});

describe('Player.takeMeleeHit', () => {
  it('subtracts damage from armor', () => {
    const p = new Player(makeAtlas());
    p.stats.armor = 100;
    p.takeMeleeHit(MUTANT.ATTACK_DAMAGE, makeMutantStub());
    expect(p.stats.armor).toBe(75);
  });

  it('clamps armor at zero across multiple hits', () => {
    const p = new Player(makeAtlas());
    p.stats.armor = 100;
    for (let i = 0; i < 5; i++) p.takeMeleeHit(MUTANT.ATTACK_DAMAGE, makeMutantStub());
    expect(p.stats.armor).toBe(0);
  });

  it('dispatches a meleeHit event carrying damage and source', () => {
    const p = new Player(makeAtlas());
    p.stats.armor = 100;
    const source = makeMutantStub();
    let received: { damage: number; source: Mutant } | null = null;
    p.addEventListener('meleeHit', (e) => {
      received = (e as CustomEvent<{ damage: number; source: Mutant }>).detail;
    });
    p.takeMeleeHit(MUTANT.ATTACK_DAMAGE, source);
    expect(received).not.toBeNull();
    expect(received!.damage).toBe(MUTANT.ATTACK_DAMAGE);
    expect(received!.source).toBe(source);
  });
});
