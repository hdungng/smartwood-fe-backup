import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TLogisticShipState } from './type';
import { FetchPCShipSchedule, PCShipSchedule, UpdatePCShipSchedule } from 'types/contracts/logistic/ship';
import { PaginatedMeta } from 'types/common';

export const initialState: TLogisticShipState = {
  loading: false,
  error: '',
  success: false,
  PCShipSchedules: [],
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

const logisticShipSlice = createSlice({
  name: 'logisticShip',
  initialState,
  reducers: {
    setPCShipSchedules: (state, action: PayloadAction<PCShipSchedule[]>) => {
      state.PCShipSchedules = action.payload;
    },
    setPCShipSchedulesMeta: (state, action: PayloadAction<PaginatedMeta>) => {
      state.meta = action.payload;
    },
    actionFetchPCShipSchedules: (state, action: PayloadAction<Partial<FetchPCShipSchedule>>) => {
      state.error = '';
      state.loading = true;
      state.success = false;
    },
    actionUpdatePCShipSchedule: (
      state,
      action: PayloadAction<{
        id: number;
        data: Partial<UpdatePCShipSchedule>;
      }>
    ) => {
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
  setPCShipSchedules,
  actionFetchPCShipSchedules,
  actionUpdatePCShipSchedule,
  setPCShipSchedulesMeta
} = logisticShipSlice.actions;

export const logisticShipReducer = logisticShipSlice.reducer;
export const logisticShipSelector = (state: any) => state?.logisticShip;
export const logisticShipPaginationSelector = (state: any) => state?.logisticShip?.pagination;
