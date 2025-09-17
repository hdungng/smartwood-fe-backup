import axiosServices from 'utils/axios';

export interface DeliveryTerm {
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
  deliveryDays: number;
  incoterm: string;
  responsibility: string;
  insuranceRequired: number;
  packagingRequired: number;
  deliveryLocation: string;
  specialInstructions: string;
}

export interface DeliveryTermsResponse {
  data: DeliveryTerm[];
  meta: {
    message: string;
  };
}

export const getDeliveryTerms = async (): Promise<DeliveryTerm[]> => {
  try {
    const { data, status } = await axiosServices.get<DeliveryTermsResponse>('/api/deliveryterm');
    if (status === 200 || status === 201) {
      return data.data || [];
    }
    throw new Error('Failed to fetch delivery terms');
  } catch (error) {
    console.error('Error fetching delivery terms:', error);
    throw new Error('Failed to fetch delivery terms');
  }
}; 