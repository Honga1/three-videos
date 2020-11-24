import React, { ReactElement } from 'react';
import { Api } from './Api';
import { StaticVideoLoader } from './StaticFileLoader';

import './DevUi.css';
import { VideosReadyDev } from './VideosReadyDev';
import { ApiUpTest } from './ApiUpTest';
import { Config } from './Config';
import { useStore } from './Store';

export const DevUi = (): ReactElement => {
  const apiUrl = useStore((state) => state.config.apiUrl);
  return (
    <div className="DevUi">
      <Config />
      <StaticVideoLoader />
      <ApiUpTest apiUrl={apiUrl} />
      <Api apiUrl={apiUrl} />
      <VideosReadyDev />
    </div>
  );
};
