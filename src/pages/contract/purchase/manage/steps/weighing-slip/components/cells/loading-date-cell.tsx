import { ActualTowingCell } from './actual-towing-cell';
import { Field } from 'forms';
import { useCalculateActualTowingOptions } from '../hooks';
import { useContractPurchaseManageContext } from '../../../../providers';
import { getActualTowingPropertyName } from './utils';
import { useRangeDateActualTowing } from '../hooks';
import { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Dayjs } from 'dayjs';
import { WeighingSlipFormProps } from '../../../../schema';
import { dateHelper } from 'utils';

const LoadingDateCell = ({ index }: IndexProps) => {
  const { logistics } = useContractPurchaseManageContext();
  const { control, setValue } = useFormContext<WeighingSlipFormProps>();
  const hasSetDefault = useRef<boolean>(false)

  const saved = useWatch({
    control,
    name: getActualTowingPropertyName('saved', index)
  }) as boolean | undefined;

  const { logisticsAvailable } = useCalculateActualTowingOptions({
    logistics,
    index
  });

  const { maxDate, minDate } = useRangeDateActualTowing({
    index,
    logisticsAvailable
  });

  const selectedLoadingDate = useWatch({
    control,
    name: getActualTowingPropertyName('loadingDate', index)
  }) as Dayjs | null;

  useEffect(() => {
    if (!selectedLoadingDate && dateHelper.isValidDate(minDate) && dateHelper.isValidDate(maxDate) && !hasSetDefault.current) {
      const currentDate = dateHelper.now();
      if (dateHelper.formatIsBetween(currentDate, minDate, maxDate)) {
        setValue(getActualTowingPropertyName('loadingDate', index), currentDate, { shouldValidate: false });
      } else {
        setValue(getActualTowingPropertyName('loadingDate', index), minDate, { shouldValidate: false });
      }

      hasSetDefault.current = true;
    }
  }, [selectedLoadingDate, minDate, maxDate, hasSetDefault.current]);

  return (
    <ActualTowingCell index={index}>
      <Field.DatePicker
        name={getActualTowingPropertyName('loadingDate', index)}
        disabled={logisticsAvailable?.length === 0}
        minDate={minDate}
        maxDate={maxDate}
        readOnly={saved}
      />
    </ActualTowingCell>
  );
};

export default LoadingDateCell;