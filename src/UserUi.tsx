import React, { ReactElement } from 'react';
import { ImageRecorder } from './ImageRecorder';
import { useStore } from './Store';
import { VideoStreamPreview } from './ui/VideoStreamPreview';
import './UserUi.css';
import { VideoPermissions } from './VideoPermissions';
import { VideoRecorder } from './VideoRecorder';

export const UserUi = (): ReactElement => {
  const isVideoPermissionGranted = useStore((state) => !!state.videoStream);
  const stream = useStore((state) => state.videoStream);
  const isPlaybackReady = useStore((state) => state.isPlaybackReady);
  const recordingDuration = useStore((state) => state.config.recordingDuration);
  const isPhotoMode = useStore((state) => state.isPhotoMode);

  return (
    <>
      {!isPlaybackReady && (
        <div className="UserUi">
          {!isVideoPermissionGranted && <VideoPermissions />}
          {stream !== undefined && (
            <>
              {isPhotoMode ? (
                <ImageRecorder stream={stream} duration={recordingDuration} />
              ) : (
                <VideoRecorder stream={stream} duration={recordingDuration} />
              )}
              <VideoStreamPreview stream={stream} />
            </>
          )}
        </div>
      )}
    </>
  );
};
