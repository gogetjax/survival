/**
 * Player sprite atlas (player1.png) layout — assumed:
 *
 *   (0,0) NW   (0,1) N    (0,2) NE
 *   (1,0)  W   (1,1) ?    (1,2)  E
 *   (2,0) SW   (2,1) S    (2,2) SE
 *
 * Convention: the cell label = direction of the camera relative to the player.
 *   - "S" cell = camera is south of player → we see the player's back if they face north.
 *   - "N" cell = camera is north of player → we see the player's face if they face north.
 * Center cell (1,1) treated as fallback to closest 8-direction until clarified.
 *
 * If actual layout differs (e.g., 9 evenly-spaced 40° rotations row-by-row),
 * update CELL_MAP below and revise this comment.
 */
import * as THREE from 'three';
import { SPRITE } from '@/config/balance';

// 8 sectors mapped to (row, col) cells. Sector 0 = camera due south of player.
// Sectors increase clockwise as the camera rotates around the player.
const CELL_MAP: ReadonlyArray<{ row: number; col: number }> = [
  { row: 2, col: 1 }, // S
  { row: 2, col: 2 }, // SE
  { row: 1, col: 2 }, // E
  { row: 0, col: 2 }, // NE
  { row: 0, col: 1 }, // N
  { row: 0, col: 0 }, // NW
  { row: 1, col: 0 }, // W
  { row: 2, col: 0 }, // SW
];

export class PlayerSprite {
  readonly sprite: THREE.Sprite;
  private texture: THREE.Texture;
  private currentSector = -1;

  constructor(atlas: THREE.Texture) {
    // Clone so this player's UV transform doesn't bleed into other users of the texture
    this.texture = atlas.clone();
    this.texture.needsUpdate = true;
    this.texture.repeat.set(1 / SPRITE.playerAtlasCols, 1 / SPRITE.playerAtlasRows);

    const material = new THREE.SpriteMaterial({
      map: this.texture,
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false,
    });
    this.sprite = new THREE.Sprite(material);

    const img = atlas.image as { width?: number; height?: number } | undefined;
    const cellAspect =
      img && img.width && img.height
        ? img.width / SPRITE.playerAtlasCols / (img.height / SPRITE.playerAtlasRows)
        : SPRITE.playerAspectFallback;
    this.sprite.scale.set(SPRITE.playerHeight * cellAspect, SPRITE.playerHeight, 1);

    this.setSector(0);
  }

  /** Call each frame in third-person view. */
  update(playerYaw: number, playerPos: THREE.Vector3, cameraPos: THREE.Vector3): void {
    const dx = cameraPos.x - playerPos.x;
    const dz = cameraPos.z - playerPos.z;
    const cameraDir = Math.atan2(dx, dz);

    let relative = cameraDir - playerYaw;
    relative = ((relative % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    const sector = Math.floor(((relative + Math.PI / 8) % (Math.PI * 2)) / (Math.PI / 4)) % 8;

    if (sector !== this.currentSector) {
      this.setSector(sector);
    }
  }

  /** Test/inspection helper — current selected sector in [0, 8). */
  get sector(): number {
    return this.currentSector;
  }

  private setSector(sector: number): void {
    const cell = CELL_MAP[sector];
    this.texture.offset.set(
      cell.col / SPRITE.playerAtlasCols,
      (SPRITE.playerAtlasRows - 1 - cell.row) / SPRITE.playerAtlasRows,
    );
    this.currentSector = sector;
  }

  dispose(): void {
    this.texture.dispose();
    (this.sprite.material as THREE.SpriteMaterial).dispose();
  }
}
