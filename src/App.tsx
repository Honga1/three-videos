import React from 'react';
import './App.css';
import { AsyncVideos } from './AsyncVideos';
import { DevUi } from './DevUi';
import { useStore } from './Store';
import { UserUi } from './UserUi';

function App(): React.ReactElement {
  const staticFiles = useStore((state) => state.staticFiles);
  const fakedRecordingPromise = useStore((state) => state.fakedRecordingPromise);

  return (
    <div className="App">
      <div className="AppContents">
        <UserUi />
        <DevUi />
        {!!staticFiles && !!fakedRecordingPromise && (
          <AsyncVideos
            start={staticFiles.start}
            middle={fakedRecordingPromise}
            end={staticFiles.end}
          />
        )}
      </div>
    </div>
  );
}

export default App;
