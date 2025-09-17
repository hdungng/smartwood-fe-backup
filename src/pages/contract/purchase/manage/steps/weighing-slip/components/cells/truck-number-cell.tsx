import { Field } from 'forms';
import { ActualTowingCell } from './actual-towing-cell';
import { getActualTowingPropertyName } from './utils';
import { useFormContext, useWatch } from 'react-hook-form';
import { WeighingSlipFormProps } from '../../../../schema';

const TruckNumberCell = ({ index }: IndexProps) => {
  const { control } = useFormContext<WeighingSlipFormProps>();

  const saved = useWatch({
    control,
    name: getActualTowingPropertyName('saved', index)
  }) as boolean | undefined;

  return (
    <ActualTowingCell index={index} >
      <Field.Text name={getActualTowingPropertyName('truckNumber', index)} placeholder="Nhập biển số xe" readOnly={saved} />
    </ActualTowingCell>
  );
};

export default TruckNumberCell;
