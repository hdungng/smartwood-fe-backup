import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { Good, GoodFormData, GoodParams } from 'types/good';
import { SimpleResponse } from 'types/common';
import axios, { fetcher } from 'utils/axios';
import axiosServices from 'utils/axios';

// API endpoints
const endpoints = {
  key: 'api/good',
  list: '/',
  insert: '/',
  update: '/',
  delete: '/'
} as const;

// ==============================|| TYPES ||============================== //
interface GoodListResponse {
  data: Good[];
  meta: {
    message: string;
  };
}

interface SingleGoodResponse {
  data: Good;
  meta: {
    message: string;
  };
}

// Hook chung cho tất cả thao tác CRUD với Good
export default function useGood() {
  const list = (params?: GoodParams) => {
    const queryParams = new URLSearchParams();
    queryParams.set('status', '-1'); // set default status to GET ALL include inactive and active
    // Add params to search query string with better validation
    if (params?.page && params.page > 0) queryParams.append('page', params.page.toString());
    if (params?.limit && params.limit > 0) queryParams.append('limit', params.limit.toString());
    if (params?.search?.trim()) queryParams.append('search', params.search.trim());
    if (params?.sortBy?.trim()) queryParams.append('sortBy', params.sortBy.trim());
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.status !== undefined) queryParams.append('status', params.status.toString());
    if (params?.category?.trim()) queryParams.append('category', params.category.trim());
    if (params?.brand?.trim()) queryParams.append('brand', params.brand.trim());
    if (params?.sku?.trim()) queryParams.append('sku', params.sku.trim());
    if (params?.code?.trim()) queryParams.append('code', params.code.trim());
    if (params?.name?.trim()) queryParams.append('name', params.name.trim());
    if (params?.unitOfMeasure?.trim()) queryParams.append('unitOfMeasure', params.unitOfMeasure.trim());
    if (params?.originCountry?.trim()) queryParams.append('originCountry', params.originCountry.trim());
    if (params?.supplierId && params.supplierId > 0) queryParams.append('supplierId', params.supplierId.toString());
    if (params?.minPrice && params.minPrice > 0) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice && params.maxPrice > 0) queryParams.append('maxPrice', params.maxPrice.toString());

    const queryString = queryParams.toString();
    const url = `${endpoints.key}${endpoints.list}${queryString ? `?${queryString}` : ''}`;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<GoodListResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
      errorRetryInterval: 1000
    });

    return useMemo(
      () => ({
        goods: data?.data || [],
        goodsLoading: isLoading,
        goodsError: error,
        goodsValidating: isValidating,
        goodsEmpty: !isLoading && !data?.data?.length,
        goodsTotal: data?.data?.length || 0,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const getById = (goodId: number) => {
    const shouldFetch = goodId && goodId > 0;
    const url = shouldFetch ? `${endpoints.key}${endpoints.list}${goodId}` : null;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<SingleGoodResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2
    });

    return useMemo(
      () => ({
        good: data?.data,
        goodLoading: isLoading,
        goodError: error,
        goodValidating: isValidating,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const create = async (newGood: GoodFormData): Promise<Good> => {
    try {
      // Validate required fields
      if (!newGood.code?.trim() || !newGood.name?.trim()) {
        throw new Error('Missing required fields');
      }

      const response = await axios.post<SingleGoodResponse>(endpoints.key + endpoints.insert, newGood);

      // Get the newly created good from response
      const createdGood = response.data.data;

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: GoodListResponse | undefined) => {
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

  const update = async (goodId: number, good: Partial<GoodFormData>): Promise<Good> => {
    try {
      if (!goodId || goodId <= 0) {
        throw new Error('Invalid good ID');
      }

      const response = await axios.put<SingleGoodResponse>(`${endpoints.key}${endpoints.update}${goodId}`, good);

      // Get the updated good from response
      const updatedGood: Good = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: GoodListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedGoods = currentData.data.map((g: Good) => (g.id === goodId ? updatedGood : g));

          return {
            ...currentData,
            data: updatedGoods
          };
        },
        { revalidate: false }
      );

      // Also update the single good cache
      await mutate(
        `${endpoints.key}${endpoints.list}${goodId}`,
        {
          data: updatedGood,
          meta: { message: 'Good updated successfully' }
        } as SingleGoodResponse,
        { revalidate: false }
      );

      // Return the updated good
      return updatedGood;
    } catch (error) {
      console.error('Error updating good:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update good');
    }
  };

  const deleteGood = async (goodId: number): Promise<void> => {
    try {
      if (!goodId || goodId <= 0) {
        throw new Error('Invalid good ID');
      }

      await axios.delete(`${endpoints.key}${endpoints.delete}${goodId}`);

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: GoodListResponse | undefined) => {
          if (!currentData) return currentData;

          const filteredGoods = currentData.data.filter((g: Good) => g.id !== goodId);

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

  const deactivateGood = async (goodId: number): Promise<Good> => {
    try {
      if (!goodId || goodId <= 0) {
        throw new Error('Invalid good ID');
      }

      // Update good status to inactive (0)
      const response = await axios.put<SingleGoodResponse>(`${endpoints.key}${endpoints.update}${goodId}`, { status: 0 });

      // Get the updated good from response
      const updatedGood: Good = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: GoodListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedGoods = currentData.data.map((g: Good) => (g.id === goodId ? updatedGood : g));

          return {
            ...currentData,
            data: updatedGoods
          };
        },
        { revalidate: false }
      );

      // Also update the single good cache
      await mutate(
        `${endpoints.key}${endpoints.list}${goodId}`,
        {
          data: updatedGood,
          meta: { message: 'Good deactivated successfully' }
        } as SingleGoodResponse,
        { revalidate: false }
      );

      // Return the updated good
      return updatedGood;
    } catch (error) {
      console.error('Error deactivating good:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to deactivate good');
    }
  };

  const activateGood = async (goodId: number): Promise<Good> => {
    try {
      if (!goodId || goodId <= 0) {
        throw new Error('Invalid good ID');
      }

      // Update good status to active (1)
      const response = await axios.put<SingleGoodResponse>(`${endpoints.key}${endpoints.update}${goodId}`, { status: 1 });

      // Get the updated good from response
      const updatedGood: Good = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: GoodListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedGoods = currentData.data.map((g: Good) => (g.id === goodId ? updatedGood : g));

          return {
            ...currentData,
            data: updatedGoods
          };
        },
        { revalidate: false }
      );

      // Also update the single good cache
      await mutate(
        `${endpoints.key}${endpoints.list}${goodId}`,
        {
          data: updatedGood,
          meta: { message: 'Good activated successfully' }
        } as SingleGoodResponse,
        { revalidate: false }
      );

      // Return the updated good
      return updatedGood;
    } catch (error) {
      console.error('Error activating good:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to activate good');
    }
  };

  return {
    list,
    getById,
    create,
    update,
    delete: deleteGood,
    deactivate: deactivateGood,
    activate: activateGood
  };
}

// Standalone function to get all goods (for select options, etc.)
export const getGoods = async (): Promise<Good[]> => {
  try {
    const response = await axiosServices.get<GoodListResponse>(endpoints.key + endpoints.list);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching goods:', error);
    throw new Error('Failed to fetch goods');
  }
};
