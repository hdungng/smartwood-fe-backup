export type TShippingUnit = {
  id: number;
  createdAt: string; // or Date, if parsed
  lastUpdatedAt: string; // or Date, if parsed
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  name: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  website: string;
  serviceType: string;
  trackingUrl: string;
  pricePerKg: number;
  pricePerKm: number;
  basePrice: number;
  deliveryTimeDomestic: number;
  deliveryTimeInternational: number;
  rating: number;
  isPreferred: number; // consider changing to boolean if it's 0/1
};
