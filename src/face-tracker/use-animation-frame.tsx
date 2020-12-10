import React, { useCallback, useRef } from 'react';

export const useAnimationFrame = (
  frameRate: number,
  callback: (deltaTime: number) => void,
): void => {
  const requestRef = React.useRef<number>();
  const previousTimeRef = React.useRef<number>();

  const animate = useCallback(
    (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callback(deltaTime);
      }
      previousTimeRef.current = time;
    },
    [callback],
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      requestRef.current = requestAnimationFrame(animate);
    }, 1000 / frameRate);
    return () => {
      requestRef.current && cancelAnimationFrame(requestRef.current);
      interval && clearInterval(interval);
    };
  }, [animate, frameRate]);
};

export const useAnimationFrameAsync = (
  frameRate: number,
  callback: (deltaTime: number) => Promise<void>,
): void => {
  const isProcessing = useRef(false);

  useAnimationFrame(frameRate, async (deltaTime) => {
    if (isProcessing.current === true) {
      return;
    }
    isProcessing.current = true;
    callback(deltaTime).finally(() => {
      isProcessing.current = false;
    });
  });
};
