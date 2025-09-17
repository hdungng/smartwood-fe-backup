import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { TForwarder, ForwarderFormData, TForwarderFilter } from 'types/forwarder.types';
import { SimpleResponse } from 'types/common';
import axios, { fetcher } from 'utils/axios';
import axiosServices from 'utils/axios';

// API endpoints
const endpoints = {
  key: 'api/forwarder',
  list: '/',
  insert: '/',
  update: '/',
  delete: '/'
} as const;

// ==============================|| TYPES ||============================== //
interface ForwarderListResponse {
  data: TForwarder[];
  meta: {
    message: string;
  };
}

interface SingleForwarderResponse {
  data: TForwarder;
  meta: {
    message: string;
  };
}

// Hook chung cho tất cả thao tác CRUD với Forwarder
export default function useForwarder() {
  const list = (params?: TForwarderFilter) => {
    const queryParams = new URLSearchParams();
    queryParams.set('status', '-1'); // set default status to GET ALL include inactive and active
    // Add params to search query string with better validation
    if (params?.page && params.page > 0) queryParams.append('page', params.page.toString());
    if (params?.limit && params.limit > 0) queryParams.append('limit', params.limit.toString());
    if (params?.search?.trim()) queryParams.append('search', params.search.trim());
    if (params?.sortBy?.trim()) queryParams.append('sortBy', params.sortBy.trim());
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.status !== undefined) queryParams.append('status', params.status.toString());
    if (params?.forwarderType?.trim()) queryParams.append('forwarderType', params.forwarderType.trim());
    if (params?.email?.trim()) queryParams.append('email', params.email.trim());
    if (params?.phone?.trim()) queryParams.append('phone', params.phone.trim());
    if (params?.code?.trim()) queryParams.append('code', params.code.trim());
    if (params?.name?.trim()) queryParams.append('name', params.name.trim());
    if (params?.forwarderNameVn?.trim()) queryParams.append('forwarderNameVn', params.forwarderNameVn.trim());
    if (params?.forwarderNameEn?.trim()) queryParams.append('forwarderNameEn', params.forwarderNameEn.trim());
    if (params?.address?.trim()) queryParams.append('address', params.address.trim());
    if (params?.taxCode?.trim()) queryParams.append('taxCode', params.taxCode.trim());
    if (params?.website?.trim()) queryParams.append('website', params.website.trim());
    if (params?.contactPerson?.trim()) queryParams.append('contactPerson', params.contactPerson.trim());
    if (params?.contactPhone?.trim()) queryParams.append('contactPhone', params.contactPhone.trim());
    if (params?.contactEmail?.trim()) queryParams.append('contactEmail', params.contactEmail.trim());
    if (params?.region?.trim()) queryParams.append('region', params.region.trim());
    if (params?.province?.trim()) queryParams.append('province', params.province.trim());
    if (params?.district?.trim()) queryParams.append('district', params.district.trim());
    if (params?.rating && params.rating > 0) queryParams.append('rating', params.rating.toString());

    const queryString = queryParams.toString();
    const url = `${endpoints.key}${endpoints.list}${queryString ? `?${queryString}` : ''}`;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<ForwarderListResponse>(url, fetcher, {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
      errorRetryInterval: 1000
    });

    return useMemo(
      () => ({
        forwarders: data?.data || [],
        forwardersLoading: isLoading,
        forwardersError: error,
        forwardersValidating: isValidating,
        forwardersEmpty: !isLoading && !data?.data?.length,
        forwardersTotal: data?.data?.length || 0,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const getById = (forwarderId: number) => {
    const shouldFetch = forwarderId && forwarderId > 0;
    const url = shouldFetch ? `${endpoints.key}${endpoints.list}${forwarderId}` : null;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<SingleForwarderResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2
    });

    return useMemo(
      () => ({
        forwarder: data?.data,
        forwarderLoading: isLoading,
        forwarderError: error,
        forwarderValidating: isValidating,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const create = async (newForwarder: ForwarderFormData): Promise<TForwarder> => {
    try {
      // Validate required fields
      if (!newForwarder.forwarderNameVn?.trim() || !newForwarder.code?.trim()) {
        throw new Error('Missing required fields');
      }

      const response = await axios.post<SingleForwarderResponse>(endpoints.key + endpoints.insert, newForwarder);

      // Get the newly created forwarder from response
      const createdForwarder = response.data.data;

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ForwarderListResponse | undefined) => {
          if (!currentData) return currentData;

          return {
            ...currentData,
            data: [...(currentData.data || []), createdForwarder]
          };
        },
        { revalidate: false }
      );

      // Return the newly created forwarder
      return createdForwarder;
    } catch (error) {
      console.error('Error creating forwarder:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create forwarder');
    }
  };

  const update = async (forwarderId: number, forwarder: Partial<ForwarderFormData>): Promise<TForwarder> => {
    try {
      if (!forwarderId || forwarderId <= 0) {
        throw new Error('Invalid forwarder ID');
      }

      const response = await axios.put<SingleForwarderResponse>(`${endpoints.key}${endpoints.update}${forwarderId}`, forwarder);

      // Get the updated forwarder from response
      const updatedForwarder: TForwarder = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ForwarderListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedForwarders = currentData.data.map((f: TForwarder) => (f.id === forwarderId ? updatedForwarder : f));

          return {
            ...currentData,
            data: updatedForwarders
          };
        },
        { revalidate: false }
      );

      // Also update the single forwarder cache
      await mutate(
        `${endpoints.key}${endpoints.list}${forwarderId}`,
        {
          data: updatedForwarder,
          meta: { message: 'Forwarder updated successfully' }
        } as SingleForwarderResponse,
        { revalidate: false }
      );

      // Return the updated forwarder
      return updatedForwarder;
    } catch (error) {
      console.error('Error updating forwarder:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update forwarder');
    }
  };

  const deleteForwarder = async (forwarderId: number): Promise<void> => {
    try {
      if (!forwarderId || forwarderId <= 0) {
        throw new Error('Invalid forwarder ID');
      }

      await axios.delete(`${endpoints.key}${endpoints.delete}${forwarderId}`);

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ForwarderListResponse | undefined) => {
          if (!currentData) return currentData;

          const filteredForwarders = currentData.data.filter((f: TForwarder) => f.id !== forwarderId);

          return {
            ...currentData,
            data: filteredForwarders
          };
        },
        { revalidate: false }
      );
    } catch (error) {
      console.error('Error deleting forwarder:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete forwarder');
    }
  };

  const deactivateForwarder = async (forwarderId: number): Promise<TForwarder> => {
    try {
      if (!forwarderId || forwarderId <= 0) {
        throw new Error('Invalid forwarder ID');
      }

      // Update forwarder status to inactive (0)
      const response = await axios.put<SingleForwarderResponse>(`${endpoints.key}${endpoints.update}${forwarderId}`, { status: 0 });

      // Get the updated forwarder from response
      const updatedForwarder: TForwarder = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ForwarderListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedForwarders = currentData.data.map((f: TForwarder) => (f.id === forwarderId ? updatedForwarder : f));

          return {
            ...currentData,
            data: updatedForwarders
          };
        },
        { revalidate: false }
      );

      // Also update the single forwarder cache
      await mutate(
        `${endpoints.key}${endpoints.list}${forwarderId}`,
        {
          data: updatedForwarder,
          meta: { message: 'Forwarder deactivated successfully' }
        } as SingleForwarderResponse,
        { revalidate: false }
      );

      // Return the updated forwarder
      return updatedForwarder;
    } catch (error) {
      console.error('Error deactivating forwarder:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to deactivate forwarder');
    }
  };

  const activateForwarder = async (forwarderId: number): Promise<TForwarder> => {
    try {
      if (!forwarderId || forwarderId <= 0) {
        throw new Error('Invalid forwarder ID');
      }

      // Update forwarder status to active (1)
      const response = await axios.put<SingleForwarderResponse>(`${endpoints.key}${endpoints.update}${forwarderId}`, { status: 1 });

      // Get the updated forwarder from response
      const updatedForwarder: TForwarder = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ForwarderListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedForwarders = currentData.data.map((f: TForwarder) => (f.id === forwarderId ? updatedForwarder : f));

          return {
            ...currentData,
            data: updatedForwarders
          };
        },
        { revalidate: false }
      );

      // Also update the single forwarder cache
      await mutate(
        `${endpoints.key}${endpoints.list}${forwarderId}`,
        {
          data: updatedForwarder,
          meta: { message: 'Forwarder activated successfully' }
        } as SingleForwarderResponse,
        { revalidate: false }
      );

      // Return the updated forwarder
      return updatedForwarder;
    } catch (error) {
      console.error('Error activating forwarder:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to activate forwarder');
    }
  };

  return {
    list,
    getById,
    create,
    update,
    delete: deleteForwarder,
    deactivate: deactivateForwarder,
    activate: activateForwarder
  };
}

// Standalone function to get all forwarders (for select options, etc.)
export const getForwarders = async (): Promise<TForwarder[]> => {
  try {
    const response = await axiosServices.get<ForwarderListResponse>(endpoints.key + endpoints.list);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching forwarders:', error);
    throw new Error('Failed to fetch forwarders');
  }
};
