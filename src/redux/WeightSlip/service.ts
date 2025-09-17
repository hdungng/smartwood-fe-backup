import axiosServices from 'utils/axios';
import { PCWeightTicket, PCWeightTicketItem } from 'types/contracts/purchase/weight-slip';
import { omit } from 'lodash-es';
import { PurchaseContract } from 'types/contracts/purchase/logistic';

export const fetchPCWeightTicketByID = async (id: number) => {
  const response = await axiosServices.get(`api/purchasecontractweightticket/${id}`);

  return response;
};

export const createPCWeightTicket = async (data: Partial<PCWeightTicket>) => {
  const response = await axiosServices.post(`api/purchasecontractweightticket`, omit(data, ['id']));

  return response;
};

export const updatePCWeightTicket = async (id: number, data: Partial<PCWeightTicket>) => {
  const response = await axiosServices.put(`api/purchasecontractweightticket/${id}`, data);

  return response;
};

export const fetchPCWeightTicketDetailByPCWeightTicketID = async (PCWeightTicketID: number) => {
  const response = await axiosServices.get(`api/purchasecontractweightticketdetail`, {
    params: {
      WeightTicketId: PCWeightTicketID
    }
  });

  return response;
};

export const createPCWeightTicketDetail = async (data: Partial<PCWeightTicketItem>) => {
  const response = await axiosServices.post(`api/purchasecontractweightticketdetail`, omit(data, ['id']));

  return response;
};

export const updatePCWeightTicketDetail = async (id: number, data: Partial<PCWeightTicketItem>) => {
  const response = await axiosServices.put(`api/purchasecontractweightticketdetail/${id}`, data);

  return response;
};

export const deletePCWeightTicketDetail = async (id: number) => {
  const response = await axiosServices.delete(`api/purchasecontractweightticketdetail/${id}`);

  return response;
};

export const updatePurchaseContractByID = async (id: number, data: Partial<PurchaseContract>) => {
  const response = await axiosServices.put(`api/purchasecontract/${id}`, data);

  return response;
};
