import { useFieldArray, useFormContext } from 'react-hook-form';
import { WeighingSlipFormProps } from '../../../../schema';
import { useMemo, useCallback } from 'react';

export const useActualTowingFieldArray = () => {
  const { control } = useFormContext<WeighingSlipFormProps>();
  
  const fieldArrayResult = useFieldArray({
    control,
    name: 'actualTowing'
  });

  // Memoize callbacks to prevent child re-renders
  const memoizedPrepend = useCallback(
    (items: any) => fieldArrayResult.prepend(items),
    [fieldArrayResult.prepend]
  );

  const memoizedRemove = useCallback(
    (index: number | number[]) => fieldArrayResult.remove(index),
    [fieldArrayResult.remove]
  );

  const memoizedAppend = useCallback(
    (items: any) => fieldArrayResult.append(items),
    [fieldArrayResult.append]
  );

  const memoizedInsert = useCallback(
    (index: number, items: any) => fieldArrayResult.insert(index, items),
    [fieldArrayResult.insert]
  );

  const memoizedUpdate = useCallback(
    (index: number, items: any) => fieldArrayResult.update(index, items),
    [fieldArrayResult.update]
  );

  // Return memoized object to prevent unnecessary re-renders
  return useMemo(() => ({
    fields: fieldArrayResult.fields,
    prepend: memoizedPrepend,
    remove: memoizedRemove,
    append: memoizedAppend,
    insert: memoizedInsert,
    update: memoizedUpdate,
    swap: fieldArrayResult.swap,
    move: fieldArrayResult.move,
    replace: fieldArrayResult.replace
  }), [
    fieldArrayResult.fields,
    memoizedPrepend,
    memoizedRemove,
    memoizedAppend,
    memoizedInsert,
    memoizedUpdate,
    fieldArrayResult.swap,
    fieldArrayResult.move,
    fieldArrayResult.replace
  ]);
};