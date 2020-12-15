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
    },
    canvasImageSource: canvas,
    width: () => canvas.width,
    height: () => canvas.height,
    isEnded: () => false,
    pause: () => false,
    onEnded: undefined,
    isPlaying: () =>
      !!(audio.currentTime > 0 && !audio.paused && !audio.ended && audio.readyState > 2),
    isReady: () => false,
  };

  audio.addEventListener('ended', () => {
    chainableGraphic.isEnded = () => true;
    chainableGraphic.onEnded?.();
  });

  store.subscribe(
    (isTracking: boolean) => {
      chainableGraphic.isReady = () => isTracking;
      if (cued && !chainableGraphic.isPlaying()) audio.play();
      cued = false;
    },
    (state) => state.isTracking,
  );

  return chainableGraphic;
};
