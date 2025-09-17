import { TableCell } from '@mui/material';
import { TableCellProps } from '@mui/material/TableCell';

export const SupplierCell = ({ ...otherCell }: TableCellProps) => {
  return (
    <TableCell
      {...otherCell}
      sx={{
        ...otherCell?.sx,
        padding: 1
      }}
      style={{
        ...otherCell?.style,
        verticalAlign: 'top'
      }}
    />
  );
};
