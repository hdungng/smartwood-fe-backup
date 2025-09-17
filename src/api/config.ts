import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { Config, ConfigFormData, ConfigParams, ConfigListResponse, SingleConfigResponse } from 'types/config';
import axios, { fetcher } from 'utils/axios';
import axiosServices from 'utils/axios';

// API endpoints
const endpoints = {
  key: 'api/config',
  list: '/',
  insert: '/',
  update: '/',
  delete: '/'
} as const;

// Hook chung cho tất cả thao tác CRUD với Config
export default function useConfig() {
  const list = (params?: ConfigParams) => {
    const queryParams = new URLSearchParams();

    // Add params to search query string with better validation
    if (params?.page && params.page > 0) queryParams.append('page', params.page.toString());
    if (params?.limit && params.limit > 0) queryParams.append('limit', params.limit.toString());
    if (params?.search?.trim()) queryParams.append('search', params.search.trim());
    if (params?.sortBy?.trim()) queryParams.append('sortBy', params.sortBy.trim());
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.code?.trim()) queryParams.append('code', params.code.trim());
    if (params?.name?.trim()) queryParams.append('name', params.name.trim());
    if (params?.codeType?.trim()) queryParams.append('codeType', params.codeType.trim());
    if (params?.screenName?.trim()) queryParams.append('screenName', params.screenName.trim());

    const queryString = queryParams.toString();
    const url = `${endpoints.key}${endpoints.list}${queryString ? `?${queryString}` : ''}`;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<ConfigListResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
      errorRetryInterval: 1000
    });

    return useMemo(
      () => ({
        configs: data?.data || [],
        configsLoading: isLoading,
        configsError: error,
        configsValidating: isValidating,
        configsEmpty: !isLoading && !data?.data?.length,
        configsTotal: data?.data?.length || 0,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const getById = (configId: number) => {
    const shouldFetch = configId && configId > 0;
    const url = shouldFetch ? `${endpoints.key}${endpoints.list}${configId}` : null;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<SingleConfigResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2
    });

    return useMemo(
      () => ({
        config: data?.data,
        configLoading: isLoading,
        configError: error,
        configValidating: isValidating,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const create = async (newConfig: ConfigFormData): Promise<Config> => {
    try {
      // Validate required fields
      if (!newConfig.code?.trim() || !newConfig.name?.trim()) {
        throw new Error('Missing required fields');
      }

      const response = await axios.post<SingleConfigResponse>(endpoints.key + endpoints.insert, newConfig);

      // Get the newly created config from response
      const createdConfig = response.data.data;

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ConfigListResponse | undefined) => {
          if (!currentData) return currentData;

          return {
            ...currentData,
            data: [...(currentData.data || []), createdConfig]
          };
        },
        { revalidate: false }
      );

      // Return the newly created config
      return createdConfig;
    } catch (error) {
      console.error('Error creating config:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create config');
    }
  };

  const update = async (configId: number, config: Partial<ConfigFormData>): Promise<Config> => {
    try {
      if (!configId || configId <= 0) {
        throw new Error('Invalid config ID');
      }

      const response = await axios.put<SingleConfigResponse>(`${endpoints.key}${endpoints.update}${configId}`, config);

      // Get the updated config from response
      const updatedConfig: Config = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ConfigListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedConfigs = currentData.data.map((c: Config) => (c.id === configId ? updatedConfig : c));

          return {
            ...currentData,
            data: updatedConfigs
          };
        },
        { revalidate: false }
      );

      // Also update the single config cache
      await mutate(
        `${endpoints.key}${endpoints.list}${configId}`,
        {
          data: updatedConfig,
          meta: { message: 'Config updated successfully' }
        } as SingleConfigResponse,
        { revalidate: false }
      );

      // Return the updated config
      return updatedConfig;
    } catch (error) {
      console.error('Error updating config:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update config');
    }
  };

  const updateMetadata = async (configId: number, metadata: any): Promise<Config> => {
    try {
      if (!configId || configId <= 0) {
        throw new Error('Invalid config ID');
      }

      const response = await axios.put<SingleConfigResponse>(`${endpoints.key}${endpoints.update}${configId}`, { metadata });

      // Get the updated config from response
      const updatedConfig: Config = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ConfigListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedConfigs = currentData.data.map((c: Config) => (c.id === configId ? updatedConfig : c));

          return {
            ...currentData,
            data: updatedConfigs
          };
        },
        { revalidate: false }
      );

      // Also update the single config cache
      await mutate(
        `${endpoints.key}${endpoints.list}${configId}`,
        {
          data: updatedConfig,
          meta: { message: 'Config metadata updated successfully' }
        } as SingleConfigResponse,
        { revalidate: false }
      );

      // Return the updated config
      return updatedConfig;
    } catch (error) {
      console.error('Error updating config metadata:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update config metadata');
    }
  };

  const deleteConfig = async (configId: number): Promise<void> => {
    try {
      if (!configId || configId <= 0) {
        throw new Error('Invalid config ID');
      }

      await axios.delete(`${endpoints.key}${endpoints.delete}${configId}`);

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ConfigListResponse | undefined) => {
          if (!currentData) return currentData;

          const filteredConfigs = currentData.data.filter((c: Config) => c.id !== configId);

          return {
            ...currentData,
            data: filteredConfigs
          };
        },
        { revalidate: false }
      );
    } catch (error) {
      console.error('Error deleting config:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete config');
    }
  };

  const activate = async (configId: number): Promise<Config> => {
    try {
      if (!configId || configId <= 0) {
        throw new Error('Invalid config ID');
      }

      const response = await axios.put<SingleConfigResponse>(`${endpoints.key}${endpoints.update}${configId}`, { status: 1 });

      // Get the updated config from response
      const updatedConfig: Config = {
        ...response.data.data,
        status: 1,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ConfigListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedConfigs = currentData.data.map((c: Config) => (c.id === configId ? updatedConfig : c));

          return {
            ...currentData,
            data: updatedConfigs
          };
        },
        { revalidate: false }
      );

      // Also update the single config cache
      await mutate(
        `${endpoints.key}${endpoints.list}${configId}`,
        {
          data: updatedConfig,
          meta: { message: 'Config activated successfully' }
        } as SingleConfigResponse,
        { revalidate: false }
      );

      // Return the updated config
      return updatedConfig;
    } catch (error) {
      console.error('Error activating config:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to activate config');
    }
  };

  const deactivate = async (configId: number): Promise<Config> => {
    try {
      if (!configId || configId <= 0) {
        throw new Error('Invalid config ID');
      }

      const response = await axios.put<SingleConfigResponse>(`${endpoints.key}${endpoints.update}${configId}`, { status: 0 });

      // Get the updated config from response
      const updatedConfig: Config = {
        ...response.data.data,
        status: 0,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: ConfigListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedConfigs = currentData.data.map((c: Config) => (c.id === configId ? updatedConfig : c));

          return {
            ...currentData,
            data: updatedConfigs
          };
        },
        { revalidate: false }
      );

      // Also update the single config cache
      await mutate(
        `${endpoints.key}${endpoints.list}${configId}`,
        {
          data: updatedConfig,
          meta: { message: 'Config deactivated successfully' }
        } as SingleConfigResponse,
        { revalidate: false }
      );

      // Return the updated config
      return updatedConfig;
    } catch (error) {
      console.error('Error deactivating config:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to deactivate config');
    }
  };

  return {
    list,
    getById,
    create,
    update,
    updateMetadata,
    delete: deleteConfig,
    activate,
    deactivate
  };
}

export const getConfigs = async (): Promise<Config[]> => {
  const accessToken = localStorage.getItem('serviceToken');

  if (!accessToken) {
    return [];
  }

  const response = await axiosServices.get(`api/config`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return (response?.data?.data ?? []) as Config[];
};
