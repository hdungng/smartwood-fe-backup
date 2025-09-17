import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { TCost, CreateCostData, UpdateCostData, CostParams } from 'types/cost';
import { SimpleResponse } from 'types/common';
import axios, { fetcher } from 'utils/axios';

// API endpoints
const endpoints = {
  key: 'api/cost',
  list: '/',
  insert: '/',
  update: '/',
  delete: '/'
} as const;

// ==============================|| TYPES ||============================== //
interface CostListResponse {
  data: TCost[];
  meta: {
    message: string;
  };
}

interface SingleCostResponse {
  data: TCost;
  meta: {
    message: string;
  };
}

// Hook chung cho tất cả thao tác CRUD với Cost
export default function useCost() {
  const list = (params?: CostParams) => {
    const queryParams = new URLSearchParams();
    // Add params to search query string with better validation
    if (params?.page && params.page > 0) queryParams.append('page', params.page.toString());
    if (params?.size && params.size > 0) queryParams.append('size', params.size.toString());
    if (params?.searchKey?.trim()) queryParams.append('search', params.searchKey.trim());
    if (params?.sortFields && params.sortFields.length > 0) {
      params.sortFields.forEach((sort) => {
        queryParams.append('sortBy', String(sort.field));
        queryParams.append('sortOrder', sort.direction);
      });
    }
    if (params?.itemCode?.trim()) queryParams.append('itemCode', params.itemCode.trim());
    if (params?.costType?.trim()) queryParams.append('costType', params.costType.trim());
    if (params?.name?.trim()) queryParams.append('name', params.name.trim());
    if (params?.currency?.trim()) queryParams.append('currency', params.currency.trim());
    if (params?.effectiveFrom?.trim()) queryParams.append('effectiveFrom', params.effectiveFrom.trim());
    if (params?.effectiveTo?.trim()) queryParams.append('effectiveTo', params.effectiveTo.trim());

    const queryString = queryParams.toString();
    const url = `${endpoints.key}${endpoints.list}${queryString ? `?${queryString}` : ''}`;

    const { data, isLoading, error, isValidating, mutate: mutateFn } = useSWR<CostListResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
      errorRetryInterval: 1000
    });

    return useMemo(
      () => ({
        costs: data?.data || [],
        costsLoading: isLoading,
        costsError: error,
        costsValidating: isValidating,
        costsEmpty: !isLoading && !data?.data?.length,
        costsTotal: data?.data?.length || 0,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const getById = (costId: number) => {
    const shouldFetch = costId && costId > 0;
    const url = shouldFetch ? `${endpoints.key}${endpoints.list}${costId}` : null;

    const { data, isLoading, error, isValidating, mutate: mutateFn } = useSWR<SingleCostResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2
    });

    return useMemo(
      () => ({
        cost: data?.data,
        costLoading: isLoading,
        costError: error,
        costValidating: isValidating,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const create = async (newCost: CreateCostData): Promise<TCost> => {
    try {
      if (!newCost.itemCode?.trim() || !newCost.costType?.trim() || !newCost.name?.trim() || !newCost.currency?.trim()) {
        throw new Error('Missing required fields');
      }

      const response = await axios.post<SingleCostResponse>(endpoints.key + endpoints.insert, newCost);
      const created = response?.data?.data as TCost | undefined;

      if (created) {
        // Optimistically update cache
        await mutate(
          (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
          (currentData: CostListResponse | undefined) => {
            if (!currentData) return currentData;
            return { ...currentData, data: [...(currentData.data || []), created] };
          },
          { revalidate: false }
        );
      }

      // Always revalidate list keys to ensure fresh data after insert
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        undefined,
        { revalidate: true }
      );

      // Return created if available; otherwise a minimal object to indicate success
      return created ?? ({ ...newCost, id: 0, createdAt: '', lastUpdatedAt: '', createdBy: 0, lastUpdatedBy: 0, lastProgramUpdate: null, code: '', status: 1, lastUpdatedProgram: null } as unknown as TCost);
    } catch (error) {
      console.error('Error creating cost:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create cost');
    }
  };

  const update = async (costId: number, cost: UpdateCostData | Partial<CreateCostData>): Promise<TCost> => {
    try {
      if (!costId || costId <= 0) {
        throw new Error('Invalid cost ID');
      }

      const response = await axios.put<SingleCostResponse>(`${endpoints.key}${endpoints.update}${costId}`, cost);
      const updated: TCost = { ...response.data.data, lastUpdatedAt: new Date().toISOString() };

      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: CostListResponse | undefined) => {
          if (!currentData) return currentData;
          const updatedList = currentData.data.map((c: TCost) => (c.id === costId ? updated : c));
          return { ...currentData, data: updatedList };
        },
        { revalidate: false }
      );

      await mutate(
        `${endpoints.key}${endpoints.list}${costId}`,
        { data: updated, meta: { message: 'Cost updated successfully' } } as SingleCostResponse,
        { revalidate: false }
      );

      return updated;
    } catch (error) {
      console.error('Error updating cost:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update cost');
    }
  };

  const deleteCost = async (costId: number): Promise<void> => {
    try {
      if (!costId || costId <= 0) {
        throw new Error('Invalid cost ID');
      }

      await axios.delete(`${endpoints.key}${endpoints.delete}${costId}`);

      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: CostListResponse | undefined) => {
          if (!currentData) return currentData;
          const filtered = currentData.data.filter((c: TCost) => c.id !== costId);
          return { ...currentData, data: filtered };
        },
        { revalidate: false }
      );
    } catch (error) {
      console.error('Error deleting cost:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete cost');
    }
  };

  return {
    list,
    getById,
    create,
    update,
    delete: deleteCost
  };
}


