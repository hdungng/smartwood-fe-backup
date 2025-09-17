import { Field } from 'forms';
import { getActualTowingPropertyName } from './utils';
import { ActualTowingCell } from './actual-towing-cell';
import { useConfiguration } from 'hooks';
import { CODE_QUALITY_TYPE } from 'constants/code';
import { useFormContext, useWatch } from 'react-hook-form';
import { WeighingSlipFormProps } from '../../../../schema';

const CoverageGoodTypeCell = ({ index }: IndexProps) => {
  const { mapConfigSelection } = useConfiguration();
  const goodTypeOptions = mapConfigSelection(CODE_QUALITY_TYPE);
  const { control } = useFormContext<WeighingSlipFormProps>();

  const saved = useWatch({
    control,
    name: getActualTowingPropertyName('saved', index)
  }) as boolean | undefined;

  return (
    <ActualTowingCell index={index} >
      <Field.Select
        name={getActualTowingPropertyName('coverageGoodType', index)}
        options={goodTypeOptions}
        placeholder="Chọn loại chất lượng"
        defaultOptionLabel="Chọn loại chất lượng"
        readOnly={saved}
      />
    </ActualTowingCell>
  );
};

export default CoverageGoodTypeCell;
