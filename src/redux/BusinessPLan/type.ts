export interface TBusinessPlanState {
  businessPlans: BusinessPlan[];
  businessPlan: BusinessPlan;
  meta: PaginationMeta & {
    count: Record<string, number>;
  };
  loading: boolean;
  success: boolean;
  error: string;
}

export interface BusinessPlan {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  draftPoId: number;
  contractId: number;
  codeBooking: number;
  totalQuantity: number;
  expectedPrice: number;
  currency: string;
  isApprove: number;
  totalRevenueExcludingVat: number;
  breakEvenPrice: number;
  actualBusinessProfit: number;
  profitMarginPercentage: number;
  contractCode: string;
  customerName?: string;
  goodName?: string;
  canDelete?: boolean;
  draftPo?: {
    id: number;
    code: string;
    customerName: string;
    goodName: string;
    unitPrice: number;
    quantity: number;
    unitOfMeasure: string;
    paymentCurrency: string;
  } | null;
  businessPlanCostItem: BusinessPlanCostItem;
  businessPlanSupplierItems: BusinessPlanSupplierItem[];
  businessPlanTransactionInfoItem: BusinessPlanTransactionInfoItem;
}

export interface BusinessPlanCostItem {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  businessPlanId: number;
  totalFreightEbs: number;
  factoryToPortCost: number;
  warehouseRentalCost: number;
  truckingCost: number;
  localCharges: number;
  earlyUnloadingFee: number;
  thcFee: number;
  sealFee: number;
  infrastructureFee: number;
  customsSupervisionFee: number;
  fumigationPerContainer: number;
  fumigationPerLot: number;
  quarantineFee: number;
  ttFee: number;
  coFee: number;
  doFee: number;
  palletFee: number;
  jumboBagFee: number;
  amsFee: number;
  customsTeamFee: number;
  customsReceptionFee: number;
  clearanceCost: number;
  interestCost: number;
  vatInterestCost: number;
  exchangeRateCost: number;
  dhlFee: number;
  brokerageFee: number;
  taxRefundCost: number;
  qcCost: number;
  generalManagementCost: number;
  currency: string;
}

export interface BusinessPlanSupplierItem {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  businessPlanId: number;
  supplierId: number;
  supplierName: string;
  goodId: number;
  goodName: string;
  goodType: string;
  shippingCompany: string;
  coveringCompany: string;
  region: string;
  quantity: number;
  purchasePrice: number;
  totalAmount: number;
  expectedDeliveryDate: string;
  quantityType: number;
  level: number;
  exportPort: string;
}

export interface BusinessPlanTransactionInfoItem {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  businessPlanId: number;
  exchangeRateBuy: number;
  exchangeRateSell: number;
  shippingMethod: string;
  packingMethod: string;
  weightPerContainer: number;
  estimatedTotalContainers: number;
  estimatedTotalBookings: number;
}

export interface TActionFetchBusinessPlan {
  page: number;
  size: number;
  ContractCode: string;
  Status: number;
  LastUpdatedProgram: string;
  DraftPoId: number;
  ContractId: number;
  CodeBooking: number;
  TotalQuantity: number;
  ExpectedPrice: number;
  Currency: string;
  IsApprove: number;
  TotalRevenueExcludingVat: number;
  BreakEvenPrice: number;
  ActualBusinessProfit: number;
  ProfitMarginPercentage: number;
  sortKey: string;
  direction: string;
  code: string;
}

export interface PaginationMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
  canNext: boolean;
  canPrevious: boolean;
}

export interface RFetchBusinessPlan {
  data: BusinessPlan[];
  meta: PaginationMeta;
  status: number;
}

export interface RFetchBusinessPlanByID {
  data: BusinessPlan;
  status: number;
}

export interface RUpdateBusinessPlanByID {
  status: number;
}
