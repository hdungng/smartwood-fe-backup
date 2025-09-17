import { Field } from 'forms';
import { ActualTowingCell } from './actual-towing-cell';
import { getActualTowingPropertyName } from './utils';
import { useFormContext, useWatch } from 'react-hook-form';
import { WeighingSlipFormProps } from '../../../../schema';

const ContainerNumberCell = ({ index }: IndexProps) => {

  const { control } = useFormContext<WeighingSlipFormProps>();

  const saved = useWatch({
    control,
    name: getActualTowingPropertyName('saved', index)
  }) as boolean | undefined;

  return (
    <ActualTowingCell index={index} >
      <Field.Text name={getActualTowingPropertyName('containerNumber', index)} readOnly={saved} placeholder="Nhập số cont" />
    </ActualTowingCell>
  );
};

export default ContainerNumberCell;
