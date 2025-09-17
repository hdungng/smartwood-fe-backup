import axiosServices, { fetcher } from 'utils/axios';
import {
  GoodSupplier,
  CreateGoodSupplier,
  UpdateGoodSupplier,
  GoodSupplierFilter,
  PagedResult,
  SingleGoodSupplier
} from 'types/good-supplier';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// legacy code, giữ lại chỉ nhằm mục đích tương thích với code cũ
export const goodSupplierService = {
  async getGoodSuppliers(filter: GoodSupplierFilter): Promise<PagedResult<GoodSupplier>> {
    const response = await axiosServices.get(`api/goodsupplierprice/page`, { params: filter });
    return response.data;
  },

  async getGoodSupplierById(id: number): Promise<GoodSupplier> {
    const response = await axiosServices.get(`api/goodsupplierprice/${id}`);
    return response.data;
  },

  async createGoodSupplier(data: CreateGoodSupplier): Promise<GoodSupplier> {
    const response = await axiosServices.post(`api/goodsupplierprice`, data);
    return response.data;
  },

  async updateGoodSupplier(id: number, data: UpdateGoodSupplier): Promise<GoodSupplier> {
    const response = await axiosServices.put(`api/goodsupplierprice/${id}`, data);
    return response.data;
  },

  async deleteGoodSupplier(id: number): Promise<void> {
    // Sử dụng endpoint mới để hard delete
    await axiosServices.delete(`api/goodsupplierprice/${id}`);
  }
};
// phia tren cho legacy, tuong thich voi code cu

// API endpoints
const endpoints = {
  key: 'api/goodsupplierprice',
  list: '/page',
  insert: '/',
  update: '/',
  delete: '/'
} as const;

