import { LogisticItemFormProps } from '../../../../schema';
import { useMemo } from 'react';

export const useLogisticGrouped = ({ logistics }: { logistics?: LogisticItemFormProps[] }) => {
  const groupedData = useMemo(() => {
    const grouped: Record<string, Dynamic> = {};

    (logistics || []).forEach((item) => {
      const region = item.region;
      const supplierId = item.supplier.value;
      const supplierLabel = item.supplier.label;
      const goodId = item.good.value;
      const goodLabel = item.good.label;
      const goodType = item.goodType;

      if (!grouped[region]) {
        grouped[region] = {};
      }

      if (!grouped[region][supplierId]) {
        grouped[region][supplierId] = {
          label: supplierLabel,
          goods: {}
        };
      }

      if (!grouped[region][supplierId].goods[goodId]) {
        grouped[region][supplierId].goods[goodId] = {
          label: goodLabel,
          goodTypes: {},
          metadata: item.good.metadata
        };
      }

      if (!grouped[region][supplierId].goods[goodId].goodTypes[goodType]) {
        grouped[region][supplierId].goods[goodId].goodTypes[goodType] = [];
      }

      grouped[region][supplierId].goods[goodId].goodTypes[goodType].push(item);
    });

    return grouped;
  }, [logistics]);

  return {
    grouped: groupedData || {}
  };
};
