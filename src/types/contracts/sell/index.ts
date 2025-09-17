export type TContractSell = {
  code: string;
  saleContractCode: string;
  codeBooking: number | null;
  notes: string;
  buyerName: string;
  sellerId: number; // Changed to sellerId as number
  contractDate: Date | null; // ISO date string
  goodDescription: string;
  goodId: number;
  totalWeight: number | null;
  paymentTerm: string;
  deliveryTerm: string; // Added missing field
  tolerancePercentage: number | null;
  endUserThermalPower: string;
  weightPerContainer: number | null;
  lcContractNumber: string;
  lcNumber: string;
  lcDate: Date | null; // ISO date string
  paymentDeadline: Date | null; // ISO date string
  issuingBankId: number | null;
  advisingBankId: number | null;
  currency: string;
  lcStatus: string;
  buyerTaxCode: string;
  buyerRepresentative: string;
  buyerPhone: string;
  buyerAddress: string;
  contractId: number;
};

// New types for API based on spec
export interface TransportInfo {
  exportPort: string;
  importPort: string;
  unit: string;
  unitPrice: number;
  currency: string;
}

export interface SaleContractCreateRequest {
  contractId: number;
  saleContractCode: string;
  contractDate: string; // ISO date string
  customerId: number;
  goodId: number;
  totalWeight: number;
  goodDescription: string;
  paymentTerms: number;
  deliveryTerms: number;
  tolerancePercentage: number;
  endUserThermalPower: string;
  weightPerContainer: number;
  lcContractNumber: string;
  lcNumber: string;
  lcDate: string; // ISO date string
  paymentDeadline: string; // ISO date string
  transportInfo: TransportInfo[];
}

export interface SaleContractUpdateRequest extends SaleContractCreateRequest {
  // Same as create request for PUT operation
}

export interface ContractDetailsRow {
  goodId: number | null;
  goodType: string;
  goodDescription: string;
  deliveryPort: string;
  receivingPort: string;
  unit: string;
  unitPrice: number | null;
  currency: string;
  totalWeight: number | null;
}

export interface FormValues {
  contractDetailsRows: GoodItem[];
}

export type GoodItem = {
  id: number;
  saleContractId: number;
  exportPort: string;
  importPort: string;
  unit: string;
  unitPrice: number;
  currency: string;
};
