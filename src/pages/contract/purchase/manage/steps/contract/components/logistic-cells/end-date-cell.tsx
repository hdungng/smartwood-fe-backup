import { Field } from 'forms';
import React, { useMemo } from 'react';
import { useContractPurchaseManageContext } from '../../../../providers';
import { getLogisticPropertyName } from './utils';
import { LogisticCell } from './logistic-cell';
import { useFormContext, useWatch } from 'react-hook-form';
import { dateHelper, DatePickerControl } from 'utils';
import { LogisticFormProps } from '../../../../schema';

type Props = IndexProps & {
  onAdd?: () => void;
};

const EndDateCell = ({ index, onAdd }: Props) => {
  const { fieldOnlyView, saleContract } = useContractPurchaseManageContext();
  const { control } = useFormContext<LogisticFormProps>();

  const hasWeightSlip = useWatch({
    control,
    name: getLogisticPropertyName('hasWeightSlip', index)
  }) as boolean | undefined;

  const startDate = useWatch({
    control,
    name: getLogisticPropertyName('startDate', index)
  }) as DatePickerControl | null;

  const hasConflictDate = useWatch({
    control,
    name: getLogisticPropertyName('hasConflict', index)
  }) as boolean | undefined;

  const endDate = useMemo(
    () => (saleContract?.maxDateToBuy ? dateHelper.from(saleContract.maxDateToBuy) : undefined),
    [saleContract?.maxDateToBuy]
  );

  return (
    <LogisticCell
      index={index}
      sx={{ pb: hasConflictDate ? 0 : 1.5 }}
      onKeyDown={(event) => {
        if (!fieldOnlyView && event.key === 'Enter') {
          onAdd?.();
        }
      }}
    >
      <Field.DatePicker
        name={getLogisticPropertyName('endDate', index)}
        error={hasConflictDate}
        minDate={startDate}
        maxDate={endDate}
        readOnly={fieldOnlyView || hasWeightSlip}
      />
    </LogisticCell>
  );
};

export default EndDateCell;
