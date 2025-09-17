import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { CodeDetailData } from 'types/config';
import axios, { fetcher } from 'utils/axios';

// API endpoints
const endpoints = {
  key: 'api/codedetail',
  list: '/',
  insert: '/',
  update: '/',
  delete: '/',
  configDetail: '/api/configdetail'
} as const;

// ==============================|| TYPES ||============================== //
interface CodeDetailListResponse {
  data: CodeDetailData[];
  meta: {
    message: string;
  };
}

interface SingleCodeDetailResponse {
  data: CodeDetailData;
  meta: {
    message: string;
  };
}

// Hook chung cho tất cả thao tác CRUD với CodeDetail
export default function useCodeDetail() {
  const list = (codeId?: number) => {
    const shouldFetch = codeId && codeId > 0;
    const url = shouldFetch ? `${endpoints.key}${endpoints.list}?codeId=${codeId}` : null;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<CodeDetailListResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
      errorRetryInterval: 1000
    });

    return useMemo(
      () => ({
        codeDetails: data?.data || [],
        codeDetailsLoading: isLoading,
        codeDetailsError: error,
        codeDetailsValidating: isValidating,
        codeDetailsEmpty: !isLoading && !data?.data?.length,
        codeDetailsTotal: data?.data?.length || 0,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const getById = (codeDetailId: number) => {
    const shouldFetch = codeDetailId && codeDetailId > 0;
    const url = shouldFetch ? `${endpoints.key}${endpoints.list}${codeDetailId}` : null;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<SingleCodeDetailResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2
    });

    return useMemo(
      () => ({
        codeDetail: data?.data,
        codeDetailLoading: isLoading,
        codeDetailError: error,
        codeDetailValidating: isValidating,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const create = async (newCodeDetail: CodeDetailData): Promise<CodeDetailData> => {
    try {
      // Validate required fields
      if (!newCodeDetail.name?.trim() || !newCodeDetail.value?.trim()) {
        throw new Error('Tên và Giá trị không được để trống');
      }

      const response = await axios.post<SingleCodeDetailResponse>(endpoints.key + endpoints.insert, newCodeDetail);

      // Get the newly created code detail from response
      const createdCodeDetail = response.data.data;

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list),
        (currentData: CodeDetailListResponse | undefined) => {
          if (!currentData) return currentData;

          return {
            ...currentData,
            data: [...(currentData.data || []), createdCodeDetail]
          };
        },
        { revalidate: false }
      );

      // Return the newly created code detail
      return createdCodeDetail;
    } catch (error) {
      console.error('Error creating code detail:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create code detail');
    }
  };

  const update = async (codeDetailId: number, codeDetail: Partial<CodeDetailData>): Promise<CodeDetailData> => {
    try {
      if (!codeDetailId || codeDetailId <= 0) {
        throw new Error('Invalid code detail ID');
      }

      const response = await axios.put<SingleCodeDetailResponse>(`${endpoints.key}${endpoints.update}${codeDetailId}`, codeDetail);

      // Get the updated code detail from response
      const updatedCodeDetail: CodeDetailData = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list),
        (currentData: CodeDetailListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedCodeDetails = currentData.data.map((cd: CodeDetailData) => (cd.id === codeDetailId ? updatedCodeDetail : cd));

          return {
            ...currentData,
            data: updatedCodeDetails
          };
        },
        { revalidate: false }
      );

      // Also update the single code detail cache
      await mutate(
        `${endpoints.key}${endpoints.list}${codeDetailId}`,
        {
          data: updatedCodeDetail,
          meta: { message: 'Code detail updated successfully' }
        } as SingleCodeDetailResponse,
        { revalidate: false }
      );

      // Return the updated code detail
      return updatedCodeDetail;
    } catch (error) {
      console.error('Error updating code detail:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update code detail');
    }
  };

  const deleteCodeDetail = async (codeDetailId: number): Promise<void> => {
    try {
      if (!codeDetailId || codeDetailId <= 0) {
        throw new Error('Invalid code detail ID');
      }

      await axios.delete(`${endpoints.key}${endpoints.delete}${codeDetailId}`);

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list),
        (currentData: CodeDetailListResponse | undefined) => {
          if (!currentData) return currentData;

          const filteredCodeDetails = currentData.data.filter((cd: CodeDetailData) => cd.id !== codeDetailId);

          return {
            ...currentData,
            data: filteredCodeDetails
          };
        },
        { revalidate: false }
      );
    } catch (error) {
      console.error('Error deleting code detail:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete code detail');
    }
  };

  const deleteConfigDetail = async (configDetailId: number): Promise<void> => {
    try {
      if (!configDetailId || configDetailId <= 0) {
        throw new Error('Invalid config detail ID');
      }

      await axios.delete(`${endpoints.configDetail}/${configDetailId}`);

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list),
        (currentData: CodeDetailListResponse | undefined) => {
          if (!currentData) return currentData;

          const filteredCodeDetails = currentData.data.filter((cd: CodeDetailData) => cd.id !== configDetailId);

          return {
            ...currentData,
            data: filteredCodeDetails
          };
        },
        { revalidate: false }
      );
    } catch (error) {
      console.error('Error deleting config detail:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete config detail');
    }
  };

  return {
    list,
    getById,
    create,
    update,
    delete: deleteCodeDetail,
    deleteConfigDetail
  };
}

// Standalone function for getting code details
export const getCodeDetails = async (codeId?: number): Promise<CodeDetailData[]> => {
  const accessToken = localStorage.getItem('serviceToken');

  if (!accessToken) {
    return [];
  }

  const url = codeId ? `${endpoints.key}?codeId=${codeId}` : endpoints.key;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return (response?.data?.data ?? []) as CodeDetailData[];
};
