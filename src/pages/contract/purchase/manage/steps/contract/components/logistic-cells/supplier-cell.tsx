import { Field } from 'forms';
import React, { useEffect, useState, useRef } from 'react';
import { LogisticCell } from './logistic-cell';
import { getLogisticPropertyName } from './utils';
import { SelectionOption } from 'types/common';
import { useFormContext, useWatch } from 'react-hook-form';
import { LogisticFormProps, LogisticItemFormProps } from '../../../../schema';
import { useContractPurchaseManageContext, useLogisticStepContext } from '../../../../providers';
import { Input } from 'components/@extended/input';

const SupplierCell = ({ index }: IndexProps) => {
  const { fieldOnlyView, selectedGoodId } = useContractPurchaseManageContext();
  const { onFetchSupplier } = useLogisticStepContext();
  const [supplierOptions, setSupplierOptions] = useState<SelectionOption[]>([]);
  const previousValuesRef = useRef<{ selectedGoodId: number; selectedRegion: string }>({ 
    selectedGoodId: 0, 
    selectedRegion: '' 
  });

  const { control, setValue } = useFormContext<LogisticFormProps>();

  const hasWeightSlip = useWatch({
    control,
    name: getLogisticPropertyName('hasWeightSlip', index)
  }) as boolean | undefined;

  const selectedRegion = useWatch({
    control,
    name: getLogisticPropertyName('region', index)
  }) as string;

  const selectedSupplier = useWatch({
    control,
    name: getLogisticPropertyName('supplier', index)
  }) as SelectionOption | null;

  const defaultValueRow = useWatch({
    control,
    name: getLogisticPropertyName('defaultValue', index)
  }) as LogisticItemFormProps['defaultValue'];

  useEffect(() => {
    if (!selectedRegion || selectedGoodId === 0 || hasWeightSlip) return;

    const hasGoodIdChanged = previousValuesRef.current.selectedGoodId !== selectedGoodId;
    const hasRegionChanged = previousValuesRef.current.selectedRegion !== selectedRegion;

    (async () => {
      const suppliers = await onFetchSupplier(selectedGoodId, selectedRegion);
      setSupplierOptions(suppliers);

      if (hasGoodIdChanged || hasRegionChanged) {
        setValue(getLogisticPropertyName('supplier', index), null as Dynamic);
        setValue(getLogisticPropertyName('goodType', index), null as Dynamic);
      }

      previousValuesRef.current = { selectedGoodId, selectedRegion };
    })();
  }, [selectedRegion, selectedGoodId, hasWeightSlip]);

  useEffect(() => {
    if (!defaultValueRow?.supplier || supplierOptions.length === 0 || hasWeightSlip) return;

    const defaultSupplier = supplierOptions.find((supplier) => supplier.value === defaultValueRow.supplier);

    setValue(getLogisticPropertyName('supplier', index), (defaultSupplier || null) as SelectionOption, { shouldValidate: false });
    setValue(getLogisticPropertyName('defaultValue', index), {
      ...defaultValueRow,
      supplier: null
    });
  }, [supplierOptions, defaultValueRow?.supplier, hasWeightSlip]);

  return (
    <LogisticCell index={index}>
      {hasWeightSlip ? (
        <Input.Text value={selectedSupplier?.label} readOnly />
      ) : (
        <Field.Autocomplete
          name={getLogisticPropertyName('supplier', index)}
          options={supplierOptions}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          readOnly={fieldOnlyView || hasWeightSlip}
        />
      )}
    </LogisticCell>
  );
};

export default SupplierCell;
