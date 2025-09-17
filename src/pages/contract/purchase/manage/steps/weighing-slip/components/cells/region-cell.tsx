import { Field } from 'forms';
import { ActualTowingCell } from './actual-towing-cell';
import { getActualTowingPropertyName } from './utils';
import { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { WeighingSlipFormProps } from '../../../../schema';
import { useCalculateActualTowingOptions } from '../hooks';
import { useContractPurchaseManageContext } from '../../../../providers';
import { ActualTowingMetaDataForMultiple } from '../../../../types';

type Props = IndexProps;

const RegionCell = ({ index }: Props) => {
  const { logistics } = useContractPurchaseManageContext();
  const { regionOptions } = useCalculateActualTowingOptions({ logistics, index });
  const { control, setValue } = useFormContext<WeighingSlipFormProps>();
  const hasSetDefault = useRef<boolean>(false);

  const saved = useWatch({
    control,
    name: getActualTowingPropertyName('saved', index)
  }) as boolean | undefined;

  const multiple = useWatch({
    control,
    name: getActualTowingPropertyName('multiple', index)
  }) as boolean;

  const selectedRegion = useWatch({
    control,
    name: getActualTowingPropertyName('region', index)
  }) as string | undefined;

  const defaultValueForMultiple = useWatch({
    control,
    name: getActualTowingPropertyName('defaultValueForMultiple', index)
  }) as ActualTowingMetaDataForMultiple;

  useEffect(() => {
    if (selectedRegion || regionOptions.length === 0 || hasSetDefault.current) return;

    if (multiple) {
      const defaultRegion = regionOptions.find((option) => option.value === defaultValueForMultiple.region);
      setValue(getActualTowingPropertyName('region', index), defaultRegion?.value || '');
      setValue(getActualTowingPropertyName('defaultValueForMultiple', index), {
        ...defaultValueForMultiple,
        region: undefined
      });
    } else {
      setValue(getActualTowingPropertyName('region', index), regionOptions[0]?.value || '');
    }

    hasSetDefault.current = true;
  }, [regionOptions, selectedRegion, hasSetDefault.current, multiple]);

  return (
    <ActualTowingCell index={index}>
      <Field.Select
        name={getActualTowingPropertyName('region', index)}
        options={regionOptions}
        defaultOptionLabel="Chọn khu vực"
        readOnly={saved}
      />
    </ActualTowingCell>
  );
};

export default RegionCell;
