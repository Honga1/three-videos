import React from 'react';
import './App.css';
import { AsyncVideos } from './AsyncVideos';
import { ChainableAsyncVideos } from './ChainableAsyncVideos';
import { videoToChainable } from './ChainableComponent';
import { DevUi } from './DevUi';
import { FaceTracker } from './face-tracker/FaceTracker';
import { useStore } from './Store';
import { UserUi } from './UserUi';

function App(): React.ReactElement {
  const startVideo = useStore((state) => state.staticFiles?.start);
  const endVideo = useStore((state) => state.staticFiles?.end);
  const fakedRecordingPromise = useStore((state) => state.fakedRecordingPromise);
  // const stream = useStore((state) => state.videoStream);
  // const tracking = useStore((state) => state.detectorVideo);

  return (
    <div className="App">
      <div className="AppContents">
        <UserUi />
        <DevUi />

        {!!startVideo && !!fakedRecordingPromise && !!endVideo && (
          <AsyncVideos start={startVideo} middle={fakedRecordingPromise} end={endVideo} />
        )}
      </div>
    </div>
  );
}

export default App;
