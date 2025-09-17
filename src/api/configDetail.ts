import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { ConfigData } from 'types/config';
import axios, { fetcher } from 'utils/axios';

// API endpoints
const endpoints = {
  key: 'api/codedetail',
  list: '/',
  insert: '/',
  update: '/',
  delete: '/'
} as const;

// Hook để quản lý config detail items
export default function useConfigDetail() {
  const list = (codeId: number) => {
    const url = `${endpoints.key}?codeid=${codeId}`;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<ConfigData[]>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
      errorRetryInterval: 1000
    });

    return {
      configDetails: data || [],
      configDetailsLoading: isLoading,
      configDetailsError: error,
      configDetailsValidating: isValidating,
      mutateConfigDetails: mutateFn
    };
  };

  const create = async (codeId: number, newItem: ConfigData): Promise<ConfigData> => {
    try {
      if (!newItem.key?.trim() || !newItem.value?.trim()) {
        throw new Error('Key và Value không được để trống');
      }

      const response = await axios.post<{ data: ConfigData }>(endpoints.key + endpoints.insert, { ...newItem, codeId });

      const createdItem = response.data.data;

      // Update local state
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(`${endpoints.key}?codeid=${codeId}`),
        (currentData: ConfigData[] | undefined) => {
          if (!currentData) return [createdItem];
          return [...currentData, createdItem];
        },
        { revalidate: false }
      );

      return createdItem;
    } catch (error) {
      console.error('Error creating config detail:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create config detail');
    }
  };

  const update = async (codeId: number, itemId: number, updatedItem: ConfigData): Promise<ConfigData> => {
    try {
      if (!updatedItem.key?.trim() || !updatedItem.value?.trim()) {
        throw new Error('Key và Value không được để trống');
      }

      const response = await axios.put<{ data: ConfigData }>(`${endpoints.key}${endpoints.update}${itemId}`, updatedItem);

      const updatedData = response.data.data;

      // Update local state
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(`${endpoints.key}?codeid=${codeId}`),
        (currentData: ConfigData[] | undefined) => {
          if (!currentData) return [updatedData];
          return currentData.map((item) => (item.id === itemId ? updatedData : item));
        },
        { revalidate: false }
      );

      return updatedData;
    } catch (error) {
      console.error('Error updating config detail:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update config detail');
    }
  };

  const remove = async (codeId: number, itemId: number): Promise<void> => {
    try {
      await axios.delete(`${endpoints.key}${endpoints.delete}${itemId}`);

      // Update local state
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(`${endpoints.key}?codeid=${codeId}`),
        (currentData: ConfigData[] | undefined) => {
          if (!currentData) return [];
          return currentData.filter((item) => item.id !== itemId);
        },
        { revalidate: false }
      );
    } catch (error) {
      console.error('Error deleting config detail:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete config detail');
    }
  };

  return {
    list,
    create,
    update,
    remove
  };
}
