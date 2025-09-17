import axiosServices from 'utils/axios';

export interface PaymentTerm {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string | null;
  code: string;
  status: number;
  lastUpdatedProgram: string | null;
  name: string;
  description: string;
  paymentDays: number;
  discountPercentage: number;
  discountDays: number;
  lateFeePercentage: number;
  lateFeeDays: number;
  paymentMethod: string;
}

export interface PaymentTermsResponse {
  data: PaymentTerm[];
  meta: {
    message: string;
  };
}

export const getPaymentTerms = async (): Promise<PaymentTerm[]> => {
  try {
    const { data, status } = await axiosServices.get<PaymentTermsResponse>('/api/paymentterm');
    if (status === 200 || status === 201) {
      return data.data || [];
    }
    throw new Error('Failed to fetch payment terms');
  } catch (error) {
    console.error('Error fetching payment terms:', error);
    throw new Error('Failed to fetch payment terms');
  }
}; 