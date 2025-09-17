import { ColumnDef } from '@tanstack/react-table';

export interface CodeBooking {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string | null;
  code: string;
  status: number;
  lastUpdatedProgram: string | null;
  containerQuantity: number;
  availableContainerQuantity: number | null;
  etaDate: string;
  etdDate: string;
  shipName: string;
  forwarderName: string;
  shippingLine: string;
  firstContainerDropDate: string | null;
  cutoffDate: string | null;
  region: string;
  exportPort: string;
  importPort: string;
  goodType: string;
  vesselCapacity: number | null;
  notes: string | null;
  saleContractId: number;
  bookingNumber: string;
  goodId: number;
  codeBooking: string;
  weightThreshold: number;
  breakEvenPrice: number | null;
  suppliers: any[];
  weightTicketDetails: any[];
  weightTicketExport?: WeightTicket[];
}

export interface WeightTicket {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string | null;
  code: string;
  status: number;
  lastUpdatedProgram: string | null;
  saleContractId: number;
  contNo: string;
  sealNo: string;
  weightNet: number;
  weightGross: number;
  weighingDate: string;
}

export interface TransportInfo {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string | null;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  saleContractId: number;
  exportPort: string;
  importPort: string;
  region: string | null;
}

export interface SaleContract {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string | null;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  contractId: number;
  businessPlanId: number;
  contractCode: string;
  saleContractCode: string;
  contractDate: string;
  customerId: number;
  goodId: number;
  goodName: string;
  goodType: string;
  totalWeight: number;
  goodDescription: string;
  paymentTerm: string;
  deliveryTerm: string;
  tolerancePercentage: number;
  endUserThermalPower: string;
  weightPerContainer: number | null;
  lcContractNumber: string;
  lcNumber: string;
  lcDate: string;
  paymentDeadline: string;
  unit: string | null;
  unitPrice: number;
  currency: string | null;
  sellerId: number | null;
  breakEvenPrice: number | null;
  weightThreshold: number | null;
  transportInfo: TransportInfo[];
  codeBookings: CodeBooking[];
  weightTickets: WeightTicket[];
  notes: string | null;
  totalAmount: number;
}

export interface Customer {
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
  represented: string;
  fax: string | null;
  phone: string;
  address: string;
  email: string | null;
  taxCode: string | null;
  banks: any[];
}

export interface SaleContractDataItem {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string | null;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  contractId: number;
  businessPlanId: number;
  contractCode: string;
  saleContractCode: string;
  contractDate: string;
  customerId: number;
  goodId: number;
  goodName: string;
  goodType: string;
  totalWeight: number;
  goodDescription: string;
  paymentTerm: string;
  deliveryTerm: string;
  tolerancePercentage: number;
  endUserThermalPower: string;
  weightPerContainer: number | null;
  lcContractNumber: string;
  lcNumber: string;
  lcDate: string;
  paymentDeadline: string;
  unit: string | null;
  unitPrice: number;
  currency: string | null;
  sellerId: number | null;
  breakEvenPrice: number | null;
  weightThreshold: number | null;
  transportInfo: TransportInfo[];
  codeBookings: CodeBooking[];
  weightTickets: WeightTicket[];
  notes: string | null;
  customerName?: string;
  customerCode?: string;
  customerAddress?: string;
  customerPhone?: string;
  totalAmount: number;
}

export interface ApiResponse {
  data: SaleContractDataItem[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    canNext: boolean;
    canPrevious: boolean;
    count: {
      activeCount: number;
      inactiveCount: number;
      pendingCount: number;
      approvedCount: number;
      rejectedCount: number;
      requestApproveCount: number;
    };
    stockCount: number | null;
  };
}

export interface TableRowData {
  id: string;
  type: 'saleContract' | 'codeBooking';
  saleContractCode?: string;
  saleContractName?: string;
  contractType?: string;
  bookingNumber?: string;
  bookingType?: string;
  productName?: string;
  ContractDate?: string;
  ETADate?: string;
  customer?: string;
  customerId?: number;
  customerCode?: string;
  supplier?: string;
  TotalAmount?: number;
  totalAmount?: number;
  quantity?: number;
  status: string;
  notes?: string;
  customerPhone?: string;
  goodId?: number;
  subRows?: TableRowData[];
}

export interface TabCounts {
  activeCount: number;
  inactiveCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  requestApproveCount: number;
  totalCount: number;
}

