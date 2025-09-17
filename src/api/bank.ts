import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { BankFormData } from 'types/bank';
import { SimpleResponse } from 'types/common';
import axios, { fetcher } from 'utils/axios';
import axiosServices from 'utils/axios';

// API endpoints
const endpoints = {
  key: 'api/bank',
  list: '/',
  insert: '/',
  update: '/',
  delete: '/'
} as const;

// ==============================|| TYPES ||============================== //

export interface Bank extends BankFormData {
  id: number;
  refId?: number;
  refType?: string;
  createdAt?: string;
  updatedAt?: string;
  lastUpdatedAt?: string;
}

export interface BankParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: number;
  refId?: number;
  refType?: string;
  name?: string;
  code?: string;
  swiftCode?: string;
  bankCode?: string;
  country?: string;
  city?: string;
  currency?: string;
  isDefault?: number;
}

interface BankListResponse {
  data: Bank[];
  meta: {
    message: string;
    total?: number;
    page?: number;
    limit?: number;
  };
}

interface SingleBankResponse {
  data: Bank;
  meta: {
    message: string;
  };
}

// Hook chung cho tất cả thao tác CRUD với Bank
export default function useBank() {
  const list = (params?: BankParams) => {
    const queryParams = new URLSearchParams();

    // Add params to search query string with better validation
    if (params?.page && params.page > 0) queryParams.append('page', params.page.toString());
    if (params?.limit && params.limit > 0) queryParams.append('limit', params.limit.toString());
    if (params?.search?.trim()) queryParams.append('search', params.search.trim());
    if (params?.sortBy?.trim()) queryParams.append('sortBy', params.sortBy.trim());
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.status !== undefined) queryParams.append('status', params.status.toString());
    if (params?.refId && params.refId > 0) queryParams.append('refId', params.refId.toString());
    if (params?.refType?.trim()) queryParams.append('refType', params.refType.trim());
    if (params?.name?.trim()) queryParams.append('name', params.name.trim());
    if (params?.code?.trim()) queryParams.append('code', params.code.trim());
    if (params?.swiftCode?.trim()) queryParams.append('swiftCode', params.swiftCode.trim());
    if (params?.bankCode?.trim()) queryParams.append('bankCode', params.bankCode.trim());
    if (params?.country?.trim()) queryParams.append('country', params.country.trim());
    if (params?.city?.trim()) queryParams.append('city', params.city.trim());
    if (params?.currency?.trim()) queryParams.append('currency', params.currency.trim());
    if (params?.isDefault !== undefined) queryParams.append('isDefault', params.isDefault.toString());

    // Add default sort order if not specified
    if (!params?.sortBy) {
      queryParams.append('sortBy', 'id');
      queryParams.append('sortOrder', 'asc');
    }

    const queryString = queryParams.toString();
    const url = `${endpoints.key}${endpoints.list}${queryString ? `?${queryString}` : ''}`;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<BankListResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
      errorRetryInterval: 1000
    });

    return useMemo(
      () => ({
        banks: data?.data || [],
        banksLoading: isLoading,
        banksError: error,
        banksValidating: isValidating,
        banksEmpty: !isLoading && !data?.data?.length,
        banksTotal: data?.meta?.total || data?.data?.length || 0,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const getById = (bankId: number) => {
    const shouldFetch = bankId && bankId > 0;
    const url = shouldFetch ? `${endpoints.key}${endpoints.list}${bankId}` : null;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<SingleBankResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2
    });

    return useMemo(
      () => ({
        bank: data?.data,
        bankLoading: isLoading,
        bankError: error,
        bankValidating: isValidating,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const getByCustomerId = (customerId: number) => {
    const shouldFetch = customerId && customerId > 0;
    const params = shouldFetch
      ? {
          refId: customerId,
          refType: 'CUSTOMER',
          sortBy: 'id',
          sortOrder: 'asc' as const
        }
      : undefined;

    return list(params);
  };

  const create = async (newBank: BankFormData & { refId?: number; refType?: string }): Promise<Bank> => {
    try {
      // Validate required fields - code will be auto-generated by backend
      if (!newBank.name?.trim() || !newBank.branchName?.trim() || !newBank.branchCode?.trim()) {
        throw new Error('Missing required fields: name, branchName, branchCode');
      }

      const response = await axios.post<SingleBankResponse>(endpoints.key + endpoints.insert, newBank);

      // Get the newly created bank from response
      const createdBank = response.data.data;

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: BankListResponse | undefined) => {
          if (!currentData) return currentData;

          return {
            ...currentData,
            data: [...(currentData.data || []), createdBank]
          };
        },
        { revalidate: false }
      );

      // Return the newly created bank
      return createdBank;
    } catch (error) {
      console.error('Error creating bank:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create bank');
    }
  };

  const update = async (bankId: number, bank: Partial<BankFormData & { refId?: number; refType?: string }>): Promise<Bank> => {
    try {
      if (!bankId || bankId <= 0) {
        throw new Error('Invalid bank ID');
      }

      const response = await axios.put<SingleBankResponse>(`${endpoints.key}${endpoints.update}${bankId}`, bank);

      // Get the updated bank from response
      const updatedBank: Bank = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response with order preservation
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: BankListResponse | undefined) => {
          if (!currentData) return currentData;

          // Preserve order by maintaining original array indices
          const updatedBanks = currentData.data.map((b: Bank, index: number) =>
            b.id === bankId ? { ...updatedBank, originalIndex: index } : { ...b, originalIndex: index }
          );

          // Sort by original index to maintain order
          updatedBanks.sort((a, b) => (a as any).originalIndex - (b as any).originalIndex);

          // Remove the temporary originalIndex property
          const finalBanks = updatedBanks.map((bank) => {
            const { originalIndex, ...cleanBank } = bank as any;
            return cleanBank;
          });

          return {
            ...currentData,
            data: finalBanks
          };
        },
        { revalidate: false }
      );

      // Also update the single bank cache
      await mutate(
        `${endpoints.key}${endpoints.list}${bankId}`,
        {
          data: updatedBank,
          meta: { message: 'Bank updated successfully' }
        } as SingleBankResponse,
        { revalidate: false }
      );

      // Return the updated bank
      return updatedBank;
    } catch (error) {
      console.error('Error updating bank:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update bank');
    }
  };

  const deleteBank = async (bankId: number): Promise<void> => {
    try {
      if (!bankId || bankId <= 0) {
        throw new Error('Invalid bank ID');
      }

      await axios.delete(`${endpoints.key}${endpoints.delete}${bankId}`);

      // Update local state after successful server response with order preservation
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: BankListResponse | undefined) => {
          if (!currentData) return currentData;

          // Filter out deleted bank while preserving order
          const filteredBanks = currentData.data.filter((b: Bank) => b.id !== bankId);

          return {
            ...currentData,
            data: filteredBanks
          };
        },
        { revalidate: false }
      );
    } catch (error) {
      console.error('Error deleting bank:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete bank');
    }
  };

  const setDefault = async (bankId: number, refId: number, refType: string = 'CUSTOMER'): Promise<Bank> => {
    try {
      if (!bankId || bankId <= 0) {
        throw new Error('Invalid bank ID');
      }

      // Single API call - backend automatically handles setting other banks to non-default
      const response = await axios.put<SingleBankResponse>(`${endpoints.key}${endpoints.update}${bankId}`, { isDefault: 1 });

      // Get the updated bank from response
      const updatedBank: Bank = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local cache - backend already handled other banks becoming non-default
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: BankListResponse | undefined) => {
          if (!currentData) return currentData;

          // Update all banks: set selected as default, others as non-default
          const updatedBanks = currentData.data.map((b: Bank) => {
            if (b.id === bankId) {
              return { ...b, isDefault: 1, lastUpdatedAt: updatedBank.lastUpdatedAt };
            } else {
              return { ...b, isDefault: 0 };
            }
          });

          return {
            ...currentData,
            data: updatedBanks
          };
        },
        { revalidate: false }
      );

      // Also update the single bank cache
      await mutate(
        `${endpoints.key}${endpoints.list}${bankId}`,
        {
          data: updatedBank,
          meta: { message: 'Bank set as default successfully' }
        } as SingleBankResponse,
        { revalidate: false }
      );

      // Return the updated bank
      return updatedBank;
    } catch (error) {
      console.error('Error setting default bank:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to set default bank');
    }
  };

  return {
    list,
    getById,
    getByCustomerId,
    create,
    update,
    delete: deleteBank,
    setDefault
  };
}

// Standalone function to get all banks (for select options, etc.)
export const getBanks = async (refId?: number, refType: string = 'CUSTOMER'): Promise<Bank[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (refId && refId > 0) {
      queryParams.append('refId', refId.toString());
      queryParams.append('refType', refType);
    }

    const queryString = queryParams.toString();
    const url = `${endpoints.key}${endpoints.list}${queryString ? `?${queryString}` : ''}`;

    const response = await axiosServices.get<BankListResponse>(url);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching banks:', error);
    throw new Error('Failed to fetch banks');
  }
};

// Standalone function to get default bank for a customer
export const getDefaultBank = async (refId: number, refType: string = 'CUSTOMER'): Promise<Bank | null> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('refId', refId.toString());
    queryParams.append('refType', refType);
    queryParams.append('isDefault', '1');

    const queryString = queryParams.toString();
    const url = `${endpoints.key}${endpoints.list}?${queryString}`;

    const response = await axiosServices.get<BankListResponse>(url);
    const banks = response.data.data || [];

    return banks.length > 0 ? banks[0] : null;
  } catch (error) {
    console.error('Error fetching default bank:', error);
    throw new Error('Failed to fetch default bank');
  }
};
