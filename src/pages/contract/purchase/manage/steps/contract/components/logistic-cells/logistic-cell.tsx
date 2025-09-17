import { TableCell } from '@mui/material';
import { TableCellProps } from '@mui/material/TableCell';
import { useFormContext, useWatch } from 'react-hook-form';
import { getLogisticPropertyName } from './utils';
import { LogisticFormProps } from '../../../../schema';
import Skeleton from '@mui/material/Skeleton';

export const LogisticCell = ({ index, children, ...otherProps }: TableCellProps & IndexProps) => {
  const { control } = useFormContext<LogisticFormProps>();

  const initialized = useWatch({
    control,
    name: getLogisticPropertyName('initialized', index)
  }) as boolean;

  return (
    <TableCell
      {...otherProps}
      sx={{
        p: 1,
        ...otherProps.sx
      }}
      style={{
        verticalAlign: 'top',
        ...otherProps.style
      }}
    >
      {initialized ? children : <Skeleton variant="rounded" height={40} animation="wave" width="auto" />}
    </TableCell>
  );
};
