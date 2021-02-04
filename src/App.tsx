import React from 'react';
import './App.css';
import { ChainableAsyncVideos } from './ChainableAsyncVideos';
import { graphicToChainablePromise } from './ChainableCanvas';
import { videoToChainable } from './ChainableComponent';
import { DevUi } from './DevUi';
import { BlazeFace } from './face-tracker/BlazeFace';
import { useStore } from './Store';
import { UserUi } from './UserUi';

function App(): React.ReactElement {
  const startVideo = useStore((state) => state.staticFiles?.start);
  const endVideo = useStore((state) => state.staticFiles?.end);
  const startAudio = useStore((state) => state.staticFiles?.soundOne);
  const fakedRecordingPromise = useStore((state) => state.fakedRecordingPromise);
  const stream = useStore((state) => state.videoStream);
  const detectorCanvas = useStore((state) => state.detectorCanvas);

  console.log(stream);
  return (
    <div className="App">
      <div className="AppContents">
        {/* {!stream && <VideoPermissions />} */}
        {stream && <BlazeFace stream={stream} />}
        <UserUi />
        <DevUi />

        {!!startVideo && !!fakedRecordingPromise && !!endVideo && detectorCanvas && startAudio && (
          <ChainableAsyncVideos
            start={videoToChainable(startVideo)}
            tracking={graphicToChainablePromise(detectorCanvas, startAudio)}
            middle={fakedRecordingPromise}
            end={videoToChainable(endVideo)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
