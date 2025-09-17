import { ApprovalRequest, PCPackingPlanGoodSupplier, PurchaseContractPackingPlan } from 'types/contracts/purchase/logistic';
import axiosServices from 'utils/axios';

export const fetchPCPackingPlanGoodSupplier = async (contractPlanId: number): Promise<any> => {
  const response = await axiosServices.get(`api/purchasecontractpackingplangoodsupplier`, {
    params: {
      contractPlanId
    }
  });

  return response;
};

export const createPCPackingPlanGoodSupplier = async (data: Partial<PCPackingPlanGoodSupplier>) => {
  const response = await axiosServices.post(`api/purchasecontractpackingplangoodsupplier`, data);

  return response;
};

export const updatePCPackingPlanGoodSupplier = async (id: number, data: Partial<PCPackingPlanGoodSupplier>) => {
  const response = await axiosServices.put(`api/purchasecontractpackingplangoodsupplier/${id}`, data);

  return response;
};

export const createPCPackingPlan = async (data: Partial<PurchaseContractPackingPlan>) => {
  const response = await axiosServices.post(`api/purchasecontractpackingplan`, data);

  return response;
};

export const updatePCPackingPlan = async (id: number, data: Partial<PurchaseContractPackingPlan>) => {
  const response = await axiosServices.put(`api/purchasecontractpackingplan/${id}`, data);

  return response;
};

export const deletePCPackingPlanGoodSupplierByID = async (id: number) => {
  const response = await axiosServices.delete(`api/purchasecontractpackingplangoodsupplier/${id}`);

  return response;
};

export const fetchContract = async () => {
  const response = await axiosServices.get(`api/contract`);

  return response;
};

export const fetchPurchaseContractByID = async (id: number) => {
  const response = await axiosServices.get(`api/purchasecontract/${id}`);

  return response;
};

export const fetchApprovalByPCPackingPlanID = async (props: { PCPackingPlanID: number }) => {
  const response = await axiosServices.get(`api/approval`, {
    params: {
      referId: props.PCPackingPlanID,
      RequestType: 'PACKING_PLAN'
    }
  });

  return response;
};

export const createApproval = async (payload: Partial<ApprovalRequest>) => {
  const response = await axiosServices.post(`api/approval`, payload);

  return response;
};
