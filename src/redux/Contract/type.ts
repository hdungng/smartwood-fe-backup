export interface WeighingInfo {
  saleContractId: number;
  contNo: string;
  sealNo: string;
  weightNet: number;
  weightGross: number;
  weighingDate: string; // ISO date string, e.g. "2025-06-29"
}

export interface TContractStae {
  weighingInfo: WeighingInfo;
  contract: SaleContract;
  contracts: SaleContract[];
  meta: PaginationMeta;
  loading: boolean;
  success: boolean;
  error: string | null;
}

export interface SaleContract {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  contractId: number;
  customerId: number;
  codeBooking: number;
  notes: string;
  buyerName: string;
  contractDate: string;
  goodDescription: string;
  paymentTerms: string;
  tolerancePercentage: number;
  endUserThermalPower: string;
  weightPerContainer: number;
  lcNumber: string;
  lcDate: string;
  paymentDeadline: string;
  issuingBankId: number;
  advisingBankId: number;
  lcAmount: number;
  currency: string;
  lcStatus: string;
  contractCode: string;
  saleContractCode: string;
  transportInfo: SaleContractGood[];
}

export interface SaleContractGood {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  goodId: number;
  saleContractId: number;
  goodType: string;
  goodDescription: string;
  deliveryPort: string;
  receivingPort: string;
  unit: string;
  unitPrice: number;
  currency: string;
  totalWeight: number;
  totalQuantity: number;
}

export interface PaginationMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
  canNext: boolean;
  canPrevious: boolean;
  count?: {
    activeCount: number;
    inactiveCount: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    requestApproveCount: number;
  };
}

export interface TActionFetchContract {
  page: number;
  size: number;
  Code: string;
  Status: number;
  sortKey: string;
  direction: string;
  ContractId: number;
  CustomerId: number;
  CodeBooking: number;
  Notes: string;
  BuyerName: string;
  ContractDate: string; // ISO 8601 datetime string
  GoodDescription: string;
  PaymentTerms: string;
  TolerancePercentage: number;
  EndUserThermalPower: string;
  WeightPerContainer: number;
  LcNumber: string;
  LcDate: string; // ISO 8601 datetime string
  PaymentDeadline: string; // ISO 8601 datetime string
  IssuingBankId: number;
  AdvisingBankId: number;
  LcAmount: number;
  Currency: string;
  LcStatus: string;
}

export interface RFetchContract {
  data: SaleContract[];
  meta: PaginationMeta;
  status: number;
}

export interface RFetchContractByID {
  data: SaleContract;
  status: number;
}

export interface RUpdateContractByID {
  status: number;
}
