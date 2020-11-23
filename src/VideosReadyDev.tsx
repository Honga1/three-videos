import { useEffect } from 'react';
import { ErrorMessage, SuccessMessage } from './Messages';
import { useStore } from './Store';

export const VideosReadyDev = (): React.ReactElement => {
  const maybeStaticVideos = useStore((state) => state.staticVideos);
  const maybeFakeRecording = useStore((state) => state.fakedRecording);
  const setPlaybackReadiness = useStore((state) => state.setPlaybackReadiness);

  useEffect(() => {
    if (!maybeStaticVideos || !maybeFakeRecording) {
      setPlaybackReadiness(false);
    } else {
      setPlaybackReadiness(true);
    }
  }, [maybeFakeRecording, maybeStaticVideos, setPlaybackReadiness]);

  if (!maybeStaticVideos) {
    return <ErrorMessage reason="Static videos not loaded"></ErrorMessage>;
  }
  if (!maybeFakeRecording) {
    return <ErrorMessage reason="Fake recording not received"></ErrorMessage>;
  }

  return <SuccessMessage text="Videos Ready"></SuccessMessage>;
};
