import type { GameSnapshot } from '@/types';
import type { Player } from '@/player/Player';
import type { TimeState } from '@/time/DayNightCycle';

/**
 * Skeleton only — Build 001 ships the typed snapshot contract but no disk persistence.
 * Disk write/read lands in a later build (likely Build 003).
 */
export class SaveManager {
  serialize(player: Player, time: TimeState): GameSnapshot {
    return {
      day: time.day,
      hour: time.hour,
      realElapsedSec: time.realElapsedSec,
      player: {
        x: player.pos.x,
        y: player.pos.y,
        z: player.pos.z,
        yaw: player.yaw,
        pitch: player.pitch,
        view: player.view,
        stats: { ...player.stats },
      },
    };
  }

  deserialize(snapshot: GameSnapshot, player: Player, time: TimeState): void {
    time.day = snapshot.day;
    time.hour = snapshot.hour;
    time.realElapsedSec = snapshot.realElapsedSec;
    player.pos.set(snapshot.player.x, snapshot.player.y, snapshot.player.z);
    player.yaw = snapshot.player.yaw;
    player.pitch = snapshot.player.pitch;
    player.setView(snapshot.player.view);
    player.stats = { ...snapshot.player.stats };
  }
}
