import { useCallback, useEffect, useRef, useState } from 'react';
type Props = {
  start: Blob;
  middle: Blob;
  end: Blob;
};

const isVideoPlaying = (video: HTMLVideoElement) =>
  !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);

export const SequentialVideos = ({ start, middle, end }: Props): React.ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videos, setVideos] = useState<HTMLVideoElement[]>([]);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);

  useEffect(() => {
    const effect = async () => {
      const videos = await Promise.all(
        [start, middle, end].map((blob, index) => {
          const isFirst = index === 0;
          const setSizeCallback = isFirst
            ? (video: HTMLVideoElement) =>
                setSize({ width: video.videoWidth, height: video.videoHeight })
            : () => ({});
          return loadVideo(blob, setSizeCallback);
        }),
      );

      setVideos(videos);
    };

    effect();
  }, [end, middle, start]);

  useAnimationFrame(60, () => {
    const currentVideo = videos[currentVideoIndex];
    const context = canvasRef.current?.getContext('2d');
    if (currentVideo === undefined) return;
    if (context === undefined || context === null) return;

    context.drawImage(currentVideo, 0, 0, size.width, size.height);
  });

  useEffect(() => {
    if (videos.length === 0) return;
    const currentVideo = videos[currentVideoIndex];
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
  }, [currentVideoIndex, videos]);

  return <canvas ref={canvasRef} width={size.width} height={size.height}></canvas>;
};

async function loadVideo(videoBlob: Blob, onMetaData: (video: HTMLVideoElement) => void) {
  return new Promise<HTMLVideoElement>((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoBlob);
    video.load();
    video.onloadeddata = () => resolve(video);
    video.onerror = (error) => reject(error);
    video.addEventListener('loadedmetadata', () => onMetaData(video));
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
