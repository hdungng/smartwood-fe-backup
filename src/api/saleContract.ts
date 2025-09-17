import axiosServices from 'utils/axios';
import { SALE_CONTRACT } from 'api/CommonAPI/Contract';
import { SaleContractCreateRequest, SaleContractUpdateRequest } from 'types/contracts/sell';

// Create sale contract
export const createSaleContract = async (data: SaleContractCreateRequest) => {
  const response = await axiosServices.post(SALE_CONTRACT.BULK, data);
  return response;
};

// Update sale contract
export const updateSaleContract = async (id: number, data: SaleContractUpdateRequest) => {
  const response = await axiosServices.put(SALE_CONTRACT.UPDATE(id), data);
  return response;
};

// Get sale contract by ID
export const getSaleContractById = async (id: number) => {
  const response = await axiosServices.get(SALE_CONTRACT.GET_BY_ID(id));
  return response;
};

// Get all sale contracts
export const getSaleContracts = async () => {
  const response = await axiosServices.get(SALE_CONTRACT.COMMON);
  return response;
};

// Delete sale contract
export const deleteSaleContract = async (id: number) => {
  const response = await axiosServices.delete(SALE_CONTRACT.UPDATE(id));
  return response;
}; 