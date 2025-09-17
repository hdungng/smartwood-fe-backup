import axiosServices from 'utils/axios';
import { RFetchContract, RFetchContractByID, RUpdateContractByID, SaleContract, TActionFetchContract, WeighingInfo } from './type';

export const createContractWeigingInfo = async (
  data: WeighingInfo
): Promise<{
  status: number;
}> => {
  const response = await axiosServices.post(`api/salecontractweightticketexport`, data);

  return {
    status: response?.status
  };
};

export const fetchContract = async (params: TActionFetchContract): Promise<RFetchContract> => {
  const result = await axiosServices.get('/api/salecontract/page', {
    params: {
      ...params,
      page: params.page + 1
    }
  });

  return {
    data: result?.data?.data ?? [],
    meta: result?.data?.meta ?? {},
    status: result?.status
  };
};

export const fetchContractByID = async (id: number): Promise<RFetchContractByID> => {
  const result = await axiosServices.get(`/api/salecontract/${id}`);

  return {
    data: result?.data?.data ?? [],
    status: result?.status
  };
};

export const updateContractByID = async (id: number, data: Partial<SaleContract>): Promise<RUpdateContractByID> => {
  const result = await axiosServices.put(`/api/salecontract/${id}`, data);

  return {
    status: result?.status
  };
};

export const deleteContractByID = async (id: number): Promise<RUpdateContractByID> => {
  const result = await axiosServices.delete(`/api/salecontract/${id}`);

  return {
    status: result?.status
  };
};
