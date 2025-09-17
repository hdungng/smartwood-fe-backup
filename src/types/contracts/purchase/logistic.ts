export interface PurchaseContract {
  id: number;
  createdAt: string; // ISO date-time
  lastUpdatedAt: string; // ISO date-time
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  contractId: number;
  businessPlanId: number;
  contractDate: string; // ISO date-time
  sellerName: string;
  buyerName: string;
  purchaseContractWeighTicketId: number;
  purchaseContractPackingPlan?: PurchaseContractPackingPlan;
}

export interface PurchaseContractPackingPlan {
  id: number;
  createdAt: string; // ISO date-time string
  lastUpdatedAt: string; // ISO date-time string
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  totalQuantity: number;
  totalValue: number;
  averagePricePerTon: number;
  currency: string;
  isApprove: number;
  purchaseContractId: number;
  purchaseContractPackingPlanGoodSuppliers?: PCPackingPlanGoodSupplier[];
}

export interface PCPackingPlanGoodSupplier {
  id: number;
  createdAt: string; // ISO date-time
  lastUpdatedAt: string; // ISO date-time
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  supplierId: number;
  goodId: number;
  shippingScheduleId: number;
  quantity: number;
  quality: number;
  startTime: string; // ISO date-time
  endTime: string; // ISO date-time
  realQuanity: number;
  contractPlanId: number;
}

export interface Contract {
  id: number;
  createdAt: string; // ISO 8601 date-time
  lastUpdatedAt: string; // ISO 8601 date-time
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  notes: string;
  businessPlanId: number;
  draftPoId: number;
  saleContractId: number;
  purchaseContractId: number;
  customerId: number;
}

export interface ApprovalRequest {
  id: number;
  createdAt: string; // ISO date string
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  requestType: string;
  referId: number;
  requesterId: number;
  approverId: number;
  approvalStatus: string;
  requestDate: string;
  approvalDate: string;
  comments: string;
}
