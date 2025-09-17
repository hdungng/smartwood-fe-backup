import { TableCell } from '@mui/material';
import { TableCellProps } from '@mui/material/TableCell';

export const ActualTowingCell = ({ index, children, ...otherProps }: TableCellProps & IndexProps) => {
  return (
    <TableCell
      {...otherProps}
      sx={{
        ...otherProps?.sx,
        padding: 1
      }}
      style={{
        ...otherProps?.style,
        verticalAlign: 'top'
      }}
    >
      {children}
    </TableCell>
  );
};
