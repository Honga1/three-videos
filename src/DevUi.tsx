import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { Api } from './Api';
import { StaticFileLoader } from './StaticFileLoader';

import './DevUi.css';
import { VideosReadyDev } from './VideosReadyDev';
import { ApiUpTest } from './ApiUpTest';
import { Config } from './Config';
import { store, useStore } from './Store';
import { Button } from './ui/Button';
import { ImageRecordedPreview } from './ui/ImageRecordedPreview';

export const DevUi = (): ReactElement => {
  const apiUrl = useStore((state) => state.config.apiUrl);
  // TODO: Fix potential logic bug with maybe states always triggering a swap in view status. Likely out of scope for today's demo
  const [isDevUiShowing, setDevUiShowing] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuUpStyle = { transform: `translate(0, 0)`, opacity: '1' };
  const menuStartStyle = { transform: `translate(0, 0)`, opacity: '0' };
  const [menuDownStyle, setMenuDownStyle] = useState(menuStartStyle);

  const maybeImageRecorded = useStore((state) => state.recordings.image?.url);

  useEffect(() => {
    const maybeBottom = buttonRef.current?.getBoundingClientRect().bottom;
    if (maybeBottom) {
      const menuTranslation = `translate(0, ${window.innerHeight - maybeBottom}px)`;
      setMenuDownStyle({ transform: menuTranslation, opacity: '0' });
    }
  }, []);

  const toggleUi = () => {
    setDevUiShowing(!isDevUiShowing);
    const maybeBottom = buttonRef.current?.getBoundingClientRect().bottom;

    if (isDevUiShowing && maybeBottom) {
      const menuTranslation = `translate(0, ${window.innerHeight - maybeBottom}px)`;
      setMenuDownStyle({ transform: menuTranslation, opacity: '0' });
    } else {
      setMenuDownStyle(menuUpStyle);
    }
  };

  return (
    <div style={menuDownStyle} className={`DevUi`}>
      <Button ref={buttonRef} onClick={toggleUi}>
        {isDevUiShowing ? 'Hide' : 'Show'}
      </Button>
      {maybeImageRecorded && <ImageRecordedPreview imageUrl={maybeImageRecorded} />}
      <Config />
      <StaticFileLoader />
      <ApiUpTest apiUrl={apiUrl} />
      <Api autoSubmit={!isDevUiShowing} apiUrl={apiUrl} />
      <VideosReadyDev />
      <Button onClick={store.getState().resetState}>Reset State</Button>
    </div>
  );
};
