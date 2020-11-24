import React, { ReactElement } from 'react';
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
  return (
    <div className="DevUi">
      <Config />
      <StaticVideoLoader />
      <ApiUpTest apiUrl={apiUrl} />
      <Api apiUrl={apiUrl} />
      <VideosReadyDev />
      <Button onClick={store.getState().resetState}>Reset State</Button>
    </div>
  );
};
