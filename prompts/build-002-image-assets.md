# Survival Game · Build 002 · Image-Based Mutants & Player

> **For Claude Code.** Run from inside `gogetjax/survival` on `main` (Build 001 merged).

---

## Pre-flight

1. CWD is the root of `gogetjax/survival`.
2. `git status` is clean on `main`. `git pull origin main` first.
3. `node -v` ≥ 20, `npm -v` works, `gh auth status` is OK.
4. **Verify image source paths.** The user provided two locations; the second has a likely typo. Probe in this order, log which one matched:
   ```bash
   # Mutants
   ls -la /home/cjackson/code/images/survivor/creatures/mutant1.png \
          /home/cjackson/code/images/survivor/creatures/mutant2.png \
          /home/cjackson/code/images/survivor/creatures/mutant3.png \
          /home/cjackson/code/images/survivor/creatures/mutant4.png

   # Player — try corrected path first, then literal
   ls -la /home/cjackson/code/images/survivor/players/player1.png \
       || ls -la /home/cjackson/codeimages/survivor/players/player1.png
   ```
   If any mutant file is missing, stop and report. If the player file exists at the literal (typo'd) path, note that — we'll mention it in the PR but use the file regardless.
5. Print dimensions of every source PNG (`file <path>` or `identify <path>` if ImageMagick is available; otherwise read the IHDR chunk of the PNG header). Note the dimensions for the PR.

---

## Worktree setup

```bash
BRANCH="build-002-image-assets"
WORKTREE="../survival-${BRANCH}"

git fetch origin
git worktree add "$WORKTREE" -b "$BRANCH" origin/main
cd "$WORKTREE"
pwd  # confirm you're in the worktree before continuing
```

---

## Goal

Replace the procedural humanoid geometry with image-based sprites:

- **Mutants** → `THREE.Sprite` billboards using one of 4 PNG variants (random per-mutant).
- **Player** (third-person view only) → directional sprite reading from a 3×3 grid atlas (`player1.png`), choosing a cell based on the angle between the camera and the player's facing direction.

Behavior (movement, AI, stats) is unchanged. This is a visual swap.

---

## Context

The art is finally here. Build 001 used procedural cylinders/spheres as placeholders. We're now plugging in real assets:

- 4 distinct mutant images → visual variety across the mutant population.
- 1 player atlas with 9 cells → in principle, gives us 8-directional rendering (probably with a 9th idle/center pose) so the player visibly turns relative to the camera.

**Caveat to surface in the PR:** our current third-person camera sits directly behind the player along the yaw axis, so the relative camera→player angle is effectively constant. The directional sprite system will be implemented correctly but visually static under the current camera. Recommend a free-look / orbit third-person camera as a Build 003 candidate so the 3×3 atlas earns its keep.

---

## Tasks

Commit per major task with the message shown.

### Task 1 — Save this prompt to the repo

Save **this entire prompt** (the file you're reading) to `prompts/build-002-image-assets.md` so it lives in the repo alongside the work.

```bash
git add prompts/build-002-image-assets.md
git commit -m "docs(prompts): add build-002 prompt"
```

### Task 2 — Copy assets into the repo

Vite serves anything in `public/` as static. Use:

```
public/assets/creatures/mutant1.png
public/assets/creatures/mutant2.png
public/assets/creatures/mutant3.png
public/assets/creatures/mutant4.png
public/assets/players/player1.png
```

```bash
mkdir -p public/assets/creatures public/assets/players

# Mutants
cp /home/cjackson/code/images/survivor/creatures/mutant{1,2,3,4}.png \
   public/assets/creatures/

# Player — use whichever path matched in pre-flight
cp /home/cjackson/code/images/survivor/players/player1.png public/assets/players/ \
  || cp /home/cjackson/codeimages/survivor/players/player1.png public/assets/players/
```

If any file is unusually large (> 2 MB), note it in the PR — we may want git-lfs in a future build, but don't add it now.

```bash
git add public/assets/
git commit -m "assets: add mutant variants and player sprite atlas"
```

### Task 3 — Asset manifest

Create `src/config/assets.ts`:

```ts
export const ASSET_PATHS = {
  creatures: {
    mutant1: '/assets/creatures/mutant1.png',
    mutant2: '/assets/creatures/mutant2.png',
    mutant3: '/assets/creatures/mutant3.png',
    mutant4: '/assets/creatures/mutant4.png',
  },
  players: {
    player1: '/assets/players/player1.png',
  },
} as const;

export const MUTANT_VARIANT_URLS = [
  ASSET_PATHS.creatures.mutant1,
  ASSET_PATHS.creatures.mutant2,
  ASSET_PATHS.creatures.mutant3,
  ASSET_PATHS.creatures.mutant4,
] as const;
```

Add to `src/config/balance.ts`:
```ts
export const SPRITE = {
  mutantHeight: 2.4,        // world units
  mutantAspectFallback: 0.6, // width/height if texture isn't loaded yet
  playerHeight: 1.9,
  playerAspectFallback: 0.55,
  playerAtlasCols: 3,
  playerAtlasRows: 3,
} as const;
```

### Task 4 — Texture preloader

Create `src/assets/TextureLoader.ts`:

```ts
import * as THREE from 'three';

export interface PreloadOptions {
  filter?: 'nearest' | 'linear';
}

export async function preloadTextures(
  urls: readonly string[],
  opts: PreloadOptions = {},
): Promise<Map<string, THREE.Texture>> {
  const loader = new THREE.TextureLoader();
  const filter = opts.filter === 'nearest' ? THREE.NearestFilter : THREE.LinearFilter;

  const entries = await Promise.all(
    urls.map(
      (url) =>
        new Promise<[string, THREE.Texture]>((resolve, reject) => {
          loader.load(
            url,
            (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace;
              tex.magFilter = filter;
              tex.minFilter = filter;
              tex.wrapS = THREE.ClampToEdgeWrapping;
              tex.wrapT = THREE.ClampToEdgeWrapping;
              resolve([url, tex]);
            },
            undefined,
            (err) => reject(new Error(`Failed to load ${url}: ${err}`)),
          );
        }),
    ),
  );

  return new Map(entries);
}
```

### Task 5 — Loading state in `Game.ts`

Before `start()`, preload all textures listed in `ASSET_PATHS`. Update the start screen DOM to show progress:

- While loading: `"LOADING ASSETS · 3 / 5"` and the prompt button is disabled.
- On complete: revert to `"CLICK TO ENTER · WASD TO MOVE"` and enable the click handler.

Pass the loaded `Map<string, THREE.Texture>` into `MutantManager` and `Player` constructors.

### Task 6 — Mutant billboard system

Replace the procedural humanoid factory.

Create `src/entities/MutantSpriteFactory.ts`:

```ts
import * as THREE from 'three';
import { SPRITE } from '@/config/balance';

export function createMutantSprite(texture: THREE.Texture): THREE.Sprite {
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.1,
    depthWrite: false, // sprites render correctly with transparency
  });
  const sprite = new THREE.Sprite(material);

  // Compute aspect from texture if available; fallback otherwise
  const img = texture.image as { width?: number; height?: number } | undefined;
  const aspect =
    img && img.width && img.height ? img.width / img.height : SPRITE.mutantAspectFallback;
  sprite.scale.set(SPRITE.mutantHeight * aspect, SPRITE.mutantHeight, 1);

  return sprite;
}
```

Update `src/entities/Mutant.ts`:
- Constructor takes a texture (one of the 4 mutant variants).
- Replace the inner `THREE.Group` with the result of `createMutantSprite(texture)`.
- Remove the per-frame `lookAt(player)` rotation (sprites face the camera automatically).
- Sprite y-position should be `pos.y + (SPRITE.mutantHeight / 2)` so feet sit on the ground.

Update `src/entities/MutantManager.ts`:
- Constructor takes the texture map.
- For each spawned mutant, randomly pick one of the 4 mutant URLs and pass that texture to the `Mutant` constructor.

Delete `src/entities/MutantFactory.ts` (the old procedural one). Keep `MutantSpriteFactory.ts` as the replacement.

Update `tests/mutant-factory.test.ts` (rename to `tests/mutant-sprite-factory.test.ts`):
- Test: `createMutantSprite(texture)` returns a `THREE.Sprite`.
- Test: scale.y matches `SPRITE.mutantHeight`.
- Test: material has `transparent: true` and a non-null `map`.

```bash
git add src/config src/assets src/entities src/game tests/
git commit -m "feat(mutants): replace procedural geometry with image billboards"
```

### Task 7 — Player directional sprite

**Inspect the image first.** Open `public/assets/players/player1.png` in some way (read header, or just describe what you can infer from the dimensions and any other clues). Form a hypothesis about the 3×3 cell layout. Document your hypothesis at the top of the new file:

```ts
/**
 * Player sprite atlas (player1.png) layout — assumed:
 *
 *   (0,0) NW   (0,1) N    (0,2) NE
 *   (1,0)  W   (1,1) ?    (1,2)  E
 *   (2,0) SW   (2,1) S    (2,2) SE
 *
 * Convention: the cell label = direction of the camera relative to the player.
 *   - "S" cell = camera is south of player → we see the player's back if they face north.
 *   - "N" cell = camera is north of player → we see the player's face if they face north.
 * Center cell (1,1) treated as fallback to closest 8-direction until clarified.
 *
 * If actual layout differs (e.g., 9 evenly-spaced 40° rotations row-by-row),
 * update CELL_MAP below and revise this comment.
 */
```

Create `src/player/PlayerSprite.ts`:

```ts
import * as THREE from 'three';
import { SPRITE } from '@/config/balance';

// 8 sectors mapped to (row, col) cells. Sector 0 = camera due south of player.
// Sectors increase clockwise as the camera rotates around the player.
const CELL_MAP: ReadonlyArray<{ row: number; col: number }> = [
  { row: 2, col: 1 }, // S
  { row: 2, col: 2 }, // SE
  { row: 1, col: 2 }, // E
  { row: 0, col: 2 }, // NE
  { row: 0, col: 1 }, // N
  { row: 0, col: 0 }, // NW
  { row: 1, col: 0 }, // W
  { row: 2, col: 0 }, // SW
];

export class PlayerSprite {
  readonly sprite: THREE.Sprite;
  private texture: THREE.Texture;
  private currentSector = -1;

  constructor(atlas: THREE.Texture) {
    // Clone so this player's UV transform doesn't bleed into other users of the texture
    this.texture = atlas.clone();
    this.texture.needsUpdate = true;
    this.texture.repeat.set(1 / SPRITE.playerAtlasCols, 1 / SPRITE.playerAtlasRows);

    const material = new THREE.SpriteMaterial({
      map: this.texture,
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false,
    });
    this.sprite = new THREE.Sprite(material);

    const img = atlas.image as { width?: number; height?: number } | undefined;
    // Per-cell aspect: if atlas is 600x900 (cols=3, rows=3), each cell is 200x300 → aspect ≈ 0.66
    const cellAspect =
      img && img.width && img.height
        ? img.width / SPRITE.playerAtlasCols / (img.height / SPRITE.playerAtlasRows)
        : SPRITE.playerAspectFallback;
    this.sprite.scale.set(SPRITE.playerHeight * cellAspect, SPRITE.playerHeight, 1);

    this.setSector(0);
  }

  /** Call each frame in third-person view. */
  update(playerYaw: number, playerPos: THREE.Vector3, cameraPos: THREE.Vector3): void {
    // World-space angle from player to camera (in the XZ plane, atan2 returns [-π, π])
    const dx = cameraPos.x - playerPos.x;
    const dz = cameraPos.z - playerPos.z;
    const cameraDir = Math.atan2(dx, dz); // 0 = camera due north, π/2 = east, etc.

    // Player facing direction. Yaw convention: yaw=0 means facing -Z (north).
    // Relative angle: where is the camera relative to the player's forward?
    let relative = cameraDir - playerYaw;
    relative = ((relative % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2); // [0, 2π)

    // 8 sectors of 45° each, with sector 0 centered on "camera south of player"
    // (camera behind player when player faces north). Offset by π/8 so sector
    // boundaries fall between cells, not on them.
    const sector = Math.floor(((relative + Math.PI / 8) % (Math.PI * 2)) / (Math.PI / 4)) % 8;

    if (sector !== this.currentSector) {
      this.setSector(sector);
    }
  }

  private setSector(sector: number): void {
    const cell = CELL_MAP[sector];
    // UV origin is bottom-left in three.js. We treat row 0 as visually top.
    this.texture.offset.set(
      cell.col / SPRITE.playerAtlasCols,
      (SPRITE.playerAtlasRows - 1 - cell.row) / SPRITE.playerAtlasRows,
    );
    this.currentSector = sector;
  }

  dispose(): void {
    this.texture.dispose();
    (this.sprite.material as THREE.SpriteMaterial).dispose();
  }
}
```

Update `src/player/Player.ts`:
- Constructor takes the player atlas texture.
- Replace the `playerGroup` (cylinder body + sphere head + box backpack) with `this.sprite = new PlayerSprite(atlas)`. Add `this.sprite.sprite` to the scene.
- Each frame in third-person view, call `this.sprite.update(this.yaw, this.pos, camera.position)`.
- In first-person view, hide the sprite (`this.sprite.sprite.visible = false`).
- Sprite y-position: `pos.y + SPRITE.playerHeight / 2`.

```bash
git add src/player/ tests/
git commit -m "feat(player): replace 3D body with directional sprite atlas"
```

### Task 8 — Tests

Add `tests/player-sprite.test.ts`:
- With camera due south of a north-facing player (camera at `(0,0,-5)`, player at `(0,0,0)` facing yaw=0 = north), the selected sector is **0** (S cell — back view).
- With camera due north of a north-facing player (camera at `(0,0,5)`), the selected sector is **4** (N cell — face view).
- With camera due east of a north-facing player (camera at `(5,0,0)`), the selected sector is **2** (E cell).
- With camera due west of a north-facing player (camera at `(-5,0,0)`), the selected sector is **6** (W cell).
- When player rotates 90° (yaw = π/2 = facing east) and camera is at `(0,0,-5)`, the visible sector changes to **6** (W cell — we're now to the player's left).

If you discover the image's actual layout differs from the assumption documented in `PlayerSprite.ts`, update both the test expectations and the doc comment, and surface the change clearly in the PR.

```bash
git add tests/
git commit -m "test: cover player sprite sector mapping"
```

### Task 9 — Verify

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Sanity check: `grep -rn "MutantFactory" src/ tests/` should return no results (we renamed it).

### Task 10 — Push and open PR

```bash
git push -u origin build-002-image-assets

gh pr create \
  --title "Build 002: Image-Based Mutants & Player Sprite" \
  --body "$(cat <<'EOF'
Replaces procedural humanoid geometry with image-based sprites.

## What this PR does
- 4 mutant PNGs added to \`public/assets/creatures/\`, randomly assigned per-mutant on spawn
- Player atlas added to \`public/assets/players/\`, rendered as a directional sprite reading from a 3×3 grid based on camera→player angle
- New \`TextureLoader\` preloads all assets before the start screen unlocks (loading progress shown)
- Old \`MutantFactory.ts\` removed; replaced by \`MutantSpriteFactory.ts\`
- Old \`Player\` 3D body group (cylinder + sphere + box) removed; replaced by \`PlayerSprite\` (THREE.Sprite + UV cell selection)
- Tests cover sector → cell mapping for all 8 cardinal/intercardinal directions

## Caveat the user should know about
The current third-person camera sits **directly behind the player along the yaw axis**, so the relative camera→player angle is constant and the visible cell never changes during normal play. The directional system is implemented correctly and ready, but it's effectively static until we add a free-look / orbit third-person camera. **Recommend Build 003 implement that feature so the 3×3 atlas earns its keep.**

## 3×3 atlas layout assumption
See the doc comment at the top of \`src/player/PlayerSprite.ts\`. We assumed the cells label the camera direction (S = camera south of player → back view), 8 cardinal/intercardinal directions arranged around the perimeter, with the center cell as a fallback. **If the actual layout differs, the user should call it out and we'll patch in Build 003.**

## Source-path note
The user's message gave the player image path as \`/home/cjackson/codeimages/...\` — likely a typo for \`/home/cjackson/code/images/...\`. The actual file was found at: <path used>.

## Image dimensions
- mutant1.png: <W>×<H>
- mutant2.png: <W>×<H>
- mutant3.png: <W>×<H>
- mutant4.png: <W>×<H>
- player1.png: <W>×<H> (per-cell: <W/3>×<H/3>)

## Reviewer checklist
- [ ] Mutants in third-person view show as 2D billboards always facing the camera
- [ ] Walking around mutants confirms they turn to face you (no edge-on slivers)
- [ ] Switching to first-person hides the player sprite
- [ ] Switching to third-person shows the player sprite from the back ("S" cell, given current camera)
- [ ] Loading screen briefly displays "LOADING ASSETS · N/5" before the start prompt
EOF
)"
```

If `gh` is unavailable, push the branch and stop.

---

## Acceptance criteria

- [ ] All 5 PNGs live in `public/assets/` and are served at runtime via `/assets/...`.
- [ ] No mention of the old `MutantFactory` remains in `src/` or `tests/`.
- [ ] No code references the old `playerGroup` cylinder/sphere/box player body.
- [ ] Mutants are `THREE.Sprite` instances with one of 4 textures applied.
- [ ] Player is a `THREE.Sprite` with `texture.repeat.set(1/3, 1/3)` and runtime offset selection.
- [ ] First-person view hides the player sprite; third-person shows it.
- [ ] All Vitest specs pass, including the new sector-mapping tests.
- [ ] `typecheck`, `lint`, `build` all pass with zero `any`.
- [ ] PR is open with the body above (filled in with real image dimensions and the path-used note).

## Out of scope

- ❌ Free-look / orbit third-person camera — flagged for Build 003
- ❌ Sprite animations (idle / walk frames) — separate build
- ❌ Per-mutant stat differentiation tied to variant — separate build
- ❌ Damage / hit-flash visual feedback on sprites
- ❌ LOD / mip-mapping tweaks for distant sprites
- ❌ Audio for mutants
- ❌ Touching crafting, building, or save/load systems

## References

- `CLAUDE.md` — design bible, conventions
- `prompts/build-001-foundation.md` — prior build, established the structure
- THREE.Sprite: https://threejs.org/docs/#api/en/objects/Sprite
- THREE.SpriteMaterial: https://threejs.org/docs/#api/en/materials/SpriteMaterial
- Texture UV offset/repeat: https://threejs.org/docs/#api/en/textures/Texture.offset

## When you're done, reply with

1. PR URL.
2. The path that resolved for the player image (corrected vs literal).
3. Image dimensions for all 5 PNGs.
4. Your interpretation of the 3×3 grid layout (which cell = which direction). If you can't tell from the image, say so honestly.
5. Any concerns about the assets — transparency issues, baked-in shadows that look wrong as billboards, resolution mismatches, etc.
