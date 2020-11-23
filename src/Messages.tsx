import './Messages.css';

export const ErrorMessage = ({ reason }: { reason: string }): React.ReactElement => {
  return (
    <div className="Message ErrorMessage">
      <span>Error: {reason}</span>
    </div>
  );
};

export const PromptMessage = ({ text }: { text: string }): React.ReactElement => {
  return (
    <div className="Message PromptMessage">
      <span>{text}</span>
    </div>
  );
};

export const SuccessMessage = ({ text }: { text: string }): React.ReactElement => {
  return (
    <div className="Message SuccessMessage">
      <span>Success: {text}</span>
    </div>
  );
};

export const NeutralMessage = ({ text }: { text: string }): React.ReactElement => {
  return (
    <div className="Message NeutralMessage">
      <span>{text}</span>
    </div>
  );
};
