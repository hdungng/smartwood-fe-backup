import { FetchPCShipSchedule, UpdatePCShipSchedule } from 'types/contracts/logistic/ship';
import axiosServices from 'utils/axios';

const API = 'api/purchasecontractshippingschedule';

export const getPCShipSchedule = async (params: FetchPCShipSchedule) => {
  return axiosServices.get(`${API}/page`, {
    params
  });
};

export const updatePCShipSchedule = (id: number, data: UpdatePCShipSchedule) => {
  return axiosServices.put(`${API}/${id}`, data);
};
