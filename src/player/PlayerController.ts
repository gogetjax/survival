import * as THREE from 'three';
import { PLAYER } from '@/config/balance';
import { getHeight } from '@/world/heightmap';
import type { InputManager } from '@/input/InputManager';
import type { Player } from '@/player/Player';
import { canSprint, updateNeeds, updateStamina } from '@/player/SurvivalStats';

export interface ControllerTickResult {
  sprinting: boolean;
}

export class PlayerController {
  private readonly player: Player;
  private readonly input: InputManager;
  private readonly forward = new THREE.Vector3();
  private readonly right = new THREE.Vector3();
  private readonly moveDir = new THREE.Vector3();

  constructor(player: Player, input: InputManager) {
    this.player = player;
    this.input = input;
  }

  update(dt: number): ControllerTickResult {
    const p = this.player;
    const { dx, dy } = this.input.consumeMouseDelta();
    p.yaw -= dx * PLAYER.MOUSE_SENS;
    p.pitch -= dy * PLAYER.MOUSE_SENS;
    p.pitch = Math.max(-PLAYER.PITCH_LIMIT, Math.min(PLAYER.PITCH_LIMIT, p.pitch));

    this.forward.set(-Math.sin(p.yaw), 0, -Math.cos(p.yaw));
    this.right.set(Math.cos(p.yaw), 0, -Math.sin(p.yaw));
    this.moveDir.set(0, 0, 0);
    if (this.input.isDown('KeyW')) this.moveDir.add(this.forward);
    if (this.input.isDown('KeyS')) this.moveDir.sub(this.forward);
    if (this.input.isDown('KeyA')) this.moveDir.sub(this.right);
    if (this.input.isDown('KeyD')) this.moveDir.add(this.right);

    const wantsSprint = this.input.isDown('ShiftLeft') || this.input.isDown('ShiftRight');
    const sprinting = wantsSprint && canSprint(p.stats.stamina) && this.moveDir.lengthSq() > 0;
    const speed = sprinting ? PLAYER.SPRINT_SPEED : PLAYER.WALK_SPEED;
    if (this.moveDir.lengthSq() > 0) {
      this.moveDir.normalize().multiplyScalar(speed);
    }
    p.vel.x = this.moveDir.x;
    p.vel.z = this.moveDir.z;
    p.vel.y -= PLAYER.GRAVITY * dt;
    if (this.input.isDown('Space') && p.onGround) {
      p.vel.y = PLAYER.JUMP_VELOCITY;
      p.onGround = false;
    }
    p.pos.addScaledVector(p.vel, dt);

    const groundY = getHeight(p.pos.x, p.pos.z) + PLAYER.EYE_HEIGHT;
    if (p.pos.y <= groundY) {
      p.pos.y = groundY;
      p.vel.y = 0;
      p.onGround = true;
    }
    p.syncBodyTransform();

    p.stats.stamina = updateStamina(p.stats.stamina, sprinting, dt);
    p.stats = updateNeeds(p.stats, dt);

    return { sprinting };
  }
}
