import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { User, UserFormData, UserParams, UserSimpleResponse } from 'types/user.type';
import { SimpleResponse } from 'types/common';
import axios, { fetcher } from 'utils/axios';
// In normmal endpoint simple '/', using method GET, POST, PUT, DELETE is enough,
// but in this case we need to specify the path to the api
const endpoints = {
  key: 'api/user',
  list: '/',
  insert: '/',
  update: '/',
  delete: '/'
} as const;

// ==============================|| TYPES ||============================== //
interface UserListResponse {
  data: User[];
  meta: {
    message: string;
  };
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

interface SingleUserResponse {
  data: User;
  meta: {
    message: string;
  };
}

// Hook chung cho tất cả thao tác CRUD với User
export default function useUser() {
  const list = (params?: UserParams) => {
    const queryParams = new URLSearchParams();

    // Add params to search query string with better validation
    if (params?.page && params.page > 0) queryParams.append('page', params.page.toString());
    if (params?.limit && params.limit > 0) queryParams.append('limit', params.limit.toString());
    if (params?.search?.trim()) queryParams.append('search', params.search.trim());
    if (params?.sortBy?.trim()) queryParams.append('sortBy', params.sortBy.trim());
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.status !== undefined) queryParams.append('status', params.status.toString());
    if (params?.roleId && params.roleId > 0) queryParams.append('roleId', params.roleId.toString());
    if (params?.email?.trim()) queryParams.append('email', params.email.trim());
    if (params?.username?.trim()) queryParams.append('username', params.username.trim());
    if (params?.language?.trim()) queryParams.append('language', params.language.trim());
    if (params?.password?.trim()) queryParams.append('password', params.password.trim());
    if (params?.name?.trim()) queryParams.append('name', params.name.trim());

    const queryString = queryParams.toString();
    const url = `${endpoints.key}${endpoints.list}${queryString ? `?${queryString}` : ''}`;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<UserListResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
      errorRetryInterval: 1000
    });

    return useMemo(
      () => ({
        users: data?.data || [],
        usersLoading: isLoading,
        usersError: error,
        usersValidating: isValidating,
        usersEmpty: !isLoading && !data?.data?.length,
        usersTotal: data?.data?.length || 0,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const getById = (userId: number) => {
    const shouldFetch = userId && userId > 0;
    const url = shouldFetch ? `${endpoints.key}${endpoints.list}${userId}` : null;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<SingleUserResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2
    });

    return useMemo(
      () => ({
        user: data?.data,
        userLoading: isLoading,
        userError: error,
        userValidating: isValidating,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const create = async (newUser: UserFormData): Promise<User> => {
    try {
      // Validate required fields
      if (!newUser.name?.trim() || !newUser.email?.trim() || !newUser.username?.trim()) {
        throw new Error('Missing required fields');
      }

      const response = await axios.post<SingleUserResponse>(endpoints.key + endpoints.insert, newUser);

      // Get the newly created user from response
      const createdUser = response.data.data;

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: UserListResponse | undefined) => {
          if (!currentData) return currentData;

          return {
            ...currentData,
            data: [...(currentData.data || []), createdUser]
          };
        },
        { revalidate: false }
      );

      // Return the newly created user
      return createdUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create user');
    }
  };

  const update = async (userId: number, user: Partial<UserFormData>): Promise<User> => {
    try {
      if (!userId || userId <= 0) {
        throw new Error('Invalid user ID');
      }

      const response = await axios.put<SingleUserResponse>(`${endpoints.key}${endpoints.update}${userId}`, user);

      // Get the updated user from response
      const updatedUser: User = {
        ...response.data.data,
        lastUpdatedAt: new Date().toISOString()
      };

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: UserListResponse | undefined) => {
          if (!currentData) return currentData;
          // console.log(currentData);
          const updatedUsers = currentData.data.map((u: User) => (u.id === userId ? updatedUser : u));

          return {
            ...currentData,
            data: updatedUsers
          };
        },
        { revalidate: false }
      );

      // Also update the single user cache
      await mutate(
        `${endpoints.key}${endpoints.list}${userId}`,
        {
          data: updatedUser,
          meta: { message: 'User updated successfully' }
        } as SingleUserResponse,
        { revalidate: false }
      );

      // Return the updated user
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update user');
    }
  };

  const deleteUser = async (userId: number): Promise<void> => {
    try {
      if (!userId || userId <= 0) {
        throw new Error('Invalid user ID');
      }

      await axios.delete(`${endpoints.key}${endpoints.delete}${userId}`);

      // Update local state after successful server response
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        (currentData: UserListResponse | undefined) => {
          if (!currentData) return currentData;

          const filteredUsers = currentData.data.filter((u: User) => u.id !== userId);

          return {
            ...currentData,
            data: filteredUsers
          };
        },
        { revalidate: false }
      );
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  return {
    list,
    getById,
    create,
    update,
    delete: deleteUser
  };
}
