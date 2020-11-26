import React, { ReactElement } from 'react';
import { VideoPermissions } from './VideoPermissions';
import { useStore } from './Store';
import { VideoRecorder } from './VideoRecorder';
import { VideoStreamPreview } from './ui/VideoStreamPreview';

import './UserUi.css';

export const UserUi = (): ReactElement => {
  const isVideoPermissionGranted = useStore((state) => !!state.videoStream);
  const stream = useStore((state) => state.videoStream);
  const isPlaybackReady = useStore((state) => state.isPlaybackReady);
  const recordingDuration = useStore((state) => state.config.recordingDuration);

  return (
    <>
      {!isPlaybackReady && (
        <div className="UserUi">
          {!isVideoPermissionGranted && <VideoPermissions />}
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
