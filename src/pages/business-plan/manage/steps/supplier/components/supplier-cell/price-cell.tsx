import { SupplierCell } from './cell';
import { Field } from 'forms';
import { useBusinessPlanManageContext } from '../../../../provider';
import { getSupplierPropertyName } from './utils';
import InputAdornment from '@mui/material/InputAdornment';

type Props = IndexProps & {
  onAdd?: () => void;
};

const PriceCell = ({ index, onAdd }: Props) => {
  const { fieldOnlyView } = useBusinessPlanManageContext();

  return (
    <SupplierCell
      onKeyDown={(event) => {
        if (!fieldOnlyView && event.key === 'Enter') {
          onAdd?.();
        }
      }}
    >
      <Field.Number
        slotProps={{
          input: {
            endAdornment: <InputAdornment position="end">VND</InputAdornment>
          }
        }}
        readOnly={fieldOnlyView}
        name={getSupplierPropertyName('purchasePrice', index)}
      />
    </SupplierCell>
  );
};

export default PriceCell;
