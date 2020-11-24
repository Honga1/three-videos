import React, { useCallback, useEffect, useState } from 'react';
import { SuccessMessage, ErrorMessage, NeutralMessage } from './ui/Messages';

let controller = new AbortController();
let signal = controller.signal;

function fetchStatusHandler(response: Response): Response {
  if (response.status === 200) {
    return response;
  } else {
    throw new Error(response.statusText);
  }
}

export const ApiUpTest = ({ apiUrl }: { apiUrl: string }): React.ReactElement => {
  const testApi = useCallback(async () => {
    try {
      const response = await fetch(apiUrl + '/three_videos_is_up', {
        method: 'POST',
        mode: 'cors',
        body: new FormData(),
        signal,
      }).then(fetchStatusHandler);
      const file = await response.blob();
      if (file.size <= 0) {
        throw new Error('API Failed. Did not get blob successfully');
      }
      setUiState('success');
    } catch (error) {
      setUiState('errorApi');
      console.error(error);
    }
  }, [apiUrl]);

  useEffect(() => {
    testApi();
    const interval = setInterval(async () => {
      controller.abort();
      controller = new AbortController();
      signal = controller.signal;
      await testApi();
    }, 10000);

    return () => clearInterval(interval);
  }, [testApi]);

  const [uiState, setUiState] = useState<'idle' | 'success' | 'errorApi'>('idle');

  return (
    <div className="Api">
      {uiState === 'idle' && <NeutralMessage text="Api test idle" />}
      {uiState === 'success' && <SuccessMessage text="Api is Up" />}
      {uiState === 'errorApi' && <ErrorMessage reason="Api is down" />}
    </div>
  );
};
