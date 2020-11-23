import React, { useEffect, useRef } from 'react';
import './VideoStreamPreview.css';

type Props = {
  stream: MediaStream;
};

export const VideoStreamPreview = ({ stream }: Props): React.ReactElement => {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="VideoStreamPreview">
      <video autoPlay={true} ref={ref}></video>
    </div>
  );
};
