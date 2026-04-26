import * as THREE from 'three';
import { MUTANT } from '@/config/balance';

export interface Mutant {
  id: number;
  sprite: THREE.Sprite;
  home: THREE.Vector2;
  target: THREE.Vector2;
  repick: number;
  aware: boolean;
  attackCooldown: number;
  variantUrl: string;
}

export interface CombatTickResult {
  attackCooldown: number;
  attacked: boolean;
  shouldChase: boolean;
}

/**
 * Pure per-frame combat decision for a single mutant.
 *
 * `dt` is real seconds. The daytime aggro check is `random() < CHANCE * dt`
 * — a true per-second probability. The previous prototype used a bare
 * `random() < 0.3` per frame, which fired ~18 times per second at 60 FPS.
 */
export function tickCombat(
  attackCooldown: number,
  distXZ: number,
  isNight: boolean,
  dt: number,
  random: () => number = Math.random,
): CombatTickResult {
  const cooldown = Math.max(0, attackCooldown - dt);
  if (distXZ < MUTANT.ATTACK_RADIUS) {
    if (cooldown <= 0) {
      const commits =
        (isNight && MUTANT.AGGRO_AT_NIGHT) ||
        random() < MUTANT.DAYTIME_AGGRO_CHANCE * dt;
      if (commits) {
        return {
          attackCooldown: MUTANT.ATTACK_COOLDOWN_SEC,
          attacked: true,
          shouldChase: false,
        };
      }
    }
    return { attackCooldown: cooldown, attacked: false, shouldChase: false };
  }
  return {
    attackCooldown: cooldown,
    attacked: false,
    shouldChase: distXZ < MUTANT.DETECTION_RADIUS && isNight,
  };
}
