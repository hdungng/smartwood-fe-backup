import { useBusinessPlanManageContext } from '../../../provider';
import { FieldValues, useFormContext, useWatch, FieldPath } from 'react-hook-form';
import { CostDetailItemFormProps, CostFormProps, OptionalCostDetailItemFormProps } from '../../../schema';
import { analysisService, GetSummaryAnalysisBusinessPlanResponse } from 'services/analysis';
import { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import { calculateAmountConversionCostManagement, calculateLocalCharges, ITEM_CODE_CONFIGS, ItemCodeConfigProps } from '../../../utils';
import { BusinessPlanCostExtendData, ItemCode } from 'services/business-plan';
import { CostKeySection } from '../../../types';

export const useCalculateAnalysis = () => {
  const { businessPlan } = useBusinessPlanManageContext();
  const { control } = useFormContext<CostFormProps>();
  const [summary, setSummary] = useState<GetSummaryAnalysisBusinessPlanResponse | undefined>(undefined);

  const customs = useWatch({
    control,
    name: 'customs.items'
  }) as CostDetailItemFormProps[];

  const finance = useWatch({
    control,
    name: 'finance.items'
  }) as CostDetailItemFormProps[];

  const management = useWatch({
    control,
    name: 'management.items'
  }) as CostDetailItemFormProps[];

  const logistics = useWatch({
    control,
    name: 'logistics.items'
  }) as CostDetailItemFormProps[];

  const other = useWatch({
    control,
    name: 'other.items'
  }) as CostDetailItemFormProps[];

  const convertToPayload = (items: CostDetailItemFormProps[]) =>
    (items || []).map((item) => ({
      amount: item.isPercentage ? item.percentage || 0 : item.amount || 0,
      itemCode: item.itemCode
    }));

  const handleFetchSummary = useCallback(async () => {
    if (!businessPlan?.id) return;

    const response = await analysisService.getSummaryBusinessPlan({
      id: businessPlan.id,
      customs: convertToPayload(customs),
      finance: convertToPayload(finance),
      logistics: convertToPayload(logistics),
      management: convertToPayload(management),
      other: convertToPayload(other)
    });

    setSummary(response?.data || undefined);
  }, [businessPlan?.id, customs, finance, logistics, management, other]);

  const debouncedFetchSummary = useMemo(() => debounce(handleFetchSummary, 300), [handleFetchSummary]);

  useEffect(() => {
    debouncedFetchSummary();

    return () => {
      debouncedFetchSummary.cancel();
    };
  }, [debouncedFetchSummary]);

  return {
    summary
  };
};

type FieldSettingCostConversion<T extends FieldValues> = {
  field: FieldPath<T>;
  disabledConversion?: boolean;
  factor?: number;
};

type UseCostConversionProps<T extends FieldValues> = {
  from: FieldSettingCostConversion<T>;
  to: FieldSettingCostConversion<T>;
  rate: number;
  timeout?: number;
};

export const useCostConversion = <T extends FieldValues>({ rate, to, from, timeout = 100 }: UseCostConversionProps<T>) => {
  const { control, setValue } = useFormContext<T>();

  const { field: fieldA, disabledConversion: fieldADisabledConversion = false, factor: factorA = 1 } = from;

  const { field: fieldB, disabledConversion: fieldBDisabledConversion = false, factor: factorB = 1 } = to;

  const updating = useRef({ [fieldA]: false, [fieldB]: false });

  const watchedFieldA = useWatch({
    control,
    name: fieldA
  });

  const watchedFieldB = useWatch({
    control,
    name: fieldB
  });

  // Calculate conversion from fieldB to fieldA
  useEffect(() => {
    if (updating.current[fieldA] || typeof watchedFieldA !== 'number' || rate <= 0 || fieldADisabledConversion) {
      return;
    }

    updating.current[fieldB] = true;
    const newValue = (watchedFieldA / rate / (factorA || 1)) as any;
    setValue(fieldB, newValue, { shouldDirty: true });
    const timer = setTimeout(() => {
      updating.current[fieldB] = false;
    }, timeout);

    return () => clearTimeout(timer);
  }, [watchedFieldA, rate, fieldADisabledConversion, setValue, fieldB, timeout, factorA]);

  // Calculate conversion from fieldA to fieldB
  useEffect(() => {
    if (updating.current[fieldB] || typeof watchedFieldB !== 'number' || rate <= 0 || fieldBDisabledConversion) {
      return;
    }

    updating.current[fieldA] = true;
    const newValue = (watchedFieldB * rate * (factorB || 1)) as any;
    setValue(fieldA, newValue, { shouldDirty: true });
    const timer = setTimeout(() => {
      updating.current[fieldA] = false;
    }, timeout);

    return () => clearTimeout(timer);
  }, [watchedFieldB, rate, fieldBDisabledConversion, setValue, fieldA, timeout, factorB]);
};

export const useSubmitState = () => {
  const {
    formState: { isValid, dirtyFields }
  } = useFormContext<CostFormProps>();

  const itemCategories: (keyof CostFormProps)[] = ['customs', 'finance', 'management', 'logistics', 'other'];

  const hasDirtyAndValidItem = itemCategories.some((categoryKey) => {
    const dirtyCategoryItems = get(dirtyFields, `${categoryKey}.items`);
    if (!Array.isArray(dirtyCategoryItems)) {
      return false;
    }

    const dirtyByCategory = dirtyCategoryItems.some((dirtyItem, index) => {
      if (!dirtyItem) {
        return false;
      }

      const dirtyKeys = Object.keys(dirtyItem);

      // TODO: Cần liệt kê các field với index để kiểm tra
      return (
        (dirtyKeys.length >= 1 && categoryKey !== 'finance' && dirtyKeys.includes('amount')) ||
        (categoryKey === 'finance' &&
          (([2, 3].includes(index) && dirtyKeys.includes('amount')) || ([0, 1, 4, 5].includes(index) && dirtyKeys.includes('percentage'))))
      );
    });

    return dirtyByCategory;
  });

  const isEnabled = isValid && hasDirtyAndValidItem;

  return {
    hasFieldChanged: hasDirtyAndValidItem,
    isEnabled
  };
};

const VAT_RATE = 8;

type UseCostFormulatorsProps = {
  sectionKey: CostKeySection;
  costItem: CostDetailItemFormProps | OptionalCostDetailItemFormProps;
  costExtendData?: BusinessPlanCostExtendData;
  index: number;
};

export const useCostConfig = ({ index, sectionKey, costItem, costExtendData }: UseCostFormulatorsProps) => {
  const { businessPlan, totalCostSupplier, totalWeightSupplier } = useBusinessPlanManageContext();
  const { control, setValue, getValues } = useFormContext<CostFormProps>();
  const items = useWatch({
    control,
    name: `${sectionKey}.items`
  }) as CostDetailItemFormProps[];

  const interestCostPercentage = useWatch({
    control,
    name: `${sectionKey}.items.0.percentage`
  }) as number;

  const rate = useMemo(() => {
    let result = businessPlan?.businessPlanTransactionInfoItem?.exchangeRateBuy || 0;

    if ([ItemCode.TtFee, ItemCode.ThcFee].includes(costItem.itemCode)) {
      result = businessPlan?.businessPlanTransactionInfoItem?.exchangeRateSell || 0;
    }

    return result;
  }, [businessPlan]);

  const itemConfig = useMemo(() => {
    const config = ITEM_CODE_CONFIGS[costItem.itemCode] as ItemCodeConfigProps;

    if (costItem.itemCode === ItemCode.LocalCharges) {
      config.local = {
        ...config.local,
        value: calculateLocalCharges(items, businessPlan)
      };
    }

    if ([ItemCode.GeneralManagementCost, ItemCode.CommissionCost, ItemCode.BrokerageCost].includes(costItem.itemCode)) {
      const total = costItem.itemCode === ItemCode.BrokerageCost ? totalWeightSupplier : costExtendData?.totalQuantitySold;

      config.local = {
        ...config.local,
        factor: Number(total)
      };

      config.foreign = {
        ...config.foreign,
        defaultValue: calculateAmountConversionCostManagement(
          items,
          costItem.itemCode,
          total,
          businessPlan?.businessPlanTransactionInfoItem?.exchangeRateBuy
        ),
        factor: Number(total)
      };
    }

    if ([ItemCode.TtFee, ItemCode.ThcFee].includes(costItem.itemCode)) {
      config.foreign = {
        ...config.foreign,
        defaultValue: calculateAmountConversionCostManagement(items, costItem.itemCode, 1, rate)
      };
    }

    if (costItem.isPercentage) {
      config.percent = {
        ...config.percent,
        defaultValue: costItem.percentage || 0
      };

      if (costItem.itemCode === ItemCode.InterestCost) {
        config.percent = {
          ...config.percent,
          onCalculateByPercent: (percent: number) => {
            return (totalCostSupplier * (percent / 100)) / 12;
          }
        };
      } else if (costItem.itemCode === ItemCode.VatInterestCost) {
        config.percent = {
          ...config.percent,
          onCalculateByPercent: (percent: number) => {
            return totalCostSupplier * ((interestCostPercentage || 0) / 100) / 2 * (percent / 100);
          }
        };
      } else if (costItem.itemCode === ItemCode.BrokerageFee) {
        const unitPrice = costExtendData?.unitPrice || 0;
        const buyRate = businessPlan?.businessPlanTransactionInfoItem?.exchangeRateBuy || 0;
        const totalQuantitySold = costExtendData?.totalQuantitySold || 0;

        config.percent = {
          ...config.percent,
          onCalculateByPercent: (percent: number) => {
            return (unitPrice * buyRate * totalQuantitySold * percent) / 100;
          }
        };
      } else if (costItem.itemCode === ItemCode.TaxRefundCost) {
        config.percent = {
          ...config.percent,
          onCalculateByPercent: (percent: number) => {
            return totalCostSupplier * (VAT_RATE / 100) * (percent / 100);
          }
        };
      } else {
        console.error('Unknown itemCode', costItem.itemCode);
      }
    }

    return config;
  }, [costItem, rate, interestCostPercentage, items]);

  useEffect(() => {
    if (costItem.itemCode === ItemCode.VatInterestCost) {
      const vatInterestCost = getValues(`${sectionKey}.items.${index}`);
      const result = totalCostSupplier * ((interestCostPercentage || 0) / 100) * ((vatInterestCost?.percentage || 0) / 100);
      setValue(`${sectionKey}.items.${index}.amount`, result, { shouldValidate: false });
      setValue(`${sectionKey}.items.${index}.amountConversion`, result * rate, { shouldValidate: false });
    }
  }, [interestCostPercentage]);

  return {
    itemConfig,
    rate
  };
};
