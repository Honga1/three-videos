import { ChangeEvent, ReactElement } from 'react';
import { LabelledInput } from './ui/LabelledInput';
import { store } from './Store';

export const Config = (): ReactElement => {
  const onDurationChange = (event: ChangeEvent<HTMLInputElement>) => {
    const config = store.getState().config;
    const recordingDuration = parseInt(event.target.value, 10);

    store.setState({ config: { ...config, recordingDuration } });
  };

  const onApiUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const config = store.getState().config;
    const apiUrl = event.target.value;

    store.setState({ config: { ...config, apiUrl } });
  };
  return (
    <div className="Config">
      <LabelledInput
        label="Recording Duration:"
        name="recordingDuration"
        type="number"
        min={0}
        max={16}
        defaultValue={store.getState().config.recordingDuration}
        onChange={onDurationChange}
      ></LabelledInput>

      <LabelledInput
        label="API Url:"
        name="apiUrl"
        type="string"
        defaultValue={store.getState().config.apiUrl}
        onChange={onApiUrlChange}
      ></LabelledInput>
    </div>
  );
};
