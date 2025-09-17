export interface PO {
  businessPlanId: number | null;
  id: number;
  createdAt: string; // ISO date string
  lastUpdatedAt: string; // ISO date string
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string | null;
  code: string;
  contractCode: string;
  status: number;
  lastUpdatedProgram: string | null;
  contractId: number;
  codeBooking: number;
  customerName: string;
  deliveryLocation: string;
  importCountry: string;
  goodId: number;
  deliveryMethod: string;
  paymentMethod: string;
  paymentCurrency: string;
  unitPrice: number;
  unitOfMeasure: string;
  quantity: number;
  qualityType: string;
  expectedDelivery: string; // ISO date string
  canEdit: boolean;
}
