import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TLogisticTruckState } from './type';
import { defaultPCTruck } from './contant';
import { CreatePCTruckSchedule, FetchPCTruckSchedule, PCTruckSchedule, UpdatePCTruckSchedule } from 'types/contracts/logistic/truck';
import { PaginatedMeta } from 'types/common';

export const initialState: TLogisticTruckState = {
  loading: false,
  error: '',
  success: false,
  PCTruckSchedules: [],
  createPCTruckSchedule: defaultPCTruck,
  pagination: {
    page: 1,
    size: 10000000
  },
  meta: {
    page: 0,
    size: 0,
    total: 0,
    totalPages: 0,
    canNext: false,
    canPrevious: false
  }
};

const logisticTruckSlice = createSlice({
  name: 'logisticTruck',
  initialState,
  reducers: {
    setPCTruckSchedules: (state, action: PayloadAction<PCTruckSchedule[]>) => {
      state.PCTruckSchedules = action.payload;
    },
    setPCTruckSchedulesMeta: (state, action: PayloadAction<PaginatedMeta>) => {
      state.meta = action.payload;
    },
    actionFetchPCTruckSchedules: (state, action: PayloadAction<Partial<FetchPCTruckSchedule>>) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    actionCreatePCTruckSchedule: (state, action: PayloadAction<Partial<CreatePCTruckSchedule>>) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    actionUpdatePCTruckSchedule: (
      state,
      action: PayloadAction<{
        id: number;
        data: Partial<UpdatePCTruckSchedule>;
      }>
    ) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    actionDeletePCTruckSchedule: (state, action: PayloadAction<number>) => {
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

export const {
  handleError,
  handleSuccess,
  setPCTruckSchedules,
  actionUpdatePCTruckSchedule,
  actionFetchPCTruckSchedules,
  actionDeletePCTruckSchedule,
  actionCreatePCTruckSchedule,
  setPCTruckSchedulesMeta
} = logisticTruckSlice.actions;

export const logisticTruckReducer = logisticTruckSlice.reducer;
export const logisticTruckSelector = (state: any) => state?.logisticTruck;
export const logisticTruckPaginationSelector = (state: any) => state?.logisticTruck?.pagination;
