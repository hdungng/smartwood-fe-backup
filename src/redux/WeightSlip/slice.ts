import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TWeightSlipState } from './type';
import { PCWeightTicket, PCWeightTicketItem } from 'types/contracts/purchase/weight-slip';
import { defaultWeightSlip, defaultWeightTicketDetail } from './contant';
import { PurchaseContract } from 'types/contracts/purchase/logistic';

export const initialState: TWeightSlipState = {
  weightTicket: defaultWeightSlip,
  weightTicketItem: defaultWeightTicketDetail,
  loading: false,
  error: '',
  success: false,
  weightTicketItems: []
};

const weightTicketSlice = createSlice({
  name: 'weightTicket',
  initialState,
  reducers: {
    setPCWeightTicket: (state, action: PayloadAction<Partial<PCWeightTicket>>) => {
      state.weightTicket = action.payload;
    },
    setFieldPCWeightTicket: (state, action: PayloadAction<{ field: keyof PCWeightTicket; value: any }>) => {
      state.weightTicket[action.payload.field] = action.payload?.value ?? null;
    },
    setPCWeightTicketItems: (state, action: PayloadAction<PCWeightTicketItem[]>) => {
      state.weightTicketItems = action.payload;
    },
    setPCWeightTicketItem: (state, action: PayloadAction<Partial<PCWeightTicketItem>>) => {
      state.weightTicketItem = action.payload;
    },
    setFieldPCWeightTicketItem: (state, action: PayloadAction<{ field: keyof PCWeightTicketItem; value: any }>) => {
      state.weightTicketItem[action.payload.field] = action.payload.value;
    },
    actionCreatePCWeightTicket: (state, action: PayloadAction<Partial<PCWeightTicket> & { weightTicketItems: PCWeightTicketItem[] }>) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    actionUpdatePCWeightTicketDetail: (
      state,
      action: PayloadAction<{
        id: number;
        data: Partial<PCWeightTicketItem>;
      }>
    ) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    actionUpdatePCWeightTicket: (
      state,
      action: PayloadAction<{
        id: number;
        data: Partial<PCWeightTicket>;
      }>
    ) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    actionFetchPCWeightTicketDetailByPCWeightTicketID: (
      state,
      action: PayloadAction<{
        PCWeightTicketID: number;
      }>
    ) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    actionFetchPCWeightTicketByID: (state, action: PayloadAction<number>) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    actionDeletePCWeightTicketDetail: (state, action: PayloadAction<number>) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    actionCreatePCWeightTicketDetail: (state, action: PayloadAction<Partial<PCWeightTicketItem>>) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    actionUpdatePurchaseContractByID: (
      state,
      action: PayloadAction<{
        id: number;
        data: Partial<PurchaseContract>;
      }>
    ) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    resetWeightTicket: (state) => {
      state.weightTicket = defaultWeightSlip;
      state.weightTicketItems = [];
      state.weightTicketItem = defaultWeightTicketDetail;
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
  setPCWeightTicket,
  setPCWeightTicketItems,
  setPCWeightTicketItem,
  setFieldPCWeightTicket,
  setFieldPCWeightTicketItem,
  actionCreatePCWeightTicket,
  actionCreatePCWeightTicketDetail,
  actionDeletePCWeightTicketDetail,
  actionFetchPCWeightTicketByID,
  actionFetchPCWeightTicketDetailByPCWeightTicketID,
  actionUpdatePCWeightTicket,
  actionUpdatePCWeightTicketDetail,
  actionUpdatePurchaseContractByID,
  resetWeightTicket,
  handleError,
  handleSuccess
} = weightTicketSlice.actions;

export const weightTicketReducer = weightTicketSlice.reducer;

export const weightTicketSelector = (state: any) => state?.weightTicket;
