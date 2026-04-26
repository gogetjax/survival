import * as THREE from 'three';
import { COLORS, MUTANT } from '@/config/balance';
import { getHeight } from '@/world/heightmap';
import type { Mutant } from '@/entities/Mutant';
import type { MutantVariation } from '@/types';

export function rollVariation(rand: () => number = Math.random): MutantVariation {
  return {
    heads: rand() < MUTANT.HEAD_VAR_2_PROB ? 2 : 1,
    arms: rand() < MUTANT.ARM_VAR_3_PROB ? 3 : 2,
    legs: rand() < MUTANT.LEG_VAR_3_PROB ? 3 : 2,
  };
}

export function createMutant(id: number, rand: () => number = Math.random): Mutant {
  const group = new THREE.Group();
  const variation = rollVariation(rand);
  const skinHex = COLORS.MUTANT_SKIN_BASE + Math.floor(rand() * COLORS.MUTANT_SKIN_VAR_RANGE);
  const skinMat = new THREE.MeshLambertMaterial({ color: skinHex, flatShading: true });
  const pantsMat = new THREE.MeshLambertMaterial({ color: COLORS.MUTANT_PANTS });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.0, 0.45), skinMat);
  torso.position.y = -0.4;
  group.add(torso);

  for (let h = 0; h < variation.heads; h++) {
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.32), skinMat);
    head.position.set((h - (variation.heads - 1) / 2) * 0.34, 0.25, 0);
    group.add(head);
  }
  for (let a = 0; a < variation.arms; a++) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.8, 0.16), skinMat);
    const side = a === 0 ? -1 : a === 1 ? 1 : 0;
    arm.position.set(side * 0.42, -0.4, a >= 2 ? 0.25 : 0);
    group.add(arm);
  }
  for (let l = 0; l < variation.legs; l++) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.9, 0.2), pantsMat);
    const side = l === 0 ? -1 : l === 1 ? 1 : 0;
    leg.position.set(side * 0.18, -1.35, l >= 2 ? 0.22 : 0);
    group.add(leg);
  }

  const cx = (rand() - 0.5) * MUTANT.HOME_RANGE;
  const cz = (rand() - 0.5) * MUTANT.HOME_RANGE;
  const ch = getHeight(cx, cz);
  group.position.set(cx, ch + MUTANT.HOVER_HEIGHT, cz);

  return {
    id,
    group,
    home: new THREE.Vector2(cx, cz),
    target: new THREE.Vector2(cx, cz),
    repick: 0,
    aware: false,
    variation,
  };
}
