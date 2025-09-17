import Grid from '@mui/material/Grid';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { CostDetailItemFormProps, CostFormProps } from '../../../schema';
import { Stack } from '@mui/material';
import { Field } from 'forms';
import { CostKeySection } from '../../../types';
import { useBusinessPlanManageContext } from '../../../provider';
import { useEffect } from 'react';
import { ItemCode } from 'services/business-plan';
import { useCostConversion } from './hook';

type OtherCostRowProps = {
  index: number;
};

const OtherCostRow = ({ index }: OtherCostRowProps) => {
  const { businessPlan, fieldOnlyView } = useBusinessPlanManageContext();

  const getProperName = (
    property: keyof CostDetailItemFormProps
  ): `${CostKeySection}.${'items'}.${number}.${keyof CostDetailItemFormProps}` => `other.items.${index}.${property}`;

  useCostConversion({
    from: {
      field: getProperName('amount')
    },
    to: {
      field: getProperName('amountConversion')
    },
    rate: businessPlan?.businessPlanTransactionInfoItem?.exchangeRateBuy || 0
  });

  return (
    <Grid key={`other-cost-item-${index}`} container size={12} spacing={1}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Field.Number
          readOnly={fieldOnlyView}
          name={getProperName('amount')}
          label="Giá (VND)"
          slotProps={{
            number: {
              decimalScale: 4
            }
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Field.Number
          readOnly={fieldOnlyView}
          name={getProperName('amountConversion')}
          label={`Giá (${businessPlan?.currency})`}
          slotProps={{
            number: {
              decimalScale: 4
            }
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Field.Text readOnly={fieldOnlyView} name={getProperName('unit')} label="Đơn vị" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Field.Text readOnly={fieldOnlyView} name={getProperName('notes')} label="Ghi chú" />
      </Grid>
    </Grid>
  );
};

const OtherCostContainer = () => {
  const { control } = useFormContext<CostFormProps>();
  const { fields: otherItems, append } = useFieldArray<CostFormProps>({
    control,
    name: 'other.items'
  });

  useEffect(() => {
    if (otherItems.length === 0) {
      append({
        itemCode: ItemCode.OtherCost,
        name: '',
        amount: 0,
        amountConversion: 0,
        unit: '',
        notes: '',
        isPercentage: false
      });
    }
  }, []);

  return (
    <Stack spacing={1}>
      {otherItems.map((item, index) => (
        <OtherCostRow key={item.id} index={index} />
      ))}
    </Stack>
  );
};

export default OtherCostContainer;
