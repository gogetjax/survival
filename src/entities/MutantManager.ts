import * as THREE from 'three';
import { MUTANT } from '@/config/balance';
import { getHeight } from '@/world/heightmap';
import { isNight, type TimeState } from '@/time/DayNightCycle';
import type { Mutant } from '@/entities/Mutant';
import { createMutant } from '@/entities/MutantFactory';
import type { Player } from '@/player/Player';
import type { ThreatInfo } from '@/types';

export class MutantManager {
  readonly mutants: Mutant[] = [];

  constructor(scene: THREE.Scene) {
    for (let i = 0; i < MUTANT.COUNT; i++) {
      const m = createMutant(i);
      scene.add(m.group);
      this.mutants.push(m);
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
      const pdx = player.pos.x - m.group.position.x;
      const pdz = player.pos.z - m.group.position.z;
      const pd = Math.hypot(pdx, pdz);
      m.aware = pd < detectRadius;

      if (m.aware && pd > 0) {
        const v = MUTANT.PATROL_SPEED * MUTANT.CHASE_SPEED_MULT * dt;
        m.group.position.x += (pdx / pd) * v;
        m.group.position.z += (pdz / pd) * v;
        m.group.rotation.y = Math.atan2(pdx, pdz);
      } else {
        const dx = m.target.x - m.group.position.x;
        const dz = m.target.y - m.group.position.z;
        const dl = Math.hypot(dx, dz);
        if (dl > 0.1) {
          m.group.position.x += (dx / dl) * MUTANT.PATROL_SPEED * dt;
          m.group.position.z += (dz / dl) * MUTANT.PATROL_SPEED * dt;
          m.group.rotation.y = Math.atan2(dx, dz);
        }
      }
      m.group.position.y =
        getHeight(m.group.position.x, m.group.position.z) + MUTANT.HOVER_HEIGHT;
      if (pd < nearest) nearest = pd;
    }
    return { nearestMutantDist: nearest };
  }
}
