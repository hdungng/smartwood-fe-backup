import { Field } from 'forms';
import { ActualTowingCell } from './actual-towing-cell';
import { useContractPurchaseManageContext } from '../../../../providers';
import { getActualTowingPropertyName } from './utils';
import { useFormContext, useWatch } from 'react-hook-form';
import { WeighingSlipFormProps } from '../../../../schema';

type Props = IndexProps;

const CodeBookingCell = ({ index }: Props) => {
  const { codeBookingOptions } = useContractPurchaseManageContext();

  const { control } = useFormContext<WeighingSlipFormProps>();

  const saved = useWatch({
    control,
    name: getActualTowingPropertyName('saved', index)
  }) as boolean | undefined;

  return (
    <ActualTowingCell index={index} >
      <Field.Autocomplete
        name={getActualTowingPropertyName('codeBooking', index)}
        options={codeBookingOptions}
        placeholder="Chọn số/code booking"
        readOnly={saved}
      />
    </ActualTowingCell>
  );
};

export default CodeBookingCell;