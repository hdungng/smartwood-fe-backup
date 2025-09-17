import { useContractPurchaseManageContext } from '../../../../providers';
import { useCalculateActualTowingOptions } from '../hooks';
import { ActualTowingCell } from './actual-towing-cell';
import { Field } from 'forms';
import { getActualTowingPropertyName } from './utils';
import { useFormContext, useWatch } from 'react-hook-form';
import { WeighingSlipFormProps } from '../../../../schema';
import { useEffect, useRef } from 'react';
import { ActualTowingMetaDataForMultiple } from '../../../../types';
import { SelectionOption } from 'types/common';

const SupplierCell = ({ index }: IndexProps) => {
  const { logistics } = useContractPurchaseManageContext();
  const { supplierOptions } = useCalculateActualTowingOptions({ logistics, index });
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

  const selectedSupplier = useWatch({
    control,
    name: getActualTowingPropertyName('supplier', index)
  }) as SelectionOption | undefined;

  const defaultValueForMultiple = useWatch({
    control,
    name: getActualTowingPropertyName('defaultValueForMultiple', index)
  }) as ActualTowingMetaDataForMultiple;

  useEffect(() => {
    if (selectedSupplier || supplierOptions.length === 0 || hasSetDefault.current) return;

    if (multiple) {
      const defaultSupplier = supplierOptions.find((option) => option.value === defaultValueForMultiple.supplier);
      setValue(getActualTowingPropertyName('region', index), defaultSupplier || null);
      setValue(getActualTowingPropertyName('defaultValueForMultiple', index), {
        ...defaultValueForMultiple,
        supplier: undefined
      });
    } else {
      setValue(getActualTowingPropertyName('supplier', index), supplierOptions[0] || null);
    }

    hasSetDefault.current = true;
  }, [supplierOptions, selectedSupplier, hasSetDefault.current, multiple]);

  return (
    <ActualTowingCell index={index}>
      <Field.Autocomplete
        options={supplierOptions}
        name={getActualTowingPropertyName('supplier', index)}
        placeholder="Nhập tên xưởng/nha máy"
        disabled={!selectedRegion}
        readOnly={saved}
      />
    </ActualTowingCell>
  );
};

export default SupplierCell;
