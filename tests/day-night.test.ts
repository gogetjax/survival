import { describe, expect, it, vi } from 'vitest';
import { TIME, TIME_GAME_HOURS_PER_REAL_SEC } from '@/config/balance';
import { DayNightCycle, advanceTime, type TimeState } from '@/time/DayNightCycle';

function dtForGameHours(gh: number): number {
  return gh / TIME_GAME_HOURS_PER_REAL_SEC;
}

describe('advanceTime', () => {
  it('rolls over from hour 14.99 to hour 0.01 and increments day', () => {
    const state: TimeState = {
      day: 1,
      hour: TIME.GAME_HOURS_PER_DAY - 0.01,
      realElapsedSec: 0,
      newDayThisFrame: false,
    };
    const rolled = advanceTime(state, dtForGameHours(0.02));
    expect(rolled).toBe(true);
    expect(state.day).toBe(2);
    expect(state.hour).toBeCloseTo(0.01, 6);
  });

  it('does not roll over within a single day', () => {
    const state: TimeState = {
      day: 1,
      hour: 5,
      realElapsedSec: 0,
      newDayThisFrame: false,
    };
    expect(advanceTime(state, dtForGameHours(1))).toBe(false);
    expect(state.day).toBe(1);
  });
});

describe('DayNightCycle', () => {
  it('emits "newDay" exactly once per rollover', () => {
    const cycle = new DayNightCycle();
    cycle.state.hour = TIME.GAME_HOURS_PER_DAY - 0.01;
    const handler = vi.fn();
    cycle.addEventListener('newDay', handler);
    cycle.update(dtForGameHours(0.02));
    expect(handler).toHaveBeenCalledTimes(1);
    cycle.update(dtForGameHours(1));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
