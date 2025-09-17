import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { ShippingLine, ShippingLineFormData, ShippingLineParams } from 'types/shipping-line';
import { SimpleResponse } from 'types/common';
import axios, { fetcher } from 'utils/axios';
import axiosServices from 'utils/axios';

// API endpoints
const endpoints = {
  key: 'api/shippingline',
  list: '/',
  insert: '/',
  update: '/',
  delete: '/'
} as const;

// ==============================|| TYPES ||============================== //
interface ShippingLineListResponse {
  data: ShippingLine[];
  meta: {
    message: string;
  };
}

interface SingleShippingLineResponse {
  data: ShippingLine;
  meta: {
    message: string;
  };
}

// Hook chung cho tất cả thao tác CRUD với Shipping Line
export default function useShippingLine() {
  const list = (params?: ShippingLineParams) => {
    const queryParams = new URLSearchParams();
    queryParams.set('status', '-1'); // set default status to GET ALL include inactive and active
    // Add params to search query string with better validation
    if (params?.page && params.page > 0) queryParams.append('page', params.page.toString());
    if (params?.limit && params.limit > 0) queryParams.append('limit', params.limit.toString());
    if (params?.search?.trim()) queryParams.append('search', params.search.trim());
    if (params?.sortBy?.trim()) queryParams.append('sortBy', params.sortBy.trim());
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.status !== undefined) queryParams.append('status', params.status.toString());
    if (params?.code?.trim()) queryParams.append('code', params.code.trim());
    if (params?.name?.trim()) queryParams.append('name', params.name.trim());

    const queryString = queryParams.toString();
    const url = `${endpoints.key}${endpoints.list}${queryString ? `?${queryString}` : ''}`;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<ShippingLineListResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
      errorRetryInterval: 1000
    });

    return useMemo(
      () => ({
        shippingLines: data?.data || [],
        shippingLinesLoading: isLoading,
        shippingLinesError: error,
        shippingLinesValidating: isValidating,
        shippingLinesEmpty: !isLoading && !data?.data?.length,
        shippingLinesTotal: data?.data?.length || 0,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const getById = (shippingLineId: number) => {
    const shouldFetch = shippingLineId && shippingLineId > 0;
    const url = shouldFetch ? `${endpoints.key}${endpoints.list}${shippingLineId}` : null;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<SingleShippingLineResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2
    });

    return useMemo(
      () => ({
        shippingLine: data?.data,
        shippingLineLoading: isLoading,
        shippingLineError: error,
        shippingLineValidating: isValidating,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const create = async (newShippingLine: ShippingLineFormData): Promise<ShippingLine> => {
    try {
      // Validate required fields
      if (!newShippingLine.code?.trim() || !newShippingLine.name?.trim()) {
        throw new Error('Missing required fields');
      }

      const response = await axios.post<SingleShippingLineResponse>(endpoints.key + endpoints.insert, newShippingLine);

      // Get the newly created shipping line from response
      const createdShippingLine = response.data.data;

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ShippingLineListResponse | undefined) => {
          if (!currentData) return currentData;

          return {
            ...currentData,
            data: [createdShippingLine, ...(currentData.data || [])].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )          
          };
        },
        { revalidate: false }
      );

      // Return the newly created shipping line
      return createdShippingLine;
    } catch (error) {
      console.error('Error creating shipping line:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create shipping line');
    }
  };

  const update = async (shippingLineId: number, shippingLine: Partial<ShippingLineFormData>): Promise<ShippingLine> => {
    try {
      if (!shippingLineId || shippingLineId <= 0) {
        throw new Error('Invalid shipping line ID');
      }

      const response = await axios.put<SingleShippingLineResponse>(`${endpoints.key}${endpoints.update}${shippingLineId}`, shippingLine);

      // Get the updated shipping line from response
      const updatedShippingLine: ShippingLine = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ShippingLineListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedShippingLines = currentData.data.map((s: ShippingLine) => (s.id === shippingLineId ? updatedShippingLine : s));

          return {
            ...currentData,
            data: updatedShippingLines
          };
        },
        { revalidate: false }
      );

      // Also update the single shipping line cache
      await mutate(
        `${endpoints.key}${endpoints.list}${shippingLineId}`,
        {
          data: updatedShippingLine,
          meta: { message: 'Shipping line updated successfully' }
        } as SingleShippingLineResponse,
        { revalidate: false }
      );

      // Return the updated shipping line
      return updatedShippingLine;
    } catch (error) {
      console.error('Error updating shipping line:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update shipping line');
    }
  };

  const deleteShippingLine = async (shippingLineId: number): Promise<void> => {
    try {
      if (!shippingLineId || shippingLineId <= 0) {
        throw new Error('Invalid shipping line ID');
      }

      await axios.delete(`${endpoints.key}${endpoints.delete}${shippingLineId}`);

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ShippingLineListResponse | undefined) => {
          if (!currentData) return currentData;

          const filteredShippingLines = currentData.data.filter((s: ShippingLine) => s.id !== shippingLineId);

          return {
            ...currentData,
            data: filteredShippingLines
          };
        },
        { revalidate: false }
      );
    } catch (error) {
      console.error('Error deleting shipping line:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete shipping line');
    }
  };

  const deactivateShippingLine = async (shippingLineId: number): Promise<ShippingLine> => {
    try {
      if (!shippingLineId || shippingLineId <= 0) {
        throw new Error('Invalid shipping line ID');
      }

      // Update shipping line status to inactive (0)
      const response = await axios.put<SingleShippingLineResponse>(`${endpoints.key}${endpoints.update}${shippingLineId}`, { status: 0 });

      // Get the updated shipping line from response
      const updatedShippingLine: ShippingLine = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ShippingLineListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedShippingLines = currentData.data.map((s: ShippingLine) => (s.id === shippingLineId ? updatedShippingLine : s));

          return {
            ...currentData,
            data: updatedShippingLines
          };
        },
        { revalidate: false }
      );

      // Also update the single shipping line cache
      await mutate(
        `${endpoints.key}${endpoints.list}${shippingLineId}`,
        {
          data: updatedShippingLine,
          meta: { message: 'Shipping line deactivated successfully' }
        } as SingleShippingLineResponse,
        { revalidate: false }
      );

      // Return the updated shipping line
      return updatedShippingLine;
    } catch (error) {
      console.error('Error deactivating shipping line:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to deactivate shipping line');
    }
  };

  const activateShippingLine = async (shippingLineId: number): Promise<ShippingLine> => {
    try {
      if (!shippingLineId || shippingLineId <= 0) {
        throw new Error('Invalid shipping line ID');
      }

      // Update shipping line status to active (1)
      const response = await axios.put<SingleShippingLineResponse>(`${endpoints.key}${endpoints.update}${shippingLineId}`, { status: 1 });

      // Get the updated shipping line from response
      const updatedShippingLine: ShippingLine = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ShippingLineListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedShippingLines = currentData.data.map((s: ShippingLine) => (s.id === shippingLineId ? updatedShippingLine : s));

          return {
            ...currentData,
            data: updatedShippingLines
          };
        },
        { revalidate: false }
      );

      // Also update the single shipping line cache
      await mutate(
        `${endpoints.key}${endpoints.list}${shippingLineId}`,
        {
          data: updatedShippingLine,
          meta: { message: 'Shipping line activated successfully' }
        } as SingleShippingLineResponse,
        { revalidate: false }
      );

      // Return the updated shipping line
      return updatedShippingLine;
    } catch (error) {
      console.error('Error activating shipping line:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to activate shipping line');
    }
  };

  return {
    list,
    getById,
    create,
    update,
    delete: deleteShippingLine,
    deactivate: deactivateShippingLine,
    activate: activateShippingLine
  };
}

export const getShippingLines = async (): Promise<ShippingLine[]> => {
  const accessToken = localStorage.getItem('serviceToken');

  if (!accessToken) {
    // Nếu không có token, trả về mảng rỗng hoặc throw error tuỳ logic của bạn
    // throw new Error('No access token');
    return [];
  }

  const response = await axiosServices.get(`api/shippingline`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return (response?.data?.data ?? []) as ShippingLine[];
};
