import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { SupplierFormProps } from '../../../../schema';
import { getSupplierPropertyName } from './utils';
import { SupplierCell } from './cell';
import { Typography } from '@mui/material';
import { numberHelper } from 'utils';

type Props = IndexProps;

const TotalAmountCell = ({ index }: Props) => {
  const { control } = useFormContext<SupplierFormProps>();

  const quantity = useWatch({
    control,
    name: getSupplierPropertyName('quantity', index)
  }) as number;

  const purchasePrice = useWatch({
    control,
    name: getSupplierPropertyName('purchasePrice', index)
  }) as number;

  const totalAmount = useMemo(() => quantity * purchasePrice, [quantity, purchasePrice]);

  return (
    <SupplierCell sx={{ p: 1, pt: 2.5 }}>
      <Typography
        sx={{
          color: '#1677ff'
        }}
        fontWeight="bold"
      >
        {numberHelper.formatNumber(totalAmount)} VND
      </Typography>
    </SupplierCell>
  );
};

export default TotalAmountCell;
