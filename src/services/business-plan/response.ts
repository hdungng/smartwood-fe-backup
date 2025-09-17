import { Entity } from '../core';
import { Region } from 'utils';
import { BusinessPlanTransactionInfo } from './request';
import { BusinessPlanStatus } from 'redux/BusinessPLan/constant';
import { GetDetailDraftPoResponse } from '../draft-po';
import { ItemCode } from './enum';

export type BusinessPlanBasic = Entity<number> & {
  code: string;
  contractCode: string;
  contractId: string;
  status: BusinessPlanStatus;
  draftPoId: number;
};

export type BusinessPlan = BusinessPlanBasic & {
  codeBooking: number;
  totalQuantity: number;
  expectedPrice: number;
  currency: string;
  isApprove: boolean;
  totalRevenueExcludingVat: number;
  breakEvenPrice: number;
  actualBusinessProfit: number;
  profitMarginPercentage: number;
  customerName: string;
  goodName: string;
  createdAt: string;
  businessPlanTransactionInfoItem: BusinessPlanTransactionInfo;
  businessPlanSupplierItems: any;
  businessPlanCostItem: any;
  draftPo: GetDetailDraftPoResponse;
};

export type BusinessPlanSupplier = Entity<number> & {
  code: string;
  status: number;
  businessPlanId: number;
  supplierId: number;
  goodId: number;
  goodName: string;
  region: Region;
  quantity: number;
  purchasePrice: number;
  totalAmount: number;
  expectedDeliveryDate: string;
  goodType: string;
  exportPort: string;
};

export type CreateBusinessPlanResponse = {
  id: number;
};

export type BusinessPlanCostItem = Entity<number> & {
  category: string;
  itemCode: ItemCode;
  name: string;
  unit: string;
  amount: number;
  notes: string;
  isPercentage: boolean;
};

export type BusinessPlanCostSection = {
  name: string;
  items: BusinessPlanCostItem[];
};

export type BusinessPlanCostExtendData = {
  totalQuantitySold?: number;
  unitPrice?: number;
}

export type DetailBusinessPlanCostResponse = {
  logistics: BusinessPlanCostSection;
  customs: BusinessPlanCostSection;
  finance: BusinessPlanCostSection;
  management: BusinessPlanCostSection;
  other: BusinessPlanCostSection;
  extendData: BusinessPlanCostExtendData
};
