import * as THREE from 'three';
import { COLORS, WORLD } from '@/config/balance';
import { classifyBiome, getHeight } from '@/world/heightmap';
import { makeRng } from '@/world/rng';

export interface TreePosition {
  x: number;
  z: number;
  y: number;
}

export class Trees {
  readonly group: THREE.Group;
  readonly positions: ReadonlyArray<TreePosition>;
  private readonly trunkMat: THREE.MeshLambertMaterial;
  private readonly leavesMat: THREE.MeshLambertMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.trunkMat = new THREE.MeshLambertMaterial({ color: COLORS.TREE_TRUNK });
    this.leavesMat = new THREE.MeshLambertMaterial({
      color: COLORS.TREE_LEAVES,
      flatShading: true,
    });
    const positions: TreePosition[] = [];
    const rng = makeRng(7);
    let tries = 0;
    while (positions.length < WORLD.TREE_COUNT && tries < WORLD.TREE_COUNT * 10) {
      tries++;
      const angle = rng() * Math.PI * 2;
      const dist = WORLD.TREE_RING_INNER + rng() * (WORLD.TREE_RING_OUTER - WORLD.TREE_RING_INNER);
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const y = getHeight(x, z);
      if (classifyBiome(y) !== 'grass') continue;
      positions.push({ x, z, y });
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.35, 2.6, 6),
        this.trunkMat,
      );
      trunk.position.set(x, y + 1.3, z);
      const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.4, 3.2, 7), this.leavesMat);
      leaves.position.set(x, y + 4, z);
      this.group.add(trunk);
      this.group.add(leaves);
    }
    this.positions = positions;
  }

  dispose(): void {
    this.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
      }
    });
    this.trunkMat.dispose();
    this.leavesMat.dispose();
  }
}
