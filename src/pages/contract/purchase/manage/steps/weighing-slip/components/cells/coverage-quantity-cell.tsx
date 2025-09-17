import { Field } from 'forms';
import { getActualTowingPropertyName } from './utils';
import { ActualTowingCell } from './actual-towing-cell';
import InputAdornment from '@mui/material/InputAdornment';
import { useFormContext, useWatch } from 'react-hook-form';
import { WeighingSlipFormProps } from '../../../../schema';

type Props = IndexProps & {
  onAdd: VoidFunction;
};

const CoverageGoodTypeCell = ({ index, onAdd }: Props) => {
  const { control } = useFormContext<WeighingSlipFormProps>();

  const saved = useWatch({
    control,
    name: getActualTowingPropertyName('saved', index)
  }) as boolean | undefined;

  return (
    <ActualTowingCell
      index={index}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !saved) {
          onAdd?.();
        }
      }}
    >
      <Field.Number
        name={getActualTowingPropertyName('coverageQuantity', index)}
        placeholder="Nhập số lượng hàng phủ"
        readOnly={saved}
        slotProps={{
          number: {
            decimalScale: 4
          },
          input: {
            endAdornment: <InputAdornment position="end">Kg</InputAdornment>
          }
        }}
      />
    </ActualTowingCell>
  );
};

export default CoverageGoodTypeCell;
