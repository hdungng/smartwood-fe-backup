// ==============================|| PAYMENT TERM TYPES ||============================== //

export interface PaymentTermFormData {
  code: string;
  name: string;
  description: string;
  paymentDays: number;
  discountPercentage: number;
  discountDays: number;
  lateFeePercentage: number;
  lateFeeDays: number;
  paymentMethod: 'CASH' | 'CREDIT' | 'BANK_TRANSFER' | 'CHECK';
  status: number;
}

export interface PaymentTerm extends PaymentTermFormData {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate?: string;
  lastUpdatedProgram?: string;
}

export interface TPaymentTerm {
  id: number;
  code: string;
  name: string;
  description: string;
  paymentDays: number;
  discountPercentage: number;
  discountDays: number;
  lateFeePercentage: number;
  lateFeeDays: number;
  paymentMethod: string;
  status: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate?: string;
  lastUpdatedProgram?: string;
}

export interface PaymentTermParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: number;
  code?: string;
  name?: string;
  description?: string;
  paymentMethod?: string;
}
