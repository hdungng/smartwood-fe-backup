import { Field } from 'forms';
import React, { useEffect, useRef } from 'react';
import { useContractPurchaseManageContext, useLogisticStepContext } from '../../../../providers';
import { LogisticCell } from './logistic-cell';
import { getLogisticPropertyName } from './utils';
import { SelectionOption } from 'types/common';
import { LogisticFormProps } from '../../../../schema';
import { useFormContext, useWatch } from 'react-hook-form';
import { Input } from 'components/@extended/input';
import { useConfiguration } from '../../../../../../../../hooks';
import { CODE_REGION } from '../../../../../../../../constants/code';

type Props = IndexProps;

const RegionCell = ({ index }: Props) => {
  const { fieldOnlyView, selectedGoodId } = useContractPurchaseManageContext();
  const { onFetchRegion } = useLogisticStepContext();
  const [regionOptions, setRegionOptions] = React.useState<SelectionOption[]>([]);
  const { mapConfigObject } = useConfiguration();
  const previousSelectedGoodIdRef = useRef<number>(0);

  const { control } = useFormContext<LogisticFormProps>();

  const hasWeightSlip = useWatch({
    control,
    name: getLogisticPropertyName('hasWeightSlip', index)
  }) as boolean | undefined;

  const selectedRegion = useWatch({
    control,
    name: getLogisticPropertyName('region', index)
  }) as string | undefined;

  useEffect(() => {
    if (selectedGoodId === 0 || hasWeightSlip) return;

    const hasGoodIdChanged = previousSelectedGoodIdRef.current !== selectedGoodId;

    if (hasGoodIdChanged) {
      (async () => {
        const suppliers = await onFetchRegion(selectedGoodId);
        setRegionOptions(suppliers);
        previousSelectedGoodIdRef.current = selectedGoodId;
      })();
    }
  }, [selectedGoodId, hasWeightSlip]);

  return (
    <LogisticCell index={index}>
      {hasWeightSlip ? (
        <Input.Text value={mapConfigObject(CODE_REGION, selectedRegion)} readOnly />
      ) : (
        <Field.Select
          readOnly={fieldOnlyView || hasWeightSlip}
          name={getLogisticPropertyName('region', index)}
          options={regionOptions}
          defaultOptionLabel="Chọn khu vực"
        />
      )}
    </LogisticCell>
  );
};

export default React.memo(RegionCell);
