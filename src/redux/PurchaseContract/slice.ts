import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TPurchaseContractState } from './type';
import { PurchaseContract } from 'types/contracts/purchase/logistic';

export const initialState: TPurchaseContractState = {
  loading: false,
  error: '',
  success: false,
  purchaseContracts: []
};

const purchaseContractSlice = createSlice({
  name: 'purchaseContract',
  initialState,
  reducers: {
    setPurchaseContracts: (state, action: PayloadAction<PurchaseContract[]>) => {
      state.purchaseContracts = action.payload;
    },
    actionGetPurchaseContracts: (state) => {
      state.error = '';
      state.loading = true;
      state.success = false;
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

export const { handleError, handleSuccess, setPurchaseContracts, actionGetPurchaseContracts } = purchaseContractSlice.actions;

export const purchaseContractReducer = purchaseContractSlice.reducer;
export const purchaseContractSelector = (state: any) => state?.purchaseContract;
