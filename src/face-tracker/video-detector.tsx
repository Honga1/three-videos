import '@tensorflow/tfjs-backend-webgl';
import { ReactElement, useEffect, useRef } from 'react';
import { useStore } from '../Store';
import { getKeyPoints } from './getKeyPoints';
import { store } from './store';
import { store as baseStore } from '../Store';
import { useAnimationFrameAsync } from './use-animation-frame';

export const VideoDetector = ({ stream }: { stream: MediaStream }): ReactElement => {
  const ref = useRef<HTMLVideoElement | null>(document.createElement('video'));
  const hasLoadedData = useRef(false);
  const enabled = useStore((state) => state.currentPlaybackTrack === 1);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.srcObject = stream;
    video.play();
    video.addEventListener('loadeddata', () => {
      hasLoadedData.current = true;
    });
  }, [stream]);

  useEffect(() => {
    const main = async () => {
      const video = ref.current;
      if (video === null || hasLoadedData.current === false) return;
      video.width = stream.getTracks()[0]!.getSettings().width!;
      video.height = stream.getTracks()[0]!.getSettings().height!;
      const keyPoints = await getKeyPoints(video);
      keyPoints && store.getState().setNormalizedMesh(keyPoints);
    };

    main();
  }, [stream]);

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

      const video = ref.current;
      if (video === null || hasLoadedData.current === false) return;
      video.width = stream.getTracks()[0]!.getSettings().width!;
      video.height = stream.getTracks()[0]!.getSettings().height!;

      const keyPoints = await getKeyPoints(video);
      keyPoints && store.getState().setNormalizedMesh(keyPoints);
      if (!isTracking()) baseStore.getState().setIsTracking(true);
    };

    main();
  });
  return <></>;
};
