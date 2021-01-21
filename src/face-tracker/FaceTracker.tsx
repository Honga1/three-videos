import React, { ReactElement, useEffect, useRef } from 'react';
import { Canvas } from 'react-three-fiber';
import { useAnimationFrame } from '../ChainableAsyncVideos';
import { store } from '../Store';
import { KeyPointsOnVideo } from './key-points-on-video';
import { StoreLoader } from './store-loader';
import { VideoDetector } from './video-detector';
import { VideoDetectorOffscreen } from './video-detector-offscreen';

type Props = {
  stream: MediaStream;
};

export const FaceTracker = ({ stream }: Props): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bothDrawn = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  useEffect(() => {
    const maybeCanvas = ref.current?.getElementsByTagName('canvas')[0];
    const maybeVideo = videoRef.current;

    if (!maybeCanvas || !maybeVideo) return;

    bothDrawn.current.width = 1920;
    bothDrawn.current.height = 1080;
    bothDrawn.current.width = maybeCanvas.width;
    bothDrawn.current.height = maybeCanvas.height;

    store.setState({
      detectorCanvas: bothDrawn.current,
    });
  });

  useAnimationFrame(25, () => {
    const maybeCanvas = ref.current?.getElementsByTagName('canvas')[0];
    const maybeVideo = videoRef.current;

    if (!maybeCanvas || !maybeVideo) return;
    bothDrawn.current.width = maybeCanvas.width;
    bothDrawn.current.height = maybeCanvas.height;
    const context = bothDrawn.current.getContext('2d')!;
    const aspect = maybeVideo.videoWidth / maybeVideo.videoHeight;
    const offsetX = (maybeCanvas.width - maybeCanvas.height / aspect) / 2;
    context.clearRect(0, 0, bothDrawn.current.width, bothDrawn.current.height);
    context.drawImage(maybeVideo, offsetX, 0, maybeCanvas.height / aspect, maybeCanvas.height);
    context.drawImage(maybeCanvas, 0, 0, maybeCanvas.width, maybeCanvas.height);
  });

  return (
    <>
      <div
        ref={ref}
        style={{ width: '100%', height: '100%', opacity: '0.0' }}
        className="FaceTracker"
      >
        <VideoDetector stream={stream} ref={videoRef} />
        <Canvas
          style={{
            width: '100%',
          }}
          orthographic={true}
          pixelRatio={window.devicePixelRatio}
          webgl1={true}
          camera={{ near: -10000, far: 10000 }}
          noEvents={true}
          onPointerMove={undefined}
          onMouseMove={undefined}
        >
          <StoreLoader></StoreLoader>
          <ambientLight></ambientLight>
          <directionalLight position={[0, 0, 0]}></directionalLight>
          <KeyPointsOnVideo />
        </Canvas>
      </div>
    </>
  );
};
