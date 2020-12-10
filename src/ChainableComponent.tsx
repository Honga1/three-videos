import {
  createRef,
  forwardRef,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
type Props = {
  onEnded?: () => void;
};

export type IChainableElement = {
  start: () => void;
  pause: () => void;
  isEnded: () => boolean;
  isPlaying: () => boolean;
  canvasImageSource: CanvasImageSource;
  width: () => number;
  height: () => number;
  onEnded?: () => void;
};

export const videoToChainable = (video: HTMLVideoElement): IChainableElement => {
  const chainableVideo: IChainableElement = {
    start: () => video.play(),
    canvasImageSource: video,
    width: () => video.videoWidth,
    height: () => video.videoHeight,
    isEnded: () => false,
    pause: () => false,
    onEnded: undefined,
    isPlaying: () =>
      !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2),
  };

  video.addEventListener('ended', () => {
    chainableVideo.isEnded = () => true;
    chainableVideo.onEnded?.();
  });

  return chainableVideo;
};

// export class ChainableElement implements IChainableElement {
//   start: () => void;
//   pause: () => void;
//   isEnded: () => void;
//   isPlaying: () => void;
//   canvasImageSource: CanvasImageSource;
//   width: () => number;
//   height: () => number;
//   constructor({
//     start,
//     pause,
//     isEnded,
//     isPlaying,
//     canvasImageSource,
//     width,
//     height,
//   }: Omit<IChainableElement, 'isEnded'>) {
//     this.start = start;
//     this.pause = pause;
//     this.isPlaying = isPlaying;
//     this.canvasImageSource = canvasImageSource;
//     this.width = width;
//     this.height = height;
//   }
// }

export const ChainableComponent = forwardRef<IChainableElement, Props>(
  (props, ref): ReactElement => {
    return <></>;
  },
);

export const ChainableVideoComponent = forwardRef<
  IChainableElement,
  Props & { video: HTMLVideoElement }
>(
  ({ onEnded, video }, ref): ReactElement => {
    const [ended, setEnded] = useState(false);

    useEffect(() => {
      video.onended = () => setEnded(true);

      innerRef.current = {
        start: () => video.play(),
        canvasImageSource: new Image(),
        width: () => video.videoWidth,
        height: () => video.videoHeight,
        isEnded: () => ended,
        pause: () => false,
        isPlaying: () =>
          !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2),
      };

      return () => {
        video.onended = null;
      };
    }, [ended, video]);

    const innerRef = useRef<IChainableElement>({
      start: () => video.play(),
      canvasImageSource: video,
      width: () => video.videoWidth,
      height: () => video.videoHeight,
      isEnded: () => ended,
      pause: () => false,
      isPlaying: () =>
        !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2),
    });

    const combinedRef = useCombinedRefs(ref, innerRef);
    return <></>;
  },
);

function useCombinedRefs(...refs: any[]) {
  const targetRef = useRef();

  useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        ref.current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
}
