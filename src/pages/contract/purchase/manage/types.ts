import { SelectionOption } from 'types/common';
import { Entity } from 'services/core';
import { DatePickerFormat } from '../../../../utils';

export enum ContractPurchaseStep {
  Logistics,
  Weight
}

export type ManageURLParams = { id: string };

export type SaleContractCodeBookingDetail = Entity<number> & {
  codeBooking: string;
};

export type SaleContractMetaData = {
  weightThreshold: number;
  breakEvenPrice: number;
  codeBookings?: SaleContractCodeBookingDetail[];
};

export type PackingPlanDefaultValue = {
  supplier?: number | null;
  goodType?: string | null;
  originalStartDate: DatePickerFormat;
};

export type CodeBookingMetaData = {
  exportPort?: string;
};

export type ActualTowingMetaDataForMultiple = {
  region?: string;
  supplier?: number | null;
  goodType?: string | null;
  loadingDate?: DatePickerFormat | null;
}