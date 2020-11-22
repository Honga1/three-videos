import React from 'react';
import './App.css';
import { Permissions } from './Permissions';
import { Videos } from './Videos';

function App(): React.ReactElement {
  return (
    <div className="App">
      <div className="AppContents">
        <Permissions />
        {/* <Videos></Videos> */}
      </div>
    </div>
  );
}

export default App;
