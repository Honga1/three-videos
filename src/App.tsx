import React from 'react';
import './App.css';
import { ChainableAsyncVideos } from './ChainableAsyncVideos';
import { graphicToChainable } from './ChainableCanvas';
import { videoToChainable } from './ChainableComponent';
import { DevUi } from './DevUi';
import { FaceTracker } from './face-tracker/FaceTracker';
import { useStore } from './Store';
import { UserUi } from './UserUi';

function App(): React.ReactElement {
  const startVideo = useStore((state) => state.staticFiles?.start);
  const endVideo = useStore((state) => state.staticFiles?.end);
  const startAudio = useStore((state) => state.staticFiles?.soundOne);
  const fakedRecordingPromise = useStore((state) => state.fakedRecordingPromise);
  const stream = useStore((state) => state.videoStream);
  const detectorCanvas = useStore((state) => state.detectorCanvas);

  return (
    <div className="App">
      <div className="AppContents">
        {stream && <FaceTracker stream={stream} />}
        <UserUi />
        <DevUi />

        {!!startVideo && !!fakedRecordingPromise && !!endVideo && detectorCanvas && startAudio && (
          <ChainableAsyncVideos
            start={videoToChainable(startVideo)}
            tracking={graphicToChainable(detectorCanvas, startAudio)}
            middle={fakedRecordingPromise}
            end={videoToChainable(endVideo)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
