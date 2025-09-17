import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// utils
import { fetcher } from 'utils/axios';

// types
import { OrderList, OrderProps } from 'types/order';

const initialState: OrderProps = {
  modal: false
};

const endpoints = {
  key: 'api/order',
  list: '/list', // server URL
  modal: '/modal', // server URL
  insert: '/insert', // server URL
  update: '/update', // server URL
  delete: '/delete' // server URL
};

export function useGetOrder() {
  const { data, isLoading, error, isValidating } = useSWR(endpoints.key + endpoints.list, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      orders: data?.orders as OrderList[],
      ordersLoading: isLoading,
      ordersError: error,
      ordersValidating: isValidating,
      ordersEmpty: !isLoading && !data?.orders?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export async function insertOrder(newOrder: OrderList) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentOrder: any) => {
      newOrder.id = currentOrder.orders.length + 1;
      const addedOrder: OrderList[] = [...currentOrder.orders, newOrder];

      return {
        ...currentOrder,
        orders: addedOrder
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { newOrder };
  //   await axios.post(endpoints.key + endpoints.insert, data);
}

export async function updateOrder(orderId: number, updatedOrder: OrderList) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentOrder: any) => {
      const newOrder: OrderList[] = currentOrder.orders.map((order: OrderList) =>
        order.id === orderId ? { ...order, ...updatedOrder } : order
      );

      return {
        ...currentOrder,
        orders: newOrder
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { list: updatedOrder };
  //   await axios.post(endpoints.key + endpoints.update, data);
}

export async function deleteOrder(orderId: number) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentOrder: any) => {
      const nonDeletedOrder = currentOrder.orders.filter((order: OrderList) => order.id !== orderId);

      return {
        ...currentOrder,
        orders: nonDeletedOrder
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { orderId };
  //   await axios.post(endpoints.key + endpoints.delete, data);
}

export function useGetOrderMaster() {
  const { data, isLoading } = useSWR(endpoints.key + endpoints.modal, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      orderMaster: data,
      orderMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerOrderDialog(modal: boolean) {
  // to update local state based on key

  mutate(
    endpoints.key + endpoints.modal,
    (currentOrdermaster: any) => {
      return { ...currentOrdermaster, modal };
    },
    false
  );
}
