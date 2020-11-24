import { forwardRef } from 'react';

import './Button.css';

export const Button = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  (props, ref) => {
    return (
      <button ref={ref} className="Button" {...props}>
        {props.children}
      </button>
    );
  },
);
