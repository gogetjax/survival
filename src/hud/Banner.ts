import { HUD } from '@/config/balance';

export class Banner {
  private readonly root: HTMLElement;
  private readonly titleEl: HTMLElement;
  private readonly subEl: HTMLElement;
  private timer = 0;

  constructor(parent: HTMLElement) {
    const root = parent.querySelector<HTMLElement>('#banner');
    if (!root) throw new Error('Banner: #banner not found');
    const titleEl = root.querySelector<HTMLElement>('.title');
    const subEl = root.querySelector<HTMLElement>('.sub');
    if (!titleEl || !subEl) throw new Error('Banner: missing children');
    this.root = root;
    this.titleEl = titleEl;
    this.subEl = subEl;
  }

  show(text: string, sub = '', durationMs: number = HUD.BANNER_DEFAULT_MS): void {
    this.titleEl.textContent = text;
    this.subEl.textContent = sub;
    this.root.classList.add('visible');
    if (this.timer) clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.root.classList.remove('visible'), durationMs);
  }

  dispose(): void {
    if (this.timer) clearTimeout(this.timer);
  }
}
