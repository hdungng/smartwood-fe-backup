import { Entity, PaginationRequest, SortRequest } from '../core';

export type ListPurchaseContractRequest = PaginationRequest &
  SortRequest & {
    status?: number;
    code?: string;
  };

export type PurchaseContractPackingPlanRequest = {
  saleContractId: number;
  goodSuppliers: ContractPurchasePackingPlanItem[];
};

export type CreatePurchaseContractRequest = {
  businessPlanId: number;
  contractId: number;
  contractNumber: string;
  contractDate: string;
  buyerId: number;
  purchaseContractPackingPlan: PurchaseContractPackingPlanRequest;
};

export type UpdatePurchaseContractRequest = Entity<number> & {
  contractDate: string;
  buyerId: number;
  purchaseContractPackingPlan: PurchaseContractPackingPlanRequest;
};

export type ContractPurchasePackingPlanItem = {
  region: string;
  supplierId: number;
  goodType: string;
  goodId: number;
  quantity: number;
  unitPrice: number;
  startTime: string;
  endTime: string;
  parentId?: number;
  items: ContractPurchasePackingPlanItem[];
};

export type ApprovalContractPurchaseRequest = Entity<number> & {
  note?: string;
};

export type RequestApprovalContractPurchaseRequest = ApprovalContractPurchaseRequest;

export type RejectContractPurchaseRequest = ApprovalContractPurchaseRequest & {
  note: string;
};

export type ContractPurchaseWeightTicketDetail = {
  shippingScheduleId: number;
  region: string;
  loadingDate: string;
  goodId: number;
  goodType: string;
  supplierId: number;
  transportUnit: string;
  unitPrice: number;
  unitPriceTransport: number;
  unloadingPort: string;
  weight: number;
  truckNumber: string;
  containerNumber: string;
  sealNumber: string;
  realQuantity?: number;
  coverageQuantity?: number;
  coverageType?: string;
};

export type CreateContractPurchaseWeightTicketRequest = {
  shippingScheduleId?: number;
  purchaseContractId?: number;
  purchaseContractWeightTicketDetails: ContractPurchaseWeightTicketDetail[];
};

export type ListSaleContractRequest = {
  contractId?: number;
  mode?: string;
};
