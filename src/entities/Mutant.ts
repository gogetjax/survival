import * as THREE from 'three';
import type { MutantVariation } from '@/types';

export interface Mutant {
  id: number;
  group: THREE.Group;
  home: THREE.Vector2;
  target: THREE.Vector2;
  repick: number;
  aware: boolean;
  variation: MutantVariation;
}
