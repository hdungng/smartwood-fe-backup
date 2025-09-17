import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { SupplierFormProps } from '../../../schema';
import { useBusinessPlanManageContext } from '../../../provider';
import Alert from '@mui/material/Alert';
import { numberHelper } from 'utils';
import { useConfiguration } from 'hooks';
import { CODE_UNIT_OF_MEASURE } from 'constants/code';

const PERCENT_WEIGHT_OVER = 5;

const ErrorTotalWeight = () => {
  const { mapConfigObject } = useConfiguration();
  const { businessPlan } = useBusinessPlanManageContext();
  const { control, setValue } = useFormContext<SupplierFormProps>();
  const watchedSuppliers = useWatch<SupplierFormProps>({
    control,
    name: 'suppliers'
  }) as SupplierFormProps['suppliers'];

  const totalWeight = useMemo(() => {
    const currentSuppliers = watchedSuppliers || [];
    return currentSuppliers.reduce((acc, cur) => acc + Number(cur.quantity || 0), 0);
  }, [watchedSuppliers]);

  const maxWeightThreshold = useMemo(() => {
    const totalDraftPoWeight = businessPlan?.draftPo?.quantity || 0;
    return totalDraftPoWeight + totalDraftPoWeight * (PERCENT_WEIGHT_OVER / 100);
  }, [businessPlan]);

  const minWeightThreshold = useMemo(() => {
    const totalDraftPoWeight = businessPlan?.draftPo?.quantity || 0;
    return totalDraftPoWeight - totalDraftPoWeight * (PERCENT_WEIGHT_OVER / 100);
  }, [businessPlan]);

  const conditionRangeTotalWeight = useMemo(
    () => totalWeight >= minWeightThreshold && totalWeight <= maxWeightThreshold,
    [totalWeight, maxWeightThreshold, minWeightThreshold, watchedSuppliers]
  );

  useEffect(() => {
    setValue('conditionRangeTotalWeight', conditionRangeTotalWeight);
  }, [conditionRangeTotalWeight]);

  if (conditionRangeTotalWeight || (watchedSuppliers || []).length === 0) return null;

  return (
    <Alert severity="error" color="error" sx={{ height: 60, display: 'flex', alignItems: 'center' }}>
      Tổng khối lượng cần nằm trong khoảng [{numberHelper.formatNumber(minWeightThreshold)} -{' '}
      {numberHelper.formatNumber(maxWeightThreshold)}] ({PERCENT_WEIGHT_OVER}% so với{' '}
      {numberHelper.formatNumber(businessPlan?.draftPo?.quantity)}{' '}
      {mapConfigObject(CODE_UNIT_OF_MEASURE, businessPlan?.draftPo?.unitOfMeasure)}). Vui lòng kiểm tra lại thông tin khối lượng.
    </Alert>
  );
};

export default ErrorTotalWeight;
