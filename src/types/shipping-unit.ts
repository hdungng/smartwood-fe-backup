// ==============================|| SHIPPING UNIT TYPES ||============================== //

export interface TShippingUnit {
  bankName: string;
  bankAccount: string;
  taxCode: string;
  companyName: string;
  region: string;
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
  fullName: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  website: string;
  serviceType: string; // 'DOMESTIC' | 'INTERNATIONAL' | 'BOTH'
  trackingUrl: string;
  pricePerKg: number;
  pricePerKm: number;
  basePrice: number;
  deliveryTimeDomestic: number;
  deliveryTimeInternational: number;
  rating: number;
  isPreferred: number;
}

export interface ShippingUnitFormData {
  bankName: string;
  bankAccount: string;
  taxCode: string;
  companyName: string;
  code: string;
  name: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  website: string;
  serviceType: 'DOMESTIC' | 'INTERNATIONAL' | 'BOTH';
  trackingUrl: string;
  region: string;
  pricePerKg: number;
  pricePerKm: number;
  basePrice: number;
  deliveryTimeDomestic: number;
  deliveryTimeInternational: number;
  rating: number;
  isPreferred: number;
  status: number;
}

export interface ShippingUnitParams {
  search?: string;
  code?: string;
  name?: string;
  fullName?: string;
  serviceType?: 'DOMESTIC' | 'INTERNATIONAL' | 'BOTH';
  status?: number;
  isPreferred?: number;
  rating?: number;
}
