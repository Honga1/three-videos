import React from 'react';
import './App.css';
import { DevUi } from './DevUi';
import { SequentialVideos } from './SequentialVideos';
import { useStore } from './Store';
import { UserUi } from './UserUi';

function App(): React.ReactElement {
  const staticVideos = useStore((state) => state.staticVideos);
  const fakedRecording = useStore((state) => state.fakedRecording);

  return (
    <div className="App">
      <div className="AppContents">
        <UserUi />
        <DevUi />
        {!!staticVideos && !!fakedRecording && (
          <SequentialVideos
            start={staticVideos.start}
            middle={fakedRecording}
            end={staticVideos.end}
          />
        )}
      </div>
    </div>
  );
}

export default App;
