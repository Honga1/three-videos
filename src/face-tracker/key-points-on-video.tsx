import React from 'react';
import { VideoPartRenderer } from './video-part-renderer';

export const KeyPointsOnVideo = (): React.ReactElement => {
  return (
    <>
      <VideoPartRenderer
        parts={['FACE_PLANE', 'LEFT_EYE', 'RIGHT_EYE', 'MOUTH', 'NOSE']}
      ></VideoPartRenderer>
    </>
  );
};
