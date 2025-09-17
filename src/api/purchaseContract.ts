import axiosServices from 'utils/axios';
import { PURCHASE_CONTRACT_API } from 'api/constants';

// Get all purchase contracts
export const getPurchaseContracts = async () => {
  const response = await axiosServices.get(PURCHASE_CONTRACT_API.GET_LIST);
  return response;
};
