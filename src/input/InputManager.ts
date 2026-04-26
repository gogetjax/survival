export class InputManager {
  private keys = new Set<string>();
  private mouseDX = 0;
  private mouseDY = 0;
  private pointerLocked = false;
  private readonly canvas: HTMLCanvasElement;
  private readonly onKeyDown: (e: KeyboardEvent) => void;
  private readonly onKeyUp: (e: KeyboardEvent) => void;
  private readonly onClick: () => void;
  private readonly onPointerLockChange: () => void;
  private readonly onMouseMove: (e: MouseEvent) => void;

  constructor(canvas: HTMLCanvasElement, onKeyDownExtra?: (code: string) => void) {
    this.canvas = canvas;
    this.onKeyDown = (e) => {
      this.keys.add(e.code);
      onKeyDownExtra?.(e.code);
    };
    this.onKeyUp = (e) => {
      this.keys.delete(e.code);
    };
    this.onClick = () => {
      if (!this.pointerLocked) canvas.requestPointerLock();
    };
    this.onPointerLockChange = () => {
      this.pointerLocked = document.pointerLockElement === canvas;
    };
    this.onMouseMove = (e) => {
      if (this.pointerLocked) {
        this.mouseDX += e.movementX;
        this.mouseDY += e.movementY;
      }
    };
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    canvas.addEventListener('click', this.onClick);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    document.addEventListener('mousemove', this.onMouseMove);
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  consumeMouseDelta(): { dx: number; dy: number } {
    const out = { dx: this.mouseDX, dy: this.mouseDY };
    this.mouseDX = 0;
    this.mouseDY = 0;
    return out;
  }

  requestPointerLock(): void {
    this.canvas.requestPointerLock();
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('click', this.onClick);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    document.removeEventListener('mousemove', this.onMouseMove);
  }
}
