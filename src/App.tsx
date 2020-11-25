import React from 'react';
import './App.css';
import { AsyncVideos } from './AsyncVideos';
import { DevUi } from './DevUi';
import { useStore } from './Store';
import { UserUi } from './UserUi';

function App(): React.ReactElement {
  const startVideo = useStore((state) => state.staticFiles?.start);
  const endVideo = useStore((state) => state.staticFiles?.end);
  const fakedRecordingPromise = useStore((state) => state.fakedRecordingPromise);

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
