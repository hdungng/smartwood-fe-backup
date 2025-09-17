import { useFormContext, useWatch } from 'react-hook-form';
import { LogisticItemFormProps, WeighingSlipFormProps } from '../../../../schema';
import { useEffect } from 'react';
import { SelectionOption } from 'types/common';
import { dateHelper, DatePickerControl, DatePickerFormat } from 'utils';
import { getActualTowingGrouped, getActualTowingPropertyName } from '../cells';

type WeightAndDateProps = IndexProps & {
  logisticsAvailable: LogisticItemFormProps[];
  selectedRegion?: string;
  selectedSupplier?: SelectionOption;
  selectedGood?: SelectionOption;
  selectedGoodType?: SelectionOption;
};

export const useCalculateMaxWeight = ({
  logisticsAvailable,
  selectedRegion,
  selectedSupplier,
  selectedGood,
  selectedGoodType,
  index
}: WeightAndDateProps) => {
  const { control, setValue, getValues } = useFormContext<WeighingSlipFormProps>();

  const selectedLoadingDate = useWatch({
    control,
    name: getActualTowingPropertyName('loadingDate', index)
  });

  useEffect(() => {
    if (!dateHelper.isValidDate(selectedLoadingDate as DatePickerFormat) || logisticsAvailable?.length === 0) {
      return;
    }

    let currentLogistic: LogisticItemFormProps | null = null;

    for (const logisticAvailable of logisticsAvailable) {
      const startDate = logisticAvailable.startDate as DatePickerControl;
      const endDate = logisticAvailable.endDate as DatePickerControl;

      const start = dateHelper.from(startDate);
      const end = dateHelper.from(endDate);
      const loadingDate = dateHelper.from(selectedLoadingDate as DatePickerFormat);

      const isValidDate = dateHelper.formatIsBetween(loadingDate, start, end);
      if (isValidDate) {
        currentLogistic = logisticAvailable;
        break;
      }
    }

    setValue(getActualTowingPropertyName('logistic', index), currentLogistic);
  }, [selectedLoadingDate, logisticsAvailable, index]);

  const currentLogistic = useWatch({
    control,
    name: getActualTowingPropertyName('logistic', index)
  }) as LogisticItemFormProps | undefined;

  useEffect(() => {
    setValue(getActualTowingPropertyName('goodPrice', index), currentLogistic?.unitPrice || null, {
      shouldValidate: false,
      shouldDirty: false,
      shouldTouch: false
    });
  }, [currentLogistic]);

  const actualWeight = useWatch({
    control,
    name: getActualTowingPropertyName('actualWeight', index)
  }) as number | undefined;

  useEffect(() => {
    if (!currentLogistic || actualWeight === null || actualWeight === undefined) return;

    const actualTowingGrouped = getActualTowingGrouped(getValues('actualTowing'));

    const currentActualTowing =
      actualTowingGrouped[selectedRegion || '']?.[selectedSupplier?.value || '']?.[selectedGood?.value || '']?.[selectedGoodType?.value || ''];

    const start = dateHelper.from(currentLogistic.startDate as DatePickerControl);
    const end = dateHelper.from(currentLogistic.endDate as DatePickerControl);

    const currentWeightInActualTowing = (currentActualTowing?.rows || [])
      .filter((row: any) => dateHelper.formatIsBetween(row.date, start, end))
      .reduce((acc, item) => {
        const actualWeight = item.total || 0;
        return acc + actualWeight;
      }, 0);

    const currentWeightInLogistics = currentLogistic.quantity || 0;
    const maxGoodWeight = currentWeightInLogistics - ((currentWeightInActualTowing || 0) - actualWeight);

    setValue(getActualTowingPropertyName('maxGoodWeight', index), maxGoodWeight, { shouldDirty: false });
  }, [currentLogistic, actualWeight, index]);

  const maxGoodWeight = useWatch({
    control,
    name: getActualTowingPropertyName('maxGoodWeight', index)
  }) as number | undefined;

  return {
    maxGoodWeight
  };
};
