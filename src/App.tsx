import React from 'react';
import './App.css';
import { AsyncVideos } from './AsyncVideos';
import { DevUi } from './DevUi';
import { useStore } from './Store';
import { UserUi } from './UserUi';

function App(): React.ReactElement {
  const staticVideos = useStore((state) => state.staticVideos);
  const fakedRecordingPromise = useStore((state) => state.fakedRecordingPromise);

  return (
    <div className="App">
      <div className="AppContents">
        <UserUi />
        <DevUi />
        {!!staticVideos && !!fakedRecordingPromise && (
          <AsyncVideos
            start={staticVideos.start}
            middle={fakedRecordingPromise}
            end={staticVideos.end}
          />
        )}
      </div>
    </div>
  );
}

export default App;
