import { Entity } from '../core';
import { BusinessPlanCostSection, DetailBusinessPlanCostResponse } from './response';
import { ItemCode } from './enum';

export type BusinessPlanTransactionInfo = Entity<number> & {
  exchangeRateBuy: number;
  exchangeRateSell: number;
  shippingMethod: string;
  packingMethod: string;
  weightPerContainer: number;
  estimatedTotalContainers: number;
  estimatedTotalBookings: number;
};

export type CreateBusinessPlanRequest = {
  draftPoId: number;
  transactionInfo: Omit<BusinessPlanTransactionInfo, 'id'>;
};

export type UpdateBusinessPlanRequest = Entity<number> & BusinessPlanTransactionInfo;

export type BusinessPlanSupplierItem = {
  goodId: number;
  region: string;
  quantity: number;
  purchasePrice: number;
  totalAmount: number;
  goodType: string;
  exportPort: string;
};

export type StoreBusinessPlanSupplierRequest = {
  businessPlanId: number;
  suppliers: BusinessPlanSupplierItem[];
};

export type UpdateBusinessPlanCostItem = {
  itemCode: ItemCode;
  amount: number;
};

export type UpdateBusinessPlanCostRequest = {
  businessPlanId: number;
  logistics: UpdateBusinessPlanCostItem[];
  customs: UpdateBusinessPlanCostItem[];
  finance: UpdateBusinessPlanCostItem[];
  management: UpdateBusinessPlanCostItem[];
  other: (UpdateBusinessPlanCostItem & {
    unit?: string;
    note?: string;
  })[];
};

export type ListBusinessPlanBasicRequest = {
  contractId?: number;
}