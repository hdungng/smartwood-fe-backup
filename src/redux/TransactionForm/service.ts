import axiosServices from 'utils/axios';

export const createTransactionInfo = async (
  data: any
): Promise<{
  status: number;
}> => {
  const { businessPlanId, ...rest } = data || {};
  const response = await axiosServices.post(`api/businessplantransactioninfo`, {
    ...rest,
    businessPlanId: businessPlanId || undefined
  });

  return {
    status: response?.status
  };
};
