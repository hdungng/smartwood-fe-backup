import { Field } from 'forms';
import React, { useEffect, useState } from 'react';
import { useContractPurchaseManageContext, useLogisticStepContext } from '../../../../providers';
import { LogisticCell } from './logistic-cell';
import { getLogisticPropertyName } from './utils';
import { SelectionOption } from 'types/common';
import { useFormContext, useWatch } from 'react-hook-form';
import { LogisticFormProps, LogisticItemFormProps } from '../../../../schema';
import { Input } from 'components/@extended/input';
import { useConfiguration } from 'hooks';
import { CODE_QUALITY_TYPE } from '../../../../../../../../constants/code';

const GoodTypeCell = ({ index }: IndexProps) => {
  const { fieldOnlyView, selectedGoodId } = useContractPurchaseManageContext();
  const { onFetchGoodType } = useLogisticStepContext();
  const { mapConfigObject } = useConfiguration();
  const [goodTypeOptions, setGoodTypeOptions] = useState<SelectionOption[]>([]);

  const { control, setValue } = useFormContext<LogisticFormProps>();

  const hasWeightSlip = useWatch({
    control,
    name: getLogisticPropertyName('hasWeightSlip', index)
  }) as boolean | undefined;

  const defaultValueRow = useWatch({
    control,
    name: getLogisticPropertyName('defaultValue', index)
  }) as LogisticItemFormProps['defaultValue'];

  const selectedRegion = useWatch({
    control,
    name: getLogisticPropertyName('region', index)
  }) as string;

  const selectedSupplier = useWatch({
    control,
    name: getLogisticPropertyName('supplier', index)
  }) as SelectionOption;

  const selectedGoodType = useWatch({
    control,
    name: getLogisticPropertyName('goodType', index)
  }) as string;

  useEffect(() => {
    if (selectedGoodId === 0 || !selectedRegion || !selectedSupplier?.value || hasWeightSlip) return;

    (async () => {
      const goodTypes = await onFetchGoodType(selectedGoodId, selectedRegion, selectedSupplier.value as number);
      setGoodTypeOptions(goodTypes);
    })();
  }, [selectedGoodId, selectedRegion, selectedSupplier?.value, hasWeightSlip]);

  useEffect(() => {
    if (!defaultValueRow?.goodType || goodTypeOptions.length === 0 || hasWeightSlip) return;

    const defaultGoodType = goodTypeOptions.find((goodType) => goodType.value === defaultValueRow.goodType);
    setValue(getLogisticPropertyName('goodType', index), defaultGoodType?.value || '', { shouldValidate: false });
    setValue(getLogisticPropertyName('defaultValue', index), {
      ...defaultValueRow,
      goodType: null
    });
  }, [defaultValueRow?.goodType, goodTypeOptions, hasWeightSlip]);

  return (
    <LogisticCell index={index}>
      {hasWeightSlip ? (
        <Input.Text value={mapConfigObject(CODE_QUALITY_TYPE, selectedGoodType)} readOnly />
      ) : (
        <Field.Select
          readOnly={fieldOnlyView || hasWeightSlip}
          name={getLogisticPropertyName('goodType', index)}
          options={goodTypeOptions}
          defaultOptionLabel="Chọn loại chất lượng"
        />
      )}
    </LogisticCell>
  );
};

export default GoodTypeCell;
