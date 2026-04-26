import * as THREE from 'three';
import { COLORS, WORLD } from '@/config/balance';
import { classifyBiome, getHeight } from '@/world/heightmap';

export class Terrain {
  readonly mesh: THREE.Mesh;

  constructor() {
    const geom = new THREE.PlaneGeometry(
      WORLD.TERRAIN_SIZE,
      WORLD.TERRAIN_SIZE,
      WORLD.TERRAIN_SEGMENTS,
      WORLD.TERRAIN_SEGMENTS,
    );
    geom.rotateX(-Math.PI / 2);
    const colors: number[] = [];
    const pos = geom.attributes.position;
    const sand = new THREE.Color(COLORS.TERRAIN_SAND);
    const grass = new THREE.Color(COLORS.TERRAIN_GRASS);
    const rock = new THREE.Color(COLORS.TERRAIN_ROCK);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = getHeight(x, z);
      pos.setY(i, h);
      const biome = classifyBiome(h);
      const c = biome === 'grass' ? grass : biome === 'rock' ? rock : sand;
      colors.push(c.r, c.g, c.b);
    }
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.computeVertexNormals();
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
    this.mesh = new THREE.Mesh(geom, mat);
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}
