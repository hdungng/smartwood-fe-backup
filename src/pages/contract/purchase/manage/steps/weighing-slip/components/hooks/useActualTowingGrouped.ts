import { DatePickerFormat } from 'utils';
import { useFormContext, useWatch } from 'react-hook-form';
import { ActualTowingFormProps, WeighingSlipFormProps } from '../../../../schema';
import { useMemo, useRef } from 'react';
import { getActualTowingGrouped } from '../cells';

export type ActualTowingGrouped = Record<
  string,
  Record<string, Record<string, Record<string, { rows: { total: number; date: DatePickerFormat }[] }>>>
>;

export type ActualTowingGroupedReturnType = {
  grouped: ActualTowingGrouped;
};

export const useActualTowingGrouped = (): ActualTowingGroupedReturnType => {
  const { control } = useFormContext<WeighingSlipFormProps>();
  const prevLengthRef = useRef(0);
  const cachedGroupedRef = useRef<ActualTowingGrouped>({});

  const actualTowing = useWatch({
    control,
    name: 'actualTowing'
  }) as ActualTowingFormProps[];

  const grouped = useMemo(() => {
    // Skip expensive recalculation if only length changed (during batch operations)
    if (actualTowing.length !== prevLengthRef.current) {
      const lengthDiff = Math.abs(actualTowing.length - prevLengthRef.current);
      
      // If large batch operation, skip recalculation temporarily
      if (lengthDiff > 10) {
        prevLengthRef.current = actualTowing.length;
        return cachedGroupedRef.current;
      }
    }
    
    prevLengthRef.current = actualTowing.length;
    const result = getActualTowingGrouped(actualTowing);
    cachedGroupedRef.current = result;
    return result;
  }, [actualTowing]);

  return {
    grouped
  };
};
