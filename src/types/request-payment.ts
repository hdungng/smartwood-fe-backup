export interface MappedPaymentRequest {
    // Base fields
    id: string;
    code: string;
    serviceProviderName: string;
    serviceType: string;
    cost: number;
    contractType?: 'PURCHASE' | 'SALE';
    status: 'APPROVED' | 'REJECTED' | 'PAID' | 'REQUEST_APPROVAL';
    requestDate: Date;
    notes: string;
    createdBy: string;
    requesterName: string;

    // Additional fields from API needed for forms
    supplierId?: number;
    currency?: string;
    note?: string;
    supServiceType?: string;
    contractId?: number;
    paymentCode?: string;
}

export type PaymentRequest = MappedPaymentRequest;

export interface RequestPaymentPayload {
  code?: string;
  contractId?: number;
  contractType?: string;
  supplierId?: number;
  cost?: number;
  currency?: string;
  note?: string;
  serviceType?: string;
  supServiceType?: string;
  paymentCode?: string;
  status?: number;
  approvalId?: number;
  lastUpdatedProgram?: string;
}

// Interface cho params filter
interface PaymentRequestParams {
  page?: number;
  size?: number;
  Code?: string;
  ContractId?: number;
  ContractType?: string;
  SupplierId?: number;
  Cost?: number;
  Currency?: string;
  Note?: string;
  ServiceType?: string;
  SupServiceType?: string;
  PaymentCode?: string;
  Status?: number;
  ApprovalId?: number;
  LastUpdatedProgram?: string;
  SortBy?: string;
  SortDirection?: string;
}

// Interface cho API response
export interface PaymentRequestApiResponse {
    id: number;
    createdAt: string;
    lastUpdatedAt: string;
    createdBy: number;
    lastUpdatedBy: number;
    lastProgramUpdate: string | null;
    code: string;
    contractId: number;
    contractType: string;
    supplierId: number;
    cost: number;
    currency: string;
    note: string;
    serviceType: string;
    supServiceType: string;
    paymentCode: string;
    status: number;
    approvalId: number;
    lastUpdatedProgram: string;
    requesterName: string;
  }
  
export interface PaymentRequestListApiResponse {
    meta: {
      page: number;
      size: number;
      total: number;
      totalPages: number;
      canNext: boolean;
      canPrevious: boolean;
      count: any;
    };
    data: PaymentRequestApiResponse[];
}

export interface SinglePaymentRequestResponse {
    data: PaymentRequestApiResponse;
    meta: {
      message: string;
    };
}


export interface CodeResponse {
    data: CodeEntity[];
    meta: MetaInfo;
}

  
export interface CodeEntity {
    id: number;
    code: string;
    status: number;
    name: string;
    description: string;
    codeType: string;
    metaData: MetaData;
    data: CodeDetail[];
}
  
export interface MetaData {
    screenNames: string[];
}
  
export interface CodeDetail {
    key: string;
    value: string;
}

export interface SupplierResponse {
    data: Supplier[];
    meta: MetaInfo;
}

export interface Supplier {
    id: number;
    name: string;    
}

  
export interface MetaInfo {
  message: string;
}

// Thêm interface cho contract types
export interface ContractType {
  id: string;
  code: string;
  customerName: string;
  contractDate: Date;
  label: string;
  // Thêm các field cho tính toán giá tiền
  totalWeight?: number;
  unitPrice?: number;
  currency?: string;
  calculatedAmount?: number; // TOTAL_WEIGHT * UNIT_PRICE
}

// Interface cho Sale Contract API response
export interface SaleContractApiResponse {
  id: number;
  code: string;
  customerName: string;
  contractDate: string;
  status: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string | null;
  notes: string | null;
  businessPlanId: number | null;
  draftPoId: number | null;
  saleContractCode: string;
  totalWeight?: number;
  transportInfo?: SaleContractGoodApiResponse[];
}

// Interface cho Sale Contract Good API response
export interface SaleContractGoodApiResponse {
  id: number;
  saleContractId: number;
  exportPort?: string;
  importPort?: string;
  unit?: string;
  unitPrice?: number;
  currency?: string;
}

// Interface cho Purchase Contract API response  
export interface PurchaseContractApiResponse {
  id: number;
  code: string;
  customerName: string;
  contractDate: string;
  status: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string | null;
  notes: string | null;
  businessPlanId: number | null;
  draftPoId: number | null;
  saleContractId: number | null;
}

// Interface cho Contract API response (tổng hợp)
export interface ContractApiResponse {
  id: number;
  code: string;
  customerName: string;
  contractDate: string;
  status: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string | null;
  notes: string | null;
  businessPlanId: number | null;
  draftPoId: number | null;
  saleContractId: number | null;
  purchaseContractIds: number[];
}

// Interface cho contract filter
export interface ContractFilter {
  page?: number;
  size?: number;
  Code?: string;
  CustomerId?: number;
  Status?: number;
  BusinessPlanId?: number;
  DraftPoId?: number;
  SaleContractIsNull?: boolean;
  SortBy?: string;
  SortDirection?: string;
}

// Interface cho contract list response
export interface ContractListResponse {
  data: ContractApiResponse[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    canNext: boolean;
    canPrevious: boolean;
  };
}

// Interface cho single contract response
export interface SingleContractResponse {
  data: ContractApiResponse;
  meta: MetaInfo;
}

// Enum cho contract types
export enum ContractTypeEnum {
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
  BOTH = 'BOTH'
}

// Interface cho contract type determination
export interface ContractTypeInfo {
  type: ContractTypeEnum;
  contracts: ContractApiResponse[];
}