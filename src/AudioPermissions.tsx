import React, { useState } from 'react';
import { useStore } from './Store';
import { ErrorMessage, PromptMessage } from './ui/Messages';
import { Button } from './ui/Button';

export const AudioPermissions = (): React.ReactElement => {
  const isAudioStreamOn = useStore((state) => !!state.audioStream);
  const setStreamsAudioStream = useStore((state) => state.setAudioStream);

  const [uiState, setUiState] = useState<
    'prompt' | 'accepted' | 'errorAudio' | 'errorDisconnected'
  >(isAudioStreamOn ? 'accepted' : 'prompt');

  if (isAudioStreamOn && uiState !== 'accepted') {
    setUiState('accepted');
  }

  if (!isAudioStreamOn && uiState === 'accepted') {
    setUiState('errorDisconnected');
  }

  const getStreams = async () => {
    const audio = await getAudioStream();

    if (!audio) {
      setUiState('errorAudio');
      return;
    }

    setStreamsAudioStream(audio);
  };

  return (
    <div className="Permissions">
      <PromptMessage
        text={
          'This is an interactive documentary. The interaction is provided via your microphone and webcam. Please enable this now.'
        }
      ></PromptMessage>

      <Button onClick={getStreams}>Enable Microphone</Button>

      {uiState === 'accepted' && <PromptMessage text={'Devices connected!'}></PromptMessage>}
      {uiState === 'errorAudio' && <ErrorMessage reason={'Could not get microphone.'} />}
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
