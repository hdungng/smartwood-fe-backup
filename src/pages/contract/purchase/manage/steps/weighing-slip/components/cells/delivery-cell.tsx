import { Field } from 'forms';
import { ActualTowingCell } from './actual-towing-cell';
import { getActualTowingPropertyName } from './utils';
import { useGlobal } from 'contexts';
import { useFormContext, useWatch } from 'react-hook-form';
import { WeighingSlipFormProps } from '../../../../schema';

const DeliveryCell = ({ index }: IndexProps) => {
  const { shippingUnitOptions } = useGlobal();
  const { control } = useFormContext<WeighingSlipFormProps>();

  const saved = useWatch({
    control,
    name: getActualTowingPropertyName('saved', index)
  }) as boolean | undefined;

  return (
    <ActualTowingCell index={index}>
      <Field.Autocomplete
        options={shippingUnitOptions}
        name={getActualTowingPropertyName('delivery', index)}
        placeholder="Chọn đơn vị vận chuyển"
        isOptionEqualToValue={(option, value) => option.value === value.value}
        readOnly={saved}
      />
    </ActualTowingCell>
  );
};

export default DeliveryCell;
