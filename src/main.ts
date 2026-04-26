import { Game } from '@/game/Game';
import { preloadTextures } from '@/assets/TextureLoader';
import { ALL_ASSET_URLS } from '@/config/assets';

async function bootstrap(): Promise<void> {
  const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
  const hudRoot = document.querySelector<HTMLElement>('#hud');
  const startScreen = document.querySelector<HTMLElement>('#start-screen');
  const promptEl = startScreen?.querySelector<HTMLElement>('.prompt');
  if (!canvas || !hudRoot || !startScreen || !promptEl) {
    throw new Error('main: required DOM nodes missing');
  }

  const total = ALL_ASSET_URLS.length;
  startScreen.classList.add('loading');
  promptEl.textContent = `LOADING ASSETS · 0 / ${total}`;

  const textures = await preloadTextures(ALL_ASSET_URLS, {
    onProgress: (loaded, t) => {
      promptEl.textContent = `LOADING ASSETS · ${loaded} / ${t}`;
    },
  });

  startScreen.classList.remove('loading');
  promptEl.textContent = 'CLICK TO ENTER · WASD TO MOVE';

  const game = new Game(canvas, hudRoot, textures);

  const onStart = (): void => {
    startScreen.classList.add('hidden');
    startScreen.removeEventListener('click', onStart);
    game.start();
  };
  startScreen.addEventListener('click', onStart);
}

void bootstrap();
