import { useFormContext, useWatch } from 'react-hook-form';
import { useMemo } from 'react';
import { ActualTowingFormProps, WeighingSlipFormProps } from '../../../../schema';

export const useAllRowsInitialized = () => {
  const { control } = useFormContext<WeighingSlipFormProps>();

  const actualTowing = useWatch({
    control,
    name: `actualTowing`
  }) as ActualTowingFormProps[];

  const initialized = useMemo(() => (actualTowing || []).every((x) => x.initialized), [actualTowing]);

  return {
    initialized
  };
};