import * as THREE from 'three';
import { COLORS, HUD, TIME } from '@/config/balance';
import type { Stars } from '@/world/Stars';
import { isNight, type TimeState } from '@/time/DayNightCycle';

export class SkySystem {
  readonly sun: THREE.DirectionalLight;
  readonly moon: THREE.DirectionalLight;
  readonly hemi: THREE.HemisphereLight;
  private readonly scene: THREE.Scene;
  private readonly stars: Stars;
  private readonly dayColor = new THREE.Color(COLORS.SKY_DAY);
  private readonly sunsetColor = new THREE.Color(COLORS.SKY_SUNSET);
  private readonly nightColor = new THREE.Color(COLORS.SKY_NIGHT);

  constructor(scene: THREE.Scene, stars: Stars) {
    this.scene = scene;
    this.stars = stars;
    this.sun = new THREE.DirectionalLight(COLORS.SUN, 1.0);
    this.moon = new THREE.DirectionalLight(COLORS.MOON, 0.0);
    this.hemi = new THREE.HemisphereLight(COLORS.HEMI_SKY, COLORS.HEMI_GROUND, 0.55);
    scene.add(this.sun);
    scene.add(this.moon);
    scene.add(this.hemi);
    scene.fog = new THREE.Fog(COLORS.SKY_DAY, HUD.FOG_NEAR, HUD.FOG_FAR);
    scene.background = new THREE.Color(COLORS.SKY_DAY);
  }

  update(time: TimeState): void {
    const dawn = TIME.DAY_START_HOUR;
    const dusk = TIME.DAY_START_HOUR + TIME.DAYLIGHT_HOURS;
    const isDay = time.hour >= dawn && time.hour < dusk;

    if (isDay) {
      const dayT = (time.hour - dawn) / TIME.DAYLIGHT_HOURS;
      const angle = dayT * Math.PI;
      this.sun.position.set(Math.cos(angle) * 80, Math.sin(angle) * 80, 30);
      this.sun.intensity = 0.4 + Math.sin(dayT * Math.PI) * 0.7;
      this.moon.intensity = 0;
    } else {
      this.sun.intensity = 0;
      const nightT =
        time.hour >= dusk
          ? (time.hour - dusk) / TIME.NIGHT_HOURS
          : (time.hour + (TIME.GAME_HOURS_PER_DAY - dusk)) / TIME.NIGHT_HOURS;
      const angle = nightT * Math.PI;
      this.moon.position.set(-Math.cos(angle) * 80, Math.sin(angle) * 80, 30);
      this.moon.intensity = 0.18;
    }

    let bg: THREE.Color;
    if (isDay) {
      const dayT = (time.hour - dawn) / TIME.DAYLIGHT_HOURS;
      const edge = Math.max(0, Math.abs(dayT - 0.5) * 2.2 - 0.6);
      bg = this.dayColor.clone().lerp(this.sunsetColor, edge);
    } else {
      bg = this.nightColor.clone();
    }
    this.scene.background = bg;
    if (this.scene.fog instanceof THREE.Fog) {
      this.scene.fog.color = bg;
    }
    this.stars.setOpacity(isNight(time.hour) ? 0.85 : 0);
    this.hemi.intensity = isDay ? 0.55 : 0.18;
  }

  dispose(): void {
    this.scene.remove(this.sun);
    this.scene.remove(this.moon);
    this.scene.remove(this.hemi);
    this.sun.dispose();
    this.moon.dispose();
    this.hemi.dispose();
  }
}
