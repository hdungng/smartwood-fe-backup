import { EntityWithName } from '../core';

export type ShippingScheduleDetail = EntityWithName<number> & {
  codeBooking: string;
  region: string;
  goodType: string;
  exportPort: string;
}

export type ListTruckResponse = EntityWithName<number> & {
  supplierId: number;
  codeBooking: string;
  shippingScheduleId: number;
  transportUnit: string;
  loadingDate: string;
  createdAt: string;
  totalCont: number;
  shippingSchedule: ShippingScheduleDetail;
}