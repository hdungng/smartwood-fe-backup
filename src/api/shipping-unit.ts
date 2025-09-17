import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import { TShippingUnit, ShippingUnitParams, ShippingUnitFormData } from 'types/shipping-unit';
import axios, { fetcher } from 'utils/axios';
import axiosServices from 'utils/axios';

// API endpoints
const endpoints = {
  key: '/api/shippingunit',
  list: '/',
  insert: '/',
  update: '/',
  delete: '/'
} as const;

// ==============================|| TYPES ||============================== //
interface ShippingUnitListResponse {
  data: TShippingUnit[];
  meta: {
    message: string;
  };
}

interface SingleShippingUnitResponse {
  data: TShippingUnit;
  meta: {
    message: string;
  };
}

// ==============================|| SHIPPING UNIT HOOKS ||============================== //

export default function useShippingUnit() {
  // ==============================|| GET LIST ||============================== //
  const list = (params?: ShippingUnitParams) => {
    const queryParams = useMemo(() => {
      if (!params) return '';

      const searchParams = new URLSearchParams();
      searchParams.set('status', '-1'); // set default status to GET ALL include inactive and active

      // Add params to search query string with better validation
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'status' && value !== -1) {
            searchParams.set(key, String(value));
          } else if (key !== 'status') {
            searchParams.append(key, String(value));
          }
        }
      });

      return searchParams.toString() ? `?${searchParams.toString()}` : '';
    }, [params]);

    const url = `${endpoints.key}${endpoints.list}${queryParams}`;

    const {
      data,
      error,
      isLoading,
      isValidating,
      mutate: mutateFn
    } = useSWR<ShippingUnitListResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
      errorRetryInterval: 1000
    });

    return useMemo(
      () => ({
        shippingUnits: data?.data || [],
        shippingUnitsLoading: isLoading,
        shippingUnitsError: error,
        shippingUnitsValidating: isValidating,
        shippingUnitsEmpty: !isLoading && !data?.data?.length,
        shippingUnitsTotal: data?.data?.length || 0,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  // ==============================|| GET BY ID ||============================== //
  const getById = (id: number) => {
    const shouldFetch = id && id > 0;
    const url = shouldFetch ? `${endpoints.key}${endpoints.list}${id}` : null;

    const {
      data,
      error,
      isLoading,
      isValidating,
      mutate: mutateFn
    } = useSWR<SingleShippingUnitResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2
    });

    return useMemo(
      () => ({
        shippingUnit: data?.data,
        shippingUnitLoading: isLoading,
        shippingUnitError: error,
        shippingUnitValidating: isValidating,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  // ==============================|| CREATE ||============================== //
  const create = async (data: ShippingUnitFormData): Promise<TShippingUnit> => {
    try {
      // Validate required fields
      if (!data.code?.trim() || !data.name?.trim()) {
        throw new Error('Missing required fields');
      }

      const response = await axios.post<SingleShippingUnitResponse>(endpoints.key + endpoints.insert, data);

      // Get the newly created shipping unit from response
      const createdShippingUnit = response.data.data;

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ShippingUnitListResponse | undefined) => {
          if (!currentData) return currentData;

          return {
            ...currentData,
            data: [...(currentData.data || []), createdShippingUnit]
          };
        },
        { revalidate: false }
      );

      return createdShippingUnit;
    } catch (error) {
      console.error('Error creating shipping unit:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create shipping unit');
    }
  };

  // ==============================|| UPDATE ||============================== //
  const update = async (id: number, data: Partial<ShippingUnitFormData>): Promise<TShippingUnit> => {
    try {
      if (!id || id <= 0) {
        throw new Error('Invalid shipping unit ID');
      }

      const response = await axios.put<SingleShippingUnitResponse>(`${endpoints.key}${endpoints.update}${id}`, data);

      // Get the updated shipping unit from response
      const updatedShippingUnit: TShippingUnit = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ShippingUnitListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedShippingUnits = currentData.data.map((su: TShippingUnit) => (su.id === id ? updatedShippingUnit : su));

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
          meta: { message: 'Shipping unit updated successfully' }
        } as SingleShippingUnitResponse,
        { revalidate: false }
      );

      return updatedShippingUnit;
    } catch (error) {
      console.error('Error updating shipping unit:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update shipping unit');
    }
  };

  // ==============================|| DELETE ||============================== //
  const deleteShippingUnit = async (id: number): Promise<void> => {
    try {
      if (!id || id <= 0) {
        throw new Error('Invalid shipping unit ID');
      }

      await axios.delete(`${endpoints.key}${endpoints.delete}${id}`);

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ShippingUnitListResponse | undefined) => {
          if (!currentData) return currentData;

          const filteredShippingUnits = currentData.data.filter((su: TShippingUnit) => su.id !== id);

          return {
            ...currentData,
            data: filteredShippingUnits
          };
        },
        { revalidate: false }
      );
    } catch (error) {
      console.error('Error deleting shipping unit:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete shipping unit');
    }
  };

  // ==============================|| ACTIVATE ||============================== //
  const activate = async (id: number): Promise<TShippingUnit> => {
    try {
      if (!id || id <= 0) {
        throw new Error('Invalid shipping unit ID');
      }

      // Update shipping unit status to active (1)
      const response = await axios.put<SingleShippingUnitResponse>(`${endpoints.key}${endpoints.update}${id}`, { status: 1 });

      // Get the updated shipping unit from response
      const updatedShippingUnit: TShippingUnit = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ShippingUnitListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedShippingUnits = currentData.data.map((su: TShippingUnit) => (su.id === id ? updatedShippingUnit : su));

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
        } as SingleShippingUnitResponse,
        { revalidate: false }
      );

      return updatedShippingUnit;
    } catch (error) {
      console.error('Error activating shipping unit:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to activate shipping unit');
    }
  };

  // ==============================|| DEACTIVATE ||============================== //
  const deactivate = async (id: number): Promise<TShippingUnit> => {
    try {
      if (!id || id <= 0) {
        throw new Error('Invalid shipping unit ID');
      }

      // Update shipping unit status to inactive (0)
      const response = await axios.put<SingleShippingUnitResponse>(`${endpoints.key}${endpoints.update}${id}`, { status: 0 });

      // Get the updated shipping unit from response
      const updatedShippingUnit: TShippingUnit = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ShippingUnitListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedShippingUnits = currentData.data.map((su: TShippingUnit) => (su.id === id ? updatedShippingUnit : su));

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
        } as SingleShippingUnitResponse,
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
    getById,
    create,
    update,
    delete: deleteShippingUnit,
    activate,
    deactivate
  };
}

// Standalone function to get all shipping units (for select options, etc.)
export const getShippingUnits = async (): Promise<TShippingUnit[]> => {
  try {
    const response = await axiosServices.get<ShippingUnitListResponse>(endpoints.key + endpoints.list);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching shipping units:', error);
    throw new Error('Failed to fetch shipping units');
  }
};
