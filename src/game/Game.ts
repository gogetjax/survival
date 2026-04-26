import * as THREE from 'three';
import { HUD as HUD_CFG } from '@/config/balance';
import { ASSET_PATHS } from '@/config/assets';
import { GameLoop } from '@/game/GameLoop';
import { HUD } from '@/hud/HUD';
import { InputManager } from '@/input/InputManager';
import { MutantManager } from '@/entities/MutantManager';
import { Ocean } from '@/world/Ocean';
import { Player } from '@/player/Player';
import { PlayerCamera } from '@/player/PlayerCamera';
import { PlayerController } from '@/player/PlayerController';
import { Rocks } from '@/world/Rocks';
import { SaveManager } from '@/persistence/SaveManager';
import { SkySystem } from '@/time/SkySystem';
import { Stars } from '@/world/Stars';
import { Terrain } from '@/world/Terrain';
import { Trees } from '@/world/Trees';
import { DayNightCycle } from '@/time/DayNightCycle';

export class Game {
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly hud: HUD;
  private readonly input: InputManager;
  private readonly player: Player;
  private readonly camera: PlayerCamera;
  private readonly controller: PlayerController;
  private readonly cycle: DayNightCycle;
  private readonly sky: SkySystem;
  private readonly stars: Stars;
  private readonly mutants: MutantManager;
  private readonly loop: GameLoop;
  readonly save: SaveManager;

  constructor(
    canvas: HTMLCanvasElement,
    hudRoot: HTMLElement,
    textures: Map<string, THREE.Texture>,
  ) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87aabd);
    this.scene.fog = new THREE.Fog(0x87aabd, HUD_CFG.FOG_NEAR, HUD_CFG.FOG_FAR);

    const terrain = new Terrain();
    const ocean = new Ocean();
    const trees = new Trees();
    const rocks = new Rocks();
    this.stars = new Stars();
    this.scene.add(terrain.mesh, ocean.mesh, trees.group, rocks.group, this.stars.points);

    const playerAtlas = textures.get(ASSET_PATHS.players.player1);
    if (!playerAtlas) throw new Error('Game: missing player1 texture');
    this.player = new Player(playerAtlas);
    this.scene.add(this.player.object3d);

    this.input = new InputManager(canvas, (code) => {
      if (code === 'KeyV') {
        this.player.toggleView();
        this.hud.setView(this.player.view);
      }
    });
    this.camera = new PlayerCamera(this.player);
    this.controller = new PlayerController(this.player, this.input);
    this.cycle = new DayNightCycle();
    this.sky = new SkySystem(this.scene, this.stars);
    this.mutants = new MutantManager(this.scene, textures);

    this.hud = new HUD(hudRoot);
    this.hud.setView(this.player.view);
    this.cycle.addEventListener('newDay', (e) => {
      const detail = (e as CustomEvent<{ day: number }>).detail;
      this.hud.showBanner(`Day ${detail.day}`, 'You wake again.');
    });
    this.player.addEventListener('meleeHit', () => this.hud.fx.flashDamage());

    this.save = new SaveManager();

    window.addEventListener('resize', () => this.onResize());
    this.loop = new GameLoop((dt) => this.tick(dt));
  }

  private onResize(): void {
    this.camera.resize(window.innerWidth, window.innerHeight);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private tick(dt: number): void {
    this.cycle.update(dt);
    this.sky.update(this.cycle.state);
    this.controller.update(dt);
    const threat = this.mutants.update(dt, this.player, this.cycle.state);
    this.camera.update();
    this.player.syncSprite(this.camera.camera.position);
    this.hud.update(this.player, this.cycle.state, threat, this.mutants.mutants);
    this.renderer.render(this.scene, this.camera.camera);
  }

  start(): void {
    this.canvas.requestPointerLock();
    this.hud.showBanner('You wake on the sand.', 'Day 1 — Survive.', HUD_CFG.BANNER_INTRO_MS);
    this.loop.start();
  }
}
