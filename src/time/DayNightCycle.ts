import { TIME, TIME_GAME_HOURS_PER_REAL_SEC } from '@/config/balance';

export interface TimeState {
  day: number;
  hour: number;
  realElapsedSec: number;
  newDayThisFrame: boolean;
}

export function isNight(hour: number): boolean {
  return hour < TIME.DAY_START_HOUR || hour >= TIME.DAY_START_HOUR + TIME.DAYLIGHT_HOURS;
}

export function getPhase(hour: number): 'dawn' | 'day' | 'dusk' | 'night' {
  if (isNight(hour)) return 'night';
  if (hour < TIME.DAY_START_HOUR + 1) return 'dawn';
  if (hour > TIME.DAY_START_HOUR + TIME.DAYLIGHT_HOURS - 1) return 'dusk';
  return 'day';
}

/**
 * Advances `time` in place by `dt` real seconds. Returns whether a day rollover occurred.
 * Pure on inputs except the mutation of the passed state object.
 */
export function advanceTime(time: TimeState, dt: number): boolean {
  time.realElapsedSec += dt;
  time.hour += TIME_GAME_HOURS_PER_REAL_SEC * dt;
  let newDay = false;
  if (time.hour >= TIME.GAME_HOURS_PER_DAY) {
    time.hour -= TIME.GAME_HOURS_PER_DAY;
    time.day += 1;
    newDay = true;
  }
  time.newDayThisFrame = newDay;
  return newDay;
}

export class DayNightCycle extends EventTarget {
  readonly state: TimeState = {
    day: 1,
    hour: TIME.DAY_START_HOUR,
    realElapsedSec: 0,
    newDayThisFrame: false,
  };

  update(dt: number): void {
    if (advanceTime(this.state, dt)) {
      this.dispatchEvent(new CustomEvent('newDay', { detail: { day: this.state.day } }));
    }
  }
}
