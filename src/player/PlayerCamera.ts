import * as THREE from 'three';
import { PLAYER } from '@/config/balance';
import type { Player } from '@/player/Player';

export class PlayerCamera {
  readonly camera: THREE.PerspectiveCamera;
  private readonly player: Player;
  private readonly tmpDir = new THREE.Vector3();
  private readonly tmpBack = new THREE.Vector3();
  private readonly tmpTarget = new THREE.Vector3();

  constructor(player: Player) {
    this.player = player;
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      500,
    );
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  update(): void {
    const p = this.player;
    if (p.view === 'first') {
      this.camera.position.copy(p.pos);
      this.tmpDir.set(
        -Math.sin(p.yaw) * Math.cos(p.pitch),
        Math.sin(p.pitch),
        -Math.cos(p.yaw) * Math.cos(p.pitch),
      );
      this.tmpTarget.copy(p.pos).add(this.tmpDir);
      this.camera.lookAt(this.tmpTarget);
    } else {
      this.tmpBack
        .set(Math.sin(p.yaw), 0, Math.cos(p.yaw))
        .multiplyScalar(PLAYER.THIRD_PERSON_DIST);
      this.camera.position.copy(p.pos).add(this.tmpBack);
      this.camera.position.y += PLAYER.THIRD_PERSON_HEIGHT;
      this.camera.lookAt(p.pos);
    }
  }
}
