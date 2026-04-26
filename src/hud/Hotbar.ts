export class Hotbar {
  constructor(parent: HTMLElement) {
    const el = parent.querySelector('#hotbar');
    if (!el) throw new Error('Hotbar: #hotbar not found');
  }
  // Build 001: static markup. Selection logic lands when items exist (Build 002+).
  update(): void {
    /* no-op until inventory exists */
  }
}
