import { HUD } from '@/config/balance';
import type { ThreatInfo, ThreatLevel } from '@/types';

function classify(dist: number): ThreatLevel {
  if (dist < HUD.THREAT_DANGER_DIST) return 'danger';
  if (dist < HUD.THREAT_WARY_DIST) return 'wary';
  return 'calm';
}

const LABELS: Record<ThreatLevel, string> = {
  calm: 'Calm',
  wary: 'Wary',
  danger: 'Danger',
};

export class ThreatIndicator {
  private readonly el: HTMLElement;
  private last: ThreatLevel | null = null;

  constructor(parent: HTMLElement) {
    const el = parent.querySelector<HTMLElement>('#threat');
    if (!el) throw new Error('ThreatIndicator: #threat not found');
    this.el = el;
  }

  update(threat: ThreatInfo): void {
    const level = classify(threat.nearestMutantDist);
    if (level === this.last) return;
    this.last = level;
    this.el.textContent = LABELS[level];
    this.el.className = '';
    if (level === 'wary') this.el.classList.add('alert');
    else if (level === 'danger') this.el.classList.add('danger');
  }
}
