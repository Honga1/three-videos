import { ReactElement } from 'react';

import './LabelledSelect.css';

type Props = {
  label: string;
  options: [value: React.OptionHTMLAttributes<HTMLOptionElement>['value'], text: string][];
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;

export const LabelledSelect = (props: Props): ReactElement => {
  return (
    <div className="LabelledSelect">
      <label className="Label">
        <span>{props.label} </span>
        <select className="Select" {...props}>
          {props.options.map(([value, text], index) => (
            <option key={index} value={value}>
              {text}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};
