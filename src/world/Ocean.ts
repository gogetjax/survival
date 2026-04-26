import * as THREE from 'three';
import { COLORS, WORLD } from '@/config/balance';

export class Ocean {
  readonly mesh: THREE.Mesh;

  constructor() {
    const geom = new THREE.CircleGeometry(WORLD.OCEAN_RADIUS, 64);
    geom.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshLambertMaterial({
      color: COLORS.OCEAN,
      transparent: true,
      opacity: 0.85,
    });
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.position.y = 0.2;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}
