import type { ThreatInfo } from '@/types';

export interface GameTickContext {
  threat: ThreatInfo;
  sprinting: boolean;
}

export const INITIAL_THREAT: ThreatInfo = { nearestMutantDist: Infinity };
