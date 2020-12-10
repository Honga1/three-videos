import React, { useEffect, useRef } from 'react';
import './ImageRecordedPreview.css';

type Props = {
  imageUrl: string;
};

export const ImageRecordedPreview = ({ imageUrl }: Props): React.ReactElement => {
  const ref = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.src = imageUrl;
  }, [imageUrl]);

  return (
    <div className="ImageRecordedPreview">
      <img alt="ImageRecordedPreview" ref={ref}></img>
    </div>
  );
};
