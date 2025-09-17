import {
  ApprovalRequest,
  Contract,
  PCPackingPlanGoodSupplier,
  PurchaseContract,
  PurchaseContractPackingPlan
} from 'types/contracts/purchase/logistic';

export interface TLogisticState {
  purchaseContract: PurchaseContract;
  purchaseContractPackingPlan: PurchaseContractPackingPlan;
  pcPackingPlans: PCPackingPlanGoodSupplier[];
  contracts: Contract[];
  contract: Contract;
  approvals: ApprovalRequest[];
  approval: ApprovalRequest;
  loading: boolean;
  error: string;
  success: boolean;
}
