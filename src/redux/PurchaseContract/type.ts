import { PurchaseContract } from 'types/contracts/purchase/logistic';

export interface TPurchaseContractState {
  purchaseContracts: PurchaseContract[];
  loading: boolean;
  error: string;
  success: boolean;
}
