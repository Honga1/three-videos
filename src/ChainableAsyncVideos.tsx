import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IChainableElement, videoToChainable } from './ChainableComponent';
import { store } from './face-tracker/store';
import { useStore } from './Store';
type Props = {
  start: IChainableElement;
  tracking: IChainableElement;
  middle: Promise<Blob>;
  end: IChainableElement;
};

const isVideoPlaying = (video: IChainableElement) => video.isPlaying();

export const ChainableAsyncVideos = ({
  start,
  tracking,
  middle,
  end,
}: Props): React.ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videos, setVideos] = useState<
    | [IChainableElement, IChainableElement, Promise<IChainableElement>, IChainableElement]
    | undefined
  >();

  const size = {
    width: start.width(),
    height: start.height(),
  };

  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const setPlaybackTrack = useStore((state) => state.setPlaybackTrack);

  useEffect(() => {
    const effect = async () => {
      const blob = await middle;
      return loadVideo(blob);
    };

    setVideos([start, tracking, effect(), end]);
  }, [end, middle, start, tracking]);

  useAnimationFrame(30, async () => {
    if (videos === undefined) return;
    const currentVideo = await videos[currentVideoIndex];
    const context = canvasRef.current?.getContext('2d');
    if (currentVideo === undefined) return;

    if (currentVideo.isReady() === false) {
      return;
    }
    if (context === undefined || context === null) return;

    if (currentVideoIndex === 1) {
      context.clearRect(0, 0, size.width, size.height);
    }

    if (currentVideoIndex === 2) {
      const maybeVideo = store.getState().video;
      if (!maybeVideo) {
        context.drawImage(currentVideo.canvasImageSource, 0, 0, size.width, size.height);
      } else {
        const aspect = maybeVideo.source.videoWidth / maybeVideo.source.videoHeight;
        const offsetX = (size.width - size.height / aspect) / 2;
        context.drawImage(
          currentVideo.canvasImageSource,
          offsetX,
          0,
          size.height / aspect,
          size.height,
        );
      }
    } else {
      context.drawImage(currentVideo.canvasImageSource, 0, 0, size.width, size.height);
    }
  });

  useEffect(() => {
    if (videos === undefined) return;

    const effect = async () => {
      const currentVideo = await videos[currentVideoIndex];
      if (currentVideo === undefined)
        throw new Error(
          `currentVideoIndex out of range. Got ${currentVideoIndex}, expected between 0 and ${videos.length}`,
        );
      currentVideo.onEnded = () => {
        setPlaybackTrack((currentVideoIndex + 1) % videos.length);
        setCurrentVideoIndex((currentVideoIndex + 1) % videos.length);
      };

      if (!currentVideo.isPlaying()) {
        console.log(`playing video ${currentVideoIndex}`);
        currentVideo.playWhenReady();
      }

      return () => {
        currentVideo.pause();
      };
    };

    const pauseVideo = effect();

    return () => {
      pauseVideo.then((pause) => pause?.());
    };
  }, [currentVideoIndex, setPlaybackTrack, videos]);

  return (
    <canvas
      style={{ width: '100%' }}
      ref={canvasRef}
      width={size.width}
      height={size.height}
    ></canvas>
  );
};

async function loadVideo(videoBlob: Blob) {
  return new Promise<IChainableElement>((resolve, reject) => {
    const video = document.createElement('video');

    const chainableVideo = videoToChainable(video);

    video.src = URL.createObjectURL(videoBlob);
    video.load();
    video.onloadeddata = () => resolve(chainableVideo);
    video.onerror = (error) => reject(error);
  });
}

export const useAnimationFrame = (
  frameRate: number,
  callback: (deltaTime: number) => void,
): void => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

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

  useEffect(() => {
    const interval = setInterval(() => {
      requestRef.current = requestAnimationFrame(animate);
    }, 1000 / frameRate);
    return () => {
      requestRef.current && cancelAnimationFrame(requestRef.current);
      interval && clearInterval(interval);
    };
  }, [animate, frameRate]);
};
