import { useFormContext } from 'react-hook-form';
import { LogisticItemFormProps, WeighingSlipFormProps } from '../../../../schema';
import { useEffect, useMemo } from 'react';
import { SelectionOption } from 'types/common';
import { dateHelper, DatePickerControl, DatePickerFormat } from 'utils';
import { ActualTowingGrouped } from './useActualTowingGrouped';
import { getActualTowingPropertyName } from '../cells';

type WeightAndDateProps = IndexProps & {
  logisticsAvailable: LogisticItemFormProps[];
};

export const useRangeDateActualTowing = ({ logisticsAvailable, index }: WeightAndDateProps) => {
  const { setValue } = useFormContext<WeighingSlipFormProps>();

  const { minDate, maxDate } = useMemo(() => {
    return logisticsAvailable.reduce(
      (acc, item) => {
        if (!item.startDate || !item.endDate) {
          return acc;
        }

        const startDate = dateHelper.from(item.startDate as DatePickerControl);
        const endDate = dateHelper.from(item.endDate as DatePickerControl);

        if (!acc.minDate || startDate.isBefore(acc.minDate)) {
          acc.minDate = startDate;
        }

        if (!acc.maxDate || endDate.isAfter(acc.maxDate)) {
          acc.maxDate = endDate;
        }

        return acc;
      },
      { minDate: null as DatePickerFormat | null, maxDate: null as DatePickerFormat | null }
    );
  }, [logisticsAvailable]);

  useEffect(() => {
    setValue(getActualTowingPropertyName('maxLoadingDate', index), maxDate, { shouldDirty: true });
    setValue(getActualTowingPropertyName('minLoadingDate', index), minDate, { shouldDirty: true });
  }, [minDate, maxDate]);

  return {
    minDate,
    maxDate
  };
};
