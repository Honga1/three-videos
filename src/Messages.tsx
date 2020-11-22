export const ErrorMessage = ({ reason }: { reason: string }): React.ReactElement => {
  return <div className="Error">Error: {reason}</div>;
};

export const PromptMessage = ({ text }: { text: string }): React.ReactElement => {
  return <div className="Prompt">{text}</div>;
};

export const SuccessMessage = ({ text }: { text: string }): React.ReactElement => {
  return <div className="Success">Success: {text}</div>;
};
