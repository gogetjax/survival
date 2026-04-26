import * as THREE from 'three';
import { PLAYER, SPRITE } from '@/config/balance';
import { getHeight } from '@/world/heightmap';
import { makeFreshStats } from '@/player/SurvivalStats';
import { PlayerSprite } from '@/player/PlayerSprite';
import type { Mutant } from '@/entities/Mutant';
import type { SurvivalStats, ViewMode } from '@/types';

export interface MeleeHitDetail {
  damage: number;
  source: Mutant;
}

export class Player extends EventTarget {
  readonly pos = new THREE.Vector3();
  readonly vel = new THREE.Vector3();
  yaw = 0;
  pitch = 0;
  onGround = false;
  view: ViewMode = 'first';
  readonly sprite: PlayerSprite;
  stats: SurvivalStats = makeFreshStats();

  constructor(atlas: THREE.Texture) {
    super();
    this.sprite = new PlayerSprite(atlas);
    this.sprite.sprite.visible = false;
    this.spawnOnBeach();
  }

  /** The Object3D to add to the scene. */
  get object3d(): THREE.Object3D {
    return this.sprite.sprite;
  }

  spawnOnBeach(): void {
    const angle = Math.random() * Math.PI * 2;
    const dist = PLAYER.SPAWN_RING_DIST;
    this.pos.x = Math.cos(angle) * dist;
    this.pos.z = Math.sin(angle) * dist;
    this.pos.y = getHeight(this.pos.x, this.pos.z) + PLAYER.EYE_HEIGHT;
    this.yaw = angle + Math.PI;
    this.pitch = 0;
    this.vel.set(0, 0, 0);
  }

  setView(view: ViewMode): void {
    this.view = view;
    this.sprite.sprite.visible = view === 'third';
  }

  toggleView(): void {
    this.setView(this.view === 'first' ? 'third' : 'first');
  }

  /**
   * Apply a melee swing's worth of armor damage and emit a `meleeHit` event
   * so the HUD can react (flash, sound, etc.) without the Player owning view code.
   */
  takeMeleeHit(damage: number, source: Mutant): void {
    this.stats.armor = Math.max(0, this.stats.armor - damage);
    this.dispatchEvent(
      new CustomEvent<MeleeHitDetail>('meleeHit', { detail: { damage, source } }),
    );
  }

  /** Position the sprite at the player's feet+halfHeight and orient via the camera angle. */
  syncSprite(cameraPos: THREE.Vector3): void {
    const groundY = this.pos.y - PLAYER.EYE_HEIGHT;
    this.sprite.sprite.position.set(this.pos.x, groundY + SPRITE.playerHeight / 2, this.pos.z);
    if (this.view === 'third') {
      this.sprite.update(this.yaw, this.sprite.sprite.position, cameraPos);
    }
  }
}
