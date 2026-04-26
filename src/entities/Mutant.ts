import * as THREE from 'three';

export interface Mutant {
  id: number;
  sprite: THREE.Sprite;
  home: THREE.Vector2;
  target: THREE.Vector2;
  repick: number;
  aware: boolean;
  variantUrl: string;
}
