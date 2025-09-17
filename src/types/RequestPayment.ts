export type RequestPayment = {
  id: number;
  code: string;
  paymentCode?: string;
  contractId: number;
  contractType: string;
  cost: number;
  currency: string;
  status: number;
  serviceType?: string;
  approvalId?: number;
  supplierId: number;
  reason?: string;
  note?: string;
  createdAt: string;
  createdBy: number;
  lastUpdatedAt: string;
  lastUpdatedBy?: number;
  lastUpdatedProgram?: string;
};

export interface ImageData {
  id: number;
  imagePath: string;
  status: number;
  referId: number;
  referType: string;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastUpdatedProgram: string;
}