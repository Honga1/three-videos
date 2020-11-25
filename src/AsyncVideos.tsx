import { useCallback, useEffect, useRef, useState } from 'react';
type Props = {
  start: HTMLVideoElement;
  middle: Promise<Blob>;
  end: HTMLVideoElement;
};

const isVideoPlaying = (video: HTMLVideoElement) =>
  !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);

export const AsyncVideos = ({ start, middle, end }: Props): React.ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videos, setVideos] = useState<
    [HTMLVideoElement, Promise<HTMLVideoElement>, HTMLVideoElement] | undefined
  >();

  const size = {
    width: start.videoWidth,
    height: start.videoHeight,
  };

  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);

  useEffect(() => {
    const effect = async () => {
      const blob = await middle;
      return loadVideo(blob);
    };

    setVideos([start, effect(), end]);
  }, [end, middle, start]);

  useAnimationFrame(60, async () => {
    if (videos === undefined) return;

    const currentVideo = await videos[currentVideoIndex];
    const context = canvasRef.current?.getContext('2d');
    if (currentVideo === undefined) return;
    if (context === undefined || context === null) return;

    context.drawImage(currentVideo, 0, 0, size.width, size.height);
  });

  useEffect(() => {
    if (videos === undefined) return;

    const effect = async () => {
      const currentVideo = await videos[currentVideoIndex];
      if (currentVideo === undefined)
        throw new Error(
          `currentVideoIndex out of range. Got ${currentVideoIndex}, expected between 0 and ${videos.length}`,
        );
      currentVideo.onended = () => setCurrentVideoIndex((currentVideoIndex + 1) % videos.length);
      if (!isVideoPlaying(currentVideo)) {
        console.log(`playing video ${currentVideoIndex}`);
        currentVideo.play();
      }

      return () => {
        currentVideo.pause();
      };
    };

    const pauseVideo = effect();

    return () => {
      pauseVideo.then((pause) => pause?.());
    };
  }, [currentVideoIndex, videos]);

  return <canvas ref={canvasRef} width={size.width} height={size.height}></canvas>;
};

async function loadVideo(videoBlob: Blob) {
  return new Promise<HTMLVideoElement>((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoBlob);
    video.load();
    video.onloadeddata = () => resolve(video);
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
