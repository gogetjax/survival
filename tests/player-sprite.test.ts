import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { PlayerSprite } from '@/player/PlayerSprite';

/**
 * Engine coordinate convention (verified against PlayerCamera.ts):
 *   - yaw=0 → player forward = (0, 0, -1).
 *   - Positive yaw rotates CCW around +Y; at yaw=π/2 forward becomes (-1, 0, 0).
 *   - In third-person view at yaw=0, the camera sits at +Z relative to the player
 *     (i.e. directly behind the player → "S" cell, back view).
 *
 * Sector convention (matches CELL_MAP in PlayerSprite.ts):
 *   sector 0 = camera directly behind player → S cell (back view)
 *   sector 2 = camera on player's right       → E cell
 *   sector 4 = camera directly in front       → N cell (face view)
 *   sector 6 = camera on player's left        → W cell
 */
function makeAtlas(width = 768, height = 1376): THREE.Texture {
  const tex = new THREE.Texture();
  (tex as unknown as { image: { width: number; height: number } }).image = { width, height };
  return tex;
}

const ORIGIN = new THREE.Vector3(0, 0, 0);

describe('PlayerSprite sector mapping', () => {
  it('camera directly behind a yaw=0 player → sector 0 (S, back view)', () => {
    const ps = new PlayerSprite(makeAtlas());
    ps.update(0, ORIGIN, new THREE.Vector3(0, 0, 5));
    expect(ps.sector).toBe(0);
  });

  it('camera directly in front of a yaw=0 player → sector 4 (N, face view)', () => {
    const ps = new PlayerSprite(makeAtlas());
    ps.update(0, ORIGIN, new THREE.Vector3(0, 0, -5));
    expect(ps.sector).toBe(4);
  });

  it("camera on the player's right (+X) → sector 2 (E)", () => {
    const ps = new PlayerSprite(makeAtlas());
    ps.update(0, ORIGIN, new THREE.Vector3(5, 0, 0));
    expect(ps.sector).toBe(2);
  });

  it("camera on the player's left (-X) → sector 6 (W)", () => {
    const ps = new PlayerSprite(makeAtlas());
    ps.update(0, ORIGIN, new THREE.Vector3(-5, 0, 0));
    expect(ps.sector).toBe(6);
  });

  it('rotating the player by π/2 with the camera fixed at +Z swaps to sector 6 (W, player-left)', () => {
    // Camera fixed at +Z (was "behind" a yaw=0 player). After yaw=π/2 the player's
    // local left direction is +Z, so the camera is now to the player's left.
    const ps = new PlayerSprite(makeAtlas());
    ps.update(Math.PI / 2, ORIGIN, new THREE.Vector3(0, 0, 5));
    expect(ps.sector).toBe(6);
  });
});

describe('PlayerSprite construction', () => {
  it('produces a Sprite with a non-null map and correct UV repeat', () => {
    const ps = new PlayerSprite(makeAtlas());
    const mat = ps.sprite.material as THREE.SpriteMaterial;
    expect(ps.sprite).toBeInstanceOf(THREE.Sprite);
    expect(mat.transparent).toBe(true);
    expect(mat.map).not.toBeNull();
    expect(mat.map!.repeat.x).toBeCloseTo(1 / 3);
    expect(mat.map!.repeat.y).toBeCloseTo(1 / 3);
  });
});
