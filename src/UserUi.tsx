import React, { ReactElement } from 'react';
import { Permissions } from './Permissions';
import { useStore } from './Store';
import { VideoRecorder } from './VideoRecorder';
import { VideoStreamPreview } from './ui/VideoStreamPreview';

import './UserUi.css';

export const UserUi = (): ReactElement => {
  const isPermissionGranted = useStore((state) => !!state.streams);
  const stream = useStore((state) => state.streams?.video);
  const isPlaybackReady = useStore((state) => state.isPlaybackReady);
  const recordingDuration = useStore((state) => state.config.recordingDuration);

  return (
    <>
      {!isPlaybackReady && (
        <div className="UserUi">
          {!isPermissionGranted && <Permissions />}
          {stream !== undefined && (
            <>
              <VideoRecorder stream={stream} duration={recordingDuration} />
              <VideoStreamPreview stream={stream} />
            </>
          )}
        </div>
      )}
    </>
  );
};
