import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import {
  TExchangeRate,
  CreateExchangeRateData,
  ExchangeRateFilters,
  ExchangeRateParams,
  UpdateExchangeRateData
} from 'types/exchange-rate';
import { SimpleResponse } from 'types/common';
import axios, { fetcher } from 'utils/axios';
import axiosServices from 'utils/axios';

// API endpoints
const endpoints = {
  key: 'api/exchangerate',
  list: '/',
  insert: '/',
  update: '/',
  delete: '/'
} as const;

// ==============================|| TYPES ||============================== //
interface ExchangeRateListResponse {
  data: TExchangeRate[];
  meta: {
    message: string;
  };
}

interface SingleExchangeRateResponse {
  data: TExchangeRate;
  meta: {
    message: string;
  };
}

// Hook chung cho tất cả thao tác CRUD với ExchangeRate
export default function useExchangeRate() {
  const list = (params?: ExchangeRateParams) => {
    const queryParams = new URLSearchParams();
    queryParams.set('status', '-1'); // set default status to GET ALL include inactive and active

    // Add params to search query string with better validation
    if (params?.page && params.page > 0) queryParams.append('page', params.page.toString());
    if (params?.limit && params.limit > 0) queryParams.append('limit', params.limit.toString());
    if (params?.search?.trim()) queryParams.append('search', params.search.trim());
    if (params?.sortBy?.trim()) queryParams.append('sortBy', params.sortBy.trim());
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.status !== undefined) queryParams.append('status', params.status.toString());
    if (params?.fromCurrency?.trim()) queryParams.append('fromCurrency', params.fromCurrency.trim());
    if (params?.toCurrency?.trim()) queryParams.append('toCurrency', params.toCurrency.trim());
    if (params?.rateType?.trim()) queryParams.append('rateType', params.rateType.trim());
    if (params?.source?.trim()) queryParams.append('source', params.source.trim());
    if (params?.code?.trim()) queryParams.append('code', params.code.trim());
    if (params?.name?.trim()) queryParams.append('name', params.name.trim());
    if (params?.effectiveDate?.trim()) queryParams.append('effectiveDate', params.effectiveDate.trim());
    if (params?.expiryDate?.trim()) queryParams.append('expiryDate', params.expiryDate.trim());
    if (params?.exchangeRate && params.exchangeRate > 0) queryParams.append('exchangeRate', params.exchangeRate.toString());
    if (params?.buyRate && params.buyRate > 0) queryParams.append('buyRate', params.buyRate.toString());
    if (params?.sellRate && params.sellRate > 0) queryParams.append('sellRate', params.sellRate.toString());

    const queryString = queryParams.toString();
    const url = `${endpoints.key}${endpoints.list}${queryString ? `?${queryString}` : ''}`;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<ExchangeRateListResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
      errorRetryInterval: 1000
    });

    return useMemo(
      () => ({
        exchangeRates: data?.data || [],
        exchangeRatesLoading: isLoading,
        exchangeRatesError: error,
        exchangeRatesValidating: isValidating,
        exchangeRatesEmpty: !isLoading && !data?.data?.length,
        exchangeRatesTotal: data?.data?.length || 0,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const getById = (exchangeRateId: number) => {
    const shouldFetch = exchangeRateId && exchangeRateId > 0;
    const url = shouldFetch ? `${endpoints.key}${endpoints.list}${exchangeRateId}` : null;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<SingleExchangeRateResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2
    });

    return useMemo(
      () => ({
        exchangeRate: data?.data,
        exchangeRateLoading: isLoading,
        exchangeRateError: error,
        exchangeRateValidating: isValidating,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const getByFromToCurrency = (fromCurrency: string, toCurrency: string, effectiveDate?: string, expiryDate?: string) => {
    const shouldFetch = fromCurrency?.trim() && toCurrency?.trim();

    const queryParams = new URLSearchParams();
    if (fromCurrency?.trim()) queryParams.append('fromCurrency', fromCurrency.trim().toUpperCase());
    if (toCurrency?.trim()) queryParams.append('toCurrency', toCurrency.trim().toUpperCase());
    if (effectiveDate?.trim()) queryParams.append('effectiveDate', effectiveDate.trim());
    if (expiryDate?.trim()) queryParams.append('expiryDate', expiryDate.trim());

    const queryString = queryParams.toString();
    const url = shouldFetch ? `${endpoints.key}${endpoints.list}?${queryString}` : null;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<ExchangeRateListResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2
    });

    return useMemo(
      () => ({
        exchangeRates: data?.data || [],
        exchangeRatesLoading: isLoading,
        exchangeRatesError: error,
        exchangeRatesValidating: isValidating,
        exchangeRatesEmpty: !isLoading && !data?.data?.length,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const create = async (newExchangeRate: CreateExchangeRateData): Promise<TExchangeRate> => {
    try {
      // Validate required fields
      if (!newExchangeRate.name?.trim() || !newExchangeRate.fromCurrency?.trim() || !newExchangeRate.toCurrency?.trim()) {
        throw new Error('Missing required fields');
      }

      const response = await axios.post<SingleExchangeRateResponse>(endpoints.key + endpoints.insert, newExchangeRate);

      // Get the newly created exchange rate from response
      const createdExchangeRate = response.data.data;

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ExchangeRateListResponse | undefined) => {
          if (!currentData) return currentData;

          return {
            ...currentData,
            data: [...(currentData.data || []), createdExchangeRate]
          };
        },
        { revalidate: false }
      );

      // Return the newly created exchange rate
      return createdExchangeRate;
    } catch (error) {
      console.error('Error creating exchange rate:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create exchange rate');
    }
  };

  const update = async (exchangeRateId: number, exchangeRate: Partial<CreateExchangeRateData>): Promise<TExchangeRate> => {
    try {
      if (!exchangeRateId || exchangeRateId <= 0) {
        throw new Error('Invalid exchange rate ID');
      }

      const response = await axios.put<SingleExchangeRateResponse>(`${endpoints.key}${endpoints.update}${exchangeRateId}`, exchangeRate);

      // Get the updated exchange rate from response
      const updatedExchangeRate: TExchangeRate = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ExchangeRateListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedExchangeRates = currentData.data.map((er: TExchangeRate) => (er.id === exchangeRateId ? updatedExchangeRate : er));

          return {
            ...currentData,
            data: updatedExchangeRates
          };
        },
        { revalidate: false }
      );

      // Also update the single exchange rate cache
      await mutate(
        `${endpoints.key}${endpoints.list}${exchangeRateId}`,
        {
          data: updatedExchangeRate,
          meta: { message: 'Exchange rate updated successfully' }
        } as SingleExchangeRateResponse,
        { revalidate: false }
      );

      // Return the updated exchange rate
      return updatedExchangeRate;
    } catch (error) {
      console.error('Error updating exchange rate:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update exchange rate');
    }
  };

  const deleteExchangeRate = async (exchangeRateId: number): Promise<void> => {
    try {
      if (!exchangeRateId || exchangeRateId <= 0) {
        throw new Error('Invalid exchange rate ID');
      }

      await axios.delete(`${endpoints.key}${endpoints.delete}${exchangeRateId}`);

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ExchangeRateListResponse | undefined) => {
          if (!currentData) return currentData;

          const filteredExchangeRates = currentData.data.filter((er: TExchangeRate) => er.id !== exchangeRateId);

          return {
            ...currentData,
            data: filteredExchangeRates
          };
        },
        { revalidate: false }
      );
    } catch (error) {
      console.error('Error deleting exchange rate:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete exchange rate');
    }
  };

  const deactivateExchangeRate = async (exchangeRateId: number): Promise<TExchangeRate> => {
    try {
      if (!exchangeRateId || exchangeRateId <= 0) {
        throw new Error('Invalid exchange rate ID');
      }

      // Update exchange rate status to inactive (0)
      const response = await axios.put<SingleExchangeRateResponse>(`${endpoints.key}${endpoints.update}${exchangeRateId}`, { status: 0 });

      // Get the updated exchange rate from response
      const updatedExchangeRate: TExchangeRate = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ExchangeRateListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedExchangeRates = currentData.data.map((er: TExchangeRate) => (er.id === exchangeRateId ? updatedExchangeRate : er));

          return {
            ...currentData,
            data: updatedExchangeRates
          };
        },
        { revalidate: false }
      );

      // Also update the single exchange rate cache
      await mutate(
        `${endpoints.key}${endpoints.list}${exchangeRateId}`,
        {
          data: updatedExchangeRate,
          meta: { message: 'Exchange rate deactivated successfully' }
        } as SingleExchangeRateResponse,
        { revalidate: false }
      );

      // Return the updated exchange rate
      return updatedExchangeRate;
    } catch (error) {
      console.error('Error deactivating exchange rate:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to deactivate exchange rate');
    }
  };

  const activateExchangeRate = async (exchangeRateId: number): Promise<TExchangeRate> => {
    try {
      if (!exchangeRateId || exchangeRateId <= 0) {
        throw new Error('Invalid exchange rate ID');
      }

      // Update exchange rate status to active (1)
      const response = await axios.put<SingleExchangeRateResponse>(`${endpoints.key}${endpoints.update}${exchangeRateId}`, { status: 1 });

      // Get the updated exchange rate from response
      const updatedExchangeRate: TExchangeRate = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ExchangeRateListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedExchangeRates = currentData.data.map((er: TExchangeRate) => (er.id === exchangeRateId ? updatedExchangeRate : er));

          return {
            ...currentData,
            data: updatedExchangeRates
          };
        },
        { revalidate: false }
      );

      // Also update the single exchange rate cache
      await mutate(
        `${endpoints.key}${endpoints.list}${exchangeRateId}`,
        {
          data: updatedExchangeRate,
          meta: { message: 'Exchange rate activated successfully' }
        } as SingleExchangeRateResponse,
        { revalidate: false }
      );

      // Return the updated exchange rate
      return updatedExchangeRate;
    } catch (error) {
      console.error('Error activating exchange rate:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to activate exchange rate');
    }
  };

  return {
    list,
    getById,
    getByFromToCurrency,
    create,
    update,
    delete: deleteExchangeRate,
    deactivate: deactivateExchangeRate,
    activate: activateExchangeRate
  };
}

export const getExchangeRates = async (fromCurrency?: string, toCurrency?: string): Promise<TExchangeRate[]> => {
  const accessToken = localStorage.getItem('serviceToken');

  if (!accessToken) {
    // Nếu không có token, trả về mảng rỗng hoặc throw error tuỳ logic của bạn
    // throw new Error('No access token');
    return [];
  }

  const queryParams = new URLSearchParams();
  if (fromCurrency?.trim()) queryParams.append('fromCurrency', fromCurrency.trim());
  if (toCurrency?.trim()) queryParams.append('toCurrency', toCurrency.trim());

  const queryString = queryParams.toString();
  const url = `api/exchangerate${queryString ? `?${queryString}` : ''}`;

  const response = await axiosServices.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return (response?.data?.data ?? []) as TExchangeRate[];
};
