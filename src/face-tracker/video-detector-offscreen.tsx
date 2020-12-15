import React, { useEffect, useRef, useState } from 'react';

import '@tensorflow/tfjs-backend-webgl';
import { store } from './store';
import { getKey } from './getKeyPoints';
import { useAnimationFrameAsync } from './use-animation-frame';
import { createWorker } from './worker-setup';
import { workerCode } from './worker.js';
import { AnnotatedPrediction } from '@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh';

const worker = createWorker(workerCode);

export const VideoDetectorOffscreen = ({ stream }: { stream: MediaStream }): React.ReactElement => {
  const ref = useRef<HTMLVideoElement>(null);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const evaluationPending = useRef(0);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.srcObject = stream;
    video.play();
    video.addEventListener('loadeddata', () => {
      setHasLoadedData(true);
    });
  }, [stream]);

  useEffect(() => {
    const video = ref.current;
    if (video === null || hasLoadedData === false) return;

    const main = async (event: MessageEvent<any>): Promise<void> => {
      const predictions = event.data as AnnotatedPrediction[];
      console.log(predictions);

      const keyPoints = await getKey(video!, predictions);
      evaluationPending.current -= 1;
      keyPoints && store.getState().setNormalizedMesh(keyPoints);
    };
    worker.addEventListener('message', main);

    return () => worker.removeEventListener('message', main);
  }, [hasLoadedData]);

  useAnimationFrameAsync(22, async () => {
    // if (evaluationPending.current > 1) {
    //   return;
    // }
    // console.log('here');

    const video = ref.current;
    if (video === null || hasLoadedData === false) return;

    const imageBitmap = await createImageBitmap(video!);
    // console.log(imageBitmap);
    worker.postMessage(imageBitmap, [imageBitmap]);
    evaluationPending.current++;
  });

  return <video style={{ position: 'absolute', top: 0 }} ref={ref} width={1280} height={720} />;
};
