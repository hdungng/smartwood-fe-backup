import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { LogisticFormProps } from '../../../schema';
import Alert from '@mui/material/Alert';
import { SelectionOption } from 'types/common';
import { SaleContractMetaData } from '../../../types';
import { numberHelper } from 'utils';
import { useLogisticStepContext } from '../../../providers';

const ErrorTotalWeight = () => {
  const { unitOfMeasure } = useLogisticStepContext();
  const { control, setValue } = useFormContext<LogisticFormProps>();
  const watchedSuppliers = useWatch<LogisticFormProps>({
    control,
    name: 'logistics'
  }) as LogisticFormProps['logistics'];

  const saleContractOption = useWatch({
    control,
    name: 'saleContract'
  }) as SelectionOption<SaleContractMetaData>;

  const totalWeight = useMemo(
    () => (watchedSuppliers || []).filter((x) => !x.parentId).reduce((acc, cur) => acc + Number(cur.quantity || 0), 0),
    [watchedSuppliers]
  );

  const maxWeightThresholdInKg = useMemo(() => {
    const unitSaleContractInKg = unitOfMeasure === 'TON' ? 1000 : 1;
    return (saleContractOption?.metadata?.weightThreshold || 0) * unitSaleContractInKg;
  }, [unitOfMeasure, saleContractOption]);

  const conditionRangeTotalWeight = useMemo(() => {
    if (!saleContractOption || !unitOfMeasure) return true;

    return totalWeight <= maxWeightThresholdInKg;
  }, [totalWeight, saleContractOption, maxWeightThresholdInKg, unitOfMeasure]);

  useEffect(() => {
    setValue('conditionRangeTotalWeight', conditionRangeTotalWeight);
  }, [conditionRangeTotalWeight]);

  useEffect(() => {
    setValue('totalWeight', totalWeight);
  }, [totalWeight]);

  if (conditionRangeTotalWeight) return null;

  return (
    <Alert severity="error" color="error" sx={{ height: 60, display: 'flex', alignItems: 'center' }}>
      Tổng trọng lượng hàng hóa vượt quá giới hạn cho phép ({numberHelper.formatNumber(totalWeight)} kg /{' '}
      {numberHelper.formatNumber(maxWeightThresholdInKg)} kg). Vui lòng kiểm tra lại.
    </Alert>
  );
};

export default ErrorTotalWeight;
