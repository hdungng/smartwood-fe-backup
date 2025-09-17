import { CreatePCTruckSchedule, PCTruckSchedule } from 'types/contracts/logistic/truck';
import { PaginatedMeta } from 'types/common';

export interface TPagination {
  page: number;
  size: number;
}

export interface TLogisticTruckState {
  pagination: TPagination;
  meta: PaginatedMeta;
  PCTruckSchedules: PCTruckSchedule[];
  createPCTruckSchedule: CreatePCTruckSchedule;
  loading: boolean;
  error: string;
  success: boolean;
}
