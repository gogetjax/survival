import { describe, expect, it } from 'vitest';
import { createMutant, rollVariation } from '@/entities/MutantFactory';
import { makeRng } from '@/world/rng';

describe('rollVariation', () => {
  it('produces 1 or 2 heads, 2 or 3 arms, 2 or 3 legs', () => {
    const rng = makeRng(42);
    for (let i = 0; i < 200; i++) {
      const v = rollVariation(rng);
      expect([1, 2]).toContain(v.heads);
      expect([2, 3]).toContain(v.arms);
      expect([2, 3]).toContain(v.legs);
    }
  });

  it('hits all 8 variation combinations across 50 seeded generations', () => {
    const rng = makeRng(123);
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const v = rollVariation(rng);
      seen.add(`${v.heads}-${v.arms}-${v.legs}`);
    }
    expect(seen.size).toBe(8);
  });
});

describe('createMutant', () => {
  it('produces a mutant whose mesh count matches the variation', () => {
    const rng = makeRng(999);
    const m = createMutant(7, rng);
    const meshCount = m.group.children.length;
    const expected = 1 + m.variation.heads + m.variation.arms + m.variation.legs; // torso + parts
    expect(meshCount).toBe(expected);
    expect(m.id).toBe(7);
  });
});
