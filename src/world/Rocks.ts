import * as THREE from 'three';
import { COLORS, WORLD } from '@/config/balance';
import { getHeight } from '@/world/heightmap';
import { makeRng } from '@/world/rng';

export class Rocks {
  readonly group: THREE.Group;
  private readonly mat: THREE.MeshLambertMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.mat = new THREE.MeshLambertMaterial({ color: COLORS.ROCK, flatShading: true });
    const rng = makeRng(31);
    for (let i = 0; i < WORLD.ROCK_COUNT; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = WORLD.ROCK_RING_INNER + rng() * (WORLD.ROCK_RING_OUTER - WORLD.ROCK_RING_INNER);
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const h = getHeight(x, z);
      const sz = 0.5 + rng() * 1.4;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(sz, 0), this.mat);
      rock.position.set(x, h + sz * 0.4, z);
      rock.rotation.set(rng() * 6, rng() * 6, rng() * 6);
      this.group.add(rock);
    }
  }

  dispose(): void {
    this.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) obj.geometry.dispose();
    });
    this.mat.dispose();
  }
}
