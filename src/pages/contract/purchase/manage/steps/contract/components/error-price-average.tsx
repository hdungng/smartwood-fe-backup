import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import Alert from '@mui/material/Alert';
import { SelectionOption } from 'types/common';
import { SaleContractMetaData } from '../../../types';
import { numberHelper } from 'utils';
import { LogisticFormProps } from '../../../schema';

const ErrorPriceAverage = () => {
  const { control, setValue } = useFormContext<LogisticFormProps>();
  const saleContractOption = useWatch({
    control,
    name: 'saleContract'
  }) as SelectionOption<SaleContractMetaData>;

  const priceAverageInTon = useWatch({
    control,
    name: 'priceAverage'
  }) as number | undefined;

  const maxPriceAverage = useMemo(() => saleContractOption?.metadata?.breakEvenPrice || 0, [saleContractOption]);

  const hasConditionPriceAverage = useMemo(() => (priceAverageInTon || 0) <= maxPriceAverage, [priceAverageInTon, maxPriceAverage]);

  useEffect(() => {
    setValue('conditionPriceAverage', hasConditionPriceAverage);
  }, [hasConditionPriceAverage]);

  if (hasConditionPriceAverage) return null;

  return (
    <Alert severity="error" color="error" sx={{ height: 60, display: 'flex', alignItems: 'center' }}>
      Giá trung bình không được vượt quá giá hòa vốn của đơn hàng bán. Giá hòa vốn là {numberHelper.formatNumber(maxPriceAverage)} VND /{' '}
      Tấn.
    </Alert>
  );
};

export default ErrorPriceAverage;
