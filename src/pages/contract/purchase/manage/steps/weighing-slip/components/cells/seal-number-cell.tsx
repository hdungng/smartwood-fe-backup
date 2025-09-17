import { Field } from 'forms';
import { ActualTowingCell } from './actual-towing-cell';
import { getActualTowingPropertyName } from './utils';
import { useFormContext, useWatch } from 'react-hook-form';
import { WeighingSlipFormProps } from '../../../../schema';

type Props = IndexProps & {
  onAdd: VoidFunction;
};

const SealNumberCell = ({ index, onAdd }: Props) => {
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
      <Field.Text name={getActualTowingPropertyName('sealNumber', index)} placeholder="Nhập số chì" readOnly={saved} />
    </ActualTowingCell>
  );
};

export default SealNumberCell;
