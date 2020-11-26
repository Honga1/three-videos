import React, { useState } from 'react';
import { useStore } from './Store';
import { ErrorMessage, PromptMessage } from './ui/Messages';
import { Button } from './ui/Button';

export const VideoPermissions = (): React.ReactElement => {
  const isVideoStreamOn = useStore((state) => !!state.videoStream);
  const setVideoStream = useStore((state) => state.setVideoStream);

  const [uiState, setUiState] = useState<
    'prompt' | 'accepted' | 'errorVideo' | 'errorDisconnected'
  >(isVideoStreamOn ? 'accepted' : 'prompt');

  if (uiState === 'accepted') {
  }

  if (isVideoStreamOn && uiState !== 'accepted') {
    setUiState('accepted');
  }

  if (!isVideoStreamOn && uiState === 'accepted') {
    setUiState('errorDisconnected');
  }

  const getStreams = async () => {
    const videoStream = await getVideoStream();

    if (!videoStream) {
      setUiState('errorVideo');
      return;
    }

    setVideoStream(videoStream);
  };

  return (
    <div className="Permissions">
      <PromptMessage
        text={
          'This is an interactive documentary. The interaction is provided via your microphone and webcam. Please enable this now.'
        }
      ></PromptMessage>

      <Button onClick={getStreams}>Enable Webcam</Button>

      {uiState === 'accepted' && <PromptMessage text={'Devices connected!'}></PromptMessage>}
      {uiState === 'errorVideo' && <ErrorMessage reason={'Could not get webcam.'} />}
      {uiState === 'errorDisconnected' && <ErrorMessage reason={'Devices disconnected.'} />}
    </div>
  );
};

async function getVideoStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, facingMode: 'user' },
      audio: false,
    });
    return stream;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
