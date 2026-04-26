import { describe, expect, it } from 'vitest';
import { classifyBiome, getHeight } from '@/world/heightmap';

describe('getHeight', () => {
  it('is deterministic', () => {
    const a = getHeight(10, 20);
    const b = getHeight(10, 20);
    expect(a).toBe(b);
  });

  it('returns -3 (ocean floor) when dist > 88', () => {
    expect(getHeight(100, 0)).toBe(-3);
    expect(getHeight(0, 100)).toBe(-3);
    expect(getHeight(70, 70)).toBe(-3);
  });

  it('returns positive height at the centre', () => {
    expect(getHeight(0, 0)).toBeGreaterThan(0);
  });
});

describe('classifyBiome', () => {
  it('classifies low heights as sand', () => {
    expect(classifyBiome(0.5)).toBe('sand');
  });

  it('classifies mid heights as grass', () => {
    expect(classifyBiome(3)).toBe('grass');
  });

  it('classifies high heights as rock', () => {
    expect(classifyBiome(10)).toBe('rock');
  });
});
