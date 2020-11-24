import React, { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/Button';
import { NeutralMessage, PromptMessage, SuccessMessage } from './ui/Messages';
import { useStore } from './Store';

type Props = {
  stream: MediaStream;
  duration: number;
};

export const VideoRecorder = ({ stream, duration }: Props): React.ReactElement => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isRecording, setIsRecording] = useState(false);

  const setVideoRecording = useStore((state) => state.setVideoRecording);
  const videoRecorder = useMemo(() => getVideoRecorder(stream), [stream]);

  const [uiState, setUiState] = useState<'prompt' | 'recording' | 'recorded'>('prompt');
  useEffect(() => {
    if (isRecording) return;
    if (uiState === 'recorded') return;

    setUiState('prompt');
    setTimeRemaining(duration);
    setIsRecording(false);
  }, [isRecording, uiState, stream, duration]);

  useEffect(() => {
    if (!isRecording) return;
    const timeout = setTimeout(async () => {
      if (timeRemaining > 0) {
        setTimeRemaining(timeRemaining - 1);
        return;
      }

      const { videoBlob: blob, videoUrl: url } = await videoRecorder.stop();
      setUiState('recorded');
      setIsRecording(false);
      setVideoRecording({ blob, url });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isRecording, setVideoRecording, timeRemaining, videoRecorder]);

  const recordVideo = () => {
    setTimeRemaining(duration);
    setUiState('recording');
    setIsRecording(true);
    videoRecorder.start();
  };

  return (
    <div className="VideoRecorder">
      {uiState === 'prompt' && (
        <PromptMessage
          text={`Our AI needs to be trained. Please record ${duration} seconds of your webcam`}
        ></PromptMessage>
      )}
      {uiState === 'recording' && (
        <NeutralMessage text={`Recoding for another: ${timeRemaining}s`}></NeutralMessage>
      )}
      {uiState === 'recorded' && <SuccessMessage text={`Trained!`}></SuccessMessage>}
      {uiState !== 'recording' && <Button onClick={recordVideo}>Record Video</Button>}
    </div>
  );
};

type VideoRecorderResult = {
  start: () => void;
  stop: () => Promise<{
    videoBlob: Blob;
    videoUrl: string;
  }>;
};

const getVideoRecorder = (stream: MediaStream): VideoRecorderResult => {
  const options = { mimeType: 'video/webm; codecs=h264' };
  const mediaRecorder = new MediaRecorder(stream, options);
  const videoChunks: Blob[] = [];

  mediaRecorder.addEventListener('dataavailable', (event) => {
    videoChunks.push(event.data);
  });

  const start = () => {
    videoChunks.length = 0;
    mediaRecorder.start();
  };

  const stop = () =>
    new Promise<{ videoBlob: Blob; videoUrl: string }>((resolve) => {
      mediaRecorder.addEventListener('stop', () => {
        const videoBlob = new Blob(videoChunks, {
          type: 'video/webm',
        });
        const videoUrl = URL.createObjectURL(videoBlob);

        resolve({ videoBlob, videoUrl });
      });

      mediaRecorder.stop();
    });

  return { start, stop };
};
