import React, { ReactElement } from 'react';
import { Api } from './Api';
import { StaticVideoLoader } from './StaticFileLoader';

import './DevUi.css';
import { VideosReadyDev } from './VideosReadyDev';

export const DevUi = (): ReactElement => {
  return (
    <div className="DevUi">
      <StaticVideoLoader />
      <Api />
      <VideosReadyDev />
    </div>
  );
};
