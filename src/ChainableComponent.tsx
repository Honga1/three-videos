export type IChainableElement = {
  playWhenReady: () => void;
  pause: () => void;
  isEnded: () => boolean;
  isPlaying: () => boolean;
  canvasImageSource: CanvasImageSource;
  width: () => number;
  height: () => number;
  onEnded?: () => void;
  isReady: () => boolean;
};

export const videoToChainable = (video: HTMLVideoElement): IChainableElement => {
  const chainableVideo: IChainableElement = {
    playWhenReady: () => video.play(),
    canvasImageSource: video,
    width: () => video.videoWidth,
    height: () => video.videoHeight,
    isEnded: () => false,
    pause: () => false,
    onEnded: undefined,
    isPlaying: () =>
      !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2),
    isReady: () => true,
  };

  video.addEventListener('play', () => {
    chainableVideo.isEnded = () => false;
  });

  video.addEventListener('ended', () => {
    chainableVideo.isEnded = () => true;
    chainableVideo.onEnded?.();
  });

  return chainableVideo;
};
