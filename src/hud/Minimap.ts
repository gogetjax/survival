import { HUD } from '@/config/balance';
import { classifyBiome, getHeight } from '@/world/heightmap';
import type { Mutant } from '@/entities/Mutant';
import type { Player } from '@/player/Player';

export class Minimap {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly islandBmp: HTMLCanvasElement;
  private readonly px: number;

  constructor(parent: HTMLElement) {
    const el = parent.querySelector<HTMLCanvasElement>('#minimap');
    if (!el) throw new Error('Minimap: #minimap not found');
    this.canvas = el;
    const ctx = el.getContext('2d');
    if (!ctx) throw new Error('Minimap: 2d context unavailable');
    this.ctx = ctx;
    this.px = el.width;
    this.islandBmp = this.bakeIsland();
  }

  private bakeIsland(): HTMLCanvasElement {
    const off = document.createElement('canvas');
    off.width = this.px;
    off.height = this.px;
    const c = off.getContext('2d');
    if (!c) throw new Error('Minimap: failed to bake offscreen island bitmap');
    for (let py = 0; py < this.px; py++) {
      for (let px = 0; px < this.px; px++) {
        const wx = (px / this.px - 0.5) * 2 * HUD.MAP_RANGE;
        const wz = (py / this.px - 0.5) * 2 * HUD.MAP_RANGE;
        const h = getHeight(wx, wz);
        const b = classifyBiome(h);
        c.fillStyle =
          h < 0
            ? '#1d3247'
            : b === 'sand'
              ? '#9c7a4d'
              : b === 'grass'
                ? '#3b5524'
                : '#5e544a';
        c.fillRect(px, py, 1, 1);
      }
    }
    return off;
  }

  draw(player: Player, mutants: ReadonlyArray<Mutant>): void {
    this.ctx.drawImage(this.islandBmp, 0, 0);
    for (const m of mutants) {
      const px = this.px * (0.5 + m.group.position.x / (2 * HUD.MAP_RANGE));
      const py = this.px * (0.5 + m.group.position.z / (2 * HUD.MAP_RANGE));
      this.ctx.fillStyle = m.aware ? '#ff6b3d' : '#a04030';
      this.ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
    }
    const px = this.px * (0.5 + player.pos.x / (2 * HUD.MAP_RANGE));
    const py = this.px * (0.5 + player.pos.z / (2 * HUD.MAP_RANGE));
    this.ctx.fillStyle = '#e8b557';
    this.ctx.beginPath();
    this.ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#e8b557';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(px, py);
    this.ctx.lineTo(px - Math.sin(player.yaw) * 8, py - Math.cos(player.yaw) * 8);
    this.ctx.stroke();
  }
}
