import { IChainableElement } from './ChainableComponent';
import { store } from './Store';

export const graphicToChainablePromise = (
  canvas: HTMLCanvasElement,
  audio: HTMLAudioElement,
): IChainableElement => {
  let cued = false;
  const chainableGraphic: IChainableElement = {
    playWhenReady: () => {
      cued = true;
      tryPlay();
    },
    canvasImageSource: canvas,
    width: () => canvas.width,
    height: () => canvas.height,
    isEnded: () => false,
    pause: () => false,
    onEnded: undefined,
    isPlaying: () =>
      !!(audio.currentTime > 0 && !audio.paused && !audio.ended && audio.readyState > 2),
    isReady: () => store.getState().isTracking,
  };

  audio.addEventListener('ended', () => {
    chainableGraphic.isEnded = () => true;
    chainableGraphic.onEnded?.();
  });

  const tryPlay = async () => {
    if (cued && !chainableGraphic.isPlaying() && chainableGraphic.isReady()) {
      await audio.play();
      cued = false;
    } else {
      setTimeout(() => {
        console.log('tryplay');
        tryPlay();
      }, 1000);
    }
  };

  store.subscribe(
    async (isTracking: boolean) => {
      chainableGraphic.isReady = () => isTracking;
    },
    (state) => state.isTracking,
  );

  return chainableGraphic;
};
