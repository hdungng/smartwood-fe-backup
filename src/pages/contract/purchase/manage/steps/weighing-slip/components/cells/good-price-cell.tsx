import { ActualTowingCell } from './actual-towing-cell';
import { Field } from 'forms';
import { getActualTowingPropertyName } from './utils';
import InputAdornment from '@mui/material/InputAdornment';
import { memo } from 'react';

const GoodPriceCell = ({ index }: IndexProps) => {
  return (
    <ActualTowingCell index={index}>
      <Field.Number
        name={getActualTowingPropertyName('goodPrice', index)}
        placeholder="Đơn Giá Hàng"
        disabled
        slotProps={{
          input: {
            endAdornment: <InputAdornment position="end">VND</InputAdornment>
          },
          number: {
            decimalScale: 2
          }
        }}
      />
    </ActualTowingCell>
  );
};

export default memo(GoodPriceCell, (prev, next) => prev.index === next.index);
