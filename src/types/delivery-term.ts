export interface DeliveryTermFormData {
  code: string;
  name: string;
  description: string;
  // deliveryDays: number;
  // incoterm: string;
  // responsibility: string;
  // insuranceRequired: number;
  // packagingRequired: number;
  // deliveryLocation: string;
  // specialInstructions: string;
  status: number;
}

export interface DeliveryTerm extends DeliveryTermFormData {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate?: string | null;
  lastUpdatedProgram?: string | null;
}

export interface TDeliveryTerm extends DeliveryTerm {}

export interface DeliveryTermParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: number;
  code?: string;
  name?: string;
  description?: string;
  incoterm?: string;
  responsibility?: string;
  deliveryLocation?: string;
}
