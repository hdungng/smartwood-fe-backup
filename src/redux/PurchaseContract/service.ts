import axiosServices from 'utils/axios';

const API = 'api/purchasecontract';

export const getPurchaseContract = async () => {
  return axiosServices.get(`${API}`);
};
