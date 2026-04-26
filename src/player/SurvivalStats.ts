import { STATS, TIME_GAME_HOURS_PER_REAL_SEC } from '@/config/balance';
import type { SurvivalStats } from '@/types';

export function makeFreshStats(): SurvivalStats {
  return { stamina: STATS.MAX, armor: STATS.MAX, food: STATS.MAX, drink: STATS.MAX };
}

/**
 * Pure stamina update. `dt` in real seconds.
 */
export function updateStamina(stamina: number, sprinting: boolean, dt: number): number {
  if (sprinting) {
    return Math.max(0, stamina - STATS.STAMINA_SPRINT_DRAIN_PER_SEC * dt);
  }
  return Math.min(STATS.MAX, stamina + STATS.STAMINA_REGEN_PER_SEC * dt);
}

/**
 * Pure update of food/drink/armor over `dt` real seconds.
 * Food and drink decay over time (per game-hour), bounded at 0.
 * If either is 0, armor decays at the starvation rate.
 */
export function updateNeeds(stats: SurvivalStats, dt: number): SurvivalStats {
  const dh = TIME_GAME_HOURS_PER_REAL_SEC * dt;
  const food = Math.max(0, stats.food - STATS.FOOD_DECAY_PER_HR * dh);
  const drink = Math.max(0, stats.drink - STATS.DRINK_DECAY_PER_HR * dh);
  let armor = stats.armor;
  if (food <= 0 || drink <= 0) {
    armor = Math.max(0, armor - STATS.STARVE_ARMOR_DRAIN_PER_HR * dh);
  }
  return { stamina: stats.stamina, armor, food, drink };
}

/**
 * Death triggers: starvation (food=0) or dehydration (drink=0).
 * Armor at 0 means unprotected; stamina at 0 means exhausted; neither alone kills.
 */
export function isDead(stats: SurvivalStats): boolean {
  return stats.food <= 0 || stats.drink <= 0;
}

export function canSprint(stamina: number): boolean {
  return stamina > 1;
}
