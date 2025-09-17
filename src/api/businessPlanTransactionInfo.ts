import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { SimpleResponse } from 'types/common';
import axios, { fetcher } from 'utils/axios';
import axiosServices from 'utils/axios';

// Types from existing business plan types
interface BusinessPlanTransactionInfoItem {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  businessPlanId: number;
  exchangeRateBuy: number;
  exchangeRateSell: number;
  shippingMethod: string;
  packingMethod: string;
  weightPerContainer: number;
  estimatedTotalContainers: number;
  estimatedTotalBookings: number;
}

interface BusinessPlanTransactionInfoFormData {
  exchangeRateBuy: number;
  exchangeRateSell: number;
  shippingMethod: string;
  packingMethod: string;
  weightPerContainer: number;
  estimatedTotalContainers: number;
  estimatedTotalBookings: number;
  businessPlanId?: number;
}

// API endpoints
const endpoints = {
  key: 'api/businessplantransactioninfo',
  list: '/',
  insert: '/',
  update: '/',
  delete: '/'
} as const;

// Response types
interface BusinessPlanTransactionInfoListResponse {
  data: BusinessPlanTransactionInfoItem[];
  meta: {
    message: string;
  };
}

interface SingleBusinessPlanTransactionInfoResponse {
  data: BusinessPlanTransactionInfoItem;
  meta: {
    message: string;
  };
}

// Hook chung cho tất cả thao tác CRUD với BusinessPlanTransactionInfo
export default function useBusinessPlanTransactionInfo() {
  const getById = (transactionInfoId: number) => {
    const shouldFetch = transactionInfoId && transactionInfoId > 0;
    const url = shouldFetch ? `${endpoints.key}${endpoints.list}${transactionInfoId}` : null;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<SingleBusinessPlanTransactionInfoResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2
    });

    return useMemo(
      () => ({
        transactionInfo: data?.data,
        transactionInfoLoading: isLoading,
        transactionInfoError: error,
        transactionInfoValidating: isValidating,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const create = async (newTransactionInfo: BusinessPlanTransactionInfoFormData): Promise<BusinessPlanTransactionInfoItem> => {
    try {
      // Validate required fields
      if (!newTransactionInfo.businessPlanId) {
        throw new Error('Business Plan ID is required');
      }

      const response = await axios.post<SingleBusinessPlanTransactionInfoResponse>(endpoints.key + endpoints.insert, newTransactionInfo);

      // Get the newly created transaction info from response
      const createdTransactionInfo = response.data.data;

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: BusinessPlanTransactionInfoListResponse | undefined) => {
          if (!currentData) return currentData;

          return {
            ...currentData,
            data: [...(currentData.data || []), createdTransactionInfo]
          };
        },
        { revalidate: false }
      );

      // Return the newly created transaction info
      return createdTransactionInfo;
    } catch (error) {
      console.error('Error creating transaction info:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create transaction info');
    }
  };

  const update = async (
    transactionInfoId: number,
    transactionInfo: Partial<BusinessPlanTransactionInfoFormData>
  ): Promise<BusinessPlanTransactionInfoItem> => {
    try {
      if (!transactionInfoId || transactionInfoId <= 0) {
        throw new Error('Invalid transaction info ID');
      }

      const response = await axios.put<SingleBusinessPlanTransactionInfoResponse>(
        `${endpoints.key}${endpoints.update}${transactionInfoId}`,
        transactionInfo
      );

      // Get the updated transaction info from response
      const updatedTransactionInfo: BusinessPlanTransactionInfoItem = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: BusinessPlanTransactionInfoListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedTransactionInfos = currentData.data.map((t: BusinessPlanTransactionInfoItem) =>
            t.id === transactionInfoId ? updatedTransactionInfo : t
          );

          return {
            ...currentData,
            data: updatedTransactionInfos
          };
        },
        { revalidate: false }
      );

      // Also update the single transaction info cache
      await mutate(
        `${endpoints.key}${endpoints.list}${transactionInfoId}`,
        {
          data: updatedTransactionInfo,
          meta: { message: 'Transaction info updated successfully' }
        } as SingleBusinessPlanTransactionInfoResponse,
        { revalidate: false }
      );

      // Return the updated transaction info
      return updatedTransactionInfo;
    } catch (error) {
      console.error('Error updating transaction info:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update transaction info');
    }
  };

  const deleteTransactionInfo = async (transactionInfoId: number): Promise<void> => {
    try {
      if (!transactionInfoId || transactionInfoId <= 0) {
        throw new Error('Invalid transaction info ID');
      }

      await axios.delete(`${endpoints.key}${endpoints.delete}${transactionInfoId}`);

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: BusinessPlanTransactionInfoListResponse | undefined) => {
          if (!currentData) return currentData;

          const filteredTransactionInfos = currentData.data.filter((t: BusinessPlanTransactionInfoItem) => t.id !== transactionInfoId);

          return {
            ...currentData,
            data: filteredTransactionInfos
          };
        },
        { revalidate: false }
      );
    } catch (error) {
      console.error('Error deleting transaction info:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete transaction info');
    }
  };

  return {
    getById,
    create,
    update,
    delete: deleteTransactionInfo
  };
}

// Direct API call function for backward compatibility
export const createBusinessPlanTransactionInfo = async (
  data: BusinessPlanTransactionInfoFormData
): Promise<BusinessPlanTransactionInfoItem> => {
  const response = await axiosServices.post(`api/businessplantransactioninfo`, data);
  return response.data.data;
};

export const updateBusinessPlanTransactionInfo = async (
  id: number,
  data: Partial<BusinessPlanTransactionInfoFormData>
): Promise<BusinessPlanTransactionInfoItem> => {
  const response = await axiosServices.put(`api/businessplantransactioninfo/${id}`, data);
  return response.data.data;
};
