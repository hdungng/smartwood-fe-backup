import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { DeliveryTerm, DeliveryTermFormData, DeliveryTermParams } from 'types/delivery-term';
import { SimpleResponse } from 'types/common';
import axios, { fetcher } from 'utils/axios';
import axiosServices from 'utils/axios';

// API endpoints
const endpoints = {
  key: 'api/deliveryterm',
  list: '/',
  insert: '/',
  update: '/',
  delete: '/'
} as const;

// ==============================|| TYPES ||============================== //
interface DeliveryTermListResponse {
  data: DeliveryTerm[];
  meta: {
    message: string;
  };
}

interface SingleDeliveryTermResponse {
  data: DeliveryTerm;
  meta: {
    message: string;
  };
}

// Hook chung cho tất cả thao tác CRUD với DeliveryTerm
export default function useDeliveryTerm() {
  const list = (params?: DeliveryTermParams) => {
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
    if (params?.description?.trim()) queryParams.append('description', params.description.trim());
    if (params?.incoterm?.trim()) queryParams.append('incoterm', params.incoterm.trim());
    if (params?.responsibility?.trim()) queryParams.append('responsibility', params.responsibility.trim());
    if (params?.deliveryLocation?.trim()) queryParams.append('deliveryLocation', params.deliveryLocation.trim());

    const queryString = queryParams.toString();
    const url = `${endpoints.key}${endpoints.list}${queryString ? `?${queryString}` : ''}`;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<DeliveryTermListResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
      errorRetryInterval: 1000
    });

    return useMemo(
      () => ({
        deliveryTerms: data?.data || [],
        deliveryTermsLoading: isLoading,
        deliveryTermsError: error,
        deliveryTermsValidating: isValidating,
        deliveryTermsEmpty: !isLoading && !data?.data?.length,
        deliveryTermsTotal: data?.data?.length || 0,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const getById = (deliveryTermId: number) => {
    const shouldFetch = deliveryTermId && deliveryTermId > 0;
    const url = shouldFetch ? `${endpoints.key}${endpoints.list}${deliveryTermId}` : null;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<SingleDeliveryTermResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2
    });

    return useMemo(
      () => ({
        deliveryTerm: data?.data,
        deliveryTermLoading: isLoading,
        deliveryTermError: error,
        deliveryTermValidating: isValidating,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const create = async (newDeliveryTerm: DeliveryTermFormData): Promise<DeliveryTerm> => {
    try {
      // Validate required fields
      if (!newDeliveryTerm.code?.trim() || !newDeliveryTerm.name?.trim() || !newDeliveryTerm.description?.trim()) {
        throw new Error('Missing required fields');
      }

      const response = await axios.post<SingleDeliveryTermResponse>(endpoints.key + endpoints.insert, newDeliveryTerm);

      // Get the newly created delivery term from response
      const createdDeliveryTerm = response.data.data;

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: DeliveryTermListResponse | undefined) => {
          if (!currentData) return currentData;

          return {
            ...currentData,
            data: [...(currentData.data || []), createdDeliveryTerm]
          };
        },
        { revalidate: false }
      );

      // Return the newly created delivery term
      return createdDeliveryTerm;
    } catch (error) {
      console.error('Error creating delivery term:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create delivery term');
    }
  };

  const update = async (deliveryTermId: number, deliveryTerm: Partial<DeliveryTermFormData>): Promise<DeliveryTerm> => {
    try {
      if (!deliveryTermId || deliveryTermId <= 0) {
        throw new Error('Invalid delivery term ID');
      }

      const response = await axios.put<SingleDeliveryTermResponse>(`${endpoints.key}${endpoints.update}${deliveryTermId}`, deliveryTerm);

      // Get the updated delivery term from response
      const updatedDeliveryTerm: DeliveryTerm = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: DeliveryTermListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedDeliveryTerms = currentData.data.map((dt: DeliveryTerm) => (dt.id === deliveryTermId ? updatedDeliveryTerm : dt));

          return {
            ...currentData,
            data: updatedDeliveryTerms
          };
        },
        { revalidate: false }
      );

      // Also update the single delivery term cache
      await mutate(
        `${endpoints.key}${endpoints.list}${deliveryTermId}`,
        {
          data: updatedDeliveryTerm,
          meta: { message: 'Delivery term updated successfully' }
        } as SingleDeliveryTermResponse,
        { revalidate: false }
      );

      // Return the updated delivery term
      return updatedDeliveryTerm;
    } catch (error) {
      console.error('Error updating delivery term:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update delivery term');
    }
  };

  const deleteDeliveryTerm = async (deliveryTermId: number): Promise<void> => {
    try {
      if (!deliveryTermId || deliveryTermId <= 0) {
        throw new Error('Invalid delivery term ID');
      }

      await axios.delete(`${endpoints.key}${endpoints.delete}${deliveryTermId}`);

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: DeliveryTermListResponse | undefined) => {
          if (!currentData) return currentData;

          const filteredDeliveryTerms = currentData.data.filter((dt: DeliveryTerm) => dt.id !== deliveryTermId);

          return {
            ...currentData,
            data: filteredDeliveryTerms
          };
        },
        { revalidate: false }
      );
    } catch (error) {
      console.error('Error deleting delivery term:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete delivery term');
    }
  };

  const deactivateDeliveryTerm = async (deliveryTermId: number): Promise<DeliveryTerm> => {
    try {
      if (!deliveryTermId || deliveryTermId <= 0) {
        throw new Error('Invalid delivery term ID');
      }

      // Update delivery term status to inactive (0)
      const response = await axios.put<SingleDeliveryTermResponse>(`${endpoints.key}${endpoints.update}${deliveryTermId}`, { status: 0 });

      // Get the updated delivery term from response
      const updatedDeliveryTerm: DeliveryTerm = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: DeliveryTermListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedDeliveryTerms = currentData.data.map((dt: DeliveryTerm) => (dt.id === deliveryTermId ? updatedDeliveryTerm : dt));

          return {
            ...currentData,
            data: updatedDeliveryTerms
          };
        },
        { revalidate: false }
      );

      // Also update the single delivery term cache
      await mutate(
        `${endpoints.key}${endpoints.list}${deliveryTermId}`,
        {
          data: updatedDeliveryTerm,
          meta: { message: 'Delivery term deactivated successfully' }
        } as SingleDeliveryTermResponse,
        { revalidate: false }
      );

      // Return the updated delivery term
      return updatedDeliveryTerm;
    } catch (error) {
      console.error('Error deactivating delivery term:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to deactivate delivery term');
    }
  };

  const activateDeliveryTerm = async (deliveryTermId: number): Promise<DeliveryTerm> => {
    try {
      if (!deliveryTermId || deliveryTermId <= 0) {
        throw new Error('Invalid delivery term ID');
      }

      // Update delivery term status to active (1)
      const response = await axios.put<SingleDeliveryTermResponse>(`${endpoints.key}${endpoints.update}${deliveryTermId}`, { status: 1 });

      // Get the updated delivery term from response
      const updatedDeliveryTerm: DeliveryTerm = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: DeliveryTermListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedDeliveryTerms = currentData.data.map((dt: DeliveryTerm) => (dt.id === deliveryTermId ? updatedDeliveryTerm : dt));

          return {
            ...currentData,
            data: updatedDeliveryTerms
          };
        },
        { revalidate: false }
      );

      // Also update the single delivery term cache
      await mutate(
        `${endpoints.key}${endpoints.list}${deliveryTermId}`,
        {
          data: updatedDeliveryTerm,
          meta: { message: 'Delivery term activated successfully' }
        } as SingleDeliveryTermResponse,
        { revalidate: false }
      );

      // Return the updated delivery term
      return updatedDeliveryTerm;
    } catch (error) {
      console.error('Error activating delivery term:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to activate delivery term');
    }
  };

  return {
    list,
    getById,
    create,
    update,
    delete: deleteDeliveryTerm,
    deactivate: deactivateDeliveryTerm,
    activate: activateDeliveryTerm
  };
}

// Standalone function to get all delivery terms (for select options, etc.)
export const getDeliveryTerms = async (): Promise<DeliveryTerm[]> => {
  try {
    const response = await axiosServices.get<DeliveryTermListResponse>(endpoints.key + endpoints.list);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching delivery terms:', error);
    throw new Error('Failed to fetch delivery terms');
  }
};
