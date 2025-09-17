import { useFormContext, useWatch } from 'react-hook-form';
import { LogisticFormProps, LogisticItemFormProps } from '../../../schema';
import { useEffect, useMemo } from 'react';
import { getLogisticPropertyName } from './logistic-cells/utils';
import { numberHelper } from 'utils';

export const useInitializedRowWatcher = (index: number) => {
  const { control, setValue } = useFormContext<LogisticFormProps>();

  const currentRow = useWatch({
    control,
    name: `logistics.${index}`
  }) as LogisticItemFormProps;

  useEffect(() => {
    if (!currentRow) return;

    const { goodType, good, startDate, endDate, supplier, initialized } = currentRow || {};
    if (!goodType || !good?.value || !startDate || !endDate || !supplier?.value || initialized) return;

    setValue(getLogisticPropertyName('initialized', index), true, { shouldDirty: false });
  }, [currentRow]);

  useEffect(() => {
    if (currentRow?.initialized) return;

    const timer = setTimeout(() => {
      setValue(getLogisticPropertyName('initialized', index), true, { shouldDirty: false });
    }, 3 * 1_000);

    return () => clearTimeout(timer);
  }, [currentRow?.initialized]);

  return null;
};

export const useAllRowsInitialized = () => {
  const { control } = useFormContext<LogisticFormProps>();

  const logistics = useWatch({
    control,
    name: `logistics`
  }) as LogisticItemFormProps[];

  const initialized = useMemo(() => (logistics || []).every((x) => x.initialized), [logistics]);

  return {
    initialized
  };
};

export type ValidationError = {
  parentIndex: number;
  childrenIndexes: number[];
  parentRemainingQuantity: number;
  totalChildrenQuantity: number;
  exceedAmount: number;
};

export const useQuantityValidation = () => {
  const { control } = useFormContext<LogisticFormProps>();

  const logistics = useWatch({
    control,
    name: 'logistics'
  }) as LogisticItemFormProps[];

  const validationErrors = useMemo(() => {
    if (!logistics?.length) return [];

    const errors: ValidationError[] = [];

    const parentGroups = new Map<
      number,
      { parent: LogisticItemFormProps & { index: number }; children: (LogisticItemFormProps & { index: number })[] }
    >();

    logistics.forEach((item, index) => {
      if (!item.parentId) {
        if (!parentGroups.has(item.id!)) {
          parentGroups.set(item.id!, { parent: { ...item, index }, children: [] });
        } else {
          parentGroups.get(item.id!)!.parent = { ...item, index };
        }
      } else {
        // This is a child item
        if (!parentGroups.has(item.parentId)) {
          parentGroups.set(item.parentId, { parent: null as any, children: [] });
        }
        parentGroups.get(item.parentId)!.children.push({ ...item, index });
      }
    });

    parentGroups.forEach(({ parent, children }) => {
      if (!parent || children.length === 0) return;

      const totalChildrenQuantity = children.reduce((sum, child) => sum + (child.quantity || 0), 0);
      const parentDerivedQuantity = parent.quantity || 0;
      const parentActualQuantity = parent.actualQuantity || 0;
      const parentBaseQuantity = parentDerivedQuantity + totalChildrenQuantity;
      const parentRemainingQuantity = Math.max(0, parentBaseQuantity - parentActualQuantity);

      if (totalChildrenQuantity > parentRemainingQuantity) {
        errors.push({
          parentIndex: parent.index,
          childrenIndexes: children.map((child) => child.index),
          parentRemainingQuantity,
          totalChildrenQuantity,
          exceedAmount: totalChildrenQuantity - parentRemainingQuantity
        });
      }
    });

    return errors;
  }, [logistics]);

  const getErrorForIndex = (index: number): ValidationError | null => {
    return validationErrors.find((error) => error.parentIndex === index || error.childrenIndexes.includes(index)) || null;
  };

  return {
    validationErrors,
    hasValidationErrors: validationErrors.length > 0,
    getErrorForIndex
  };
};

export const useValidateQuantity = ({ index }: IndexProps) => {
  const { setValue } = useFormContext<LogisticFormProps>();
  const { getErrorForIndex } = useQuantityValidation();
  const validationError = getErrorForIndex(index);

  const helperText = useMemo(() => {
    if (!validationError) {
      return '';
    }

    const isParent = validationError.parentIndex === index;
    if (isParent) {
      return `Tổng số lượng con (${numberHelper.formatNumber(validationError.totalChildrenQuantity)} Kg) vượt quá số lượng còn lại (${numberHelper.formatNumber(validationError.parentRemainingQuantity)} Kg)`;
    } else {
      return `Tổng số lượng các phân bổ vượt quá ${numberHelper.formatNumber(validationError.exceedAmount)} Kg so với số lượng còn lại của cha`;
    }
  }, [validationError, index]);

  useEffect(() => {
    setValue(getLogisticPropertyName('hasOverQuantity', index), !!validationError);
  }, [validationError, index]);

  return {
    helperText
  };
};
