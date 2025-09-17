import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

// const axiosServices = axios.create({ baseURL: import.meta.env.VITE_APP_API_URL || 'http://20.195.15.250:8000/' });
const axiosServices = axios.create({ baseURL: import.meta.env.VITE_APP_API_URL || 'http://20.195.15.250:9000/' });

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem('serviceToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const currentRegion = localStorage.getItem('region');
    if(currentRegion) {
      config.headers['x-region'] = currentRegion;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized and 403 Forbidden errors
    if ((error.response?.status === 401 || error.response?.status === 403) && !window.location.href.includes('/login')) {
      // Clear all authentication data from localStorage
      localStorage.removeItem('serviceToken');
      localStorage.removeItem('users');
      
      // Clear axios default headers
      delete axiosServices.defaults.headers.common['Authorization'];
      
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject((error.response && error.response.data) || 'Wrong Services');
  }
);

const cancelToken = axios.CancelToken;

export { cancelToken, AxiosResponse, AxiosRequestConfig };

export default axiosServices;

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.get(url, { ...config });

  return res.data;
};

export const fetcherPost = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.post(url, { ...config });

  return res.data;
};
