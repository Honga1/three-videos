import React, { ReactElement, useRef, useState } from 'react';
import { Api } from './Api';
import { StaticVideoLoader } from './StaticFileLoader';

import './DevUi.css';
import { VideosReadyDev } from './VideosReadyDev';
import { ApiUpTest } from './ApiUpTest';
import { Config } from './Config';
import { store, useStore } from './Store';
import { Button } from './ui/Button';

export const DevUi = (): ReactElement => {
  const apiUrl = useStore((state) => state.config.apiUrl);
  const [isDevUiShowing, setDevUiShowing] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuUpStyle = { transform: `translate(0, 0)`, opacity: '1' };
  const [menuDownStyle, setMenuDownStyle] = useState(menuUpStyle);

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
      <Config />
      <StaticVideoLoader />
      <ApiUpTest apiUrl={apiUrl} />
      <Api apiUrl={apiUrl} />
      <VideosReadyDev />
      <Button onClick={store.getState().resetState}>Reset State</Button>
    </div>
  );
};
