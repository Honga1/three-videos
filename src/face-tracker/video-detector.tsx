import '@tensorflow/tfjs-backend-webgl';
import { ReactElement, useEffect, useRef } from 'react';
import { getKeyPoints } from './getKeyPoints';
import { store } from './store';
import { useAnimationFrameAsync } from './use-animation-frame';

export const VideoDetector = ({ stream }: { stream: MediaStream }): ReactElement => {
  const ref = useRef<HTMLVideoElement | null>(document.createElement('video'));
  const hasLoadedData = useRef(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.srcObject = stream;
    video.play();
    video.addEventListener('loadeddata', () => {
      hasLoadedData.current = true;
    });
  }, [stream]);

  useAnimationFrameAsync(60, async () => {
    const video = ref.current;
    if (video === null || hasLoadedData.current === false) return;
    video.width = stream.getTracks()[0]!.getSettings().width!;
    video.height = stream.getTracks()[0]!.getSettings().height!;
    const main = async () => {
      const keyPoints = await getKeyPoints(video);
      keyPoints && store.getState().setNormalizedMesh(keyPoints);
    };

    main();
  });
  return <></>;
};
