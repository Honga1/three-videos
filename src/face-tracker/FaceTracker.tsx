import React, { forwardRef, ReactElement, useEffect, useRef, useState } from 'react';
import { Canvas } from 'react-three-fiber';
import { IChainableElement } from '../ChainableComponent';
import { store } from '../Store';
import { KeyPointsOnVideo } from './key-points-on-video';
import { StoreLoader } from './store-loader';
import { VideoDetector } from './video-detector';

type Props = {
  stream: MediaStream;
  duration: number;
};

export const FaceTracker = forwardRef<HTMLDivElement & IChainableElement, Props>(
  ({ stream, duration }): ReactElement => {
    const [isOn, setIsOn] = useState(false);
    const [isEnded, setIsEnded] = useState(false);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const maybeCanvas = ref.current?.getElementsByTagName('canvas')[0];
      if (!maybeCanvas) return;

      store.setState({
        detectorVideo: {
          start: () => setIsOn(true),
          canvasImageSource: maybeCanvas,
          height: () => maybeCanvas.height,
          width: () => maybeCanvas.width,
          isEnded: () => isEnded,
          isPlaying: () => isOn,
          pause: () => setIsOn(false),
        },
      });
    }, [isEnded, isOn]);

    // useEffect(() => {
    //   if (isOn) {
    //     const timeout = setTimeout(() => {
    //       setIsEnded(true);
    //       setIsOn(false);
    //       store.getState().detectorVideo?.onEnded?.();
    //     }, duration);
    //     return () => clearTimeout(timeout);
    //   }
    // }, [duration, isOn]);

    return (
      <>
        <div
          ref={ref}
          style={{ width: '100%', height: '100%', display: isOn ? 'block' : 'none' }}
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
          <VideoDetector stream={stream}></VideoDetector>
        </div>
      </>
    );
  },
);

function useCombinedRefs<T>(...refs: any[]) {
  const targetRef = useRef<T>(null);

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
