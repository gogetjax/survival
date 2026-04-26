import { getPhase, type TimeState } from '@/time/DayNightCycle';

function fmtGameTime(h: number): string {
  const hours = Math.floor((h + 6) % 24);
  const mins = Math.floor((h % 1) * 60);
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function fmtRealTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function phaseLabel(phase: ReturnType<typeof getPhase>): string {
  return phase[0].toUpperCase() + phase.slice(1);
}

export class TimePanel {
  private dayEl: HTMLElement;
  private timeEl: HTMLElement;
  private phaseEl: HTMLElement;
  private realEl: HTMLElement;
  private cache = { day: -1, time: '', phase: '', real: '' };

  constructor(parent: HTMLElement) {
    const find = (id: string): HTMLElement => {
      const el = parent.querySelector<HTMLElement>(`#${id}`);
      if (!el) throw new Error(`TimePanel: #${id} not found`);
      return el;
    };
    this.dayEl = find('day-num');
    this.timeEl = find('game-time');
    this.phaseEl = find('phase');
    this.realEl = find('real-time');
  }

  update(time: TimeState): void {
    if (time.day !== this.cache.day) {
      this.cache.day = time.day;
      this.dayEl.textContent = String(time.day);
    }
    const t = fmtGameTime(time.hour);
    if (t !== this.cache.time) {
      this.cache.time = t;
      this.timeEl.textContent = t;
    }
    const p = phaseLabel(getPhase(time.hour));
    if (p !== this.cache.phase) {
      this.cache.phase = p;
      this.phaseEl.textContent = p;
    }
    const r = fmtRealTime(time.realElapsedSec);
    if (r !== this.cache.real) {
      this.cache.real = r;
      this.realEl.textContent = r;
    }
  }
}
