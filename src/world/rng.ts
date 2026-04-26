/**
 * Tiny seeded RNG used to keep tree/rock/star placement deterministic across reloads.
 */
export function makeRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
