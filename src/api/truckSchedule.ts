import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import axios, { fetcher } from 'utils/axios';

// ==============================|| TYPES ||============================== //
interface TruckScheduleParams {
  page?: number;
  size?: number;
  ShippingScheduleId?: number;
}

interface TruckScheduleData {
  id: number;
  shippingScheduleId: number;
  supplierId: number;
  transportUnit: string;
  vehicleType: string;
  loadingDate: string;
  totalCont: number | null;
  totalWeight: number | null;
  quantity: number | null;
  createdAt?: string;
  lastUpdatedAt?: string;
  createdBy?: number;
  lastUpdatedBy?: number;
}

interface TruckScheduleListResponse {
  data: TruckScheduleData[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    canNext: boolean;
    canPrevious: boolean;
    count: number | null;
  };
}

interface TruckScheduleFormData {
  id?: number | null;
  shippingScheduleId: number;
  supplierId: number;
  transportUnit: string;
  vehicleType: string;
  loadingDate: string;
  totalCont: number | null;
  totalWeight: number | null;
  quantity: number | null;
}

// API endpoints
const endpoints = {
  key: 'api/purchasecontracttruckschedule',
  list: '/page',
  bulk: '/list',
  delete: '/'
} as const;

// Hook chung cho tất cả thao tác CRUD với Truck Schedule
export default function useTruckSchedule() {
  const list = (params?: TruckScheduleParams) => {
    const queryParams = new URLSearchParams();

    // Add params to search query string with better validation
    if (params?.page && params.page > 0) queryParams.append('page', params.page.toString());
    if (params?.size && params.size > 0) queryParams.append('size', params.size.toString());
    if (params?.ShippingScheduleId && params.ShippingScheduleId > 0) {
      queryParams.append('ShippingScheduleId', params.ShippingScheduleId.toString());
    }

    const queryString = queryParams.toString();
    const url = `${endpoints.key}${endpoints.list}${queryString ? `?${queryString}` : ''}`;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<TruckScheduleListResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
      errorRetryInterval: 1000,
      // Cache for 5 minutes
      dedupingInterval: 5 * 60 * 1000,
    });

    return useMemo(
      () => ({
        schedules: data?.data || [],
        schedulesLoading: isLoading,
        schedulesError: error,
        schedulesValidating: isValidating,
        schedulesEmpty: !isLoading && !data?.data?.length,
        schedulesTotal: data?.meta?.total || 0,
        schedulesMeta: data?.meta,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const bulkSave = async (schedules: TruckScheduleFormData[]): Promise<TruckScheduleData[]> => {
    try {
      if (!schedules || schedules.length === 0) {
        throw new Error('No schedules to save');
      }

      const response = await axios.post<{ data: TruckScheduleData[] }>(
        endpoints.key + endpoints.bulk, 
        schedules
      );

      const savedSchedules = response.data.data;

      // Invalidate all related cache entries
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list),
        undefined,
        { revalidate: true }
      );

      return savedSchedules;
    } catch (error) {
      console.error('Error saving schedules:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to save schedules');
    }
  };

  const deleteSchedule = async (scheduleId: number): Promise<void> => {
    try {
      if (!scheduleId || scheduleId <= 0) {
        throw new Error('Invalid schedule ID');
      }

      await axios.delete(`${endpoints.key}${endpoints.delete}${scheduleId}`);

      // Invalidate all related cache entries
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list),
        undefined,
        { revalidate: true }
      );
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete schedule');
    }
  };

  // Clear all cache for truck schedules
  const clearCache = async () => {
    await mutate(
      (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list),
      undefined,
      { revalidate: false }
    );
  };

  return {
    list,
    bulkSave,
    delete: deleteSchedule,
    clearCache
  };
}

// Export types for use in components
export type { TruckScheduleData, TruckScheduleFormData, TruckScheduleParams, TruckScheduleListResponse };
