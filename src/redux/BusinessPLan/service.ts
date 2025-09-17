import axiosServices from 'utils/axios';
import { BusinessPlan, RFetchBusinessPlan, RFetchBusinessPlanByID, RUpdateBusinessPlanByID, TActionFetchBusinessPlan } from './type';

export const fetchBusinessPlan = async (params: TActionFetchBusinessPlan): Promise<RFetchBusinessPlan> => {
  const result = await axiosServices.get('/api/businessplan/page', {
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

export const fetchBusinessPlanByID = async (id: number): Promise<RFetchBusinessPlanByID> => {
  const result = await axiosServices.get(`/api/businessplan/${id}`);

  return {
    data: result?.data?.data ?? [],
    status: result?.status
  };
};

export const updateBusinessPlanByID = async (id: number, data: Partial<BusinessPlan>): Promise<RUpdateBusinessPlanByID> => {
  const result = await axiosServices.put(`/api/businessplan/${id}`, data);

  return {
    status: result?.status
  };
};

export const deleteBusinessPlanByID = async (id: number): Promise<RUpdateBusinessPlanByID> => {
  const result = await axiosServices.delete(`/api/businessplan/${id}`);

  return {
    status: result?.status
  };
};
