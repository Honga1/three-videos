import React, { useState } from 'react';
import { useStore } from './Store';
import { ErrorMessage, SuccessMessage as PromptMessage } from './Messages';

export const Permissions = (): React.ReactElement => {
  const isUserStreamOn = useStore((state) => state.isUserStreamOn);
  const setStreams = useStore((state) => state.setStreams);

  const [uiState, setUiState] = useState<
    'prompt' | 'accepted' | 'errorVideo' | 'errorAudio' | 'errorDisconnected'
  >(isUserStreamOn ? 'accepted' : 'prompt');

  if (uiState === 'accepted') {
  }

  if (isUserStreamOn && uiState !== 'accepted') {
    setUiState('accepted');
  }

  if (!isUserStreamOn && uiState === 'accepted') {
    setUiState('errorDisconnected');
  }

  const getStreams = async () => {
    const audio = await getAudioStream();
    const video = await getVideoStream();

    if (!audio) {
      setUiState('errorAudio');
      return;
    }

    if (!video) {
      setUiState('errorVideo');
      return;
    }

    setStreams({ audio, video });
  };

  return (
    <div className="Permissions">
      <PromptMessage
        text={
          'This is an interactive documentary. The interaction is provided via your microphone and webcam. Please enable this now.'
        }
      ></PromptMessage>

      <button onClick={getStreams}>Enable Webcam & Audio</button>

      {uiState === 'accepted' && <PromptMessage text={'Devices connected!'}></PromptMessage>}
      {uiState === 'errorAudio' && <ErrorMessage reason={'Could not get microphone.'} />}
      {uiState === 'errorVideo' && <ErrorMessage reason={'Could not get webcam.'} />}
      {uiState === 'errorDisconnected' && <ErrorMessage reason={'Devices disconnected.'} />}
    </div>
  );
};

async function getAudioStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    return stream;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

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
