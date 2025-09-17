import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { Supplier, SupplierFormData, SupplierParams } from 'types/supplier';
import axios, { fetcher } from 'utils/axios';
import axiosServices from 'utils/axios';
import { SUPPLIER_API } from './constants';

// API endpoints
const endpoints = {
  key: 'api/supplier',
  list: '/',
  insert: '/',
  update: '/',
  delete: '/'
} as const;

// ==============================|| TYPES ||============================== //
interface SupplierListResponse {
  data: Supplier[];
  meta: {
    message: string;
  };
}

interface SingleSupplierResponse {
  data: Supplier;
  meta: {
    message: string;
  };
}

// Hook chung cho tất cả thao tác CRUD với Supplier
export default function useSupplier() {
  const list = (params?: SupplierParams) => {
    const queryParams = new URLSearchParams();
    queryParams.set('status', '-1'); // set default status to GET ALL include inactive and active
    // Add params to search query string with better validation
    if (params?.page && params.page > 0) queryParams.append('page', params.page.toString());
    if (params?.limit && params.limit > 0) queryParams.append('limit', params.limit.toString());
    if (params?.search?.trim()) queryParams.append('search', params.search.trim());
    if (params?.sortBy?.trim()) queryParams.append('sortBy', params.sortBy.trim());
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.status !== undefined) queryParams.append('status', params.status.toString());
    if (params?.supplierType?.trim()) queryParams.append('supplierType', params.supplierType.trim());
    if (params?.email?.trim()) queryParams.append('email', params.email.trim());
    if (params?.phone?.trim()) queryParams.append('phone', params.phone.trim());
    if (params?.code?.trim()) queryParams.append('code', params.code.trim());
    if (params?.name?.trim()) queryParams.append('name', params.name.trim());
    if (params?.address?.trim()) queryParams.append('address', params.address.trim());
    if (params?.taxCode?.trim()) queryParams.append('taxCode', params.taxCode.trim());
    if (params?.website?.trim()) queryParams.append('website', params.website.trim());
    if (params?.contactPerson?.trim()) queryParams.append('contactPerson', params.contactPerson.trim());
    if (params?.contactPhone?.trim()) queryParams.append('contactPhone', params.contactPhone.trim());
    if (params?.contactEmail?.trim()) queryParams.append('contactEmail', params.contactEmail.trim());
    if (params?.region?.trim()) queryParams.append('region', params.region.trim());
    if (params?.province?.trim()) queryParams.append('province', params.province.trim());
    if (params?.district?.trim()) queryParams.append('district', params.district.trim());
    if (params?.costSpend && params.costSpend > 0) queryParams.append('costSpend', params.costSpend.toString());
    if (params?.costRemain && params.costRemain > 0) queryParams.append('costRemain', params.costRemain.toString());
    if (params?.country?.trim()) queryParams.append('country', params.country.trim());
    if (params?.city?.trim()) queryParams.append('city', params.city.trim());
    if (params?.rating && params.rating > 0) queryParams.append('rating', params.rating.toString());

    const queryString = queryParams.toString();
    const url = `${endpoints.key}${endpoints.list}${queryString ? `?${queryString}` : ''}`;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<SupplierListResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
      errorRetryInterval: 1000
    });

    return useMemo(
      () => ({
        suppliers: data?.data || [],
        suppliersLoading: isLoading,
        suppliersError: error,
        suppliersValidating: isValidating,
        suppliersEmpty: !isLoading && !data?.data?.length,
        suppliersTotal: data?.data?.length || 0,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const getById = (supplierId: number) => {
    const shouldFetch = supplierId && supplierId > 0;
    const url = shouldFetch ? `${endpoints.key}${endpoints.list}${supplierId}` : null;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<SingleSupplierResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2
    });

    return useMemo(
      () => ({
        supplier: data?.data,
        supplierLoading: isLoading,
        supplierError: error,
        supplierValidating: isValidating,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const create = async (newSupplier: SupplierFormData): Promise<Supplier> => {
  try {
    if (!newSupplier.name?.trim()) {
      throw new Error('Thiếu trường bắt buộc: name');
    }
    // console.log('Tạo nhà cung cấp:', newSupplier);
    // console.log('Gọi API:', SUPPLIER_API.COMMON);
    const response = await axiosServices.post(SUPPLIER_API.COMMON, newSupplier);
    // console.log('Phản hồi API:', response.data);
    const createdSupplier = response.data.data;
    await mutate(
      (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
      (currentData: SupplierListResponse | undefined) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          data: [...(currentData.data || []), createdSupplier]
        };
      },
      { revalidate: false }
    );
    return createdSupplier;
  } catch (error: any) {
    console.error('Lỗi khi tạo nhà cung cấp:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Không thể tạo nhà cung cấp');
  }
};

  const update = async (supplierId: number, supplier: Partial<SupplierFormData>): Promise<Supplier> => {
    try {
      if (!supplierId || supplierId <= 0) {
        throw new Error('Invalid supplier ID');
      }

      //const response = await axios.put<SingleSupplierResponse>(`${endpoints.key}${endpoints.update}${supplierId}`, supplier);
      const response = await axiosServices.put(SUPPLIER_API.COMMON + `/${supplierId}`, supplier);

      // Get the updated supplier from response
      const updatedSupplier: Supplier = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: SupplierListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedSuppliers = currentData.data.map((s: Supplier) => (s.id === supplierId ? updatedSupplier : s));

          return {
            ...currentData,
            data: updatedSuppliers
          };
        },
        { revalidate: false }
      );

      // Also update the single supplier cache
      await mutate(
        `${endpoints.key}${endpoints.list}${supplierId}`,
        {
          data: updatedSupplier,
          meta: { message: 'Supplier updated successfully' }
        } as SingleSupplierResponse,
        { revalidate: false }
      );

      // Return the updated supplier
      return updatedSupplier;
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update supplier');
    }
  };

  const deleteSupplier = async (supplierId: number): Promise<void> => {
    try {
      if (!supplierId || supplierId <= 0) {
        throw new Error('Invalid supplier ID');
      }

      await axios.delete(`${endpoints.key}${endpoints.delete}${supplierId}`);

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: SupplierListResponse | undefined) => {
          if (!currentData) return currentData;

          const filteredSuppliers = currentData.data.filter((s: Supplier) => s.id !== supplierId);

          return {
            ...currentData,
            data: filteredSuppliers
          };
        },
        { revalidate: false }
      );
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete supplier');
    }
  };

  const deactivateSupplier = async (supplierId: number): Promise<Supplier> => {
    try {
      if (!supplierId || supplierId <= 0) {
        throw new Error('Invalid supplier ID');
      }

      // Update supplier status to inactive (0)
      //const response = await axios.put<SingleSupplierResponse>(`${endpoints.key}${endpoints.update}${supplierId}`, { status: 0 });
      const response = await axiosServices.put(SUPPLIER_API.COMMON + `/${supplierId}`, { status: 0 });

      // Get the updated supplier from response
      const updatedSupplier: Supplier = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: SupplierListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedSuppliers = currentData.data.map((s: Supplier) => (s.id === supplierId ? updatedSupplier : s));

          return {
            ...currentData,
            data: updatedSuppliers
          };
        },
        { revalidate: false }
      );

      // Also update the single supplier cache
      await mutate(
        `${endpoints.key}${endpoints.list}${supplierId}`,
        {
          data: updatedSupplier,
          meta: { message: 'Supplier deactivated successfully' }
        } as SingleSupplierResponse,
        { revalidate: false }
      );

      // Return the updated supplier
      return updatedSupplier;
    } catch (error) {
      console.error('Error deactivating supplier:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to deactivate supplier');
    }
  };

  const activateSupplier = async (supplierId: number): Promise<Supplier> => {
    try {
      if (!supplierId || supplierId <= 0) {
        throw new Error('Invalid supplier ID');
      }

      // Update supplier status to active (1)
      const response = await axios.put<SingleSupplierResponse>(`${endpoints.key}${endpoints.update}${supplierId}`, { status: 1 });

      // Get the updated supplier from response
      const updatedSupplier: Supplier = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: SupplierListResponse | undefined) => {
          if (!currentData) return currentData;

          const updatedSuppliers = currentData.data.map((s: Supplier) => (s.id === supplierId ? updatedSupplier : s));

          return {
            ...currentData,
            data: updatedSuppliers
          };
        },
        { revalidate: false }
      );

      // Also update the single supplier cache
      await mutate(
        `${endpoints.key}${endpoints.list}${supplierId}`,
        {
          data: updatedSupplier,
          meta: { message: 'Supplier activated successfully' }
        } as SingleSupplierResponse,
        { revalidate: false }
      );

      // Return the updated supplier
      return updatedSupplier;
    } catch (error) {
      console.error('Error activating supplier:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to activate supplier');
    }
  };

  return {
    list,
    getById,
    create,
    update,
    delete: deleteSupplier,
    deactivate: deactivateSupplier,
    activate: activateSupplier
  };
}
export const getSuppliers = async (): Promise<Supplier[]> => {
  const accessToken = localStorage.getItem('serviceToken');

  if (!accessToken) {
    // Nếu không có token, trả về mảng rỗng hoặc throw error tuỳ logic của bạn
    // throw new Error('No access token');
    return [];
  }

  const response = await axiosServices.get(`api/supplier`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return (response?.data?.data ?? []) as Supplier[];
};
