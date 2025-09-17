export interface IShippingPurchaseContract {
  id: number;
  createdAt: string; // ISO Date string
  lastUpdatedAt: string; // ISO Date string
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string | null;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  containerQuantity: number;
  availableContainerQuantity: number;
  etaDate: string; // ISO Date string
  etdDate: string; // ISO Date string
  shipName: string;
  forwarderName: string;
  shippingLine: string;
  firstContainerDropDate: string; // ISO Date string
  cutoffDate: string; // ISO Date string
  region: string;
  exportPort: string;
  importPort: string | null;
  goodType: string;
  vesselCapacity: number;
  notes: string;
  saleContractId: number;
  bookingNumber: string;
  goodId: number;
  codeBooking: string;
}
