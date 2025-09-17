import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { PaymentTerm, PaymentTermFormData, PaymentTermParams } from 'types/payment-term';
import { SimpleResponse } from 'types/common';
import axios, { fetcher } from 'utils/axios';
import axiosServices from 'utils/axios';

// API endpoints
const endpoints = {
  key: 'api/paymentterm',
  list: '/',
  insert: '/',
  update: '/',
  delete: '/'
} as const;

// ==============================|| TYPES ||============================== //
interface PaymentTermListResponse {
  data: PaymentTerm[];
  meta: {
    message: string;
  };
}

interface SinglePaymentTermResponse {
  data: PaymentTerm;
  meta: {
    message: string;
  };
}

// Hook chung cho tất cả thao tác CRUD với PaymentTerm
export default function usePaymentTerm() {
  const list = (params?: PaymentTermParams) => {
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
    if (params?.paymentMethod?.trim()) queryParams.append('paymentMethod', params.paymentMethod.trim());

    const queryString = queryParams.toString();
    const url = `${endpoints.key}${endpoints.list}${queryString ? `?${queryString}` : ''}`;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<PaymentTermListResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
      errorRetryInterval: 1000
    });

    return useMemo(
      () => ({
        paymentTerms: data?.data || [],
        paymentTermsLoading: isLoading,
        paymentTermsError: error,
        paymentTermsValidating: isValidating,
        paymentTermsEmpty: !isLoading && !data?.data?.length,
        paymentTermsTotal: data?.data?.length || 0,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const getById = (paymentTermId: number) => {
    const shouldFetch = paymentTermId && paymentTermId > 0;
    const url = shouldFetch ? `${endpoints.key}${endpoints.list}${paymentTermId}` : null;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<SinglePaymentTermResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2
    });

    return useMemo(
      () => ({
        paymentTerm: data?.data,
        paymentTermLoading: isLoading,
        paymentTermError: error,
        paymentTermValidating: isValidating,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const create = async (newPaymentTerm: PaymentTermFormData): Promise<PaymentTerm> => {
    try {
      // Validate required fields
      if (!newPaymentTerm.code?.trim() || !newPaymentTerm.name?.trim() || !newPaymentTerm.description?.trim()) {
        throw new Error('Missing required fields');
      }

      const response = await axios.post<SinglePaymentTermResponse>(endpoints.key + endpoints.insert, newPaymentTerm);

      // Get the newly created payment term from response
      const createdPaymentTerm = response.data.data;

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: PaymentTermListResponse | undefined) => {
          if (!currentData) return currentData;

          return {
            ...currentData,
            data: [...(currentData.data || []), createdPaymentTerm]
          };
        },
        { revalidate: false }
      );

      // Return the newly created payment term
      return createdPaymentTerm;
    } catch (error) {
      console.error('Error creating payment term:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create payment term');
    }
  };

  const update = async (paymentTermId: number, paymentTerm: Partial<PaymentTermFormData>): Promise<PaymentTerm> => {
    try {
      if (!paymentTermId || paymentTermId <= 0) {
        throw new Error('Invalid payment term ID');
      }

      const response = await axios.put<SinglePaymentTermResponse>(`${endpoints.key}${endpoints.update}${paymentTermId}`, paymentTerm);

      // Get the updated payment term from response
      const updatedPaymentTerm: PaymentTerm = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: PaymentTermListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedPaymentTerms = currentData.data.map((pt: PaymentTerm) => (pt.id === paymentTermId ? updatedPaymentTerm : pt));

          return {
            ...currentData,
            data: updatedPaymentTerms
          };
        },
        { revalidate: false }
      );

      // Also update the single payment term cache
      await mutate(
        `${endpoints.key}${endpoints.list}${paymentTermId}`,
        {
          data: updatedPaymentTerm,
          meta: { message: 'Payment term updated successfully' }
        } as SinglePaymentTermResponse,
        { revalidate: false }
      );

      // Return the updated payment term
      return updatedPaymentTerm;
    } catch (error) {
      console.error('Error updating payment term:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update payment term');
    }
  };

  const deletePaymentTerm = async (paymentTermId: number): Promise<void> => {
    try {
      if (!paymentTermId || paymentTermId <= 0) {
        throw new Error('Invalid payment term ID');
      }

      await axios.delete(`${endpoints.key}${endpoints.delete}${paymentTermId}`);

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: PaymentTermListResponse | undefined) => {
          if (!currentData) return currentData;

          const filteredPaymentTerms = currentData.data.filter((pt: PaymentTerm) => pt.id !== paymentTermId);

          return {
            ...currentData,
            data: filteredPaymentTerms
          };
        },
        { revalidate: false }
      );
    } catch (error) {
      console.error('Error deleting payment term:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete payment term');
    }
  };

  const deactivatePaymentTerm = async (paymentTermId: number): Promise<PaymentTerm> => {
    try {
      if (!paymentTermId || paymentTermId <= 0) {
        throw new Error('Invalid payment term ID');
      }

      // Update payment term status to inactive (0)
      const response = await axios.put<SinglePaymentTermResponse>(`${endpoints.key}${endpoints.update}${paymentTermId}`, { status: 0 });

      // Get the updated payment term from response
      const updatedPaymentTerm: PaymentTerm = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: PaymentTermListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedPaymentTerms = currentData.data.map((pt: PaymentTerm) => (pt.id === paymentTermId ? updatedPaymentTerm : pt));

          return {
            ...currentData,
            data: updatedPaymentTerms
          };
        },
        { revalidate: false }
      );

      // Also update the single payment term cache
      await mutate(
        `${endpoints.key}${endpoints.list}${paymentTermId}`,
        {
          data: updatedPaymentTerm,
          meta: { message: 'Payment term deactivated successfully' }
        } as SinglePaymentTermResponse,
        { revalidate: false }
      );

      // Return the updated payment term
      return updatedPaymentTerm;
    } catch (error) {
      console.error('Error deactivating payment term:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to deactivate payment term');
    }
  };

  const activatePaymentTerm = async (paymentTermId: number): Promise<PaymentTerm> => {
    try {
      if (!paymentTermId || paymentTermId <= 0) {
        throw new Error('Invalid payment term ID');
      }

      // Update payment term status to active (1)
      const response = await axios.put<SinglePaymentTermResponse>(`${endpoints.key}${endpoints.update}${paymentTermId}`, { status: 1 });

      // Get the updated payment term from response
      const updatedPaymentTerm: PaymentTerm = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: PaymentTermListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedPaymentTerms = currentData.data.map((pt: PaymentTerm) => (pt.id === paymentTermId ? updatedPaymentTerm : pt));

          return {
            ...currentData,
            data: updatedPaymentTerms
          };
        },
        { revalidate: false }
      );

      // Also update the single payment term cache
      await mutate(
        `${endpoints.key}${endpoints.list}${paymentTermId}`,
        {
          data: updatedPaymentTerm,
          meta: { message: 'Payment term activated successfully' }
        } as SinglePaymentTermResponse,
        { revalidate: false }
      );

      // Return the updated payment term
      return updatedPaymentTerm;
    } catch (error) {
      console.error('Error activating payment term:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to activate payment term');
    }
  };

  return {
    list,
    getById,
    create,
    update,
    delete: deletePaymentTerm,
    deactivate: deactivatePaymentTerm,
    activate: activatePaymentTerm
  };
}

// Standalone function to get all payment terms (for select options, etc.)
export const getPaymentTerms = async (): Promise<PaymentTerm[]> => {
  try {
    const response = await axiosServices.get<PaymentTermListResponse>(endpoints.key + endpoints.list);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching payment terms:', error);
    throw new Error('Failed to fetch payment terms');
  }
};
