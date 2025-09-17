import React, { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { LogisticFormProps } from '../../../../schema';
import { getLogisticPropertyName } from './utils';
import { SelectionOption } from 'types/common';
import { dateHelper, DatePickerControl } from 'utils';
import { useContractPurchaseManageContext } from '../../../../providers';

type Props = IndexProps;

const ValidateDateWatcher = ({ index }: Props) => {
  const { selectedGoodId } = useContractPurchaseManageContext();
  const { control, setValue, setError } = useFormContext<LogisticFormProps>();

  const watchedItems = useWatch({
    control,
    name: 'logistics'
  }) as LogisticFormProps['logistics'];

  const selectedSupplier = useWatch({
    control,
    name: getLogisticPropertyName('supplier', index)
  }) as SelectionOption;

  const selectedRegion = useWatch({
    control,
    name: getLogisticPropertyName('region', index)
  }) as string;

  const selectedGoodType = useWatch({
    control,
    name: getLogisticPropertyName('goodType', index)
  }) as string;

  const startDate = useWatch({
    control,
    name: getLogisticPropertyName('startDate', index)
  }) as DatePickerControl | null;

  const endDate = useWatch({
    control,
    name: getLogisticPropertyName('endDate', index)
  }) as DatePickerControl | null;

  const hasConflictDate = useMemo(() => {
    const allRows = watchedItems || [];
    if (!startDate || !endDate || !selectedRegion || !selectedSupplier || selectedGoodId === 0 || !selectedGoodType) {
      return false;
    }

    return allRows.some((row, rowIndex) => {
      if (index === rowIndex || !row.startDate || !row.endDate || !row.region || !row.supplier || !row.good || !row.goodType) {
        return false;
      }

      const isSameItem =
        row.region === selectedRegion &&
        row.supplier.value === selectedSupplier.value &&
        row.good.value === selectedGoodId &&
        row.goodType === selectedGoodType;

      if (!isSameItem) {
        return false;
      }

      const currentStart = dateHelper.from(startDate as DatePickerControl);
      const currentEnd = dateHelper.from(endDate as DatePickerControl);
      const otherStart = dateHelper.from(row.startDate as DatePickerControl);
      const otherEnd = dateHelper.from(row.endDate as DatePickerControl);

      return currentStart <= otherEnd && currentEnd >= otherStart;
    });
  }, [watchedItems, startDate, endDate, selectedRegion, selectedSupplier, selectedGoodId, selectedGoodType, index]);

  useEffect(() => {
    setValue(getLogisticPropertyName('hasConflict', index), hasConflictDate, { shouldDirty: false });
  }, [hasConflictDate, setValue, index, setError]);

  return <></>;
};

export default ValidateDateWatcher;
