import { describe, expect, it } from 'vitest';
import { STATS, TIME_GAME_HOURS_PER_REAL_SEC } from '@/config/balance';
import {
  isDead,
  makeFreshStats,
  updateNeeds,
  updateStamina,
} from '@/player/SurvivalStats';

describe('updateStamina', () => {
  it('drains stamina while sprinting at the configured rate', () => {
    const dt = 1.0;
    const expected = STATS.MAX - STATS.STAMINA_SPRINT_DRAIN_PER_SEC * dt;
    expect(updateStamina(STATS.MAX, true, dt)).toBeCloseTo(expected, 6);
  });

  it('regenerates while not sprinting and is bounded by MAX', () => {
    const v = updateStamina(STATS.MAX - 10, false, 1.0);
    expect(v).toBeCloseTo(STATS.MAX - 10 + STATS.STAMINA_REGEN_PER_SEC, 6);
    expect(updateStamina(STATS.MAX, false, 100)).toBe(STATS.MAX);
  });

  it('cannot drop below 0', () => {
    expect(updateStamina(0.5, true, 100)).toBe(0);
  });
});

describe('updateNeeds', () => {
  it('food and drink decay are bounded at 0', () => {
    const stats = { stamina: 100, armor: 100, food: 0.001, drink: 0.001 };
    const next = updateNeeds(stats, 1000);
    expect(next.food).toBe(0);
    expect(next.drink).toBe(0);
  });

  it('drains armor at the starvation rate when food is 0', () => {
    const stats = { stamina: 100, armor: 100, food: 0, drink: 100 };
    const dt = 60; // a real minute
    const dh = TIME_GAME_HOURS_PER_REAL_SEC * dt;
    const expected = 100 - STATS.STARVE_ARMOR_DRAIN_PER_HR * dh;
    const next = updateNeeds(stats, dt);
    expect(next.armor).toBeCloseTo(expected, 4);
  });

  it('drains armor at the starvation rate when drink is 0', () => {
    const stats = { stamina: 100, armor: 100, food: 100, drink: 0 };
    const dt = 60;
    const dh = TIME_GAME_HOURS_PER_REAL_SEC * dt;
    const expected = 100 - STATS.STARVE_ARMOR_DRAIN_PER_HR * dh;
    const next = updateNeeds(stats, dt);
    expect(next.armor).toBeCloseTo(expected, 4);
  });

  it('does not touch armor while food and drink are above 0', () => {
    const stats = makeFreshStats();
    const next = updateNeeds(stats, 60);
    expect(next.armor).toBe(STATS.MAX);
  });
});

describe('isDead', () => {
  it('is dead when food and drink hit 0', () => {
    expect(isDead({ armor: 0, food: 0, drink: 100, stamina: 0 })).toBe(true);
  });

  it('is alive with armor=0 and stamina=0 if fed and watered', () => {
    expect(isDead({ armor: 0, food: 50, drink: 50, stamina: 0 })).toBe(false);
  });
});
