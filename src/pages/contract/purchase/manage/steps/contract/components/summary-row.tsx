import { TableCell, TableRow } from '@mui/material';
import Typography from '@mui/material/Typography';
import { numberHelper } from 'utils';
import { useFormContext, useWatch } from 'react-hook-form';
import { LogisticFormProps } from '../../../schema';
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

const SummaryRow = () => {
  const { control } = useFormContext<LogisticFormProps>();

  const logistics = useWatch<LogisticFormProps>({
    control,
    name: 'logistics'
  }) as LogisticFormProps['logistics'];

  const totalWeight = useMemo(() => (logistics || []).reduce((acc, cur) => acc + Number(cur.quantity || 0), 0), [logistics]);

  return (
    <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
      <TableCell
        colSpan={4}
        align="right"
        sx={{
          fontWeight: 'bold',
          borderTop: '2px solid #ddd'
        }}
      >
        <Typography fontWeight="bold">Tổng cộng: </Typography>
      </TableCell>
      <TableCell
        sx={{
          fontWeight: 'bold',
          borderTop: '2px solid #ddd'
        }}
      >
        <Typography
          sx={{
            color: '#1677ff'
          }}
          fontWeight="bold"
        >
          {numberHelper.formatNumber(totalWeight)} Kg
        </Typography>
      </TableCell>

      <TableCell colSpan={8} sx={{ borderTop: '2px solid #ddd' }} />
    </TableRow>
  );
};

export default SummaryRow;
