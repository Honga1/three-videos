import { IChainableElement } from './ChainableComponent';

class ChainableCanvas implements IChainableElement {
  playing = false;
  timeout: NodeJS.Timeout | undefined;
  ended = false;

  constructor(private duration: number, public canvasImageSource: HTMLCanvasElement) {}
  isEnded = () => this.ended;
  isPlaying = () => this.playing;

  width = () => this.canvasImageSource.width;
  height = () => this.canvasImageSource.height;
  onEnded: (() => void) | undefined = undefined;
  start() {
    this.playing = true;
    this.timeout = setTimeout(() => this.end(), this.duration);
  }

  pause() {
    this.timeout && clearTimeout(this.timeout);
    this.playing = false;
  }

  end() {
    this.playing = false;
    this.ended = true;
    this.onEnded?.();
  }
}

export function canvasToChainable(canvas: HTMLCanvasElement, duration: number): IChainableElement {
  return new ChainableCanvas(duration, canvas);
}

export const graphicToChainable = (
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
  };

  audio.addEventListener('ended', () => {
    chainableGraphic.isEnded = () => true;
    chainableGraphic.onEnded?.();
  });

  return chainableGraphic;
};
