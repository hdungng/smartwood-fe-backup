import type { AxiosRequestConfig, AxiosResponse } from 'axios';

import type { ApiResult } from './types';
import { cancelToken } from 'utils/axios';

const createCancelToken = (executor: Dynamic) => (executor ? new cancelToken(executor) : cancelToken.source().token);

export const initializeRequest = (params?: DynamicObject, cancellation?: Dynamic): AxiosRequestConfig => {
  const config: AxiosRequestConfig = {
    params: { ...params }
  };

  if (cancellation) {
    config.cancelToken = createCancelToken(cancellation);
  }

  return config;
};

export const callApi = async <TResponse>(callback: Promise<AxiosResponse<ApiResult<TResponse>>>): Promise<ApiResult<TResponse>> => {
  try {
    const response = await callback;
    if (response.status >= 400) {
      return {
        status: response.status,
        error: response.data.error,
        success: false
      };
    }
    return {
      status: response.status,
      success: true,
      data: response?.data?.data,
      meta: response?.data?.meta
    };
  } catch (error: Dynamic) {
    return {
      ...error,
      data: undefined
    };
  }
};
