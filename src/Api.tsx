import React, { useEffect, useState } from 'react';
import { Button } from './ui/Button';
import { SuccessMessage, ErrorMessage, NeutralMessage, PromptMessage } from './ui/Messages';
import { useStore } from './Store';

export const Api = ({ apiUrl }: { apiUrl: string }): React.ReactElement => {
  const audioSource = useStore((state) => state.staticFiles?.middle);
  const destinationVideo = useStore((state) => state.recordings?.video);
  const resultVideo = useStore((state) => state.fakedRecording);
  const webcamScale = useStore((state) => state.config.webcamScale);

  const setFakedRecording = useStore((state) => state.setFakedRecording);
  const setFakedRecordingPromise = useStore((state) => state.setFakedRecordingPromise);

  const [uiState, setUiState] = useState<
    | 'awaitingAudioSource'
    | 'awaitingDestinationVideo'
    | 'prompt'
    | 'awaitingResult'
    | 'success'
    | 'errorApi'
    | 'errorSources'
  >(
    audioSource === undefined
      ? 'awaitingAudioSource'
      : destinationVideo === undefined
      ? 'awaitingDestinationVideo'
      : !!resultVideo
      ? 'success'
      : 'prompt',
  );

  useEffect(() => {
    const uiState =
      audioSource === undefined
        ? 'awaitingAudioSource'
        : destinationVideo === undefined
        ? 'awaitingDestinationVideo'
        : !!resultVideo
        ? 'success'
        : 'prompt';

    setUiState(uiState);
  }, [audioSource, destinationVideo, resultVideo]);

  const sendToApi = async () => {
    if (!audioSource || !destinationVideo) {
      console.error(
        `Not all sources are ready. source: ${audioSource}, destination: ${destinationVideo})`,
      );
      setUiState('errorSources');
      return;
    }

    const formData = new FormData();
    formData.append('image', destinationVideo.blob);
    formData.append('sound', audioSource);
    formData.append('webcamScale', webcamScale.toFixed(0));

    const fakedVideoPromise = new Promise<Blob>(async (resolve, reject) => {
      try {
        setUiState('awaitingResult');
        const response = await fetch(apiUrl + '/three_videos_demo', {
          method: 'POST',
          body: formData,
          mode: 'cors',
        });

        const video = await response.blob();
        setUiState('success');
        setFakedRecording(video);
        resolve(video);
      } catch (error) {
        setUiState('errorApi');
        console.error(error);
        reject(error);
      }
    });

    setFakedRecordingPromise(fakedVideoPromise);
  };

  return (
    <div className="Api">
      {uiState === 'awaitingAudioSource' && <NeutralMessage text="Awaiting audio source" />}
      {uiState === 'awaitingDestinationVideo' && (
        <NeutralMessage text="Awaiting destination video" />
      )}
      {uiState === 'prompt' && <PromptMessage text="Source and Destination ready to be faked" />}
      {!uiState.includes('awaiting') && <Button onClick={sendToApi}>Send to API</Button>}
      {uiState === 'awaitingResult' && <NeutralMessage text="Waiting for Api response" />}
      {uiState === 'success' && <SuccessMessage text="Got faked recording from Api" />}
      {uiState === 'errorApi' && <ErrorMessage reason="Could not fetch from Api" />}
      {uiState === 'errorSources' && <ErrorMessage reason="Souces are not ready" />}
    </div>
  );
};
