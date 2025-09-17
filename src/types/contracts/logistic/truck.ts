export interface PCTruckSchedule {
  id: number;
  createdAt: string; // ISO date string
  lastUpdatedAt: string; // ISO date string
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  purchaseContractId: number;
  goodsType: string;
  quantity: number;
  pickupDate: string; // ISO date string
  deliveryDate: string; // ISO date string
  vehicleType: string;
  transportCompany: string;
  pickupLocation: string;
  deliveryLocation: string;
  region: string;
  qualityType: string;
  transportFee: number;
  notes: string;
  transportType?: string;
  factory?: string;
}

export interface FetchPCTruckSchedule {
  page: number;
  size: number;
  Code: string;
  Status: number;
}

export type CreatePCTruckSchedule = Omit<
  PCTruckSchedule,
  'id' | 'createdBy' | 'lastUpdatedBy' | 'lastUpdatedProgram' | 'lastProgramUpdate' | 'lastUpdatedAt' | 'createdAt' | 'transportType'
>;
export type UpdatePCTruckSchedule = CreatePCTruckSchedule;
