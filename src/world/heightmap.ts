import type { BiomeKind } from '@/types';
import { WORLD } from '@/config/balance';

/**
 * SINGLE SOURCE OF TRUTH for terrain elevation.
 * Imported by Terrain, Minimap, Trees, Rocks, MutantManager, PlayerController.
 * Never duplicate this formula elsewhere.
 */
export function getHeight(x: number, z: number): number {
  const dist = Math.sqrt(x * x + z * z);
  if (dist > WORLD.ISLAND_RADIUS) return -3;
  const baseHeight = Math.max(0, 26 - dist * 0.3);
  const ridge = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 1.4;
  const detail = Math.sin(x * 0.22 + 1.3) * Math.cos(z * 0.19 - 0.7) * 0.6;
  return baseHeight + ridge + detail;
}

export function classifyBiome(height: number): BiomeKind {
  if (height < 0) return 'ocean';
  if (height < 1) return 'sand';
  if (height < 7) return 'grass';
  return 'rock';
}