// hook chung cho goodsupplier
export default function useGoodSupplier() {
  const list = (params?: GoodSupplierFilter) => {
    const queryParams = new URLSearchParams(); //Add params to search query string with better validation
    if (params?.page && params.page > 0) queryParams.append('page', params.page.toString());
    if (params?.size && params.size > 0) queryParams.append('size', params.size.toString());
    if (params?.supplierId && params.supplierId > 0) queryParams.append('supplierId', params.supplierId.toString());
    if (params?.goodType?.trim()) queryParams.append('sortBy', params.goodType.trim());
    if (params?.startDateFrom) queryParams.append('sortOrder', params.startDateFrom);
    if (params?.status !== undefined) queryParams.append('status', params.status.toString());
    if (params?.startDateTo?.trim()) queryParams.append('category', params.startDateTo.trim());
    if (params?.code?.trim()) queryParams.append('code', params.code.trim());
    if (params?.goodId && params.goodId > 0) queryParams.append('name', params.goodId.toString());
    if (params?.goodName?.trim()) queryParams.append('goodName', params.goodName.trim());

    const queryString = queryParams.toString();
    const url = `${endpoints.key}${endpoints.list}${queryString ? `?${queryString}` : ''}`;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<PagedResult<GoodSupplier>>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
      errorRetryInterval: 1000
    });

    return useMemo(
      () => ({
        goodsuppliers: data?.data || [],
        gooduppliersMetaData: data?.meta,
        goodsuppliersLoading: isLoading,
        goodsuppliersError: error,
        goodsuppliersValidating: isValidating,
        goodsuppliersEmpty: !isLoading && !data?.data?.length,
        goodsuppliersTotal: data?.data?.length || 0,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const create = async (data: CreateGoodSupplier): Promise<GoodSupplier> => {
    try {
      const response = await axiosServices.post(`api/goodsupplierprice`, data);

      // Get the newly created good from response
      const createdGood = response.data.data;

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: PagedResult<GoodSupplier> | undefined) => {
          if (!currentData) return currentData;

          return {
            ...currentData,
            data: [...(currentData.data || []), createdGood]
          };
        },
        { revalidate: false }
      );

      // Return the newly created good
      return createdGood;
    } catch (error) {
      console.error('Error creating good:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create good');
    }
  };

  const getById = (goodId: number) => {
    const shouldFetch = goodId && goodId > 0;
    const url = shouldFetch ? `${endpoints.key}/${goodId}` : null;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<GoodSupplier>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2
    });

    return useMemo(
      () => ({
        goodSupplier: data,
        goodSupplierLoading: isLoading,
        goodSupplierError: error,
        goodSupplierValidating: isValidating,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const update = async (id: number, data: UpdateGoodSupplier): Promise<GoodSupplier> => {
    try {
      if (!id || id <= 0) {
        throw new Error('Invalid good ID');
      }

      const response = await axiosServices.put(`api/goodsupplierprice/${id}`, data);

      // Get the updated good from response
      const updatedGood: GoodSupplier = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: PagedResult<GoodSupplier> | undefined) => {
          if (!currentData) return currentData;

          const updatedGoods = currentData.data.map((g: GoodSupplier) => (g.id === id ? updatedGood : g));
          console.log('the update local state is fired');

          return {
            ...currentData,
            data: updatedGoods
          };
        },
        { revalidate: false }
      );

      // Also update the single good cache
      await mutate(
        `${endpoints.key}${endpoints.list}${id}`,
        {
          data: updatedGood,
          meta: { message: 'Good updated successfully' }
        } as SingleGoodSupplier,
        { revalidate: false }
      );

      // Return the updated good
      return updatedGood;
    } catch (error) {
      console.error('Error updating good:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update good');
    }
  };

  const deleteGoodSupplier = async (id: number): Promise<void> => {
    try {
      if (!id || id <= 0) {
        throw new Error('Invalid good ID');
      }

      await axiosServices.delete(`api/goodsupplierprice/${id}`);

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: PagedResult<GoodSupplier> | undefined) => {
          if (!currentData) return currentData;

          const filteredGoods = currentData.data.filter((g: GoodSupplier) => g.id !== id);

          return {
            ...currentData,
            data: filteredGoods
          };
        },
        { revalidate: false }
      );
    } catch (error) {
      console.error('Error deleting good:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete good');
    }
  };

  // ==============================|| ACTIVATE ||============================== //
  const activate = async (id: number): Promise<GoodSupplier> => {
    try {
      if (!id || id <= 0) {
        throw new Error('Invalid good supplier ID');
      }

      // Update shipping unit status to active (1)
      const response = await axiosServices.put(`${endpoints.key}${endpoints.update}${id}`, { status: 1 });

      // Get the updated shipping unit from response
      const updatedShippingUnit: GoodSupplier = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: PagedResult<GoodSupplier> | undefined) => {
          if (!currentData) return currentData;

          const updatedShippingUnits = currentData.data.map((su: GoodSupplier) => (su.id === id ? updatedShippingUnit : su));

          return {
            ...currentData,
            data: updatedShippingUnits
          };
        },
        { revalidate: false }
      );

      // Also update the single shipping unit cache
      await mutate(
        `${endpoints.key}${endpoints.list}${id}`,
        {
          data: updatedShippingUnit,
          meta: { message: 'Shipping unit activated successfully' }
        } as SingleGoodSupplier,
        { revalidate: false }
      );

      return updatedShippingUnit;
    } catch (error) {
      console.error('Error activating shipping unit:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to activate shipping unit');
    }
  };

  // ==============================|| DEACTIVATE ||============================== //
  const deactivate = async (id: number): Promise<GoodSupplier> => {
    try {
      if (!id || id <= 0) {
        throw new Error('Invalid shipping unit ID');
      }

      // Update shipping unit status to inactive (0)
      const response = await axiosServices.put(`${endpoints.key}${endpoints.update}${id}`, { status: 0 });

      // Get the updated shipping unit from response
      const updatedShippingUnit: GoodSupplier = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: PagedResult<GoodSupplier> | undefined) => {
          if (!currentData) return currentData;

          const updatedShippingUnits = currentData.data.map((su: GoodSupplier) => (su.id === id ? updatedShippingUnit : su));

          return {
            ...currentData,
            data: updatedShippingUnits
          };
        },
        { revalidate: false }
      );

      // Also update the single shipping unit cache
      await mutate(
        `${endpoints.key}${endpoints.list}${id}`,
        {
          data: updatedShippingUnit,
          meta: { message: 'Shipping unit deactivated successfully' }
        } as SingleGoodSupplier,
        { revalidate: false }
      );
      return updatedShippingUnit;
    } catch (error) {
      console.error('Error deactivating shipping unit:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to deactivate shipping unit');
    }
  };

  return {
    list,
    create,
    getById,
    update,
    deleteGoodSupplier,
    activate,
    deactivate
  };
}
