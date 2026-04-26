export class Crosshair {
  private readonly el: HTMLElement;

  constructor(parent: HTMLElement) {
    const el = parent.querySelector<HTMLElement>('#crosshair');
    if (!el) throw new Error('Crosshair: #crosshair not found');
    this.el = el;
  }

  setVisible(visible: boolean): void {
    this.el.style.display = visible ? '' : 'none';
  }
}
