import { ReactElement } from 'react';

import './Button.css';

export const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>): ReactElement => {
  return (
    <button className="Button" {...props}>
      {props.children}
    </button>
  );
};
