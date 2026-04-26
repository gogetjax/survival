import { Game } from '@/game/Game';

function bootstrap(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
  const hudRoot = document.querySelector<HTMLElement>('#hud');
  const startScreen = document.querySelector<HTMLElement>('#start-screen');
  if (!canvas || !hudRoot || !startScreen) {
    throw new Error('main: required DOM nodes missing');
  }
  const game = new Game(canvas, hudRoot);

  const onStart = (): void => {
    startScreen.classList.add('hidden');
    startScreen.removeEventListener('click', onStart);
    game.start();
  };
  startScreen.addEventListener('click', onStart);
}

bootstrap();
