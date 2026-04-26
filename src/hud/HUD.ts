import type { Mutant } from '@/entities/Mutant';
import type { Player } from '@/player/Player';
import type { TimeState } from '@/time/DayNightCycle';
import type { ThreatInfo, ViewMode as ViewModeT } from '@/types';
import { Banner } from '@/hud/Banner';
import { ControlsHelp } from '@/hud/ControlsHelp';
import { Crosshair } from '@/hud/Crosshair';
import { EnergyBars } from '@/hud/EnergyBars';
import { FxOverlay } from '@/hud/FxOverlay';
import { Hotbar } from '@/hud/Hotbar';
import { Minimap } from '@/hud/Minimap';
import { ThreatIndicator } from '@/hud/ThreatIndicator';
import { TimePanel } from '@/hud/TimePanel';
import { ViewMode } from '@/hud/ViewMode';

export class HUD {
  readonly bars: EnergyBars;
  readonly time: TimePanel;
  readonly minimap: Minimap;
  readonly hotbar: Hotbar;
  readonly viewMode: ViewMode;
  readonly banner: Banner;
  readonly threat: ThreatIndicator;
  readonly crosshair: Crosshair;
  readonly controlsHelp: ControlsHelp;
  readonly fx: FxOverlay;

  constructor(root: HTMLElement) {
    this.bars = new EnergyBars(root);
    this.time = new TimePanel(root);
    this.minimap = new Minimap(root);
    this.hotbar = new Hotbar(root);
    this.viewMode = new ViewMode(root);
    this.banner = new Banner(root);
    this.threat = new ThreatIndicator(root);
    this.crosshair = new Crosshair(root);
    this.controlsHelp = new ControlsHelp(root);
    this.fx = new FxOverlay(root);
  }

  update(player: Player, time: TimeState, threat: ThreatInfo, mutants: ReadonlyArray<Mutant>): void {
    this.bars.update(player.stats);
    this.time.update(time);
    this.threat.update(threat);
    this.minimap.draw(player, mutants);
  }

  setView(view: ViewModeT): void {
    this.viewMode.set(view);
  }

  showBanner(text: string, sub?: string, durationMs?: number): void {
    this.banner.show(text, sub, durationMs);
  }
}
