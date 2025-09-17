import { SelectionOption } from '../types/common';
import { goodService } from '../services/good';
import { supplierService } from '../services/supplier';

export const useSupplierOptions = () => {
  const handleFetchSupplierByGoodOptions = async (goodId: number): Promise<SelectionOption[]> => {
    if (!goodId) return [];

    const response = await goodService.listSupplierByGood(goodId);
    return (response?.data || []).map((supplier) => ({
      value: supplier.supplierId,
      label: supplier.supplierName || '',
      metadata: {
        goods: supplier.goods || []
      }
    })) as SelectionOption[];
  };

  const handleFetchSupplierOptions = async (): Promise<SelectionOption[]> => {
    const response = await supplierService.listSuppliers();
    return (response?.data || []).map((supplier) => ({
      value: supplier.id,
      label: supplier.name || ''
    })) as SelectionOption[];
  };

  return {
    getSupplierByGood: handleFetchSupplierByGoodOptions,
    getSupplier: handleFetchSupplierOptions
  };
};
