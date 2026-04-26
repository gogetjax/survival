export const ASSET_PATHS = {
  creatures: {
    mutant1: '/assets/creatures/mutant1.png',
    mutant2: '/assets/creatures/mutant2.png',
    mutant3: '/assets/creatures/mutant3.png',
    mutant4: '/assets/creatures/mutant4.png',
  },
  players: {
    player1: '/assets/players/player1.png',
  },
} as const;

export const MUTANT_VARIANT_URLS = [
  ASSET_PATHS.creatures.mutant1,
  ASSET_PATHS.creatures.mutant2,
  ASSET_PATHS.creatures.mutant3,
  ASSET_PATHS.creatures.mutant4,
] as const;

export const ALL_ASSET_URLS = [
  ...MUTANT_VARIANT_URLS,
  ASSET_PATHS.players.player1,
] as const;
