import * as THREE from 'three';
import { MUTANT, SPRITE } from '@/config/balance';
import { MUTANT_VARIANT_URLS } from '@/config/assets';
import { createMutantSprite } from '@/entities/MutantSpriteFactory';
import { getHeight } from '@/world/heightmap';
import { isNight, type TimeState } from '@/time/DayNightCycle';
import type { Mutant } from '@/entities/Mutant';
import type { Player } from '@/player/Player';
import type { ThreatInfo } from '@/types';

export class MutantManager {
  readonly mutants: Mutant[] = [];

  constructor(scene: THREE.Scene, textures: Map<string, THREE.Texture>) {
    for (let i = 0; i < MUTANT.COUNT; i++) {
      const variantUrl = MUTANT_VARIANT_URLS[Math.floor(Math.random() * MUTANT_VARIANT_URLS.length)];
      const tex = textures.get(variantUrl);
      if (!tex) throw new Error(`MutantManager: missing texture for ${variantUrl}`);
      const sprite = createMutantSprite(tex);

      const cx = (Math.random() - 0.5) * MUTANT.HOME_RANGE;
      const cz = (Math.random() - 0.5) * MUTANT.HOME_RANGE;
      const cy = getHeight(cx, cz) + SPRITE.mutantHeight / 2;
      sprite.position.set(cx, cy, cz);
      scene.add(sprite);

      this.mutants.push({
        id: i,
        sprite,
        home: new THREE.Vector2(cx, cz),
        target: new THREE.Vector2(cx, cz),
        repick: 0,
        aware: false,
        variantUrl,
      });
    }
  }

  update(dt: number, player: Player, time: TimeState): ThreatInfo {
    let nearest = Infinity;
    const detectRadius =
      MUTANT.DETECTION_RADIUS * (isNight(time.hour) ? MUTANT.NIGHT_DETECTION_BONUS : 1);
    for (const m of this.mutants) {
      m.repick -= dt;
      if (m.repick <= 0) {
        const span = MUTANT.REPICK_MAX_SEC - MUTANT.REPICK_MIN_SEC;
        m.repick = MUTANT.REPICK_MIN_SEC + Math.random() * span;
        m.target.set(
          m.home.x + (Math.random() - 0.5) * MUTANT.PATROL_RADIUS * 2,
          m.home.y + (Math.random() - 0.5) * MUTANT.PATROL_RADIUS * 2,
        );
      }
      const pdx = player.pos.x - m.sprite.position.x;
      const pdz = player.pos.z - m.sprite.position.z;
      const pd = Math.hypot(pdx, pdz);
      m.aware = pd < detectRadius;

      if (m.aware && pd > 0) {
        const v = MUTANT.PATROL_SPEED * MUTANT.CHASE_SPEED_MULT * dt;
        m.sprite.position.x += (pdx / pd) * v;
        m.sprite.position.z += (pdz / pd) * v;
      } else {
        const dx = m.target.x - m.sprite.position.x;
        const dz = m.target.y - m.sprite.position.z;
        const dl = Math.hypot(dx, dz);
        if (dl > 0.1) {
          m.sprite.position.x += (dx / dl) * MUTANT.PATROL_SPEED * dt;
          m.sprite.position.z += (dz / dl) * MUTANT.PATROL_SPEED * dt;
        }
      }
      m.sprite.position.y =
        getHeight(m.sprite.position.x, m.sprite.position.z) + SPRITE.mutantHeight / 2;
      if (pd < nearest) nearest = pd;
    }
    return { nearestMutantDist: nearest };
  }
}
