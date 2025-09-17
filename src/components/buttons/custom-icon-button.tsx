import { KeyboardEvent, ReactNode } from 'react';
import { IconButtonProps } from '@mui/material/IconButton';
import { IconButton, Tooltip } from '@mui/material';
import { TooltipProps } from '@mui/material/Tooltip';

type Props = Omit<IconButtonProps, 'onClick' | 'children'> & {
  onClick: IconButtonProps['onClick'];
  icon: ReactNode;
  tooltip?: string;
  onEnter?: (event?: KeyboardEvent<HTMLButtonElement>) => void;
  slotProps?: {
    tooltip?: Omit<TooltipProps, 'title'>;
  };
};

const CustomIconButton = ({ tooltip, icon, onClick, onEnter, slotProps, ...otherProps }: Props) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter') {
      onEnter?.(event);
      return;
    }
  };

  const renderIconButton = (
    <IconButton {...otherProps} onClick={onClick} onKeyDown={handleKeyDown}>
      {icon}
    </IconButton>
  );

  if (!tooltip) {
    return renderIconButton;
  }

  return (
    <Tooltip {...slotProps?.tooltip} title={tooltip}>
      {renderIconButton}
    </Tooltip>
  );
};

export default CustomIconButton;
