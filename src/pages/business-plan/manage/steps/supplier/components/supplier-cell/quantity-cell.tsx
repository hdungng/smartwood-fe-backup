import { SupplierCell } from './cell';
import { Field } from 'forms';
import { useBusinessPlanManageContext } from '../../../../provider';
import { getSupplierPropertyName } from './utils';
import InputAdornment from '@mui/material/InputAdornment';
import { CODE_UNIT_OF_MEASURE } from 'constants/code';
import { useConfiguration } from 'hooks';

type Props = IndexProps;

const QuantityCell = ({ index }: Props) => {
  const { fieldOnlyView, businessPlan } = useBusinessPlanManageContext();
  const { mapConfigObject } = useConfiguration();

  return (
    <SupplierCell>
      <Field.Number
        slotProps={{
          number: {
            decimalScale: 4
          },
          input: {
            endAdornment: businessPlan?.draftPo?.unitOfMeasure && (
              <InputAdornment position="end">{mapConfigObject(CODE_UNIT_OF_MEASURE, businessPlan?.draftPo?.unitOfMeasure)}</InputAdornment>
            )
          }
        }}
        readOnly={fieldOnlyView}
        name={getSupplierPropertyName('quantity', index)}
      />
    </SupplierCell>
  );
};

export default QuantityCell;
