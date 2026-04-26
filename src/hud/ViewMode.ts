import type { ViewMode as ViewModeT } from '@/types';

export class ViewMode {
  private readonly el: HTMLElement;
  private last: ViewModeT | null = null;

  constructor(parent: HTMLElement) {
    const el = parent.querySelector<HTMLElement>('#view-mode');
    if (!el) throw new Error('ViewMode: #view-mode not found');
    this.el = el;
  }

  set(view: ViewModeT): void {
    if (view === this.last) return;
    this.last = view;
    this.el.textContent = view === 'first' ? 'First Person' : 'Third Person';
  }
}
