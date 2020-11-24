import { ReactElement } from 'react';

import './LabelledInput.css';

type Props = {
  label: string;
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

export const LabelledInput = (props: Props): ReactElement => {
  return (
    <div className="LabelledInput">
      <label className="Label">
        <span>{props.label} </span>
        <input className="Input" {...props}>
          {props.children}
        </input>
      </label>
    </div>
  );
};
