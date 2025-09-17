import { ActualTowingCell } from './actual-towing-cell';
import { Field } from 'forms';
import InputAdornment from '@mui/material/InputAdornment';
import { useContractPurchaseManageContext } from '../../../../providers';
import { useCalculateActualTowingOptions, useCalculateMaxWeight } from '../hooks';
import { getActualTowingPropertyName } from './utils';
import { memo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { WeighingSlipFormProps } from '../../../../schema';

type Props = IndexProps;

const ActualWeightCell = ({ index }: Props) => {
  const { logistics } = useContractPurchaseManageContext();
  const { control } = useFormContext<WeighingSlipFormProps>();

  const saved = useWatch({
    control,
    name: getActualTowingPropertyName('saved', index)
  }) as boolean | undefined;

  const { logisticsAvailable, selectedRegion, selectedSupplier, selectedGood, selectedGoodType } = useCalculateActualTowingOptions({
    logistics,
    index
  });

  useCalculateMaxWeight({
    index,
    logisticsAvailable,
    selectedRegion,
    selectedSupplier,
    selectedGood,
    selectedGoodType
  });

  return (
    <ActualTowingCell index={index}>
      <Field.Number
        required
        readOnly={saved}
        name={getActualTowingPropertyName('actualWeight', index)}
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

export default memo(ActualWeightCell, (prevProps, nextProps) => {
  return prevProps.index === nextProps.index;
});
