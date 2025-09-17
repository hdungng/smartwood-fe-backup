import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { Customer, CustomerFormData, CustomerParams } from 'types/customer';
import { SimpleResponse } from 'types/common';
import axios, { fetcher } from 'utils/axios';
import axiosServices from 'utils/axios';

// API endpoints
const endpoints = {
  key: 'api/customer',
  list: '/',
  insert: '/',
  update: '/',
  delete: '/'
} as const;

// ==============================|| TYPES ||============================== //
interface CustomerListResponse {
  data: Customer[];
  meta: {
    message: string;
  };
}

interface SingleCustomerResponse {
  data: Customer;
  meta: {
    message: string;
  };
}

// Hook chung cho tất cả thao tác CRUD với Customer
export default function useCustomer() {
  const list = (params?: CustomerParams) => {
    const queryParams = new URLSearchParams();
    queryParams.set('status', '-1'); // set default status to GET ALL include inactive and active
    // Add params to search query string with better validation
    if (params?.page && params.page > 0) queryParams.append('page', params.page.toString());
    if (params?.limit && params.limit > 0) queryParams.append('limit', params.limit.toString());
    if (params?.search?.trim()) queryParams.append('search', params.search.trim());
    if (params?.sortBy?.trim()) queryParams.append('sortBy', params.sortBy.trim());
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.status !== undefined) queryParams.append('status', params.status.toString());
    if (params?.name?.trim()) queryParams.append('name', params.name.trim());
    if (params?.code?.trim()) queryParams.append('code', params.code.trim());
    if (params?.email?.trim()) queryParams.append('email', params.email.trim());
    if (params?.phone?.trim()) queryParams.append('phone', params.phone.trim());
    if (params?.represented?.trim()) queryParams.append('represented', params.represented.trim());
    if (params?.address?.trim()) queryParams.append('address', params.address.trim());
    if (params?.fax?.trim()) queryParams.append('fax', params.fax.trim());
    if (params?.taxCode?.trim()) queryParams.append('taxCode', params.taxCode.trim());

    const queryString = queryParams.toString();
    const url = `${endpoints.key}${endpoints.list}${queryString ? `?${queryString}` : ''}`;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<CustomerListResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
      errorRetryInterval: 1000
    });

    return useMemo(
      () => ({
        customers: data?.data || [],
        customersLoading: isLoading,
        customersError: error,
        customersValidating: isValidating,
        customersEmpty: !isLoading && !data?.data?.length,
        customersTotal: data?.data?.length || 0,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const getById = (customerId: number) => {
    const shouldFetch = customerId && customerId > 0;
    const url = shouldFetch ? `${endpoints.key}${endpoints.list}${customerId}` : null;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<SingleCustomerResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2
    });

    return useMemo(
      () => ({
        customer: data?.data,
        customerLoading: isLoading,
        customerError: error,
        customerValidating: isValidating,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const create = async (newCustomer: CustomerFormData): Promise<Customer> => {
    try {
      // Validate required fields
      if (!newCustomer.name?.trim() || !newCustomer.email?.trim()) {
        throw new Error('Missing required fields');
      }

      const response = await axios.post<SingleCustomerResponse>(endpoints.key + endpoints.insert, newCustomer);

      // Get the newly created customer from response
      const createdCustomer = response.data.data;

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: CustomerListResponse | undefined) => {
          if (!currentData) return currentData;

          return {
            ...currentData,
            data: [...(currentData.data || []), createdCustomer]
          };
        },
        { revalidate: false }
      );

      // Return the newly created customer
      return createdCustomer;
    } catch (error: any) {
        const message =
          error?.meta?.message ||
          error?.message ||
          error?.error ||
          'Failed to create customer';
        throw new Error(message);
      }
  };

  const update = async (customerId: number, customer: Partial<CustomerFormData>): Promise<Customer> => {
    try {
      if (!customerId || customerId <= 0) {
        throw new Error('Invalid customer ID');
      }

      const response = await axios.put<SingleCustomerResponse>(`${endpoints.key}${endpoints.update}${customerId}`, customer);

      // Get the updated customer from response
      const updatedCustomer: Customer = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: CustomerListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedCustomers = currentData.data.map((c: Customer) => (c.id === customerId ? updatedCustomer : c));

          return {
            ...currentData,
            data: updatedCustomers
          };
        },
        { revalidate: false }
      );

      // Also update the single customer cache
      await mutate(
        `${endpoints.key}${endpoints.list}${customerId}`,
        {
          data: updatedCustomer,
          meta: { message: 'Customer updated successfully' }
        } as SingleCustomerResponse,
        { revalidate: false }
      );

      // Return the updated customer
      return updatedCustomer;
    } catch (error: any) {
        const message =
          error?.meta?.message ||
          error?.message ||
          error?.error ||
          'Failed to update customer';
        throw new Error(message);
      }
  };

  const deleteCustomer = async (customerId: number): Promise<void> => {
    try {
      if (!customerId || customerId <= 0) {
        throw new Error('Invalid customer ID');
      }

      await axios.delete(`${endpoints.key}${endpoints.delete}${customerId}`);

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: CustomerListResponse | undefined) => {
          if (!currentData) return currentData;

          const filteredCustomers = currentData.data.filter((c: Customer) => c.id !== customerId);

          return {
            ...currentData,
            data: filteredCustomers
          };
        },
        { revalidate: false }
      );
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete customer');
    }
  };

  const deactivateCustomer = async (customerId: number): Promise<Customer> => {
    try {
      if (!customerId || customerId <= 0) {
        throw new Error('Invalid customer ID');
      }

      // Update customer status to inactive (0)
      const response = await axios.put<SingleCustomerResponse>(`${endpoints.key}${endpoints.update}${customerId}`, { status: 0 });

      // Get the updated customer from response
      const updatedCustomer: Customer = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: CustomerListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedCustomers = currentData.data.map((c: Customer) => (c.id === customerId ? updatedCustomer : c));

          return {
            ...currentData,
            data: updatedCustomers
          };
        },
        { revalidate: false }
      );

      // Also update the single customer cache
      await mutate(
        `${endpoints.key}${endpoints.list}${customerId}`,
        {
          data: updatedCustomer,
          meta: { message: 'Customer deactivated successfully' }
        } as SingleCustomerResponse,
        { revalidate: false }
      );

      // Return the updated customer
      return updatedCustomer;
    } catch (error) {
      console.error('Error deactivating customer:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to deactivate customer');
    }
  };

  const activateCustomer = async (customerId: number): Promise<Customer> => {
    try {
      if (!customerId || customerId <= 0) {
        throw new Error('Invalid customer ID');
      }

      // Update customer status to active (1)
      const response = await axios.put<SingleCustomerResponse>(`${endpoints.key}${endpoints.update}${customerId}`, { status: 1 });

      // Get the updated customer from response
      const updatedCustomer: Customer = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: CustomerListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedCustomers = currentData.data.map((c: Customer) => (c.id === customerId ? updatedCustomer : c));

          return {
            ...currentData,
            data: updatedCustomers
          };
        },
        { revalidate: false }
      );

      // Also update the single customer cache
      await mutate(
        `${endpoints.key}${endpoints.list}${customerId}`,
        {
          data: updatedCustomer,
          meta: { message: 'Customer activated successfully' }
        } as SingleCustomerResponse,
        { revalidate: false }
      );

      // Return the updated customer
      return updatedCustomer;
    } catch (error) {
      console.error('Error activating customer:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to activate customer');
    }
  };

  return {
    list,
    getById,
    create,
    update,
    delete: deleteCustomer,
    deactivate: deactivateCustomer,
    activate: activateCustomer
  };
}

// Standalone function to get all customers (for select options, etc.)
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await axiosServices.get<CustomerListResponse>(endpoints.key + endpoints.list);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw new Error('Failed to fetch customers');
  }
};
