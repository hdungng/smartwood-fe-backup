import { getGoods } from 'api/good';
import { getSuppliers } from 'api/supplier';
import { getShippingUnits } from 'api/shippingUnit';
import React, { createContext, ReactNode, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { TGood } from 'types/good';
import { TSupplier } from 'types/supplier';
import { TShippingUnit } from 'types/shippingUnit';
import { handleAsync } from 'utils/helper';
import { SelectionOption } from '../types/common';
import { useAuth } from 'hooks';
import { configService, ListConfigResponse } from '../services/config';

export interface GlobalState {
  configs: ListConfigResponse[];

  goods: TGood[];
  suppliers: TSupplier[];
  shippingUnits: TShippingUnit[];

  goodOptions: SelectionOption[];
  supplierOptions: SelectionOption[];
  shippingUnitOptions: SelectionOption[];

  goodMap: Map<string | number, SelectionOption>;
  supplierMap: Map<string | number, SelectionOption>;
  shippingUnitMap: Map<string | number, SelectionOption>;
}

export interface GlobalContextType extends GlobalState {
  setGoods: (goods: TGood[]) => void;
  setSuppliers: (suppliers: TSupplier[]) => void;
  setShippingUnits: (suppliers: TShippingUnit[]) => void;
  getGoodNameById: (id?: number | string | null) => string;
  getSupplierNameById: (id?: number | string | null) => string;
  getShippingUnitNameById: (id?: number | string | null) => string;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const { isLoggedIn, isInitialized } = useAuth();
  const [goods, setGoods] = useState<TGood[]>([]);
  const [suppliers, setSuppliers] = useState<TSupplier[]>([]);
  const [shippingUnits, setShippingUnits] = useState<TShippingUnit[]>([]);
  const [configs, setConfigs] = useState<ListConfigResponse[]>([]);

  const fetchGoods = useCallback(async (): Promise<void> => {
    await handleAsync<TGood[]>(
      () => getGoods(),
      (goods) => setGoods(goods),
      (error) => {
        setGoods([]);
      }
    );
  }, []);

  const fetchSuppliers = useCallback(async (): Promise<void> => {
    await handleAsync<TSupplier[]>(
      () => getSuppliers(),
      (suppliers) => setSuppliers(suppliers),
      (error) => {
        setSuppliers([]);
      }
    );
  }, []);

  const fetchShippingUnits = useCallback(async (): Promise<void> => {
    await handleAsync<TShippingUnit[]>(
      () => getShippingUnits(),
      (shippingUnits) => setShippingUnits(shippingUnits),
      (error) => {
        setShippingUnits([]);
      }
    );
  }, []);

  const fetchConfig = useCallback(async () => {
    await handleAsync(
      () => configService.listConfig({ page: 1, size: 100 }),
      (configs) => setConfigs(configs?.data || []),
      (error) => {
        setConfigs([]);
      }
    );
  }, []);

  // Auto-fetch data on mount
  useEffect(() => {
    if (!isInitialized || !isLoggedIn) return;

    (async () => {
      await Promise.all([fetchGoods(), fetchSuppliers(), fetchShippingUnits(), fetchConfig()]);
    })();
  }, [isInitialized, isLoggedIn]);

  const goodOptions = useMemo(
    () =>
      goods.map(
        (good) =>
          ({
            label: good.name,
            value: good.id
          }) as SelectionOption
      ),
    [goods]
  );

  const supplierOptions = useMemo(
    () =>
      suppliers.map(
        (supplier) =>
          ({
            label: supplier.name,
            value: supplier.id
          }) as SelectionOption
      ),
    [suppliers]
  );

  const shippingUnitOptions = useMemo(
    () =>
      shippingUnits.map(
        (unit) =>
          ({
            label: unit.fullName,
            value: unit.code
          }) as SelectionOption
      ),
    [shippingUnits]
  );

  // Map goodId -> goodName using global goods
  const getGoodNameById = useCallback((id?: number | string | null): string => {
    if (id === undefined || id === null) return '';
    const numericId = typeof id === 'string' ? Number(id) : id;
    return goods.find((g) => g.id === numericId)?.name || '';
  }, [goods]);

  // Map supplierId -> supplierName using global suppliers
  const getSupplierNameById = useCallback((id?: number | string | null): string => {
    if (id === undefined || id === null) return '';
    const numericId = typeof id === 'string' ? Number(id) : id;
    return suppliers.find((s) => s.id === numericId)?.name || '';
  }, [suppliers]);

  // Map shippingUnitId -> shippingUnitName using global shippingUnits
  const getShippingUnitNameById = useCallback((id?: number | string | null): string => {
    if (id === undefined || id === null) return '';
    const numericId = typeof id === 'string' ? Number(id) : id;
    return shippingUnits.find((u) => u.id === numericId)?.name || '';
  }, [shippingUnits]);

  const goodMap = useMemo(() => new Map(goodOptions.map((option) => [option.value, option])), [goodOptions]);
  const shippingUnitMap = useMemo(() => new Map(shippingUnitOptions.map((option) => [option.value, option])), [shippingUnitOptions]);
  const supplierMap = useMemo(() => new Map(supplierOptions.map((option) => [option.value, option])), [supplierOptions]);

  const value: GlobalContextType = {
    configs,
    goods,
    suppliers,
    shippingUnits,
    setGoods,
    setSuppliers,
    setShippingUnits,
    getGoodNameById,
    getSupplierNameById,
    getShippingUnitNameById,
    goodOptions,
    supplierOptions,
    shippingUnitOptions,

    goodMap,
    shippingUnitMap,
    supplierMap
  };

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export const useGlobal = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
};

export default GlobalContext;
