export class ControlsHelp {
  private readonly el: HTMLElement;

  constructor(parent: HTMLElement) {
    const el = parent.querySelector<HTMLElement>('#controls-help');
    if (!el) throw new Error('ControlsHelp: #controls-help not found');
    this.el = el;
  }

  setVisible(visible: boolean): void {
    this.el.style.display = visible ? '' : 'none';
  }
}
