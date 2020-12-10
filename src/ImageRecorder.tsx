import React, { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/Button';
import { NeutralMessage, PromptMessage, SuccessMessage } from './ui/Messages';
import { useStore } from './Store';

type Props = {
  stream: MediaStream;
  duration: number;
};

export const ImageRecorder = ({ stream, duration }: Props): React.ReactElement => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isRecording, setIsRecording] = useState(false);

  const setImageRecording = useStore((state) => state.setImageRecording);
  const recordImage = useMemo(() => getImageRecorder(stream), [stream]);

  const [uiState, setUiState] = useState<'prompt' | 'counting-down' | 'recorded'>('prompt');
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

      const { imageBlob: blob, imageUrl: url } = await recordImage();
      setUiState('recorded');
      setIsRecording(false);
      setImageRecording({ blob, url });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isRecording, setImageRecording, timeRemaining, recordImage]);

  const recordImageCountdown = () => {
    setTimeRemaining(duration);
    setUiState('counting-down');
    setIsRecording(true);
  };

  return (
    <div className="ImageRecorder">
      {uiState === 'prompt' && (
        <PromptMessage
          text={`Our AI needs to be trained. Say cheese in ${duration} seconds`}
        ></PromptMessage>
      )}
      {uiState === 'counting-down' && <NeutralMessage text={`${timeRemaining}s`}></NeutralMessage>}
      {uiState === 'recorded' && <SuccessMessage text={`Trained!`}></SuccessMessage>}
      {uiState !== 'counting-down' && <Button onClick={recordImageCountdown}>Record Image</Button>}
    </div>
  );
};

const getImageRecorder = (
  stream: MediaStream,
): (() => Promise<{
  imageBlob: Blob;
  imageUrl: string;
}>) => {
  const video = document.createElement('video') as HTMLVideoElement;
  const width = stream.getTracks()[0]?.getSettings().width || 1280;
  const height = stream.getTracks()[0]?.getSettings().height || 720;
  video.setAttribute('width', width + 'px');
  video.setAttribute('height', height + 'px');
  video.srcObject = stream;
  video.play();

  const canvas = document.createElement('canvas') as HTMLCanvasElement;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d')!;

  canvas.setAttribute('width', width + 'px');
  canvas.setAttribute('height', height + 'px');

  const recordImage = () =>
    new Promise<{ imageBlob: Blob; imageUrl: string }>(async (resolve) => {
      context.fillStyle = '#AAA';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL('image/png');
      const imageBlob = await getCanvasBlob(canvas);
      resolve({ imageBlob, imageUrl });
    });

  return recordImage;
};

function getCanvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>(function (resolve, reject) {
    canvas.toBlob(function (blob) {
      if (blob === null) {
        reject('Blob was not created successfully from image');
        return;
      }

      resolve(blob);
    });
  });
}
