import * as THREE from 'three';
import { WORLD } from '@/config/balance';
import { makeRng } from '@/world/rng';

export class Stars {
  readonly points: THREE.Points;
  readonly material: THREE.PointsMaterial;

  constructor() {
    const geom = new THREE.BufferGeometry();
    const positions: number[] = [];
    const rng = makeRng(101);
    for (let i = 0; i < WORLD.STAR_COUNT; i++) {
      const r = 280;
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1) * 0.5;
      positions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi) + 60,
        r * Math.sin(phi) * Math.sin(theta),
      );
    }
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this.material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.4,
      transparent: true,
      opacity: 0,
    });
    this.points = new THREE.Points(geom, this.material);
  }

  setOpacity(o: number): void {
    this.material.opacity = o;
  }

  dispose(): void {
    this.points.geometry.dispose();
    this.material.dispose();
  }
}
