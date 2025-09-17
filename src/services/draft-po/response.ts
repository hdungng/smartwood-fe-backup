import { Entity } from '../core';

export type GetDetailDraftPoResponse = Entity<number> & {
  contractId: number;
  contractCode: string;
  customerName: string;
  goodId: number;
  deliveryMethod: string;
  paymentMethod: string;
  paymentCurrency: string;
  unitPrice: number;
  unitOfMeasure: string;
  quantity: number;
  goodType: string;
  expectedDelivery: string;
  businessPlanId: number;
};
