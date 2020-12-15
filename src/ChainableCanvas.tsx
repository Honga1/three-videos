import { IChainableElement } from './ChainableComponent';
import { store } from './Store';

export const graphicToChainablePromise = (
  canvas: HTMLCanvasElement,
  audio: HTMLAudioElement,
): IChainableElement => {
  const chainableGraphic: IChainableElement = {
    start: () => audio.play(),
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
    },
    (state) => state.isTracking,
  );

  return chainableGraphic;
};
