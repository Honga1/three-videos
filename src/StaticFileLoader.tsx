import { useEffect, useState } from 'react';
import { ErrorMessage, NeutralMessage, SuccessMessage } from './ui/Messages';
import { useStore } from './Store';

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
        const start = await loadVideo('videos/1.mp4');
        const middle = await loadAudio('videos/2.wav');
        const end = await loadVideo('videos/3.mp4');
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
    const blob = await (await fetch(src)).blob();
    const video = document.createElement('video') as HTMLVideoElement;
    video.src = URL.createObjectURL(blob);
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
