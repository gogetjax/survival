import * as THREE from 'three';
import { COLORS, PLAYER } from '@/config/balance';
import { getHeight } from '@/world/heightmap';
import { makeFreshStats } from '@/player/SurvivalStats';
import type { SurvivalStats, ViewMode } from '@/types';

export class Player {
  readonly pos = new THREE.Vector3();
  readonly vel = new THREE.Vector3();
  yaw = 0;
  pitch = 0;
  onGround = false;
  view: ViewMode = 'first';
  readonly body: THREE.Group;
  stats: SurvivalStats = makeFreshStats();

  constructor() {
    this.body = this.buildBody();
    this.spawnOnBeach();
  }

  private buildBody(): THREE.Group {
    const group = new THREE.Group();
    const skinMat = new THREE.MeshLambertMaterial({ color: COLORS.PLAYER_SKIN });
    const shirtMat = new THREE.MeshLambertMaterial({ color: COLORS.PLAYER_SHIRT });
    const pantsMat = new THREE.MeshLambertMaterial({ color: COLORS.PLAYER_PANTS });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.4), shirtMat);
    torso.position.y = -0.4;
    group.add(torso);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.36), skinMat);
    head.position.y = 0.18;
    group.add(head);
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.7, 0.18), shirtMat);
    armL.position.set(-0.4, -0.4, 0);
    group.add(armL);
    const armR = armL.clone();
    armR.position.x = 0.4;
    group.add(armR);
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.85, 0.2), pantsMat);
    legL.position.set(-0.16, -1.25, 0);
    group.add(legL);
    const legR = legL.clone();
    legR.position.x = 0.16;
    group.add(legR);
    group.visible = false;
    return group;
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
    this.body.visible = view === 'third';
  }

  toggleView(): void {
    this.setView(this.view === 'first' ? 'third' : 'first');
  }

  syncBodyTransform(): void {
    this.body.position.set(this.pos.x, this.pos.y - PLAYER.EYE_HEIGHT + 1.0, this.pos.z);
    this.body.rotation.y = this.yaw;
  }
}
