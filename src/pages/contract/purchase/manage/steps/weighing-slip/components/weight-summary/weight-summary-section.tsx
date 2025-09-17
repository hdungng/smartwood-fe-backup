import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { ActualTowingFormProps, WeighingSlipFormProps } from '../../../../schema';
import WeightSummaryItem, { WeightSummaryItemProps } from './weight-summary-item';
import Divider from '@mui/material/Divider';
import { useEffect, useMemo } from 'react';
import { dateHelper, DatePickerFormat } from 'utils';

const WeightSummarySection = () => {
  const { control, setValue } = useFormContext<WeighingSlipFormProps>();

  const actualTowing = useWatch({
    control,
    name: 'actualTowing'
  }) as ActualTowingFormProps[];

  // Grouping the actual towing data region, supplier, good, goodType, min date, max date and summary actual weight and coverage quantity to use lodash groupBy
  const groupedActualTowing = useMemo(
    () =>
      actualTowing.reduce((acc: Record<string, WeightSummaryItemProps>, item) => {
        if (!item.region || !item.goodType || !item.minLoadingDate || !item.maxLoadingDate || !item.supplier?.value || !item.logistic) {
          return acc;
        }

        const minDate = dateHelper.formatDate(item.logistic.startDate as DatePickerFormat);
        const maxDate = dateHelper.formatDate(item.logistic.endDate as DatePickerFormat);
        const supplierId = (item.supplier?.value || 0) as number;

        const key = `${item.region}-${supplierId}-${item.good?.value}-${item.goodType.value}-${minDate}-${maxDate}-${item.logistic?.quantity}`;
        if (!acc[key]) {
          acc[key] = {
            region: item.region,
            supplierId,
            goodType: `${item.goodType.value}`,
            minDate,
            maxDate,
            totalWeight: item.logistic?.quantity || 0,
            currentWeight: 0,
            hasOverWeight: false
          };
        }
        acc[key].currentWeight += (item.actualWeight || 0) + (item.coverageQuantity || 0);
        acc[key].hasOverWeight = acc[key].currentWeight > (item.logistic?.quantity || 0);
        return acc;
      }, {}),
    [actualTowing]
  );

  useEffect(() => {
    if( Object.keys(groupedActualTowing).length > 0) {
      const hasOverWeight = Object.values(groupedActualTowing).some(item => item.hasOverWeight);
      setValue('hasOverWeight', hasOverWeight, { shouldDirty: true });
    }
  }, [groupedActualTowing]);

  if(actualTowing?.length === 0) return null;

  return (
    <Stack bgcolor="#f8f9fa" borderRadius={2} spacing={2} p={2} width="100%">
      <Typography variant="body1" fontWeight={800}>
        Tổng quan kéo hàng
      </Typography>

      <Stack spacing={1} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
        {Object.keys(groupedActualTowing).map((item) => (
          <WeightSummaryItem key={item} {...groupedActualTowing[item]} />
        ))}
      </Stack>
    </Stack>
  );
};

export default WeightSummarySection;
