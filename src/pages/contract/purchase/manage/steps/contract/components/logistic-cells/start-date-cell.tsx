import { Field } from 'forms';
import React, { useMemo } from 'react';
import { useContractPurchaseManageContext } from '../../../../providers';
import { getLogisticPropertyName } from './utils';
import { LogisticCell } from './logistic-cell';
import { useFormContext, useWatch } from 'react-hook-form';
import { dateHelper, DatePickerControl } from 'utils';
import { LogisticFormProps } from '../../../../schema';

const currentDate = dateHelper.now();

const StartDateCell = ({ index }: IndexProps) => {
  const { fieldOnlyView, saleContract } = useContractPurchaseManageContext();
  const { control } = useFormContext<LogisticFormProps>();

  const hasWeightSlip = useWatch({
    control,
    name: getLogisticPropertyName('hasWeightSlip', index)
  }) as boolean | undefined;

  const endDate = useWatch({
    control,
    name: getLogisticPropertyName('endDate', index)
  }) as DatePickerControl | null;

  const hasConflictDate = useWatch({
    control,
    name: getLogisticPropertyName('hasConflict', index)
  }) as boolean | undefined;

  const maxDate = useMemo(
    () => (saleContract?.maxDateToBuy ? dateHelper.from(saleContract.maxDateToBuy) : endDate),
    [endDate, saleContract?.maxDateToBuy]
  );

  return (
    <LogisticCell index={index} sx={{ pb: hasConflictDate ? 0 : 1.5 }}>
      <Field.DatePicker
        name={getLogisticPropertyName('startDate', index)}
        error={hasConflictDate}
        minDate={dateHelper.addDay(currentDate, 1)}
        maxDate={maxDate}
        readOnly={fieldOnlyView || hasWeightSlip}
      />
    </LogisticCell>
  );
};

export default StartDateCell;