export interface CodeBooking {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string | null;
  code: string;
  status: number;
  lastUpdatedProgram: string | null;
  containerQuantity: number;
  availableContainerQuantity: number | null;
  etaDate: string;
  etdDate: string;
  shipName: string;
  forwarderName: string;
  shippingLine: string;
  firstContainerDropDate: string | null;
  cutoffDate: string | null;
  region: string;
  exportPort: string;
  importPort: string;
  goodType: string;
  vesselCapacity: number | null;
  notes: string | null;
  saleContractId: number;
  bookingNumber: string;
  goodId: number;
  codeBooking: string;
  weightThreshold: number;
  breakEvenPrice: number | null;
  suppliers: any[];
  weightTicketDetails: any[];
}

export interface WeightTicket {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string | null;
  code: string;
  status: number;
  lastUpdatedProgram: string | null;
  saleContractId: number;
  contNo: string;
  sealNo: string;
  weightNet: number;
  weightGross: number;
  weighingDate: string;
}

export interface TransportInfo {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string | null;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  saleContractId: number;
  exportPort: string;
  importPort: string;
  region: string | null;
}

export interface SaleContract {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string | null;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  contractId: number;
  businessPlanId: number;
  contractCode: string;
  saleContractCode: string;
  contractDate: string;
  customerId: number;
  goodId: number;
  goodName: string;
  goodType: string;
  totalWeight: number;
  goodDescription: string;
  paymentTerm: string;
  deliveryTerm: string;
  tolerancePercentage: number;
  endUserThermalPower: string;
  weightPerContainer: number | null;
  lcContractNumber: string;
  lcNumber: string;
  lcDate: string;
  paymentDeadline: string;
  unit: string | null;
  unitPrice: number;
  currency: string | null;
  sellerId: number | null;
  breakEvenPrice: number | null;
  weightThreshold: number | null;
  transportInfo: TransportInfo[];
  codeBookings: CodeBooking[];
  weightTickets: WeightTicket[];
  notes: string | null;
  totalAmount: number;
}

export interface Customer {
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
  represented: string;
  fax: string | null;
  phone: string;
  address: string;
  email: string | null;
  taxCode: string | null;
  banks: any[];
}

export interface SaleContractDataItem {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string | null;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  contractId: number;
  businessPlanId: number;
  contractCode: string;
  saleContractCode: string;
  contractDate: string;
  customerId: number;
  goodId: number;
  goodName: string;
  goodType: string;
  totalWeight: number;
  goodDescription: string;
  paymentTerm: string;
  deliveryTerm: string;
  tolerancePercentage: number;
  endUserThermalPower: string;
  weightPerContainer: number | null;
  lcContractNumber: string;
  lcNumber: string;
  lcDate: string;
  paymentDeadline: string;
  unit: string | null;
  unitPrice: number;
  currency: string | null;
  sellerId: number | null;
  breakEvenPrice: number | null;
  weightThreshold: number | null;
  transportInfo: TransportInfo[];
  codeBookings: CodeBooking[];
  weightTickets: WeightTicket[];
  notes: string | null;
  customerName?: string;
  customerCode?: string;
  customerAddress?: string;
  customerPhone?: string;
  totalAmount: number;
}

export interface ApiResponse {
  data: SaleContractDataItem[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    canNext: boolean;
    canPrevious: boolean;
    count: {
      activeCount: number;
      inactiveCount: number;
      pendingCount: number;
      approvedCount: number;
      rejectedCount: number;
      requestApproveCount: number;
    };
    stockCount: number | null;
  };
}

export interface TableRowData {
  [x: string]: any;
  id: string;
  type: 'saleContract' | 'codeBooking';
  saleContractCode?: string;
  saleContractName?: string;
  saleContractId?: number;
  contractType?: string;
  bookingNumber?: string;
  bookingType?: string;
  productName?: string;
  ContractDate?: string;
  ETADate?: string;
  customer?: string;
  customerId?: number;
  customerCode?: string;
  supplier?: string;
  TotalAmount?: number;
  totalAmount?: number;
  quantity?: number;
  status: string;
  notes?: string;
  customerPhone?: string;
  goodId?: number;
  subRows?: TableRowData[];
}

export interface TabCounts {
  activeCount: number;
  inactiveCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  requestApproveCount: number;
  totalCount: number;
  [key: string]: number;
}

export interface Props {
  data: TableRowData[];
  columns: ColumnDef<TableRowData>[];
}
