import '@tensorflow/tfjs-backend-webgl';
import { forwardRef, MutableRefObject, ReactElement, useEffect, useRef } from 'react';
import { useStore } from '../Store';
import { getKeyPoints } from './getKeyPoints';
import { store } from './store';
import { store as baseStore } from '../Store';
import { useAnimationFrameAsync } from './use-animation-frame';

const useForwardedRef = <T extends any>(
  ref: ((instance: T | null) => void) | MutableRefObject<T | null> | null,
) => {
  const innerRef = useRef<T>(null);
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(innerRef.current);
    } else {
      // eslint-disable-next-line no-param-reassign
      ref.current = innerRef.current;
    }
  });

  return innerRef;
};

export const VideoDetector = forwardRef<HTMLVideoElement, { stream: MediaStream }>(
  ({ stream }: { stream: MediaStream }, ref): ReactElement => {
    const videoRef = useForwardedRef(ref);

    const hasLoadedData = useRef(false);
    const enabled = useStore((state) => true);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      video.play();
      video.addEventListener('loadeddata', () => {
        hasLoadedData.current = true;
      });
    }, [stream, videoRef]);

    useEffect(() => {
      const main = async () => {
        const video = videoRef.current;
        if (video === null || hasLoadedData.current === false) return;
        video.width = stream.getTracks()[0]!.getSettings().width!;
        video.height = stream.getTracks()[0]!.getSettings().height!;
        const keyPoints = await getKeyPoints(video);
        keyPoints && store.getState().setNormalizedMesh(keyPoints);
      };

      main();
    }, [stream, videoRef]);

    const isTracking = () => baseStore.getState().isTracking;
    useAnimationFrameAsync(25, async () => {
      const main = async () => {
        if (!enabled && !isTracking()) {
          return;
        }

        if (!enabled && isTracking()) {
          baseStore.getState().setIsTracking(false);
          return;
        }

        const video = videoRef.current;
        if (video === null || hasLoadedData.current === false) return;
        video.width = stream.getTracks()[0]!.getSettings().width!;
        video.height = stream.getTracks()[0]!.getSettings().height!;

        const keyPoints = await getKeyPoints(video);

        keyPoints && store.getState().setNormalizedMesh(keyPoints);
        if (!isTracking()) baseStore.getState().setIsTracking(true);
      };

      main();
    });
    return (
      <video
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          left: '50%',
          top: '50%',
        }}
        width="100%"
        autoPlay
        height="100%"
        ref={videoRef}
      ></video>
    );
  },
);
