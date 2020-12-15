import React, { ReactElement, useEffect, useRef } from 'react';
import { Canvas } from 'react-three-fiber';
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

  useEffect(() => {
    const maybeCanvas = ref.current?.getElementsByTagName('canvas')[0];
    if (!maybeCanvas) return;

    store.setState({
      detectorCanvas: maybeCanvas,
    });
  }, []);

  return (
    <>
      <div
        ref={ref}
        style={{ width: '100%', height: '100%', opacity: '0' }}
        className="FaceTracker"
      >
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
        <VideoDetector stream={stream} />
      </div>
    </>
  );
};
