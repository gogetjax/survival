/**
 * Re-exports the biome classifier so call sites can import from `@/world/Biomes`
 * when the intent is biome lookup, vs `@/world/heightmap` for the elevation function.
 */
export { classifyBiome } from '@/world/heightmap';
export type { BiomeKind } from '@/types';
