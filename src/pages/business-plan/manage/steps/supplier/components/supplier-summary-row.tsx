import { TableCell, TableRow } from '@mui/material';
import Typography from '@mui/material/Typography';
import { COLUMN_WIDTHS } from '../constants';
import { numberHelper } from 'utils';
import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { SupplierFormProps } from '../../../schema';
import { useBusinessPlanManageContext } from '../../../provider';
import { useConfiguration } from 'hooks';
import { CODE_UNIT_OF_MEASURE } from 'constants/code';

const SupplierSummaryRow = () => {
  const { businessPlan, fieldOnlyView } = useBusinessPlanManageContext();
  const { control } = useFormContext<SupplierFormProps>();
  const { mapConfigObject } = useConfiguration();
  
  const watchedSuppliers = useWatch({
    control,
    name: 'suppliers'
  }) as SupplierFormProps['suppliers'];

  const totalWeight = useMemo(() => {
    const currentSuppliers = watchedSuppliers || [];
    return currentSuppliers.reduce((acc, cur) => acc + Number(cur.quantity || 0), 0);
  }, [watchedSuppliers]);

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
          borderTop: '2px solid #ddd',
          width: COLUMN_WIDTHS.quantity
        }}
      >
        <Typography
          sx={{
            color: '#1677ff'
          }}
          fontWeight="bold"
        >
          {numberHelper.formatNumber(totalWeight)} {mapConfigObject(CODE_UNIT_OF_MEASURE, businessPlan?.draftPo?.unitOfMeasure)}
        </Typography>
      </TableCell>

      <TableCell colSpan={fieldOnlyView ? 2 : 3} sx={{ borderTop: '2px solid #ddd' }} />
    </TableRow>
  )
}

export default SupplierSummaryRow;