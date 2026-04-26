import * as THREE from 'three';
import { SPRITE } from '@/config/balance';

/**
 * Each mutant PNG is a 3-col x 4-row contact sheet (12 poses of one creature).
 * We crop to a single cell (configured in SPRITE.mutantAtlasCellCol/Row) so the
 * billboard shows one creature, not a tiled grid. Cloning the texture gives this
 * sprite its own offset/repeat so other consumers of the same source aren't disturbed.
 */
export function createMutantSprite(source: THREE.Texture): THREE.Sprite {
  const cols = SPRITE.mutantAtlasCols;
  const rows = SPRITE.mutantAtlasRows;
  const cellCol = SPRITE.mutantAtlasCellCol;
  const cellRow = SPRITE.mutantAtlasCellRow;

  const texture = source.clone();
  texture.needsUpdate = true;
  texture.repeat.set(1 / cols, 1 / rows);
  // UV origin is bottom-left in three.js; flip row index so row 0 is visually top.
  texture.offset.set(cellCol / cols, (rows - 1 - cellRow) / rows);

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.1,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);

  const img = source.image as { width?: number; height?: number } | undefined;
  const cellAspect =
    img && img.width && img.height
      ? img.width / cols / (img.height / rows)
      : SPRITE.mutantAspectFallback;
  sprite.scale.set(SPRITE.mutantHeight * cellAspect, SPRITE.mutantHeight, 1);

  return sprite;
}
