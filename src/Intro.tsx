import { useState } from 'react';

export const Intro = (): React.ReactElement => {
  const [timeRemaining, setTimeRemaining] = useState(16);
  return (
    <div className="Intro">
      <div>
        This is an interactive documentary. The interaction is provided via your microphone and
        webcam. Please enable this now.
      </div>
      <button>Enable Webcam & Audio</button>
      <div>Please train our AI. Please look at your camera for: {Math.round(timeRemaining)}s</div>
    </div>
  );
};
