export class GameLoop {
  private last = 0;
  private rafHandle = 0;
  private running = false;
  private readonly tick: (dt: number) => void;

  constructor(tick: (dt: number) => void) {
    this.tick = tick;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now() / 1000;
    const frame = () => {
      if (!this.running) return;
      const now = performance.now() / 1000;
      let dt = now - this.last;
      this.last = now;
      if (dt > 0.05) dt = 0.05;
      this.tick(dt);
      this.rafHandle = requestAnimationFrame(frame);
    };
    this.rafHandle = requestAnimationFrame(frame);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafHandle);
  }
}
