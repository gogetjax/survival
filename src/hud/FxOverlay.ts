export class FxOverlay {
  private readonly el: HTMLElement;
  private flashTimer = 0;

  constructor(parent: HTMLElement) {
    const el = parent.querySelector<HTMLElement>('#fx-overlay');
    if (!el) throw new Error('FxOverlay: #fx-overlay not found');
    this.el = el;
  }

  flashDamage(durationMs = 240): void {
    this.el.classList.add('damage');
    if (this.flashTimer) clearTimeout(this.flashTimer);
    this.flashTimer = window.setTimeout(() => this.el.classList.remove('damage'), durationMs);
  }
}
