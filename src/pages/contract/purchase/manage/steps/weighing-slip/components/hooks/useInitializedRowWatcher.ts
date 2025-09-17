import { useFormContext, useWatch } from 'react-hook-form';
import { ActualTowingFormProps, WeighingSlipFormProps } from '../../../../schema';
import { useEffect } from 'react';
import { getActualTowingPropertyName } from '../cells';
import { dateHelper } from 'utils';

export const useInitializedRowWatcher = (index: number) => {
  const { control, setValue } = useFormContext<WeighingSlipFormProps>();

  const currentRow = useWatch({
    control,
    name: `actualTowing.${index}`
  }) as ActualTowingFormProps;

  useEffect(() => {
    if (!currentRow) return;

    const { goodType, good, supplier, loadingDate, codeBooking, region, initialized } = currentRow || {};

    if (
      !goodType ||
      !good?.value ||
      !supplier?.value ||
      !codeBooking?.value ||
      !region ||
      !dateHelper.isValidDate(loadingDate) ||
      initialized
    )
      return;

    setValue(getActualTowingPropertyName('initialized', index), true);
  }, [currentRow]);

  return null;
};
