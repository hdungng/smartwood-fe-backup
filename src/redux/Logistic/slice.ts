import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TLogisticState } from './type';
import {
  ApprovalRequest,
  Contract,
  PCPackingPlanGoodSupplier,
  PurchaseContract,
  PurchaseContractPackingPlan
} from 'types/contracts/purchase/logistic';
import { defaultApproval, defaultContract, defaultPurchaseContract, defaultPurchaseContractPackingPlan } from './constant';

export const initialState: TLogisticState = {
  loading: false,
  error: '',
  success: false,
  contracts: [],
  pcPackingPlans: [],
  purchaseContract: defaultPurchaseContract,
  purchaseContractPackingPlan: defaultPurchaseContractPackingPlan,
  contract: defaultContract,
  approvals: [],
  approval: defaultApproval
};

const logisticSlice = createSlice({
  name: 'logistic',
  initialState,
  reducers: {
    setContracts: (state, action: PayloadAction<Contract[]>) => {
      state.contracts = action.payload;
    },
    setContract: (state, action: PayloadAction<Contract>) => {
      state.contract = action.payload;
    },
    setPCPackingPlanGoodSuppliers: (state, action: PayloadAction<PCPackingPlanGoodSupplier[]>) => {
      state.pcPackingPlans = action.payload;
    },
    setApprovals: (state, action: PayloadAction<ApprovalRequest[]>) => {
      state.approvals = action.payload;
    },
    setApproval: (state, action: PayloadAction<ApprovalRequest>) => {
      state.approval = action.payload;
    },
    setPurchaseContract: (state, action: PayloadAction<PurchaseContract>) => {
      state.purchaseContract = action.payload;

      if (action.payload?.purchaseContractPackingPlan) {
        state.purchaseContractPackingPlan = action.payload.purchaseContractPackingPlan;
      }
    },
    setPurchaseContractPackingPlan: (state, action: PayloadAction<PurchaseContractPackingPlan>) => {
      state.purchaseContractPackingPlan = action.payload;
    },
    actionCreatePurchaseContractPackingPlan: (
      state,
      action: PayloadAction<
        Partial<
          PurchaseContractPackingPlan & {
            pcPackingPlanGoodSuppliers: PCPackingPlanGoodSupplier[];
          }
        >
      >
    ) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    actionUpdatePurchaseContractPackingPlan: (
      state,
      action: PayloadAction<{
        id: number;
        data: Partial<PurchaseContractPackingPlan>;
      }>
    ) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    actionCreatePCPackingPlanGoodSupplier: (state, action: PayloadAction<Partial<PCPackingPlanGoodSupplier>>) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    actionUpdatePCPackingPlanGoodSupplier: (
      state,
      action: PayloadAction<{
        id: number;
        data: Partial<PCPackingPlanGoodSupplier>;
      }>
    ) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    actionDeletePCPackingPlanGoodSupplierByID: (state, action: PayloadAction<number>) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    actionFetchPCPackingPlanGoodSuppliers: (state, action: PayloadAction<{ contractPlanId: number }>) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    actionFetchContracts: (state) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    actionFetchApprovalByPCPackingPlanID: (state, action: PayloadAction<{ PCPackingPlanID: number }>) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    actionCreateApproval: (state, action: PayloadAction<Partial<ApprovalRequest>>) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    actionFetchPurchaseContractByID: (state, action: PayloadAction<number>) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    resetState: (state) => {
      state.pcPackingPlans = [];
      state.contract = defaultContract;
      state.purchaseContract = defaultPurchaseContract;
      state.purchaseContractPackingPlan = defaultPurchaseContractPackingPlan;
      state.approvals = [];
      state.approval = defaultApproval;
    },
    handleSuccess: (state) => {
      state.error = '';
      state.loading = false;
      state.success = true;
    },
    handleError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.success = false;
    }
  }
});

export const {
  handleSuccess,
  handleError,
  resetState,
  setContracts,
  setContract,
  setApprovals,
  setApproval,
  setPCPackingPlanGoodSuppliers,
  setPurchaseContract,
  setPurchaseContractPackingPlan,
  actionFetchContracts,
  actionFetchPCPackingPlanGoodSuppliers,
  actionCreatePCPackingPlanGoodSupplier,
  actionFetchPurchaseContractByID,
  actionDeletePCPackingPlanGoodSupplierByID,
  actionUpdatePCPackingPlanGoodSupplier,
  actionCreatePurchaseContractPackingPlan,
  actionUpdatePurchaseContractPackingPlan,
  actionFetchApprovalByPCPackingPlanID,
  actionCreateApproval
} = logisticSlice.actions;

export const logisticReducer = logisticSlice.reducer;

export const logisticSelector = (state: any) => state?.logistic;
