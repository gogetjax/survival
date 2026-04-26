import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createMutantSprite } from '@/entities/MutantSpriteFactory';
import { SPRITE } from '@/config/balance';

function makeFakeAtlasTexture(width = 768, height = 1376): THREE.Texture {
  const tex = new THREE.Texture();
  // Tests don't render, so a plain image-shaped object satisfies the aspect calc.
  (tex as unknown as { image: { width: number; height: number } }).image = { width, height };
  return tex;
}

describe('createMutantSprite', () => {
  it('returns a THREE.Sprite', () => {
    const sprite = createMutantSprite(makeFakeAtlasTexture());
    expect(sprite).toBeInstanceOf(THREE.Sprite);
  });

  it('scale.y matches SPRITE.mutantHeight', () => {
    const sprite = createMutantSprite(makeFakeAtlasTexture());
    expect(sprite.scale.y).toBe(SPRITE.mutantHeight);
  });

  it('material is transparent and has a non-null map', () => {
    const sprite = createMutantSprite(makeFakeAtlasTexture());
    const mat = sprite.material as THREE.SpriteMaterial;
    expect(mat.transparent).toBe(true);
    expect(mat.map).not.toBeNull();
  });

  it('crops to a single atlas cell via UV repeat (1/cols, 1/rows)', () => {
    const sprite = createMutantSprite(makeFakeAtlasTexture());
    const tex = (sprite.material as THREE.SpriteMaterial).map!;
    expect(tex.repeat.x).toBeCloseTo(1 / SPRITE.mutantAtlasCols);
    expect(tex.repeat.y).toBeCloseTo(1 / SPRITE.mutantAtlasRows);
  });
});
