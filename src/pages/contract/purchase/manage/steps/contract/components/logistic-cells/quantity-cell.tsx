import { Field } from 'forms';
import InputAdornment from '@mui/material/InputAdornment';
import React, { useMemo } from 'react';
import { useContractPurchaseManageContext } from '../../../../providers';
import { getLogisticPropertyName } from './utils';
import { LogisticCell } from './logistic-cell';
import { useFormContext, useWatch } from 'react-hook-form';
import { LogisticFormProps } from '../../../../schema';
import { numberHelper } from 'utils';

const QuantityCell = ({ index }: IndexProps) => {
  const { fieldOnlyView } = useContractPurchaseManageContext();
  const { control } = useFormContext<LogisticFormProps>();

  const maxQuantity = useWatch({
    control,
    name: getLogisticPropertyName('maxQuantity', index)
  }) as number | undefined;

  const quantity = useWatch({
    control,
    name: getLogisticPropertyName('quantity', index)
  }) as number | undefined;

  const actualQuantity = useWatch({
    control,
    name: getLogisticPropertyName('actualQuantity', index)
  }) as number | undefined;

  const { min, max } = useMemo((): { min?: number, max?: number } => {
    if (!!maxQuantity) {
      return {
        min: 0,
        max: maxQuantity
      };
    }

    return {
      min: actualQuantity,
      max: undefined
    };
  }, [maxQuantity, actualQuantity, quantity]);

  const hasOverQuantity = useWatch({
    control,
    name: getLogisticPropertyName('hasOverQuantity', index)
  }) as boolean | undefined;

  return (
    <LogisticCell index={index}>
      <Field.Number
        slotProps={{
          number: {
            decimalScale: 4,
            min,
            max: (!!max ? Number(max) : undefined) as string | number | undefined
          },
          input: {
            endAdornment: <InputAdornment position="end">Kg</InputAdornment>
          }
        }}
        readOnly={fieldOnlyView}
        name={getLogisticPropertyName('quantity', index)}
        error={!!hasOverQuantity}
        helperText={!!maxQuantity && `Tối đa ${numberHelper.formatNumber(maxQuantity || 0)} Kg`}
      />
    </LogisticCell>
  );
};

export default QuantityCell;
