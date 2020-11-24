import { useEffect } from 'react';
import { ErrorMessage, SuccessMessage } from './ui/Messages';
import { useStore } from './Store';

export const VideosReadyDev = (): React.ReactElement => {
  const maybeStaticVideos = useStore((state) => state.staticVideos);
  const maybeFakeRecordingPromise = useStore((state) => state.fakedRecordingPromise);
  const setPlaybackReadiness = useStore((state) => state.setPlaybackReadiness);

  useEffect(() => {
    if (!maybeStaticVideos || !maybeFakeRecordingPromise) {
      setPlaybackReadiness(false);
    } else {
      setPlaybackReadiness(true);
    }
  }, [maybeFakeRecordingPromise, maybeStaticVideos, setPlaybackReadiness]);

  if (!maybeStaticVideos) {
    return <ErrorMessage reason="Static videos not loaded"></ErrorMessage>;
  }
  if (!maybeFakeRecordingPromise) {
    return <ErrorMessage reason="Fake recording not received"></ErrorMessage>;
  }

  return <SuccessMessage text="Videos Ready"></SuccessMessage>;
};
