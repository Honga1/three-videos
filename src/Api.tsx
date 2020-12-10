import React, { useCallback, useEffect, useState } from 'react';
import { Button } from './ui/Button';
import { SuccessMessage, ErrorMessage, NeutralMessage, PromptMessage } from './ui/Messages';
import { useStore } from './Store';

export const Api = ({ apiUrl }: { apiUrl: string }): React.ReactElement => {
  const audioSource = useStore((state) => state.staticFiles?.middle);
  const destinationVideo = useStore((state) => state.recordings?.video);
  const destinationImage = useStore((state) => state.recordings?.image);
  const resultVideo = useStore((state) => state.fakedRecording);
  const webcamScale = useStore((state) => state.config.webcamScale);
  const isPhotoMode = useStore((state) => state.isPhotoMode);

  const setFakedRecording = useStore((state) => state.setFakedRecording);
  const setFakedRecordingPromise = useStore((state) => state.setFakedRecordingPromise);

  const reduceInitialState = useCallback(() => {
    if (audioSource === undefined) {
      return 'awaitingAudioSource';
    }

    if (isPhotoMode) {
      if (destinationImage === undefined) {
        return 'awaitingDestinationImage';
      }
    } else {
      if (destinationVideo === undefined) {
        return 'awaitingDestinationVideo';
      }
    }

    if (resultVideo !== undefined) {
      return 'success';
    }

    return 'prompt';
  }, [audioSource, destinationImage, destinationVideo, isPhotoMode, resultVideo]);

  const [uiState, setUiState] = useState<
    | 'awaitingAudioSource'
    | 'awaitingDestinationVideo'
    | 'awaitingDestinationImage'
    | 'prompt'
    | 'awaitingResult'
    | 'success'
    | 'errorApi'
    | 'errorSources'
  >(reduceInitialState);

  useEffect(() => {
    const uiState = reduceInitialState();

    setUiState(uiState);
  }, [reduceInitialState]);

  const sendToApi = async () => {
    if (!audioSource) {
      console.error('Audio source not yet ready');
      setUiState('errorSources');
      return;
    }

    if (!isPhotoMode && !destinationVideo) {
      console.error('Webcam video source not yet ready');
      setUiState('errorSources');
      return;
    }

    if (isPhotoMode && !destinationImage) {
      console.error('Webcam image source not yet ready');
      setUiState('errorSources');
      return;
    }

    const formData = new FormData();

    if (isPhotoMode) {
      formData.append('image', destinationImage!.blob);
    } else {
      formData.append('video', destinationVideo!.blob);
    }

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

        if (video.type !== 'video/mp4') {
          setUiState('errorApi');
          console.error('Response from server was not a video');
          reject('Response from server was not a video');
          return;
        }
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
      {uiState === 'awaitingDestinationImage' && (
        <NeutralMessage text="Awaiting destination image" />
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
