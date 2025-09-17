import { useFieldArray, useFormContext } from 'react-hook-form';
import { WeighingSlipFormProps } from '../../../../schema';
import { useCallback, useRef } from 'react';

/**
 * Optimized useFieldArray hook for better performance with large datasets
 * - Debounces rapid operations
 * - Batches multiple operations
 * - Reduces unnecessary re-renders during batch processing
 */
export const useOptimizedFieldArray = () => {
  const { control } = useFormContext<WeighingSlipFormProps>();
  const batchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const pendingOperationsRef = useRef<Array<{ type: 'prepend' | 'remove'; payload: any }>>([]);

  const fieldArray = useFieldArray({
    control,
    name: 'actualTowing'
  });

  // Optimized prepend with batching support
  const optimizedPrepend = useCallback(
    (items: any | any[]) => {
      const itemsArray = Array.isArray(items) ? items : [items];

      // For large batches, use immediate processing
      if (itemsArray.length > 20) {
        fieldArray.prepend(itemsArray);
        return;
      }

      // For smaller operations, use batching
      pendingOperationsRef.current.push({ type: 'prepend', payload: itemsArray });

      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }

      batchTimeoutRef.current = setTimeout(() => {
        const operations = pendingOperationsRef.current;
        pendingOperationsRef.current = [];

        if (operations.length === 0) return;

        // Combine all prepend operations
        const allPrependItems = operations.filter((op) => op.type === 'prepend').flatMap((op) => op.payload);

        if (allPrependItems.length > 0) {
          fieldArray.prepend(allPrependItems);
        }

        // Process remove operations
        operations.filter((op) => op.type === 'remove').forEach((op) => fieldArray.remove(op.payload));
      }, 50); // 50ms debounce
    },
    [fieldArray]
  );

  // Optimized remove with batching support
  const optimizedRemove = useCallback(
    (index: number | number[]) => {
      const indices = Array.isArray(index) ? index : [index];

      // For immediate single removes or large batches
      if (indices.length === 1 || indices.length > 10) {
        fieldArray.remove(index);
        return;
      }

      // Batch smaller operations
      indices.forEach((idx) => {
        pendingOperationsRef.current.push({ type: 'remove', payload: idx });
      });

      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }

      batchTimeoutRef.current = setTimeout(() => {
        const operations = pendingOperationsRef.current;
        pendingOperationsRef.current = [];

        // Process remove operations in reverse order to maintain indices
        const removeIndices = operations
          .filter((op) => op.type === 'remove')
          .map((op) => op.payload)
          .sort((a, b) => b - a); // Sort in descending order

        removeIndices.forEach((idx) => fieldArray.remove(idx));
      }, 50);
    },
    [fieldArray]
  );

  return {
    ...fieldArray,
    prepend: optimizedPrepend,
    remove: optimizedRemove
  };
};
