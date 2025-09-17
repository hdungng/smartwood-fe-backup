import { Field } from 'forms';
import { useContractPurchaseManageContext } from '../../../../providers';
import { useCalculateActualTowingOptions } from '../hooks';
import { useFormContext, useWatch } from 'react-hook-form';
import { WeighingSlipFormProps } from '../../../../schema';
import { getActualTowingPropertyName } from './utils';
import { SelectionOption } from 'types/common';
import { ActualTowingCell } from './actual-towing-cell';
import { useEffect, useRef } from 'react';

const GoodTypeCell = ({ index }: IndexProps) => {
  const { logistics } = useContractPurchaseManageContext();
  const { goodTypeOptions } = useCalculateActualTowingOptions({ logistics, index });
  const { control, setValue } = useFormContext<WeighingSlipFormProps>();
  const hasSetDefault = useRef<boolean>(false);
  const preSelectedSupplier = useRef<SelectionOption | undefined>(undefined);

  const saved = useWatch({
    control,
    name: getActualTowingPropertyName('saved', index)
  }) as boolean | undefined;

  const multiple = useWatch({
    control,
    name: getActualTowingPropertyName('multiple', index)
  }) as boolean;

  const selectedSupplier = useWatch({
    control,
    name: getActualTowingPropertyName('supplier', index)
  }) as SelectionOption | undefined;

  const selectedGoodType = useWatch({
    control,
    name: getActualTowingPropertyName('goodType', index)
  }) as SelectionOption | undefined;

  useEffect(() => {
    if (!selectedSupplier || goodTypeOptions.length === 0) return;

    if (selectedSupplier?.value !== preSelectedSupplier.current?.value) {
      setValue(getActualTowingPropertyName('goodType', index), goodTypeOptions[0]);
      preSelectedSupplier.current = selectedSupplier;
    }
  }, [selectedSupplier, goodTypeOptions]);

  useEffect(() => {
    if (selectedGoodType?.value || goodTypeOptions.length === 0 || hasSetDefault.current) return;

    if (!multiple) {
      setValue(getActualTowingPropertyName('goodType', index), goodTypeOptions[0] || null);
    }

    hasSetDefault.current = true;
  }, [selectedGoodType, goodTypeOptions, hasSetDefault.current, multiple]);

  return (
    <ActualTowingCell index={index}>
      <Field.Autocomplete
        options={goodTypeOptions}
        name={getActualTowingPropertyName('goodType', index)}
        disabled={!selectedSupplier}
        readOnly={saved}
        isOptionEqualToValue={(option, value) => option.value === value.value}
      />
    </ActualTowingCell>
  );
};

export default GoodTypeCell;
