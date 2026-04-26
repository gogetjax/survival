export type BiomeKind = 'sand' | 'grass' | 'rock' | 'ocean';

export type ViewMode = 'first' | 'third';

export interface SurvivalStats {
  stamina: number;
  armor: number;
  food: number;
  drink: number;
}

export interface MutantVariation {
  heads: number;
  arms: number;
  legs: number;
}

export interface ThreatInfo {
  nearestMutantDist: number;
}

export type ThreatLevel = 'calm' | 'wary' | 'danger';

export type TimePhase = 'dawn' | 'day' | 'dusk' | 'night';

export interface GameSnapshot {
  day: number;
  hour: number;
  realElapsedSec: number;
  player: {
    x: number;
    y: number;
    z: number;
    yaw: number;
    pitch: number;
    view: ViewMode;
    stats: SurvivalStats;
  };
}
