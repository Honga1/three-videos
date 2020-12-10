import { useEffect, useState } from 'react';
import { ErrorMessage, NeutralMessage, SuccessMessage } from './ui/Messages';
import { useStore } from './Store';
import videoStart from './videos/1.mp4';
import videoMiddle from './videos/2.wav';
import videoEnd from './videos/3.mp4';

export const StaticVideoLoader = (): React.ReactElement => {
  const isAlreadyLoaded = useStore((state) => !!state.staticFiles);
  const setStaticFiles = useStore((state) => state.setStaticFiles);

  const [uiState, setUiState] = useState<'notLoaded' | 'loading' | 'loaded' | 'error'>(
    isAlreadyLoaded ? 'loaded' : 'notLoaded',
  );
  useEffect(() => {
    if (isAlreadyLoaded) return;

    const loadVideos = async () => {
      setUiState('loading');

      try {
        const start = await loadVideo(videoStart);
        const middle = await loadAudio(videoMiddle);
        const end = await loadVideo(videoEnd);
        setUiState('loaded');
        setStaticFiles({ start, middle, end });
      } catch (error) {
        setUiState('error');
        console.warn(`Could not load element ${error?.path[0]?.src}`);
        console.error(error);
      }
    };

    loadVideos();
  }, [isAlreadyLoaded, setStaticFiles]);

  return (
    <div className="StaticFileLoader">
      {uiState === 'notLoaded' && <NeutralMessage text="Files not loaded" />}
      {uiState === 'loading' && <NeutralMessage text="Files loading" />}
      {uiState === 'loaded' && <SuccessMessage text="Files loaded!" />}
      {uiState === 'error' && <ErrorMessage reason="Files could not load" />}
    </div>
  );
};

const loadVideo = async (src: string) => {
  return new Promise<HTMLVideoElement>(async (resolve, reject) => {
    const video = document.createElement('video') as HTMLVideoElement;
    video.src = src;
    video.onerror = (event) => reject(event);
    video.onloadeddata = () => {
      resolve(video);
    };
    video.load();
  });
};

const loadAudio = async (src: string) => {
  return new Promise<HTMLAudioElement>((resolve, reject) => {
    const audio = document.createElement('audio') as HTMLAudioElement;
    audio.src = src;
    audio.load();
    audio.onerror = (error) => reject(error);
    audio.oncanplaythrough = () => {
      resolve(audio);
      audio.oncanplaythrough = null;
    };
  });
};
