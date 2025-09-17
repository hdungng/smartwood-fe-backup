export interface FetchPCShipSchedule {
  page: number;
  size: number;
  Code: string;
  Status: number;
}

export interface PCShipSchedule {
  id: number;
  createdAt: string; // ISO date string
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  goodsType: string;
  containerQuantity: number;
  etaDate: string;
  etdDate: string;
  shipName: string;
  forwarderName: string;
  shippingLine: string;
  firstContainerDropDate: string;
  cutoffDate: string;
  region: string;
  departurePort: string;
  arrivalPort: string;
  portName: string;
  qualityType: string;
  vesselCapacity: number;
  notes: string;
  purchaseContractId: number;
  bookingNumber: string;
  transportType?: string;
}

export interface UpdatePCShipSchedule {
  code: string;
  status: number;
  lastUpdatedProgram: string;
  goodsType: string;
  containerQuantity: number;
  etaDate: string; // ISO string format
  etdDate: string;
  shipName: string;
  forwarderName: string;
  shippingLine: string;
  firstContainerDropDate: string;
  cutoffDate: string;
  region: string;
  departurePort: string;
  arrivalPort: string;
  portName: string;
  qualityType: string;
  vesselCapacity: number;
  notes: string;
  purchaseContractId: number;
  bookingNumber: string;
}
