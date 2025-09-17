import axiosServices from 'utils/axios';

export const createCostInfo = async (
  data: any
): Promise<{
  status: number;
}> => {
  const response = await axiosServices.post(`api/businessplancost`, data);

  return {
    status: response?.status
  };
};

export const getCostByID = async (id: number) => {
  return axiosServices.get(`api/businessplancost/${id}`);
};
