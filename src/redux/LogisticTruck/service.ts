import { CreatePCTruckSchedule, FetchPCTruckSchedule, UpdatePCTruckSchedule } from 'types/contracts/logistic/truck';
import axiosServices from 'utils/axios';

const API = 'api/purchasecontracttruckschedule';

export const getPCTruckSchedule = async (params: FetchPCTruckSchedule) => {
  return axiosServices.get(`${API}/page`, {
    params
  });
};

export const createPCTruckSchedule = async (data: CreatePCTruckSchedule) => {
  return axiosServices.post(API, data);
};

export const updatePCTruckSchedule = (id: number, data: UpdatePCTruckSchedule) => {
  return axiosServices.put(`${API}/${id}`, data);
};

export const deletePCTruckSchedule = (id: number) => {
  return axiosServices.delete(`${API}/${id}`);
};
