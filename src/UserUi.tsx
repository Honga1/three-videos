import React, { ReactElement } from 'react';
import { Permissions } from './Permissions';
import { useStore } from './Store';
import { VideoRecorder } from './VideoRecorder';
import { VideoStreamPreview } from './VideoStreamPreview';

import './UserUi.css';

export const UserUi = (): ReactElement => {
  const isPermissionGranted = useStore((state) => !!state.streams);
  const stream = useStore((state) => state.streams?.video);
  const isPlaybackReady = useStore((state) => state.isPlaybackReady);

  return (
    <>
      {!isPlaybackReady && (
        <div className="UserUi">
          {!isPermissionGranted && <Permissions />}
          {stream !== undefined && (
            <>
              <VideoRecorder stream={stream} duration={1} />
              <VideoStreamPreview stream={stream} />
            </>
          )}
        </div>
      )}
    </>
  );
};
