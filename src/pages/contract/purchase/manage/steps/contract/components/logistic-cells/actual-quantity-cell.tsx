import InputAdornment from '@mui/material/InputAdornment';
import React from 'react';
import { getLogisticPropertyName } from './utils';
import { LogisticCell } from './logistic-cell';
import { useFormContext, useWatch } from 'react-hook-form';
import { LogisticFormProps } from '../../../../schema';
import { Input } from 'components/@extended/input';

const ActualQuantityCell = ({ index }: IndexProps) => {
  const { control } = useFormContext<LogisticFormProps>();

  const actualQuantity = useWatch({
    control,
    name: getLogisticPropertyName('actualQuantity', index)
  }) as number | undefined;

  return (
    <LogisticCell index={index}>
      <Input.Number
        slotProps={{
          number: {
            decimalScale: 4
          },
          input: {
            endAdornment: <InputAdornment position="end">Kg</InputAdornment>
          }
        }}
        value={actualQuantity}
        readOnly
      />
    </LogisticCell>
  );
};

export default ActualQuantityCell;
