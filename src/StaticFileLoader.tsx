import { useEffect, useState } from 'react';
import { ErrorMessage, NeutralMessage as SuccessMessage } from './ui/Messages';
import { useStore } from './Store';

import videoSrcStart from './videos/1.mp4';
import videoSrcMiddle from './videos/2.mp4';
import videoSrcEnd from './videos/3.mp4';

export const StaticVideoLoader = (): React.ReactElement => {
  const isAlreadyLoaded = useStore((state) => !!state.staticVideos);
  const setStaticFiles = useStore((state) => state.setStaticVideos);

  const [uiState, setUiState] = useState<'notLoaded' | 'loading' | 'loaded' | 'error'>(
    isAlreadyLoaded ? 'loaded' : 'notLoaded',
  );
  useEffect(() => {
    if (isAlreadyLoaded) return;

    const loadVideos = async () => {
      setUiState('loading');

      try {
        const start = await (await fetch(videoSrcStart)).blob();
        const middle = await (await fetch(videoSrcMiddle)).blob();
        const end = await (await fetch(videoSrcEnd)).blob();
        setUiState('loaded');
        setStaticFiles(start, middle, end);
      } catch (error) {
        setUiState('error');
        console.error(error);
      }
    };

    loadVideos();
  }, [isAlreadyLoaded, setStaticFiles]);

  return (
    <div className="StaticFileLoader">
      {uiState === 'notLoaded' && <SuccessMessage text="Files not loaded" />}
      {uiState === 'loading' && <SuccessMessage text="Files loading" />}
      {uiState === 'loaded' && <SuccessMessage text="Files loaded!" />}
      {uiState === 'error' && <ErrorMessage reason="Files could not load" />}
    </div>
  );
};
