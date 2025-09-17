import React, { useEffect, useMemo, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { LogisticFormProps, LogisticItemFormProps } from '../../../../schema';
import { getLogisticPropertyName } from './utils';

type Props = IndexProps;

const RemainingQuantityWatcher = ({ index }: Props) => {
  const { control, setValue } = useFormContext<LogisticFormProps>();

  const currentRow = useWatch({
    control,
    name: `logistics.${index}`
  }) as LogisticItemFormProps;

  const quantity = useWatch({
    control,
    name: getLogisticPropertyName('quantity', index)
  }) as number | undefined;

  const actualQuantity = useWatch({
    control,
    name: getLogisticPropertyName('actualQuantity', index)
  }) as number | undefined;

  const baseQuantity = useWatch({
    control,
    name: getLogisticPropertyName('baseQuantity', index)
  }) as number | undefined;

  const logistics = useWatch({
    control,
    name: 'logistics'
  }) as LogisticItemFormProps[];

  const childrenTotalQuantity = useMemo(() => {
    if (!currentRow || !!currentRow.parentId || !currentRow.id) return 0;
    return (logistics || []).filter((item) => item.parentId === currentRow.id).reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [logistics, currentRow?.id, currentRow?.parentId]);

  useEffect(() => {
    if (childrenTotalQuantity > 0) {
      setValue(getLogisticPropertyName('quantity', index), (baseQuantity || 0) - childrenTotalQuantity, { shouldDirty: false });
    }
  }, [baseQuantity, childrenTotalQuantity, setValue, index]);

  const remainingQuantity = useMemo(() => (quantity || 0) - (actualQuantity || 0), [quantity, actualQuantity]);

  useEffect(() => {
    setValue(getLogisticPropertyName('remainingQuantity', index), remainingQuantity, { shouldDirty: false });
    setValue(getLogisticPropertyName('isFilled', index), remainingQuantity === 0, { shouldDirty: false });
  }, [remainingQuantity, setValue, index]);

  return <></>;
};

export default RemainingQuantityWatcher;
