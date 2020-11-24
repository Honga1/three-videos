import React, { ReactElement } from 'react';
import { Api } from './Api';
import { StaticVideoLoader } from './StaticFileLoader';

import './DevUi.css';
import { VideosReadyDev } from './VideosReadyDev';
import { ApiUpTest } from './ApiUpTest';

export const DevUi = (): ReactElement => {
  const apiUrl = process.env.API_URL || 'http://localhost:9000';
  return (
    <div className="DevUi">
      <StaticVideoLoader />
      <ApiUpTest apiUrl={apiUrl} />
      <Api apiUrl={apiUrl} />
      <VideosReadyDev />
    </div>
  );
};
