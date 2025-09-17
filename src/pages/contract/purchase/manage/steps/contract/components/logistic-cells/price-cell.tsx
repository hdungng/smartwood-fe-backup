import { Field } from 'forms';
import React from 'react';
import { getLogisticPropertyName } from './utils';
import { LogisticCell } from './logistic-cell';
import { useContractPurchaseManageContext } from '../../../../providers';
import { useFormContext, useWatch } from 'react-hook-form';
import { LogisticFormProps } from '../../../../schema';

const PriceCell = ({ index }: IndexProps) => {
  const { fieldOnlyView } = useContractPurchaseManageContext();
  const { control } = useFormContext<LogisticFormProps>();

  const hasWeightSlip = useWatch({
    control,
    name: getLogisticPropertyName('hasWeightSlip', index)
  }) as boolean | undefined;

  return (
    <LogisticCell index={index}>
      <Field.Number
        slotProps={{
          number: {
            decimalScale: 2
          },
          input: {
            endAdornment: <span>VND</span>
          }
        }}
        readOnly={fieldOnlyView || hasWeightSlip}
        name={getLogisticPropertyName('unitPrice', index)}
      />
    </LogisticCell>
  );
};

export default PriceCell;
