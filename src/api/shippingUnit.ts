import { TShippingUnit } from 'types/shippingUnit';
import axiosServices from 'utils/axios';

export const getShippingUnits = async (): Promise<TShippingUnit[]> => {
  const accessToken = localStorage.getItem('serviceToken');

  if (!accessToken) {
    // Nếu không có token, trả về mảng rỗng hoặc xử lý logic khác nếu muốn
    return [];
  }

  const response = await axiosServices.get(`api/shippingunit`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return (response?.data?.data ?? []) as TShippingUnit[];
};
