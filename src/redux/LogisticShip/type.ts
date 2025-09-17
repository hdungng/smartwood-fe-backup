import { PCShipSchedule } from 'types/contracts/logistic/ship';
import { PaginatedMeta } from 'types/common';

export interface TPagination {
  page: number;
  size: number;
}

export interface TLogisticShipState {
  pagination: TPagination;
  meta: PaginatedMeta;
  PCShipSchedules: PCShipSchedule[];
  loading: boolean;
  error: string;
  success: boolean;
}
