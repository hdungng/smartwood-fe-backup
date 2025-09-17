import Button, { ButtonProps } from '@mui/material/Button';
import { KeyboardEvent } from 'react';

type Props = ButtonProps & {
  onEnter?: (event?: KeyboardEvent<HTMLButtonElement>) => void;
};

const CustomButton = ({ onEnter, ...otherProps }: Props) => {

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter') {
      otherProps?.type === 'submit' && event.currentTarget?.form?.requestSubmit();
      onEnter?.(event);
      return;
    }
  };

  return <Button {...otherProps} onKeyDown={handleKeyDown} />;
};

export default CustomButton;
