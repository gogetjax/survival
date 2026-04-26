import { STATS } from '@/config/balance';
import type { SurvivalStats } from '@/types';

interface BarRefs {
  fill: HTMLElement;
  value: HTMLElement;
}

export class EnergyBars {
  private readonly bars: Record<keyof SurvivalStats, BarRefs>;
  private cache: SurvivalStats = { stamina: -1, armor: -1, food: -1, drink: -1 };

  constructor(parent: HTMLElement) {
    const root = parent.querySelector('#energy-bars');
    if (!root) throw new Error('EnergyBars: #energy-bars not found in parent');
    this.bars = {
      stamina: this.queryBar(root, 'stamina'),
      armor: this.queryBar(root, 'armor'),
      food: this.queryBar(root, 'food'),
      drink: this.queryBar(root, 'drink'),
    };
  }

  private queryBar(root: Element, stat: string): BarRefs {
    const el = root.querySelector(`.bar[data-stat="${stat}"]`);
    if (!el) throw new Error(`EnergyBars: bar[${stat}] not found`);
    const fill = el.querySelector<HTMLElement>('.bar-fill');
    const value = el.querySelector<HTMLElement>('.bar-value');
    if (!fill || !value) throw new Error(`EnergyBars: missing children for ${stat}`);
    return { fill, value };
  }

  update(stats: SurvivalStats): void {
    (Object.keys(this.bars) as Array<keyof SurvivalStats>).forEach((key) => {
      const v = Math.round(stats[key]);
      if (v !== this.cache[key]) {
        this.cache[key] = v;
        const refs = this.bars[key];
        refs.fill.style.width = v + '%';
        refs.value.textContent = String(v);
        refs.fill.classList.toggle('low', v < STATS.LOW_THRESHOLD);
      }
    });
  }
}
