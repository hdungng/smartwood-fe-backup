export type TContract = {
  id: number;
  createdAt: string; // ISO datetime string
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string | null;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  notes: string;
  businessPlanId: number;
  draftPoId: number;
  saleContractId: number | null;
  purchaseContractId: number | null;
  customerId: number;
};
